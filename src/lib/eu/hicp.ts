// Polska na tle UE — inflacja HICP r/r (Eurostat `prc_hicp_minr`, ECOICOP ver. 2).
// Moduł czysty (bez fetch): parser JSON-stat z walidacją, ranking, wniosek, kalendarz publikacji.
// Specyfikacja: docs/specs/2026-11-02-polska-na-tle-ue-hicp.md.
import { formatDataPeriod } from '@/lib/formatters';

export const EU_HICP_DATASET = 'prc_hicp_minr';
export const EU_HICP_GEOS = ['PL', 'EA', 'DE', 'CZ', 'HU'] as const;
export type EuGeo = (typeof EU_HICP_GEOS)[number];

export const EU_GEO_NAMES: Record<EuGeo, string> = {
    PL: 'Polska', EA: 'Strefa euro', DE: 'Niemcy', CZ: 'Czechy', HU: 'Węgry',
};

/** Okno wykresu (miesiące). */
export const EU_HICP_WINDOW = 24;
/** Minimum wspólnych miesięcy — mniej znaczy, że Eurostat zwrócił okrojony zbiór. */
const MIN_COMMON_MONTHS = 13;

export const EU_HICP_SOURCE_URL = 'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_minr/default/table';

export interface EuHicpPoint { date: string; value: number }

export interface EuHicpRow {
    geo: EuGeo;
    name: string;
    value: number;
    prev: number | null;
    /** Zmiana stopy rocznej wobec poprzedniego miesiąca, p.p., zaokrąglona do 0,1. */
    changePp: number | null;
    rank: number;
}

