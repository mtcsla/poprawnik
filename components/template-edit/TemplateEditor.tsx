import React from 'react';
import FormDescriptionProvider from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { TemplateElement, TemplatePath, useTemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { EditTemplateDescription } from './EditTemplateDescription';

export const isValidElement = (element: TemplateElement) => {
  if (element.type === 'text') return element.text !== '';
  if (element.type === 'calculation') return element.calculation.components.length > 0;
  if (element.type === 'variable') return element.variable !== '' && element.variable != null;
  return true;
}

export type ParentElementPropsType<Type> = {
  path: TemplatePath,
  element?: Type,
  onChange: (value: Type) => void
}

const templateParenthesesEditorContext = React.createContext<{
  path: TemplatePath | null,
  editing: boolean
  parentheses: [number | null, number | null],
  setParentheses: React.Dispatch<[number | null, number | null]>,
  setPath: React.Dispatch<TemplatePath | null>
  setEditing: React.Dispatch<boolean>
}>(
  {
    path: null,
    parentheses: [null, null],
    editing: true,
    setParentheses: () => { },
    setPath: () => { },
    setEditing: () => { },
  }
)
export const useTemplateParenthesesEditor = () => React.useContext(templateParenthesesEditorContext);

export const listStepsContext = React.createContext<number[]>(
  []
);
export const useListSteps = () => React.useContext(listStepsContext);

export default function TemplateEditor({ display }: { display?: boolean }) {
  const { description, modifyDescription, form } = useTemplateDescription();

  const [parentheses, setParentheses] = React.useState<[number | null, number | null]>([null, null]);
  const [path, setPath] = React.useState<TemplatePath | null>(null);
  const [editing, setEditing] = React.useState<boolean>(false);



  const parenthesesEditorContextValue = { parentheses, setParentheses, path, setPath, editing, setEditing };

  return <listStepsContext.Provider value={[]}>
    <templateParenthesesEditorContext.Provider value={parenthesesEditorContextValue}>
      <FormDescriptionProvider initValue={form} id={''}>
        <EditTemplateDescription noHeadline={display} path={[]} />
      </FormDescriptionProvider>
    </templateParenthesesEditorContext.Provider>
  </listStepsContext.Provider>
}



