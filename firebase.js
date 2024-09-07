// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU9hJVmxsWf2U-LoGvSAz6HXyR3LnDtSs",
  authDomain: "fitness-assistant-ba83b.firebaseapp.com",
  projectId: "fitness-assistant-ba83b",
  storageBucket: "fitness-assistant-ba83b.appspot.com",
  messagingSenderId: "536484384628",
  appId: "1:536484384628:web:4cb12e3519db94eedba621"
};

// Initialize Firebase and 
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };