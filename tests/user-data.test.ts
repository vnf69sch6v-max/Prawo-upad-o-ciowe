import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { MAX_WATCH_ITEMS, parseWatchItems, reconcileWatchlist, sanitizeWatchItems } from '@/lib/user-data';

// Firestore w pamięci (jak w tests/data-protection.test.ts) + Admin Auth, który zna jedno ciasteczko na użytkownika.
const store = new Map<string, Record<string, unknown>>();
const docRef = (c: string, d: string) => ({
    path: `${c}/${d}`,
    id: d,
    get: async () => snapOf(`${c}/${d}`),
    set: async (data: Record<string, unknown>) => void store.set(`${c}/${d}`, data),
    delete: async () => void store.delete(`${c}/${d}`),
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
/** Ciasteczko → uid; wszystko inne jest podróbką. */
const SESSIONS: Record<string, string> = { 'cookie-ania': 'uid-ania', 'cookie-bartek': 'uid-bartek' };
const fakeAuth = {
    verifySessionCookie: async (cookie: string) => {
        if (!SESSIONS[cookie]) throw Object.assign(new Error('bad'), { code: 'auth/invalid-session-cookie' });
        return { uid: SESSIONS[cookie] };
    },
};
let adminAvailable = true;
vi.mock('@/lib/firebase/admin', () => ({
    getAdminDb: () => (adminAvailable ? fakeDb : null),
    getAdminAuth: () => (adminAvailable ? fakeAuth : null),
}));

const { readUserData, writeUserData } = await import('@/lib/user-data-server');
const { sweepLegacyDocs } = await import('@/lib/data-seal-sweep');
const route = await import('@/app/api/me/watchlist/route');

const KEY = randomBytes(32).toString('base64');
const raw = (path: string) => JSON.stringify(store.get(path), (k, v) => (k === 'updatedAt' ? undefined : v?.type === 'Buffer' ? '<bytes>' : v));

const ORIGIN = 'https://savori.space';
const req = (method: 'GET' | 'PUT', { cookie, body, origin = ORIGIN, contentType = 'application/json' }: { cookie?: string; body?: unknown; origin?: string | null; contentType?: string } = {}) => {
    const headers: Record<string, string> = {};
    if (cookie) headers.cookie = `__session=${cookie}`;
    if (origin) headers.origin = origin;
    if (method === 'PUT') headers['content-type'] = contentType;
    return new NextRequest(`${ORIGIN}/api/me/watchlist`, { method, headers, body: method === 'PUT' ? JSON.stringify(body) : undefined });
};
const call = async (r: NextRequest) => {
    const res = await (r.method === 'PUT' ? route.PUT(r) : route.GET(r));
    return { status: res.status, body: await res.json(), cache: res.headers.get('cache-control') };
};

beforeEach(() => {
    store.clear();
    adminAvailable = true;
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.stubEnv('DATA_ENCRYPTION_KEY', KEY);
});
afterEach(() => vi.unstubAllEnvs());

describe('walidacja listy obserwowanych', () => {
    it('wpuszcza tylko znane kształty, bez duplikatów', () => {
        expect(parseWatchItems([{ kind: 'wskaznik', id: 'cpi' }, { kind: 'spolka', id: 'PKO.WA' }, { kind: 'wskaznik', id: 'cpi' }]))
            .toEqual([{ kind: 'wskaznik', id: 'cpi' }, { kind: 'spolka', id: 'PKO.WA' }]);
        expect(parseWatchItems([])).toEqual([]);
    });

    it('odrzuca całość przy złym typie, rodzaju, identyfikatorze albo nadmiarze (400, nic nie trafia do bazy)', () => {
        expect(parseWatchItems(null)).toBeNull();
        expect(parseWatchItems('cpi')).toBeNull();
        expect(parseWatchItems([{ kind: 'portfel', id: 'x' }])).toBeNull();
        expect(parseWatchItems([{ kind: 'wskaznik', id: '<script>' }])).toBeNull();
        expect(parseWatchItems([{ kind: 'wskaznik', id: 'a'.repeat(65) }])).toBeNull();
        expect(parseWatchItems([{ kind: 'wskaznik', id: 'x', extra: { deep: 1 } }])).toEqual([{ kind: 'wskaznik', id: 'x' }]);
        expect(parseWatchItems(Array.from({ length: MAX_WATCH_ITEMS + 1 }, (_, i) => ({ kind: 'wskaznik', id: `s${i}` })))).toBeNull();
    });

    it('odczyt z localStorage pomija śmieci zamiast kasować listę', () => {
        expect(sanitizeWatchItems([{ kind: 'wskaznik', id: 'cpi' }, 'x', null, { kind: 'nope', id: 'y' }, { kind: 'spolka', id: 'KGH' }]))
            .toEqual([{ kind: 'wskaznik', id: 'cpi' }, { kind: 'spolka', id: 'KGH' }]);
        expect(sanitizeWatchItems('zepsute')).toEqual([]);
    });
});

describe('pierwsze wejście zalogowanego: konto wygrywa, lista sprzed logowania przenosi się raz', () => {
    const a = [{ kind: 'wskaznik' as const, id: 'cpi' }];
    const b = [{ kind: 'spolka' as const, id: 'PKO.WA' }];
    it('konto ma dokument → lista konta, bez zapisu', () => {
        expect(reconcileWatchlist(a, b)).toEqual({ items: a, pushToAccount: false });
        expect(reconcileWatchlist([], b)).toEqual({ items: [], pushToAccount: false });
    });
    it('konto bez dokumentu → lista z przeglądarki idzie na konto; pusto wszędzie → nic nie tworzymy', () => {
        expect(reconcileWatchlist(null, b)).toEqual({ items: b, pushToAccount: true });
        expect(reconcileWatchlist(null, [])).toEqual({ items: [], pushToAccount: false });
    });
});

describe('dokument konta w Firestore', () => {
    it('zapis jest zaszyfrowany, każdy użytkownik ma własny dokument, odczyt wraca w całości', async () => {
        await writeUserData(fakeDb as never, 'uid-ania', { watchlist: [{ kind: 'wskaznik', id: 'cpi' }] });
        await writeUserData(fakeDb as never, 'uid-bartek', { watchlist: [{ kind: 'spolka', id: 'KGH' }] });
        expect([...store.keys()].sort()).toEqual(['savori_users/uid-ania', 'savori_users/uid-bartek']);
        expect(raw('savori_users/uid-ania')).not.toMatch(/cpi|wskaznik/);
        expect(await readUserData(fakeDb as never, 'uid-ania')).toEqual({ watchlist: [{ kind: 'wskaznik', id: 'cpi' }] });
        expect(await readUserData(fakeDb as never, 'uid-bartek')).toEqual({ watchlist: [{ kind: 'spolka', id: 'KGH' }] });
        expect(await readUserData(fakeDb as never, 'uid-nikt')).toBeNull();
    });

    it('szyfrogramu nie da się przenieść na inne konto (AAD = ścieżka dokumentu)', async () => {
        await writeUserData(fakeDb as never, 'uid-ania', { watchlist: [{ kind: 'wskaznik', id: 'cpi' }] });
        store.set('savori_users/uid-bartek', { ...store.get('savori_users/uid-ania')! });
        expect(await readUserData(fakeDb as never, 'uid-bartek')).toBeNull();
    });

    it('migracja szyfrowania obejmuje jawne dokumenty kont, cudze `users/*` zostawia', async () => {
        store.set('savori_users/uid-ania', { watchlist: [{ kind: 'wskaznik', id: 'cpi' }], updatedAt: 5 });
        const foreign = { name: 'Kowalski', updatedAt: 5 };
        store.set('users/abc', foreign);
        const res = await sweepLegacyDocs(fakeDb as never);
        expect(res).toMatchObject({ scanned: 1, legacy: 1, sealed: 1, failed: 0 });
        expect(raw('savori_users/uid-ania')).not.toContain('cpi');
        expect(await readUserData(fakeDb as never, 'uid-ania')).toEqual({ watchlist: [{ kind: 'wskaznik', id: 'cpi' }] });
        expect(store.get('users/abc')).toEqual(foreign);
    });
});

describe('/api/me/watchlist', () => {
    const items = [{ kind: 'wskaznik', id: 'cpi' }, { kind: 'spolka', id: 'PKO.WA' }];

    it('bez sesji 401; podrobione ciasteczko 401; bez Admin SDK (demo) 501', async () => {
        expect((await call(req('GET'))).status).toBe(401);
        expect((await call(req('GET', { cookie: 'podrobka' }))).status).toBe(401);
        expect((await call(req('PUT', { cookie: 'podrobka', body: { items } }))).status).toBe(401);
        adminAvailable = false;
        expect((await call(req('GET', { cookie: 'cookie-ania' }))).status).toBe(501);
        expect(store.size).toBe(0);
    });

    it('zapis i odczyt własnej listy; drugi użytkownik jej nie widzi; odpowiedzi bez cache', async () => {
        expect(await call(req('GET', { cookie: 'cookie-ania' }))).toMatchObject({ status: 200, body: { items: [], account: false } });
        expect(await call(req('PUT', { cookie: 'cookie-ania', body: { items } }))).toMatchObject({ status: 200, body: { items, account: true } });
        const mine = await call(req('GET', { cookie: 'cookie-ania' }));
        expect(mine).toMatchObject({ status: 200, body: { items, account: true } });
        expect(mine.cache).toBe('private, no-store');
        expect(await call(req('GET', { cookie: 'cookie-bartek' }))).toMatchObject({ status: 200, body: { items: [], account: false } });
        expect(raw('savori_users/uid-ania')).not.toMatch(/cpi|PKO/);
    });

    it('PUT: zły kształt 400 bez zapisu, obca domena 403, nie-JSON 415', async () => {
        expect((await call(req('PUT', { cookie: 'cookie-ania', body: { items: [{ kind: 'x', id: 'y' }] } }))).status).toBe(400);
        expect((await call(req('PUT', { cookie: 'cookie-ania', body: { items: 'cpi' } }))).status).toBe(400);
        expect((await call(req('PUT', { cookie: 'cookie-ania', body: { items }, origin: 'https://evil.example' }))).status).toBe(403);
        expect((await call(req('PUT', { cookie: 'cookie-ania', body: { items }, contentType: 'text/plain' }))).status).toBe(415);
        expect(store.size).toBe(0);
    });

    it('PUT nadpisuje listę w całości (usunięcie gwiazdki = krótsza lista)', async () => {
        await call(req('PUT', { cookie: 'cookie-ania', body: { items } }));
        await call(req('PUT', { cookie: 'cookie-ania', body: { items: [items[1]] } }));
        expect((await call(req('GET', { cookie: 'cookie-ania' }))).body.items).toEqual([items[1]]);
        await call(req('PUT', { cookie: 'cookie-ania', body: { items: [] } }));
        expect((await call(req('GET', { cookie: 'cookie-ania' }))).body).toEqual({ items: [], account: true });
    });
});
