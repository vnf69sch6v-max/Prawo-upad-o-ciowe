'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { getFirebaseAuth, isFirebaseAvailable } from '@/lib/firebase/config';
import { UserProfile } from '@/lib/types/user';
import { getUserProfile, createUserProfile, updateStreak } from '@/lib/services/user-service';

const googleProvider = new GoogleAuthProvider();

// Cookie management for middleware sync
const setAuthCookie = async (user: User | null) => {
    if (user) {
        const token = await user.getIdToken();
        document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
    } else {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load user profile when user changes
    const loadProfile = useCallback(async (firebaseUser: User | null) => {
        if (!firebaseUser) {
            setProfile(null);
            return;
        }

        setProfileLoading(true);
        try {
            let userProfile = await getUserProfile(firebaseUser.uid);

            // Create profile if it doesn't exist (for existing auth users)
            if (!userProfile) {
                userProfile = await createUserProfile(
                    firebaseUser.uid,
                    firebaseUser.email || '',
                    firebaseUser.displayName || 'User'
                );
            }

            setProfile(userProfile);
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        const auth = getFirebaseAuth();
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            // Sync auth cookie with Firebase auth state
            await setAuthCookie(firebaseUser);

            await loadProfile(firebaseUser);
        });

        return () => unsubscribe();
    }, [loadProfile]);

    const signIn = async (email: string, password: string) => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase not available');

        try {
            setError(null);
            console.log('[AUTH] Starting signIn for:', email);
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('[AUTH] SignIn successful:', result.user.uid);

            // Update streak on login
            await updateStreak(result.user.uid);

            return result.user;
        } catch (err: unknown) {
            console.error('[AUTH] SignIn error:', err);
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            throw err;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase not available');

        try {
            setError(null);
            console.log('[AUTH] Starting signup for:', email);

            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log('[AUTH] Firebase user created:', result.user.uid);

            await updateProfile(result.user, { displayName });
            console.log('[AUTH] Profile updated with displayName:', displayName);

            // Create user profile in Firestore
            console.log('[AUTH] Creating Firestore profile...');
            const newProfile = await createUserProfile(
                result.user.uid,
                email,
                displayName
            );
            console.log('[AUTH] Firestore profile created successfully');
            setProfile(newProfile);

            return result.user;
        } catch (err: unknown) {
            console.error('[AUTH] Signup error:', err);
            const message = err instanceof Error ? err.message : 'Failed to sign up';
            setError(message);
            throw err;
        }
    };

    const signInWithGoogle = async () => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase not available');

        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);

            // Check if profile exists, create if not
            let userProfile = await getUserProfile(result.user.uid);
            if (!userProfile) {
                userProfile = await createUserProfile(
                    result.user.uid,
                    result.user.email || '',
                    result.user.displayName || 'User'
                );
            }
            setProfile(userProfile);

            // Update streak
            await updateStreak(result.user.uid);

            return result.user;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase not available');

        try {
            setError(null);
            await signOut(auth);
            setProfile(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Firebase not available');

        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send reset email';
            setError(message);
            throw err;
        }
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user);
        }
    };

    return {
        user,
        profile,
        loading,
        profileLoading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
        isAuthenticated: !!user,
    };
}
