import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Firestore w pamięci: to, czego używają server-cache, cron-log i migracja (get/set, transakcje, listCollections).
const store = new Map<string, Record<string, unknown>>();
const docRef = (c: string, d: string) => ({
    path: `${c}/${d}`,
    get: async () => snapOf(`${c}/${d}`),
    set: async (data: Record<string, unknown>) => void store.set(`${c}/${d}`, data),
});
function snapOf(path: string) {
    const data = store.get(path);
    return { exists: data !== undefined, data: () => data, ref: docRef(...(path.split('/') as [string, string])) };
}
const fakeDb = {
    collection: (c: string) => ({
        doc: (d: string) => docRef(c, d),
        get: async () => ({ docs: [...store.keys()].filter((k) => k.startsWith(`${c}/`)).map(snapOf) }),
    }),
    listCollections: async () => [...new Set([...store.keys()].map((k) => k.split('/')[0]))].map((c) => fakeDb.collection(c)),
    runTransaction: async (fn: (tx: unknown) => Promise<void>) => fn({
        get: (ref: { get: () => Promise<unknown> }) => ref.get(),
        set: (ref: { set: (d: unknown) => Promise<void> }, data: unknown) => void ref.set(data),
    }),
};
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: () => fakeDb }));

const { withCache, peekServerCache } = await import('@/lib/server-cache');
const { recordCronRun, readCronRuns } = await import('@/lib/cron-log');
const { sweepLegacyDocs } = await import('@/lib/data-seal-sweep');

const flush = () => new Promise((r) => setTimeout(r, 0));
const KEY = randomBytes(32).toString('base64');
const raw = (path: string) => JSON.stringify(store.get(path), (_k, v) => (v?.type === 'Buffer' ? '<bytes>' : v));

beforeEach(() => {
    store.clear();
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.stubEnv('DATA_ENCRYPTION_KEY', KEY);
});
afterEach(() => vi.unstubAllEnvs());

