import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
import { getAuth } from "@firebase/auth";

const devConfig = {
  apiKey: "AIzaSyBNiZwjBb_UFqvgweyrv-QayFTWxom1Dh4",
  authDomain: "trustree-fd2aa.firebaseapp.com",
  projectId: "trustree-fd2aa",
  storageBucket: "trustree-fd2aa.appspot.com",
  messagingSenderId: "972787504894",
  appId: "1:972787504894:web:2a4382e9d9737152d137af",
  measurementId: "G-VWQNT29FTM",
};
const prodConfig = {
  apiKey: "AIzaSyDwIgbpl5E_h6WQWAu33rRSzfj6I5zqLnI",
  authDomain: "trustree-release.firebaseapp.com",
  projectId: "trustree-release",
  storageBucket: "trustree-release.appspot.com",
  messagingSenderId: "354006887398",
  appId: "1:354006887398:web:ae99a5ebf2f106bcf5c427",
  measurementId: "G-RC8D0J99L5",
};

const dev = //process.env.NODE_ENV == "development";
  false;

let firebase_app;

initializeApp(prodConfig, "Iusinus");

if (!getApps().length) {
  firebase_app = initializeApp(
    dev ? devConfig : prodConfig,
    dev ? "Iusinus DEV" : "Iusinus"
  );
} else firebase_app = getApp(dev ? "Iusinus DEV" : "Iusinus");

export const app = firebase_app;
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
