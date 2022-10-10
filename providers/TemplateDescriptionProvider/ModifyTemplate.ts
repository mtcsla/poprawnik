import { cloneDeep } from "lodash";
import { TemplateParentElement } from "./TemplateDescriptionProvider";
import {
  TemplateAction,
  TemplateDescription,
  TemplateElement,
  TemplatePath,
} from "./TemplateDescriptionProvider";

export namespace ModifyTemplate {
  export const nestElements = (
    state: TemplateDescription,
    { type, value }: TemplateAction
  ): TemplateDescription => {
    const newState = cloneDeep(state);

    const { path, indices, element } = value as {
      path: TemplatePath;
      indices: [number, number];
      element: TemplateParentElement;
    };
    const [start, end] = indices;

    const subsequence = ModifyTemplate.getDescriptionFromPath(
      newState,
      path,
      true
    );

    element.child = subsequence.slice(start, end + 1);
    subsequence.splice(start, end - start + 1, element);

    return newState;
  };
  export const addElement = (
    state: TemplateDescription,
    { type, value }: TemplateAction
  ): TemplateDescription => {
    let newState = cloneDeep(state);
    const { path, element } = value as {
      path: TemplatePath;
      element: TemplateElement;
    };

    const parentDescription = ModifyTemplate.getDescriptionFromPath(
      newState,
      path,
      true
    );
    parentDescription.push(element);

    return newState;
  };

  export const removeElement = (
    state: TemplateDescription,
    { type, value }: TemplateAction
  ): TemplateDescription => {
    let newState = cloneDeep(state);
    const { path, index } = value as { path: TemplatePath; index: number };

    const parentDescription = ModifyTemplate.getDescriptionFromPath(
      newState,
      path,
      true
    );
    parentDescription.splice(index, 1);

    return newState;
  };

  export const setElement = (
    state: TemplateDescription,
    { type, value }: TemplateAction
  ): TemplateDescription => {
    let newState = cloneDeep(state);
    const { path, index, element } = value as {
      path: TemplatePath;
      index: number;
      element: TemplateElement;
    };

    const parentDescription = ModifyTemplate.getDescriptionFromPath(
      newState,
      path,
      true
    );

    if (index >= parentDescription.length || index < 0)
      throw new Error(
        `Index (${index}) of element to be set out of bounds [0, ${
          parentDescription.length - 1
        }]`
      );
    parentDescription[index] = cloneDeep(element);
    return newState;
  };

  export const getDescriptionFromPath = (
    state: TemplateDescription,
    path: TemplatePath,
    reference?: true
  ): TemplateDescription => {
    let newState = reference ? state : cloneDeep(state);
    let current = newState;

    if (path.length === 0) return current;

    let current_path_segment = 0;
    for (let index of path) {
      if (
        ["text", "calculation", "enter", "space"].includes(current[index].type)
      )
        throw new Error(
          "Text, calculation, enter and space elements do not have children. Erroneous path: " +
            JSON.stringify(path.slice(0, current_path_segment + 1))
        );

      current = reference
        ? current[index].child
        : cloneDeep(current[index].child);
      current_path_segment += 1;
    }

    return current;
  };
  export const getElementFromPath = (
    state: TemplateDescription,
    path: TemplatePath,
    index: number,
    reference?: true
  ): TemplateElement => {
    const parentDescription = getDescriptionFromPath(state, path, reference);
    return reference
      ? parentDescription[index]
      : cloneDeep(parentDescription[index]);
  };
}
