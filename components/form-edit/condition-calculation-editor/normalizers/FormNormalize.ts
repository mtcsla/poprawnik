import {
  ConditionCalculationSequence,
  SequenceAction,
} from "../ConditionCalculationEditorProvider";
import {
  FormAction,
  FormDescription,
} from "../../../../providers/FormDescriptionProvider/FormDescriptionProvider";
import { cloneDeep, cloneDeepWith } from "lodash";
import { Condition, Calculation } from "../ConditionCalculationEditorProvider";
/**
 * Pass in the copy of the description object to prevent hard to debug problems.
 */

export namespace FormNormalize {
  export const conditions = (
    _description: FormDescription,
    _location: [number | null, number | null, number | null],
    _delete?: true
  ): FormDescription => {
    const description = cloneDeep(_description);
    const location = _location as [number, number | null, number | null];

    const unnormalizedDescription = description.slice(location[0]);
    const names: string[] =
      location[1] === null ? [`${description[location[0]].name}~`] : [];

    if (location[1] === null && location[2] === null)
      description[location[0]].children.forEach((fragment) =>
        fragment.children.forEach((field) => names.push(field.name))
      );
    else if (location[1] !== null && location[2] === null)
      description[location[0]].children[location[1] as number].children.forEach(
        (field) => names.push(field.name)
      );
    else
      names.push(
        description[location[0]].children[location[1] as number].children[
          location[2] as number
        ].name
      );

    const newDescriptionPart = [];

    for (const step of unnormalizedDescription) {
      const newStep = cloneDeep(step);
      newStep.children = [];

      for (const fragment of step.children) {
        const newFragment = cloneDeep(fragment);
        newFragment.children = [];

        for (const field of fragment.children) {
          let newFieldCondition = cloneDeep(field.condition);
          newFieldCondition = removeNamesFromCondition(
            newFieldCondition,
            names
          );

          newFragment.children.push({ ...field, condition: newFieldCondition });
        }

        newStep.children.push(newFragment);
      }

      newDescriptionPart.push(newStep);
    }

    const newDescription = description
      .slice(0, location[0])
      .concat(newDescriptionPart);

    if (_delete) {
      if (location[1] == null && location[2] == null)
        newDescription.splice(location[0], 1);
      else if (location[1] != null && location[2] == null)
        newDescription[location[0]].children.splice(location[1] as number, 1);
      else
        newDescription[location[0]].children[
          location[1] as number
        ].children.splice(location[2] as number, 1);
    }

    return newDescription;
  };

  /**
   * Pass in copy of the sequence object!
   */
  const removeNamesFromCondition = (
    sequence: ConditionCalculationSequence,
    names: string[]
  ) => {
    const newSequence = cloneDeep(sequence);

    newSequence.components.forEach((item, index) => {
      if (
        !(item as ConditionCalculationSequence).components ||
        !(item as ConditionCalculationSequence).operators
      ) {
        if (
          (item as Condition).simpleValue == null &&
          names.includes((item as Condition).variable as string)
        ) {
          newSequence.components[index] = {
            variable: null,
            comparator: null,
            value: { value: null, type: null },
            simpleValue: true,
          };
          return;
        }
        if (
          (item as Condition).simpleValue == null &&
          (item as Condition).value.type === "variable" &&
          names.includes((item as Condition).value.value as string)
        ) {
          newSequence.components[index] = {
            variable: null,
            comparator: null,
            value: { value: null, type: null },
            simpleValue: true,
          };
          return;
        }
        if (
          (item as Condition).simpleValue == null &&
          (item as Condition).value.type === "calculation"
        ) {
          (newSequence.components[index] as Condition).value.value =
            removeNamesFromCalculation(
              (item as Condition).value.value as ConditionCalculationSequence,
              names
            );
          return;
        }
      } else
        newSequence.components[index] = removeNamesFromCondition(
          item as ConditionCalculationSequence,
          names
        );
    });
    return newSequence;
  };
  const removeNamesFromCalculation = (
    sequence: ConditionCalculationSequence,
    names: string[]
  ): ConditionCalculationSequence => {
    const newSequence = cloneDeep(sequence);

    newSequence.components.forEach((item, index) => {
      if (
        !(item as ConditionCalculationSequence).components ||
        !(item as ConditionCalculationSequence).operators
      ) {
        if ((item as Calculation).type === "variable")
          if (names.includes((item as Calculation).value as string)) {
            newSequence.components[index] = {
              value: null,
              type: null,
              neutral: true,
            };
          }
      } else
        newSequence.components[index] = removeNamesFromCalculation(
          newSequence.components[index] as ConditionCalculationSequence,
          names
        );
    });

    return newSequence;
  };
}
