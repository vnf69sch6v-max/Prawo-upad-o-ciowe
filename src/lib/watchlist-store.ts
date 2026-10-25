// Silnik watchlisty bez Reacta i bez `window` — `fetch`, pamięć i zegar wstrzykiwane, więc testuje się w node
// (tests/watchlist-store.test.ts). Hook `useWatchlist` (src/lib/watchlist.ts) tworzy jeden egzemplarz na kartę.
//
// Zasady (specyfikacja docs/specs/2026-10-25-dane-uzytkownika.md):
// - zalogowany: lista należy do KONTA (`/api/me/watchlist`); `localStorage` to kopia per uid;
// - anonim / demo: wyłącznie `localStorage` (`mk:watchlist:v1`), żadnych żądań;
// - konto wygrywa z kopią; lista sprzed logowania przenosi się na konto raz (konto bez dokumentu);
// - kliknięcia działają od razu (kopia), zapis na konto 400 ms po ostatnim, nieudany zapis ponawiany;
// - **PUT nigdy przed udanym odczytem konta** (kryterium 8): nieudany odczyt jest ponawiany (15 s, powrót sieci),
//   a kliknięcia czekają jako `dirty` i po odczycie łączą się z listą konta — na nowym telefonie przy słabej sieci
//   jedna gwiazdka nie może skasować listy z komputera.
import { reconcileWatchlist, sameWatchlist, sanitizeWatchItems, type WatchItem, type WatchKind } from '@/lib/user-data';

export const LEGACY_KEY = 'mk:watchlist:v1';
export const userKey = (uid: string) => `mk:watchlist:u:${uid}`;
export const WATCHLIST_API = '/api/me/watchlist';
export const SYNC_DELAY_MS = 400;
export const RETRY_MS = 15_000;

export interface Snapshot { items: WatchItem[]; ready: boolean }
export const EMPTY_SNAPSHOT: Snapshot = { items: [], ready: false };

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export interface StoreDeps {
    fetch: (input: string, init?: RequestInit) => Promise<Response>;
    /** `null` = brak pamięci (SSR, tryb prywatny bez dostępu). */
    storage: StorageLike | null;
}

type AccountBody = { items?: unknown; account?: boolean };

/** Co naprawi się samo: 5xx (poza 501 = brak Admin SDK w trybie demo) i 429. 4xx (brak sesji, zły kształt) — nie. */
const isTransient = (status: number) => status === 429 || (status >= 500 && status !== 501);

export function createWatchlistStore(deps: StoreDeps) {
    let snapshot: Snapshot = EMPTY_SNAPSHOT;
    /** `null` = jeszcze nie wiemy, kto patrzy; potem `anon` albo `u:<uid>`. */
    let scope: string | null = null;
    let uid: string | null = null;
    /** Rośnie przy zmianie konta — spóźniona odpowiedź dla poprzedniego użytkownika jest ignorowana. */
    let generation = 0;
    const listeners = new Set<() => void>();

    /** Dla bieżącego konta udał się odczyt listy z serwera — dopiero wtedy wolno wysyłać PUT. */
    let pulled = false;
    let pulling = false;
    /** Lokalna lista różni się od konta — do wysłania (albo do scalenia po pierwszym odczycie). */
    let dirty = false;
    let inflight = false;
    /** Po udanym przeniesieniu listy sprzed logowania kasujemy kopię anonimową. */
    let dropLegacyAfterPush = false;
    let syncTimer: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const emit = (items: WatchItem[]) => {
        snapshot = { items, ready: true };
        listeners.forEach((l) => l());
    };
    const storageKey = () => (uid ? userKey(uid) : LEGACY_KEY);

    const readLocal = (key: string): WatchItem[] => {
        try {
            return sanitizeWatchItems(JSON.parse(deps.storage?.getItem(key) ?? '[]'));
        } catch {
            return [];
        }
    };
    const writeLocal = (key: string, items: WatchItem[]) => {
        try {
            deps.storage?.setItem(key, JSON.stringify(items));
        } catch { /* tryb prywatny / brak miejsca — watchlista jest dodatkiem, nie blokujemy UI */ }
    };
    const removeLocal = (key: string) => {
        try {
            deps.storage?.removeItem(key);
        } catch { /* bez znaczenia */ }
    };
    const clearTimers = () => {
        if (syncTimer) clearTimeout(syncTimer);
        if (retryTimer) clearTimeout(retryTimer);
        syncTimer = retryTimer = null;
    };
    const retryLater = (fn: () => void) => {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => { retryTimer = null; fn(); }, RETRY_MS);
    };

    function schedulePush(delayMs: number) {
        if (!uid) return;
        dirty = true;
        if (!pulled) return; // PUT dopiero po udanym odczycie — kliknięcie czeka w kopii lokalnej
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => { syncTimer = null; void push(generation); }, delayMs);
    }

    async function pull(gen: number) {
        if (pulling) return;
        pulling = true;
        let body: AccountBody | null = null;
        let transient = false;
        try {
            const res = await deps.fetch(WATCHLIST_API, { credentials: 'same-origin', cache: 'no-store' });
            if (res.ok) body = (await res.json()) as AccountBody;
            else transient = isTransient(res.status);
        } catch {
            transient = true; // offline
        } finally {
            pulling = false;
        }
        if (gen !== generation) return;
        if (!body) {
            if (transient) retryLater(() => { if (gen === generation && !pulled) void pull(gen); });
            return;
        }
        pulled = true;

        const account = body.account ? sanitizeWatchItems(body.items) : null;
        const legacy = readLocal(LEGACY_KEY);

        if (dirty) {
            // Użytkownik klikał przed odczytem (nowe urządzenie, kopia pusta). Wysłanie samych jego kliknięć
            // skasowałoby listę konta — łączymy: konto + to, co dodał, i zapisujemy całość.
            const merged = account
                ? [...account, ...snapshot.items.filter((i) => !account.some((a) => a.kind === i.kind && a.id === i.id))]
                : snapshot.items;
            writeLocal(storageKey(), merged);
            if (!sameWatchlist(merged, snapshot.items)) emit(merged);
            schedulePush(0);
            return;
        }

        const local = snapshot.items.length > 0 ? snapshot.items : legacy;
        const { items, pushToAccount } = reconcileWatchlist(account, local);
        writeLocal(storageKey(), items);
        if (!sameWatchlist(items, snapshot.items)) emit(items);
        if (pushToAccount) {
            dropLegacyAfterPush = legacy.length > 0;
            schedulePush(0);
        } else if (account !== null && legacy.length > 0) {
            // Konto ma już swoją listę — anonimowa kopia na tym urządzeniu nie jest niczyja, kasujemy ją.
            removeLocal(LEGACY_KEY);
        }
    }

    async function push(gen: number) {
        if (inflight) { schedulePush(SYNC_DELAY_MS); return; }
        inflight = true;
        dirty = false;
        const items = snapshot.items;
        let retry = false;
        try {
            const res = await deps.fetch(WATCHLIST_API, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
            if (gen !== generation) return;
            if (res.ok) {
                if (dropLegacyAfterPush) {
                    dropLegacyAfterPush = false;
                    removeLocal(LEGACY_KEY);
                }
            } else {
                retry = isTransient(res.status);
            }
        } catch {
            retry = true;
        } finally {
            inflight = false;
        }
        if (gen !== generation) return;
        if (dirty) schedulePush(SYNC_DELAY_MS); // kliknięcia w trakcie zapisu
        else if (retry) {
            dirty = true;
            retryLater(() => schedulePush(0));
        }
    }

    function setItems(items: WatchItem[]) {
        if (!scope) return; // jeszcze nie wiemy, czyja to lista — kliknięcie przed hydracją nie ma gdzie trafić
        writeLocal(storageKey(), items);
        emit(items);
        schedulePush(SYNC_DELAY_MS);
    }

    return {
        subscribe(fn: () => void) {
            listeners.add(fn);
            return () => { listeners.delete(fn); };
        },
        getSnapshot: () => snapshot,

        /** Przełączenie na użytkownika (albo brak): kopia lokalna od razu, potem stan konta z serwera. */
        activate(nextUid: string | null) {
            const nextScope = nextUid ? `u:${nextUid}` : 'anon';
            if (scope === nextScope) return;
            // Zaległy zapis poprzedniego konta (gwiazdka tuż przed „Wyloguj”) wychodzi od razu, zanim zmienimy konto.
            if (dirty && pulled && uid && !inflight) void push(generation);
            scope = nextScope;
            uid = nextUid;
            generation++;
            clearTimers();
            pulled = pulling = dirty = dropLegacyAfterPush = false;
            emit(readLocal(storageKey()));
            if (uid) void pull(generation);
        },

        toggle(kind: WatchKind, id: string) {
            const next = snapshot.items.slice();
            const idx = next.findIndex((i) => i.kind === kind && i.id === id);
            if (idx >= 0) next.splice(idx, 1);
            else next.push({ kind, id });
            setItems(next);
        },
        set: setItems,

        /** Powrót sieci: dokończ odczyt konta albo wyślij zaległy zapis. */
        onOnline() {
            if (!uid) return;
            if (!pulled) void pull(generation);
            else if (dirty) schedulePush(0);
        },
        /** Zmiana z INNEJ karty tej samej witryny (zdarzenie `storage`). */
        onStorage(key: string | null) {
            if (scope && key === storageKey()) emit(readLocal(storageKey()));
        },
    };
}

export type WatchlistStore = ReturnType<typeof createWatchlistStore>;
