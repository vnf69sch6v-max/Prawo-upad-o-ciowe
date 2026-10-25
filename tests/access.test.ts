import { describe, expect, it } from 'vitest';
import { SignJWT, generateKeyPair } from 'jose';
import { PLANS, gate, hasAccess, isPublicPath, monthlyPrice, savingsPct, trialClaims, trialDays } from '@/lib/access';
import { verifySessionCookie } from '@/lib/auth/session-verify';

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
    it('strony publiczne: start, logowanie, dokumenty prawne, status, API, pliki', () => {
        for (const p of ['/start', '/login', '/prywatnosc', '/regulamin', '/status', '/api/health/freshness', '/_next/static/x.js',
            '/icon.svg', '/manifest.webmanifest', '/pdfjs/pdf.worker.min.mjs']) expect(isPublicPath(p), p).toBe(true);
        for (const p of ['/', '/ceny', '/japonia', '/spolki/PKN', '/startowa', '/regulaminy', '/apix']) expect(isPublicPath(p), p).toBe(false);
    });

    it('niezalogowany → strona startowa (z powrotem na podstronę po zalogowaniu)', () => {
        expect(gate('/', '', null, NOW)).toEqual({ kind: 'redirect', to: '/start' });
        expect(gate('/ceny', '?zakres=1R', null, NOW)).toEqual({ kind: 'redirect', to: '/start?from=%2Fceny%3Fzakres%3D1R' });
        expect(gate('/start', '', null, NOW)).toEqual({ kind: 'pass' });
    });

    it('zalogowany: z ważnym dostępem przechodzi, po wygaśnięciu — cennik', () => {
        expect(gate('/ceny', '', { accessUntil: NOW + 60, plan: 'm1' }, NOW)).toEqual({ kind: 'pass' });
        expect(gate('/ceny', '', { accessUntil: NOW - 1, plan: 'trial' }, NOW)).toEqual({ kind: 'redirect', to: '/start?dostep=wygasl#cennik' });
        expect(gate('/ceny', '', {}, NOW).kind).toBe('redirect');
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

    it('śmieciowe claims dostępu są ignorowane', async () => {
        const c = await sign(google.privateKey, { accessUntil: '4000000000', plan: 'vip' });
        expect(await verifySessionCookie(c, PROJECT, keys)).toEqual({ uid: 'uid-123', email: undefined, accessUntil: undefined, plan: undefined });
    });
});
