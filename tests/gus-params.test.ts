import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allowedYears, parseDbwSeries, parseGusMonthlyYears, parseGusYear, validateGusPath } from '@/lib/gus-params';
import { DBW_SERIES, dbwSeriesCacheKey, type DbwSeriesId } from '@/lib/gus-dbw-series';
import { cpiFullPath, dbwSeriesPath, gusCpiPath, gusMonthlyPath, koniunkturaPath, ppiFullPath } from '@/lib/gus-api-paths';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';
import { FRESHNESS_DATASETS, withRefreshParam } from '@/lib/freshness';

// Specyfikacja docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md, kryteria 5–7, 9, 11–13.
const MOMENTS = {
    zwykly: new Date('2026-10-25T12:00:00+02:00'),
    sylwesterRano: new Date('2026-12-31T10:00:00+01:00'),
    sylwesterPozno: new Date('2026-12-31T22:59:00Z'),
    nowyRokWarszawa: new Date('2026-12-31T23:30:00Z'),
    nowyRok: new Date('2027-01-01T12:00:00+01:00'),
};
const q = (o: Record<string, string> | string) => new URLSearchParams(o);
const accepted = (now: Date) => [2024, 2025, 2026, 2027, 2028].filter((y) => parseGusYear(q({ year: String(y) }), now).ok);

describe('rok (B1): Warszawa, bieżący i poprzedni, 31.12 także następny', () => {
    it('przyjęte lata w pięciu chwilach', () => {
        expect(accepted(MOMENTS.zwykly)).toEqual([2025, 2026]);
        expect(accepted(MOMENTS.sylwesterRano)).toEqual([2025, 2026, 2027]);
        expect(accepted(MOMENTS.sylwesterPozno)).toEqual([2025, 2026, 2027]);
        expect(accepted(MOMENTS.nowyRokWarszawa)).toEqual([2026, 2027]);
        expect(accepted(MOMENTS.nowyRok)).toEqual([2026, 2027]);
        expect(allowedYears(MOMENTS.zwykly)).toEqual([2025, 2026]);
    });

    it('brak albo pusty rok = rok Warszawy (nie UTC)', () => {
        expect(parseGusYear(q({}), MOMENTS.nowyRokWarszawa)).toEqual({ ok: true, value: { year: 2027, current: true } });
        expect(parseGusYear(q('year='), MOMENTS.zwykly)).toEqual({ ok: true, value: { year: 2026, current: true } });
        expect(parseGusYear(q({ year: '2025' }), MOMENTS.zwykly)).toEqual({ ok: true, value: { year: 2025, current: false } });
    });

    it('złe formaty i powtórzony parametr → błąd', () => {
        for (const y of ['1', '0', '-1', '2024', '2027', '2030', '2026abc', '2026.0', ' 2026', '02026', '1e3', 'abc']) {
            const r = parseGusYear(q({ year: y }), MOMENTS.zwykly);
            expect(r.ok, y).toBe(false);
            if (!r.ok) expect(r.param).toBe('year');
        }
        expect(parseGusYear(q('year=2026&year=2026'), MOMENTS.zwykly).ok).toBe(false);
    });
});

describe('dbw-series (B3): tylko serie z listy', () => {
    const ids = Object.keys(DBW_SERIES) as DbwSeriesId[];
    const sp = (path: string) => new URL(path, 'https://x').searchParams;

    it('każda z sześciu serii z funkcji budującej jest przyjęta i rozpoznana', () => {
        expect(ids).toHaveLength(6);
        for (const id of ids) expect(parseDbwSeries(sp(dbwSeriesPath(id)))).toEqual({ ok: true, value: id });
    });

    it('dzisiejsze literały cronów dbw-1/2/3 (6b7a32b) są przyjęte i trafiają w te same klucze', () => {
        const legacy: [string, string][] = [
            ['/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&freq=q&refresh=1', 'dbwser_310_484_4801795-4801796_2026_q_5_v3'],
            ['/api/dbw-series?var=312&przekroj=93&poz=6661787&refresh=1', 'dbwser_312_93_6661787_2026_m_5_v3'],
            ['/api/dbw-series?var=324&przekroj=775&poz=7124703&poz=7124713&poz=7124724&poz=7189791&poz=7121981&refresh=1',
                'dbwser_324_775_7124703-7124713-7124724-7189791-7121981_2026_m_5_v3'],
        ];
        for (const [path, key] of legacy) {
            const r = parseDbwSeries(sp(path));
            expect(r.ok, path).toBe(true);
            if (r.ok) expect(dbwSeriesCacheKey(r.value, 2026)).toBe(key);
        }
    });

    it('klucze cache bez zmian (B8)', () => {
        expect(ids.map((id) => dbwSeriesCacheKey(id, 2026))).toEqual([
            'dbwser_814_807_6661769_2026_m_7_v3',
            'dbwser_392_93_6661787_2026_m_7_v3',
            'dbwser_109_849_6661586_2026_m_7_v3',
            'dbwser_310_484_4801795-4801796_2026_q_5_v3',
            'dbwser_312_93_6661787_2026_m_5_v3',
            'dbwser_324_775_7124703-7124713-7124724-7189791-7121981_2026_m_5_v3',
        ]);
    });

    it('odrzucane: nieznana seria, inna lista poz, zła freq/prez, inny region, surowy indeks, powtórzenia, braki', () => {
        const retail = dbwSeriesPath('retail');
        const bad = [
            '/api/dbw-series?var=1&przekroj=1&poz=1',
            '/api/dbw-series?var=310&przekroj=1&poz=4801795&poz=4801796&freq=q',
            '/api/dbw-series?var=310&przekroj=484&poz=4801796&poz=4801795&freq=q',             // inna kolejność
            '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&poz=1&freq=q',       // dodatkowa pozycja
            '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796',                    // freq niezgodne z serią
            '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&freq=x',
            '/api/dbw-series?var=324&przekroj=775&poz=7124703&poz=7124713&poz=7124724&poz=7189791&poz=7121981&prez=7',
            `${retail}&sub100=0`.replace('sub100=1&', ''),                                       // surowy indeks na kluczu Przeglądu
            retail.replace('poz1=33617', 'poz1=1'),                                              // inny region
            `${retail}&var=109`,                                                                 // powtórzony var
            '/api/dbw-series?var=310&przekroj=484&freq=q',                                       // brak poz
            '/api/dbw-series?var=abc&przekroj=484&poz=4801795&poz=4801796&freq=q',
        ];
        for (const path of bad) expect(parseDbwSeries(sp(path)).ok, path).toBe(false);
        expect(parseDbwSeries(sp(retail.replace('sub100=1', 'sub100=0')))).toMatchObject({ ok: false, param: 'sub100' });
        expect(parseDbwSeries(sp(retail.replace('poz1=33617', 'poz1=1')))).toMatchObject({ ok: false, param: 'poz1' });
    });
});

