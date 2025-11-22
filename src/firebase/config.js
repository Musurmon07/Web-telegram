// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase console dan olingan config
// (firebase.google.com → Project Settings → Your apps)
const firebaseConfig = {
    apiKey: "AIzaSyB1QKdN7-ypXGmkmxwqcc4sUjDv8IUWFls",
    authDomain: "my-app-4eabc.firebaseapp.com",
    projectId: "my-app-4eabc",
    storageBucket: "my-app-4eabc.firebasestorage.app",
    messagingSenderId: "614190729159",
    appId: "1:614190729159:web:001b4cb44bd315eeb93be2",
    measurementId: "G-WPQNJLRMP3"
}

// Firebase ni initialize qilish
const app = initializeApp(firebaseConfig)

// Services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
