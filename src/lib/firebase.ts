
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Added GoogleAuthProvider
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtw0Z4EHNJcHJr6-zllrkmTk1thnCMWhw",
  authDomain: "karigar-kart-4a308.firebaseapp.com",
  projectId: "karigar-kart-4a308",
  storageBucket: "karigar-kart-4a308.firebasestorage.app",
  messagingSenderId: "782852027908",
  appId: "1:782852027908:web:06ab96569d36f541b8e751",
  measurementId: "G-GFF4FH09N2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
let analytics;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };

