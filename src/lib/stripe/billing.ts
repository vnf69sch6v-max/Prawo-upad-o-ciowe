// Czysta logika płatności Stripe: klucz tylko ze zmiennych serwera, kwoty z cennika (`PLANS`),
// przedłużenie dostępu i weryfikacja podpisu webhooka. Bez sieci i bez Firebase — testy w tests/stripe.test.ts.
//
// Klucz prywatny jest już na Vercelu. Przyjmujemy standardowe nazwy; klucz publiczny (`pk_`) i sekret
// webhooka (`whsec_`) nie nadają się do tworzenia sesji. Przeglądarka nie dostaje żadnego z nich:
// płaci na stronie Stripe, a tu wraca tylko identyfikator sesji.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PLANS, type Plan, type PlanId } from '@/lib/access';
import { ADMIN_UNTIL } from '@/lib/auth/grant';
import { SITE_URL } from '@/lib/internal-fetch';
import { isCheckoutSessionId } from '@/lib/stripe/ids';

export { isStripeCheckoutUrl } from '@/lib/stripe/ids';

const SECRET_NAMES = ['STRIPE_SECRET_KEY', 'STRIPE_PRIVATE_KEY', 'STRIPE_API_KEY', 'STRIPE_SECRET'] as const;

type Env = Record<string, string | undefined>;

/** Klucz sekretny Stripe albo `null`. `pk_` / `whsec_` są pomijane — to nie ten sekret. */
export function stripeSecret(env: Env = process.env): string | null {
    for (const name of SECRET_NAMES) {
        const value = env[name]?.trim();
        if (!value || value.startsWith('pk_') || value.startsWith('whsec_')) continue;
        return value;
    }
    return null;
}

export function paymentsEnabled(env?: Env): boolean {
    return stripeSecret(env) !== null;
}

export function stripeWebhookSecret(env: Env = process.env): string | null {
    const value = (env.STRIPE_WEBHOOK_SECRET ?? env.STRIPE_WEBHOOK_KEY)?.trim();
    return value || null;
}

export function planById(id: unknown): Plan | null {
    return PLANS.find((p) => p.id === id) ?? null;
}

/** `true` = klucz live, `false` = test, `null` = nierozpoznany prefiks (nie blokujemy). */
export function secretLivemode(secret: string): boolean | null {
    if (secret.startsWith('sk_live_') || secret.startsWith('rk_live_')) return true;
    if (secret.startsWith('sk_test_') || secret.startsWith('rk_test_')) return false;
    return null;
}

export function livemodeMatches(secret: string, livemode: boolean): boolean {
    const expected = secretLivemode(secret);
    return expected === null || expected === livemode;
}

const ALLOWED_HOSTS = new Set(['savori.space', 'www.savori.space', 'localhost', '127.0.0.1']);

/** Adres powrotu po płatności. Obcy `Host` nie może zabrać użytkownika na inną domenę — wtedy kanoniczny serwis. */
export function safeCheckoutOrigin(requestOrigin: string, fallback = SITE_URL): string {
    try {
        const url = new URL(requestOrigin);
        const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const httpsOk = url.protocol === 'https:' && (ALLOWED_HOSTS.has(url.hostname) || url.hostname.endsWith('.vercel.app'));
        const httpOk = url.protocol === 'http:' && local;
        if (httpsOk || httpOk) return url.origin;
    } catch {
        /* obcy albo pusty adres */
    }
    return fallback;
}

export function checkoutIdempotencyKey(uid: string, plan: PlanId, nowMs: number): string {
    const safeUid = uid.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128);
    const minute = Math.floor(nowMs / 60_000);
    return `savori_${plan}_${minute}_${safeUid}`.slice(0, 255);
}

/** Tekst na stronie Stripe i na pokwitowaniu: jednorazowo, jak liczymy okres, jak odstąpić. */
export function withdrawalNote(contactEmail: string): string {
    const to = contactEmail.trim() || 'adres z regulaminu (savori.space/regulamin)';
    return `Jednorazowa płatność, bez automatycznego odnawiania. Dostęp na opłacony okres; kolejny zakup przedłuża go od jego końca. Odstąpienie: 14 dni, wiadomość na ${to}.`;
}

