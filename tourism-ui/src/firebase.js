// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore"; 
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUgZNGR9V8uTxw845cD0rcJ4s2BETV054",
  authDomain: "tourism-app-4f4fb.firebaseapp.com",
  projectId: "tourism-app-4f4fb",
  storageBucket: "tourism-app-4f4fb.firebasestorage.app",
  messagingSenderId: "1070274272206",
  appId: "1:1070274272206:web:0f6e9bb1e53e005723699f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);