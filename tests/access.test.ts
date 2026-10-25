import { describe, expect, it } from 'vitest';
import { SignJWT, generateKeyPair } from 'jose';
import { PLANS, gate, hasAccess, isPublicPath, monthlyPrice, sameSecret, savingsPct, trialClaims, trialDays } from '@/lib/access';
import { KeysUnavailable, verifySessionCookie } from '@/lib/auth/session-verify';
import { ADMIN_UNTIL, grantDecision, trialId } from '@/lib/auth/grant';

const NOW = 1_792_900_000; // 25.10.2026, sekundy

describe('cennik', () => {
    it('10 / 20 / 30 zł za 1 / 3 / 6 miesięcy, jednorazowo', () => {
        expect(PLANS.map((p) => [p.pricePln, p.months])).toEqual([[10, 1], [20, 3], [30, 6]]);
        expect(monthlyPrice(PLANS[2])).toBe(5);
        expect(PLANS.map(savingsPct)).toEqual([0, 33, 50]);
    });

    it('okres próbny: domyślnie 7 dni, 0 wyłącza, śmieci → 7, maks. 90', () => {
        expect(trialDays({})).toBe(7);
        expect(trialDays({ TRIAL_DAYS: '0' })).toBe(0);
        expect(trialDays({ TRIAL_DAYS: 'abc' })).toBe(7);
        expect(trialDays({ TRIAL_DAYS: '1000' })).toBe(90);
        expect(hasAccess(trialClaims(NOW, 7), NOW + 6 * 86_400)).toBe(true);
        expect(hasAccess(trialClaims(NOW, 7), NOW + 7 * 86_400)).toBe(false);
        expect(hasAccess(trialClaims(NOW, 0), NOW)).toBe(false);
    });
});

describe('bramka', () => {
    const g = (pathname: string, session: Parameters<typeof gate>[0]['session'], extra: Partial<Parameters<typeof gate>[0]> = {}) =>
        gate({ pathname, search: '', session, nowS: NOW, protectApi: true, internal: false, ...extra });
    const ok = { accessUntil: NOW + 60, plan: 'm1' as const };

    it('strony publiczne i pliki: tylko znane ścieżki, nie „cokolwiek z kropką”', () => {
        for (const p of ['/start', '/login', '/prywatnosc', '/regulamin', '/status', '/_next/static/x.js', '/icon.svg', '/favicon.ico',
            '/manifest.webmanifest', '/robots.txt', '/icons/icon-192.png', '/pdfjs/pdf.worker.min.mjs', '/globe.svg']) expect(isPublicPath(p), p).toBe(true);
        for (const p of ['/', '/ceny', '/japonia', '/spolki/PKN', '/spolki/PKO.WA', '/startowa', '/regulaminy', '/ceny.txt', '/ceny.json'])
            expect(isPublicPath(p), p).toBe(false);
    });

    it('RSC strony (/ceny.rsc, /ceny.segments/…) jest zawsze za bramką', () => {
        for (const p of ['/ceny.rsc', '/japonia.rsc', '/japonia.segments/_index.segment.rsc', '/start.rsc', '/status.rsc']) {
            expect(isPublicPath(p), p).toBe(false);
            expect(g(p, null).kind, p).toBe('redirect');
        }
    });

    it('niezalogowany → strona startowa (z powrotem na podstronę po zalogowaniu)', () => {
        expect(g('/', null)).toEqual({ kind: 'redirect', to: '/start' });
        expect(gate({ pathname: '/ceny', search: '?zakres=1R', session: null, nowS: NOW, protectApi: true, internal: false }))
            .toEqual({ kind: 'redirect', to: '/start?from=%2Fceny%3Fzakres%3D1R' });
        expect(g('/start', null)).toEqual({ kind: 'pass' });
    });

    it('zalogowany: z ważnym dostępem przechodzi, po wygaśnięciu — cennik', () => {
        expect(g('/ceny', ok)).toEqual({ kind: 'pass' });
        expect(g('/ceny', { accessUntil: NOW - 1, plan: 'trial' })).toEqual({ kind: 'redirect', to: '/start?dostep=wygasl#cennik' });
        expect(g('/ceny', {}).kind).toBe('redirect');
    });

    it('chwilowa niedostępność kluczy Google nie wylogowuje (503, nie przekierowanie)', () => {
        expect(g('/ceny', 'unavailable')).toEqual({ kind: 'unavailable' });
        expect(g('/api/nbp', 'unavailable')).toEqual({ kind: 'unavailable' });
    });

    it('API za bramką (z CRON_SECRET): bez sesji 401, bez dostępu 403, crony z sekretem przechodzą', () => {
        expect(g('/api/gus-cpi-full', null)).toEqual({ kind: 'deny', status: 401 });
        expect(g('/api/parser/parse', { accessUntil: NOW - 1 })).toEqual({ kind: 'deny', status: 403 });
        expect(g('/api/nbp', ok)).toEqual({ kind: 'pass' });
        expect(g('/api/nbp', null, { internal: true })).toEqual({ kind: 'pass' });
        for (const p of ['/api/auth/session', '/api/health/freshness', '/api/cron/dbw-1']) expect(g(p, null), p).toEqual({ kind: 'pass' });
        // bez CRON_SECRET API zostaje otwarte (inaczej crony przestałyby odświeżać dane)
        expect(g('/api/nbp', null, { protectApi: false })).toEqual({ kind: 'pass' });
    });

    it('sekret porównywany w stałym czasie i dokładnie', () => {
        expect(sameSecret('Bearer abc', 'Bearer abc')).toBe(true);
        expect(sameSecret('Bearer abd', 'Bearer abc')).toBe(false);
        expect(sameSecret('Bearer ab', 'Bearer abc')).toBe(false);
        expect(sameSecret('', '')).toBe(false);
    });
});

