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

/** Strony dostępne bez logowania: start z cennikiem, logowanie, dokumenty prawne, status. */
const PUBLIC_PAGES = ['/start', '/login', '/prywatnosc', '/regulamin', '/status'];
/** Pliki z public/ i metadane — tylko znane ścieżki. */
const PUBLIC_FILES = new Set(['/favicon.ico', '/icon.svg', '/apple-icon.png', '/manifest.webmanifest', '/robots.txt', '/sitemap.xml']);
const PUBLIC_FILE_DIRS = ['/icons/', '/pdfjs/', '/parser-samples/', '/_next/'];
/** Obrazy w katalogu głównym public/ (jeden segment) — w katalogu głównym nie ma dynamicznych tras. */
const ROOT_IMAGE = /^\/[^/]+\.(svg|png|ico|jpe?g|webp|gif|avif)$/i;
/**
 * API bez ważnego dostępu. Checkout i confirm same sprawdzają ciasteczko (wpuszczają też wygasły dostęp,
 * inaczej nie da się zapłacić). Webhook Stripe nie ma sesji — podpis weryfikuje trasa.
 */
const PUBLIC_API = ['/api/auth/session', '/api/health/', '/api/cron/', '/api/stripe/checkout', '/api/stripe/confirm', '/api/stripe/webhook'];

const under = (pathname: string, p: string) => (p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(`${p}/`));

/**
 * Strony i pliki bez logowania. NIE zgadujemy „pliku” po kropce w ścieżce: na Vercelu `/ceny.rsc` i
 * `/ceny.segments/…` to wyrenderowana strona (RSC) — wyglądały na plik i omijały bramkę.
 */
export function isPublicPath(pathname: string): boolean {
    if (/\.rsc$|\.segments\//i.test(pathname)) return false;
    if (PUBLIC_PAGES.some((p) => under(pathname, p))) return true;
    if (PUBLIC_FILES.has(pathname) || PUBLIC_FILE_DIRS.some((d) => pathname.startsWith(d))) return true;
    return ROOT_IMAGE.test(pathname);
}

export const isApi = (pathname: string) => pathname === '/api' || pathname.startsWith('/api/');
export const isPublicApi = (pathname: string) => PUBLIC_API.some((p) => under(pathname, p));

export type GateDecision =
    | { kind: 'pass' }
    | { kind: 'redirect'; to: string }
    /** API: odpowiedź JSON zamiast przekierowania. */
    | { kind: 'deny'; status: 401 | 403 }
    /** Klucze Google chwilowo niedostępne — nie wylogowujemy, prosimy o ponowienie. */
    | { kind: 'unavailable' };

export interface GateInput {
    pathname: string;
    search: string;
    /** Wynik weryfikacji ciasteczka sesji (`null` = brak/podróbka). */
    session: AccessClaims | null | 'unavailable';
    nowS: number;
    /** API za bramką — tylko gdy jest CRON_SECRET, którym podpisują się wewnętrzne wywołania cronów. */
    protectApi: boolean;
    /** Żądanie wewnętrzne z poprawnym `Authorization: Bearer CRON_SECRET`. */
    internal: boolean;
}

/**
 * Bramka: niezalogowany trafia na stronę startową z logowaniem i cennikiem (z podstrony — z powrotem po
 * zalogowaniu), zalogowany bez ważnego dostępu — na cennik; API bez dostępu dostaje 401/403. Przekierowanie,
 * nie rewrite: przy rewrite `/` powłoka aplikacji (usePathname = `/`) owinęłaby stronę startową.
 */
export function gate({ pathname, search, session, nowS, protectApi, internal }: GateInput): GateDecision {
    if (isApi(pathname)) {
        if (!protectApi || internal || isPublicApi(pathname)) return { kind: 'pass' };
        if (session === 'unavailable') return { kind: 'unavailable' };
        if (!session) return { kind: 'deny', status: 401 };
        return hasAccess(session, nowS) ? { kind: 'pass' } : { kind: 'deny', status: 403 };
    }
    if (isPublicPath(pathname)) return { kind: 'pass' };
    if (session === 'unavailable') return { kind: 'unavailable' };
    if (!session) {
        if (pathname === '/' && !search) return { kind: 'redirect', to: '/start' };
        return { kind: 'redirect', to: `/start?from=${encodeURIComponent(pathname + search)}` };
    }
    if (!hasAccess(session, nowS)) return { kind: 'redirect', to: '/start?dostep=wygasl#cennik' };
    return { kind: 'pass' };
}

/** Porównanie sekretu w stałym czasie (Edge nie ma crypto.timingSafeEqual). */
export function sameSecret(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}
