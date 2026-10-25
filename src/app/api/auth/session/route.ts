// Session endpoint — exchanges a Firebase ID token for an httpOnly session cookie.
// Middleware only checks for the cookie's presence; verification happens here.
//
// Zabezpieczenia (zalecenia Firebase dla session cookies):
//  - tylko z własnej strony: `Origin` = ta sama domena i `Content-Type: application/json`, inaczej obca strona
//    mogłaby formularzem wysłać swój token i zalogować ofiarę na konto atakującego (login CSRF);
//  - token sprawdzany z unieważnieniem (`checkRevoked`) i tylko świeży (logowanie ≤ 5 min temu) —
//    przechwycony stary ID token nie wystarczy do wyrobienia 5-dniowej sesji;
//  - błędy bez szczegółów (treść wyjątku Firebase zostaje w logach serwera, bez tokenu).

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

const COOKIE = '__session';
const MAX_AGE_S = 60 * 60 * 24 * 5; // 5 days
const RECENT_SIGN_IN_S = 5 * 60;

/** Żądanie z naszej własnej strony (fetch z przeglądarki na tej samej domenie). */
function sameOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (origin) return origin === request.nextUrl.origin;
    return request.headers.get('sec-fetch-site') === 'same-origin';
}

const deny = (error: string, status: number) =>
    NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
    if (!sameOrigin(request)) return deny('forbidden', 403);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return deny('unsupported-media-type', 415);

    let idToken: unknown;
    try {
        ({ idToken } = await request.json());
    } catch {
        return deny('Brak idToken', 400);
    }
    if (!idToken || typeof idToken !== 'string') return deny('Brak idToken', 400);

    const auth = getAdminAuth();
    if (!auth) {
        // Firebase Admin not configured — cannot mint a verified session.
        return deny('auth-not-configured', 501);
    }

    try {
        const decoded = await auth.verifyIdToken(idToken, true);
        if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_S) return deny('recent-sign-in-required', 401);
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });

        const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
        res.cookies.set(COOKIE, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: MAX_AGE_S,
        });
        return res;
    } catch (err) {
        console.error('[auth/session] odrzucony token:', (err as { code?: string }).code ?? 'unknown');
        return deny('unauthorized', 401);
    }
}

export async function DELETE(request: NextRequest) {
    if (!sameOrigin(request)) return deny('forbidden', 403);
    const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    res.cookies.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
}
