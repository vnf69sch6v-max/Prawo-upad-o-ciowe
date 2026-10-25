import { NextRequest, NextResponse } from 'next/server';
import { gate, isPublicPath } from '@/lib/access';
import { verifySessionCookie } from '@/lib/auth/session-verify';

// Bramka płatnej platformy — tylko gdy NEXT_PUBLIC_AUTH_REQUIRED=true (i włączone logowanie). Niezalogowany
// dostaje stronę startową z cennikiem (src/app/start), zalogowany bez ważnego dostępu — cennik. Ciasteczko
// sesji jest weryfikowane kryptograficznie (podpis Google, projekt, ważność; src/lib/auth/session-verify.ts),
// a dostęp (`accessUntil`) siedzi w podpisanych claims — podrobione `__session=x` nie przechodzi.
const REQUIRED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'true' && process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const COOKIE = '__session';

export async function middleware(request: NextRequest) {
    if (!REQUIRED) return NextResponse.next();

    const { pathname, search } = request.nextUrl;
    // API, pliki i strony publiczne — bez weryfikacji (kryptografia przy każdym wywołaniu API niczego nie zmienia).
    if (isPublicPath(pathname)) return NextResponse.next();
    const claims = await verifySessionCookie(request.cookies.get(COOKIE)?.value, PROJECT_ID);
    const decision = gate(pathname, search, claims, Math.floor(Date.now() / 1000));

    if (decision.kind === 'redirect') {
        const res = NextResponse.redirect(new URL(decision.to, request.url));
        // Nieważne ciasteczko (zły podpis, wygasłe) — usuń, żeby nie weryfikować go przy każdej stronie.
        if (!claims && request.cookies.get(COOKIE)) res.cookies.delete(COOKIE);
        return res;
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
