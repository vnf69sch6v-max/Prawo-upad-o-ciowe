// Firebase Configuration - Client-side
// Lazy initialization to handle SSR and missing env vars

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

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
        // During SSR/build, env vars may not be available
        if (typeof window === 'undefined') {
            console.warn('Firebase: Missing config (SSR/build time - this is expected)');
        } else {
            console.error('Firebase: Missing required configuration');
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

// Lazy getters using Proxy for backward compatibility
export const auth = new Proxy({} as Auth, {
    get(_, prop) {
        if (!_auth) {
            const app = getFirebaseApp();
            if (!app) {
                // Return a mock object that throws helpful error
                if (prop === 'currentUser') return null;
                throw new Error('Firebase Auth not initialized. Check environment variables.');
            }
            _auth = getAuth(app);
        }
        return (_auth as any)[prop];
    }
});

export const db = new Proxy({} as Firestore, {
    get(_, prop) {
        if (!_db) {
            const app = getFirebaseApp();
            if (!app) {
                throw new Error('Firebase Firestore not initialized. Check environment variables.');
            }
            _db = getFirestore(app);
        }
        return (_db as any)[prop];
    }
});

export const storage = new Proxy({} as FirebaseStorage, {
    get(_, prop) {
        if (!_storage) {
            const app = getFirebaseApp();
            if (!app) {
                throw new Error('Firebase Storage not initialized. Check environment variables.');
            }
            _storage = getStorage(app);
        }
        return (_storage as any)[prop];
    }
});

// Direct access functions (return null if not available)
export function getFirebaseAuth(): Auth | null {
    const app = getFirebaseApp();
    if (!app) return null;
    if (!_auth) _auth = getAuth(app);
    return _auth;
}

export function getFirebaseDb(): Firestore | null {
    const app = getFirebaseApp();
    if (!app) return null;
    if (!_db) _db = getFirestore(app);
    return _db;
}

export function isFirebaseAvailable(): boolean {
    return isConfigValid() && typeof window !== 'undefined';
}

export default { auth, db, storage, getFirebaseApp, isFirebaseAvailable };
