import { collection, doc, updateDoc } from '@firebase/firestore';
import { cloneDeep } from 'lodash';
import React from "react";
import { firestore } from '../../buildtime-deps/firebase';
import { Calculation, Condition, OperatorCalculation, OperatorCondition } from '../../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { FormDescription } from "../FormDescriptionProvider/FormDescriptionProvider";
import { ModifyTemplate } from './ModifyTemplate';

export type Expression<Component, Operator> = {
  components: (Component | Expression<Component, Operator>)[];
  operators: Operator[];
}

type TemplateParentElementType = 'ifElse' | 'exists' | 'list' | 'textFormatting'
type TemplateLeafElementType = 'text' | 'variable' | 'calculation' | 'enter' | 'space';

export type TemplateElementType = { leaf: TemplateLeafElementType, parent: TemplateParentElementType };

interface MarkedForDeletion {
  markedForDeletion?: true;
}
export interface TemplateElementPrototype<Child> extends MarkedForDeletion {
  type: TemplateElementType['leaf'] | TemplateElementType['parent'];
  child: Child
}

export interface TextFormattingElement extends TemplateElementPrototype<TemplateDescription> {
  type: 'textFormatting',
  textFormattingType: 'element' | 'effect',

  element: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  effect: 'normal' | 'italic' | 'bold' | 'strikethrough' | 'underline';
  align: 'left' | 'center' | 'right';
}
export interface IfElseElement extends TemplateElementPrototype<TemplateDescription> {
  type: 'ifElse';
  condition: Expression<Condition, OperatorCondition>
}
export interface ExistsElement extends TemplateElementPrototype<TemplateDescription> {
  type: 'exists';
  variables: string[];
}
export interface ListElement extends TemplateElementPrototype<TemplateDescription> {
  type: 'list';
  list: string;
  filter: Expression<Condition, OperatorCondition>;
}
export interface TextElement extends TemplateElementPrototype<never> {
  type: 'text';
  text: string;
}
export interface CalculationElement extends TemplateElementPrototype<never> {
  type: 'calculation';
  calculation: Expression<Calculation, OperatorCalculation>;
}
export interface VariableElement extends TemplateElementPrototype<never> {
  type: 'variable';
  variable: string;
}
export interface EnterElement extends TemplateElementPrototype<never> {
  type: 'enter';
}
export interface SpaceElement extends TemplateElementPrototype<never> {
  type: 'space';
}

export type TemplateElement = IfElseElement | ExistsElement | ListElement | TextElement | CalculationElement | VariableElement | EnterElement | SpaceElement | TextFormattingElement;
export type TemplateParentElement = IfElseElement | ExistsElement | ListElement | TextFormattingElement
export type TemplateDescription = TemplateElement[]

export type TemplateAction =
  {
    type: 'nestElements',
    value: {
      indices: [number, number]
      path: TemplatePath,
      element: TemplateParentElement
    }
  } |
  {
    type: 'setDescription',
    value: {
      description: TemplateDescription
    }
  } | {
    type: 'addElement'
    value: {
      path: TemplatePath,
      element: TemplateElement
    }
  } | {
    type: 'removeElement'
    value: {
      path: TemplatePath
      index: number
    }
  } | {
    type: 'setElement'
    value: {
      path: TemplatePath,
      index: number,
      element: TemplateElement
    }
  }

export const templateDescriptionContext = React.createContext<{ description: TemplateDescription, updateFirebaseDoc: (description: TemplateDescription) => Promise<void>, modifyDescription: React.Dispatch<TemplateAction>, form: FormDescription }>(
  {
    description: [],
    modifyDescription: () => { },
    updateFirebaseDoc: async (description: TemplateDescription) => { },
    form: []
  }
)

export type TemplatePath = number[];
export const useTemplateDescription = () => React.useContext(templateDescriptionContext)
function reducer(state: TemplateDescription, { type, value }: TemplateAction) {
  let newState = cloneDeep(state);
  switch (type) {
    case 'setDescription':
      newState = value.description;
      break;
    case 'addElement':
      newState = ModifyTemplate.addElement(newState, { type, value });
      break;
    case 'removeElement':
      newState = ModifyTemplate.removeElement(newState, { type, value });
      break;
    case 'setElement':
      newState = ModifyTemplate.setElement(newState, { type, value });
      break;
  }
  return newState;
}

const TemplateDescriptionProvider = ({ children, form, id, initTemplate }: {
  children: React.ReactNode, form: FormDescription, initTemplate?: TemplateDescription, id: string,
}) => {
  const [description, modifyDescription] = React.useReducer(reducer, initTemplate ?? []);
  const updateFirebaseDoc = (newDescription: TemplateDescription) =>
    updateDoc(doc(collection(firestore, 'forms'), id), { templateData: newDescription });

  return <templateDescriptionContext.Provider value={{ description, modifyDescription, form, updateFirebaseDoc }}>
    {children}
  </templateDescriptionContext.Provider>
}

export default TemplateDescriptionProvider;