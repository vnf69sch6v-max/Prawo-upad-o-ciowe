// Webhook Stripe. Jedyny dowód zapłaty, gdy użytkownik zamknie kartę przed powrotem na stronę.
// Bez poprawnego podpisu nie ruszamy dostępu. Powtórka tego samego zdarzenia nie przedłuża okresu drugi raz
// (`fulfillPaidSession`). Surowy body — podpis liczy się z bajtów, nie ze sparsowanego JSON-a.
// Każdy wynik (także 400 i 501) ląduje w `health/stripe_webhook` dopiero po decyzji o statusie —
// błąd dziennika go nie zmienia. W logu są tylko `evt_` i `cs_`, nigdy e-mail ani payload.
import { NextRequest, NextResponse } from 'next/server';
import { noStore, jsonError } from '@/lib/stripe/api';
import { classifySession, livemodeMatches, stripeSecret, stripeWebhookSecret, verifyStripeSignature } from '@/lib/stripe/billing';
import { fulfillPaidSession, PaymentError } from '@/lib/stripe/fulfill';
import { recordPaymentEvent, type PaymentEventKind } from '@/lib/stripe/health';
import { isCheckoutSessionId } from '@/lib/stripe/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAID_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);
const MAX_BODY = 200_000;

interface Peek {
    eventId?: string;
    sessionId?: string;
    eventType?: string;
}

function peekIds(payload: string): Peek {
    if (!payload || payload.length > MAX_BODY) return {};
    try {
        const event = JSON.parse(payload) as unknown;
        if (!event || typeof event !== 'object') return {};
        const row = event as { id?: unknown; type?: unknown; data?: unknown };
        const eventId = typeof row.id === 'string' && /^evt_[A-Za-z0-9_]{1,80}$/.test(row.id) ? row.id : undefined;
        const eventType = typeof row.type === 'string' && /^[a-z][a-z0-9_.]{0,79}$/.test(row.type) ? row.type : undefined;
        const data = row.data && typeof row.data === 'object' ? row.data as { object?: unknown } : undefined;
        const obj = data?.object && typeof data.object === 'object' ? data.object as { id?: unknown } : undefined;
        const sessionId = isCheckoutSessionId(obj?.id) ? obj.id : undefined;
        return { eventId, sessionId, eventType };
    } catch {
        return {};
    }
}

function logWebhook(label: string, meta: Peek, code?: string): void {
    const suffix = code ? ` code=${code}` : '';
    console.error(`[stripe/webhook] ${label} event=${meta.eventId ?? '-'} session=${meta.sessionId ?? '-'}${suffix}`);
}

/** Dziennik po decyzji. Wyjątek stąd nie zmienia statusu, który już wybraliśmy. */
async function finish(response: NextResponse, kind: PaymentEventKind, meta: Peek): Promise<NextResponse> {
    try {
        await recordPaymentEvent({
            at: new Date().toISOString(),
            kind,
            sessionId: meta.sessionId,
            eventType: meta.eventType,
        });
    } catch {
        /* `recordPaymentEvent` sam połyka błędy Firestore; tu tylko pas bezpieczeństwa. */
    }
    return response;
}

export async function POST(request: NextRequest) {
    const secret = stripeSecret();
    const webhookSecret = stripeWebhookSecret();
    const payload = await request.text();

    if (!secret || !webhookSecret) {
        const meta = payload.length <= MAX_BODY ? peekIds(payload) : {};
        logWebhook('stripe-not-configured', meta);
        return finish(jsonError('stripe-not-configured', 501), 'not-configured', meta);
    }
    if (payload.length > MAX_BODY) {
        return finish(jsonError('too-large', 413), 'failed', {});
    }

    const meta = peekIds(payload);
    const nowS = Math.floor(Date.now() / 1000);
    if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'), webhookSecret, nowS)) {
        logWebhook('bad-signature', meta);
        return finish(jsonError('bad-signature', 400), 'bad-signature', meta);
    }

    let event: unknown;
    try {
        event = JSON.parse(payload);
    } catch {
        return finish(jsonError('bad-json', 400), 'ignored', {});
    }
    const type = event && typeof event === 'object' ? (event as { type?: unknown }).type : undefined;
    if (typeof type !== 'string' || !PAID_EVENTS.has(type)) {
        const response = NextResponse.json({ received: true }, { headers: noStore });
        // `checkout.session.expired` i inne zdarzenia sesji: 200 bez nadania dostępu, ślad w dzienniku.
        // Obce typy (gdy ktoś podepnie za dużo zdarzeń) nie zasłaniają ostatniego wyniku płatności.
        if (typeof type === 'string' && type.startsWith('checkout.session.')) {
            logWebhook('ignored', meta);
            return finish(response, 'ignored', meta);
        }
        return response;
    }
    const obj = (event as { data?: { object?: unknown } }).data?.object;
    const livemode = obj && typeof obj === 'object' ? (obj as { livemode?: unknown }).livemode : undefined;
    // 200, nie 400: Stripe powtarza każde nie-2xx przez dni. Zły tryb nie przedłuża dostępu.
    if (typeof livemode !== 'boolean' || !livemodeMatches(secret, livemode)) {
        logWebhook('livemode', meta);
        return finish(NextResponse.json({ received: true, ignored: true }, { headers: noStore }), 'livemode', meta);
    }

    const classified = classifySession(obj);
    if (classified.kind === 'pending') {
        return finish(NextResponse.json({ received: true, pending: true }, { headers: noStore }), 'pending', meta);
    }
    if (classified.kind === 'reject') {
        logWebhook('ignored', meta);
        return finish(NextResponse.json({ received: true, ignored: true }, { headers: noStore }), 'ignored', meta);
    }

    try {
        const result = await fulfillPaidSession(classified.session);
        return finish(
            NextResponse.json({ received: true, already: result.already }, { headers: noStore }),
            result.already ? 'already' : 'ok',
            meta,
        );
    } catch (err) {
        const code = err instanceof PaymentError ? err.code : (err as { code?: string }).code ?? 'error';
        if (code === 'user-missing') {
            logWebhook('user-missing', meta);
            return finish(NextResponse.json({ received: true, ignored: true }, { headers: noStore }), 'user-missing', meta);
        }
        logWebhook('fulfill-failed', meta, code);
        return finish(jsonError('fulfill-failed', 500), 'failed', meta);
    }
}
