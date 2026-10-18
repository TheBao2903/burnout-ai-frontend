// ==========================================
// Firebase Client SDK Configuration
// ==========================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAS-c71fvBuoPpyIy-wHLhJ5MfWmS6yc6I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "burnout-ai-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "burnout-ai-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "burnout-ai-platform.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109473034334042662137",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109473034334:web:burnout-ai-platform",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
