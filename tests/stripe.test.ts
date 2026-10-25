import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ADMIN_UNTIL } from '@/lib/auth/grant';
import { PLANS } from '@/lib/access';
import { docLegacy, fromStored } from '@/lib/data-seal';
import {
    addCalendarMonths,
    checkoutBody,
    checkoutFollowUpKey,
    checkoutIdempotencyKey,
    classifySession,
    claimsCover,
    extendAccess,
    freshToken,
    isStripeCheckoutUrl,
    livemodeMatches,
    paymentsEnabled,
    readPaidSession,
    safeCheckoutOrigin,
    stripeSecret,
    verifyStripeSignature,
    withdrawalNote,
    type PaidSession,
} from '@/lib/stripe/billing';

const KEY = randomBytes(32).toString('base64');
const h = vi.hoisted(() => {
    const store = new Map<string, Record<string, unknown>>();
    const users = new Map<string, { email?: string | null; customClaims?: Record<string, unknown> }>();
    const docRef = (c: string, d: string) => ({
        path: `${c}/${d}`,
        id: d,
        get: async () => snap(`${c}/${d}`),
        set: async (data: Record<string, unknown>) => { store.set(`${c}/${d}`, data); },
    });
    const snap = (path: string) => {
        const data = store.get(path);
        return { exists: data !== undefined, id: path.split('/')[1], data: () => data };
    };
    const fakeDb = {
        collection: (c: string) => ({ doc: (d: string) => docRef(c, d) }),
        // Jak Firestore: odczyty mają snapshot, zapis wchodzi na końcu, a zmiana przeczytanego dokumentu
        // powtarza callback. `barrier` na teście dwóch sesji zatrzymuje oba commity, aż oba odczytają.
        runTransaction: async <R,>(fn: (tx: {
            get: (ref: { path: string; get: () => Promise<unknown> }) => Promise<unknown>;
            set: (ref: { path: string }, data: Record<string, unknown>) => void;
        }) => Promise<R>) => {
            for (let attempt = 0; attempt < 8; attempt++) {
                const readGen = new Map<string, number>();
                const pending = new Map<string, Record<string, unknown>>();
                const result = await fn({
                    get: async (ref) => {
                        readGen.set(ref.path, version.get(ref.path) ?? 0);
                        return ref.get();
                    },
                    set: (ref, data) => {
                        if (flags.failPayments && ref.path.startsWith('payments/')) throw new Error('firestore-down');
                        if (flags.failHealth && ref.path.startsWith('health/')) throw new Error('health-down');
                        pending.set(ref.path, data);
                    },
                });
                const barrier = flags.barrier;
                if (barrier && attempt === 0) {
                    barrier.arrived += 1;
                    if (barrier.arrived >= barrier.need) barrier.release();
                    await barrier.gate;
                } else {
                    await Promise.resolve();
                }
                let conflict = false;
                for (const [path, gen] of readGen) {
                    if ((version.get(path) ?? 0) !== gen) conflict = true;
                }
                if (conflict) {
                    flags.retries += 1;
                    continue;
                }
                for (const [path, data] of pending) {
                    store.set(path, data);
                    version.set(path, (version.get(path) ?? 0) + 1);
                    events.push('write');
                }
                return result;
            }
            throw new Error('transaction-retries-exceeded');
        },
    };
    const flags = {
        auth: true,
        iat: null as number | null,
        failPayments: false,
        failHealth: false,
        retries: 0,
        barrier: null as null | { gate: Promise<void>; release: () => void; arrived: number; need: number },
    };
    const version = new Map<string, number>();
    const events: string[] = [];
    const fakeAuth = {
        getUser: async (uid: string) => {
            events.push(`auth:${uid}`);
            const user = users.get(uid);
            if (!user) throw Object.assign(new Error('missing'), { code: 'auth/user-not-found' });
            return { uid, email: user.email ?? null, customClaims: user.customClaims ?? {} };
        },
        setCustomUserClaims: async (uid: string, claims: Record<string, unknown>) => {
            const user = users.get(uid) ?? {};
            user.customClaims = claims;
            users.set(uid, user);
        },
        verifySessionCookie: async (cookie: string, checkRevoked?: boolean) => {
            if (checkRevoked !== true) throw Object.assign(new Error('revocation'), { code: 'auth/argument-error' });
            if (cookie !== 'good') throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            return { uid: 'user_1' };
        },
        verifyIdToken: async (token: string, checkRevoked?: boolean) => {
            if (checkRevoked !== true) throw Object.assign(new Error('revocation'), { code: 'auth/argument-error' });
            if (token !== 'fresh') throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            const user = users.get('user_1');
            const now = Math.floor(Date.now() / 1000);
            return {
                uid: 'user_1',
                iat: flags.iat ?? now,
                auth_time: 1,
                email: user?.email ?? 'a@b.pl',
                email_verified: true,
                accessUntil: user?.customClaims?.accessUntil,
                plan: user?.customClaims?.plan,
            };
        },
        createSessionCookie: async (token: string, opts?: { expiresIn?: number }) => {
            if (token !== 'fresh') throw Object.assign(new Error('old'), { code: 'auth/invalid-id-token' });
            if (opts?.expiresIn !== 5 * 24 * 60 * 60 * 1000) throw Object.assign(new Error('ttl'), { code: 'auth/invalid-argument' });
            return 'minted';
        },
    };
    return { store, users, fakeDb, fakeAuth, flags, version, events };
});

