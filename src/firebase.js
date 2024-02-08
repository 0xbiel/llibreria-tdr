// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAC7r6uPZuhAi1RDpA9-o_694suYLLg74k",
  authDomain: "library-oliver.firebaseapp.com",
  databaseURL:
    "https://library-oliver-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "library-oliver",
  storageBucket: "library-oliver.appspot.com",
  messagingSenderId: "48863830793",
  appId: "1:48863830793:web:8ce4234bda0118794829d8",
  measurementId: "G-VZJP8VLF5G",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getDatabase();

// Initialize Analytics and get a reference to the service
const analytics = getAnalytics(app);

// Initialize Firebase Auth provider
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// whenever a user interacts with the provider, we force them to select an account
googleProvider.setCustomParameters({
  prompt: "select_account ",
});

export const signInWithGooglePopup = () =>
  signInWithPopup(auth, googleProvider);
export const singInWithGitHubPopup = () =>
  signInWithPopup(auth, githubProvider);

export { app, db, analytics };
