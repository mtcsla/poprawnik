import chalk from "chalk";
import * as firebaseAdmin from "firebase-admin";

// get this JSON from the Firebase board
// you can also store the values in environment variables

const dev = false;

const serviceAccount = JSON.parse(
  dev
    ? (process.env.SERVICE_ACCOUNT_DEV as string)
    : (process.env.SERVICE_ACCOUNT_PROD as string)
);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    storageBucket: "trustree-release.appspot.com",
  });
}

export { firebaseAdmin };
