import {
  ConditionCalculationSequence,
  Calculation,
} from "../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import { cloneDeep } from "lodash";
import { FormValues } from "../../../pages/forms/[id]/form";

export const calculateCalculationValue = (
  _sequence: ConditionCalculationSequence,
  _values: FormValues
): Calculation => {
  const sequence = cloneDeep(_sequence);
  //replace expressions in parentheses with values
  sequence.components.forEach((element, index) => {
    if (
      (element as ConditionCalculationSequence).components ||
      (element as ConditionCalculationSequence).operators
    )
      sequence.components[index] = calculateCalculationValue(
        element as ConditionCalculationSequence,
        _values
      );
  });
  //do exponentiation
  sequence.components.forEach((element, index) => {
    if (sequence.operators[index] === "^") {
      sequence.components[index] = {
        type: "constant",
        value: Math.pow(
          getNumberValue(element as Calculation, _values),
          (sequence.components[index + 1] as Calculation).neutral
            ? 1
            : getNumberValue(
                sequence.components[index + 1] as Calculation,
                _values
              )
        ),
      };
      sequence.components.splice(index + 1, 1);
      sequence.operators.splice(index, 1);
    }
  });
  //do multiplication and division
  sequence.components.forEach((element, index) => {
    if (sequence.operators[index] === "*") {
      sequence.components[index] = {
        type: "constant",
        value:
          getNumberValue(element as Calculation, _values) *
          ((sequence.components[index + 1] as Calculation).neutral
            ? 1
            : getNumberValue(
                sequence.components[index + 1] as Calculation,
                _values
              )),
      };
      sequence.components.splice(index + 1, 1);
      sequence.operators.splice(index, 1);
    }
    if (sequence.operators[index] === "/") {
      sequence.components[index] = {
        type: "constant",
        value:
          getNumberValue(element as Calculation, _values) /
          ((sequence.components[index + 1] as Calculation).neutral
            ? 1
            : getNumberValue(
                sequence.components[index + 1] as Calculation,
                _values
              )),
      };
      sequence.components.splice(index + 1, 1);
      sequence.operators.splice(index, 1);
    }
  });
  //do addition and subtraction
  sequence.components.forEach((element, index) => {
    if (sequence.operators[index] === "+") {
      sequence.components[index] = {
        type: "constant",
        value:
          getNumberValue(element as Calculation, _values) +
          ((sequence.components[index + 1] as Calculation).neutral
            ? 0
            : getNumberValue(
                sequence.components[index + 1] as Calculation,
                _values
              )),
      };
      sequence.components.splice(index + 1, 1);
      sequence.operators.splice(index, 1);
    }
    if (sequence.operators[index] === "-") {
      sequence.components[index] = {
        type: "constant",
        value:
          getNumberValue(element as Calculation, _values) -
          ((sequence.components[index + 1] as Calculation).neutral
            ? 0
            : getNumberValue(
                sequence.components[index + 1] as Calculation,
                _values
              )),
      };
      sequence.components.splice(index + 1, 1);
      sequence.operators.splice(index, 1);
    }
  });

  return sequence.components[0] as Calculation;
};

export const getNumberValue = (
  _element: Calculation,
  _values: FormValues
): number => {
  if (_element.type === "constant") return _element.value as number;
  if (_element.type === "variable")
    return _values[_element.value as string] as number;
  else
    return calculateCalculationValue(
      _element.value as ConditionCalculationSequence,
      _values
    ).value as number;
};
