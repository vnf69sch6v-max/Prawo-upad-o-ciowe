// Wspólne typy newsów — jedno źródło prawdy dla serwera (api/news) i klienta (hooks, komponenty).
// Trzymane osobno, bo `match.ts` jest importowany po obu stronach i nie może ciągnąć route'u.

export interface NewsItem {
    title: string;
    link: string;
    /** ISO UTC — strefy feedów są normalizowane po stronie serwera (patrz lib/news/parse.ts). */
    publishedAt: string;
    description: string;
    sourceId: string;
    source: string;
    section: string;

    // ─── Pola rankingu (dokładane przez /api/news; patrz lib/news/{score,cluster}.ts) ───
    /** Ważność 0–100, znormalizowana w obrębie paczki. Sortowanie „Ważne" idzie po tym. */
    importance?: number;
    /**
     * Ilu NIEZALEŻNYCH właścicieli opisuje ten temat. 1 = niepotwierdzone.
     * Bankier i Puls Biznesu to jedna grupa (Bonnier) → liczą się jako jeden.
     */
    corroboration?: number;
    /** Nazwy redakcji z tego samego tematu (bez tej pozycji) — do podpisu „także w…". */
    alsoIn?: string[];
    /** Wykryta autopromocja/reklama — takie pozycje domyślnie chowamy. */
    isAd?: boolean;
    clickbait?: 'strong' | 'weak' | null;
    isOpinion?: boolean;
}

export interface NewsSourceStatus {
    id: string;
    name: string;
    ok: boolean;
    count: number;
    error?: string;
}

export interface NewsResult {
    timestamp: string;
    sourcesOk: number;
    sourcesTotal: number;
    /** Liczba faktycznie zwróconych pozycji (= items.length). */
    count: number;
    /** Ile było po deduplikacji, zanim serwer przyciął listę do limitu. */
    countBeforeLimit: number;
    sources: NewsSourceStatus[];
    items: NewsItem[];
}
