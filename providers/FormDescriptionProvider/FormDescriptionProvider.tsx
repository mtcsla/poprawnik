import { doc, updateDoc } from '@firebase/firestore';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import React from "react";
import { firestore } from "../../buildtime-deps/firebase";
import { ConditionCalculationSequence } from '../../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { FormRandom } from '../../components/utility/FormRandom';
import { FormDescriptionFunctions } from "./FormDescriptionStateModifierFunctions";


export type FieldType = 'text' | 'select' | 'date';
export type FieldValueType = 'text' | 'number' | 'date' | null;

export type FormDescription = StepDescription[];
export type StepDescription = {
  subtitle: string;
  type: 'step' | 'list';
  children: FragmentDescription[]
  name: string,
};
export type FragmentDescription = {
  title: string;
  subtitle: string;
  icon: string;
  children: FieldDescription[]
};
export type FieldDescription = {
  fullWidth: boolean;
  required: boolean;
  label: string;
  name: string;
  placeholder: string;
  type: FieldType;
  valueType: FieldValueType | null;
  options: string[];
  description: string;
  numberType: 'integer' | 'real' | null;
  min: string | null;
  max: string | null;
  hint: string;
  condition: ConditionCalculationSequence;
};



export type FormActionWithoutSave =
  ['form_set_description', FormDescription]
  | ['form_append_step', StepDescription | null]
  | ['form_remove_step', number]
  //the first number in action value is always the step index
  | ['step_set_description', [number, StepDescription | null]]
  | ['step_set_subtitle', [number, string]]
  | ['step_append_fragment', [number, FragmentDescription | null]]
  | ['step_remove_fragment', number]
  | ['step_reorder_fragments', [number, number, number]]
  //step position, init position of the moved fragment, ending position of the moved fragment
  //--reordering shouldn't be possible in lists
  //also the fragments are not swapped, but the fragment being moved is inserted into that position
  //this is to allow for dragging logic to be implemented

  //the first number in action value is the step index, the second one is the fragment index within that step
  | ['fragment_set_title', [number, number, string]]
  | ['fragment_set_subtitle', [number, number, string]]
  | ['fragment_set_icon', [number, number, string]]
  | ['fragment_append_field', [number, number, FieldDescription | null]]
  | ['fragment_remove_field', [number, number, number]] //the third number is the field's index
  | ['fragment_reorder_fields', [number, number, number, number]] //the third number is the field's index and the fourth number is the index it should be moved to

  | ['field_set_label', [number, number, number, string]]
  | ['field_set_name', [number, number, number, string]]
  | ['field_set_placeholder', [number, number, number, string]]
  | ['field_set_icon', [number, number, number, string]]
  | ['field_set_type', [number, number, number, FieldType]]
  | ['field_set_valuetype', [number, number, number, FieldValueType]]
  | ['field_set_hint', [number, number, number, string]]
  | ['field_append_option', [number, number, number]]
  | ['field_remove_option', [number, number, number, number]]
  | ['field_set_option', [number, number, number, number, string]]
  | ['field_set', [number, number, number, FieldDescription]]

export type FormAction = FormActionWithoutSave;
export type NameType = {
  name: string, required: boolean, options: string[], type: FieldType, step: number, fragment: number, field: number, list: number | null, valueType: FieldValueType
};


export const getDefaultForm = (): FormDescription => [];
export const getDefaultStep = (): StepDescription => ({ subtitle: '', name: '', type: 'step', children: [] });
export const getDefaultFragment = (): FragmentDescription => ({ title: '', subtitle: '', icon: '', children: [] });
export const getDefaultField = (): FieldDescription => ({ label: '', description: '', fullWidth: false, min: null, max: null, numberType: null, required: true, name: '', placeholder: '', type: 'text', valueType: null, options: [], hint: '', condition: { components: [], operators: [] } });

const formDescriptionContext = React.createContext<{
  description: FormDescription, modifyDescription: React.Dispatch<FormAction>,
  currentDescription: FormDescription, modifyCurrentDescription: React.Dispatch<FormAction>,
  names: NameType[],
  updateFirestoreDoc: (description: FormDescription) => Promise<void>
}>({ description: [], modifyDescription: () => { }, currentDescription: [], modifyCurrentDescription: () => { }, updateFirestoreDoc: async () => { }, names: [] });
export const useFormDescription = () => React.useContext(formDescriptionContext);
export type FormDescriptionProviderProps = {
  initValue: FormDescription | null;
  children: React.ReactNode;
  id: string;
}

