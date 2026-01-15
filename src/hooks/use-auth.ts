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

// Polish error messages for Firebase auth errors
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/email-already-in-use': 'Ten adres email jest już używany',
    'auth/invalid-email': 'Nieprawidłowy format adresu email',
    'auth/weak-password': 'Hasło musi mieć minimum 6 znaków',
    'auth/user-not-found': 'Nie znaleziono konta z tym adresem email',
    'auth/wrong-password': 'Nieprawidłowe hasło',
    'auth/invalid-credential': 'Nieprawidłowe dane logowania',
    'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj ponownie za chwilę',
    'auth/network-request-failed': 'Brak połączenia z internetem',
    'auth/popup-closed-by-user': 'Logowanie zostało anulowane',
    'auth/operation-not-allowed': 'Ta metoda logowania jest niedostępna',
};

const getPolishErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        // Extract Firebase error code
        const match = error.message.match(/\(([^)]+)\)/);
        const code = match ? match[1] : error.message;
        return AUTH_ERROR_MESSAGES[code] || 'Wystąpił błąd. Spróbuj ponownie.';
    }
    return 'Wystąpił nieoczekiwany błąd';
};

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
                // Wait a moment for displayName to be set by signUp
                await new Promise(resolve => setTimeout(resolve, 500));
                // Reload user to get updated displayName
                await firebaseUser.reload();

                const displayName = firebaseUser.displayName ||
                    firebaseUser.email?.split('@')[0] ||
                    'Student';

                userProfile = await createUserProfile(
                    firebaseUser.uid,
                    firebaseUser.email || '',
                    displayName
                );
            } else if (userProfile.displayName === 'User' && firebaseUser.displayName) {
                // Fix existing profiles with 'User' displayName
                const { updateUserProfile } = await import('@/lib/services/user-service');
                await updateUserProfile(firebaseUser.uid, { displayName: firebaseUser.displayName });
                userProfile = { ...userProfile, displayName: firebaseUser.displayName };
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
            setError(getPolishErrorMessage(err));
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
            setError(getPolishErrorMessage(err));
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
            setError(getPolishErrorMessage(err));
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
            setError(getPolishErrorMessage(err));
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
            setError(getPolishErrorMessage(err));
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
