// Zakresy czasu dla wykresów (3M / 1R / 5L …) liczone po DATACH, nie po liczbie punktów.
//
// Dawniej `InteractiveChart` robił `data.slice(-N)` z N = liczba miesięcy, czyli zakładał serię
// miesięczną. Na serii dziennej (WIG20, kurs spółki) „3M" pokazywało 3 SESJE, na kwartalnej
// „1R" — 12 kwartałów. Tu każdą etykietę osi X sprowadzamy do punktu w czasie i tniemy po nim.

import { formatDataPeriod } from '@/lib/formatters';

export type RangeKey = '1M' | '3M' | '6M' | '1R' | '3L' | '5L' | 'ALL';

export const RANGE_MONTHS: Record<RangeKey, number | null> = {
    '1M': 1, '3M': 3, '6M': 6, '1R': 12, '3L': 36, '5L': 60, ALL: null,
};

type Period =
    | { kind: 'day'; ms: number; y: number; m: number; d: number }
    | { kind: 'month' | 'quarter' | 'year'; monthIdx: number };

const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const QUARTER_RE = /^(\d{4})-Q([1-4])$/;
const YEAR_RE = /^(\d{4})$/;

/** Okres → punkt na osi czasu. Kwartał i rok liczymy od OSTATNIEGO miesiąca okresu. */
function parsePeriod(x: unknown): Period | null {
    const s = typeof x === 'number' ? String(x) : typeof x === 'string' ? x : null;
    if (!s) return null;
    let m = s.match(DAY_RE);
    if (m) return { kind: 'day', ms: Date.UTC(+m[1], +m[2] - 1, +m[3]), y: +m[1], m: +m[2], d: +m[3] };
    m = s.match(MONTH_RE);
    if (m) return { kind: 'month', monthIdx: +m[1] * 12 + (+m[2] - 1) };
    m = s.match(QUARTER_RE);
    if (m) return { kind: 'quarter', monthIdx: +m[1] * 12 + (+m[2] * 3 - 1) };
    m = s.match(YEAR_RE);
    if (m) return { kind: 'year', monthIdx: +m[1] * 12 + 11 };
    return null;
}

/** Ziarnistość etykiety osi: dzień / miesiąc / kwartał / rok (null — nie data). */
export function periodKind(x: unknown): Period['kind'] | null {
    return parsePeriod(x)?.kind ?? null;
}

/**
 * Wiersze z ostatnich `months` miesięcy (licząc od ostatniego punktu serii).
 * Seria, której osi nie umiemy odczytać jako dat, wraca do starego zachowania (ostatnie N punktów).
 */
export function sliceByMonths<T extends Record<string, unknown>>(rows: T[], xKey: string, months: number): T[] {
    if (rows.length === 0) return rows;
    const last = parsePeriod(rows[rows.length - 1][xKey]);
    if (!last) return rows.slice(-months);
    if (last.kind === 'day') {
        const cutoff = Date.UTC(last.y, last.m - 1 - months, last.d);
        return rows.filter((r) => {
            const p = parsePeriod(r[xKey]);
            return p?.kind === 'day' ? p.ms > cutoff : true;
        });
    }
    const cutoff = last.monthIdx - months;
    return rows.filter((r) => {
        const p = parsePeriod(r[xKey]);
        return p && p.kind !== 'day' ? p.monthIdx > cutoff : true;
    });
}

/**
 * Zakresy, które coś zmieniają: przycisk „1R" przy 60 sesjach danych pokazywał to samo co „ALL"
 * i udawał funkcję. Zostawiamy tylko te, które przycinają serię i zostawiają ≥ 2 punkty; ALL zawsze.
 */
export function usefulRanges<T extends Record<string, unknown>>(rows: T[], xKey: string, ranges: RangeKey[]): RangeKey[] {
    return ranges.filter((r) => {
        const months = RANGE_MONTHS[r];
        if (months == null) return true;
        const n = sliceByMonths(rows, xKey, months).length;
        return n >= 2 && n < rows.length;
    });
}

/** Nagłówek tooltipa: „30.09.2026", „sierpień 2026", „II kwartał 2026", „2025". */
export function formatPeriodLabel(x: unknown): string {
    const s = typeof x === 'number' ? String(x) : typeof x === 'string' ? x : '';
    // Z napisu, nie przez `new Date()` — to byłaby północ UTC, czyli „wczoraj" na zachód od Greenwich.
    const day = s.match(DAY_RE);
    if (day) return `${day[3]}.${day[2]}.${day[1]}`;
    if (MONTH_RE.test(s) || QUARTER_RE.test(s)) return formatDataPeriod(s);
    return s;
}