vi.mock('@/lib/firebase/admin', () => ({
    getAdminDb: () => (h.flags.auth ? h.fakeDb : null),
    getAdminAuth: () => (h.flags.auth ? h.fakeAuth : null),
}));

const { fulfillPaidSession } = await import('@/lib/stripe/fulfill');
const { readPaymentHealth, recordPaymentEvent } = await import('@/lib/stripe/health');
const { POST: checkoutPost, GET: checkoutGet } = await import('@/app/api/stripe/checkout/route');
const { POST: webhookPost } = await import('@/app/api/stripe/webhook/route');
const { POST: confirmPost } = await import('@/app/api/stripe/confirm/route');
const { POST: sessionPost } = await import('@/app/api/auth/session/route');

const at = (y: number, m: number, d: number, hh = 0, mm = 0, ss = 0) => Math.floor(Date.UTC(y, m - 1, d, hh, mm, ss) / 1000);
const SECRET = 'sk_test_dummy';
const WHSEC = 'whsec_test';
const SESSION = 'cs_test_abc12345';

function paid(over: Partial<PaidSession> = {}): PaidSession {
    return { id: SESSION, uid: 'user_1', plan: 'm1', amount: 1000, currency: 'pln', email: 'a@b.pl', livemode: false, ...over };
}

function sessionObject(over: Record<string, unknown> = {}) {
    return {
        id: SESSION,
        object: 'checkout.session',
        mode: 'payment',
        payment_status: 'paid',
        status: 'complete',
        currency: 'pln',
        amount_subtotal: 1000,
        amount_total: 1000,
        livemode: false,
        client_reference_id: 'user_1',
        customer_email: 'a@b.pl',
        metadata: { uid: 'user_1', plan: 'm1' },
        ...over,
    };
}

function sign(payload: string, secret = WHSEC, t = Math.floor(Date.now() / 1000)) {
    const v1 = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
    return `t=${t},v1=${v1}`;
}

