import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LEGACY_KEY, RETRY_MS, SYNC_DELAY_MS, createWatchlistStore, userKey, type StorageLike } from '@/lib/watchlist-store';
import type { WatchItem } from '@/lib/user-data';

// Przeglądarka w pamięci: localStorage jako Map, serwer `/api/me/watchlist` jako skrypt odpowiedzi.
function memoryStorage(): StorageLike & { map: Map<string, string> } {
    const map = new Map<string, string>();
    return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

type Reply = { status: number; body?: unknown } | 'offline';
function server(initial: { items: WatchItem[]; account: boolean } | null) {
    let account: WatchItem[] | null = initial?.account ? initial.items : null;
    const calls: Array<{ method: string; items?: WatchItem[] }> = [];
    let script: Reply[] = [];
    // Zwykły obiekt zamiast `Response`: strumień treści `Response.json()` nie rozwiązuje się w mikrozadaniach
    // przy sztucznym zegarze, a tu liczy się kolejność zdarzeń, nie realny parser HTTP.
    const respond = (r: Reply) => {
        if (r === 'offline') return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve({ ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body } as Response);
    };
    const fetch = async (_url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const items = method === 'PUT' ? (JSON.parse(String(init!.body)) as { items: WatchItem[] }).items : undefined;
        calls.push({ method, items });
        const scripted = script.shift();
        if (scripted) return respond(scripted);
        if (method === 'PUT') { account = items!; return respond({ status: 200, body: { items, account: true } }); }
        return respond(account ? { status: 200, body: { items: account, account: true } } : { status: 200, body: { items: [], account: false } });
    };
    return { fetch, calls, get account() { return account; }, fail: (...r: Reply[]) => { script = r; } };
}

const cpi: WatchItem = { kind: 'wskaznik', id: 'cpi' };
const pko: WatchItem = { kind: 'spolka', id: 'PKO.WA' };
const eur: WatchItem = { kind: 'wskaznik', id: 'eur-pln' };
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
const puts = (s: ReturnType<typeof server>) => s.calls.filter((c) => c.method === 'PUT').map((c) => c.items);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('anonim / demo: tylko localStorage, zero żądań', () => {
    it('czyta i zapisuje pod mk:watchlist:v1, nie woła serwera', async () => {
        const storage = memoryStorage();
        storage.map.set(LEGACY_KEY, JSON.stringify([cpi]));
        const srv = server(null);
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        expect(st.getSnapshot()).toEqual({ items: [], ready: false }); // snapshot serwerowy — bez błędu hydratacji
        st.activate(null);
        expect(st.getSnapshot()).toEqual({ items: [cpi], ready: true });
        st.toggle('spolka', 'PKO.WA');
        await vi.advanceTimersByTimeAsync(SYNC_DELAY_MS + 1);
        expect(JSON.parse(storage.map.get(LEGACY_KEY)!)).toEqual([cpi, pko]);
        expect(srv.calls).toEqual([]);
    });
});

describe('zalogowany: lista należy do konta', () => {
    it('konto wygrywa z kopią lokalną; kopia per uid; kliknięcie idzie PUT-em z całą listą po 400 ms', async () => {
        const storage = memoryStorage();
        storage.map.set(userKey('u1'), JSON.stringify([eur])); // stara kopia z tego urządzenia
        const srv = server({ items: [cpi, pko], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        expect(st.getSnapshot().items).toEqual([eur]); // natychmiast kopia…
        await flush();
        expect(st.getSnapshot().items).toEqual([cpi, pko]); // …potem konto
        expect(JSON.parse(storage.map.get(userKey('u1'))!)).toEqual([cpi, pko]);

        st.toggle('wskaznik', 'eur-pln');
        st.toggle('spolka', 'PKO.WA'); // dwa kliknięcia = jeden zapis
        expect(puts(srv)).toEqual([]);
        await vi.advanceTimersByTimeAsync(SYNC_DELAY_MS + 1);
        expect(puts(srv)).toEqual([[cpi, eur]]);
        expect(srv.account).toEqual([cpi, eur]);
    });

    it('dwa konta w jednej przeglądarce nie widzą swoich list', async () => {
        const storage = memoryStorage();
        const srv = server({ items: [cpi], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('ania');
        await flush();
        expect(st.getSnapshot().items).toEqual([cpi]);
        // wylogowanie → inne konto bez dokumentu
        const srv2 = server(null);
        const st2 = createWatchlistStore({ fetch: srv2.fetch, storage });
        st2.activate('bartek');
        await flush();
        expect(st2.getSnapshot().items).toEqual([]);
        expect(JSON.parse(storage.map.get(userKey('ania'))!)).toEqual([cpi]); // kopia Ani zostaje pod jej kluczem
        expect(puts(srv2)).toEqual([]); // na koncie Bartka nic nie tworzymy za samo wejście
    });

    it('pierwsze logowanie: lista sprzed logowania przenosi się na konto raz, kopia anonimowa znika', async () => {
        const storage = memoryStorage();
        storage.map.set(LEGACY_KEY, JSON.stringify([cpi, pko]));
        const srv = server(null);
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        expect(st.getSnapshot().items).toEqual([cpi, pko]);
        await vi.advanceTimersByTimeAsync(1);
        await flush();
        expect(srv.account).toEqual([cpi, pko]);
        expect(storage.map.has(LEGACY_KEY)).toBe(false);
        expect(JSON.parse(storage.map.get(userKey('u1'))!)).toEqual([cpi, pko]);
    });

    it('konto ma już listę → lista anonimowa z tego urządzenia nie jest doklejana i znika', async () => {
        const storage = memoryStorage();
        storage.map.set(LEGACY_KEY, JSON.stringify([eur]));
        const srv = server({ items: [cpi], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        expect(st.getSnapshot().items).toEqual([cpi]);
        expect(storage.map.has(LEGACY_KEY)).toBe(false);
        expect(puts(srv)).toEqual([]);
    });
});

describe('kryterium 8: nieudany odczyt konta nie nadpisuje konta', () => {
    it('offline przy wejściu: gwiazdka działa lokalnie, PUT czeka; po powrocie sieci konto = stare pozycje + nowa', async () => {
        const storage = memoryStorage(); // nowy telefon — pusta kopia
        const srv = server({ items: [cpi, pko], account: true });
        srv.fail('offline');
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        expect(st.getSnapshot()).toEqual({ items: [], ready: true });

        st.toggle('wskaznik', 'eur-pln');
        expect(st.getSnapshot().items).toEqual([eur]);
        await vi.advanceTimersByTimeAsync(SYNC_DELAY_MS * 3);
        expect(puts(srv)).toEqual([]); // żadnego PUT bez udanego odczytu
        expect(srv.account).toEqual([cpi, pko]);

        st.onOnline();
        await flush();
        expect(st.getSnapshot().items).toEqual([cpi, pko, eur]);
        await vi.advanceTimersByTimeAsync(1);
        await flush();
        expect(puts(srv)).toEqual([[cpi, pko, eur]]);
        expect(srv.account).toEqual([cpi, pko, eur]);
    });

    it('serwer 503 przy odczycie: ponowienie po 15 s, do tego czasu bez PUT', async () => {
        const storage = memoryStorage();
        const srv = server({ items: [cpi], account: true });
        srv.fail({ status: 503, body: { error: 'storage' } });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        st.toggle('spolka', 'PKO.WA');
        await vi.advanceTimersByTimeAsync(RETRY_MS - 1);
        expect(srv.calls.filter((c) => c.method === 'GET')).toHaveLength(1);
        expect(puts(srv)).toEqual([]);
        await vi.advanceTimersByTimeAsync(2);
        await flush();
        expect(srv.calls.filter((c) => c.method === 'GET')).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(1);
        await flush();
        expect(srv.account).toEqual([cpi, pko]);
    });

    it('401 / 501 przy odczycie (sesja wygasła, demo): bez ponawiania i bez PUT — lista zostaje lokalna', async () => {
        for (const status of [401, 501]) {
            const storage = memoryStorage();
            const srv = server({ items: [cpi], account: true });
            srv.fail({ status, body: { error: 'x' } });
            const st = createWatchlistStore({ fetch: srv.fetch, storage });
            st.activate('u1');
            await flush();
            st.toggle('spolka', 'PKO.WA');
            await vi.advanceTimersByTimeAsync(RETRY_MS * 2);
            expect(srv.calls.filter((c) => c.method === 'GET')).toHaveLength(1);
            expect(puts(srv)).toEqual([]);
            expect(st.getSnapshot().items).toEqual([pko]);
            expect(srv.account).toEqual([cpi]);
        }
    });
});

describe('zapis: ponowienie i wylogowanie', () => {
    it('nieudany PUT (5xx / offline) ponawia się po 15 s i po powrocie sieci', async () => {
        const storage = memoryStorage();
        const srv = server({ items: [cpi], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        srv.fail({ status: 503 });
        st.toggle('spolka', 'PKO.WA');
        await vi.advanceTimersByTimeAsync(SYNC_DELAY_MS + 1);
        await flush();
        expect(srv.account).toEqual([cpi]);
        await vi.advanceTimersByTimeAsync(RETRY_MS + 1);
        await flush();
        expect(srv.account).toEqual([cpi, pko]);
        expect(puts(srv)).toHaveLength(2);
    });

    it('400 przy PUT (zły kształt) nie jest ponawiane w pętli', async () => {
        const storage = memoryStorage();
        const srv = server({ items: [], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        srv.fail({ status: 400, body: { error: 'bad-items' } });
        st.toggle('wskaznik', 'cpi');
        await vi.advanceTimersByTimeAsync(SYNC_DELAY_MS + RETRY_MS * 3);
        expect(puts(srv)).toHaveLength(1);
    });

    it('gwiazdka tuż przed wylogowaniem nie ginie, a spóźniona odpowiedź nie trafia do następnego konta', async () => {
        const storage = memoryStorage();
        const srv = server({ items: [cpi], account: true });
        const st = createWatchlistStore({ fetch: srv.fetch, storage });
        st.activate('u1');
        await flush();
        st.toggle('spolka', 'PKO.WA');
        st.activate(null); // wylogowanie 10 ms po kliknięciu
        await flush();
        expect(srv.account).toEqual([cpi, pko]);
        expect(st.getSnapshot().items).toEqual([]); // anonim nie widzi listy konta
        await vi.advanceTimersByTimeAsync(RETRY_MS * 2);
        expect(puts(srv)).toHaveLength(1);
    });
});
