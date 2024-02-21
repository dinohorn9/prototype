// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmMuaSEjkdEHfxIAEWWqkp_bHU_xuym0w",
  authDomain: "prototy-5c7db.firebaseapp.com",
  projectId: "prototy-5c7db",
  storageBucket: "prototy-5c7db.appspot.com",
  messagingSenderId: "617381396543",
  appId: "1:617381396543:web:a435620550a5b85d01f88a",
  measurementId: "G-ELYKLSHZL4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, analytics, db };