beforeEach(() => {
    h.store.clear();
    h.users.clear();
    h.version.clear();
    h.events.length = 0;
    h.flags.auth = true;
    h.flags.iat = null;
    h.flags.failPayments = false;
    h.flags.failHealth = false;
    h.flags.retries = 0;
    h.flags.barrier = null;
    vi.stubEnv('DATA_ENCRYPTION_KEY', KEY);
    vi.stubEnv('STRIPE_SECRET_KEY', SECRET);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', WHSEC);
    vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('okres i kwota', () => {
    it('miesiące kalendarzowe, z dniem 31 skróconym do końca lutego', () => {
        expect(addCalendarMonths(at(2026, 1, 31), 1)).toBe(at(2026, 2, 28));
        expect(addCalendarMonths(at(2024, 1, 31), 1)).toBe(at(2024, 2, 29));
        expect(addCalendarMonths(at(2026, 8, 31, 15, 30, 1), 6)).toBe(at(2027, 2, 28, 15, 30, 1));
        expect(addCalendarMonths(at(2026, 10, 25, 12), 3)).toBe(at(2027, 1, 25, 12));
        expect(addCalendarMonths(at(2026, 11, 30), 3)).toBe(at(2027, 2, 28));
    });

    it('przedłuża od późniejszej daty; wygasły dostęp od teraz; administrator bez zmian', () => {
        const now = at(2026, 10, 25, 8);
        expect(extendAccess(undefined, now, 1)).toBe(addCalendarMonths(now, 1));
        expect(extendAccess(now - 100, now, 1)).toBe(addCalendarMonths(now, 1));
        const future = at(2026, 12, 1, 8);
        expect(extendAccess(future, now, 3)).toBe(addCalendarMonths(future, 3));
        expect(extendAccess(ADMIN_UNTIL, now, 6)).toBe(ADMIN_UNTIL);
    });

    it('ceny planów w groszach, bez subskrypcji, z niezakodowanym identyfikatorem sesji', () => {
        const body = checkoutBody({ plan: PLANS[0], uid: 'user_1', email: 'a@b.pl', origin: 'https://savori.space', contactEmail: 'a@b.pl' });
        expect(body).toContain('mode=payment');
        expect(body).toContain('%5Bunit_amount%5D=1000');
        expect(body).toContain('%5Bcurrency%5D=pln');
        expect(body).toContain('session_id%3D{CHECKOUT_SESSION_ID}');
        expect(body).toContain(encodeURIComponent('Dostęp od razu po zaksięgowaniu.'));
        expect(withdrawalNote('a@b.pl')).toMatch(/Dostęp od razu po zaksięgowaniu\.$/);
        expect(body).not.toContain('%7BCHECKOUT_SESSION_ID%7D');
        expect(body).not.toMatch(/recurring|subscription/);
        expect(checkoutBody({ plan: PLANS[1], uid: 'u', email: null, origin: 'https://savori.space', contactEmail: '' })).toContain('%5Bunit_amount%5D=2000');
        expect(checkoutBody({ plan: PLANS[2], uid: 'u', email: null, origin: 'https://savori.space', contactEmail: '' })).toContain('%5Bunit_amount%5D=3000');
    });
});

describe('weryfikacja sesji i podpisu', () => {
    const now = 1_700_000_000;

    it('przyjmuje opłaconą sesję w kwocie planu, także z podatkiem doliczonym przez Stripe', () => {
        expect(readPaidSession(sessionObject())?.plan).toBe('m1');
        expect(readPaidSession(sessionObject({ amount_total: 1230 }))?.amount).toBe(1230);
        expect(readPaidSession(sessionObject({ amount_subtotal: 1000, amount_total: 900 }))).toBeNull();
        expect(readPaidSession(sessionObject({ amount_subtotal: 3000, metadata: { uid: 'user_1', plan: 'm1' } }))).toBeNull();
        expect(readPaidSession(sessionObject({ currency: 'eur' }))).toBeNull();
        expect(readPaidSession(sessionObject({ payment_status: 'unpaid' }))).toBeNull();
        expect(classifySession(sessionObject({ payment_status: 'unpaid' })).kind).toBe('pending');
        expect(classifySession(sessionObject({ payment_status: 'unpaid', status: 'open' })).kind).toBe('pending');
        expect(classifySession(sessionObject({ payment_status: 'unpaid', status: 'expired' })).kind).toBe('reject');
        expect(classifySession(sessionObject({ payment_status: 'no_payment_required', status: 'complete' })).kind).toBe('reject');
        expect(readPaidSession(sessionObject({ amount_subtotal: 1000, amount_total: 1107, total_details: { amount_discount: 100 } }))).toBeNull();
        expect(readPaidSession(sessionObject({ amount_total: 1230, total_details: { amount_discount: 0, amount_tax: 230 } }))?.amount).toBe(1230);
        expect(readPaidSession(sessionObject({ mode: 'subscription' }))).toBeNull();
        expect(readPaidSession(sessionObject({ client_reference_id: 'ktoś-inny' }))).toBeNull();
    });

    it('podpis: zgodny przechodzi, podmienione body, zły sekret i stary czas — nie', () => {
        const payload = '{"id":"evt_1"}';
        expect(verifyStripeSignature(payload, sign(payload, WHSEC, now), WHSEC, now)).toBe(true);
        expect(verifyStripeSignature(`${payload} `, sign(payload, WHSEC, now), WHSEC, now)).toBe(false);
        expect(verifyStripeSignature(payload, sign(payload, 'other', now), WHSEC, now)).toBe(false);
        expect(verifyStripeSignature(payload, sign(payload, WHSEC, now - 301), WHSEC, now)).toBe(false);
        expect(verifyStripeSignature(payload, null, WHSEC, now)).toBe(false);
    });

    it('klucz publiczny i sekret webhooka nie służą do tworzenia sesji; adres powrotu tylko na nasze domeny', () => {
        expect(stripeSecret({ STRIPE_SECRET_KEY: 'pk_live_abc' })).toBeNull();
        expect(stripeSecret({ STRIPE_SECRET_KEY: 'whsec_abc' })).toBeNull();
        expect(stripeSecret({ STRIPE_PRIVATE_KEY: 'sk_live_abc' })).toBe('sk_live_abc');
        expect(paymentsEnabled({ STRIPE_SECRET_KEY: SECRET })).toBe(true);
        expect(livemodeMatches(SECRET, false)).toBe(true);
        expect(livemodeMatches(SECRET, true)).toBe(false);
        expect(livemodeMatches('sk_live_x', true)).toBe(true);
        expect(safeCheckoutOrigin('https://evil.example')).toBe('https://savori.space');
        expect(safeCheckoutOrigin('http://savori.space')).toBe('https://savori.space');
        expect(safeCheckoutOrigin('http://localhost:3000')).toBe('http://localhost:3000');
        expect(safeCheckoutOrigin('https://savori-git-x.vercel.app')).toBe('https://savori-git-x.vercel.app');
        expect(isStripeCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_abc')).toBe(true);
        expect(isStripeCheckoutUrl('https://evil.example/checkout.stripe.com')).toBe(false);
        expect(claimsCover(100, 100)).toBe(true);
        expect(claimsCover(50, 100)).toBe(false);
        expect(claimsCover(ADMIN_UNTIL, 100)).toBe(true);
        expect(freshToken(now, now)).toBe(true);
        expect(freshToken(now - 301, now)).toBe(false);
        const minute = Math.floor(now * 1000 / 60_000) * 60_000;
        expect(checkoutIdempotencyKey('user_1', 'm1', minute)).toBe(checkoutIdempotencyKey('user_1', 'm1', minute + 59_999));
        expect(checkoutIdempotencyKey('user_1', 'm1', minute)).not.toBe(checkoutIdempotencyKey('user_1', 'm1', minute + 60_000));
        const follow = checkoutFollowUpKey('x'.repeat(300), 'cs_test_abc12345');
        expect(follow.length).toBe(255);
        expect(follow.endsWith('_cs_test_abc12345')).toBe(true);
    });
});

describe('zaksięgowanie', () => {
    const nowMs = at(2026, 10, 25, 9) * 1000;

    it('zapis jest zaszyfrowany, a druga dostawa tego samego zdarzenia nie dokłada miesięcy', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: at(2026, 10, 20) } });
        const first = await fulfillPaidSession(paid(), nowMs);
        const second = await fulfillPaidSession(paid(), nowMs + 86_400_000);
        expect(second.already).toBe(true);
        expect(second.accessUntil).toBe(first.accessUntil);
        expect(h.users.get('user_1')?.customClaims).toMatchObject({ plan: 'm1', accessUntil: first.accessUntil });
        const path = `payments/${SESSION}`;
        const doc = h.store.get(path);
        expect(doc?.sealed).toBeInstanceOf(Uint8Array);
        expect(Buffer.from(doc!.sealed as Uint8Array).includes(Buffer.from('a@b.pl'))).toBe(false);
        const rest = { ...doc };
        delete rest.sealed;
        expect(JSON.stringify(rest)).not.toContain('a@b.pl');
        expect(fromStored(path, doc, docLegacy.read)?.value).toMatchObject({ email: 'a@b.pl' });
        const accessPath = 'savori_access/user_1';
        const accessDoc = h.store.get(accessPath);
        expect(accessDoc?.sealed).toBeInstanceOf(Uint8Array);
        expect(Buffer.from(accessDoc!.sealed as Uint8Array).includes(Buffer.from('a@b.pl'))).toBe(false);
        expect(fromStored(accessPath, accessDoc, docLegacy.read)?.value).toMatchObject({ accessUntil: first.accessUntil, plan: 'm1' });
    });

    it('aktywny dostęp wydłuża od jego końca, a administrator zostaje administratorem', async () => {
        const future = at(2026, 12, 1, 9);
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'm1', accessUntil: future } });
        const extended = await fulfillPaidSession(paid({ plan: 'm3', amount: 2000 }), nowMs);
        expect(extended.accessUntil).toBe(addCalendarMonths(future, 3));

        h.store.clear();
        h.version.clear();
        h.users.set('admin_1', { email: 'a@b.pl', customClaims: { plan: 'm6', accessUntil: ADMIN_UNTIL } });
        const adminId = 'cs_test_admin1234';
        const adminPaid = paid({ id: adminId, uid: 'admin_1' });
        const granted = await fulfillPaidSession(adminPaid, nowMs);
        const commercial = addCalendarMonths(Math.floor(nowMs / 1000), 1);
        expect(granted.accessUntil).toBe(commercial);
        expect(h.users.get('admin_1')?.customClaims).toEqual({ plan: 'm6', accessUntil: ADMIN_UNTIL });
        const replay = await fulfillPaidSession(adminPaid, nowMs + 86_400_000);
        expect(replay.already).toBe(true);
        expect(replay.accessUntil).toBe(commercial);
        expect(h.users.get('admin_1')?.customClaims).toEqual({ plan: 'm6', accessUntil: ADMIN_UNTIL });
        const doc = h.store.get(`payments/${adminId}`);
        expect(Buffer.from(doc!.sealed as Uint8Array).includes(Buffer.from('a@b.pl'))).toBe(false);
        expect(fromStored(`payments/${adminId}`, doc, docLegacy.read)?.value).toMatchObject({ accessUntil: commercial });
        expect(fromStored('savori_access/admin_1', h.store.get('savori_access/admin_1'), docLegacy.read)?.value).toMatchObject({ accessUntil: commercial });
        expect(h.users.get('admin_1')?.customClaims?.accessUntil).toBe(ADMIN_UNTIL);
    });

    it('dwie sesje jednego konta sumują miesiące, gdy oba odczyty Auth są przed zapisem', async () => {
        const future = at(2026, 12, 1, 9);
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'm1', accessUntil: future } });
        let release!: () => void;
        const gate = new Promise<void>((resolve) => { release = resolve; });
        h.flags.barrier = { gate, release, arrived: 0, need: 2 };

        const [a, b] = await Promise.all([
            fulfillPaidSession(paid({ id: 'cs_test_one111111' }), nowMs),
            fulfillPaidSession(paid({ id: 'cs_test_two222222', plan: 'm3', amount: 2000 }), nowMs),
        ]);

        const stacked = addCalendarMonths(addCalendarMonths(future, 1), 3);
        expect(addCalendarMonths(addCalendarMonths(future, 3), 1)).toBe(stacked);
        const short = Math.min(a.accessUntil, b.accessUntil);
        expect([addCalendarMonths(future, 1), addCalendarMonths(future, 3)]).toContain(short);
        expect(Math.max(a.accessUntil, b.accessUntil)).toBe(stacked);
        expect(a.already).toBe(false);
        expect(b.already).toBe(false);
        expect(h.flags.retries).toBeGreaterThan(0);
        const firstWrite = h.events.indexOf('write');
        expect(h.events.slice(0, firstWrite).filter((e) => e.startsWith('auth:'))).toHaveLength(2);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(stacked);
        const access = fromStored('savori_access/user_1', h.store.get('savori_access/user_1'), docLegacy.read)?.value as { accessUntil?: number; plan?: string } | undefined;
        expect(access?.accessUntil).toBe(stacked);
        expect(h.users.get('user_1')?.customClaims?.plan).toBe(access?.plan);
        expect(Buffer.from(h.store.get('savori_access/user_1')!.sealed as Uint8Array).includes(Buffer.from('a@b.pl'))).toBe(false);

        const replay = await fulfillPaidSession(paid({ id: 'cs_test_one111111' }), nowMs + 86_400_000);
        expect(replay.already).toBe(true);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(stacked);
        expect((fromStored('savori_access/user_1', h.store.get('savori_access/user_1'), docLegacy.read)?.value as { accessUntil?: number } | undefined)?.accessUntil).toBe(stacked);
    });
});

