'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as fbSignOut,
    type Auth,
    type User,
} from 'firebase/auth';

/**
 * Logowanie działa, gdy NEXT_PUBLIC_AUTH_ENABLED === 'true' i jest konfiguracja Firebase; inaczej tryb demo
 * (bez logowania). Strona pozostaje publiczna — zamknięcie całej platformy za logowaniem to osobna flaga
 * NEXT_PUBLIC_AUTH_REQUIRED (src/middleware.ts). Obie wartości wstawia build, więc SSR i przeglądarka
 * renderują to samo (bez błędu hydratacji).
 */
const AUTH_ACTIVE = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true' && isFirebaseConfigured();

export interface AppUser {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    initials: string;
}

interface AuthContextValue {
    user: AppUser | null;
    loading: boolean;
    /** True when real Firebase auth is active (not demo mode). */
    enabled: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    /** Okno Google (popup). `false`, gdy użytkownik zamknął okno (bez błędu). */
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
}

function computeInitials(name?: string | null, email?: string | null): string {
    const base = (name && name.trim()) || (email ? email.split('@')[0] : '') || 'U';
    const parts = base.split(/[\s._-]+/).filter(Boolean);
    const raw = parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
    return raw.toUpperCase();
}

const DEMO_USER: AppUser = { email: 'demo@makro.pl', displayName: 'Konto demo', photoURL: null, initials: 'MD' };

const toAppUser = (u: User): AppUser => ({
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    initials: computeInitials(u.displayName, u.email),
});

function requireAuth(): Auth {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth niedostępny — sprawdź konfigurację.');
    return auth;
}

/** Wymiana świeżego ID tokenu na ciasteczko sesji (httpOnly) — weryfikacja po stronie serwera. */
async function createSession(auth: Auth, user: User): Promise<void> {
    let ok = false;
    try {
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: await user.getIdToken() }),
        });
        ok = res.ok;
    } catch {
        ok = false; // brak sieci — ten sam komunikat, nie angielskie „Failed to fetch”
    }
    // Bez sesji na serwerze bramka (gdy włączona) odesłałaby z powrotem na /login — lepiej powiedzieć to wprost.
    if (!ok) {
        await fbSignOut(auth);
        throw new Error('Nie udało się utworzyć sesji. Spróbuj zalogować się ponownie.');
    }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(AUTH_ACTIVE ? null : DEMO_USER);
    const [loading, setLoading] = useState(AUTH_ACTIVE);

    useEffect(() => {
        if (!AUTH_ACTIVE) return;
        const auth = getFirebaseAuth();
        if (!auth) return;
        return onAuthStateChanged(auth, (u: User | null) => {
            setUser(u ? toAppUser(u) : null);
            setLoading(false);
        });
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        enabled: AUTH_ACTIVE,
        signIn: async (email, password) => {
            if (!AUTH_ACTIVE) return; // demo — succeed silently
            const auth = requireAuth();
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await createSession(auth, cred.user);
        },
        signInWithGoogle: async () => {
            if (!AUTH_ACTIVE) return false;
            const auth = requireAuth();
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            try {
                const cred = await signInWithPopup(auth, provider);
                await createSession(auth, cred.user);
                return true;
            } catch (err) {
                const code = (err as { code?: string }).code;
                if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return false;
                throw err;
            }
        },
        signOut: async () => {
            if (!AUTH_ACTIVE) return;
            const auth = getFirebaseAuth();
            if (auth) await fbSignOut(auth);
            await fetch('/api/auth/session', { method: 'DELETE' });
        },
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
