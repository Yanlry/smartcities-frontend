import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import { FIREBASE_API_KEY, FIREBASE_APP_ID,FIREBASE_MEASUREMENT_ID, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID  } from "@env";

const firebaseConfig = {
  apiKey: `${FIREBASE_API_KEY}`,
  authDomain: `${FIREBASE_AUTH_DOMAIN}`,
  projectId: `${FIREBASE_PROJECT_ID}`,
  storageBucket: `${FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${FIREBASE_APP_ID}`,
  measurementId: `${FIREBASE_MEASUREMENT_ID}`,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };