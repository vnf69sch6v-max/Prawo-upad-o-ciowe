import { describe, expect, it } from 'vitest';
import {
    CHECKOUT_PLAN_KEY,
    CHECKOUT_RETURN_KEY,
    CHECKOUT_SESSION_KEY,
    consumeReturn,
    readSearch,
    reduce,
    rememberSession,
    resolveSessionId,
    type Event,
    type Phase,
    type ReduceDeps,
    type StorageLike,
} from '@/lib/stripe/payment-return';

const ID = 'cs_test_abcdefgh';
const OTHER = 'cs_live_zzzzzzzz';
const OK = `?platnosc=ok&session_id=${ID}`;
const IDLE: Phase = { kind: 'idle' };

function memory(): StorageLike {
    const data = new Map<string, string>();
    return {
        getItem: (key) => (data.has(key) ? data.get(key)! : null),
        setItem: (key, value) => { data.set(key, value); },
        removeItem: (key) => { data.delete(key); },
    };
}

function throwing(): StorageLike {
    const boom = (): never => { throw new Error('storage'); };
    return { getItem: boom, setItem: boom, removeItem: boom };
}

function deps(over: Partial<ReduceDeps> = {}): ReduceDeps {
    return { now: 1_700_000_000_000, storage: memory(), returnPath: (from) => from, ...over };
}

function boot(d: ReduceDeps, over: Partial<Extract<Event, { type: 'boot' }>> = {}) {
    return reduce(IDLE, { type: 'boot', search: OK, signedIn: true, sessionReady: true, ...over }, d);
}

const pending = { type: 'response', status: 200, body: { pending: true } } as const;
const refresh = { type: 'response', status: 200, body: { refresh: true } } as const;
const tick = { type: 'tick' } as const;

describe('readSearch i pamięć sesji', () => {
    it('czyta flagę i id, ignoruje resztę adresu', () => {
        expect(readSearch(OK)).toEqual({ flag: 'ok', sessionId: ID });
        expect(readSearch('platnosc=anulowana')).toEqual({ flag: 'anulowana', sessionId: null });
        expect(readSearch('?platnosc=cos')).toEqual({ flag: null, sessionId: null });
        expect(readSearch('')).toEqual({ flag: null, sessionId: null });
    });

    it('rememberSession zapisuje tylko prawdziwe id i przełyka rzucającą pamięć', () => {
        const storage = memory();
        rememberSession(storage, ID);
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBe(ID);
        rememberSession(storage, 'zly');
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBe(ID);
        expect(() => rememberSession(throwing(), ID)).not.toThrow();
        expect(() => rememberSession(null, ID)).not.toThrow();
    });

    it('resolveSessionId: zły parametr nie spada do pamięci, pusty — tak', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_SESSION_KEY, OTHER);
        expect(resolveSessionId(`?session_id=${ID}`, storage)).toBe(ID);
        expect(resolveSessionId('?session_id=zly', storage)).toBeNull();
        expect(resolveSessionId('?platnosc=ok', storage)).toBe(OTHER);
        expect(resolveSessionId('?platnosc=ok&session_id=', storage)).toBe(OTHER);
        expect(resolveSessionId('?platnosc=ok', throwing())).toBeNull();
    });

    it('consumeReturn oddaje ścieżkę, czyści trzy klucze, a rzut daje /', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_RETURN_KEY, '/ceny?x=1');
        storage.setItem(CHECKOUT_PLAN_KEY, '{"plan":"m1"}');
        storage.setItem(CHECKOUT_SESSION_KEY, ID);
        expect(consumeReturn(storage, (from) => from)).toBe('/ceny?x=1');
        expect(storage.getItem(CHECKOUT_RETURN_KEY)).toBeNull();
        expect(storage.getItem(CHECKOUT_PLAN_KEY)).toBeNull();
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBeNull();

        expect(consumeReturn(memory(), () => null)).toBe('/');
        expect(consumeReturn(null, () => null)).toBe('/');
        expect(consumeReturn(throwing(), (from) => from ?? '/ceny')).toBe('/');
        const kept = memory();
        kept.setItem(CHECKOUT_RETURN_KEY, '/rynki');
        expect(consumeReturn(kept, () => { throw new Error('path'); })).toBe('/');
        expect(kept.getItem(CHECKOUT_RETURN_KEY)).toBeNull();
    });
});

describe('kryterium 4 — silnik powrotu', () => {
    it('anulowana nie woła confirm, także gdy pamięć rzuca', () => {
        const d = deps({ storage: throwing() });
        const r = reduce(IDLE, { type: 'boot', search: '?platnosc=anulowana', signedIn: true, sessionReady: true }, d);
        expect(r.phase).toEqual({ kind: 'cancelled' });
        expect(r.effect).toEqual({ kind: 'none' });
        expect(reduce(r.phase, tick, d).effect).toEqual({ kind: 'none' });
        expect(reduce(r.phase, { type: 'response', status: 200, body: { ok: true } }, d).phase.kind).toBe('cancelled');
    });

    it('zły id → badId i zero confirm, nawet gdy w pamięci leży dobre id', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_SESSION_KEY, ID);
        const d = deps({ storage });
        const r = boot(d, { search: '?platnosc=ok&session_id=zly' });
        expect(r.phase).toEqual({ kind: 'badId' });
        expect(r.effect).toEqual({ kind: 'none' });
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBe(ID);
    });

    it('signedIn bez sessionReady nie woła confirm, a boot z sessionReady woła raz', () => {
        const d = deps();
        const waiting = boot(d, { sessionReady: false });
        expect(waiting.phase.kind).toBe('waitingSession');
        expect(waiting.effect).toEqual({ kind: 'wait', ms: 1000 });
        expect(waiting.effect.kind).not.toBe('confirm');

        const ready = reduce(waiting.phase, { type: 'boot', search: OK, signedIn: true, sessionReady: true }, d);
        expect(ready.phase).toMatchObject({ kind: 'confirming', attempt: 0, polls: 0, waits: 0 });
        expect(ready.effect).toEqual({ kind: 'confirm', forceToken: true });
    });

    it('pending, pending, ok — dwa odpytania, redirectTo z pamięci i wyczyszczone klucze', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_RETURN_KEY, '/ceny');
        storage.setItem(CHECKOUT_PLAN_KEY, '{"plan":"m3"}');
        const d = deps({ storage, returnPath: (from) => (from === '/ceny' ? '/ceny' : null) });

        const started = boot(d);
        expect(started.effect).toEqual({ kind: 'confirm', forceToken: true });
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBe(ID);

        const first = reduce(started.phase, pending, d);
        expect(first.phase).toMatchObject({ kind: 'pending', polls: 1 });
        expect(first.effect).toEqual({ kind: 'wait', ms: 4000 });
        const poll1 = reduce(first.phase, tick, d);
        expect(poll1.effect).toEqual({ kind: 'confirm', forceToken: false });

        const second = reduce(poll1.phase, pending, d);
        expect(second.phase).toMatchObject({ kind: 'pending', polls: 2 });
        const poll2 = reduce(second.phase, tick, d);
        expect(poll2.effect).toEqual({ kind: 'confirm', forceToken: false });

        const done = reduce(poll2.phase, { type: 'response', status: 200, body: { ok: true, accessUntil: 1_800_000_000 } }, d);
        expect(done.phase).toEqual({ kind: 'ok', accessUntil: 1_800_000_000, redirectTo: '/ceny' });
        expect(done.effect).toEqual({ kind: 'redirect', to: '/ceny', afterMs: 1500 });
        expect(storage.getItem(CHECKOUT_RETURN_KEY)).toBeNull();
        expect(storage.getItem(CHECKOUT_PLAN_KEY)).toBeNull();
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBeNull();
    });

    it('pending ponad limit → pendingTimeout z retry, a retry znów woła confirm i zeruje licznik', () => {
        const d = deps({ pollLimit: 2 });
        let phase = boot(d).phase;
        const first = reduce(phase, pending, d);
        expect(first.phase).toMatchObject({ kind: 'pending', polls: 1 });
        phase = reduce(first.phase, tick, d).phase;
        const over = reduce(phase, pending, d);
        expect(over.phase).toEqual({ kind: 'error', code: 'pendingTimeout', retry: true });
        expect(over.effect).toEqual({ kind: 'none' });

        const again = reduce(over.phase, { type: 'retry' }, d);
        expect(again.phase).toMatchObject({ kind: 'confirming', attempt: 0, polls: 0, waits: 0 });
        expect(again.effect).toEqual({ kind: 'confirm', forceToken: true });
        // Po resecie pierwszy pending znowu czeka, a nie od razu kończy limit.
        expect(reduce(again.phase, pending, d).phase).toMatchObject({ kind: 'pending', polls: 1 });
    });

    it('domyślnie 45. pending kończy się pendingTimeout', () => {
        const d = deps();
        let phase = boot(d).phase;
        for (let i = 0; i < 44; i++) {
            const step = reduce(phase, pending, d);
            expect(step.phase.kind).toBe('pending');
            expect(step.effect).toEqual({ kind: 'wait', ms: 4000 });
            phase = reduce(step.phase, tick, d).phase;
        }
        const last = reduce(phase, pending, d);
        expect(last.phase).toEqual({ kind: 'error', code: 'pendingTimeout', retry: true });
    });

    it('5 × { refresh } → timeout', () => {
        const d = deps();
        let phase = boot(d).phase;
        let result = reduce(phase, refresh, d);
        for (let i = 0; i < 5; i++) {
            result = reduce(phase, refresh, d);
            if (result.phase.kind === 'error') break;
            expect(result.phase).toMatchObject({ kind: 'confirming' });
            expect(result.effect).toEqual({ kind: 'wait', ms: 700 });
            const next = reduce(result.phase, tick, d);
            expect(next.effect).toEqual({ kind: 'confirm', forceToken: true });
            phase = next.phase;
        }
        expect(result.phase).toEqual({ kind: 'error', code: 'timeout', retry: true });
        const again = reduce(result.phase, { type: 'retry' }, d);
        expect(again.effect).toEqual({ kind: 'confirm', forceToken: true });
    });

    it('401 → waitingSession, po trzech czekaniach signedOut', () => {
        const d = deps();
        let phase = boot(d).phase;
        let result = reduce(phase, { type: 'response', status: 401, body: { error: 'unauthorized' } }, d);
        for (let i = 0; i < 3; i++) {
            result = reduce(phase, { type: 'response', status: 401, body: {} }, d);
            expect(result.phase.kind).toBe('waitingSession');
            expect(result.effect).toEqual({ kind: 'wait', ms: 1000 });
            result = reduce(result.phase, tick, d);
            phase = result.phase;
        }
        expect(result.phase).toEqual({ kind: 'signedOut' });
        expect(result.effect).toEqual({ kind: 'rewriteFrom' });
    });

    it('403 → forbidden bez retry', () => {
        const d = deps();
        const live = boot(d).phase;
        const r = reduce(live, { type: 'response', status: 403, body: { error: 'forbidden' } }, d);
        expect(r.phase).toEqual({ kind: 'error', code: 'forbidden', retry: false });
        expect(r.effect).toEqual({ kind: 'none' });
        expect(reduce(r.phase, { type: 'retry' }, d)).toEqual({ phase: r.phase, effect: { kind: 'none' } });
    });

    it('pamięć rzucająca przy { ok } → redirectTo /', () => {
        const d = deps({ storage: throwing(), returnPath: () => '/ceny' });
        const live = boot(d);
        expect(live.phase.kind).toBe('confirming');
        expect(live.effect).toEqual({ kind: 'confirm', forceToken: true });
        const done = reduce(live.phase, { type: 'response', status: 200, body: { ok: true, accessUntil: 42 } }, d);
        expect(done.phase).toEqual({ kind: 'ok', accessUntil: 42, redirectTo: '/' });
        expect(done.effect).toEqual({ kind: 'redirect', to: '/', afterMs: 1500 });
    });

    it('forceToken true po { refresh }, false przy odpytywaniu pending', () => {
        const d = deps();
        const started = boot(d);
        expect(started.effect).toEqual({ kind: 'confirm', forceToken: true });

        const waited = reduce(started.phase, pending, d);
        const polled = reduce(waited.phase, tick, d);
        expect(polled.effect).toEqual({ kind: 'confirm', forceToken: false });

        const refreshed = reduce(polled.phase, refresh, d);
        expect(refreshed.phase).toMatchObject({ kind: 'confirming', attempt: 1 });
        expect(refreshed.effect).toEqual({ kind: 'wait', ms: 700 });
        expect(reduce(refreshed.phase, tick, d).effect).toEqual({ kind: 'confirm', forceToken: true });
    });
});

describe('wznowienie i wylogowany boot', () => {
    it('boot bez session_id wznawia id z savori.checkoutSession', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_SESSION_KEY, ID);
        const d = deps({ storage });
        const r = boot(d, { search: '?platnosc=ok' });
        expect(r.phase).toMatchObject({ kind: 'confirming', attempt: 0 });
        expect(r.effect).toEqual({ kind: 'confirm', forceToken: true });

        const bare = reduce(IDLE, { type: 'boot', search: '', signedIn: true, sessionReady: true }, d);
        expect(bare.phase).toEqual({ kind: 'idle' });
        expect(bare.effect).toEqual({ kind: 'none' });
    });

    it('wylogowany boot z platnosc=ok daje signedOut i rewriteFrom, bez confirm', () => {
        const d = deps();
        const r = boot(d, { signedIn: false, sessionReady: false });
        expect(r.phase).toEqual({ kind: 'signedOut' });
        expect(r.effect).toEqual({ kind: 'rewriteFrom' });
    });

    it('adres z id nadpisuje zapamiętane id', () => {
        const storage = memory();
        storage.setItem(CHECKOUT_SESSION_KEY, OTHER);
        boot(deps({ storage }), { search: OK });
        expect(storage.getItem(CHECKOUT_SESSION_KEY)).toBe(ID);
    });
});

