import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { firebaseAdmin } from "../../../buildtime-deps/firebaseAdmin";

export const possibleRoles = ["user", "admin", "lawyer", "editor"];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = typeof req.body == "string" ? JSON.parse(req.body) : req.body;
  const newRoles: string[] = body.roles;

  const token = body.token;
  const targetToken = body.targetToken;

  let decodedToken: DecodedIdToken;
  let decodedTargetToken: DecodedIdToken;

  if (!("token" in body) || !("targetToken" in body)) {
    res.status(400).json({ message: "Missing user token." });
    return;
  }
  if (
    !("roles" in body) ||
    !Array.isArray(body.roles) ||
    !body.roles.length ||
    typeof body.roles[0] != "string"
  ) {
    res.status(400).json({ message: "Missing roles to assign." });
    return;
  }
  for (let role of body.roles) {
    if (!possibleRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role." });
      return;
    }
  }

  try {
    decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    decodedTargetToken = await firebaseAdmin.auth().verifyIdToken(targetToken);
  } catch {
    res.status(404).json({ message: "Invalid user token." });
    return;
  }

  const roles: string[] = ["user"];
  const targetRoles: string[] = ["user"];

  roles.push(
    ...Object.keys(decodedToken).filter(
      (key) => possibleRoles.includes(key) && decodedToken[key] === true
    )
  );
  targetRoles.push(
    ...Object.keys(decodedTargetToken).filter(
      (key) => possibleRoles.includes(key) && decodedTargetToken[key] === true
    )
  );

  if (!roles.includes("admin")) {
    res.status(401).json({ message: "Not authorized to manage roles." });
    return;
  }

  for (const role of newRoles) {
    if (!targetRoles.includes("role"))
      await firebaseAdmin
        .auth()
        .setCustomUserClaims(targetToken, { role: true });
  }
};
