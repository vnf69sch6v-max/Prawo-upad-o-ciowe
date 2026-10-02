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

/** Oś serii DZIENNYCH: "YYYY-MM-DD" → "DD.MM". `monthTick` dawał tu „07.26 07.26 07.26…" (ten sam miesiąc co sesję). */
export const dayTick = (d: string): string => {
    const m = d.match(/^\d{4}-(\d{2})-(\d{2})$/);
    return m ? `${m[2]}.${m[1]}` : monthTick(d);
};

const QUARTER_ROMAN = ['I', 'II', 'III', 'IV'];
/** Oś serii KWARTALNYCH: "YYYY-Qn" → "II kw. 26". */
export const quarterTick = (d: string): string => {
    const m = d.match(/^(\d{4})-Q([1-4])$/);
    return m ? `${QUARTER_ROMAN[+m[2] - 1]} kw. ${m[1].slice(2)}` : d;
};

/** Format a number (or "—" for null) with a Polish decimal comma. */
export const fmtPL = (n: number | null | undefined, decimals = 1): string =>
    n == null ? '—' : formatDecimalPL(n, decimals);

/** Delta between the last two points (last − prev), rounded. */
export const deltaOf = (s: Point[], decimals = 1): number | null => {
    const a = lastOf(s), b = prevOf(s);
    return a != null && b != null ? +(a - b).toFixed(decimals) : null;
};
