// Import SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyCUgZNGR9V8uTxw845cD0rcJ4s2BETV054",
  authDomain: "tourism-app-4f4fb.firebaseapp.com",
  projectId: "tourism-app-4f4fb",
  storageBucket: "tourism-app-4f4fb.firebasestorage.app",
  messagingSenderId: "1070274272206",
  appId: "1:1070274272206:web:0f6e9bb1e53e005723699f"
};

// Initialize Firebase app ONCE
const app = initializeApp(firebaseConfig);

// Export usable services
export const db = getFirestore(app);
export const auth = getAuth(app);
