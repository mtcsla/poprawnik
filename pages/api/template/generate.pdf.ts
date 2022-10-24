import { NextApiRequest, NextApiResponse } from "next";
import htmlPdfNode from "html-pdf-node";
import { buffer } from "stream/consumers";
import { Duplex } from "stream";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";
import { textFormattingContext } from "../../account/lawyer/edit-document/template";
import {
  FormValues,
  RootFormValue,
  NestedFormValue,
} from "../../forms/[id]/form";
import {
  TemplateDescription,
  TemplateElement,
  IfElseElement,
  ExistsElement,
  TextFormattingElement,
  ListElement,
  TextElement,
  VariableElement,
  CalculationElement,
} from "../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";
import { Evaluate } from "../../../components/utility/Evaluate";
import { FormDescription } from "../../../providers/FormDescriptionProvider/FormDescriptionProvider";
import { ConditionCalculationSequence } from "../../../components/form-edit/condition-calculation-editor/ConditionCalculationEditorProvider";

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
  newText = newText.replaceAll("⇥", "\t");
  newText = newText.replaceAll("•", " ");
  newText = newText.replaceAll("⮐", "\n");
  return newText;
};

const templateToHtmlFile = (
  values: FormValues<RootFormValue>,
  template: TemplateDescription,
  form: FormDescription,
  { exists, list, textFormatting }: Contexts
) => {
  return `
      <style>
      html 
      * {
        display: inline-block;
      }
      html {
        font-size: 16px;
      }
      h1 {
        font-size: 2rem !important;
        text-decoration: bold !important; 
      }
      p {
        font-size: 1rem !important;
        text-decoration: none !important;
        font-weight: 400 !important;
      }
      </style>


      <html>
      <body style="display: flex !important; flex-direction: column; align-items: stretch; width: 100vw; box-sizing: border-box;  display: block;">
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
      </body>
      </html>`;
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
    return `<${
      element.textFormattingType === "element" ? element.element : "span"
    } style="${
      element.textFormattingType === "element"
        ? "display: block !important;"
        : "display: inline !important;"
    } ${
      element.textFormattingType === "element"
        ? `text-align: ${element.align} !important;`
        : ""
    } text-decoration: ${element.effect} !important; width: full; ">
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
      </${
        element.textFormattingType === "element" ? element.element : "span"
      }>`;
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
      html += `${elementToHtmlFunctions.template(values, element.child, form, {
        exists,
        list: [...list, [element.list, i]],
        textFormatting,
      })}`;
    }
    return html;
  },

  text: (
    values: FormValues<RootFormValue>,
    element: TextElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    return `<span style="white-space: pre-wrap">${normalizeText(
      element.text
    )}</span>`;
  },
  variable: (
    values: FormValues<RootFormValue>,
    element: VariableElement,
    form: FormDescription,
    { exists, list, textFormatting }: Contexts
  ) => {
    return `<span style="white-space: pre-wrap">
      ${Evaluate.getValue(element.variable, values, form, list)}
      </span>`;
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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.id || !req.query.data || !req.query.perm) {
    res.status(400).json({ error: "Missing query params." });
    return;
  }
  if (!req.cookies["--user-token"]) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const decodedToken = await firebaseAdmin
    .auth()
    .verifyIdToken(req.cookies["--user-token"]);
  if (!decodedToken) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  let { perm, id, data } = req.query;
  const doc = (
    await firebaseAdmin
      .firestore()
      .collection("forms")
      .doc(id as string)
      .get()
  ).data();

  if (!doc) return res.status(404).json({ error: "Form not found." });

  const template = doc.templateData as TemplateDescription;
  const formDescription = doc.formData as FormDescription;

  if (perm === "owner") {
    firebaseAdmin
      .firestore()
      .collection("forms")
      .doc(id as string)
      .get()
      .then((doc) => {
        if (doc.data()?.author !== decodedToken.uid) {
          res.status(401).json({ error: "Unauthorized." });
        }
      });
  } else if (perm === "admin") {
    if (decodedToken["admin"] != true)
      res.status(401).json({ error: "Unauthorized." });
  } else res.status(401).json({ error: "Invalid permission type." });

  let pdf: Buffer;
  const content = templateToHtmlFile(
    JSON.parse(data as string),
    template,
    formDescription,
    {
      exists: [],
      list: [],
      textFormatting: {
        textFormattingType: "effect",
        align: "left",
        effect: "normal",
        element: "p",
      },
    }
  );

  htmlPdfNode.generatePdf(
    {
      content,
    },
    {
      format: "A4",
      displayHeaderFooter: false,
      margin: {
        top: "2.5cm",
        bottom: "2.5cm",
        left: "2.5cm",
        right: "2.5cm",
      },
    },
    (err, result) => {
      if (err) {
        res.status(500).json({ message: err });
        return;
      }
      pdf = result;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=generated.pdf");
      res.status(200).send(pdf);
      return;
    }
  );

  return;
};
