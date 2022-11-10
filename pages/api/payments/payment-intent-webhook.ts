import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";
import generatePdf from "../template/generate.pdf";
import { templateToHtmlFile } from "../template/generate.pdf";
import { FormValues, RootFormValue } from "../../forms/[id]/form";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const event = req.body;
  try {
    if (event.type === "payment_intent.succeeded") {
      console.log(req.body);
      if (
        !req.body?.data?.object?.metadata?.["formId"] ||
        !req.body?.data?.object?.metadata?.["userId"]
      )
        throw new Error("Invalid metadata.");
      const { formId, userId } = req.body?.data?.object?.metadata;

      const formDoc = (
        await firebaseAdmin.firestore().collection("forms").doc(formId).get()
      ).data();

      const productDoc = (
        await firebaseAdmin.firestore().collection("product").doc(formId).get()
      ).data();

      const data = (
        await firebaseAdmin
          .firestore()
          .collection("user-data")
          .doc(userId)
          .collection("data")
          .doc(formId)
          .get()
      ).data();

      await firebaseAdmin
        .firestore()
        .collection("user-data")
        .doc(userId)
        .collection("purchased-documents")
        .add({
          product_id: formId,
          product_name: formDoc?.title,
          product_price: productDoc?.price,
          product_category: productDoc?.category,
          product_description: productDoc?.description,
          discount: 0,
          contents: templateToHtmlFile(
            data as FormValues<RootFormValue>,
            formDoc?.templateData,
            formDoc?.formData
          ),
          date: new Date(),
        });

      return res.status(200).json({ received: true });
    } else
      return res.status(200).json({
        received: false,
        why_rejected:
          "Not a payment_intent.succeeded or payment_intent.payment_failed event.",
      });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ received: false, why_rejected: err });
  }
};
