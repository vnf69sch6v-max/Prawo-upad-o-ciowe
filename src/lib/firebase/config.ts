// Firebase Configuration - Client-side
// Lazy initialization to handle SSR and missing env vars
// Przeglądarka używa wyłącznie logowania (Auth). Firestore i Storage są tylko na serwerze (Admin SDK),
// a reguły (`firestore.rules`, `storage.rules`) blokują klienta w całości — nie importuj tu
// `firebase/firestore` ani `firebase/storage` (test: tests/data-protection.test.ts).

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _warnedMissing = false;

function isConfigValid(): boolean {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId
    );
}

function getFirebaseApp(): FirebaseApp | null {
    if (_app) return _app;

    if (!isConfigValid()) {
        // Missing config is an expected state in demo mode — warn once, don't spam.
        if (!_warnedMissing) {
            _warnedMissing = true;
            console.warn('Firebase: brak konfiguracji klienta — tryb bez logowania (demo).');
        }
        return null;
    }

    if (getApps().length > 0) {
        _app = getApp();
    } else {
        _app = initializeApp(firebaseConfig);
    }

    return _app;
}

// Direct access functions (return null if not available)
export function getFirebaseAuth(): Auth | null {
    const app = getFirebaseApp();
    if (!app) return null;
    if (!_auth) {
        _auth = getAuth(app);
        // Maile Firebase (reset hasła) i komunikaty handlera po polsku. Okno Google i tak bierze język konta.
        _auth.languageCode = 'pl';
    }
    return _auth;
}

/** Konfiguracja klienta z env (wstawiana przy buildzie) — ta sama wartość na serwerze i w przeglądarce. */
export function isFirebaseConfigured(): boolean {
    return isConfigValid();
}
