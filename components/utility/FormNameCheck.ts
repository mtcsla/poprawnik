import {
  Calculation,
  Condition,
  ConditionCalculationSequence,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";

export namespace FormNameCheck {
  export const condition = (
    names: string[],
    condition: ConditionCalculationSequence,
    path: number[] = []
  ): number[][] => {
    const pathsFound: number[][] = [];

    condition.components.forEach((item, index) => {
      if (
        !(item as ConditionCalculationSequence).components ||
        !(item as ConditionCalculationSequence).operators
      ) {
        if (names.includes((item as Condition).variable as string))
          pathsFound.push(path.concat([index]));
        else if ((item as Condition).value.type === "variable") {
          if (names.includes((item as Condition).value.value as string))
            pathsFound.push(path.concat([index]));
        } else if ((item as Condition).value.type === "calculation") {
          if (
            FormNameCheck.calculation(
              names,
              (item as Condition).value.value as ConditionCalculationSequence,
              []
            ).length
          )
            pathsFound.push(path.concat([index]));
        }
      } else
        pathsFound.push(
          ...FormNameCheck.condition(
            names,
            item as ConditionCalculationSequence,
            path.concat([index])
          )
        );
    });

    return pathsFound;
  };

  export const calculation = (
    names: string[],
    calculation: ConditionCalculationSequence,
    path: number[] = []
  ): number[][] => {
    const pathsFound: number[][] = [];

    calculation.components.forEach((item, index) => {
      if (
        !(item as ConditionCalculationSequence).components ||
        !(item as ConditionCalculationSequence).operators
      ) {
        if ((item as Calculation).type === "variable")
          if (names.includes((item as Calculation).value as string))
            pathsFound.push(path.concat([index]));
      } else
        pathsFound.push(
          ...FormNameCheck.calculation(
            names,
            item as ConditionCalculationSequence,
            path.concat([index])
          )
        );
    });

    return pathsFound;
  };
}
