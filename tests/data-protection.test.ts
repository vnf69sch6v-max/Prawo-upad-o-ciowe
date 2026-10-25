import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Firestore w pamięci: to, czego używają server-cache, cron-log i migracja (get/set, transakcje, zapytania stronami).
const store = new Map<string, Record<string, unknown>>();
const docRef = (c: string, d: string) => ({
    path: `${c}/${d}`,
    id: d,
    get: async () => snapOf(`${c}/${d}`),
    set: async (data: Record<string, unknown>) => void store.set(`${c}/${d}`, data),
});
function snapOf(path: string) {
    const data = store.get(path);
    const [c, d] = path.split('/') as [string, string];
    return { exists: data !== undefined, id: d, data: () => data, ref: docRef(c, d) };
}
function query(c: string, lim = Infinity, after: string | null = null) {
    return {
        limit: (n: number) => query(c, n, after),
        startAfter: (snap: { id: string }) => query(c, lim, snap.id),
        get: async () => ({
            docs: [...store.keys()].filter((k) => k.startsWith(`${c}/`)).map((k) => k.slice(c.length + 1)).sort()
                .filter((id) => after === null || id > after).slice(0, lim).map((id) => snapOf(`${c}/${id}`)),
        }),
    };
}
const fakeDb = {
    collection: (c: string) => ({ doc: (d: string) => docRef(c, d), orderBy: () => query(c) }),
    runTransaction: async <R,>(fn: (tx: unknown) => Promise<R>) => fn({
        get: (ref: { get: () => Promise<unknown> }) => ref.get(),
        set: (ref: { set: (d: unknown) => Promise<void> }, data: unknown) => void ref.set(data),
    }),
};
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: () => fakeDb }));

const { withCache, peekServerCache } = await import('@/lib/server-cache');
const { recordCronRun, readCronRuns } = await import('@/lib/cron-log');
const { sweepLegacyDocs, maybeSweep } = await import('@/lib/data-seal-sweep');

const flush = () => new Promise((r) => setTimeout(r, 0));
const KEY = randomBytes(32).toString('base64');
// Treść dokumentu bez bajtów szyfrogramu i bez `updatedAt` (Date.now() zawiera cyfry, np. „2026”).
const raw = (path: string) => JSON.stringify(store.get(path), (k, v) => (k === 'updatedAt' ? undefined : v?.type === 'Buffer' ? '<bytes>' : v));

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
        // `payload: null` — stary kod (wycofane wdrożenie) widzi brak wpisu zamiast `undefined`.
        expect(Object.keys(doc).sort()).toEqual(['payload', 'sealed', 'updatedAt']);
        expect(doc.payload).toBeNull();
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
        expect(Object.keys(store.get('news_archive/2026-01-02')!).sort()).toEqual(['payload', 'sealed', 'updatedAt']);
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

describe('migracja dotyka tylko danych tej aplikacji', () => {
    it('cudze kolekcje i dokumenty bez `payload` zostają nietknięte', async () => {
        const foreign = { name: 'Kowalski', updatedAt: 5 };
        store.set('clients/abc', foreign); // inna aplikacja w tym samym projekcie Firebase
        store.set('macro_data/odd', { something: 1 }); // nie nasz kształt
        store.set('health/other_app', { x: 1 });
        const res = await sweepLegacyDocs(fakeDb as never);
        expect(res).toMatchObject({ scanned: 1, legacy: 0, sealed: 0 });
        expect(store.get('clients/abc')).toEqual(foreign);
        expect(store.get('macro_data/odd')).toEqual({ something: 1 });
        expect(store.get('health/other_app')).toEqual({ x: 1 });
    });

    it('czyta stronami i przerywa po limicie czasu (truncated), reszta w kolejnym przebiegu', async () => {
        for (let i = 0; i < 450; i++) store.set(`news_archive/d${String(i).padStart(3, '0')}`, { payload: { i }, updatedAt: i });
        expect((await sweepLegacyDocs(fakeDb as never, { deadline: Date.now() - 1 })).truncated).toBe(true);
        const res = await sweepLegacyDocs(fakeDb as never, { maxWrites: 1000 });
        expect(res).toMatchObject({ scanned: 450, sealed: 450, truncated: false });
        expect(await peekServerCache('news_archive', 'd449')).toEqual({ i: 449 });
    });

    it('blokada co 6 h: drugie wywołanie nie skanuje bazy', async () => {
        store.set('news_archive/a', { payload: 1, updatedAt: 1 });
        expect(await maybeSweep(fakeDb as never, Date.now() + 10_000)).toMatchObject({ sealed: 1 });
        store.set('news_archive/b', { payload: 2, updatedAt: 2 });
        expect(await maybeSweep(fakeDb as never, Date.now() + 10_000)).toBeNull();
        expect(store.get('news_archive/b')).toEqual({ payload: 2, updatedAt: 2 });
    });

    it('bez klucza migracja nic nie robi', async () => {
        vi.stubEnv('DATA_ENCRYPTION_KEY', '');
        store.set('news_archive/a', { payload: 1, updatedAt: 1 });
        expect(await maybeSweep(fakeDb as never, Date.now() + 10_000)).toBeNull();
        expect(store.get('news_archive/a')).toEqual({ payload: 1, updatedAt: 1 });
    });
});

describe('tryby error i strict w cache', () => {
    it('zły klucz: nie zapisuje jawnie, jawne wpisy nadal czyta', async () => {
        vi.stubEnv('DATA_ENCRYPTION_KEY', 'za-krotki');
        store.set('macro_data/old', { payload: { series: [7] }, updatedAt: Date.now(), source: 'x' });
        expect(await withCache('macro_data', 'old', async () => ({ series: [8] }), 't')).toEqual({ series: [7] });
        expect(await withCache('macro_data', 'new', async () => ({ series: [9] }), 't')).toEqual({ series: [9] });
        await flush();
        expect(store.has('macro_data/new')).toBe(false);
    });

    it('DATA_ENCRYPTION_STRICT=1: podrzucony jawny wpis jest ignorowany, dane idą ze źródła', async () => {
        vi.stubEnv('DATA_ENCRYPTION_STRICT', '1');
        store.set('macro_data/cpi', { payload: { series: [666] }, updatedAt: Date.now() });
        const fetcher = vi.fn(async () => ({ series: [4.1] }));
        expect(await withCache('macro_data', 'cpi', fetcher, 't')).toEqual({ series: [4.1] });
        expect(fetcher).toHaveBeenCalledTimes(1);
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
        // Także `@firebase/*`, `firebase/firestore/lite` i dynamiczne `import()`.
        const offenders = files.filter((f) => /['"](@?firebase)\/(firestore|storage|database)(\/[^'"]*)?['"]/.test(readFileSync(f, 'utf8')));
        expect(offenders).toEqual([]);
    });

    it('logowanie Google: gapi tylko z apis.google.com, COOP pozwala oknu Google oddać wynik', () => {
        const cfg = readFileSync('next.config.ts', 'utf8');
        expect(cfg.match(/"script-src ([^"]+)"/)![1].split(' ')).toEqual(["'self'", "'unsafe-inline'", 'https://apis.google.com']);
        expect(cfg).toMatch(/Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups'/);
    });

    it('CSP: przeglądarka łączy się tylko z własną domeną i logowaniem Firebase', () => {
        const cfg = readFileSync('next.config.ts', 'utf8');
        const connect = cfg.match(/"connect-src ([^"]+)"/)![1].split(' ');
        expect(connect).toEqual(["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com']);
    });
});
