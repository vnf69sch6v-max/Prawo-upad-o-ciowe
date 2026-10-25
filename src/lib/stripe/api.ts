// Wywołania API Stripe z kluczem serwera. Bez przekierowań — nagłówek Authorization nie może wyjść poza api.stripe.com.
import { NextResponse } from 'next/server';

const STRIPE_API = 'https://api.stripe.com/v1';

export const noStore = { 'Cache-Control': 'no-store' } as const;

export function jsonError(error: string, status: number) {
    return NextResponse.json({ error }, { status, headers: noStore });
}

export function sameSite(request: { headers: Headers; nextUrl: { origin: string } }): boolean {
    const origin = request.headers.get('origin');
    if (origin) return origin === request.nextUrl.origin;
    return request.headers.get('sec-fetch-site') === 'same-origin';
}

export function wantsJson(request: { headers: Headers }): boolean {
    return !!request.headers.get('content-type')?.toLowerCase().startsWith('application/json');
}

export function stripeErrorCode(json: unknown): string {
    if (!json || typeof json !== 'object') return 'unknown';
    const error = (json as { error?: { code?: string; type?: string } }).error;
    return error?.code || error?.type || 'unknown';
}

async function stripeCall(secret: string, path: string, init: RequestInit): Promise<{ status: number; json: unknown }> {
    const res = await fetch(`${STRIPE_API}${path}`, {
        ...init,
        cache: 'no-store',
        redirect: 'manual',
        // 10 s: bez limitu wywołanie ginie na 30 s platformy. Abort leci tą samą ścieżką co inny błąd sieci (502 / 500).
        signal: AbortSignal.timeout(10_000),
        headers: {
            Authorization: `Bearer ${secret}`,
            ...(init.headers ?? {}),
        },
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
}

export function stripeForm(secret: string, path: string, body: string, idempotencyKey?: string) {
    return stripeCall(secret, path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body,
    });
}

export function stripeGet(secret: string, path: string) {
    return stripeCall(secret, path, { method: 'GET' });
}
