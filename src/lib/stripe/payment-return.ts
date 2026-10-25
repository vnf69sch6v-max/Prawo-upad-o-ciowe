// Silnik powrotu ze Stripe. Bez Reacta i bez `window` — zegar, pamięć i ścieżka powrotu wchodzą
// w `deps`, więc `reduce` da się przejść testem zdarzenie po zdarzeniu (tests/payment-return.test.ts).
// Opóźnienia (4 s, 700 ms, 1,5 s) nie są tu odliczane: reducer zwraca efekt `wait` / `redirect`,
// a UI uruchamia timer. Dlatego testy nie potrzebują fałszywego zegara.
//
// `now` jest zegarem klienta (ms), tym samym, którego UI użyje przy porównaniach. Przejścia
// zależą od liczników odpowiedzi, nie od upływu czasu.

import { isCheckoutSessionId } from '@/lib/stripe/ids';

export const CHECKOUT_PLAN_KEY = 'savori.checkoutPlan';
export const CHECKOUT_RETURN_KEY = 'savori.checkoutReturn';
/** Id sesji Checkout, gdy po przeładowaniu zniknie `session_id` z adresu. */
export const CHECKOUT_SESSION_KEY = 'savori.checkoutSession';

const POLL_LIMIT = 45;
const POLL_MS = 4000;
const REFRESH_LIMIT = 5;
const REFRESH_MS = 700;
const OK_DELAY_MS = 1500;
const SESSION_WAIT_LIMIT = 3;
const SESSION_WAIT_MS = 1000;

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/** Liczniki niosą fazy „w toku”, bo tick wraca do tej samej maszyny i musi pamiętać, ile już było. */
interface Track {
    /** Ile razy serwer odpowiedział `{ refresh: true }`. */
    attempt: number;
    /** Ile razy serwer odpowiedział `{ pending: true }`. */
    polls: number;
    /** Ile razy dostaliśmy 401 (ciasteczko jeszcze nie doszło). */
    waits: number;
}

const ZERO: Track = { attempt: 0, polls: 0, waits: 0 };

export type ErrorCode =
    | 'network'
    | 'forbidden'
    | 'rejected'
    | 'timeout'
    | 'pendingTimeout'
    | 'server'
    | 'disabled';

export type Phase =
    | { kind: 'idle' }
    | { kind: 'cancelled' }
    | { kind: 'badId' }
    | { kind: 'signedOut' }
    | ({ kind: 'waitingSession' } & Track)
    | ({ kind: 'confirming' } & Track)
    | ({ kind: 'pending' } & Track)
    | { kind: 'ok'; accessUntil: number | null; redirectTo: string }
    | { kind: 'error'; code: ErrorCode; retry: boolean };

export interface ConfirmBody {
    ok?: boolean;
    refresh?: boolean;
    pending?: boolean;
    accessUntil?: number;
    error?: string;
}

export type Event =
    | { type: 'boot'; search: string; signedIn: boolean; sessionReady: boolean }
    | { type: 'response'; status: number; body: ConfirmBody }
    | { type: 'throw' }
    | { type: 'tick' }
    | { type: 'retry' };

export type Effect =
    | { kind: 'none' }
    | { kind: 'confirm'; forceToken: boolean }
    | { kind: 'wait'; ms: number }
    | { kind: 'redirect'; to: string; afterMs: number }
    | { kind: 'rewriteFrom' };

export interface ReduceDeps {
    /** Zegar klienta w ms. Przejścia go nie czytają — opóźnienia wychodzą jako efekt. */
    now: number;
    storage: StorageLike | null;
    /** Dokąd wrócić po płatności. `null` albo `''` → strona główna. */
    returnPath: (from: string | null) => string | null;
    pollLimit?: number;
    pollMs?: number;
    refreshLimit?: number;
    refreshMs?: number;
    okDelayMs?: number;
    sessionWaitLimit?: number;
    sessionWaitMs?: number;
}

export interface ReduceResult {
    phase: Phase;
    effect: Effect;
}

const NONE: Effect = { kind: 'none' };

export function readSearch(search: string): { flag: 'ok' | 'anulowana' | null; sessionId: string | null } {
    const raw = search.startsWith('?') ? search.slice(1) : search;
    const params = new URLSearchParams(raw.split('#')[0] ?? '');
    const flagRaw = params.get('platnosc');
    const flag = flagRaw === 'ok' || flagRaw === 'anulowana' ? flagRaw : null;
    return { flag, sessionId: params.get('session_id') };
}

/** Zapis id sesji. Każdy dostęp do pamięci w `try` — tryb prywatny nie może wywalić powrotu. */
export function rememberSession(storage: StorageLike | null, id: string): void {
    if (!isCheckoutSessionId(id)) return;
    try {
        storage?.setItem(CHECKOUT_SESSION_KEY, id);
    } catch {
        /* tryb prywatny albo pełna pamięć — id zostaje w adresie */
    }
}

function readStoredSession(storage: StorageLike | null): string | null {
    try {
        const value = storage?.getItem(CHECKOUT_SESSION_KEY) ?? null;
        return isCheckoutSessionId(value) ? value : null;
    } catch {
        return null;
    }
}

/**
 * Id z query. Pusty albo nieobecny parametr: id z `savori.checkoutSession` (wznowienie po przeładowaniu).
 * Parametr jest, ale nie wygląda na sesję Checkout — `null` (nie sięgamy do pamięci, żeby zły adres
 * nie podłączył poprzedniej płatności).
 */
export function resolveSessionId(search: string, storage: StorageLike | null): string | null {
    const { sessionId } = readSearch(search);
    if (sessionId != null && sessionId !== '') return isCheckoutSessionId(sessionId) ? sessionId : null;
    return readStoredSession(storage);
}

/** Ścieżka zapamiętana przed płatnością. Czyści trzy klucze. Pamięć, która rzuca, daje `'/'`. */
export function consumeReturn(storage: StorageLike | null, returnPath: (from: string | null) => string | null): string {
    let from: string | null = null;
    let readFailed = false;
    try {
        from = storage?.getItem(CHECKOUT_RETURN_KEY) ?? null;
    } catch {
        readFailed = true;
    }
    for (const key of [CHECKOUT_RETURN_KEY, CHECKOUT_PLAN_KEY, CHECKOUT_SESSION_KEY]) {
        try {
            storage?.removeItem(key);
        } catch {
            /* zostawiamy klucz — i tak schodzimy ze strony płatności */
        }
    }
    if (readFailed) return '/';
    try {
        return returnPath(from) || '/';
    } catch {
        return '/';
    }
}

function limits(deps: ReduceDeps) {
    return {
        pollLimit: deps.pollLimit ?? POLL_LIMIT,
        pollMs: deps.pollMs ?? POLL_MS,
        refreshLimit: deps.refreshLimit ?? REFRESH_LIMIT,
        refreshMs: deps.refreshMs ?? REFRESH_MS,
        okDelayMs: deps.okDelayMs ?? OK_DELAY_MS,
        sessionWaitLimit: deps.sessionWaitLimit ?? SESSION_WAIT_LIMIT,
        sessionWaitMs: deps.sessionWaitMs ?? SESSION_WAIT_MS,
    };
}

function stay(phase: Phase): ReduceResult {
    return { phase, effect: NONE };
}

function trackOf(phase: Phase): Track {
    if (phase.kind === 'confirming' || phase.kind === 'pending' || phase.kind === 'waitingSession') {
        return { attempt: phase.attempt, polls: phase.polls, waits: phase.waits };
    }
    return ZERO;
}

function isLive(phase: Phase): boolean {
    return phase.kind === 'confirming' || phase.kind === 'pending' || phase.kind === 'waitingSession';
}

function confirming(track: Track): Phase {
    return { kind: 'confirming', ...track };
}

function pendingPhase(track: Track): Phase {
    return { kind: 'pending', ...track };
}

function waiting(track: Track): Phase {
    return { kind: 'waitingSession', ...track };
}

function fail(code: ErrorCode, retry: boolean): ReduceResult {
    return { phase: { kind: 'error', code, retry }, effect: NONE };
}

function accessUntilOf(body: ConfirmBody): number | null {
    return typeof body.accessUntil === 'number' && Number.isFinite(body.accessUntil) ? body.accessUntil : null;
}

/**
 * Jedno przejście. `boot` czyta adres i (gdy trzeba) pamięć; `{ ok }` czyści trzy klucze.
 * Poza tym funkcja nie wywołuje sieci ani timera.
 */
