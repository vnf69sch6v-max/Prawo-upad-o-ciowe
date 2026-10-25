import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Kryteria 8, 10 i 13 specyfikacji docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md: błędny parametr = 400
// bez odczytu cache i bez wywołania GUS; poprawne żądanie trafia w dzisiejszy klucz; `refresh=1` tylko dla roku bieżącego.
vi.mock('@/lib/server-cache', () => ({ withCache: vi.fn(async () => ({ ok: true })) }));

import { withCache } from '@/lib/server-cache';
import { warsawDate } from '@/lib/gus-params';
import { dbwSeriesCacheKey } from '@/lib/gus-dbw-series';
import { dbwSeriesPath } from '@/lib/gus-api-paths';

type Handler = (req: never) => Promise<Response>;
const ROUTES: Record<string, () => Promise<{ GET: Handler }>> = {
    'gus-cpi-full': () => import('@/app/api/gus-cpi-full/route'),
    'gus-ppi-full': () => import('@/app/api/gus-ppi-full/route'),
    'gus-koniunktura': () => import('@/app/api/gus-koniunktura/route'),
    'dbw-series': () => import('@/app/api/dbw-series/route'),
    'gus-monthly': () => import('@/app/api/gus-monthly/route'),
    'gus-cpi': () => import('@/app/api/gus-cpi/route'),
    dbw: () => import('@/app/api/dbw/route'),
};

const W = warsawDate(new Date()).year;
const fetchMock = vi.fn();
const cache = vi.mocked(withCache);

const ALL_ROUTES: Record<string, () => Promise<{ GET: Handler }>> = {
    ...ROUTES,
    'bdl-series': () => import('@/app/api/bdl-series/route'),
    'regional-gus': () => import('@/app/api/regional-gus/route'),
};

async function call(path: string, headers: Record<string, string> = {}) {
    const route = path.split('?')[0].replace('/api/', '');
    const { GET } = await ALL_ROUTES[route]();
    return GET(new Request(`https://savori.space${path}`, { headers }) as never);
}

beforeEach(() => {
    cache.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('CRON_SECRET', ''); // 1a: bez sekretu (dev, demo); testy 1b ustawiają go same
});
afterEach(() => vi.unstubAllEnvs());

const BAD: Record<string, string[]> = {
    'gus-cpi-full': ['?year=1', '?year=2030', `?year=${W}&year=${W}`],
    'gus-ppi-full': ['?year=2030', '?year=abc', '?year=-1'],
    'gus-koniunktura': ['?year=abc', '?year=1e3', `?year=${W + 2}`],
    'dbw-series': ['?var=1&przekroj=1&poz=1', `${dbwSeriesPath('retail').split('?')[1].replace(/^/, '?').replace('sub100=1', 'sub100=0')}`,
        `?${dbwSeriesPath('industry').split('?')[1]}&year=1`],
    'gus-monthly': ['?years=5', '?years=abc', '?years=4&years=4'],
    'gus-cpi': ['?year=1', '?year=abc', '?year=2030'],
    dbw: ['?var=1&przekroj=1&rok=2026', '?var=310&przekroj=484&rok=1', '?var=310&przekroj=484&okres=999'],
};

const GOOD: Record<string, [string, string]> = {
    'gus-cpi-full': [`?year=${W}`, `gus_cpi_full_${W}_v5`],
    'gus-ppi-full': ['', `gus_ppi_full_${W}_v2`],
    'gus-koniunktura': [`?year=${W}`, `gus_koniunktura_${W}_v2`],
    'dbw-series': [`?${dbwSeriesPath('retail').split('?')[1]}`, dbwSeriesCacheKey('retail', W)],
    'gus-monthly': ['', 'gus_monthly_v3_4'],
    'gus-cpi': ['', `gus_cpi_national_${W}_v3`],
    dbw: [`?var=310&przekroj=484&rok=${W}&okres=270`, `dbw_310_484_${W}_270`],
};

