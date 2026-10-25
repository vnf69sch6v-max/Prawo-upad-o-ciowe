// Jednorazowa sesja Stripe Checkout (10/20/30 zł). Klucz zostaje na serwerze — przeglądarka dostaje tylko
// adres https://checkout.stripe.com. Uid bierzemy z ciasteczka sesji, nie z body. Wygasły dostęp tu wchodzi
// (trasa jest na liście publicznej bramki), bo inaczej nie da się zapłacić.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { OWNER } from '@/lib/legal';
import { jsonError, noStore, sameSite, stripeErrorCode, stripeForm, wantsJson } from '@/lib/stripe/api';
import {
    checkoutBody,
    checkoutIdempotencyKey,
    livemodeMatches,
    normalizeEmail,
    paymentsEnabled,
    planById,
    safeCheckoutOrigin,
    stripeSecret,
} from '@/lib/stripe/billing';
import { isStripeCheckoutUrl } from '@/lib/stripe/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = '__session';

export async function GET() {
    return NextResponse.json({ enabled: paymentsEnabled() }, { headers: noStore });
}

export async function POST(request: NextRequest) {
    if (!sameSite(request)) return jsonError('forbidden', 403);
    if (!wantsJson(request)) return jsonError('unsupported-media-type', 415);

    // Brak ciasteczka to 401 także bez Firebase — 501 tylko gdy sesja jest, a serwera nie da się użyć.
    const cookie = request.cookies.get(COOKIE)?.value;
    if (!cookie) return jsonError('unauthorized', 401);

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
    const plan = planById(body && typeof body === 'object' ? (body as { plan?: unknown }).plan : undefined);
    if (!plan) return jsonError('unknown-plan', 400);

    let uid: string;
    try {
        const decoded = await auth.verifySessionCookie(cookie, true);
        uid = decoded.uid;
        if (!uid) return jsonError('unauthorized', 401);
    } catch (err) {
        console.error('[stripe/checkout] sesja:', (err as { code?: string }).code ?? 'unauthorized');
        return jsonError('unauthorized', 401);
    }

    let email: string | null = null;
    try {
        const user = await auth.getUser(uid);
        email = normalizeEmail(user.email);
    } catch {
        return jsonError('unauthorized', 401);
    }

    const origin = safeCheckoutOrigin(request.nextUrl.origin);
    const form = checkoutBody({ plan, uid, email, origin, contactEmail: OWNER.email });
    let stripe: { status: number; json: unknown };
    try {
        stripe = await stripeForm(secret, '/checkout/sessions', form, checkoutIdempotencyKey(uid, plan.id, Date.now()));
    } catch (err) {
        console.error('[stripe/checkout] sieć:', (err as { code?: string }).code ?? 'error');
        return jsonError('stripe-unreachable', 502);
    }
    const payload = stripe.json && typeof stripe.json === 'object' ? stripe.json as { url?: unknown; livemode?: unknown } : undefined;
    const url = payload?.url;
    const livemode = payload?.livemode;
    const modeOk = typeof livemode !== 'boolean' || livemodeMatches(secret, livemode);
    if (stripe.status < 200 || stripe.status >= 300 || !modeOk || !isStripeCheckoutUrl(url)) {
        console.error('[stripe/checkout]', stripeErrorCode(stripe.json));
        return jsonError('stripe-error', 502);
    }
    return NextResponse.json({ url }, { headers: noStore });
}
