'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { reconcileWatchlist, sameWatchlist, sanitizeWatchItems, type WatchItem, type WatchKind } from '@/lib/user-data';

export type { WatchItem, WatchKind };

/**
 * Watchlista — wskaźniki i spółki obserwowane przez użytkownika.
 *
 * Zalogowany: lista należy do KONTA (`/api/me/watchlist` → `savori_users/{uid}`, zapis tylko przez serwer),
 * więc jest ta sama na telefonie i na komputerze, a dwa konta w jednej przeglądarce nie widzą swoich list.
 * `localStorage` jest wtedy tylko kopią per `uid` (natychmiastowy render po wejściu, działanie offline);
 * zmiany idą na konto z opóźnieniem 400 ms (seria kliknięć = jeden zapis), a nieudany zapis ponawiamy.
 * Pierwsze logowanie: konto bez dokumentu + lista sprzed logowania w przeglądarce → przenosimy ją na konto
 * (`reconcileWatchlist`), potem kasujemy kopię anonimową, żeby następne konto na tym urządzeniu zaczynało od zera.
 *
 * Niezalogowany / tryb demo (bez Firebase): jak dawniej, wyłącznie `localStorage` (`mk:watchlist:v1`).
 *
 * Hydration-safe: snapshot serwerowy jest pusty (`ready: false`), prawdziwy stan wchodzi po zamontowaniu —
 * komponenty mają używać `ready` zamiast zgadywać. Jeden magazyn modułowy obsługuje wszystkie instancje hooka
 * na stronie (kafle KPI, pas „Obserwowane”, gwiazdki), więc widzą to samo bez przeładowania.
 */

const LEGACY_KEY = 'mk:watchlist:v1';
const userKey = (uid: string) => `mk:watchlist:u:${uid}`;
const API = '/api/me/watchlist';
const SYNC_DELAY_MS = 400;
const RETRY_MS = 15_000;

interface Snapshot { items: WatchItem[]; ready: boolean }
const EMPTY: Snapshot = { items: [], ready: false };

let snapshot: Snapshot = EMPTY;
/** `null` = jeszcze nie wiemy, kto patrzy (auth się ładuje); potem `anon` albo `u:<uid>`. */
let scope: string | null = null;
let uid: string | null = null;
/** Rośnie przy każdej zmianie konta — spóźniona odpowiedź sieci dla poprzedniego użytkownika jest ignorowana. */
let generation = 0;
const listeners = new Set<() => void>();

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let inflight = false;
/** Lokalna lista różni się od konta — do wysłania. */
let dirty = false;
/** Po udanym przeniesieniu listy sprzed logowania kasujemy kopię anonimową. */
let dropLegacyAfterPush = false;

const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
};
const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

function emit(items: WatchItem[]) {
    snapshot = { items, ready: true };
    listeners.forEach((l) => l());
}

const storageKey = () => (uid ? userKey(uid) : LEGACY_KEY);

function readLocal(key: string): WatchItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return sanitizeWatchItems(JSON.parse(window.localStorage.getItem(key) ?? '[]'));
    } catch {
        return [];
    }
}

function writeLocal(key: string, items: WatchItem[]) {
    try {
        window.localStorage.setItem(key, JSON.stringify(items));
    } catch { /* tryb prywatny / brak miejsca — watchlista jest dodatkiem, nie blokujemy UI */ }
}

function clearTimers() {
    if (syncTimer) clearTimeout(syncTimer);
    if (retryTimer) clearTimeout(retryTimer);
    syncTimer = retryTimer = null;
}

/** Przełączenie na użytkownika (albo brak): lokalna kopia od razu, potem stan konta z serwera. */
function activate(nextUid: string | null) {
    const nextScope = nextUid ? `u:${nextUid}` : 'anon';
    if (scope === nextScope) return;
    scope = nextScope;
    uid = nextUid;
    generation++;
    clearTimers();
    dirty = false;
    dropLegacyAfterPush = false;
    emit(readLocal(storageKey()));
    if (uid) void pullFromAccount(generation);
}

