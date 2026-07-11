'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirebaseAuth, isFirebaseAvailable } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, type User } from 'firebase/auth';

/**
 * Auth is only enforced when NEXT_PUBLIC_AUTH_ENABLED === 'true' AND Firebase
 * is configured. Otherwise the app runs in "demo" mode (no gating) so it stays
 * fully usable locally before Firebase credentials are provisioned.
 */
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

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
    signOut: () => Promise<void>;
}

function computeInitials(name?: string | null, email?: string | null): string {
    const base = (name && name.trim()) || (email ? email.split('@')[0] : '') || 'U';
    const parts = base.split(/[\s._-]+/).filter(Boolean);
    const raw = parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
    return raw.toUpperCase();
}

const DEMO_USER: AppUser = { email: 'demo@makro.pl', displayName: 'Konto demo', photoURL: null, initials: 'MD' };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!AUTH_ENABLED || !isFirebaseAvailable()) {
            setUser(DEMO_USER);
            setLoading(false);
            return;
        }
        const auth = getFirebaseAuth();
        if (!auth) {
            setUser(DEMO_USER);
            setLoading(false);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u: User | null) => {
            setUser(u ? { email: u.email, displayName: u.displayName, photoURL: u.photoURL, initials: computeInitials(u.displayName, u.email) } : null);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        enabled: AUTH_ENABLED && isFirebaseAvailable(),
        signIn: async (email, password) => {
            if (!AUTH_ENABLED || !isFirebaseAvailable()) return; // demo — succeed silently
            const auth = getFirebaseAuth();
            if (!auth) throw new Error('Firebase Auth niedostępny — sprawdź konfigurację.');
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await cred.user.getIdToken();
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
        },
        signOut: async () => {
            if (AUTH_ENABLED && isFirebaseAvailable()) {
                const auth = getFirebaseAuth();
                if (auth) await fbSignOut(auth);
                await fetch('/api/auth/session', { method: 'DELETE' });
            }
        },
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
