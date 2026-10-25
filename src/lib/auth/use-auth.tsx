'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    getRedirectResult,
    signInWithPopup,
    signInWithRedirect,
    sendPasswordResetEmail,
    signOut as fbSignOut,
    type Auth,
    type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { AUTH_FLAGS } from '@/lib/auth/flags';
import {
    accessLabel,
    accessState,
    endsSoon,
    needsRenewal,
    type AccessState,
    type SessionInfo,
} from '@/lib/auth/session-info';

/**
 * Logowanie działa, gdy jest konfiguracja Firebase, a NEXT_PUBLIC_AUTH_ENABLED nie jest `false`; inaczej tryb
 * demo (bez logowania). Zamknięcie strony za logowaniem to osobna flaga NEXT_PUBLIC_AUTH_REQUIRED
 * (src/middleware.ts). Obie są domyślnie włączone i wstawia je build (src/lib/auth/flags.ts), więc SSR
 * i przeglądarka renderują to samo (bez błędu hydratacji).
 *
 * Sieć (sonda ciasteczka, odnowienie) jest wyłącznie w efektach i w obsłudze logowania — stan początkowy
 * nie zależy od „teraz”, więc prerender i klient rysują to samo.
 */
const AUTH_ACTIVE = AUTH_FLAGS.enabled;

export interface AppUser {
    /** Identyfikator konta Firebase — klucz danych użytkownika (`savori_users/{uid}`, lokalna kopia watchlisty). */
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    initials: string;
}

export interface AuthContextValue {
    user: AppUser | null;
    loading: boolean;
    /** True when real Firebase auth is active (not demo mode). */
    enabled: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    /** Okno Google (popup). `false`, gdy użytkownik zamknął okno (bez błędu). */
    signInWithGoogle: () => Promise<boolean>;
    /** Link do zmiany hasła. Nie zdradza, czy konto istnieje (`auth/user-not-found` = sukces). */
    resetPassword: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
    /** Błąd powrotu z przekierowania Google, widoczny na formularzu logowania. */
    authNotice: string | null;
    /** Stan ciasteczka serwera (bramki), nie Firebase. `status: 'unknown'` do pierwszej sondy. */
    session: SessionInfo;
    /** `true`, gdy ciasteczko jest potwierdzone (sonda GET albo POST/PUT zakończone sukcesem). */
    sessionReady: boolean;
    /** Odnowienie ciasteczka: PUT z `getIdToken(force)`; przy `{ refresh }` ponawia raz z `true`. Zwraca nowy stan. */
    refreshSession: (opts?: { force?: boolean }) => Promise<SessionInfo>;
}

const UNKNOWN_SESSION: SessionInfo = { status: 'unknown', accessUntil: null, plan: null, iat: null };
const NONE_SESSION: SessionInfo = { status: 'none', accessUntil: null, plan: null, iat: null };
/** Demo nie ma ciasteczka. `useAccess` i tak zwraca `unknown` — nic nie pokazujemy. */
const DEMO_SESSION: SessionInfo = { status: 'ok', accessUntil: null, plan: null, iat: null };

type SessionResponse = {
    ok?: boolean;
    refresh?: boolean;
    signedIn?: boolean;
    accessUntil?: unknown;
    plan?: unknown;
    iat?: unknown;
};

function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

function asPlan(plan: unknown): SessionInfo['plan'] {
    return plan === 'trial' || plan === 'm1' || plan === 'm3' || plan === 'm6' ? plan : null;
}

function asUntil(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Ciasteczko właśnie wystawione — `iat` liczymy od teraz, serwer go w odpowiedzi nie zwraca. */
function sessionFromOk(body: SessionResponse): SessionInfo {
    return { status: 'ok', accessUntil: asUntil(body.accessUntil), plan: asPlan(body.plan), iat: nowSeconds() };
}

async function readJson(res: Response): Promise<SessionResponse> {
    return (await res.json().catch(() => ({}))) as SessionResponse;
}

async function sendSession(method: 'POST' | 'PUT', idToken: string, signal: AbortSignal): Promise<{ status: number; ok: boolean; body: SessionResponse }> {
    const res = await fetch('/api/auth/session', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
        signal,
    });
    return { status: res.status, ok: res.ok, body: await readJson(res) };
}

