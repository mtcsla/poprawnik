import * as firebaseAdmin from "firebase-admin";

const dev = process.env.NODE_ENV == "development";

const serviceAccount = JSON.parse(
  true
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
