import chalk from "chalk";
import * as firebaseAdmin from "firebase-admin";

// get this JSON from the Firebase board
// you can also store the values in environment variables

const dev = process.env.NODE_ENV == "development";

const serviceAccount = JSON.parse(
  dev
    ? (process.env.SERVICE_ACCOUNT_DEV as string)
    : (process.env.SERVICE_ACCOUNT_PROD as string)
);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      privateKey: serviceAccount.private_key,
      clientEmail: serviceAccount.client_email,
      projectId: serviceAccount.project_id,
    }),
  });
}

export { firebaseAdmin };
