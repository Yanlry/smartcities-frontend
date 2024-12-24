import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIN0bh0G6-d6cNQh6lhuNUDIyFEQo0cG8",
  authDomain: "smartcities-f6268.firebaseapp.com",
  projectId: "smartcities-f6268",
  storageBucket: "smartcities-f6268.appspot.com",
  messagingSenderId: "245832573252",
  appId: "1:245832573252:web:71ec66fa1491bc20a1f711",
  measurementId: "G-N0FS36H7G5",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter Firestore pour utilisation
const db = getFirestore(app);

export { db };