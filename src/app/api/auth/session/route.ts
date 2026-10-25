// Session endpoint — wymienia token Firebase na ciasteczko httpOnly, odnawia je i oddaje claims, które czyta bramka.
//
// Zabezpieczenia (zalecenia Firebase dla session cookies):
//  - tylko z własnej strony: `Origin` = ta sama domena i `Content-Type: application/json`, inaczej obca strona
//    mogłaby formularzem wysłać swój token i zalogować ofiarę na konto atakującego (login CSRF);
//  - POST: token sprawdzany z unieważnieniem (`checkRevoked`) i tylko świeży (logowanie ≤ 5 min temu) —
//    przechwycony stary ID token nie wystarczy do wyrobienia 5-dniowej sesji;
//  - PUT (odnowienie bez ponownego logowania): ważne ciasteczko (`verifySessionCookie(..., true)`) ORAZ
//    świeży token tej samej osoby (`freshToken` — `iat` ≤ 5 min, nie `auth_time`). Bez zapisu claims.
//    Sam stary token nadal nie wyrobi sesji; samo ciasteczko bez świeżego tokenu też nie;
//  - błędy bez szczegółów (treść wyjątku Firebase zostaje w logach serwera, bez tokenu).
//
// Dostęp (płatna platforma, src/lib/access.ts, zasady w src/lib/auth/grant.ts): nowe konto ze zweryfikowanym
// e-mailem dostaje okres próbny (TRIAL_DAYS, domyślnie 7) — jeden na adres; reszta trafia od razu na cennik.
// Claims trafiają do tokenu dopiero po jego odświeżeniu, więc POST odpowiada `{ refresh: true }` bez ciasteczka —
// klient odświeża token i wysyła go ponownie (raz). ADMIN_EMAILS (zweryfikowany e-mail) — dostęp bez końca.
// GET czyta te same claims, które widzi bramka, i nie zapisuje nic.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { trialClaims, trialDays, type AccessClaims, type PlanId } from '@/lib/access';
import { ADMIN_UNTIL, adminEmails, claimTrial, grantDecision } from '@/lib/auth/grant';
import { sameOrigin } from '@/lib/auth/require-session';
import { freshToken } from '@/lib/stripe/billing';

const COOKIE = '__session';
const MAX_AGE_S = 60 * 60 * 24 * 5; // 5 days
const RECENT_SIGN_IN_S = 5 * 60;

const noStore = { 'Cache-Control': 'no-store' };
const privateNoStore = { 'Cache-Control': 'private, no-store' };

type AccessPlan = 'trial' | PlanId;

/** Claims do ustawienia albo `null`, gdy token ma już właściwy dostęp. */
async function accessToGrant(decoded: { email?: string; email_verified?: boolean; accessUntil?: unknown }, nowS: number): Promise<AccessClaims | null> {
    switch (grantDecision(decoded, adminEmails()).kind) {
        case 'none':
            return null;
        case 'admin':
            return { plan: 'm6', accessUntil: ADMIN_UNTIL };
        case 'revoke-admin':
        case 'no-trial':
            return { accessUntil: nowS }; // bez dostępu — cennik
        case 'trial':
            return trialDays() > 0 && (await claimTrial(getAdminDb(), decoded.email!)) ? trialClaims(nowS, trialDays()) : { accessUntil: nowS };
    }
}

const deny = (error: string, status: number) =>
    NextResponse.json({ error }, { status, headers: noStore });

function cookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
    };
}

function readPlan(plan: unknown): AccessPlan | null {
    return plan === 'trial' || plan === 'm1' || plan === 'm3' || plan === 'm6' ? plan : null;
}

function readUntil(accessUntil: unknown): number | null {
    return typeof accessUntil === 'number' && Number.isFinite(accessUntil) ? accessUntil : null;
}

function readIat(iat: unknown): number | null {
    return typeof iat === 'number' && Number.isFinite(iat) ? iat : null;
}

/** CSRF: własna strona + JSON `{ idToken }`. Zwraca token albo gotową odmowę. */
async function readIdToken(request: NextRequest): Promise<string | NextResponse> {
    if (!sameOrigin(request)) return deny('forbidden', 403);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return deny('unsupported-media-type', 415);

    let idToken: unknown;
    try {
        ({ idToken } = await request.json());
    } catch {
        return deny('Brak idToken', 400);
    }
    if (!idToken || typeof idToken !== 'string') return deny('Brak idToken', 400);
    return idToken;
}