describe('dane w Firestore są zaszyfrowane', () => {
    it('withCache zapisuje szyfrogram — w bazie nie ma liczb ani nazw', async () => {
        const out = await withCache('macro_data', 'cpi', async () => ({ series: [{ date: '2026-09', yoy: 4.1 }] }), 'GUS DBW');
        await flush();
        expect(out.series[0].yoy).toBe(4.1);
        const doc = store.get('macro_data/cpi')!;
        expect(Object.keys(doc).sort()).toEqual(['sealed', 'updatedAt']);
        expect(raw('macro_data/cpi')).not.toMatch(/2026-09|4\.1|GUS/);
        expect(await peekServerCache('macro_data', 'cpi')).toEqual({ series: [{ date: '2026-09', yoy: 4.1 }] });
    });

    it('wpis podmieniony w bazie jest odrzucany i zastępowany danymi ze źródła', async () => {
        await withCache('macro_data', 'cpi', async () => ({ series: [1] }), 't');
        await flush();
        const doc = store.get('macro_data/cpi')!;
        (doc.sealed as Buffer)[40] ^= 0xff;
        const fetcher = vi.fn(async () => ({ series: [2] }));
        expect(await withCache('macro_data', 'cpi', fetcher, 't')).toEqual({ series: [2] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('jawny wpis sprzed włączenia klucza nadal działa jako cache (bez przerwy w danych)', async () => {
        store.set('macro_data/old', { payload: { series: [7] }, updatedAt: Date.now() - 60_000, source: 'x' });
        const fetcher = vi.fn(async () => ({ series: [8] }));
        expect(await withCache('macro_data', 'old', fetcher, 't')).toEqual({ series: [7] });
        expect(fetcher).not.toHaveBeenCalled();
    });

    it('bez klucza zapis jest jawny jak dawniej (tryb demo / przed ustawieniem w Vercelu)', async () => {
        vi.stubEnv('DATA_ENCRYPTION_KEY', '');
        await withCache('macro_data', 'plain', async () => ({ series: [1] }), 'src');
        await flush();
        expect(store.get('macro_data/plain')).toMatchObject({ payload: { series: [1] }, source: 'src' });
    });

    it('dziennik cronów: szyfrowany, kolejne grupy nie kasują poprzednich', async () => {
        store.set('health/cron_runs', { bdl: { at: '2026-10-24T05:52:00Z', ok: 8, total: 8, ms: 1, failed: [] }, updatedAt: 1 });
        await recordCronRun('dbw-1', { at: '2026-10-25T09:50:00Z', ok: 2, total: 2, ms: 5, failed: [] });
        await recordCronRun('dbw-2', { at: '2026-10-25T13:50:00Z', ok: 2, total: 2, ms: 5, failed: [] });
        expect(raw('health/cron_runs')).not.toMatch(/dbw|bdl|2026/);
        expect(Object.keys((await readCronRuns())!).sort()).toEqual(['bdl', 'dbw-1', 'dbw-2']);
    });

    it('migracja szyfruje jawne dokumenty (cache i health), zachowując treść i datę', async () => {
        store.set('news_archive/2026-01-02', { payload: { items: ['a'] }, updatedAt: 123, source: 'news-archive', cachedAt: 'x' });
        store.set('health/freshness_history', { runs: [{ overall: 'ok' }], updatedAt: 456 });
        await withCache('macro_data', 'new', async () => ({ series: [1] }), 't');
        await flush();
        const res = await sweepLegacyDocs(fakeDb as never);
        expect(res).toMatchObject({ scanned: 3, legacy: 2, sealed: 2, rotated: 0, failed: 0, truncated: false });
        expect(Object.keys(store.get('news_archive/2026-01-02')!).sort()).toEqual(['sealed', 'updatedAt']);
        expect(store.get('news_archive/2026-01-02')!.updatedAt).toBe(123);
        expect(await peekServerCache('news_archive', '2026-01-02')).toEqual({ items: ['a'] });
        expect(raw('health/freshness_history')).not.toContain('overall');
        expect((await sweepLegacyDocs(fakeDb as never)).legacy).toBe(0);
    });

    it('rotacja klucza: migracja przepisuje wpisy starym kluczem nowym, treść bez zmian', async () => {
        await withCache('macro_data', 'cpi', async () => ({ series: [4.1] }), 't');
        await flush();
        vi.stubEnv('DATA_ENCRYPTION_KEY', randomBytes(32).toString('base64'));
        vi.stubEnv('DATA_ENCRYPTION_KEY_PREVIOUS', KEY);
        expect(await sweepLegacyDocs(fakeDb as never)).toMatchObject({ rotated: 1, sealed: 0, legacy: 0 });
        vi.stubEnv('DATA_ENCRYPTION_KEY_PREVIOUS', ''); // stary klucz można już usunąć
        expect(await peekServerCache('macro_data', 'cpi')).toEqual({ series: [4.1] });
    });
});

describe('przeglądarka nie ma dostępu do bazy ani plików', () => {
    const rules = (f: string) => readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');

    it('firestore.rules i storage.rules: zero dostępu, bez wyjątków', () => {
        for (const f of ['firestore.rules', 'storage.rules']) {
            const r = rules(f);
            expect(r).toMatch(/allow read, write: if false;/);
            expect(r).not.toMatch(/if true|request\.auth/);
            expect(r.match(/allow /g)).toHaveLength(1);
        }
    });

    it('kod klienta nie importuje Firestore, Storage ani Realtime Database', () => {
        const files: string[] = [];
        const walk = (dir: string) => {
            for (const name of readdirSync(dir)) {
                const p = join(dir, name);
                if (statSync(p).isDirectory()) walk(p);
                else if (/\.(ts|tsx)$/.test(name)) files.push(p);
            }
        };
        walk('src');
        const offenders = files.filter((f) => /from ['"]firebase\/(firestore|storage|database)['"]/.test(readFileSync(f, 'utf8')));
        expect(offenders).toEqual([]);
    });

    it('CSP: przeglądarka łączy się tylko z własną domeną i logowaniem Firebase', () => {
        const cfg = readFileSync('next.config.ts', 'utf8');
        const connect = cfg.match(/"connect-src ([^"]+)"/)![1].split(' ');
        expect(connect).toEqual(["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com']);
    });
});
