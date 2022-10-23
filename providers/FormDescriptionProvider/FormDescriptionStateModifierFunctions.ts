import {
  FormDescription,
  StepDescription,
  FragmentDescription,
  FieldDescription,
  FieldType,
  FieldValueType,
  getDefaultStep,
  getDefaultField,
  getDefaultFragment,
} from "./FormDescriptionProvider";
import { cloneDeep } from "lodash";
import { Expression } from "../TemplateDescriptionProvider/TemplateDescriptionProvider";
import {
  Condition,
  OperatorCondition,
} from "../../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";

export namespace FormDescriptionFunctions {
  //keep these functions pure!!
  export const setStepListMessage = (
    state: FormDescription,
    [index, message]: [number, string]
  ) => {
    const newState = cloneDeep(state);
    newState[index].listMessage = message;
    return newState;
  };
  export const setStepListItemName = (
    state: FormDescription,
    [index, name]: [number, string]
  ) => {
    const newState = cloneDeep(state);
    newState[index].listItemName = name;
    return newState;
  };
  export const setStepListMinMaxItems = (
    state: FormDescription,
    [index, minMaxItems]: [number, { min: number | null; max: number | null }]
  ) => {
    const newState = cloneDeep(state);
    newState[index].listMinMaxItems = minMaxItems;
    return newState;
  };

  export const removeStep = (
    state: FormDescription,
    index: number
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState.splice(index, 1);
    return newState;
  };
  //step actions
  export const setStepDescription = (
    state: FormDescription,
    [index, step]: [number, StepDescription | null]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[index] = cloneDeep(step ?? getDefaultStep());
    return newState;
  };
  export const setStepSubtitle = (
    state: FormDescription,
    [index, subtitle]: [number, string]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[index].subtitle = subtitle;
    return newState;
  };
  export const appendStepFragment = (
    state: FormDescription,
    [index, fragment]: [number, FragmentDescription | null]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[index].children.push(cloneDeep(fragment ?? getDefaultFragment()));
    return newState;
  };
  export const removeStepFragment = (
    state: FormDescription,
    index: number
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[index].children.splice(index, 1);
    return newState;
  };
  export const reorderStepFragments = (
    state: FormDescription,
    [step, begin, end]: [number, number, number]
  ): FormDescription => {
    const newState = cloneDeep(state);
    const movedFragment = newState[step].children.splice(begin, 1)[0];
    newState[step].children.splice(end, 0, movedFragment);
    return newState;
  };
  //fragment actions
  export const setFragmentTitle = (
    state: FormDescription,
    [stepIndex, fragmentIndex, title]: [number, number, string]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].title = title;
    return newState;
  };
  export const setFragmentSubtitle = (
    state: FormDescription,
    [stepIndex, fragmentIndex, subtitle]: [number, number, string]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].subtitle = subtitle;
    return newState;
  };
  export const setFragmentCondition = (
    state: FormDescription,
    [stepIndex, fragmentIndex, condition]: [
      number,
      number,
      Expression<Condition, OperatorCondition>
    ]
  ) => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].condition =
      cloneDeep(condition);
    return newState;
  };

  export const setFragmentIcon = (
    state: FormDescription,
    [stepIndex, fragmentIndex, icon]: [number, number, string]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].icon = icon;
    return newState;
  };
  export const appendFragmentField = (
    state: FormDescription,
    [stepIndex, fragmentIndex, field]: [number, number, FieldDescription | null]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children.push(
      cloneDeep(field ?? getDefaultField())
    );
    return newState;
  };
  export const removeFragmentField = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex]: [number, number, number]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children.splice(fieldIndex, 1);
    return newState;
  };
  export const reorderFragmentFields = (
    state: FormDescription,
    [stepIndex, fragmentIndex, start, end]: [number, number, number, number]
  ): FormDescription => {
    const newState = cloneDeep(state);
    const movedField = newState[stepIndex].children[
      fragmentIndex
    ].children.splice(start, 1)[0];
    newState[stepIndex].children[fragmentIndex].children.splice(
      end,
      0,
      movedField
    );
    return newState;
  };
  //field actions
  export const setFieldName = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, name]: [
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].name =
      name;
    return newState;
  };
  export const setFieldLabel = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, label]: [
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].label =
      label;
    return newState;
  };
  export const setFieldPlaceholder = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, placeholder]: [
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[
      fieldIndex
    ].placeholder = placeholder;
    return newState;
  };
  export const setFieldIcon = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, icon]: [
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    //newState[stepIndex].children[fragmentIndex].children[fieldIndex].icon = icon;
    return newState;
  };
  export const setFieldType = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, type]: [
      number,
      number,
      number,
      FieldType
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].type =
      type;
    return newState;
  };
  export const setFieldValueType = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, valueType]: [
      number,
      number,
      number,
      FieldValueType
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].valueType =
      valueType;
    return newState;
  };
  export const setFieldHint = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, hint]: [
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].hint =
      hint;
    return newState;
  };
  export const appendFieldOption = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex]: [number, number, number]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[
      fieldIndex
    ].options.push("");
    return newState;
  };
  export const removeFieldOption = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, optionIndex]: [
      number,
      number,
      number,
      number
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[
      fieldIndex
    ].options.splice(optionIndex, 1);
    return newState;
  };
  export const setField = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, value]: [
      number,
      number,
      number,
      FieldDescription
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex] = value;
    return newState;
  };

  export const setFieldOption = (
    state: FormDescription,
    [stepIndex, fragmentIndex, fieldIndex, optionIndex, value]: [
      number,
      number,
      number,
      number,
      string
    ]
  ): FormDescription => {
    const newState = cloneDeep(state);
    newState[stepIndex].children[fragmentIndex].children[fieldIndex].options[
      optionIndex
    ] = value;
    return newState;
  };
}
