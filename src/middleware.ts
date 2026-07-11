import { NextRequest, NextResponse } from 'next/server';

// Route protection is only active when auth is explicitly enabled. In demo mode
// (flag unset / Firebase not configured) the app is fully open. Middleware runs
// on the Edge runtime, so it only checks for the session cookie's presence —
// the cookie is minted & verified server-side in /api/auth/session.
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
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
