import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { trialClaims, trialDays } from '@/lib/access';

const NOW_MS = 1_800_000_000_000;
const NOW_S = 1_800_000_000;
const FIVE_DAYS_S = 5 * 24 * 60 * 60;
const ORIGIN = 'https://savori.space';

const h = vi.hoisted(() => {
    const calls: { name: string; args: unknown[] }[] = [];
    const users = new Map<string, { customClaims?: Record<string, unknown> }>();
    const tokens = new Map<string, Record<string, unknown>>();
    const cookies = new Map<string, Record<string, unknown>>();
    const flags = { auth: true };
    const fakeAuth = {
        getUser: async (uid: string) => {
            calls.push({ name: 'getUser', args: [uid] });
            const user = users.get(uid);
            if (!user) throw Object.assign(new Error('missing'), { code: 'auth/user-not-found' });
            return { uid, email: 'a@b.pl', customClaims: user.customClaims ?? {} };
        },
        setCustomUserClaims: async (uid: string, claims: Record<string, unknown>) => {
            calls.push({ name: 'setCustomUserClaims', args: [uid, claims] });
            const user = users.get(uid) ?? {};
            user.customClaims = claims;
            users.set(uid, user);
        },
        verifySessionCookie: async (cookie: string, checkRevoked?: boolean) => {
            calls.push({ name: 'verifySessionCookie', args: [cookie, checkRevoked] });
            if (checkRevoked !== true) throw Object.assign(new Error('revocation'), { code: 'auth/argument-error' });
            const row = cookies.get(cookie);
            if (!row) throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            return row;
        },
        verifyIdToken: async (token: string, checkRevoked?: boolean) => {
            calls.push({ name: 'verifyIdToken', args: [token, checkRevoked] });
            if (checkRevoked !== true) throw Object.assign(new Error('revocation'), { code: 'auth/argument-error' });
            const row = tokens.get(token);
            if (!row) throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
            return row;
        },
        createSessionCookie: async (token: string, opts?: { expiresIn?: number }) => {
            calls.push({ name: 'createSessionCookie', args: [token, opts] });
            if (!tokens.has(token)) throw Object.assign(new Error('old'), { code: 'auth/invalid-id-token' });
            if (opts?.expiresIn !== FIVE_DAYS_S * 1000) throw Object.assign(new Error('ttl'), { code: 'auth/invalid-argument' });
            return `minted:${token}`;
        },
    };
    return { calls, users, tokens, cookies, flags, fakeAuth };
});

vi.mock('@/lib/firebase/admin', () => ({
    getAdminDb: () => null,
    getAdminAuth: () => (h.flags.auth ? h.fakeAuth : null),
}));

const { GET, POST, PUT, DELETE } = await import('@/app/api/auth/session/route');

function token(over: Record<string, unknown> = {}) {
    return {
        uid: 'user_1',
        iat: NOW_S,
        auth_time: NOW_S,
        email: 'a@b.pl',
        email_verified: true,
        accessUntil: 111,
        plan: 'm1',
        ...over,
    };
}

function names() {
    return h.calls.map((c) => c.name);
}

