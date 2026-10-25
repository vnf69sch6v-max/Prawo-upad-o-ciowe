// Powrót z Checkout. Webhook mógł jeszcze nie dojść, więc tu też księgujemy (ten sam zapis, idempotentnie)
// i wymieniamy ciasteczko sesji na takie z nowym `accessUntil`. `createSessionCookie` wymaga świeżego `iat`
// (klient woła getIdToken(true)); `auth_time` może być starsze niż 5 minut — tego progu z /api/auth/session
// tu nie stosujemy, bo użytkownik jest już zalogowany i właśnie zapłacił. Bez ciasteczka tej samej osoby
// sam token nie wystarczy.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { jsonError, noStore, sameSite, stripeErrorCode, stripeGet, wantsJson } from '@/lib/stripe/api';
import { claimsCover, classifySession, freshToken, livemodeMatches, sessionUid, stripeSecret } from '@/lib/stripe/billing';
import { isCheckoutSessionId } from '@/lib/stripe/ids';
import { fulfillPaidSession, PaymentError } from '@/lib/stripe/fulfill';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = '__session';
const MAX_AGE_S = 60 * 60 * 24 * 5;

export async function POST(request: NextRequest) {
    if (!sameSite(request)) return jsonError('forbidden', 403);
    if (!wantsJson(request)) return jsonError('unsupported-media-type', 415);

    const secret = stripeSecret();
    if (!secret) return jsonError('stripe-not-configured', 501);
    const auth = getAdminAuth();
    if (!auth) return jsonError('auth-not-configured', 501);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return jsonError('bad-request', 400);
    }
    const sessionId = body && typeof body === 'object' ? (body as { sessionId?: unknown }).sessionId : undefined;
    const idToken = body && typeof body === 'object' ? (body as { idToken?: unknown }).idToken : undefined;
    if (!isCheckoutSessionId(sessionId) || typeof idToken !== 'string' || !idToken) return jsonError('bad-request', 400);

    let cookieUid: string;
    try {
        const session = await auth.verifySessionCookie(request.cookies.get(COOKIE)?.value ?? '', true);
        cookieUid = session.uid;
        if (!cookieUid) return jsonError('unauthorized', 401);
    } catch {
        return jsonError('unauthorized', 401);
    }

    let decoded: { uid: string; iat?: number; accessUntil?: unknown };
    try {
        decoded = await auth.verifyIdToken(idToken, true);
    } catch {
        return jsonError('unauthorized', 401);
    }
    if (decoded.uid !== cookieUid) return jsonError('forbidden', 403);
    const nowS = Math.floor(Date.now() / 1000);
    if (!freshToken(decoded.iat, nowS)) return NextResponse.json({ refresh: true }, { headers: noStore });

    let stripe: { status: number; json: unknown };
    try {
        stripe = await stripeGet(secret, `/checkout/sessions/${encodeURIComponent(sessionId)}`);
    } catch (err) {
        console.error('[stripe/confirm] sieć:', (err as { code?: string }).code ?? 'error');
        return jsonError('stripe-unreachable', 502);
    }
    if (stripe.status === 404) return jsonError('unknown-session', 404);
    if (stripe.status < 200 || stripe.status >= 300) {
        console.error('[stripe/confirm]', stripe.status, stripeErrorCode(stripe.json));
        return jsonError('stripe-error', 502);
    }

    const livemode = stripe.json && typeof stripe.json === 'object' ? (stripe.json as { livemode?: unknown }).livemode : undefined;
    if (typeof livemode !== 'boolean' || !livemodeMatches(secret, livemode)) return jsonError('livemode-mismatch', 400);
    // Księgujemy wyłącznie sesję tej osoby. Brak metadata.uid albo cudzy uid — bez zapisu.
    const owner = sessionUid(stripe.json);
    if (owner !== cookieUid) return jsonError('forbidden', 403);

    const classified = classifySession(stripe.json);
    if (classified.kind === 'pending') return NextResponse.json({ pending: true }, { headers: noStore });
    if (classified.kind !== 'paid') return jsonError('rejected', 400);

    try {
        const result = await fulfillPaidSession(classified.session);
        if (!claimsCover(decoded.accessUntil, result.accessUntil)) {
            return NextResponse.json({ refresh: true }, { headers: noStore });
        }
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });
        const res = NextResponse.json({ ok: true, accessUntil: result.accessUntil }, { headers: noStore });
        res.cookies.set(COOKIE, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: MAX_AGE_S,
        });
        return res;
    } catch (err) {
        const code = err instanceof PaymentError ? err.code : (err as { code?: string }).code ?? 'error';
        console.error('[stripe/confirm]', code);
        if (code === 'auth/invalid-id-token' || code === 'auth/argument-error') {
            return NextResponse.json({ refresh: true }, { headers: noStore });
        }
        return jsonError(code === 'user-missing' ? 'user-missing' : 'fulfill-failed', code === 'user-missing' ? 409 : 500);
    }
}
