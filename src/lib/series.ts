// Shared helpers for turning Eurostat/GUS responses into chart series.
import { formatDecimalPL } from '@/lib/formatters';
import type { EurostatResult } from '@/lib/hooks';

export type Point = { date: string; value: number };

/** Extract a clean [{date,value}] series for a geo (default PL) from an Eurostat result. */
export function plSeries(res?: EurostatResult, geo = 'PL'): Point[] {
    const arr = res?.data?.[geo] ?? [];
    return arr.filter((d) => d.value != null).map((d) => ({ date: d.date, value: d.value as number }));
}

export const lastOf = (s: Point[]): number | null => (s.length ? s[s.length - 1].value : null);
export const prevOf = (s: Point[]): number | null => (s.length > 1 ? s[s.length - 2].value : null);

/** Compact axis tick for "YYYY-MM" → "MM.YY" (quarters/other pass through). */
export const monthTick = (d: string): string => {
    const [y, m] = d.split('-');
    return m && /^\d{2}$/.test(m) ? `${m}.${y.slice(2)}` : d;
};

/** Format a number (or "—" for null) with a Polish decimal comma. */
export const fmtPL = (n: number | null | undefined, decimals = 1): string =>
    n == null ? '—' : formatDecimalPL(n, decimals);

/** Delta between the last two points (last − prev), rounded. */
export const deltaOf = (s: Point[], decimals = 1): number | null => {
    const a = lastOf(s), b = prevOf(s);
    return a != null && b != null ? +(a - b).toFixed(decimals) : null;
};