async function pullFromAccount(gen: number) {
    type Body = { items?: unknown; account?: boolean };
    let body: Body | null = null;
    try {
        const res = await fetch(API, { credentials: 'same-origin', cache: 'no-store' });
        // 501 (demo bez Admin SDK), 401/403, 503 — zostajemy przy lokalnej kopii.
        if (res.ok) body = (await res.json()) as Body;
    } catch { /* offline — lokalna kopia */ }
    if (!body || gen !== generation) return;

    const account = body.account ? sanitizeWatchItems(body.items) : null;
    const legacy = readLocal(LEGACY_KEY);
    const local = snapshot.items.length > 0 ? snapshot.items : legacy;

    if (dirty) {
        // Użytkownik klikał, zanim przyszła lista z konta (nowe urządzenie, lokalna kopia pusta). Wysłanie
        // samych jego kliknięć skasowałoby listę konta — łączymy: konto + to, co dodał, i zapisujemy całość.
        const merged = account ? [...account, ...snapshot.items.filter((i) => !account.some((a) => a.kind === i.kind && a.id === i.id))] : snapshot.items;
        writeLocal(storageKey(), merged);
        if (!sameWatchlist(merged, snapshot.items)) emit(merged);
        schedulePush(0);
        return;
    }

    const { items, pushToAccount } = reconcileWatchlist(account, local);
    writeLocal(storageKey(), items);
    if (!sameWatchlist(items, snapshot.items)) emit(items);
    if (pushToAccount) {
        dropLegacyAfterPush = legacy.length > 0;
        schedulePush(0);
    } else if (account !== null && legacy.length > 0) {
        // Konto ma już swoją listę — anonimowa kopia na tym urządzeniu nie jest niczyja, kasujemy ją.
        try { window.localStorage.removeItem(LEGACY_KEY); } catch { /* bez znaczenia */ }
    }
}

function schedulePush(delayMs: number) {
    if (!uid) return;
    dirty = true;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { syncTimer = null; void push(generation); }, delayMs);
}

async function push(gen: number) {
    if (inflight) { schedulePush(SYNC_DELAY_MS); return; }
    inflight = true;
    dirty = false;
    const items = snapshot.items;
    let retry = false;
    try {
        const res = await fetch(API, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        });
        if (gen !== generation) return;
        if (res.ok) {
            if (dropLegacyAfterPush) {
                dropLegacyAfterPush = false;
                try { window.localStorage.removeItem(LEGACY_KEY); } catch { /* bez znaczenia */ }
            }
        } else {
            // 5xx / 429 — chwilowe; 401/403/400 nie naprawią się same (sesja wygasła, zły kształt).
            retry = res.status >= 500 || res.status === 429;
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
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => { retryTimer = null; schedulePush(0); }, RETRY_MS);
    }
}

function setItems(items: WatchItem[]) {
    if (!scope) return; // jeszcze nie wiemy, czyja to lista — kliknięcie przed hydracją nie ma gdzie trafić
    writeLocal(storageKey(), items);
    emit(items);
    schedulePush(SYNC_DELAY_MS);
}

function toggleItem(kind: WatchKind, id: string) {
    const next = snapshot.items.slice();
    const idx = next.findIndex((i) => i.kind === kind && i.id === id);
    if (idx >= 0) next.splice(idx, 1);
    else next.push({ kind, id });
    setItems(next);
}

if (typeof window !== 'undefined') {
    // `storage` łapie zmianę z INNEJ karty tej samej witryny (ten sam użytkownik).
    window.addEventListener('storage', (e) => {
        if (scope && e.key === storageKey()) emit(readLocal(storageKey()));
    });
    // Powrót sieci — wyślij to, czego nie udało się zapisać.
    window.addEventListener('online', () => { if (dirty && uid) schedulePush(0); });
}

export function useWatchlist() {
    const { user, enabled, loading } = useAuth();
    // Z włączonym logowaniem czekamy, aż Firebase powie, kto patrzy — inaczej na ułamek sekundy pokazalibyśmy
    // listę anonimową, a potem listę konta (mignięcie), albo zapisali kliknięcie pod złym kluczem.
    const pending = enabled && loading;
    const activeUid = enabled ? user?.uid ?? null : null;

    useEffect(() => {
        if (!pending) activate(activeUid);
    }, [pending, activeUid]);

    const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const has = useCallback(
        (kind: WatchKind, id: string) => snap.items.some((i) => i.kind === kind && i.id === id),
        [snap.items],
    );
    const toggle = useCallback((kind: WatchKind, id: string) => toggleItem(kind, id), []);
    const clear = useCallback(() => setItems([]), []);

    return { items: snap.items, ready: snap.ready, has, toggle, clear };
}
