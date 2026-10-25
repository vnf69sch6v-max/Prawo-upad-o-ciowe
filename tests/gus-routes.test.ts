import { beforeEach, describe, expect, it, vi } from 'vitest';

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

async function call(path: string) {
    const route = path.split('?')[0].replace('/api/', '');
    const { GET } = await ROUTES[route]();
    return GET(new Request(`https://savori.space${path}`) as never);
}

beforeEach(() => {
    cache.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

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
