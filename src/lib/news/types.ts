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
