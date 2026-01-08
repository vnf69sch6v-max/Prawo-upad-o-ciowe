'use client';

import { useState, useEffect } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            throw err;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });
            return result.user;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign up';
            setError(message);
            throw err;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send reset email';
            setError(message);
            throw err;
        }
    };

    return {
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        resetPassword,
        isAuthenticated: !!user,
    };
}
