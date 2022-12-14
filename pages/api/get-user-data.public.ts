import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../buildtime-deps/firebaseAdmin";

export const getUserData = async (id: string) => {
  let user: UserRecord | null = null;
  user = await firebaseAdmin.auth().getUser(id);
  return {
    uid: user.uid,
    photoURL: user.photoURL,
    displayName: user.displayName,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: "Missing users id" });
    return;
  }

  let user: UserRecord | null = null;

  try {
    user = await firebaseAdmin.auth().getUser(id);
  } catch (e) {
    return res.status(400).json({ error: "User not found" });
  }

  res.status(200).json({
    uid: user.uid,
    photoURL: user.photoURL,
    displayName: user.displayName,
  });
}
