// Shared DBW fetch helpers. DBW returns ONE period per call, so long histories need
// many calls — done with bounded concurrency + 429 backoff, then cached upstream.
const BASE = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';
const GRUPA_OGOLEM = 6902025;
const POLSKA = 33617;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface DbwRow {
    'id-pozycja-1': number; 'id-pozycja-2': number; 'id-pozycja-3'?: number;
    'id-okres'?: number;
    'id-sposob-prezentacji-miara': number; wartosc: number;
}

export interface DbwPeriod { rok: number; okres: number; przekroj: number; key: string }

async function fetchOne(varId: number, p: DbwPeriod): Promise<DbwRow[] | null> {
    const url = `${BASE}?id-zmienna=${varId}&id-przekroj=${p.przekroj}&id-rok=${p.rok}&id-okres=${p.okres}&ile-na-stronie=9000&numer-strony=0&lang=pl`;
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(2000 + attempt * 1500); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data as DbwRow[]) ?? null;
    }
    return null;
}

/** Fetch many periods with bounded concurrency. Returns a map keyed by period.key. */
export async function dbwFetchMany(varId: number, periods: DbwPeriod[], concurrency = 5): Promise<Map<string, DbwRow[]>> {
    const out = new Map<string, DbwRow[]>();
    let idx = 0;
    async function worker() {
        while (idx < periods.length) {
            const p = periods[idx++];
            const rows = await fetchOne(varId, p);
            if (rows) out.set(p.key, rows);
            await sleep(50);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, periods.length) }, worker));
    return out;
}

/** Value for a position at presentation `prez` (5=y/y, 2=m/m). Index → % change (val−100). */
export function pick(rows: DbwRow[], poz: number, prez: number): number | null {
    const m = rows.filter((r) => r['id-pozycja-1'] === POLSKA && r['id-pozycja-2'] === poz && r['id-sposob-prezentacji-miara'] === prez);
    if (!m.length) return null;
    const row = m.find((r) => r['id-pozycja-3'] === GRUPA_OGOLEM) ?? m[0];
    return row.wartosc != null ? +(row.wartosc - 100).toFixed(1) : null;
}

/** Same as pick(), but also filters to a single period (id-okres) — for whole-year fetches. */
export function pickOkres(rows: DbwRow[], okres: number, poz: number, prez: number): number | null {
    return pick(rows.filter((r) => r['id-okres'] === okres), poz, prez);
}

/**
 * Fetch a whole variable×przekrój×year in ONE call (no id-okres). If DBW returns every
 * period for the year, this collapses 12 monthly calls → 1 — essential under the ~100 req/15min limit.
 * Returns all rows (each carrying its own id-okres); split per-period with pickOkres().
 */
export async function fetchYear(varId: number, przekroj: number, rok: number): Promise<DbwRow[] | null> {
    const url = `${BASE}?id-zmienna=${varId}&id-przekroj=${przekroj}&id-rok=${rok}&ile-na-stronie=50000&numer-strony=0&lang=pl`;
    for (let attempt = 0; attempt < 4; attempt++) {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(2500 + attempt * 2000); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data as DbwRow[]) ?? null;
    }
    return null;
}

/** Fetch several (przekrój, rok) years with LOW bounded concurrency (DBW rate limits hard). */
export async function fetchYears(
    varId: number,
    reqs: { przekroj: number; rok: number }[],
    concurrency = 2,
): Promise<Map<number, DbwRow[]>> {
    const out = new Map<number, DbwRow[]>();
    let idx = 0;
    async function worker() {
        while (idx < reqs.length) {
            const r = reqs[idx++];
            const rows = await fetchYear(varId, r.przekroj, r.rok);
            if (rows) out.set(r.rok, rows);
            await sleep(300);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, reqs.length) }, worker));
    return out;
}

/** Month okres code (M01=247). Quarter okres code (Q1=270). */
export const monthOkres = (m: number) => 246 + m;
export const quarterOkres = (q: number) => 269 + q;

/** Build a list of monthly periods across [startYear..endYear], choosing przekrój per year. */
export function monthlyPeriods(startYear: number, endYear: number, przekrojFor: (y: number) => number): DbwPeriod[] {
    const out: DbwPeriod[] = [];
    for (let y = startYear; y <= endYear; y++) {
        for (let m = 1; m <= 12; m++) out.push({ rok: y, okres: monthOkres(m), przekroj: przekrojFor(y), key: `${y}-${String(m).padStart(2, '0')}` });
    }
    return out;
}

export function quarterlyPeriods(startYear: number, endYear: number, przekrojFor: (y: number) => number): DbwPeriod[] {
    const out: DbwPeriod[] = [];
    for (let y = startYear; y <= endYear; y++) {
        for (let q = 1; q <= 4; q++) out.push({ rok: y, okres: quarterOkres(q), przekroj: przekrojFor(y), key: `${y}-Q${q}` });
    }
    return out;
}
