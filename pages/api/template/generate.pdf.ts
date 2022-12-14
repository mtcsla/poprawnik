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
import { templateToHTMLString } from "../../../api-functions/templateToHTMLString";
import { generateFile } from "../../../api-functions/generateFile";

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

  const content = templateToHTMLString(
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
  let pdf: Buffer | null;
  try {
    pdf = await generateFile(content, "docx");
    if (!pdf) throw new Error("PDF generation failed.");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "PDF generation failed." });
    return;
  }

  console.log(content);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", "inline; filename=generated.docx");
  res.status(200).send(pdf);
  return;
};