export interface EuHicpPayload {
    dataset: typeof EU_HICP_DATASET;
    source: 'Eurostat';
    /** Aktualizacja zbioru w bazie Eurostatu (ISO, UTC). */
    updated: string;
    /** Ostatni miesiąc wspólny wszystkim 5 seriom — okres tabeli i wniosku. */
    latest: string;
    /** 24 miesiące kończące się najnowszym miesiącem dowolnej serii. */
    series: Record<EuGeo, EuHicpPoint[]>;
    rows: EuHicpRow[];
    fetchedAt: string;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export function shiftPeriod(period: string, delta: number): string {
    const [y, m] = period.split('-').map(Number);
    const idx = y * 12 + (m - 1) + delta;
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

type Dim = { label?: string; category: { index: Record<string, number> | string[]; label?: Record<string, string> } };

function catIndex(dim: Dim): Record<string, number> {
    const idx = dim.category.index;
    if (Array.isArray(idx)) return Object.fromEntries(idx.map((k, i) => [k, i]));
    return idx;
}

function onlyCategory(dims: Record<string, Dim>, id: string, expected: string): void {
    const d = dims[id];
    if (!d) throw new Error(`Eurostat HICP: brak wymiaru ${id}`);
    const keys = Object.keys(catIndex(d));
    if (keys.length !== 1 || keys[0] !== expected) {
        throw new Error(`Eurostat HICP: wymiar ${id} = ${keys.join(',')}, oczekiwano ${expected}`);
    }
}

/** „2026-10-16T23:00:00+0200” → ISO UTC. */
function normalizeUpdated(raw: unknown): string {
    if (typeof raw !== 'string') throw new Error('Eurostat HICP: brak pola updated');
    const fixed = raw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    const t = Date.parse(fixed);
    if (Number.isNaN(t)) throw new Error(`Eurostat HICP: nieczytelne updated ${raw}`);
    return new Date(t).toISOString();
}

export function parseEuHicp(raw: unknown, fetchedAt = new Date().toISOString()): EuHicpPayload {
    const r = raw as {
        label?: string; updated?: string; id?: string[]; size?: number[];
        value?: Record<string, number> | (number | null)[]; dimension?: Record<string, Dim>;
    };
    if (!r || typeof r !== 'object' || !r.id || !r.size || !r.dimension || !r.value) {
        throw new Error('Eurostat HICP: odpowiedź nie jest JSON-stat');
    }
    const label = r.label ?? '';
    if (!label.includes('HICP') || !label.includes('ECOICOP ver.2')) {
        throw new Error(`Eurostat HICP: nieoczekiwany zbiór „${label}” (wymagany ECOICOP ver.2)`);
    }
    const dims = r.dimension;
    onlyCategory(dims, 'unit', 'RCH_A');
    onlyCategory(dims, 'coicop18', 'TOTAL');
    onlyCategory(dims, 'freq', 'M');

    if (!dims.geo || !dims.time) throw new Error('Eurostat HICP: brak wymiaru geo/time');
    const geoIdx = catIndex(dims.geo);
    const geoKeys = Object.keys(geoIdx);
    const missing = EU_HICP_GEOS.filter((g) => !(g in geoIdx));
    const extra = geoKeys.filter((g) => !(EU_HICP_GEOS as readonly string[]).includes(g));
    if (missing.length || extra.length) {
        throw new Error(`Eurostat HICP: geo brak [${missing.join(',')}], nadmiar [${extra.join(',')}]`);
    }
    const eaLabel = dims.geo.category.label?.EA ?? '';
    if (!eaLabel.startsWith('Euro area')) throw new Error(`Eurostat HICP: EA = „${eaLabel}”`);

    // Kroki indeksu płaskiego (row-major). Wymiary inne niż geo/time mają rozmiar 1 (sprawdzone wyżej).
    const ids = r.id;
    const sizes = r.size;
    const strides = ids.map((_, d) => sizes.slice(d + 1).reduce((a, b) => a * b, 1));
    const gPos = ids.indexOf('geo');
    const tPos = ids.indexOf('time');
    if (gPos < 0 || tPos < 0) throw new Error('Eurostat HICP: brak geo/time w id');
    for (let d = 0; d < ids.length; d++) {
        if (d !== gPos && d !== tPos && sizes[d] !== 1) throw new Error(`Eurostat HICP: wymiar ${ids[d]} ma ${sizes[d]} kategorii`);
    }
    const times = Object.entries(catIndex(dims.time)).sort((a, b) => a[1] - b[1]);
    const values = r.value;
    const valueAt = (i: number): number | null => {
        const v = Array.isArray(values) ? values[i] : values[String(i)];
        return typeof v === 'number' && Number.isFinite(v) ? v : null;
    };

    const full = {} as Record<EuGeo, EuHicpPoint[]>;
    for (const g of EU_HICP_GEOS) {
        const pts: EuHicpPoint[] = [];
        for (const [date, ti] of times) {
            if (!/^\d{4}-\d{2}$/.test(date)) continue;
            const v = valueAt(geoIdx[g] * strides[gPos] + ti * strides[tPos]);
            if (v != null) pts.push({ date, value: v });
        }
        full[g] = pts;
    }

    const maps = Object.fromEntries(EU_HICP_GEOS.map((g) => [g, new Map(full[g].map((p) => [p.date, p.value]))])) as Record<EuGeo, Map<string, number>>;
    const common = full.PL.map((p) => p.date).filter((d) => EU_HICP_GEOS.every((g) => maps[g].has(d)));
    if (common.length < MIN_COMMON_MONTHS) {
        throw new Error(`Eurostat HICP: tylko ${common.length} wspólnych miesięcy`);
    }
    const latest = common[common.length - 1];
    const prevMonth = shiftPeriod(latest, -1);

    const newest = EU_HICP_GEOS.map((g) => full[g][full[g].length - 1]?.date ?? '').sort().pop()!;
    const from = shiftPeriod(newest, -(EU_HICP_WINDOW - 1));
    const series = {} as Record<EuGeo, EuHicpPoint[]>;
    for (const g of EU_HICP_GEOS) series[g] = full[g].filter((p) => p.date >= from && p.date <= newest);

    const rows = rankRows(EU_HICP_GEOS.map((g) => {
        const value = maps[g].get(latest)!;
        const prev = maps[g].get(prevMonth) ?? null;
        return { geo: g, name: EU_GEO_NAMES[g], value, prev, changePp: prev == null ? null : round1(value - prev) };
    }));

    return { dataset: EU_HICP_DATASET, source: 'Eurostat', updated: normalizeUpdated(r.updated), latest, series, rows, fetchedAt };
}

/** Ranking malejąco po wartości; remis dzieli miejsce (1, 2, 2, 4), w remisie kolejność alfabetyczna. */
export function rankRows(rows: Omit<EuHicpRow, 'rank'>[]): EuHicpRow[] {
    const sorted = [...rows].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'pl'));
    return sorted.map((row) => ({ ...row, rank: 1 + sorted.filter((o) => o.value > row.value).length }));
}

