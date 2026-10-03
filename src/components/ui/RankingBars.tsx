'use client';

export interface RankingRow {
    slug: string;
    name: string;
}

interface RankingBarsProps<T extends RankingRow> {
    rows: T[];
    valueOf: (row: T) => number | null;
    format: (value: number) => string;
    colors: string[];
    /** Niższa wartość = wyżej (np. bezrobocie). */
    asc?: boolean;
    selected?: string | null;
    onSelect?: (slug: string) => void;
}

const shortName = (name: string) => name.replace(/^województwo /i, '');

/**
 * Dotyk: wiersz ma 44 px (cel dotykowy), mysz zostaje przy gęstych 28 px.
 *
 * Poziome paski rankingu. Kolumny nie mają sztywnych szerokości: nazwa ma bazę `w-24 sm:w-40`,
 * ale może się skurczyć (truncate + title), pasek bierze resztę, a wartość nigdy nie jest ucinana.
 * Sztywne `w-40` + `w-24` + `min-w-12` dawały ≥ 348 px — przy 1024 px w kolumnie ~275 px
 * wartości „158 473" ucinały się do „158".
 */
export function RankingBars<T extends RankingRow>({
    rows,
    valueOf,
    format,
    colors,
    asc = false,
    selected,
    onSelect,
}: RankingBarsProps<T>) {
    const vals = rows.map(valueOf).filter((v): v is number => v != null);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    const colorAt = (v: number) =>
        colors[Math.min(colors.length - 1, Math.floor(((v - min) / (max - min || 1)) * colors.length))];
    const sorted = [...rows]
        .filter((r) => valueOf(r) != null)
        .sort((a, b) => (asc ? (valueOf(a) ?? 0) - (valueOf(b) ?? 0) : (valueOf(b) ?? 0) - (valueOf(a) ?? 0)));

    return (
        <ol className="min-w-0 space-y-1.5 pointer-coarse:space-y-0">
            {sorted.map((r, i) => {
                const v = valueOf(r) as number;
                const label = shortName(r.name);
                return (
                    <li key={r.slug}>
                        <button
                            type="button"
                            onClick={() => onSelect?.(r.slug)}
                            className={`mk-press-row flex min-h-7 w-full min-w-0 items-center gap-2 rounded-md text-left text-sm transition-colors hover:bg-mk-surface-alt pointer-coarse:min-h-11 ${
                                selected === r.slug ? 'bg-mk-surface-alt font-semibold text-mk-text' : 'text-mk-text'
                            }`}
                            aria-pressed={onSelect ? selected === r.slug : undefined}
                        >
                            <span className="w-5 shrink-0 text-right text-xs text-mk-faint">{i + 1}</span>
                            <span
                                data-ranking-name
                                title={label}
                                className="min-w-0 shrink basis-24 truncate sm:basis-40"
                            >
                                {label}
                            </span>
                            <span
                                data-ranking-bar
                                className="h-3 min-w-8 flex-1 rounded-full bg-mk-surface-alt"
                            >
                                <span
                                    className="block h-3 rounded-full"
                                    style={{ width: `${(v / max) * 100}%`, background: colorAt(v) }}
                                />
                            </span>
                            <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap pr-1 text-right font-semibold tnum">
                                {format(v)}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
