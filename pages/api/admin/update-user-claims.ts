import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiHandler } from "next";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";

const handler: NextApiHandler = async (req, res) => {
  if (!req.query.userId || !req.query.claims)
    return res.status(400).json({ message: "Bad request" });

  if (!req.cookies["--user-token"])
    return res.status(401).json({ message: "Unauthorized" });

  let user: DecodedIdToken | null;
  try {
    user = await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies["--user-token"]);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!user.claims.admin) return res.status(403).json({ message: "Forbidden" });

  let { userId, claims } = req.query;
  claims = (claims as string).split(",");

  const oldClaims =
    (await firebaseAdmin.auth().getUser(userId as string)).customClaims ?? {};

  const oldRoles = Object.keys(oldClaims);
  const rolesToRemove = oldRoles.filter((role) => !claims.includes(role));

  const newClaims: { [key: string]: true } = {};
  for (const role of claims) {
    newClaims[role] = true;
  }
  for (const role of Object.keys(oldClaims)) {
    newClaims[role] = true;
  }
  for (const role of rolesToRemove) {
    delete newClaims[role];
  }

  await firebaseAdmin.auth().setCustomUserClaims(userId as string, newClaims);

  res.status(200).json({ message: "Success!" });
};

export default handler;
