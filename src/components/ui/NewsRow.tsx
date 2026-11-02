import { ArrowUpRight, Copy, Layers } from 'lucide-react';

/**
 * Wspólny język wiersza newsa — Przegląd (`DailyDigestCard`) i `/newsy` biorą tagi, relacje i ikonę
 * linku stąd, żeby znów się nie rozjechały (ROADMAP 4c, spec `docs/specs/2026-11-02-newsy-lista-spojna.md`).
 * Hierarchia: tytuł (z ikoną) > źródło · czas > tagi. Czerwień marki nie jest kolorem metadanych:
 * czerwone tagi i czas czytały się jak błąd (zrzut właściciela 30.10).
 */

/** Tag neutralny: cienka ramka, wersaliki, kolor muted. */
export const NEUTRAL_TAG =
    'inline-flex shrink-0 items-center whitespace-nowrap rounded border border-mk-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-mk-muted';

export function NewsTag({ label }: { label: string }) {
    return <span className={NEUTRAL_TAG}>{label}</span>;
}

/**
 * „N niezależne relacje” — dyskretnie, bez zielonej pigułki. Przy `wire` i N < 2 — „depesza”
 * (ten sam tekst w kilku serwisach). Dla N < 2 bez `wire` nic nie pokazuje.
 */
export function Corroboration({
    n,
    wire = false,
    alsoIn,
    compact = false,
}: {
    n: number;
    wire?: boolean;
    alsoIn?: string[];
    compact?: boolean;
}) {
    const same = alsoIn?.length ? `Ten sam temat: ${alsoIn.join(', ')}` : undefined;
    if (wire && n < 2) {
        return (
            <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-mk-muted"
                title={same ? `${same} — opisy niemal identyczne, to ta sama depesza w kilku serwisach` : undefined}
            >
                <Copy size={11} aria-hidden /> {compact ? 'depesza' : 'ta sama depesza'}
            </span>
        );
    }
    const label = relationsLabel(n);
    if (!label) return null;
    return (
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-mk-muted" title={same}>
            <Layers size={11} aria-hidden /> {label}
        </span>
    );
}

/**
 * „2 niezależne relacje”, „5 niezależnych relacji” — odmiana tylko do wyświetlania. `corroborationLabel`
 * (`src/lib/news/daily.ts`) zostaje bez zmian, bo jego tekst idzie do wejścia briefu i walidatora liczb.
 */
export function relationsLabel(n: number): string | null {
    if (n < 2) return null;
    const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
    return few ? `${n} niezależne relacje` : `${n} niezależnych relacji`;
}

/** Ikona „otwiera się w nowej karcie” — przy tytule, nie samotnie przy prawej krawędzi. */
export function ExternalMark({ size = 13 }: { size?: number }) {
    return (
        <ArrowUpRight
            size={size}
            className="ml-1 inline-block align-[-1px] text-mk-faint transition-colors group-hover:text-mk-brand"
            aria-label="(otwiera się w nowej karcie)"
        />
    );
}
