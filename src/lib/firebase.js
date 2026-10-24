/**
 * JagaJalan Platform - Firebase Integration Layer
 * Modul inisialisasi Cloud Firestore, Storage, dan Auth dengan graceful fallback.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Memeriksa apakah kredensial Firebase sudah dikonfigurasi di environment
 * @returns {boolean}
 */
export const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return (
    typeof apiKey === "string" &&
    apiKey.trim() !== "" &&
    !apiKey.includes("ExampleApiKey") &&
    typeof projectId === "string" &&
    projectId.trim() !== "" &&
    !projectId.includes("example")
  );
};

let app = null;
let db = null;
let storage = null;
let auth = null;

// Inisialisasi Firebase hanya jika kredensial sudah tersedia
if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Inisialisasi Firebase dilewati:", error.message);
  }
}

export { app, db, storage, auth };