const FormDescriptionProvider = ({ children, initValue, id }: FormDescriptionProviderProps) => {
  const random = React.useMemo<FormDescription>(() => FormRandom.formDescription(), []);
  const router = useRouter();

  const [description, modifyDescription] = React.useReducer(
    formDescriptionReducer,
    initValue ?? getDefaultForm()
  );
  const [currentDescription, modifyCurrentDescription] = React.useReducer(
    formDescriptionReducer,
    initValue ?? getDefaultForm()
  );
  const updateFirestoreDoc = async (description: FormDescription) => {
    await updateDoc(doc(firestore, `forms/${id}`), { formData: description })
  }
  const [names, setNames] = React.useState<NameType[]>([])

  React.useEffect(() => {
    if (router.isReady) {
      if (router.query.random === 'true') {
        modifyDescription(['form_set_description', random])
        modifyCurrentDescription(['form_set_description', random])
      }
    }
  }, [router.isReady])

  function formDescriptionReducer(state: FormDescription, [actionType, actionValue]: FormAction): FormDescription {
    let newState: FormDescription = getDefaultForm();

    switch (actionType) {
      //form actions
      case 'form_set_description':
        newState = actionValue ?? getDefaultForm();
        break;
      case 'form_append_step':
        newState = cloneDeep(state.concat([actionValue ?? getDefaultStep()]));
        break;
      case 'form_remove_step':
        newState = FormDescriptionFunctions.removeStep(state, actionValue);
        break;
      //step actions
      case 'step_set_description':
        newState = FormDescriptionFunctions.setStepDescription(state, actionValue);
        break;
      case 'step_set_subtitle':
        newState = FormDescriptionFunctions.setStepSubtitle(state, actionValue);
        break;
      case 'step_append_fragment':
        newState = FormDescriptionFunctions.appendStepFragment(state, actionValue);
        break;
      case 'step_remove_fragment':
        newState = FormDescriptionFunctions.removeStepFragment(state, actionValue);
        break;
      case 'step_reorder_fragments':
        newState = FormDescriptionFunctions.reorderStepFragments(state, actionValue);
        break;
      //fragment actions
      case 'fragment_set_title':
        newState = FormDescriptionFunctions.setFragmentTitle(state, actionValue);
        break;
      case 'fragment_set_subtitle':
        newState = FormDescriptionFunctions.setFragmentSubtitle(state, actionValue);
        break;
      case 'fragment_set_icon':
        newState = FormDescriptionFunctions.setFragmentIcon(state, actionValue);
        break;
      case 'fragment_append_field':
        newState = FormDescriptionFunctions.appendFragmentField(state, actionValue);
        break;
      case 'fragment_remove_field':
        newState = FormDescriptionFunctions.removeFragmentField(state, actionValue);
        break;
      case 'fragment_reorder_fields':
        newState = FormDescriptionFunctions.reorderFragmentFields(state, actionValue);
        break;
      //field actions
      case 'field_set_label':
        newState = FormDescriptionFunctions.setFieldLabel(state, actionValue);
        break;
      case 'field_set_placeholder':
        newState = FormDescriptionFunctions.setFieldPlaceholder(state, actionValue);
        break;
      case 'field_set_icon':
        newState = FormDescriptionFunctions.setFieldIcon(state, actionValue);
        break;
      case 'field_set_type':
        newState = FormDescriptionFunctions.setFieldType(state, actionValue);
        break;
      case 'field_set_valuetype':
        newState = FormDescriptionFunctions.setFieldValueType(state, actionValue);
        break;
      case 'field_append_option':
        newState = FormDescriptionFunctions.appendFieldOption(state, actionValue);
        break;
      case 'field_remove_option':
        newState = FormDescriptionFunctions.removeFieldOption(state, actionValue);
        break;
      case 'field_set_option':
        newState = FormDescriptionFunctions.setFieldOption(state, actionValue);
        break;
      case 'field_set_name':
        newState = FormDescriptionFunctions.setFieldName(state, actionValue);
        break;
      case 'field_set':
        newState = FormDescriptionFunctions.setField(state, actionValue);
        break;
      default:
        newState = state;
        break;
    }

    return newState;
  }

  const value = { description, names, modifyDescription, currentDescription, modifyCurrentDescription, updateFirestoreDoc }

  React.useEffect(() => {
    const newNames: NameType[] = []
    currentDescription.forEach(
      (step, stepIndex) => {
        step.children.forEach((fragment, fragmentIndex) => {
          fragment.children.forEach((field, fieldIndex) => {
            newNames.push({
              name: field.name,
              step: stepIndex,
              fragment: fragmentIndex,
              field: fieldIndex,
              required: field.required,
              list: step.type === 'list' ? stepIndex : null,
              type: field.type,
              options: field.options,
              valueType: getActualValueType(field)
            })
          })
        })
      }
    )
    setNames(newNames as NameType[]);
  }, [currentDescription])

  return <formDescriptionContext.Provider {...{ value }}>
    {children}
  </formDescriptionContext.Provider>

}

export const getActualValueType = (field: FieldDescription): FieldValueType => {
  const { type, valueType } = field;

  if (type === 'text') return valueType;
  if (type === 'date') return 'date';
  if (type === 'select') return 'text';

  return valueType;
}
export const valueTypeToPolish = (type: FieldValueType): string => {
  if (type === 'text') return 'tekst';
  if (type === 'number') return 'liczba';
  if (type === 'date') return 'data';
  return 'tekst';
}

export default FormDescriptionProvider;
