import {
  ConditionCalculationSequence,
  Condition,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import {
  FormValues,
  RootFormValue,
  NestedFormValue,
} from "../../pages/forms/[id]/form";
import { cloneDeep } from "lodash";
import {
  Calculation,
  OperatorCondition,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import {
  FormDescription,
  NameType,
} from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import { Expression } from "../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";
import _ from "lodash";
export namespace Evaluate {
  interface RuntimeNameType extends NameType {
    condition:
      | ConditionCalculationSequence
      | Expression<Condition, OperatorCondition>;
    fragmentCondition:
      | ConditionCalculationSequence
      | Expression<Condition, OperatorCondition>;
  }
  export const getNames = (description: FormDescription) => {
    const names: Partial<RuntimeNameType>[] = [];

    description.forEach((step, index) => {
      step.children.forEach((fragment) => {
        if (step.type === "list")
          names.push({
            name: `${step.name}~`,
            type: "text",
            valueType: "number",
          });
        fragment.children.forEach((field) => {
          names.push({
            name: field.name,
            type: field.type,
            valueType: field.valueType,
            list: step.type === "list" ? index : null,
            condition: field.condition,
            required: field.required,
            options: field.options,
            fragmentConditional: !!fragment?.condition?.components?.length,
            fragmentCondition: fragment?.condition ?? {
              components: [],
              operators: [],
            },
          });
        });
      });
    });
    return names;
  };
  export const getValue = (
    name: string,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ) => {
    if (name.endsWith("~"))
      return (values[name.slice(0, -1)] as FormValues<NestedFormValue>[])
        .length;
    const nameDetails: Partial<NameType> = getNames(description).find(
      (n) => n.name === name
    ) as Partial<NameType>;

    let indexInList: number | null = null;

    if (nameDetails.list != null) {
      if (_.isArray(listIndex) ? listIndex?.length : listIndex != null) {
        if (_.isArray(listIndex)) {
          indexInList = (
            listIndex.find(
              (i) => i[0] === description[nameDetails.list as number].name
            ) as [string, number]
          )[1];
        } else {
          indexInList = listIndex as number;
        }
      }

      if (indexInList == null) {
        throw new Error("indexInList is undefined");
      }
    }

    if (indexInList != null && nameDetails.list != null)
      return (
        values[
          description[nameDetails.list as number].name as string
        ] as FormValues<NestedFormValue>[]
      )[indexInList][nameDetails.name as string];
    return values[nameDetails.name as string];
  };

  const calculation = (
    _sequence: ConditionCalculationSequence,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ): number => {
    const sequence = cloneDeep(_sequence);
    if (sequence.components.length === 0) return NaN;
    if (sequence.components.length === 1)
      return !(sequence.components[0] as ConditionCalculationSequence)
        .components &&
        !(sequence.components[0] as ConditionCalculationSequence).operators
        ? Evaluate.calculationComponent(
            sequence.components[0] as Calculation,
            values,
            description,
            listIndex
          )
        : Evaluate.sequence(
            sequence.components[0] as ConditionCalculationSequence,
            values,
            description,
            listIndex
          ).calculation();

    for (const operator of ["^", "*", "/", "+", "-"])
      for (let i = 0; i < sequence.components.length - 1; i++) {
        let result: number;

        if (sequence.operators[i] !== operator) continue;

        let currentValue =
          !(sequence.components[i] as ConditionCalculationSequence)
            .components ||
          !(sequence.components[i] as ConditionCalculationSequence).operators
            ? Evaluate.calculationComponent(
                sequence.components[i] as Calculation,
                values,
                description,
                listIndex
              )
            : Evaluate.sequence(
                sequence.components[i] as ConditionCalculationSequence,
                values,
                description,
                listIndex
              ).calculation();
        let nextValue =
          !(sequence.components[i + 1] as ConditionCalculationSequence)
            .components ||
          !(sequence.components[i + 1] as ConditionCalculationSequence)
            .operators
            ? Evaluate.calculationComponent(
                sequence.components[i + 1] as Calculation,
                values,
                description,
                listIndex
              )
            : Evaluate.sequence(
                sequence.components[i + 1] as ConditionCalculationSequence,
                values,
                description,
                listIndex
              ).calculation();
        if (_.isString(currentValue)) currentValue = parseFloat(currentValue);
        if (_.isString(nextValue)) nextValue = parseFloat(nextValue);

        switch (sequence.operators[i]) {
          case "^":
            result = Math.pow(currentValue, nextValue);
            break;
          case "*":
            result = currentValue * nextValue;
            break;
          case "/":
            result = currentValue / nextValue;
            break;
          case "+":
            result = currentValue + nextValue;
            break;
          case "-":
            result = currentValue - nextValue;
            break;
          default:
            result = NaN;
        }

        sequence.components.splice(i, 2, {
          type: "constant",
          value: result,
        });
        sequence.operators.splice(i, 1);
      }

    return Evaluate.calculationComponent(
      sequence.components[0] as Calculation,
      values,
      description,
      listIndex
    );
  };

  export const calculationComponent = (
    calculation: Calculation,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ): number => {
    if (calculation.type === "constant")
      if (typeof calculation.value === "string")
        return (calculation.value as string).includes(".")
          ? parseFloat(calculation.value as string)
          : parseInt(calculation.value as string);
      else return calculation.value as number;
    else
      return getValue(
        calculation.value as string,
        values,
        description,
        listIndex
      ) as number;
  };

  const condition = (
    _sequence: ConditionCalculationSequence,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ): boolean => {
    const sequence = cloneDeep(_sequence);
    if (sequence.components.length === 0) return true;
    if (sequence.components.length === 1)
      return !(sequence.components[0] as ConditionCalculationSequence)
        .components &&
        !(sequence.components[0] as ConditionCalculationSequence).operators
        ? Evaluate.conditionComponent(
            sequence.components[0] as Condition,
            values,
            description,
            listIndex
          )
        : Evaluate.sequence(
            sequence.components[0] as ConditionCalculationSequence,
            values,
            description,
            listIndex
          ).condition();

    for (const operator of ["&", "|", "§"])
      for (let i = 0; i < sequence.components.length - 1; i++) {
        let result = true;

        if (sequence.operators[i] !== operator) continue;

        const currentValue =
          !(sequence.components[i] as ConditionCalculationSequence)
            .components ||
          !(sequence.components[i] as ConditionCalculationSequence).operators
            ? Evaluate.conditionComponent(
                sequence.components[i] as Condition,
                values,
                description,
                listIndex
              )
            : Evaluate.sequence(
                sequence.components[i] as ConditionCalculationSequence,
                values,
                description,
                listIndex
              ).condition();
        const nextValue: boolean =
          !(sequence.components[i + 1] as ConditionCalculationSequence)
            .components ||
          !(sequence.components[i + 1] as ConditionCalculationSequence)
            .operators
            ? Evaluate.conditionComponent(
                sequence.components[i + 1] as Condition,
                values,
                description,
                listIndex
              )
            : Evaluate.sequence(
                sequence.components[i + 1] as ConditionCalculationSequence,
                values,
                description,
                listIndex
              ).condition();

        switch (sequence.operators[i]) {
          case "&":
            result = currentValue && nextValue;
            break;
          case "|":
            result = currentValue || nextValue;
            break;
          case "§":
            result = currentValue !== nextValue;
        }

        sequence.components.splice(i, 2, {
          variable: null,
          comparator: null,
          value: {
            type: null,
            value: null,
          },
          simpleValue: result,
        });
        sequence.operators.splice(i, 1);
      }

    return (sequence.components[0] as Condition).simpleValue as boolean;
  };

  export const conditionComponent = (
    condition: Condition,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ): boolean => {
    const names = getNames(description);

    if (condition.simpleValue) return condition.simpleValue;
    if (
      condition.variable === null ||
      condition.comparator === null ||
      condition.value.type === null ||
      condition.value.value === null
    )
      return false;

    const conditionVariableDetails = names.find(
      (n) => n.name === condition.variable
    ) as Partial<NameType>;

    let conditionVariable = getValue(
      condition.variable as string,
      values,
      description,
      listIndex
    );

    if (
      names.find((name) => name.name == condition.variable)?.valueType ===
        "number" &&
      typeof conditionVariable === "string"
    ) {
      if ((conditionVariable as string)?.includes("."))
        conditionVariable = parseFloat((conditionVariable as string)!);
      else conditionVariable = parseInt((conditionVariable as string)!);
    }
    if (
      names.find((name) => name.name == condition.variable)?.type === "date" &&
      typeof conditionVariable === "string"
    )
      conditionVariable = new Date(conditionVariable as string);

    const comparator = condition.comparator;
    const conditionValue =
      condition.value.type === "constant"
        ? conditionVariableDetails.type === "text"
          ? conditionVariableDetails.valueType === "number"
            ? typeof condition.value.value === "string"
              ? condition.value.value.includes(".")
                ? parseFloat(condition.value.value as string)
                : parseInt(condition.value.value as string)
              : (condition.value.value as number)
            : (condition.value.value as string)
          : conditionVariableDetails.type === "date"
          ? new Date(condition.value.value as string)
          : (condition.value.value as number)
        : condition.value.type === "variable"
        ? getValue(
            condition.value.value as string,
            values,
            description,
            listIndex
          )
        : Evaluate.sequence(
            condition.value.value as ConditionCalculationSequence,
            values,
            description,
            listIndex
          ).calculation();

    if (conditionValue === null || conditionValue === "") return false;
    if (conditionVariable === null || conditionVariable === "") return false;

    switch (comparator) {
      case "==":
        return conditionVariable == conditionValue;
      case "!=":
        return conditionVariable != conditionValue;

      case ">":
        return conditionVariable > conditionValue;
      case ">=":
        return conditionVariable >= conditionValue;
      case "<":
        return conditionVariable < conditionValue;
      case "<=":
        return conditionVariable <= conditionValue;

      default:
        return false;
    }
  };

  export const sequence = (
    sequence: ConditionCalculationSequence,
    values: FormValues<RootFormValue>,
    description: FormDescription,
    listIndex?: number | [string, number][]
  ) => ({
    calculation: () => calculation(sequence, values, description, listIndex),
    condition: () => condition(sequence, values, description, listIndex),
  });
}
