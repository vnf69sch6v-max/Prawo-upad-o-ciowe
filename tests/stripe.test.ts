import { createHmac, randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ADMIN_UNTIL } from '@/lib/auth/grant';
import { PLANS } from '@/lib/access';
import {
    addCalendarMonths,
    checkoutBody,
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
        runTransaction: async <R,>(fn: (tx: { get: (ref: { get: () => Promise<unknown> }) => Promise<unknown>; set: (ref: { set: (d: Record<string, unknown>) => Promise<void> }, data: Record<string, unknown>) => Promise<void> }) => Promise<R>) =>
            fn({
                get: (ref) => ref.get(),
                set: (ref, data) => ref.set(data),
            }),
    };
    const fakeAuth = {
        getUser: async (uid: string) => {
            const user = users.get(uid);
            if (!user) throw Object.assign(new Error('missing'), { code: 'auth/user-not-found' });
            return { uid, email: user.email ?? null, customClaims: user.customClaims ?? {} };
        },
        setCustomUserClaims: async (uid: string, claims: Record<string, unknown>) => {
            const user = users.get(uid) ?? {};
            user.customClaims = claims;
            users.set(uid, user);
        },
        verifySessionCookie: async (cookie: string) => {
            if (cookie !== 'good') throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            return { uid: 'user_1' };
        },
        verifyIdToken: async (token: string) => {
            if (token !== 'fresh') throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            const user = users.get('user_1');
            return { uid: 'user_1', iat: Math.floor(Date.now() / 1000), accessUntil: user?.customClaims?.accessUntil, plan: user?.customClaims?.plan };
        },
        createSessionCookie: async (token: string) => {
            if (token !== 'fresh') throw Object.assign(new Error('old'), { code: 'auth/invalid-id-token' });
            return 'minted';
        },
    };
    return { store, users, fakeDb, fakeAuth };
});

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: () => h.fakeDb, getAdminAuth: () => h.fakeAuth }));

const { fulfillPaidSession } = await import('@/lib/stripe/fulfill');
const { POST: checkoutPost, GET: checkoutGet } = await import('@/app/api/stripe/checkout/route');
const { POST: webhookPost } = await import('@/app/api/stripe/webhook/route');
const { POST: confirmPost } = await import('@/app/api/stripe/confirm/route');

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
        const raw = JSON.stringify(h.store.get(`payments/${SESSION}`), (k, v) => (k === 'sealed' || k === 'updatedAt' ? undefined : v));
        expect(raw).not.toContain('a@b.pl');
        expect(h.store.get(`payments/${SESSION}`)?.sealed).toBeInstanceOf(Uint8Array);
    });

    it('aktywny dostęp wydłuża od jego końca, a administrator zostaje administratorem', async () => {
        const future = at(2026, 12, 1, 9);
        h.users.set('user_1', { email: 'a@b.pl', customClaims: { plan: 'm1', accessUntil: future } });
        const extended = await fulfillPaidSession(paid({ plan: 'm3', amount: 2000 }), nowMs);
        expect(extended.accessUntil).toBe(addCalendarMonths(future, 3));

        h.store.clear();
        h.users.set('admin_1', { email: 'a@b.pl', customClaims: { plan: 'm6', accessUntil: ADMIN_UNTIL } });
        await fulfillPaidSession(paid({ id: 'cs_test_admin1234', uid: 'admin_1' }), nowMs);
        expect(h.users.get('admin_1')?.customClaims).toMatchObject({ plan: 'm6', accessUntil: ADMIN_UNTIL });
    });
});

describe('trasy', () => {
    it('checkout: bez origin 403, bez ciasteczka 401, z sesją zwraca wyłącznie adres Stripe', async () => {
        const seen: { url?: string; body?: string; auth?: string } = {};
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            seen.url = url;
            seen.body = String(init.body);
            seen.auth = new Headers(init.headers).get('authorization') ?? '';
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
            body: '{"plan":"m1"}',
        });
        const res = await checkoutPost(ok);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_abc12345' });
        expect(seen.url).toBe('https://api.stripe.com/v1/checkout/sessions');
        expect(seen.body).toContain('%5Bunit_amount%5D=1000');
        expect(seen.body).toContain('session_id%3D{CHECKOUT_SESSION_ID}');
        expect(seen.auth).toBe(`Bearer ${SECRET}`);
        expect((await checkoutGet()).status).toBe(200);
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
    });
});
