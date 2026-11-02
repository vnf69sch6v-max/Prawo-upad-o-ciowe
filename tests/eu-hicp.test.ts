import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    EU_HICP_GEOS, euHicpHeadline, nextEuHicpRelease, parseEuHicp, rankRows, type EuHicpPayload,
} from '@/lib/eu/hicp';
import { FRESHNESS_DATASETS, datasetById, expectedEuHicp, extractEuHicp } from '@/lib/freshness';

const FIXTURE = 'tests/fixtures/eurostat-hicp-minr-2026-09.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw = (): any => JSON.parse(readFileSync(FIXTURE, 'utf8'));
const src = (path: string) => readFileSync(path, 'utf8');

/** Usuwa wartość geo×miesiąc z kopii fixture (indeks płaski). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dropValue(json: any, geo: string, month: string) {
    const ids: string[] = json.id;
    const sizes: number[] = json.size;
    const stride = (d: number) => sizes.slice(d + 1).reduce((a, b) => a * b, 1);
    const g = json.dimension.geo.category.index[geo];
    const t = json.dimension.time.category.index[month];
    delete json.value[String(g * stride(ids.indexOf('geo')) + t * stride(ids.indexOf('time')))];
    return json;
}

describe('Polska na tle UE — parser HICP (fixture 02.11.2026)', () => {
    const p = parseEuHicp(raw(), '2026-11-02T12:00:00.000Z');

    it('reads September 2026 and the Eurostat update time', () => {
        expect(p.latest).toBe('2026-09');
        expect(p.updated).toBe('2026-10-16T21:00:00.000Z');
        expect(p.dataset).toBe('prc_hicp_minr');
    });

    it('ranks the five series with month-on-month changes in p.p.', () => {
        expect(p.rows.map((r) => [r.geo, r.value, r.changePp, r.rank])).toEqual([
            ['PL', 4.0, 0.5, 1],
            ['EA', 3.8, 0.6, 2],
            ['DE', 3.3, 0.4, 3],
            ['CZ', 2.2, 0.7, 4],
            ['HU', 2.1, 0.3, 5],
        ]);
    });

    it('keeps a 24-month chart window 2024-10 … 2026-09', () => {
        for (const g of EU_HICP_GEOS) {
            expect(p.series[g]).toHaveLength(24);
            expect(p.series[g][0].date).toBe('2024-10');
            expect(p.series[g].at(-1)?.date).toBe('2026-09');
        }
        expect(p.series.PL[0].value).toBe(4.3);
        expect(p.series.EA[0].value).toBe(2.0);
    });

    it('writes the headline and the two-year context from data', () => {
        const h = euHicpHeadline(p);
        expect(h.headline).toContain('4,0%');
        expect(h.headline).toContain('wrzesień 2026');
        expect(h.headline).toContain('0,2 p.p. powyżej strefy euro (3,8%)');
        expect(h.headline).toContain('najwyżej w zestawieniu');
        expect(h.context).toContain('2,3 p.p.');
        expect(h.context).toContain('październik 2024');
    });

    it('falls back to the last month common to all five series', () => {
        const q = parseEuHicp(dropValue(raw(), 'HU', '2026-09'));
        expect(q.latest).toBe('2026-08');
        expect(q.rows.find((r) => r.geo === 'PL')?.value).toBe(3.5);
        expect(q.rows.find((r) => r.geo === 'EA')?.value).toBe(3.2);
        // Nowszy punkt Polski zostaje na wykresie.
        expect(q.series.PL.at(-1)?.date).toBe('2026-09');
    });
});

describe('Polska na tle UE — wniosek i ranking (dane syntetyczne)', () => {
    const base = parseEuHicp(raw());
    const withValues = (vals: Record<string, number>): EuHicpPayload => ({
        ...base,
        rows: rankRows(base.rows.map((r) => ({ geo: r.geo, name: r.name, prev: r.prev, changePp: r.changePp, value: vals[r.geo] ?? r.value }))),
    });

    it('says "poniżej" and "najniżej"', () => {
        const h = euHicpHeadline(withValues({ PL: 1.5 }));
        expect(h.headline).toContain('2,3 p.p. poniżej strefy euro (3,8%)');
        expect(h.headline).toContain('najniżej w zestawieniu');
    });

    it('says "na poziomie" within 0,05 p.p. and the middle place', () => {
        const h = euHicpHeadline(withValues({ PL: 3.8, EA: 3.8, DE: 4.5, CZ: 4.0 }));
        expect(h.headline).toContain('na poziomie strefy euro (3,8%)');
        expect(h.headline).toMatch(/[34]\. miejsce z 5/);
        const g = euHicpHeadline(withValues({ PL: 3.3, EA: 3.8, DE: 3.9, CZ: 4.0 }));
        expect(g.headline).toContain('4. miejsce z 5');
    });

    it('shares the place on a tie: 1, 2, 3, 4, 4', () => {
        const rows = withValues({ PL: 4.0, EA: 3.8, DE: 3.3, CZ: 2.1, HU: 2.1 }).rows;
        expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 4]);
        expect(rows.slice(3).map((r) => r.geo)).toEqual(['CZ', 'HU']); // alfabetycznie: Czechy, Węgry
    });
});

describe('Polska na tle UE — walidacja źródła', () => {
    it('throws without HU', () => {
        const j = raw();
        const idx = j.dimension.geo.category.index;
        delete idx.HU;
        expect(() => parseEuHicp(j)).toThrow(/HU/);
    });

    it('throws on an extra EU27_2020', () => {
        const j = raw();
        j.dimension.geo.category.index.EU27_2020 = 5;
        expect(() => parseEuHicp(j)).toThrow(/EU27_2020/);
    });

    it('throws on another unit', () => {
        const j = raw();
        j.dimension.unit.category.index = { I25: 0 };
        expect(() => parseEuHicp(j)).toThrow(/unit/);
    });

    it('throws on another coicop18', () => {
        const j = raw();
        j.dimension.coicop18.category.index = { CP01: 0 };
        expect(() => parseEuHicp(j)).toThrow(/coicop18/);
    });

    it('throws on the frozen ECOICOP v1 dataset label', () => {
        const j = raw();
        j.label = 'HICP - monthly data (annual rate of change)';
        expect(() => parseEuHicp(j)).toThrow(/ECOICOP/);
    });

    it('throws with fewer than 13 common months', () => {
        const j = raw();
        const months = Object.keys(j.dimension.time.category.index).sort().slice(0, 13);
        for (const m of months) dropValue(j, 'CZ', m);
        expect(() => parseEuHicp(j)).toThrow(/wspólnych/);
    });
});

describe('Polska na tle UE — świeżość, cron, trasa', () => {
    it('registers eu-hicp with the exact page endpoint', () => {
        const spec = datasetById('eu-hicp');
        expect(spec).toBeTruthy();
        expect(spec!.endpoint(new Date())).toBe('/api/eu-hicp');
        expect(FRESHNESS_DATASETS.filter((d) => d.id === 'eu-hicp')).toHaveLength(1);
        expect(spec!.extract(parseEuHicp(raw()))).toBe('2026-09');
        expect(extractEuHicp({})).toBeNull();
    });

    it('expects October from 18.11.2026 11:00 Warsaw, heuristic day 20 outside the map', () => {
        expect(expectedEuHicp(new Date('2026-11-18T09:59:00Z'))).toBe('2026-09'); // 10:59 CET
        expect(expectedEuHicp(new Date('2026-11-18T10:00:00Z'))).toBe('2026-10'); // 11:00 CET
        expect(expectedEuHicp(new Date('2027-01-15T12:00:00Z'))).toBe('2026-11');
        expect(expectedEuHicp(new Date('2027-01-20T12:00:00Z'))).toBe('2026-12');
        expect(nextEuHicpRelease(new Date('2026-11-02T12:00:00Z'))?.period).toBe('2026-10');
    });

    it('warms /api/eu-hicp in the refresh and nbp crons (same path as the page)', () => {
        for (const cron of ['src/app/api/cron/refresh/route.ts', 'src/app/api/cron/nbp/route.ts']) {
            expect(src(cron)).toContain("'/api/eu-hicp?refresh=1'");
        }
        expect('/api/eu-hicp?refresh=1'.replace(/\?refresh=1$/, '')).toBe(datasetById('eu-hicp')!.endpoint(new Date()));
    });

    it('route has its own maxDuration, a fixed cache key and a no-store upstream fetch', () => {
        const route = src('src/app/api/eu-hicp/route.ts');
        expect(route).toMatch(/export const maxDuration = 30;/);
        expect(route).not.toMatch(/searchParams\.get\('(?!refresh)/);
        const server = src('src/lib/eu/hicp-server.ts');
        expect(server).toContain("cache: 'no-store'");
        expect(server).toContain("doc: 'eu_hicp_v1'");
    });

    it('page reads only the cache (ISR), never upstream', () => {
        const page = src('src/app/ceny/na-tle-ue/page.tsx');
        expect(page).toMatch(/export const revalidate = 1800;/);
        expect(page).toContain('peekEuHicp');
        expect(page).not.toContain('getEuHicp');
        expect(page).not.toContain('fetch(');
    });
});