function call(method: string, body?: unknown, extra: { cookie?: string; origin?: string | null; contentType?: string | null; secFetchSite?: string } = {}) {
    const headers: Record<string, string> = {};
    if (extra.origin !== null) headers.origin = extra.origin ?? ORIGIN;
    if (body !== undefined && extra.contentType !== null) headers['content-type'] = extra.contentType ?? 'application/json';
    if (extra.cookie) headers.cookie = `__session=${extra.cookie}`;
    if (extra.secFetchSite) headers['sec-fetch-site'] = extra.secFetchSite;
    return new NextRequest(`${ORIGIN}/api/auth/session`, {
        method,
        headers,
        body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
}

function setCookie(res: Response): string[] {
    return typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
}

beforeEach(() => {
    h.calls.length = 0;
    h.users.clear();
    h.tokens.clear();
    h.cookies.clear();
    h.flags.auth = true;
    h.tokens.set('fresh', token());
    h.tokens.set('stale', token({ iat: NOW_S - 301, accessUntil: 333, plan: 'm6' }));
    h.tokens.set('other', token({ uid: 'user_2', accessUntil: 222, plan: 'm3' }));
    h.tokens.set('boundary', token({ iat: NOW_S - 300, accessUntil: 444, plan: 'trial' }));
    h.tokens.set('future', token({ iat: NOW_S + 61 }));
    h.tokens.set('skew', token({ iat: NOW_S + 60, accessUntil: 777, plan: 'm3' }));
    h.cookies.set('good', { uid: 'user_1', iat: NOW_S - 3 * 24 * 60 * 60, accessUntil: 555, plan: 'm3', email: 'a@b.pl' });
    vi.spyOn(Date, 'now').mockReturnValue(NOW_MS);
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('GET /api/auth/session', () => {
    it('oddaje claims ciasteczka i zawsze private, no-store', async () => {
        const res = await GET(call('GET', undefined, { cookie: 'good', origin: null }));
        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe('private, no-store');
        expect(await res.json()).toEqual({
            signedIn: true,
            accessUntil: 555,
            plan: 'm3',
            iat: NOW_S - 3 * 24 * 60 * 60,
        });
        expect(h.calls).toEqual([{ name: 'verifySessionCookie', args: ['good', true] }]);
    });

    it('brak i zepsute ciasteczko → { signedIn: false }, też private, no-store', async () => {
        const missing = await GET(call('GET', undefined, { origin: null }));
        expect(missing.status).toBe(200);
        expect(missing.headers.get('cache-control')).toBe('private, no-store');
        expect(await missing.json()).toEqual({ signedIn: false });
        expect(setCookie(missing)).toEqual([]);

        h.calls.length = 0;
        const bad = await GET(call('GET', undefined, { cookie: 'nope', origin: null }));
        expect(bad.status).toBe(200);
        expect(bad.headers.get('cache-control')).toBe('private, no-store');
        expect(await bad.json()).toEqual({ signedIn: false });
        expect(h.calls[0]).toEqual({ name: 'verifySessionCookie', args: ['nope', true] });
    });

    it('śmieciowe claims dostępu są null, nie cudzym planem', async () => {
        h.cookies.set('messy', { uid: 'user_1', iat: NOW_S, accessUntil: '400', plan: 'vip' });
        const res = await GET(call('GET', undefined, { cookie: 'messy', origin: null }));
        expect(await res.json()).toEqual({ signedIn: true, accessUntil: null, plan: null, iat: NOW_S });
    });

    it('bez Admin SDK → 501 auth-not-configured', async () => {
        h.flags.auth = false;
        const res = await GET(call('GET', undefined, { cookie: 'good', origin: null }));
        expect(res.status).toBe(501);
        expect(res.headers.get('cache-control')).toBe('private, no-store');
        expect(await res.json()).toEqual({ error: 'auth-not-configured' });
        expect(h.calls).toEqual([]);
    });
});

describe('PUT /api/auth/session', () => {
    it('bez ciasteczka → 401, tokenu nawet nie sprawdzamy', async () => {
        const res = await PUT(call('PUT', { idToken: 'fresh' }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'unauthorized' });
        expect(setCookie(res)).toEqual([]);
        expect(names()).toEqual(['verifySessionCookie']);
        expect(h.calls[0].args).toEqual(['', true]);
    });

    it('zepsute ciasteczko → 401', async () => {
        const res = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'nope' }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'unauthorized' });
        expect(names()).toEqual(['verifySessionCookie']);
    });

    it('ciasteczko i token innego uid → 403, także gdy iat jest stary', async () => {
        const freshOther = await PUT(call('PUT', { idToken: 'other' }, { cookie: 'good' }));
        expect(freshOther.status).toBe(403);
        expect(await freshOther.json()).toEqual({ error: 'forbidden' });
        expect(setCookie(freshOther)).toEqual([]);

        h.calls.length = 0;
        h.tokens.set('other-stale', token({ uid: 'user_2', iat: NOW_S - 301 }));
        const staleOther = await PUT(call('PUT', { idToken: 'other-stale' }, { cookie: 'good' }));
        expect(staleOther.status).toBe(403);
        expect(await staleOther.json()).toEqual({ error: 'forbidden' });
        expect(names()).not.toContain('createSessionCookie');
        expect(names()).not.toContain('setCustomUserClaims');
        expect(names()).not.toContain('getUser');
    });

    it('stary iat → { refresh: true } bez Set-Cookie i bez zapisu claims', async () => {
        const res = await PUT(call('PUT', { idToken: 'stale' }, { cookie: 'good' }));
        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe('no-store');
        expect(await res.json()).toEqual({ refresh: true });
        expect(setCookie(res)).toEqual([]);
        expect(names()).toEqual(['verifySessionCookie', 'verifyIdToken']);
        expect(h.calls[0].args[1]).toBe(true);
        expect(h.calls[1].args).toEqual(['stale', true]);
    });

    it('iat sekundę poza oknem freshToken (przyszłość) też prosi o odświeżenie', async () => {
        const res = await PUT(call('PUT', { idToken: 'future' }, { cookie: 'good' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ refresh: true });
        expect(setCookie(res)).toEqual([]);
        expect(names()).not.toContain('createSessionCookie');
    });

    it('poprawne → nowe __session i claims tokenu, nie ciasteczka', async () => {
        const res = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'good' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, accessUntil: 111, plan: 'm1' });
        const raw = setCookie(res);
        expect(raw).toHaveLength(1);
        expect(raw[0]).toContain('__session=minted%3Afresh');
        expect(raw[0].toLowerCase()).toContain('httponly');
        expect(raw[0].toLowerCase()).toContain('samesite=lax');
        expect(raw[0]).toContain('Path=/');
        expect(raw[0]).toContain(`Max-Age=${FIVE_DAYS_S}`);
        expect(raw[0].toLowerCase().includes('secure')).toBe(process.env.NODE_ENV === 'production');
        expect(h.calls.find((c) => c.name === 'createSessionCookie')?.args).toEqual(['fresh', { expiresIn: FIVE_DAYS_S * 1000 }]);
        expect(names()).not.toContain('getUser');
        expect(names()).not.toContain('setCustomUserClaims');
    });

    it('adres zdjęty z ADMIN_EMAILS traci „rok 2100” także przy cichym odnowieniu — { refresh } bez ciasteczka', async () => {
        vi.stubEnv('ADMIN_EMAILS', 'ktos-inny@b.pl');
        h.tokens.set('ex-admin', token({ accessUntil: 4_102_444_800, plan: 'm6' }));
        h.users.set('user_1', { customClaims: { accessUntil: 4_102_444_800, plan: 'm6', other: 1 } });
        const res = await PUT(call('PUT', { idToken: 'ex-admin' }, { cookie: 'good' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ refresh: true });
        expect(setCookie(res)).toHaveLength(0);
        expect(h.users.get('user_1')?.customClaims).toEqual({ accessUntil: NOW_S, plan: 'm6', other: 1 });
        expect(names()).not.toContain('createSessionCookie');
    });

    it('administrator nadal na liście odnawia się normalnie, bez zapisu claims', async () => {
        vi.stubEnv('ADMIN_EMAILS', 'a@b.pl');
        h.tokens.set('admin', token({ accessUntil: 4_102_444_800, plan: 'm6' }));
        const res = await PUT(call('PUT', { idToken: 'admin' }, { cookie: 'good' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, accessUntil: 4_102_444_800, plan: 'm6' });
        expect(names()).not.toContain('setCustomUserClaims');
    });

    it('granica freshToken: 5 min przechodzi, 60 s do przodu też', async () => {
        const boundary = await PUT(call('PUT', { idToken: 'boundary' }, { cookie: 'good' }));
        expect(boundary.status).toBe(200);
        expect(await boundary.json()).toEqual({ ok: true, accessUntil: 444, plan: 'trial' });
        expect(setCookie(boundary)).toHaveLength(1);

        h.calls.length = 0;
        const skew = await PUT(call('PUT', { idToken: 'skew' }, { cookie: 'good' }));
        expect(skew.status).toBe(200);
        expect(await skew.json()).toEqual({ ok: true, accessUntil: 777, plan: 'm3' });
    });

    it('obca strona, zły typ i brak tokenu nie ruszają Admin SDK', async () => {
        const foreign = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'good', origin: 'https://evil.test' }));
        expect(foreign.status).toBe(403);
        expect(await foreign.json()).toEqual({ error: 'forbidden' });

        const form = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'good', contentType: 'text/plain' }));
        expect(form.status).toBe(415);

        const missing = await PUT(call('PUT', {}, { cookie: 'good' }));
        expect(missing.status).toBe(400);
        expect(await missing.json()).toEqual({ error: 'Brak idToken' });
        expect(h.calls).toEqual([]);
    });

    it('ta sama strona bez Origin, z Sec-Fetch-Site, przechodzi', async () => {
        const res = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'good', origin: null, secFetchSite: 'same-origin' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, accessUntil: 111, plan: 'm1' });
    });

    it('zły token przy ważnym ciasteczku → 401', async () => {
        const res = await PUT(call('PUT', { idToken: 'nope' }, { cookie: 'good' }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'unauthorized' });
        expect(setCookie(res)).toEqual([]);
        expect(names()).toEqual(['verifySessionCookie', 'verifyIdToken']);
    });

    it('bez Admin SDK → 501', async () => {
        h.flags.auth = false;
        const res = await PUT(call('PUT', { idToken: 'fresh' }, { cookie: 'good' }));
        expect(res.status).toBe(501);
        expect(await res.json()).toEqual({ error: 'auth-not-configured' });
        expect(h.calls).toEqual([]);
    });
});

