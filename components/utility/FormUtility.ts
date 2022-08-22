import { FormDescription } from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import { cloneDeep } from "lodash";
import { FormNameCheck } from "./FormNameCheck";

export namespace FormUtility {
  export type Path = [number, number | null, number | null];

  export const removed = (
    _description: FormDescription,
    path: FormUtility.Path,
    _delete?: true
  ): [number, number, number, number[][]][] => {
    const [step, fragment, field] = path;
    const description = cloneDeep(_description);

    const names: string[] =
      fragment === null && field === null && description[step].type === "list"
        ? [`${description[step].name}~`]
        : [];

    const result: [number, number, number, number[][]][] = [];

    if (fragment === null && field === null) {
      description[step].children.forEach((fragment) =>
        fragment.children.forEach((field) => names.push(field.name))
      );
      if (_delete) description.splice(step, 1);
    } else if (fragment !== null && field === null) {
      description[step].children[fragment].children.forEach((field) =>
        names.push(field.name)
      );
      if (_delete) description[step].children.splice(fragment, 1);
    } else if (fragment !== null && field !== null) {
      names.push(description[step].children[fragment].children[field].name);
      if (_delete)
        description[step].children[fragment].children.splice(field, 1);
    }

    description.forEach((_step, stepIndex) =>
      _step.children.forEach((_fragment, fragmentIndex) =>
        _fragment.children.forEach((_field, fieldIndex) => {
          if (_field.condition.components.length)
            result.push([
              stepIndex,
              fragmentIndex,
              fieldIndex,
              FormNameCheck.condition(names, _field.condition),
            ]);
        })
      )
    );

    return result.filter((item) => item[3].length > 0);
  };
}
