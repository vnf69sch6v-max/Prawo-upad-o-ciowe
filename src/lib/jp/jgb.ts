// Rentowność japońskich obligacji skarbowych (JGB). Ministerstwo Finansów, pliki CSV bez klucza.
// Historia: angielski plik do końca poprzedniego miesiąca. Bieżący miesiąc: osobny plik (daty ery Reiwa).
import { formatDecimalPL } from '@/lib/formatters';

export const JGB_TENORS = ['1', '2', '5', '10', '20', '30', '40'] as const;
export type JgbTenor = (typeof JGB_TENORS)[number];

export interface JgbPoint {
    date: string;
    /** Rentowność 10-latki, %. */
    y10: number;
}

export interface JgbCurve {
    date: string;
    yields: Partial<Record<JgbTenor, number>>;
}

export interface JgbPayload {
    /** Ostatni dzień z 10-latką. */
    latest: JgbCurve;
    /** 10-latka, ostatnie 5 lat, do wykresu. */
    history: JgbPoint[];
    source: string;
    fetchedAt: string;
}

export const JGB_HISTORY_URL = 'https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/historical/jgbcme_all.csv';
export const JGB_MONTH_URL = 'https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcm.csv';
export const JGB_SOURCE = 'Ministerstwo Finansów Japonii · rentowność JGB';

const HEADER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '20', '25', '30', '40'];

export function jgbIsEmpty(p: JgbPayload | null | undefined): boolean {
    return !p?.latest?.yields?.['10'] || !p.history.length;
}

/** „R8.10.26” → 2026-10-26. R = Reiwa (2019), H = Heisei (1989), S = Showa (1926). */
export function parseJapaneseEraDate(raw: string): string | null {
    const m = raw.trim().match(/^([RHS])(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return null;
    const n = Number(m[2]);
    const year = m[1] === 'R' ? 2018 + n : m[1] === 'H' ? 1988 + n : 1925 + n;
    return iso(year, Number(m[3]), Number(m[4]));
}

function iso(year: number, month: number, day: number): string | null {
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseGregorianDate(raw: string): string | null {
    const m = raw.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!m) return null;
    return iso(Number(m[1]), Number(m[2]), Number(m[3]));
}

function yieldOf(cell: string | undefined): number | null {
    if (!cell || cell.trim() === '' || cell.trim() === '-') return null;
    const n = Number(cell);
    return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
}

export interface JgbRow { date: string; yields: Partial<Record<string, number>> }

/** Wiersze z nagłówkiem Date,1Y,… albo 基準日,1年,… Puste i dopiski ※ wypadają. */
export function parseJgbCsv(text: string, dateOf: (cell: string) => string | null): JgbRow[] {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    const header = lines.findIndex((line) => /1Y|1年/.test(line.split(',')[1] ?? ''));
    if (header < 0) throw new Error('JGB: brak nagłówka tenorów');
    const cols = lines[header].split(',').map((c) => c.trim());
    const index = new Map<string, number>();
    cols.forEach((name, i) => {
        const key = name.replace('年', '').replace('Y', '');
        if (HEADER.includes(key)) index.set(key, i);
    });
    if (!index.has('10')) throw new Error('JGB: brak kolumny 10 lat');
    const rows: JgbRow[] = [];
    for (const line of lines.slice(header + 1)) {
        if (!line.trim() || line.startsWith('※')) continue;
        const cells = line.split(',');
        const date = dateOf(cells[0] ?? '');
        if (!date) continue;
        const yields: Partial<Record<string, number>> = {};
        for (const [tenor, i] of index) {
            const value = yieldOf(cells[i]);
            if (value != null) yields[tenor] = value;
        }
        if (yields['10'] == null) continue;
        rows.push({ date, yields });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
}

/** Historia (daty gregoriańskie) plus bieżący miesiąc (ery japońskie). Miesiąc nadpisuje ten sam dzień. */
export function buildJgbPayload(historyText: string, monthText: string, now = new Date()): JgbPayload {
    const history = parseJgbCsv(historyText, parseGregorianDate);
    const month = parseJgbCsv(monthText, parseJapaneseEraDate);
    const byDate = new Map<string, JgbRow>();
    for (const row of history) byDate.set(row.date, row);
    for (const row of month) byDate.set(row.date, row);
    const all = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const latest = all[all.length - 1];
    if (!latest) throw new Error('JGB: brak notowań');
    const cutoff = new Date(now.getTime() - 5 * 366 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const points = all.filter((row) => row.date >= cutoff).map((row) => ({ date: row.date, y10: row.yields['10']! }));
    const yields = {} as JgbCurve['yields'];
    for (const tenor of JGB_TENORS) {
        const value = latest.yields[tenor];
        if (value != null) yields[tenor] = value;
    }
    return {
        latest: { date: latest.date, yields },
        history: points,
        source: JGB_SOURCE,
        fetchedAt: now.toISOString(),
    };
}

export function jgbSentence(p: JgbPayload): string {
    const y10 = p.latest.yields['10'];
    const y2 = p.latest.yields['2'];
    const y30 = p.latest.yields['30'];
    if (y10 == null) return '';
    const tail = y2 != null && y30 != null
        ? ` Krzywa: 2 lata ${formatDecimalPL(y2, 3)}%, 30 lat ${formatDecimalPL(y30, 3)}%.`
        : '';
    return `10-letnia obligacja Japonii rentuje ${formatDecimalPL(y10, 3)}%.${tail}`;
}