describe('weryfikacja ciasteczka sesji (Edge)', async () => {
    const PROJECT = 'aplikacja-prawnicy';
    const google = await generateKeyPair('RS256');
    const attacker = await generateKeyPair('RS256');
    const keys = async (kid: string) => (kid === 'k1' ? google.publicKey : null);
    const sign = (key: CryptoKeyLike, claims: Record<string, unknown>, opts: { iss?: string; aud?: string; exp?: number; kid?: string; alg?: string } = {}) =>
        new SignJWT(claims)
            .setProtectedHeader({ alg: opts.alg ?? 'RS256', kid: opts.kid ?? 'k1' })
            .setIssuer(opts.iss ?? `https://session.firebase.google.com/${PROJECT}`)
            .setAudience(opts.aud ?? PROJECT)
            .setSubject('uid-123')
            .setIssuedAt()
            .setExpirationTime(opts.exp ?? Math.floor(Date.now() / 1000) + 3600)
            .sign(key);
    type CryptoKeyLike = typeof google.privateKey;

    it('prawdziwa sesja: uid, e-mail i dostęp z claims', async () => {
        const c = await sign(google.privateKey, { email: 'a@b.pl', accessUntil: NOW + 100, plan: 'm3' });
        expect(await verifySessionCookie(c, PROJECT, keys)).toEqual({ uid: 'uid-123', email: 'a@b.pl', accessUntil: NOW + 100, plan: 'm3' });
    });

    it('podróbki nie przechodzą', async () => {
        const tries = [
            await sign(attacker.privateKey, { accessUntil: 4e9 }), // cudzy klucz pod znanym kid
            await sign(google.privateKey, { accessUntil: 4e9 }, { iss: 'https://securetoken.google.com/aplikacja-prawnicy' }), // ID token, nie sesja
            await sign(google.privateKey, { accessUntil: 4e9 }, { aud: 'inny-projekt' }),
            await sign(google.privateKey, { accessUntil: 4e9 }, { exp: Math.floor(Date.now() / 1000) - 10 }),
            await sign(google.privateKey, { accessUntil: 4e9 }, { kid: 'nieznany' }),
            'x', '', 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.',
        ];
        for (const t of tries) expect(await verifySessionCookie(t, PROJECT, keys)).toBeNull();
        expect(await verifySessionCookie(undefined, PROJECT, keys)).toBeNull();
        expect(await verifySessionCookie(await sign(google.privateKey, {}), undefined, keys)).toBeNull();
    });

    it('klucze Google niedostępne → „unavailable”, nie wylogowanie', async () => {
        const c = await sign(google.privateKey, { accessUntil: NOW + 100 });
        expect(await verifySessionCookie(c, PROJECT, async () => { throw new KeysUnavailable('offline'); })).toBe('unavailable');
    });

    it('śmieciowe claims dostępu są ignorowane', async () => {
        const c = await sign(google.privateKey, { accessUntil: '4000000000', plan: 'vip' });
        expect(await verifySessionCookie(c, PROJECT, keys)).toEqual({ uid: 'uid-123', email: undefined, accessUntil: undefined, plan: undefined });
    });
});

describe('nadawanie dostępu przy logowaniu', () => {
    const admins = new Set(['szef@gmail.com']);
    it('okres próbny tylko dla zweryfikowanego e-maila, raz na konto', () => {
        expect(grantDecision({ email: 'a@b.pl', email_verified: true }, admins)).toEqual({ kind: 'trial' });
        expect(grantDecision({ email: 'a@b.pl', email_verified: false }, admins)).toEqual({ kind: 'no-trial' });
        expect(grantDecision({ email: 'a@b.pl' }, admins)).toEqual({ kind: 'no-trial' });
        expect(grantDecision({ email: 'a@b.pl', email_verified: true, accessUntil: NOW }, admins)).toEqual({ kind: 'none' });
    });

    it('admin tylko ze zweryfikowanym adresem; po usunięciu z listy dostęp „do 2100” znika', () => {
        expect(grantDecision({ email: 'Szef@Gmail.com', email_verified: true }, admins)).toEqual({ kind: 'admin' });
        expect(grantDecision({ email: 'szef@gmail.com', email_verified: false }, admins)).toEqual({ kind: 'no-trial' });
        expect(grantDecision({ email: 'szef@gmail.com', email_verified: true, accessUntil: ADMIN_UNTIL }, admins)).toEqual({ kind: 'none' });
        expect(grantDecision({ email: 'szef@gmail.com', email_verified: true, accessUntil: ADMIN_UNTIL }, new Set())).toEqual({ kind: 'revoke-admin' });
    });

    it('identyfikator okresu próbnego: ten sam dla wielkości liter, zależny od klucza (bez klucza nie zgadniesz)', () => {
        const k1 = { DATA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64') };
        const k2 = { DATA_ENCRYPTION_KEY: Buffer.alloc(32, 2).toString('base64') };
        expect(trialId(' A@B.pl ', k1)).toBe(trialId('a@b.pl', k1));
        expect(trialId('a@b.pl', k1)).not.toBe(trialId('a@b.pl', k2));
        expect(trialId('a@b.pl', k1)).not.toBe(trialId('a@b.pl', {}));
        expect(trialId('a@b.pl', k1)).toMatch(/^[0-9a-f]{64}$/);
    });
});
