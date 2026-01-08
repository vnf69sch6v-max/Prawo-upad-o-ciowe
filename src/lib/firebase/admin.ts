// Firebase Admin SDK Configuration (Server-side only)
// Lazy initialization to prevent build errors when env vars are missing

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;
let _initialized = false;

function initializeAdmin(): boolean {
    if (_initialized) return _adminApp !== null;
    _initialized = true;

    // Check if required env vars exist
    if (!process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('Firebase Admin: Missing required environment variables. Admin SDK will not be available.');
        return false;
    }

    if (getApps().length > 0) {
        _adminApp = getApps()[0];
        _adminAuth = getAuth(_adminApp);
        _adminDb = getFirestore(_adminApp);
        return true;
    }

    try {
        // Parse private key (handle both JSON and escaped formats)
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        _adminApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });

        _adminAuth = getAuth(_adminApp);
        _adminDb = getFirestore(_adminApp);
        return true;
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        return false;
    }
}

// Lazy getters that initialize on first access
export const adminAuth = new Proxy({} as Auth, {
    get(_, prop) {
        initializeAdmin();
        if (!_adminAuth) {
            throw new Error('Firebase Admin Auth not initialized. Check environment variables.');
        }
        return (_adminAuth as any)[prop];
    }
});

export const adminDb = new Proxy({} as Firestore, {
    get(_, prop) {
        initializeAdmin();
        if (!_adminDb) {
            throw new Error('Firebase Admin Firestore not initialized. Check environment variables.');
        }
        return (_adminDb as any)[prop];
    }
});

// Helper to check if admin is available (useful for graceful degradation)
export function isAdminAvailable(): boolean {
    return initializeAdmin();
}

// For direct access (returns null if not available)
export function getAdminAuth(): Auth | null {
    initializeAdmin();
    return _adminAuth;
}

export function getAdminDb(): Firestore | null {
    initializeAdmin();
    return _adminDb;
}

export default { adminAuth, adminDb, isAdminAvailable, getAdminAuth, getAdminDb };
