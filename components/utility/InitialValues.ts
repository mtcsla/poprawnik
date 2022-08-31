import {
  FormDescription,
  StepDescription,
} from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import {
  FormValues,
  NestedFormValue,
  RootFormValue,
} from "../../pages/forms/[id]/form";

export namespace InitialValues {
  export function fromStep(step: StepDescription) {
    const initValues = {} as FormValues<NestedFormValue>;

    step.children.forEach((fragment) => {
      fragment.children.forEach(({ name, type, valueType }) => {
        initValues[name] = type === "date" ? null : ("" as NestedFormValue);
      });
    });

    return initValues;
  }
  export function fromDescription(description: FormDescription) {
    let data = {} as FormValues<RootFormValue>;

    description.forEach((step) => {
      if (step.type === "list")
        data[step.name] = [] as FormValues<NestedFormValue>[];
      else data = { ...data, ...InitialValues.fromStep(step) };
    });

    return data;
  }
}
