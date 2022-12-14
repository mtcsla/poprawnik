import { ConditionCalculationSequence } from "../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";
import { Evaluate } from "../components/utility/Evaluate";
import {
  FormValues,
  NestedFormValue,
  RootFormValue,
} from "../pages/forms/[id]/form";
import { FormDescription } from "../providers/FormDescriptionProvider/FormDescriptionProvider";
import {
  CalculationElement,
  ExistsElement,
  IfElseElement,
  ListElement,
  TemplateDescription,
  TextElement,
  TextFormattingElement,
  VariableElement,
} from "../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";

type Contexts = {
  exists: string[];
  list: [string, number][];
  textFormatting: {
    textFormattingType: TextFormattingElement["textFormattingType"];
    align: TextFormattingElement["align"];
    effect: TextFormattingElement["effect"];
    element: TextFormattingElement["element"];
  };
};

const normalizeText = (text: string) => {
  let newText = text;
  newText = newText.replace(/⇥/g, "\t");
  newText = newText.replace(/•/g, " ");
  newText = newText.replace(/⮐/g, "\n");
  return newText;
};

export const templateToHTMLString = (
  values: FormValues<RootFormValue>,
  template: TemplateDescription,
  form: FormDescription,
  { exists, list, textFormatting }: Contexts = {
    exists: [],
    list: [],
    textFormatting: {
      textFormattingType: "effect",
      align: "left",
      effect: "normal",
      element: "p",
    },
  }
) => {
  return `
      ${elementToHtmlFunctions.template(values, template, form, {
        exists: [],
        list: [],
        textFormatting: {
          textFormattingType: "effect",
          align: "left",
          effect: "normal",
          element: "p",
        },
      })}
      `;
};

const elementToHtmlFunctions = {
  template: (
    values: FormValues<RootFormValue>,
    template: TemplateDescription,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    let html = ``;
    for (const element of template) {
      html += elementToHtmlFunctions[
        element.type as
          | "ifElse"
          | "exists"
          | "textFormatting"
          | "list"
          | "text"
          | "variable"
          | "calculation"
          | "template"
      ](values, element as any, form, { exists, list, textFormatting });
    }
    return html;
  },
  ifElse: (
    values: FormValues<RootFormValue>,
    element: IfElseElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    if (Evaluate.sequence(element.condition, values, form, list).condition()) {
      return elementToHtmlFunctions.template(values, element.child, form, {
        exists,
        list,
        textFormatting,
      });
    } else return "";
  },
  exists: (
    values: FormValues<RootFormValue>,
    element: ExistsElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    const names = Evaluate.getNames(form);

    for (const variable of exists) {
      const name = names.find((item) => item.name == variable)!;
      if (
        !Evaluate.sequence(name.condition!, values, form, list).condition() ||
        !Evaluate.getValue(variable, values, form, list)
      ) {
        return "";
      }
    }

    return elementToHtmlFunctions.template(values, element.child, form, {
      exists: [...exists, ...element.variables],
      list,
      textFormatting,
    });
  },
  textFormatting: (
    values: FormValues<RootFormValue>,
    element: TextFormattingElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    return `${
      element.textFormattingType === "element"
        ? `<${
            element.element
          }  style="margin-bottom: 2rem; white-space: pre-wrap; ${
            element.textFormattingType === "element"
              ? `text-align: ${element.align};`
              : ""
          } ${
            /*element.effect !== 'normal' ? `text-decoration: ${
      element.effect 
    }` :*/ ""
          }">`
        : ""
    }
        ${elementToHtmlFunctions.template(values, element.child, form, {
          exists,
          list,
          textFormatting: {
            textFormattingType: element.textFormattingType,
            align: element.align,
            effect: element.effect,
            element: element.element,
          },
        })}
				${
          element.textFormattingType === "element"
            ? `
      </${element.element}>`
            : ""
        }`;
  },
  list: (
    values: FormValues<RootFormValue>,
    element: ListElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    let html = ``;

    for (
      let i = 0;
      i < (values?.[element.list] as FormValues<NestedFormValue>[])?.length ??
      0;
      i++
    ) {
      if (
        element?.filter?.components?.length
          ? Evaluate.sequence(element.filter, values, form, list).condition()
          : true
      )
        html += `${elementToHtmlFunctions.template(
          values,
          element.child,
          form,
          {
            exists,
            list: [...list, [element.list, i]],
            textFormatting,
          }
        )}`;
    }
    return html;
  },

  text: (
    values: FormValues<RootFormValue>,
    element: TextElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    return `${normalizeText(element.text)}`;
  },
  variable: (
    values: FormValues<RootFormValue>,
    element: VariableElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    return `
      ${Evaluate.getValue(element.variable, values, form, list)}
      `;
  },

  calculation: (
    values: FormValues<RootFormValue>,
    element: CalculationElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    const names = Evaluate.getNames(form);
    const calculation = Evaluate.sequence(
      element.calculation as ConditionCalculationSequence,
      values,
      form,
      list
    ).calculation();

    return calculation;
  },
};
