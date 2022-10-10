import { Validators } from "./ValidatorFactories";
import {
  FormDescription,
  StepDescription,
} from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import {
  FormValues,
  NestedFormValue,
  RootFormValue,
} from "../../pages/forms/[id]/form";
import { Evaluate } from "./Evaluate";

export namespace ValidatorsObject {
  export type ValidatorsObject = {
    [key: string]: (value: any) => string | null;
  };
  export type Validators = {
    validators: ValidatorsObject;
    validate: (
      values: FormValues<RootFormValue>,
      description: FormDescription,
      listIndex?: number
    ) => Errors;
  };

  export type Errors = {
    [key: string]: string;
  };

  export function fromStep(step: StepDescription): ValidatorsObject.Validators {
    const validators = {} as {
      [key: string]: (value: any) => string | null;
    };

    step.children.forEach((fragment) =>
      fragment.children.forEach((field) => {
        const { text, select, date } = Validators.factory(field);

        validators[field.name] =
          field.type === "text"
            ? text()
            : field.type === "select"
            ? select()
            : date();
      })
    );

    return {
      validators,
      validate: (values, description, listIndex) =>
        validateValues(values, description, validators, listIndex),
    } as ValidatorsObject.Validators;
  }

  export function fromDescription(
    description: FormDescription
  ): ValidatorsObject.Validators {
    let validators = {} as { [key: string]: (value: any) => string | null };

    description.forEach((step) => {
      if (step.type === "list") {
        validators[step.name] = (value: FormValues<NestedFormValue>[]) => {
          return null;
        };
      } else
        validators = {
          ...validators,
          ...ValidatorsObject.fromStep(step).validators,
        };
    });

    return {
      validators,
      validate: (values, description, listIndex) =>
        validateValues(values, description, validators, listIndex),
    } as ValidatorsObject.Validators;
  }

  export function validateValues(
    values: FormValues<RootFormValue>,
    description: FormDescription,
    validators: ValidatorsObject.ValidatorsObject,
    listIndex?: number
  ): ValidatorsObject.Errors {
    let errors = {} as { [key: string]: string };
    const names = Evaluate.getNames(description);

    Object.keys(validators).forEach((key) => {
      const condition = names.find((name) => name.name === key)?.condition ?? {
        components: [],
        operators: [],
      };
      const active = Evaluate.sequence(
        condition,
        values,
        description,
        listIndex
      ).condition();

      const error = active ? validators[key](values[key]) : null;

      if (error) errors = { ...errors, [key]: error };
    });

    return errors;
  }
}