function withSessionCookie(body: unknown, value: string) {
    const res = NextResponse.json(body, { headers: noStore });
    res.cookies.set(COOKIE, value, cookieOptions(value ? MAX_AGE_S : 0));
    return res;
}

/** Claims ciasteczka, które czyta bramka. Bez Admin SDK — 501. Zawsze `private, no-store`. */
export async function GET(request: NextRequest) {
    const auth = getAdminAuth();
    if (!auth) return NextResponse.json({ error: 'auth-not-configured' }, { status: 501, headers: privateNoStore });

    const cookie = request.cookies.get(COOKIE)?.value;
    if (!cookie) return NextResponse.json({ signedIn: false }, { headers: privateNoStore });

    try {
        const decoded = await auth.verifySessionCookie(cookie, true);
        if (!decoded.uid) return NextResponse.json({ signedIn: false }, { headers: privateNoStore });
        return NextResponse.json({
            signedIn: true,
            accessUntil: readUntil(decoded.accessUntil),
            plan: readPlan(decoded.plan),
            iat: readIat(decoded.iat),
        }, { headers: privateNoStore });
    } catch {
        return NextResponse.json({ signedIn: false }, { headers: privateNoStore });
    }
}

export async function POST(request: NextRequest) {
    const idToken = await readIdToken(request);
    if (idToken instanceof NextResponse) return idToken;

    const auth = getAdminAuth();
    if (!auth) {
        // Firebase Admin not configured — cannot mint a verified session.
        return deny('auth-not-configured', 501);
    }

    try {
        const decoded = await auth.verifyIdToken(idToken, true);
        if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_S) return deny('recent-sign-in-required', 401);
        const grant = await accessToGrant(decoded, Math.floor(Date.now() / 1000));
        if (grant) {
            const { customClaims } = await auth.getUser(decoded.uid);
            await auth.setCustomUserClaims(decoded.uid, { ...customClaims, ...grant });
            return NextResponse.json({ refresh: true }, { headers: noStore });
        }
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });
        return withSessionCookie({ ok: true, accessUntil: readUntil(decoded.accessUntil), plan: readPlan(decoded.plan) }, sessionCookie);
    } catch (err) {
        console.error('[auth/session] odrzucony token:', (err as { code?: string }).code ?? 'unknown');
        return deny('unauthorized', 401);
    }
}

/**
 * Odnowienie ciasteczka bez ponownego logowania. Claims bierzemy z ID tokenu (nie zapisujemy ich).
 * Stary `iat` → `{ refresh: true }` bez `Set-Cookie`, klient woła `getIdToken(true)` i ponawia raz.
 */
export async function PUT(request: NextRequest) {
    const idToken = await readIdToken(request);
    if (idToken instanceof NextResponse) return idToken;

    const auth = getAdminAuth();
    if (!auth) return deny('auth-not-configured', 501);

    let cookieUid: string;
    try {
        const session = await auth.verifySessionCookie(request.cookies.get(COOKIE)?.value ?? '', true);
        cookieUid = session.uid;
        if (!cookieUid) return deny('unauthorized', 401);
    } catch {
        return deny('unauthorized', 401);
    }

    let decoded: { uid: string; iat?: unknown; accessUntil?: unknown; plan?: unknown };
    try {
        decoded = await auth.verifyIdToken(idToken, true);
    } catch (err) {
        console.error('[auth/session] odrzucony token:', (err as { code?: string }).code ?? 'unknown');
        return deny('unauthorized', 401);
    }
    if (decoded.uid !== cookieUid) return deny('forbidden', 403);

    const nowS = Math.floor(Date.now() / 1000);
    if (!freshToken(decoded.iat, nowS)) return NextResponse.json({ refresh: true }, { headers: noStore });

    try {
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });
        return withSessionCookie({ ok: true, accessUntil: readUntil(decoded.accessUntil), plan: readPlan(decoded.plan) }, sessionCookie);
    } catch (err) {
        console.error('[auth/session] odrzucony token:', (err as { code?: string }).code ?? 'unknown');
        return deny('unauthorized', 401);
    }
}

export async function DELETE(request: NextRequest) {
    if (!sameOrigin(request)) return deny('forbidden', 403);
    return withSessionCookie({ ok: true }, '');
}
