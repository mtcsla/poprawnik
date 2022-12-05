import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";

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
  if (!exists) {
    return res.status(404).json({ message: "Document not found" });
  }
  let file: Buffer | null = null;
  try {
    file = (await docRef.download())[0];
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (!file) {
    return res.status(404).json({ message: "Document not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${documentId}.pdf`
  );
  res.setHeader("Content-Length", file.length.toString());

  res.status(200).send(file);
};