async function fetchSession(signal?: AbortSignal): Promise<SessionInfo> {
    const res = await fetch('/api/auth/session', { cache: 'no-store', signal });
    const body = await readJson(res);
    if (!res.ok) throw new Error('session-probe-failed');
    if (body.signedIn !== true) return NONE_SESSION;
    return { status: 'ok', accessUntil: asUntil(body.accessUntil), plan: asPlan(body.plan), iat: asUntil(body.iat) };
}

function isAbort(err: unknown): boolean {
    return !!err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError';
}

function computeInitials(name?: string | null, email?: string | null): string {
    const base = (name && name.trim()) || (email ? email.split('@')[0] : '') || 'U';
    const parts = base.split(/[\s._-]+/).filter(Boolean);
    const raw = parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
    return raw.toUpperCase();
}

const DEMO_USER: AppUser = { uid: 'demo', email: 'demo@makro.pl', displayName: 'Konto demo', photoURL: null, initials: 'MD' };

const toAppUser = (u: User): AppUser => ({
    uid: u.uid,
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

const SESSION_ERROR = 'Nie udało się utworzyć sesji. Spróbuj zalogować się ponownie.';

function redirectNotice(err: unknown): string | null {
    const code = (err as { code?: string }).code;
    if (!code || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
    if (code === 'auth/unauthorized-domain') return 'Ta domena nie jest dopuszczona do logowania w Firebase.';
    if (code === 'auth/network-request-failed') return 'Brak połączenia. Sprawdź internet i spróbuj ponownie.';
    if (code === 'auth/too-many-requests') return 'Za dużo prób logowania. Spróbuj ponownie za kilka minut.';
    return 'Nie udało się dokończyć logowania przez Google. Spróbuj ponownie.';
}

/**
 * Zegar klienta poza renderem: `Date.now` w renderze jest nieczyste (lint) i rozjeżdża hydratację.
 * Subskrypcja ustawia czas po hydratacji i odświeża go co minutę oraz przy każdym zapisie sesji.
 * Na serwerze snapshot jest `null` — `useAccess` wtedy nie liczy etykiety.
 */
let accessNowS: number | null = null;
const accessNowListeners = new Set<() => void>();
let accessNowTimer: ReturnType<typeof setInterval> | null = null;

function emitAccessNow() {
    const next = Math.floor(Date.now() / 1000);
    if (next === accessNowS) return;
    accessNowS = next;
    accessNowListeners.forEach((listener) => listener());
}

function subscribeAccessNow(onChange: () => void) {
    accessNowListeners.add(onChange);
    if (accessNowS == null) {
        accessNowS = Math.floor(Date.now() / 1000);
        queueMicrotask(() => accessNowListeners.forEach((listener) => listener()));
    }
    if (!accessNowTimer) accessNowTimer = setInterval(emitAccessNow, 60_000);
    return () => {
        accessNowListeners.delete(onChange);
        if (accessNowListeners.size === 0 && accessNowTimer) {
            clearInterval(accessNowTimer);
            accessNowTimer = null;
        }
    };
}

const readAccessNow = () => accessNowS;
const readAccessNowServer = () => null;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(AUTH_ACTIVE ? null : DEMO_USER);
    const [loading, setLoading] = useState(AUTH_ACTIVE);
    const [session, setSession] = useState<SessionInfo>(AUTH_ACTIVE ? UNKNOWN_SESSION : DEMO_SESSION);
    const [sessionReady, setSessionReady] = useState(!AUTH_ACTIVE);
    const [authNotice, setAuthNotice] = useState<string | null>(null);
    const sessionRef = useRef(session);
    /** Unieważnia sondę i odnowienie, które wystartowały przed logowaniem albo wylogowaniem. */
    const epoch = useRef(0);
    const signingIn = useRef(false);
    /** Anuluje PUT/POST w locie, żeby wylogowanie nie dostało potem nowego ciasteczka. */
    const flight = useRef<AbortController | null>(null);

    const stopFlight = useCallback(() => {
        flight.current?.abort();
        flight.current = null;
    }, []);

    const startFlight = useCallback(() => {
        stopFlight();
        const ctrl = new AbortController();
        flight.current = ctrl;
        return ctrl.signal;
    }, [stopFlight]);

    const commit = useCallback((next: SessionInfo, ready = true) => {
        emitAccessNow();
        sessionRef.current = next;
        setSession(next);
        setSessionReady(ready);
    }, []);

    const refreshSession = useCallback(async (opts?: { force?: boolean }): Promise<SessionInfo> => {
        if (!AUTH_ACTIVE || signingIn.current) return sessionRef.current;
        const fbUser = getFirebaseAuth()?.currentUser;
        if (!fbUser) return sessionRef.current;
        const my = epoch.current;
        const signal = startFlight();
        try {
            const call = (force: boolean) => fbUser.getIdToken(force).then((idToken) => sendSession('PUT', idToken, signal));
            let result = await call(opts?.force ?? false);
            if (epoch.current !== my) return sessionRef.current;
            if (result.ok && result.body.refresh === true) {
                result = await call(true);
                if (epoch.current !== my) return sessionRef.current;
            }
            if (result.ok && result.body.ok === true) {
                const next = sessionFromOk(result.body);
                commit(next);
                return next;
            }
            if (result.status === 401) {
                commit(NONE_SESSION);
                return NONE_SESSION;
            }
            return sessionRef.current;
        } catch {
            return sessionRef.current;
        }
    }, [commit, startFlight]);

    const probe = useCallback((my: number) => {
        void (async () => {
            let info: SessionInfo;
            try {
                info = await fetchSession();
            } catch {
                // Brak odpowiedzi nie udaje braku sesji i nie zostawia UI w nieskończonym czekaniu.
                if (epoch.current !== my || signingIn.current) return;
                setSessionReady(true);
                return;
            }
            if (epoch.current !== my || signingIn.current) return;
            commit(info);
            if (epoch.current !== my || signingIn.current) return;
            if (info.status === 'ok' && needsRenewal(info.iat, nowSeconds())) {
                try {
                    await refreshSession();
                } catch {
                    /* ciche odnowienie — błąd sieci nie wylogowuje */
                }
            }
        })();
    }, [commit, refreshSession]);

    /**
     * Wymiana świeżego ID tokenu na ciasteczko (httpOnly). Przy pierwszym logowaniu serwer nadaje dostęp
     * i prosi o odświeżenie tokenu (`refresh`) — wysyłamy go raz jeszcze. `sessionReady` dopiero po sukcesie.
     */
    const createSession = useCallback(async (auth: Auth, fbUser: User, my: number): Promise<boolean> => {
        const signal = startFlight();
        let next: SessionInfo | null = null;
        let aborted = false;
        try {
            for (let attempt = 0; attempt < 2 && !next; attempt++) {
                if (epoch.current !== my || signal.aborted) return false;
                const result = await sendSession('POST', await fbUser.getIdToken(attempt > 0), signal);
                if (epoch.current !== my || signal.aborted) return false;
                if (!result.ok) break;
                if (result.body.refresh) continue;
                next = sessionFromOk(result.body);
            }
        } catch (err) {
            aborted = isAbort(err);
            next = null;
        }
        // Nowsza próba albo wylogowanie przejęły stan — nie wylogowujemy ich i nie udajemy sukcesu.
        if (epoch.current !== my || aborted) return false;
        if (!next) {
            await fbSignOut(auth);
            if (epoch.current !== my) return false;
            commit(NONE_SESSION);
            throw new Error(SESSION_ERROR);
        }
        commit(next);
        return true;
    }, [commit, startFlight]);

    const beginSignIn = useCallback(() => {
        signingIn.current = true;
        stopFlight();
        setSessionReady(false);
        return ++epoch.current;
    }, [stopFlight]);

    const abortSignIn = useCallback((my: number) => {
        if (epoch.current !== my) return;
        signingIn.current = false;
        if (!getFirebaseAuth()?.currentUser) {
            commit(NONE_SESSION);
            return;
        }
        probe(++epoch.current);
    }, [commit, probe]);

    useEffect(() => {
        if (!AUTH_ACTIVE) return;
        const auth = getFirebaseAuth();
        if (!auth) return;
        let unsub = () => {};
        let cancelled = false;
        void (async () => {
            // Powrót z signInWithRedirect (popup zablokowany). Zanim wstanie onAuthStateChanged,
            // bo inaczej sonda zobaczy użytkownika Firebase bez ciasteczka i pokaże „sesja wygasła”.
            try {
                const cred = await getRedirectResult(auth);
                if (cancelled) return;
                if (cred?.user) {
                    const my = beginSignIn();
                    try {
                        const created = await createSession(auth, cred.user, my);
                        if (!created && epoch.current === my) setAuthNotice(SESSION_ERROR);
                    } catch (err) {
                        if (!(err instanceof Error && err.message === SESSION_ERROR)) abortSignIn(my);
                        if (epoch.current === my) setAuthNotice(err instanceof Error ? err.message : SESSION_ERROR);
                    } finally {
                        if (epoch.current === my) signingIn.current = false;
                    }
                }
            } catch (err) {
                if (!cancelled) setAuthNotice(redirectNotice(err));
            }
            if (cancelled) return;
            unsub = onAuthStateChanged(auth, (u: User | null) => {
                setUser(u ? toAppUser(u) : null);
                setLoading(false);
                // Logowanie samo wystawia ciasteczko (POST) — sonda w tym oknie nadpisałaby je brakiem sesji.
                if (signingIn.current) return;
                if (!u) {
                    epoch.current += 1;
                    commit(NONE_SESSION);
                    return;
                }
                probe(++epoch.current);
            });
        })();
        return () => {
            cancelled = true;
            unsub();
            stopFlight();
        };
    }, [abortSignIn, beginSignIn, commit, createSession, probe, stopFlight]);

    const signIn = useCallback(async (email: string, password: string) => {
        if (!AUTH_ACTIVE) return;
        const auth = requireAuth();
        const my = beginSignIn();
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const created = await createSession(auth, cred.user, my);
            if (!created) throw new Error(SESSION_ERROR);
        } catch (err) {
            // Nieudana sesja sama wylogowuje i zeruje stan — drugie sprzątanie nadpisałoby nowszy epoch.
            if (!(err instanceof Error && err.message === SESSION_ERROR)) abortSignIn(my);
            throw err;
        } finally {
            if (epoch.current === my) signingIn.current = false;
        }
    }, [abortSignIn, beginSignIn, createSession]);

    const signInWithGoogle = useCallback(async () => {
        if (!AUTH_ACTIVE) return false;
        const auth = requireAuth();
        const my = beginSignIn();
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const cred = await signInWithPopup(auth, provider);
            return await createSession(auth, cred.user, my);
        } catch (err) {
            const code = (err as { code?: string }).code;
            // Okno nie wstanie (telefon, przeglądarka w aplikacji, blokada popupów) — ta sama karta idzie do Google
            // i wraca tutaj; ciasteczko dokleja getRedirectResult przy starcie.
            if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                await signInWithRedirect(auth, provider);
                return false;
            }
            if (!(err instanceof Error && err.message === SESSION_ERROR)) abortSignIn(my);
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return false;
            throw err;
        } finally {
            if (epoch.current === my) signingIn.current = false;
        }
    }, [abortSignIn, beginSignIn, createSession]);

    const resetPassword = useCallback(async (email: string) => {
        const auth = requireAuth();
        await sendPasswordResetEmail(auth, email.trim(), {
            url: `${window.location.origin}/login`,
            handleCodeInApp: false,
        });
    }, []);

    const signOut = useCallback(async () => {
        if (!AUTH_ACTIVE) return;
        signingIn.current = false;
        stopFlight();
        epoch.current += 1;
        commit(NONE_SESSION);
        const auth = getFirebaseAuth();
        if (auth) await fbSignOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE', cache: 'no-store' });
    }, [commit, stopFlight]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        enabled: AUTH_ACTIVE,
        session,
        sessionReady,
        signIn,
        signInWithGoogle,
        resetPassword,
        signOut,
        refreshSession,
        authNotice,
    }), [user, loading, session, sessionReady, signIn, signInWithGoogle, resetPassword, signOut, refreshSession, authNotice]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}

export function useAccess(): {
    state: AccessState;
    accessUntil: number | null;
    plan: SessionInfo['plan'];
    label: string | null;
    endsSoon: boolean;
} {
    const { session, enabled } = useAuth();
    const nowS = useSyncExternalStore(subscribeAccessNow, readAccessNow, readAccessNowServer);
    return useMemo(() => {
        // Demo nic nie pokazuje. Zanim zegar wstanie (SSR i hydratacja), też nie — prerender i klient się zgadzają.
        if (!enabled || nowS == null) {
            return { state: 'unknown', accessUntil: session.accessUntil, plan: session.plan, label: null, endsSoon: false };
        }
        return {
            state: accessState(session, nowS),
            accessUntil: session.accessUntil,
            plan: session.plan,
            label: accessLabel(session, nowS),
            endsSoon: endsSoon(session, nowS),
        };
    }, [session, enabled, nowS]);
}