describe('trasy', () => {
    it('checkout: bez origin 403, bez ciasteczka 401, z sesją zwraca wyłącznie adres Stripe', async () => {
        const seen: { url?: string; body?: string; auth?: string; key?: string; redirect?: RequestRedirect; signal?: AbortSignal | null } = {};
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            seen.url = url;
            seen.body = String(init.body);
            const headers = new Headers(init.headers);
            seen.auth = headers.get('authorization') ?? '';
            seen.key = headers.get('idempotency-key') ?? '';
            seen.redirect = init.redirect;
            seen.signal = init.signal;
            return new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/pay/cs_test_abc12345' }), { status: 200 });
        }));
        h.users.set('user_1', { email: 'a@b.pl', customClaims: {} });

        const foreign = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{"plan":"m1"}',
        });
        expect((await checkoutPost(foreign)).status).toBe(403);

        const anon = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST', headers: { origin: 'https://savori.space', 'content-type': 'application/json' }, body: '{"plan":"m1"}',
        });
        expect((await checkoutPost(anon)).status).toBe(401);
        expect(seen.url).toBeUndefined();

        const ok = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: '{"plan":"m1","uid":"attacker"}',
        });
        const res = await checkoutPost(ok);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_abc12345' });
        expect(seen.url).toBe('https://api.stripe.com/v1/checkout/sessions');
        expect(seen.body).toContain('%5Bunit_amount%5D=1000');
        expect(seen.body).toContain('session_id%3D{CHECKOUT_SESSION_ID}');
        expect(seen.body).toContain('metadata%5Buid%5D=user_1');
        expect(seen.body).not.toContain('attacker');
        expect(seen.body).not.toMatch(/recurring|subscription/);
        expect(seen.auth).toBe(`Bearer ${SECRET}`);
        expect(seen.key).toMatch(/^savori_m1_\d+_user_1$/);
        expect(seen.redirect).toBe('manual');
        expect(seen.signal).toBeInstanceOf(AbortSignal);
        const enabled = await checkoutGet();
        expect(enabled.status).toBe(200);
        expect(await enabled.json()).toEqual({ enabled: true });
    });

    it('webhook bez podpisu nie nadaje dostępu; z podpisem nadaje raz', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: {} });
        const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: sessionObject() } });
        const bad = new NextRequest('https://savori.space/api/stripe/webhook', {
            method: 'POST', headers: { 'stripe-signature': 't=1,v1=aaaa' }, body: payload,
        });
        expect((await webhookPost(bad)).status).toBe(400);
        expect(h.users.get('user_1')?.customClaims).toEqual({});

        const good = new NextRequest('https://savori.space/api/stripe/webhook', {
            method: 'POST', headers: { 'stripe-signature': sign(payload) }, body: payload,
        });
        expect((await webhookPost(good)).status).toBe(200);
        const until = h.users.get('user_1')?.customClaims?.accessUntil;
        expect(typeof until).toBe('number');
        const again = new NextRequest('https://savori.space/api/stripe/webhook', {
            method: 'POST', headers: { 'stripe-signature': sign(payload) }, body: payload,
        });
        expect((await webhookPost(again)).status).toBe(200);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(until);
        const health = await readPaymentHealth();
        expect(health?.counts.ok).toBe(1);
        expect(health?.counts.already).toBe(1);
        expect(health?.counts['bad-signature']).toBe(1);
        expect(health?.last?.kind).toBe('already');
        expect(health?.lastOk?.sessionId).toBe(SESSION);
    });

    it('confirm najpierw prosi o świeży token, potem wystawia ciasteczko', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: 1 } });
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(sessionObject()), { status: 200 })));
        const call = () => new NextRequest('https://savori.space/api/stripe/confirm', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: JSON.stringify({ sessionId: SESSION, idToken: 'fresh' }),
        });
        const first = await confirmPost(call());
        expect(await first.json()).toEqual({ refresh: true });
        expect(first.cookies.get('__session')).toBeUndefined();
        const second = await confirmPost(call());
        expect((await second.json()).ok).toBe(true);
        expect(second.cookies.get('__session')?.value).toBe('minted');
        expect(second.cookies.get('__session')?.httpOnly).toBe(true);
    });

    it('checkout bez Firebase: brak ciasteczka to 401, ciasteczko bez serwera to 501', async () => {
        h.flags.auth = false;
        const anon = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST', headers: { origin: 'https://savori.space', 'content-type': 'application/json' }, body: '{"plan":"m1"}',
        });
        expect((await checkoutPost(anon)).status).toBe(401);
        const withCookie = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: '{"plan":"m1"}',
        });
        expect((await checkoutPost(withCookie)).status).toBe(501);
    });

    it('obcy adres Stripe nie wychodzi do przeglądarki', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: {} });
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ url: 'https://evil.example/pay', livemode: false }), { status: 200 })));
        const req = new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: '{"plan":"m1"}',
        });
        const res = await checkoutPost(req);
        expect(res.status).toBe(502);
        expect(JSON.stringify(await res.json())).not.toContain('evil.example');
    });

    async function postWebhook(object: Record<string, unknown>, type = 'checkout.session.completed') {
        const payload = JSON.stringify({ id: 'evt_x', type, data: { object } });
        const res = await webhookPost(new NextRequest('https://savori.space/api/stripe/webhook', {
            method: 'POST',
            headers: { 'stripe-signature': sign(payload), origin: 'https://evil.example' },
            body: payload,
        }));
        return { status: res.status, json: await res.json() as { pending?: boolean; ignored?: boolean; received?: boolean } };
    }

    it('webhook: nieopłacone, zła kwota, podatek, brak konta, zły tryb', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: 5 } });
        const pending = await postWebhook(sessionObject({ payment_status: 'unpaid', status: 'complete' }));
        expect(pending.status).toBe(200);
        expect(pending.json.pending).toBe(true);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);

        const low = await postWebhook(sessionObject({ id: 'cs_test_lowamount1', amount_subtotal: 100, amount_total: 100 }));
        expect(low.status).toBe(200);
        expect(low.json.ignored).toBe(true);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);

        const taxedDown = await postWebhook(sessionObject({ id: 'cs_test_taxdown01', amount_subtotal: 1000, amount_total: 900 }));
        expect(taxedDown.json.ignored).toBe(true);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);

        const missing = await postWebhook(sessionObject({
            id: 'cs_test_missing01',
            client_reference_id: 'ghost_user',
            metadata: { uid: 'ghost_user', plan: 'm1' },
        }));
        expect(missing.status).toBe(200);
        expect(missing.json.ignored).toBe(true);
        expect(h.users.has('ghost_user')).toBe(false);

        const mode = await postWebhook(sessionObject({ id: 'cs_test_livemode1', livemode: true }));
        expect(mode.status).toBe(200);
        expect(mode.json.ignored).toBe(true);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);

        const tax = await postWebhook(sessionObject({ id: 'cs_test_withtax01', amount_subtotal: 1000, amount_total: 1230 }), 'checkout.session.async_payment_succeeded');
        expect(tax.status).toBe(200);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).not.toBe(5);
    });

    it('confirm nie księguje cudzej sesji; logowanie nadal wymaga świeżego auth_time', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: 10 } });
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(sessionObject({
            metadata: { uid: 'other_user', plan: 'm1' },
            client_reference_id: 'other_user',
        })), { status: 200 })));
        const foreign = await confirmPost(new NextRequest('https://savori.space/api/stripe/confirm', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: JSON.stringify({ sessionId: SESSION, idToken: 'fresh' }),
        }));
        expect(foreign.status).toBe(403);
        expect(h.store.size).toBe(0);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(10);

        const login = await sessionPost(new NextRequest('https://savori.space/api/auth/session', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json' },
            body: JSON.stringify({ idToken: 'fresh' }),
        }));
        expect(login.status).toBe(401);
        expect(await login.json()).toEqual({ error: 'recent-sign-in-required' });
    });

    it('klient cennika nie importuje billing.ts', () => {
        const src = readFileSync('src/components/landing/LandingClient.tsx', 'utf8');
        expect(src).not.toMatch(/stripe\/billing|node:crypto/);
        expect(src).toContain("from '@/lib/stripe/ids'");
    });

    it('confirm wygasłej sesji zwraca 400 rejected', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: 10 } });
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(sessionObject({
            status: 'expired',
            payment_status: 'unpaid',
        })), { status: 200 })));
        const res = await confirmPost(new NextRequest('https://savori.space/api/stripe/confirm', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: JSON.stringify({ sessionId: SESSION, idToken: 'fresh' }),
        }));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'rejected' });
        expect(h.store.size).toBe(0);
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(10);
    });

    it('ukończona sesja z cache idempotencji nie jest używana drugi raz', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: {} });
        const now = 1_762_000_000_000;
        vi.spyOn(Date, 'now').mockReturnValue(now);
        const keys: string[] = [];
        const signals: Array<AbortSignal | null | undefined> = [];
        const done = 'cs_test_done12345';
        const fresh = 'cs_test_new123456';
        vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
            const key = new Headers(init.headers).get('idempotency-key') ?? '';
            keys.push(key);
            signals.push(init.signal);
            const completed = keys.length === 1;
            const id = completed ? done : fresh;
            return new Response(JSON.stringify({
                id,
                status: completed ? 'complete' : 'open',
                url: `https://checkout.stripe.com/c/pay/${id}`,
                livemode: false,
            }), { status: 200 });
        }));
        const res = await checkoutPost(new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: '{"plan":"m1"}',
        }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ url: `https://checkout.stripe.com/c/pay/${fresh}` });
        expect(keys).toHaveLength(2);
        expect(keys[0]).toBe(checkoutIdempotencyKey('user_1', 'm1', now));
        expect(keys[1]).toBe(checkoutFollowUpKey(keys[0], done));
        expect(signals[0]).toBeInstanceOf(AbortSignal);
        expect(signals[1]).toBeInstanceOf(AbortSignal);
    });

    it('przerwanie wywołania Stripe wraca 502', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: {} });
        vi.stubGlobal('fetch', vi.fn(async () => {
            throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
        }));
        const res = await checkoutPost(new NextRequest('https://savori.space/api/stripe/checkout', {
            method: 'POST',
            headers: { origin: 'https://savori.space', 'content-type': 'application/json', cookie: '__session=good' },
            body: '{"plan":"m1"}',
        }));
        expect(res.status).toBe(502);
        expect(await res.json()).toEqual({ error: 'stripe-unreachable' });
    });
});

