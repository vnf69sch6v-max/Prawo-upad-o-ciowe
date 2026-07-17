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
     * Liczba NIEZALEŻNYCH RELACJI o tym temacie. 1 = niepotwierdzone.
     * Dwa poziomy odsiewania pozornego potwierdzenia:
     *  1. właściciel — Bankier i Puls Biznesu to jedna grupa (Bonnier) → liczą się raz;
     *  2. przedruk — dwie redakcje przepisujące tę samą depeszę to jedna relacja, choć dwóch
     *     właścicieli (wykrywane po niemal identycznych opisach — patrz cluster.ts).
     */
    corroboration?: number;
    /** Czy temat jest przedrukiem tej samej depeszy przez różne serwisy (a nie niezależnymi relacjami). */
    wire?: boolean;
    /** Nazwy redakcji z tego samego tematu (bez tej pozycji) — do podpisu „także w…". */
    alsoIn?: string[];
    /**
     * Identyfikator tematu. Pozycje z tym samym `clusterId` to ten sam news z różnych redakcji —
     * UI pokazuje JEDNĄ z nich (reprezentanta), resztę zwija do podpisu „także w…".
     * Bez tego jedna historia potrafiła zająć 3 z 6 miejsc na Przeglądzie.
     */
    clusterId?: number;
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
