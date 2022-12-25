import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { NextApiHandler } from "next";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";

const handler: NextApiHandler = async (req, res) => {
  if (!req.cookies["--user-token"]) {
    res.status(401).send("Unauthorized");
    return;
  }
  const token = req.cookies["--user-token"];
  let user: DecodedIdToken;
  try {
    user = await firebaseAdmin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).send("Unauthorized");
  }
  if (!user.admin) return res.status(403).send("Forbidden");

  let users: UserRecord[] = [];
  try {
    users = (await firebaseAdmin.auth().listUsers()).users;
  } catch {
    return res.status(500).send("Internal Server Error");
  }

  res.status(200).json(users);
};

export default handler;