describe('POST /api/auth/session', () => {
    it('nadal odrzuca auth_time starsze niż 5 min — zanim nada claims', async () => {
        h.tokens.set('old-login', token({ auth_time: NOW_S - 301, accessUntil: undefined, plan: undefined }));
        h.users.set('user_1', { customClaims: { keep: true } });
        const res = await POST(call('POST', { idToken: 'old-login' }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'recent-sign-in-required' });
        expect(setCookie(res)).toEqual([]);
        expect(names()).toEqual(['verifyIdToken']);
        expect(h.users.get('user_1')?.customClaims).toEqual({ keep: true });
    });

    it('na granicy 5 min wystawia ciasteczko i oddaje claims tokenu', async () => {
        h.tokens.set('just', token({ auth_time: NOW_S - 300, accessUntil: 888, plan: 'm6' }));
        const res = await POST(call('POST', { idToken: 'just' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, accessUntil: 888, plan: 'm6' });
        const raw = setCookie(res);
        expect(raw).toHaveLength(1);
        expect(raw[0]).toContain('__session=minted%3Ajust');
        expect(raw[0]).toContain(`Max-Age=${FIVE_DAYS_S}`);
        expect(raw[0].toLowerCase()).toContain('httponly');
        expect(raw[0].toLowerCase()).toContain('samesite=lax');
        expect(names()).not.toContain('getUser');
        expect(names()).not.toContain('setCustomUserClaims');
    });

    it('niepotwierdzony e-mail nie dostaje accessUntil — inaczej okres próbny przepadłby po kliknięciu linku', async () => {
        h.tokens.set('unverified', token({ email_verified: false, accessUntil: undefined, plan: undefined }));
        h.users.set('user_1', { customClaims: { keep: 1 } });
        const res = await POST(call('POST', { idToken: 'unverified' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ verifyEmail: true });
        expect(setCookie(res)).toEqual([]);
        expect(h.users.get('user_1')?.customClaims).toEqual({ keep: 1 });
        expect(names()).toEqual(['verifyIdToken']);
    });

    it('świeże logowanie bez dostępu nadal nadaje okres próbny i prosi o refresh, bez ciasteczka', async () => {
        vi.stubEnv('TRIAL_DAYS', '7');
        h.tokens.set('new', token({ accessUntil: undefined, plan: undefined }));
        h.users.set('user_1', { customClaims: { keep: 1 } });
        const res = await POST(call('POST', { idToken: 'new' }));
        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe('no-store');
        expect(await res.json()).toEqual({ refresh: true });
        expect(setCookie(res)).toEqual([]);
        expect(h.users.get('user_1')?.customClaims).toEqual({ keep: 1, ...trialClaims(NOW_S, trialDays()) });
        expect(names()).toEqual(['verifyIdToken', 'getUser', 'setCustomUserClaims']);
    });

    it('obca strona nadal 403', async () => {
        const res = await POST(call('POST', { idToken: 'fresh' }, { origin: 'https://evil.test' }));
        expect(res.status).toBe(403);
        expect(h.calls).toEqual([]);
    });
});

describe('DELETE /api/auth/session', () => {
    it('czyści ciasteczko tak jak dotychczas', async () => {
        const res = await DELETE(call('DELETE'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
        const raw = setCookie(res);
        expect(raw).toHaveLength(1);
        expect(raw[0].toLowerCase()).toContain('httponly');
        expect(raw[0].toLowerCase()).toContain('samesite=lax');
        expect(raw[0]).toContain('Max-Age=0');
        expect(raw[0]).toContain('Path=/');
    });
});
