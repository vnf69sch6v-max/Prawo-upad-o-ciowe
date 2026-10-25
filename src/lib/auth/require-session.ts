// Kto pyta: `uid` z ciasteczka sesji `__session` zweryfikowanego Admin SDK (podpis Google + unieważnienie).
// Dla tras `/api/me/*`, które czytają i piszą dane konkretnego konta — middleware sprawdza tylko,
// CZY ktoś jest zalogowany (i to wyłącznie z CRON_SECRET), a tutaj potrzebny jest KTÓRY to użytkownik.
import type { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export const SESSION_COOKIE = '__session';

export type SessionResult =
    | { ok: true; uid: string }
    /** Tryb demo (bez Admin SDK) — dane konta nie istnieją, klient zostaje przy pamięci przeglądarki. */
    | { ok: false; status: 501; error: 'auth-not-configured' }
    | { ok: false; status: 401; error: 'unauthorized' };

export async function requireSession(request: NextRequest): Promise<SessionResult> {
    const auth = getAdminAuth();
    if (!auth) return { ok: false, status: 501, error: 'auth-not-configured' };
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) return { ok: false, status: 401, error: 'unauthorized' };
    try {
        const { uid } = await auth.verifySessionCookie(cookie, true);
        return uid ? { ok: true, uid } : { ok: false, status: 401, error: 'unauthorized' };
    } catch {
        return { ok: false, status: 401, error: 'unauthorized' };
    }
}

/** Żądanie z naszej własnej strony — zapis danych konta tylko z fetch na tej samej domenie (CSRF). */
export function sameOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (origin) return origin === request.nextUrl.origin;
    return request.headers.get('sec-fetch-site') === 'same-origin';
}
