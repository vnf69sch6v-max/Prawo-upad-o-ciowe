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
 * Poziome paski rankingu. `w-40` na etykiecie zjada flex-1 pasek poniżej ~378px
 * (mierzony 0px przy 320/375). Etykieta: `w-24 sm:w-40`.
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
        <ol className="min-w-0 space-y-1.5">
            {sorted.map((r, i) => {
                const v = valueOf(r) as number;
                const label = shortName(r.name);
                return (
                    <li key={r.slug}>
                        <button
                            type="button"
                            onClick={() => onSelect?.(r.slug)}
                            className={`flex w-full min-w-0 items-center gap-2 text-left text-sm ${
                                selected === r.slug ? 'font-semibold text-mk-text' : 'text-mk-text'
                            }`}
                        >
                            <span className="w-5 shrink-0 text-right text-xs text-mk-faint">{i + 1}</span>
                            <span
                                data-ranking-name
                                title={label}
                                className="w-24 shrink-0 truncate sm:w-40"
                            >
                                {label}
                            </span>
                            <span
                                data-ranking-bar
                                className="h-3 min-w-12 flex-1 rounded-full bg-mk-surface-alt"
                            >
                                <span
                                    className="block h-3 rounded-full"
                                    style={{ width: `${(v / max) * 100}%`, background: colorAt(v) }}
                                />
                            </span>
                            <span className="w-16 shrink-0 text-right font-semibold tnum sm:w-24">
                                {format(v)}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
