    // src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 

// PASTE YOUR ACTUAL KEYS FROM FIREBASE CONSOLE HERE
const firebaseConfig = {
  apiKey: "AIzaSyBvyzoA41Kdw8nsLMZiXNvGVkKXW8uns14",
  authDomain: "subsday-78195.firebaseapp.com",
  projectId: "subsday-78195",
  storageBucket: "subsday-78195.firebasestorage.app",
  messagingSenderId: "99130321326",
  appId: "1:99130321326:web:012bb40d9130438f4dc03f",
  measurementId: "G-721SV62V9Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- Export Auth
export const googleProvider = new GoogleAuthProvider(); 