function periodPhrase(months: number): string {
    if (months === 1) return '1 miesiąc kalendarzowy';
    if (months < 5) return `${months} miesiące kalendarzowe`;
    return `${months} miesięcy kalendarzowych`;
}

export function normalizeEmail(email: unknown): string | null {
    if (typeof email !== 'string') return null;
    const value = email.trim().toLowerCase();
    if (!value || value.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
    return value;
}

function cleanUid(uid: unknown): string | null {
    if (typeof uid !== 'string' || uid.length < 1 || uid.length > 128) return null;
    if (!/^[A-Za-z0-9:_-]+$/.test(uid)) return null;
    return uid;
}

/**
 * Ciało `application/x-www-form-urlencoded` sesji Checkout. `{CHECKOUT_SESSION_ID}` musi zostać
 * dosłownie — Stripe nie podmienia zakodowanego `%7B…%7D`.
 */
export function checkoutBody(input: {
    plan: Plan;
    uid: string;
    email: string | null;
    origin: string;
    contactEmail: string;
}): string {
    const note = withdrawalNote(input.contactEmail);
    const pairs: [string, string][] = [
        ['mode', 'payment'],
        ['locale', 'pl'],
        ['client_reference_id', input.uid],
        ['metadata[uid]', input.uid],
        ['metadata[plan]', input.plan.id],
        ['line_items[0][quantity]', '1'],
        ['line_items[0][price_data][currency]', 'pln'],
        ['line_items[0][price_data][unit_amount]', String(input.plan.pricePln * 100)],
        ['line_items[0][price_data][product_data][name]', `Savori — ${input.plan.name}`],
        ['line_items[0][price_data][product_data][description]', `Jednorazowy dostęp na ${periodPhrase(input.plan.months)}. Bez automatycznego odnawiania.`],
        ['custom_text[submit][message]', note],
        ['payment_intent_data[description]', `Savori ${input.plan.name}: ${note}`],
        ['payment_intent_data[metadata][uid]', input.uid],
        ['payment_intent_data[metadata][plan]', input.plan.id],
        ['cancel_url', `${input.origin}/start?platnosc=anulowana#cennik`],
    ];
    if (input.email) {
        pairs.push(['customer_email', input.email], ['payment_intent_data[receipt_email]', input.email]);
    }
    const encoded = pairs.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    const success = `${input.origin}/start?platnosc=ok&session_id={CHECKOUT_SESSION_ID}`;
    encoded.push(`success_url=${encodeURIComponent(success).replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}')}`);
    return encoded.join('&');
}

/** Miesiące kalendarzowe w UTC. 31 stycznia + 1 miesiąc = 28 lutego (albo 29 w roku przestępnym). */
export function addCalendarMonths(unixS: number, months: number): number {
    const date = new Date(unixS * 1000);
    const day = date.getUTCDate();
    const index = date.getUTCMonth() + months;
    const year = date.getUTCFullYear() + Math.floor(index / 12);
    const month = ((index % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Math.floor(Date.UTC(year, month, Math.min(day, lastDay), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) / 1000);
}

/**
 * Koniec dostępu po zakupie: od późniejszej z dat (teraz / koniec obecnego dostępu), plus miesiące planu.
 * Dostęp administratora (rok 2100) zostaje. Wygasły dostęp liczy się od teraz, nie od daty wygaśnięcia.
 */
export function extendAccess(currentUntil: number | undefined, nowS: number, months: number): number {
    const current = typeof currentUntil === 'number' && Number.isFinite(currentUntil) ? currentUntil : 0;
    if (current >= ADMIN_UNTIL) return current;
    return addCalendarMonths(Math.max(nowS, current), months);
}

/** Czy token ma już co najmniej ten dostęp (albo dostęp administratora) — wtedy można wydać nowe ciasteczko. */
export function claimsCover(tokenUntil: unknown, requiredUntil: number): boolean {
    if (typeof tokenUntil !== 'number' || !Number.isFinite(tokenUntil)) return false;
    return tokenUntil >= requiredUntil || tokenUntil >= ADMIN_UNTIL;
}

/** `iat` tokenu, nie `auth_time`: odświeżony token ma świeże `iat`, choć logowanie było wcześniej. */
export function freshToken(iat: unknown, nowS: number, windowS = 300): boolean {
    return typeof iat === 'number' && Number.isFinite(iat) && nowS - iat <= windowS && iat <= nowS + 60;
}

/**
 * Podpis webhooka Stripe: `t=<sekundy>,v1=<hex HMAC-SHA256(sekret, `${t}.${body}`)>`.
 * Kilka `v1` przy rotacji sekretu. Poza oknem czasu — odrzut (odtworzenie starego żądania).
 */
export function verifyStripeSignature(
    payload: string,
    header: string | null,
    secret: string,
    nowS: number,
    toleranceS = 300,
): boolean {
    if (!header || !secret || !payload) return false;
    let timestamp = '';
    const signatures: string[] = [];
    for (const part of header.split(',')) {
        const eq = part.indexOf('=');
        if (eq < 0) continue;
        const key = part.slice(0, eq).trim();
        const value = part.slice(eq + 1).trim();
        if (key === 't') timestamp = value;
        else if (key === 'v1' && value) signatures.push(value);
    }
    if (!/^\d+$/.test(timestamp) || signatures.length === 0) return false;
    const issued = Number(timestamp);
    if (Math.abs(nowS - issued) > toleranceS) return false;
    const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    return signatures.some((sig) => {
        const buf = Buffer.from(sig, 'utf8');
        return buf.length === expectedBuf.length && timingSafeEqual(buf, expectedBuf);
    });
}

export interface PaidSession {
    id: string;
    uid: string;
    plan: PlanId;
    /** Zapłacone grosze (po podatku, jeśli Stripe go doliczy). */
    amount: number;
    currency: 'pln';
    email: string | null;
    livemode: boolean;
}

export function sessionUid(obj: unknown): string | null {
    if (!obj || typeof obj !== 'object') return null;
    const metadata = (obj as { metadata?: { uid?: unknown } }).metadata;
    return cleanUid(metadata?.uid);
}

/**
 * Opłacona sesja jednorazowa, której kwota (przed podatkiem) jest dokładnie ceną planu z metadanych.
 * Niższa kwota nie przedłuża dostępu. Podatek doliczony przez Stripe nie blokuje — patrzymy na `amount_subtotal`.
 */
export function readPaidSession(obj: unknown): PaidSession | null {
    if (!obj || typeof obj !== 'object') return null;
    const session = obj as Record<string, unknown>;
    if (session.object !== 'checkout.session' || session.mode !== 'payment' || session.payment_status !== 'paid') return null;
    if (session.status !== undefined && session.status !== 'complete') return null;
    if (!isCheckoutSessionId(session.id)) return null;
    const uid = sessionUid(session);
    const plan = planById((session.metadata as { plan?: unknown } | null)?.plan);
    if (!uid || !plan) return null;
    if (session.client_reference_id !== undefined && session.client_reference_id !== uid) return null;
    if (typeof session.currency !== 'string' || session.currency.toLowerCase() !== 'pln') return null;
    const total = session.amount_total;
    const subtotal = typeof session.amount_subtotal === 'number' ? session.amount_subtotal : total;
    if (typeof total !== 'number' || typeof subtotal !== 'number') return null;
    if (subtotal !== plan.pricePln * 100 || total < subtotal) return null;
    const details = session.customer_details;
    const nested = details && typeof details === 'object' ? (details as { email?: unknown }).email : undefined;
    return {
        id: session.id,
        uid,
        plan: plan.id,
        amount: total,
        currency: 'pln',
        email: normalizeEmail(session.customer_email) ?? normalizeEmail(nested),
        livemode: session.livemode === true,
    };
}

export type ClassifiedSession =
    | { kind: 'paid'; session: PaidSession }
    | { kind: 'pending' }
    | { kind: 'reject' };

/** `unpaid` (BLIK / przelew jeszcze w drodze) nie jest błędem — webhook przyjdzie drugi raz. */
export function classifySession(obj: unknown): ClassifiedSession {
    if (!obj || typeof obj !== 'object' || (obj as { object?: unknown }).object !== 'checkout.session') return { kind: 'reject' };
    if ((obj as { payment_status?: unknown }).payment_status !== 'paid') return { kind: 'pending' };
    const session = readPaidSession(obj);
    return session ? { kind: 'paid', session } : { kind: 'reject' };
}
