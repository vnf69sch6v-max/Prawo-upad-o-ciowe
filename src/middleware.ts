import { NextRequest, NextResponse } from 'next/server';

// Bramka „cała platforma tylko po zalogowaniu” — osobna flaga NEXT_PUBLIC_AUTH_REQUIRED, domyślnie wyłączona.
// Samo logowanie (NEXT_PUBLIC_AUTH_ENABLED, src/lib/auth/use-auth.tsx) zostawia stronę publiczną: Savori to
// dane publiczne, konto jest dodatkiem. Middleware działa na Edge, więc sprawdza tylko obecność ciasteczka —
// wydaje je i weryfikuje /api/auth/session (przed funkcjami dla zalogowanych: weryfikacja podpisu, ROADMAP).
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === 'true' && process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
const COOKIE = '__session';

export function middleware(request: NextRequest) {
    if (!AUTH_ENABLED) return NextResponse.next();

    const { pathname } = request.nextUrl;

    // Always-public paths
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') // static assets
    ) {
        return NextResponse.next();
    }

    const hasSession = Boolean(request.cookies.get(COOKIE)?.value);
    if (!hasSession) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