export function euHicpIsEmpty(p: EuHicpPayload | null | undefined): boolean {
    return !p || !Array.isArray(p.rows) || p.rows.length !== EU_HICP_GEOS.length || !p.latest;
}

// ─── Formatowanie ───────────────────────────────────────

export function fmtPct(v: number): string {
    return `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`;
}

export function fmtSignedPp(v: number): string {
    const r = round1(v);
    if (r === 0) return '0,0';
    return `${r > 0 ? '+' : '−'}${Math.abs(r).toFixed(1).replace('.', ',')}`;
}

/** Data aktualizacji Eurostatu w strefie Warszawy: „16.10.2026”. */
export function formatUpdatedPL(iso: string): string {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('day')}.${get('month')}.${get('year')}`;
}

export interface EuHicpHeadline { headline: string; context: string | null }

/** Wniosek u góry strony. Zero liczb na sztywno — wszystko z payloadu. */
export function euHicpHeadline(p: EuHicpPayload): EuHicpHeadline {
    const pl = p.rows.find((r) => r.geo === 'PL')!;
    const ea = p.rows.find((r) => r.geo === 'EA')!;
    const diff = round1(pl.value - ea.value);
    const vsEa = Math.abs(pl.value - ea.value) <= 0.05
        ? `na poziomie strefy euro (${fmtPct(ea.value)}%)`
        : `${fmtPct(Math.abs(diff))} p.p. ${diff > 0 ? 'powyżej' : 'poniżej'} strefy euro (${fmtPct(ea.value)}%)`;
    const n = p.rows.length;
    const place = pl.rank === 1 ? 'najwyżej w zestawieniu' : pl.rank === n ? 'najniżej w zestawieniu' : `${pl.rank}. miejsce z ${n}`;
    const headline = `Inflacja HICP w Polsce za ${formatDataPeriod(p.latest)}: ${fmtPct(pl.value)}%, ${vsEa}, ${place}.`;

    const start = shiftPeriod(p.latest, -(EU_HICP_WINDOW - 1));
    const plStart = p.series.PL.find((x) => x.date === start);
    const eaStart = p.series.EA.find((x) => x.date === start);
    const context = plStart && eaStart
        ? `Różnica Polska − strefa euro: ${fmtSignedPp(diff)} p.p. Na początku wykresu (${formatDataPeriod(start)}) wynosiła ${fmtSignedPp(plStart.value - eaStart.value)} p.p.`
        : null;
    return { headline, context };
}

/** Wiersze wykresu: { date, PL, EA, DE, CZ, HU }. */
export function euHicpChartRows(p: EuHicpPayload): Record<string, string | number>[] {
    const byDate = new Map<string, Record<string, string | number>>();
    for (const g of EU_HICP_GEOS) {
        for (const pt of p.series[g] ?? []) {
            const row = byDate.get(pt.date) ?? { date: pt.date };
            row[g] = pt.value;
            byDate.set(pt.date, row);
        }
    }
    return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

// ─── Kalendarz publikacji (Euro indicators, 11:00 Luksemburg = Warszawa) ───

/** Okres → moment komunikatu. Tylko daty potwierdzone u Eurostatu (listopad 17.12 — dopisać po potwierdzeniu). */
export const EU_HICP_RELEASES: Record<string, string> = {
    '2026-09': '2026-10-16T11:00:00+02:00',
    '2026-10': '2026-11-18T11:00:00+01:00',
};

/** Ostatni okres, którego komunikat już wyszedł wg mapy (null, gdy żaden). */
export function euHicpReleasedPeriod(now: Date): string | null {
    let hit: string | null = null;
    for (const [period, at] of Object.entries(EU_HICP_RELEASES).sort()) {
        if (Date.parse(at) <= now.getTime()) hit = period;
    }
    return hit;
}

/** Następny komunikat po `now` z mapy (null poza mapą). */
export function nextEuHicpRelease(now: Date): { period: string; at: string } | null {
    for (const [period, at] of Object.entries(EU_HICP_RELEASES).sort()) {
        if (Date.parse(at) > now.getTime()) return { period, at };
    }
    return null;
}
