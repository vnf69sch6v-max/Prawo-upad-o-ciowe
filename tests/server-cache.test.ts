import { beforeEach, describe, expect, it, vi } from 'vitest';

// Firestore w pamięci: tylko to, czego używa `server-cache` (collection().doc().get()/set()).
const store = new Map<string, Record<string, unknown>>();
const fakeDb = {
    collection: (c: string) => ({
        doc: (d: string) => ({
            get: async () => {
                const data = store.get(`${c}/${d}`);
                return { exists: data !== undefined, data: () => data };
            },
            set: async (data: Record<string, unknown>) => {
                store.set(`${c}/${d}`, data);
            },
        }),
    }),
};

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: () => fakeDb }));

const { withCache, FORCED_REFRESH_MIN_AGE_MS } = await import('@/lib/server-cache');

const MIN = 60_000;
const COL = 'macro_data';
const DOC = 'test_key';

function seed(payload: unknown, ageMs: number) {
    store.set(`${COL}/${DOC}`, { payload, updatedAt: Date.now() - ageMs, source: 'seed' });
}
const stored = () => store.get(`${COL}/${DOC}`) as { payload: unknown; updatedAt: number } | undefined;
const flush = () => new Promise((r) => setTimeout(r, 0)); // zapis w withCache jest fire-and-forget

beforeEach(() => {
    store.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => { });
});

describe('withCache — limit wymuszonego odświeżenia (?refresh=1)', () => {
    it('stała to 10 min', () => {
        expect(FORCED_REFRESH_MIN_AGE_MS).toBe(10 * MIN);
    });

    it('force + wpis sprzed 2 min → bez wołania źródła, oddaje cache', async () => {
        seed({ series: [1] }, 2 * MIN);
        const fetcher = vi.fn(async () => ({ series: [2] }));
        const out = await withCache(COL, DOC, fetcher, 'test', -1);
        expect(fetcher).not.toHaveBeenCalled();
        expect(out).toEqual({ series: [1] });
    });

    it('force + wpis sprzed 11 min → woła źródło i zapisuje nowy wpis', async () => {
        seed({ series: [1] }, 11 * MIN);
        const fetcher = vi.fn(async () => ({ series: [2] }));
        const before = Date.now();
        const out = await withCache(COL, DOC, fetcher, 'test', -1);
        await flush();
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(out).toEqual({ series: [2] });
        expect(stored()?.payload).toEqual({ series: [2] });
        expect(stored()!.updatedAt).toBeGreaterThanOrEqual(before);
    });

    it('force bez wpisu → woła źródło', async () => {
        const fetcher = vi.fn(async () => ({ series: [2] }));
        expect(await withCache(COL, DOC, fetcher, 'test', -1)).toEqual({ series: [2] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });
});

describe('withCache — zwykły TTL bez zmian', () => {
    it('wpis młodszy niż TTL → cache; starszy → źródło', async () => {
        seed({ series: [1] }, 30 * MIN);
        const fetcher = vi.fn(async () => ({ series: [2] }));
        expect(await withCache(COL, DOC, fetcher, 'test', 60 * MIN)).toEqual({ series: [1] });
        expect(fetcher).not.toHaveBeenCalled();

        expect(await withCache(COL, DOC, fetcher, 'test', 20 * MIN)).toEqual({ series: [2] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('TTL krótszy niż 10 min nadal działa (limit dotyczy tylko maxAgeMs < 0)', async () => {
        seed({ series: [1] }, 2 * MIN);
        const fetcher = vi.fn(async () => ({ series: [2] }));
        expect(await withCache(COL, DOC, fetcher, 'test', 1 * MIN)).toEqual({ series: [2] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });
});

describe('withCache — odporność na awarie źródła (bez zmian)', () => {
    it('force + stary wpis + źródło rzuca → oddaje ostatni wpis', async () => {
        seed({ series: [1] }, 3 * 24 * 60 * MIN);
        const fetcher = vi.fn(async () => { throw new Error('HTTP 429'); });
        expect(await withCache(COL, DOC, fetcher, 'test', -1)).toEqual({ series: [1] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('źródło rzuca i brak wpisu → błąd idzie dalej', async () => {
        const fetcher = vi.fn(async () => { throw new Error('HTTP 429'); });
        await expect(withCache(COL, DOC, fetcher, 'test', -1)).rejects.toThrow('HTTP 429');
    });

    it('pusta odpowiedź nie nadpisuje dobrego wpisu', async () => {
        seed({ series: [1] }, 11 * MIN);
        const fetcher = vi.fn(async () => ({ series: [] as number[] }));
        const out = await withCache(COL, DOC, fetcher, 'test', -1);
        await flush();
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(out).toEqual({ series: [1] });
        expect(stored()?.payload).toEqual({ series: [1] });
    });
});
