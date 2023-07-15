import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
import { getAuth } from "@firebase/auth";

const prodConfig = {
  apiKey: "AIzaSyCk_vIY4toVfR9KBDH1aVZ4DW80DFiKm7U",
  authDomain: "poprawnik-prod.firebaseapp.com",
  projectId: "poprawnik-prod",
  storageBucket: "poprawnik-prod.appspot.com",
  messagingSenderId: "202331496756",
  appId: "1:202331496756:web:a5d03e3563afed44344561",
  measurementId: "G-R7XF3CTHQE",
};
const devConfig = {
  apiKey: "AIzaSyDwIgbpl5E_h6WQWAu33rRSzfj6I5zqLnI",
  authDomain: "trustree-release.firebaseapp.com",
  projectId: "trustree-release",
  storageBucket: "trustree-release.appspot.com",
  messagingSenderId: "354006887398",
  appId: "1:354006887398:web:ae99a5ebf2f106bcf5c427",
  measurementId: "G-RC8D0J99L5",
};

const dev = process.env.NODE_ENV == "development";

let firebase_app;

if (!getApps().length) {
  firebase_app = initializeApp(
    true ? devConfig : prodConfig,
    false ? "Iusinus" : "POPRAWNIK"
  );
} else firebase_app = getApp(dev ? "Iusinus" : "POPRAWNIK");

export const app = firebase_app;
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
