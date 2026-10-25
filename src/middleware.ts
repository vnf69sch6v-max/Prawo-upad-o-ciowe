import { NextRequest, NextResponse } from 'next/server';
import { gate, isApi, isPublicApi, isPublicPath, sameSecret } from '@/lib/access';
import { verifySessionCookie } from '@/lib/auth/session-verify';

// Bramka płatnej platformy — tylko gdy NEXT_PUBLIC_AUTH_REQUIRED=true (i włączone logowanie). Niezalogowany
// dostaje stronę startową z cennikiem (src/app/start), zalogowany bez ważnego dostępu — cennik. Ciasteczko
// sesji jest weryfikowane kryptograficznie (podpis Google, projekt, ważność; src/lib/auth/session-verify.ts),
// a dostęp (`accessUntil`) siedzi w podpisanych claims — podrobione `__session=x` nie przechodzi.
// API (/api/*) jest za bramką dopiero z CRON_SECRET: crony i kontrola świeżości wołają własne endpointy
// z `Authorization: Bearer CRON_SECRET` (src/lib/internal-fetch.ts) — bez sekretu przestałyby odświeżać dane.
const REQUIRED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'true' && process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const COOKIE = '__session';

export async function middleware(request: NextRequest) {
    if (!REQUIRED) return NextResponse.next();

    const { pathname, search } = request.nextUrl;
    const cronSecret = process.env.CRON_SECRET ?? '';
    const protectApi = !!cronSecret;
    // Strony publiczne i API bez ochrony — bez kryptografii przy każdym żądaniu.
    if (isApi(pathname) ? !protectApi || isPublicApi(pathname) : isPublicPath(pathname)) return NextResponse.next();

    const internal = protectApi && sameSecret(request.headers.get('authorization') ?? '', `Bearer ${cronSecret}`);
    const session = internal ? null : await verifySessionCookie(request.cookies.get(COOKIE)?.value, PROJECT_ID);
    const decision = gate({ pathname, search, session, nowS: Math.floor(Date.now() / 1000), protectApi, internal });

    switch (decision.kind) {
        case 'pass':
            return NextResponse.next();
        case 'unavailable':
            // Klucze Google chwilowo niedostępne: nie kasujemy ciasteczka i nie wylogowujemy — ponów za chwilę.
            return isApi(pathname)
                ? NextResponse.json({ error: 'auth-unavailable' }, { status: 503, headers: { 'Retry-After': '30' } })
                : new NextResponse('Chwilowy problem z weryfikacją logowania. Odśwież stronę za kilkanaście sekund.', {
                    status: 503, headers: { 'Retry-After': '30', 'Content-Type': 'text/plain; charset=utf-8' },
                });
        case 'deny':
            return NextResponse.json({ error: decision.status === 401 ? 'unauthorized' : 'access-expired' }, { status: decision.status, headers: { 'Cache-Control': 'no-store' } });
        case 'redirect': {
            const res = NextResponse.redirect(new URL(decision.to, request.url));
            // Nieważne ciasteczko (zły podpis, wygasłe) — usuń, żeby nie weryfikować go przy każdej stronie.
            if (session === null && request.cookies.get(COOKIE)) res.cookies.delete(COOKIE);
            return res;
        }
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