describe('mapowanie odpowiedzi', () => {
    const d = deps();

    function live(): Phase {
        return boot(d).phase;
    }

    it('400 rejected i livemode-mismatch oraz 404 → rejected', () => {
        for (const body of [{ error: 'rejected' }, { error: 'livemode-mismatch' }, { error: 'bad-request' }, {}]) {
            expect(reduce(live(), { type: 'response', status: 400, body }, d).phase).toEqual({ kind: 'error', code: 'rejected', retry: false });
        }
        expect(reduce(live(), { type: 'response', status: 404, body: { error: 'unknown-session' } }, d).phase)
            .toEqual({ kind: 'error', code: 'rejected', retry: false });
    });

    it('501 → disabled, 5xx i 409 → server z retry, throw → network', () => {
        expect(reduce(live(), { type: 'response', status: 501, body: { error: 'stripe-not-configured' } }, d).phase)
            .toEqual({ kind: 'error', code: 'disabled', retry: false });
        expect(reduce(live(), { type: 'response', status: 500, body: { error: 'fulfill-failed' } }, d).phase)
            .toEqual({ kind: 'error', code: 'server', retry: true });
        expect(reduce(live(), { type: 'response', status: 502, body: { error: 'stripe-unreachable' } }, d).phase)
            .toEqual({ kind: 'error', code: 'server', retry: true });
        expect(reduce(live(), { type: 'response', status: 409, body: { error: 'user-missing' } }, d).phase)
            .toEqual({ kind: 'error', code: 'server', retry: true });
        expect(reduce(live(), { type: 'throw' }, d).phase).toEqual({ kind: 'error', code: 'network', retry: true });
    });

    it('{ ok } bez daty zostawia accessUntil null i spada na / gdy brak ścieżki', () => {
        const done = reduce(live(), { type: 'response', status: 200, body: { ok: true } }, d);
        expect(done.phase).toEqual({ kind: 'ok', accessUntil: null, redirectTo: '/' });
    });

    it('odpowiedź po zakończeniu nie rusza maszyny drugi raz', () => {
        const done = reduce(live(), { type: 'response', status: 200, body: { ok: true, accessUntil: 5 } }, d);
        expect(reduce(done.phase, pending, d).phase.kind).toBe('ok');
        expect(reduce(done.phase, tick, d).effect).toEqual({ kind: 'none' });
    });
});
