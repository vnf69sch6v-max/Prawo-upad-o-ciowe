// Dostęp do platformy: plany, okres próbny i decyzja bramki. Bez I/O — używa tego middleware (Edge),
// /api/auth/session i strona startowa. Stan dostępu żyje w podpisanym tokenie Firebase (custom claims
// `accessUntil`, `plan`), więc middleware sprawdza go bez bazy: podpis ciasteczka sesji weryfikuje
// src/lib/auth/session-verify.ts, a tu zapada tylko decyzja.

export type PlanId = 'm1' | 'm3' | 'm6';

export interface Plan {
    id: PlanId;
    /** Cena brutto w zł (jednorazowo, bez automatycznego odnawiania). */
    pricePln: number;
    months: number;
    name: string;
    /** Wyróżnienie na karcie cennika. */
    badge?: string;
}

/** Jednorazowe płatności — dostęp na okres, bez subskrypcji i bez automatycznego odnawiania. */
export const PLANS: Plan[] = [
    { id: 'm1', pricePln: 10, months: 1, name: 'Miesiąc' },
    { id: 'm3', pricePln: 20, months: 3, name: 'Kwartał', badge: 'Najczęściej wybierany' },
    { id: 'm6', pricePln: 30, months: 6, name: 'Pół roku', badge: 'Najtaniej' },
];

/** Cena za miesiąc, np. 5 zł przy 30 zł / 6 mies. */
export const monthlyPrice = (p: Plan) => p.pricePln / p.months;
/** Oszczędność względem planu miesięcznego w %, zaokrąglona w dół. */
export function savingsPct(p: Plan): number {
    const base = PLANS[0].pricePln;
    return Math.floor((1 - monthlyPrice(p) / base) * 100);
}

/** Okres próbny po pierwszym logowaniu (dni). Zmienna środowiskowa pozwala go wyłączyć (0). */
export function trialDays(env: Record<string, string | undefined> = process.env): number {
    const n = Number(env.TRIAL_DAYS ?? 7);
    return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 90) : 7;
}

export interface AccessClaims {
    /** Koniec dostępu (sekundy epoki). */
    accessUntil?: number;
    plan?: 'trial' | PlanId;
}

export function hasAccess(claims: AccessClaims | null, nowS: number): boolean {
    return !!claims && typeof claims.accessUntil === 'number' && claims.accessUntil > nowS;
}

/** Claims dla nowego konta: okres próbny od teraz (albo brak dostępu, gdy TRIAL_DAYS=0). */
export function trialClaims(nowS: number, days: number): AccessClaims {
    return { plan: 'trial', accessUntil: nowS + days * 86_400 };
}

/** Strony dostępne bez logowania: start z cennikiem, logowanie, dokumenty prawne, status, API i pliki. */
const PUBLIC_PREFIXES = ['/start', '/login', '/prywatnosc', '/regulamin', '/status', '/api/', '/_next/'];

export function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PREFIXES.some((p) => pathname === p.replace(/\/$/, '') || pathname.startsWith(p.endsWith('/') ? p : `${p}/`))) return true;
    // Pliki statyczne (ikony, manifest, obrazy, worker pdfjs) — ostatni segment z rozszerzeniem.
    return /\/[^/]+\.[a-z0-9]{2,11}$/i.test(pathname);
}

export type GateDecision = { kind: 'pass' } | { kind: 'redirect'; to: string };

/**
 * Bramka: niezalogowany trafia na stronę startową z logowaniem i cennikiem (z podstrony — z powrotem po
 * zalogowaniu), zalogowany bez ważnego dostępu — na cennik. Przekierowanie, nie rewrite: przy rewrite `/`
 * powłoka aplikacji (usePathname = `/`) owinęłaby stronę startową nagłówkiem i paskiem zakładek.
 */
export function gate(pathname: string, search: string, claims: AccessClaims | null, nowS: number): GateDecision {
    if (isPublicPath(pathname)) return { kind: 'pass' };
    if (!claims) {
        if (pathname === '/' && !search) return { kind: 'redirect', to: '/start' };
        return { kind: 'redirect', to: `/start?from=${encodeURIComponent(pathname + search)}` };
    }
    if (!hasAccess(claims, nowS)) return { kind: 'redirect', to: '/start?dostep=wygasl#cennik' };
    return { kind: 'pass' };
}
