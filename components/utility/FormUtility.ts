import { FormDescription } from "../../providers/FormDescriptionProvider/FormDescriptionProvider";
import { cloneDeep } from "lodash";
import { FormNameCheck } from "./FormNameCheck";
import { Calculation } from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import { TemplateElement } from "../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";
import {
  Condition,
  OperatorCondition,
} from "../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import {
  IfElseElement,
  ListElement,
} from "../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";
import {
  Expression,
  TemplateDescription,
  TemplatePath,
} from "../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";

export namespace FormUtility {
  export type Path = [number, number | null, number | null];

  export const removed = (
    _description: FormDescription,
    path: FormUtility.Path,
    type: "removed" | "notRequired",
    _delete?: true
  ): [number, number, number | null, number[][]][] => {
    const [step, fragment, field] = path;
    const description = _delete ? _description : cloneDeep(_description);

    const names: string[] =
      fragment === null && field === null && description[step].type === "list"
        ? [`${description[step].name}~`]
        : [];

    const result: [number, number, number | null, number[][]][] = [];

    if (fragment === null && field === null) {
      description[step].children.forEach((fragment) =>
        fragment.children.forEach((field) => names.push(field.name))
      );
      description.splice(step, 1);
    } else if (fragment !== null && field === null) {
      description[step].children[fragment].children.forEach((field) =>
        names.push(field.name)
      );
      description[step].children.splice(fragment, 1);
    } else if (fragment !== null && field !== null) {
      names.push(description[step].children[fragment].children[field].name);

      description[step].children[fragment].children.splice(field, 1);
    }

    description.forEach((_step, stepIndex) =>
      _step.children.forEach((_fragment, fragmentIndex) => {
        if (_fragment.condition?.components?.length) {
          const checked = FormNameCheck[
            type === "removed" ? "condition" : "conditionNotRequired"
          ](names, _fragment.condition);

          if (checked.length)
            result.push([stepIndex, fragmentIndex, null, checked]);
        }
        _fragment.children.forEach((_field, fieldIndex) => {
          if (_field.condition.components.length) {
            const checked = FormNameCheck[
              type === "removed" ? "condition" : "conditionNotRequired"
            ](names, _field.condition);

            if (checked.length)
              result.push([stepIndex, fragmentIndex, fieldIndex, checked]);
          }
        });
      })
    );

    return result.filter((item) => item[3].length > 0);
  };

  export const templateNormalizeConditions = (
    _description: TemplateDescription,
    path: TemplatePath = [],
    names: string[],
    type: "removed" | "notRequired",
    _change?: true
  ): [TemplatePath, Expression<Condition, OperatorCondition>][] => {
    const pathesAndConditions: [
      TemplatePath,
      Expression<Condition, OperatorCondition>
    ][] = [];

    _description.forEach((item, index) => {
      if (item.type === "ifElse") {
        const conditionChanges = FormNameCheck[
          type === "removed" ? "condition" : "conditionNotRequired"
        ](names, item.condition);
        if (conditionChanges.length) {
          const normalizedCondition = normalizeCondition(
            item.condition,
            conditionChanges
          );

          pathesAndConditions.push([path.concat([index]), normalizedCondition]);
          if (_change)
            (_description[index] as IfElseElement).condition =
              normalizedCondition;
        }
      }
      if (item.type === "list") {
        const filterChanges = FormNameCheck[
          type === "removed" ? "condition" : "conditionNotRequired"
        ](names, item.filter);
        if (filterChanges.length) {
          const normalizedFilter = normalizeCondition(
            item.filter,
            filterChanges
          );
          pathesAndConditions.push([path.concat([index]), normalizedFilter]);

          if (_change)
            (_description[index] as ListElement).filter = normalizedFilter;
        }
      }

      if (["ifElse", "exists", "list", "textFormatting"].includes(item.type)) {
        pathesAndConditions.push(
          ...templateNormalizeConditions(
            item.child,
            path.concat([index]),
            names,
            type,
            _change
          )
        );
      }
    });

    return pathesAndConditions;
  };

  export const templateRemoved = (
    template: TemplateDescription,
    path: TemplatePath = [],
    names: string[],
    type: "removed" | "notRequired"
  ): TemplatePath[] => {
    const paths: TemplatePath[] = [];
    const _description = cloneDeep(template);

    _description.forEach((item, index) => {
      if (item.type === "variable" && names.includes(item.variable)) {
        paths.push([...path, index]);
      }
      if (item.type === "calculation") {
        if (FormNameCheck.calculation(names, item.calculation).length) {
          paths.push([...path, index]);
        }
      }

      if (item.type === "exists") {
        let valid = true;

        if (type === "removed")
          for (const variable of item.variables)
            if (names.includes(variable)) {
              paths.push([...path, index]);
              valid = false;
              break;
            }

        if (valid) {
          paths.push(
            ...templateRemoved(item.child, [...path, index], names, type)
          );
        }
      }

      if (item.type === "list") {
        if (type === "removed" && names.includes(item.list)) {
          paths.push([...path, index]);
        } else
          paths.push(
            ...templateRemoved(item.child, [...path, index], names, type)
          );
      }
      if (["ifElse", "textFormatting"].includes(item.type)) {
        paths.push(
          ...templateRemoved(item.child, [...path, index], names, type)
        );
      }
    });

    return paths;
  };

  export const templateApplyRemoved = (
    template: TemplateDescription,
    paths: TemplatePath[]
  ) => {
    let _template = cloneDeep(template);

    paths.forEach((path) => {
      _template = markForDeletion(_template, path);
    });

    return deleteMarked(_template);
  };
  const markForDeletion = (
    template: TemplateDescription,
    path: TemplatePath
  ) => {
    const newTemplate = cloneDeep(template);

    if (path.length === 1) {
      newTemplate[path[0]] = {
        markedForDeletion: true,
        ...newTemplate[path[0]],
      };
      return newTemplate;
    }

    const [index, ...rest] = path;
    newTemplate[index].child = markForDeletion(newTemplate[index].child, rest);
    return newTemplate;
  };
  const deleteMarked = (template: TemplateDescription) => {
    const newTemplate = cloneDeep(template);

    for (let index = newTemplate.length - 1; index >= 0; index--) {
      const item = newTemplate[index];

      if (item.markedForDeletion) {
        const [deleted] = newTemplate.splice(index, 1);
      } else if (
        ["ifElse", "exists", "list", "textFormatting"].includes(item.type)
      ) {
        newTemplate[index].child = deleteMarked(newTemplate[index].child);
      }
    }

    return newTemplate;
  };

  const checkForPath = (paths: number[][], _path: number[]): boolean => {
    for (const path of paths) {
      if (path.length != _path.length) continue;
      if (path.every((item, index) => item === _path[index])) return true;
    }
    return false;
  };

  export const normalizeCondition = (
    condition: Expression<Condition, OperatorCondition>,
    paths: number[][],
    path: number[] = []
  ) => {
    const newCondition = cloneDeep(condition);

    newCondition.components.forEach((component, index) => {
      if (
        !(component as Expression<Condition, OperatorCondition>).components &&
        !(component as Expression<Condition, OperatorCondition>).operators
      ) {
        if (checkForPath(paths, path.concat([index]))) {
          newCondition.components[index] = {
            variable: null,
            comparator: null,
            value: { type: null, value: null },
            simpleValue: true,
          };
        }
      } else
        newCondition.components[index] = normalizeCondition(
          component as Expression<Condition, OperatorCondition>,
          paths,
          path.concat([index])
        );
    });

    return newCondition;
  };
}