export function reduce(phase: Phase, event: Event, deps: ReduceDeps): ReduceResult {
    const lim = limits(deps);

    if (event.type === 'boot') return onBoot(event, deps, lim.sessionWaitMs);
    if (event.type === 'retry') {
        if (phase.kind === 'error' && phase.retry) {
            return { phase: confirming(ZERO), effect: { kind: 'confirm', forceToken: true } };
        }
        return stay(phase);
    }
    if (!isLive(phase)) return stay(phase);

    if (event.type === 'throw') return fail('network', true);
    if (event.type === 'tick') return onTick(phase, lim.sessionWaitLimit);
    if (event.type === 'response') return onResponse(phase, event.status, event.body ?? {}, deps, lim);
    return stay(phase);
}

function onBoot(
    event: Extract<Event, { type: 'boot' }>,
    deps: ReduceDeps,
    sessionWaitMs: number,
): ReduceResult {
    const { flag, sessionId } = readSearch(event.search);
    if (flag === 'anulowana') return { phase: { kind: 'cancelled' }, effect: NONE };
    if (flag !== 'ok') return { phase: { kind: 'idle' }, effect: NONE };

    if (isCheckoutSessionId(sessionId)) rememberSession(deps.storage, sessionId);
    // Brak `session_id` w adresie: to samo id z pamięci (przeładowanie w trakcie potwierdzania).
    const id = resolveSessionId(event.search, deps.storage);
    if (!id) return { phase: { kind: 'badId' }, effect: NONE };

    if (!event.signedIn) return { phase: { kind: 'signedOut' }, effect: { kind: 'rewriteFrom' } };
    if (!event.sessionReady) return { phase: waiting(ZERO), effect: { kind: 'wait', ms: sessionWaitMs } };
    return { phase: confirming(ZERO), effect: { kind: 'confirm', forceToken: true } };
}

function onTick(phase: Phase, sessionWaitLimit: number): ReduceResult {
    if (phase.kind === 'pending') return { phase, effect: { kind: 'confirm', forceToken: false } };
    if (phase.kind === 'confirming') return { phase, effect: { kind: 'confirm', forceToken: true } };
    if (phase.kind === 'waitingSession') {
        // Trzy wejścia w czekanie (limit) — następny tick już nie woła confirm.
        if (phase.waits >= sessionWaitLimit) {
            return { phase: { kind: 'signedOut' }, effect: { kind: 'rewriteFrom' } };
        }
        return { phase: confirming(trackOf(phase)), effect: { kind: 'confirm', forceToken: true } };
    }
    return stay(phase);
}

function onResponse(
    phase: Phase,
    status: number,
    body: ConfirmBody,
    deps: ReduceDeps,
    lim: ReturnType<typeof limits>,
): ReduceResult {
    const track = trackOf(phase);
    if (status === 401) {
        const waits = track.waits + 1;
        if (waits > lim.sessionWaitLimit) {
            return { phase: { kind: 'signedOut' }, effect: { kind: 'rewriteFrom' } };
        }
        return { phase: waiting({ ...track, waits }), effect: { kind: 'wait', ms: lim.sessionWaitMs } };
    }
    if (status === 403) return fail('forbidden', false);
    if (status === 400 || status === 404) return fail('rejected', false);
    if (status === 501) return fail('disabled', false);
    // 409 `user-missing` i 5xx (w tym `fulfill-failed`): płatność po stronie Stripe już może być.
    if (status === 409 || status >= 500) return fail('server', true);
    if (status >= 400 && status < 500) return fail('rejected', false);

    if (body.ok === true) {
        const redirectTo = consumeReturn(deps.storage, deps.returnPath);
        return {
            phase: { kind: 'ok', accessUntil: accessUntilOf(body), redirectTo },
            effect: { kind: 'redirect', to: redirectTo, afterMs: lim.okDelayMs },
        };
    }
    if (body.refresh === true) {
        const attempt = track.attempt + 1;
        if (attempt >= lim.refreshLimit) return fail('timeout', true);
        return {
            phase: confirming({ ...track, attempt, waits: 0 }),
            effect: { kind: 'wait', ms: lim.refreshMs },
        };
    }
    if (body.pending === true) {
        const polls = track.polls + 1;
        if (polls >= lim.pollLimit) return fail('pendingTimeout', true);
        return {
            phase: pendingPhase({ ...track, polls, waits: 0 }),
            effect: { kind: 'wait', ms: lim.pollMs },
        };
    }
    return fail('server', true);
}
