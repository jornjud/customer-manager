import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase config - use same project as SecondPhone
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAzZjdxoAJYI0q_ai7gIa-G4qFqKB7st3s",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "secondphone-fe9a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "secondphone-fe9a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "secondphone-fe9a9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "619983782470",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:619983782470:web:d2394c5658fdf3abae8047"
};

// Initialize Firebase Admin
if (!getApps().length) {
  // For local development, use service account key if available
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // For Vercel, use application default
    initializeApp();
  }
}

const db = getFirestore();

// Collection names with project prefix to avoid conflicts
// Format: {project_name}_{entity_type}
export const COLLECTIONS = {
  // Customer Manager collections
  CUSTOMERS: 'customer_manager_customers',
} as const;

export { db };
