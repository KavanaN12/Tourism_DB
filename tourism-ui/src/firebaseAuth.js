import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