describe('gus-monthly (B4)', () => {
    it('years: brak albo 4', () => {
        expect(parseGusMonthlyYears(q({}))).toEqual({ ok: true, value: 4 });
        expect(parseGusMonthlyYears(q({ years: '4' }))).toEqual({ ok: true, value: 4 });
        for (const s of ['years=5', 'years=abc', 'years=4&years=4']) expect(parseGusMonthlyYears(q(s)).ok, s).toBe(false);
    });
});

describe('zablokowane trasy (B5)', () => {
    it('/api/dbw i /api/gus-cpi: zły rok albo seria spoza listy → błąd', () => {
        const now = MOMENTS.zwykly;
        for (const p of ['/api/dbw?var=1&przekroj=1&rok=2026', '/api/dbw?var=310&przekroj=484&rok=1', '/api/dbw?var=310&przekroj=484&rok=2026&okres=999',
            '/api/dbw?var=310&przekroj=484&rok=2026&okres=247&okres=248', '/api/gus-cpi?year=1']) {
            expect(validateGusPath(p, now)?.ok, p).toBe(false);
        }
        expect(validateGusPath('/api/dbw?var=310&przekroj=484&rok=2026&okres=270', now)?.ok).toBe(true);
    });

    it('dbw-3 ma 2 endpointy i żaden cron nie woła /api/gus-cpi', () => {
        expect(CRON_ENDPOINTS['dbw-3']).toHaveLength(2);
        for (const eps of Object.values(CRON_ENDPOINTS)) for (const ep of eps) expect(new URL(ep, 'https://x').pathname).not.toBe('/api/gus-cpi');
    });
});

describe('nasze ścieżki nigdy nie dostają 400 (kryterium 11)', () => {
    const builders = [
        cpiFullPath(), cpiFullPath({ refresh: '1' }), ppiFullPath(), ppiFullPath({ refresh: '1' }), koniunkturaPath(),
        gusMonthlyPath(), gusCpiPath(), ...(Object.keys(DBW_SERIES) as DbwSeriesId[]).map((id) => dbwSeriesPath(id)),
    ];
    it.each(Object.entries(MOMENTS))('%s', (_, now) => {
        const paths = [
            ...Object.values(CRON_ENDPOINTS).flat(),
            ...FRESHNESS_DATASETS.flatMap((d) => [d.endpoint(now), withRefreshParam(d.endpoint(now))]),
            ...builders,
        ];
        let checked = 0;
        for (const p of paths) {
            const r = validateGusPath(p, now);
            if (r === null) continue;
            checked++;
            expect(r.ok, `${p} → ${r.ok ? '' : r.error}`).toBe(true);
        }
        expect(checked).toBeGreaterThan(20);
    });
});

describe('ścieżki powstają w jednym miejscu (kryterium 12)', () => {
    const ROUTES = ['gus-cpi-full', 'gus-ppi-full', 'gus-koniunktura', 'dbw-series', 'gus-monthly'];
    // gus-params.ts nazywa trasy w walidatorze ścieżek (`validateGusPath`), nie buduje adresów.
    const ALLOWED = new Set(['src/lib/gus-api-paths.ts', 'src/lib/gus-params.ts', ...ROUTES.map((r) => `src/app/api/${r}/route.ts`)]);
    const LITERAL = new RegExp(`['"\`]/api/(${ROUTES.join('|')})\\b`);
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
    });

    it('brak literałów ścieżek poza modułem funkcji budujących', () => {
        const hits: string[] = [];
        for (const file of walk('src')) {
            if (ALLOWED.has(file)) continue;
            readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
                const t = line.trim();
                if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
                if (LITERAL.test(line)) hits.push(`${file}:${i + 1}`);
            });
        }
        expect(hits).toEqual([]);
        expect(readFileSync('src/app/ceny/page.tsx', 'utf8')).not.toContain('config={{');
    });
});

describe('przeglądarka nie wymusza pobrania z GUS (ROADMAP 1b)', () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
    });
    it('komponenty i hooki bez refresh=1, nigdzie refreshFromSource', () => {
        for (const file of [...walk('src/components'), 'src/lib/hooks.ts']) {
            // Kod, nie komentarze (np. „bez refresh=1 (limit DBW)”).
            const code = readFileSync(file, 'utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).filter((l) => !l.trim().startsWith('*'));
            expect(code.some((l) => /refresh=1|refresh: '1'/.test(l)), file).toBe(false);
        }
        for (const file of walk('src')) expect(readFileSync(file, 'utf8').includes('refreshFromSource'), file).toBe(false);
    });
});