describe.each(Object.keys(ROUTES))('/api/%s', (route) => {
    it('błędny parametr: 400 { error, param }, no-store, bez cache i bez GUS', async () => {
        for (const qs of BAD[route]) {
            const res = await call(`/api/${route}${qs}`);
            expect(res.status, qs).toBe(400);
            expect(res.headers.get('cache-control')).toBe('no-store');
            const body = await res.json();
            expect(typeof body.error).toBe('string');
            expect(typeof body.param).toBe('string');
        }
        expect(cache).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('poprawne żądanie: jeden odczyt cache pod dzisiejszym kluczem', async () => {
        const [qs, key] = GOOD[route];
        const res = await call(`/api/${route}${qs}`);
        expect(res.status).toBe(200);
        expect(cache).toHaveBeenCalledTimes(1);
        expect(cache.mock.calls[0][1]).toBe(key);
    });
});

describe('refresh=1 tylko dla roku bieżącego (kryterium 10)', () => {
    it.each(['gus-cpi-full', 'gus-ppi-full', 'gus-koniunktura', 'dbw-series'])('/api/%s', async (route) => {
        const base = route === 'dbw-series' ? `${dbwSeriesPath('industry')}&` : `/api/${route}?`;
        const ttl = async (qs: string) => {
            cache.mockClear();
            await call(`${base}${qs}`);
            return cache.mock.calls[0][4] as number;
        };
        expect(await ttl('refresh=1')).toBe(-1);
        expect(await ttl(`year=${W}&refresh=1`)).toBe(-1);
        expect(await ttl(`year=${W - 1}&refresh=1`)).toBeGreaterThan(0);
        expect(await ttl(`year=${W}`)).toBeGreaterThan(0);
    });
});

describe('refresh=1 wymusza GUS tylko z Bearer CRON_SECRET (ROADMAP 1b)', async () => {
    const { CRON_ENDPOINTS } = await import('@/lib/cron-endpoints');
    const { internalInit } = await import('@/lib/internal-fetch');
    // 8 tras, które czytają `refresh`; ścieżka = poprawne żądanie (walidacja 1a), dopisujemy refresh=1.
    const PATHS: Record<string, string> = {
        'gus-cpi-full': '/api/gus-cpi-full', 'gus-ppi-full': '/api/gus-ppi-full', 'gus-koniunktura': '/api/gus-koniunktura',
        'dbw-series': dbwSeriesPath('retail'), 'gus-cpi': '/api/gus-cpi', 'gus-monthly': '/api/gus-monthly',
        'bdl-series': '/api/bdl-series?start=461680&count=12', 'regional-gus': '/api/regional-gus',
    };
    const withRefresh = (p: string) => `${p}${p.includes('?') ? '&' : '?'}refresh=1`;
    const run = async (path: string, headers: Record<string, string> = {}) => {
        cache.mockClear();
        await call(path, headers);
        expect(cache).toHaveBeenCalledTimes(1);
        return { key: cache.mock.calls[0][1] as string, ttl: cache.mock.calls[0][4] as number };
    };

    it.each(Object.keys(PATHS))('/api/%s: publiczne refresh=1 = zwykły TTL, z sekretem -1, ten sam klucz', async (route) => {
        vi.stubEnv('CRON_SECRET', 's');
        const plain = await run(PATHS[route]);
        const pub = await run(withRefresh(PATHS[route]));
        const wrong = await run(withRefresh(PATHS[route]), { authorization: 'Bearer x' });
        const cron = await run(withRefresh(PATHS[route]), { authorization: 'Bearer s' });
        expect(plain.ttl).toBeGreaterThan(0);
        expect(pub.ttl).toBe(plain.ttl);
        expect(wrong.ttl).toBe(plain.ttl);
        expect(cron.ttl).toBe(-1);
        expect(new Set([plain.key, pub.key, wrong.key, cron.key]).size).toBe(1);
        expect(fetchMock).not.toHaveBeenCalled();
        vi.stubEnv('CRON_SECRET', '');
        expect((await run(withRefresh(PATHS[route]))).ttl).toBe(-1); // bez sekretu jak dawniej
    });

    it('rok poprzedni nie jest wymuszany nawet z sekretem (reguła 1a zostaje)', async () => {
        vi.stubEnv('CRON_SECRET', 's');
        expect((await run(`/api/gus-cpi-full?year=${W - 1}&refresh=1`, { authorization: 'Bearer s' })).ttl).toBeGreaterThan(0);
    });

    it('crony (nagłówki internalInit) nadal wymuszają pobranie na każdej trasie z listy', async () => {
        vi.stubEnv('CRON_SECRET', 's');
        const headers = Object.fromEntries(new Headers(internalInit().headers).entries());
        let checked = 0;
        for (const ep of Object.values(CRON_ENDPOINTS).flat()) {
            const route = new URL(ep, 'https://x').pathname.replace('/api/', '');
            if (!(route in PATHS) || !ep.includes('refresh=1')) continue;
            expect((await run(ep, headers)).ttl, ep).toBe(-1);
            checked++;
        }
        expect(checked).toBeGreaterThanOrEqual(13);
    });
});
