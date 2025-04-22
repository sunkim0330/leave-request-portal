import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "pto-portal-b1225.firebaseapp.com",
  projectId: "pto-portal-b1225",
  storageBucket: "pto-portal-b1225.firebasestorage.app",
  messagingSenderId: "815677056736",
  appId: "1:815677056736:web:7c07a7fe43e5ca404f9285",
  measurementId: "G-PNQYB13SWE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
