import { Timestamp } from "@firebase/firestore";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";

import htmlPdfNode from "html-pdf-node";
import { templateToHtmlFile } from "./template/generate.pdf";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const idToken = req.cookies["--user-token"];
  const documentId: string = req.query.id as string;

  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!documentId) {
    return res.status(400).json({ message: "Document ID is required." });
  }
  let decodedToken: DecodedIdToken | null = null;

  try {
    decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  type PurchaseDoc = {
    contents: string;
    date: Timestamp;
    discount: number;
    paymentIntentId: string;
    product_category: string;
    product_description: string;
    product_id: string;
    product_name: string;
    product_price: number;
  };

  let document: PurchaseDoc | undefined | null = null;
  try {
    document = (
      await firebaseAdmin
        .firestore()
        .collection("user-data")
        .doc(decodedToken.uid)
        .collection("purchased-documents")
        .doc(documentId)
        .get()
    ).data() as PurchaseDoc | undefined;
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  let exists: boolean | null = null;
  const docRef = firebaseAdmin
    .storage()
    .bucket()
    .file(`documents/${decodedToken.uid}/${documentId}.pdf`);

  try {
    exists = (await docRef.exists())[0];
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  let err_resolve = false;
  let pdf: Buffer | null = null;
  if (!exists) {
    htmlPdfNode.generatePdf(
      {
        content: document.contents,
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
      async (err, result) => {
        if (err) {
          console.log(err);
          err_resolve = true;
          return;
        }
        pdf = result;

        if (!pdf) {
          console.log("PDF is null");
          err_resolve = true;
        }

        try {
          await docRef.save(pdf, {
            resumable: false,
            validation: "crc32c",
            metadata: {
              contentType: "application/pdf",
            },
          });
        } catch (e) {
          console.log(e);
          err_resolve = true;
        }
      }
    );
  }
  if (err_resolve) {
    res.status(500).json({ message: "Failed to create PDF." });
    return;
  }
  res.status(200).json({ message: "Success" });
};
