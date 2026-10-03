// Wywołania WŁASNYCH endpointów z cronów (warm) i z kontroli świeżości.
//
// Vercel wywołuje crony pod adresem wdrożenia `*.vercel.app`, a w tym projekcie te adresy są za
// logowaniem Vercela (Deployment Protection). `fetch(new URL(request.url).origin + ep)` dostawał
// 302 na vercel.com/sso-api, szedł za przekierowaniem i kończył na stronie logowania z HTTP 200.
// Cron raportował „ok", a niczego nie odświeżał — dane zmieniały się tylko wtedy, gdy wszedł
// użytkownik (stąd wieloletnie „zielone crony, stare dane"). Dlatego:
//   1. bazowy adres = kanoniczna domena publiczna (savori.space), nie adres wdrożenia,
//   2. bez podążania za przekierowaniami,
//   3. „ok" tylko dla odpowiedzi 2xx z JSON-em — strona logowania to błąd, nie sukces.

/** Kanoniczny adres serwisu. Nie `VERCEL_PROJECT_PRODUCTION_URL`: Vercel wybiera najkrótszą domenę
 *  produkcyjną, a do projektu jest przypięte też savori.com, którego DNS nie wskazuje na Vercel
 *  (wywołania kończyły się „fetch failed"). */
export const SITE_URL = 'https://savori.space';

/**
 * `INTERNAL_BASE_URL` (ręczne nadpisanie) → na produkcji kanoniczny `SITE_URL` (nie adres wdrożenia
 * `*.vercel.app` za logowaniem ani www z przekierowaniem) → poza produkcją origin żądania.
 */
export function internalOrigin(request: Request): string {
    const explicit = process.env.INTERNAL_BASE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, '');
    if (process.env.VERCEL_ENV === 'production') return SITE_URL;
    return new URL(request.url).origin;
}

/** `no-store`, bez przekierowań; nagłówek obejścia ochrony, jeśli w Vercelu włączono „Protection Bypass for Automation". */
export function internalInit(init: RequestInit = {}): RequestInit {
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    return {
        cache: 'no-store',
        redirect: 'manual',
        ...init,
        headers: {
            Accept: 'application/json',
            ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
            ...(init.headers as Record<string, string> | undefined),
        },
    };
}

/** Opis przekierowania do dziennika, np. „redirect 302 → vercel.com". */
export function redirectLabel(res: Response, url: string): string {
    const to = res.headers.get('location');
    let host = '';
    if (to) {
        try { host = new URL(to, url).host; } catch { host = to.slice(0, 40); }
    }
    return `redirect ${res.status}${host ? ` → ${host}` : ''}`;
}

/** Wynik wywołania do dziennika crona: liczba 200 tylko wtedy, gdy endpoint naprawdę odpowiedział JSON-em. */
export async function internalCall(url: string, init?: RequestInit): Promise<number | string> {
    try {
        const res = await fetch(url, internalInit(init));
        const type = res.headers.get('content-type') ?? '';
        await res.arrayBuffer().catch(() => undefined); // dopiąć odpowiedź, zwolnić połączenie
        if (res.status >= 300 && res.status < 400) return redirectLabel(res, url);
        if (res.ok && !type.includes('json')) return `non-JSON ${res.status}`;
        return res.status;
    } catch (e) {
        return `error: ${String(e).slice(0, 60)}`;
    }
}
