// Session endpoint — exchanges a Firebase ID token for an httpOnly session cookie.
// Middleware only checks for the cookie's presence; verification happens here.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

const COOKIE = '__session';
const MAX_AGE_S = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();
        if (!idToken || typeof idToken !== 'string') {
            return NextResponse.json({ error: 'Brak idToken' }, { status: 400 });
        }

        const auth = getAdminAuth();
        if (!auth) {
            // Firebase Admin not configured — cannot mint a verified session.
            return NextResponse.json({ error: 'auth-not-configured' }, { status: 501 });
        }

        await auth.verifyIdToken(idToken);
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });

        const res = NextResponse.json({ ok: true });
        res.cookies.set(COOKIE, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: MAX_AGE_S,
        });
        return res;
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 401 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
}
