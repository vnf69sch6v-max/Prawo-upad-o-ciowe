// Webhook Stripe. Jedyny dowód zapłaty, gdy użytkownik zamknie kartę przed powrotem na stronę.
// Bez poprawnego podpisu nie ruszamy dostępu. Powtórka tego samego zdarzenia nie przedłuża okresu drugi raz
// (`fulfillPaidSession`). Surowy body — podpis liczy się z bajtów, nie ze sparsowanego JSON-a.
import { NextRequest, NextResponse } from 'next/server';
import { noStore, jsonError } from '@/lib/stripe/api';
import { classifySession, livemodeMatches, stripeSecret, stripeWebhookSecret, verifyStripeSignature } from '@/lib/stripe/billing';
import { fulfillPaidSession, PaymentError } from '@/lib/stripe/fulfill';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAID_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);
const MAX_BODY = 200_000;

export async function POST(request: NextRequest) {
    const secret = stripeSecret();
    const webhookSecret = stripeWebhookSecret();
    if (!secret || !webhookSecret) return jsonError('stripe-not-configured', 501);

    const payload = await request.text();
    if (payload.length > MAX_BODY) return jsonError('too-large', 413);
    const nowS = Math.floor(Date.now() / 1000);
    if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'), webhookSecret, nowS)) {
        return jsonError('bad-signature', 400);
    }

    let event: unknown;
    try {
        event = JSON.parse(payload);
    } catch {
        return jsonError('bad-json', 400);
    }
    const type = event && typeof event === 'object' ? (event as { type?: unknown }).type : undefined;
    if (typeof type !== 'string' || !PAID_EVENTS.has(type)) {
        return NextResponse.json({ received: true }, { headers: noStore });
    }
    const obj = (event as { data?: { object?: unknown } }).data?.object;
    const livemode = !!obj && typeof obj === 'object' && (obj as { livemode?: unknown }).livemode === true;
    if (!livemodeMatches(secret, livemode)) {
        console.error('[stripe/webhook] livemode mismatch');
        return jsonError('livemode-mismatch', 400);
    }

    const classified = classifySession(obj);
    if (classified.kind === 'pending') return NextResponse.json({ received: true, pending: true }, { headers: noStore });
    if (classified.kind === 'reject') {
        console.error('[stripe/webhook] odrzucona sesja');
        return NextResponse.json({ received: true, ignored: true }, { headers: noStore });
    }

    try {
        const result = await fulfillPaidSession(classified.session);
        return NextResponse.json({ received: true, already: result.already }, { headers: noStore });
    } catch (err) {
        const code = err instanceof PaymentError ? err.code : (err as { code?: string }).code ?? 'error';
        console.error('[stripe/webhook]', code);
        if (code === 'user-missing') return NextResponse.json({ received: true, ignored: true }, { headers: noStore });
        return jsonError('fulfill-failed', 500);
    }
}