function logged(): string {
    return vi.mocked(console.error).mock.calls.map((c) => c.map(String).join(' ')).join('\n');
}

describe('dziennik webhooka', () => {
    it('liczy zdarzenia i pamięta ostatnie udane księgowanie', async () => {
        await recordPaymentEvent({ at: '2026-10-25T09:00:00.000Z', kind: 'ok', sessionId: SESSION, eventType: 'checkout.session.completed' });
        await recordPaymentEvent({ at: '2026-10-25T09:05:00.000Z', kind: 'failed', sessionId: SESSION, eventType: 'checkout.session.completed' });
        const health = await readPaymentHealth();
        expect(health?.counts.ok).toBe(1);
        expect(health?.counts.failed).toBe(1);
        expect(health?.last).toMatchObject({ kind: 'failed', at: '2026-10-25T09:05:00.000Z' });
        expect(health?.lastOk).toEqual({ at: '2026-10-25T09:00:00.000Z', sessionId: SESSION });
        const raw = JSON.stringify(h.store.get('health/stripe_webhook'), (k, v) => (k === 'sealed' ? undefined : v));
        expect(raw).not.toContain('a@b.pl');
    });

    it('zdarzenia bez podpisu zapisuje najwyżej raz na 10 min; podpisane bez limitu', async () => {
        await recordPaymentEvent({ at: '2026-10-25T09:00:00.000Z', kind: 'bad-signature' });
        await recordPaymentEvent({ at: '2026-10-25T09:04:00.000Z', kind: 'bad-signature' });
        expect((await readPaymentHealth())?.counts['bad-signature']).toBe(1);
        await recordPaymentEvent({ at: '2026-10-25T09:10:00.000Z', kind: 'bad-signature' });
        expect((await readPaymentHealth())?.counts['bad-signature']).toBe(2);
        // Inny rodzaj przerywa serię — zły sekret po poprawnym księgowaniu widać od razu.
        await recordPaymentEvent({ at: '2026-10-25T09:11:00.000Z', kind: 'ok', sessionId: SESSION });
        await recordPaymentEvent({ at: '2026-10-25T09:12:00.000Z', kind: 'bad-signature' });
        expect((await readPaymentHealth())?.counts['bad-signature']).toBe(3);
        await recordPaymentEvent({ at: '2026-10-25T09:12:30.000Z', kind: 'ignored' });
        await recordPaymentEvent({ at: '2026-10-25T09:12:40.000Z', kind: 'ignored' });
        expect((await readPaymentHealth())?.counts.ignored).toBe(2);
    });

    it('za duże body → 413 bez śladu w dzienniku', async () => {
        vi.stubEnv('STRIPE_SECRET_KEY', SECRET);
        vi.stubEnv('STRIPE_WEBHOOK_SECRET', WHSEC);
        const res = await webhookPost(new NextRequest('https://savori.space/api/stripe/webhook', { method: 'POST', body: 'x'.repeat(200_001) }));
        expect(res.status).toBe(413);
        expect(await readPaymentHealth()).toEqual(expect.objectContaining({ last: null }));
    });

    it('bez Firestore zapis zdrowia nic nie robi', async () => {
        h.flags.auth = false;
        await expect(recordPaymentEvent({ at: '2026-10-25T00:00:00.000Z', kind: 'ok', sessionId: SESSION })).resolves.toBeUndefined();
        expect(await readPaymentHealth()).toBeNull();
    });

    async function post(payload: string, signature: string | null) {
        const headers: Record<string, string> = {};
        if (signature) headers['stripe-signature'] = signature;
        const res = await webhookPost(new NextRequest('https://savori.space/api/stripe/webhook', { method: 'POST', headers, body: payload }));
        return { status: res.status, json: await res.json() };
    }

    it('brak sekretu, zły podpis, wygasła sesja i błąd Firestore zostawiają ślad', async () => {
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'trial', accessUntil: 5 } });
        const body = JSON.stringify({ id: 'evt_nosecret', type: 'checkout.session.completed', data: { object: sessionObject() } });
        vi.stubEnv('STRIPE_SECRET_KEY', '');
        vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
        const missing = await post(body, null);
        expect(missing.status).toBe(501);
        expect(missing.json).toEqual({ error: 'stripe-not-configured' });
        expect((await readPaymentHealth())?.last?.kind).toBe('not-configured');
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);
        expect(logged()).toContain('stripe-not-configured');
        expect(logged()).toContain('evt_nosecret');
        expect(logged()).not.toContain('a@b.pl');

        vi.stubEnv('STRIPE_SECRET_KEY', SECRET);
        vi.stubEnv('STRIPE_WEBHOOK_SECRET', WHSEC);
        const badPayload = JSON.stringify({ id: 'evt_bad1', type: 'checkout.session.completed', data: { object: sessionObject() } });
        const bad = await post(badPayload, 't=1,v1=deadbeef');
        expect(bad.status).toBe(400);
        expect(bad.json).toEqual({ error: 'bad-signature' });
        expect((await readPaymentHealth())?.last).toMatchObject({ kind: 'bad-signature', sessionId: SESSION, eventType: 'checkout.session.completed' });
        expect(logged()).toContain('bad-signature event=evt_bad1 session=cs_test_abc12345');
        expect(logged()).not.toContain('a@b.pl');
        expect(logged()).not.toContain('customer_email');

        h.flags.failHealth = true;
        const still = await post(badPayload, 't=1,v1=deadbeef');
        expect(still.status).toBe(400);
        expect(still.json).toEqual({ error: 'bad-signature' });
        h.flags.failHealth = false;

        const expiredPayload = JSON.stringify({
            id: 'evt_expired1',
            type: 'checkout.session.expired',
            data: { object: { id: 'cs_test_expired01', object: 'checkout.session', status: 'expired', payment_status: 'unpaid', customer_email: 'a@b.pl' } },
        });
        const expired = await post(expiredPayload, sign(expiredPayload));
        expect(expired.status).toBe(200);
        expect(expired.json).toEqual({ received: true });
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);
        expect(h.store.has('payments/cs_test_expired01')).toBe(false);
        expect((await readPaymentHealth())?.last).toMatchObject({
            kind: 'ignored',
            sessionId: 'cs_test_expired01',
            eventType: 'checkout.session.expired',
        });
        expect(logged()).not.toContain('a@b.pl');

        h.flags.failPayments = true;
        const paidPayload = JSON.stringify({ id: 'evt_fail1', type: 'checkout.session.completed', data: { object: sessionObject() } });
        const failed = await post(paidPayload, sign(paidPayload));
        expect(failed.status).toBe(500);
        expect(failed.json).toEqual({ error: 'fulfill-failed' });
        expect(h.users.get('user_1')?.customClaims?.accessUntil).toBe(5);
        expect(h.store.has(`payments/${SESSION}`)).toBe(false);
        expect((await readPaymentHealth())?.last).toMatchObject({ kind: 'failed', sessionId: SESSION });
        expect(logged()).toContain('fulfill-failed event=evt_fail1 session=cs_test_abc12345');
        expect(logged()).not.toContain('a@b.pl');
    });
});
