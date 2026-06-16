// ----------------------------------------------------------------------
// Firebase initialization (Authentication + Realtime Database).
//
// This is the single place the app talks to Firebase. Configuration is read
// from Vite env vars (see frontend/.env.example). Until real credentials are
// provided, the app runs on the mock data in `src/data/` and this module
// stays inert.
//
// To go live:
//   1. Fill in frontend/.env from the Firebase console.
//   2. `yarn add firebase`.
//   3. Uncomment the initialization below and swap the `src/data` reads for
//      the realtime helpers in this folder.
// ----------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);

/**
 * Send a password-reset email. Stubbed until Firebase Auth is wired — for now
 * it resolves so the UI can show its confirmation state.
 *
 * Live version:
 *   import { sendPasswordResetEmail } from 'firebase/auth';
 *   await sendPasswordResetEmail(auth, email);
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!email) throw new Error('Email is required.');
  // no-op stub
}

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
//
// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getDatabase(app);
