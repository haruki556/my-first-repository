import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyARz1zkwS0lCSCwfXvqjoB6b6KBqb1wMXE",
    authDomain: "my-self-management-app.firebaseapp.com",
    projectId: "my-self-management-app",
    storageBucket: "my-self-management-app.firebasestorage.app",
    messagingSenderId: "834210967193",
    appId: "1:834210967193:web:c979ac51bb9601fc6d1208"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc, onSnapshot };
