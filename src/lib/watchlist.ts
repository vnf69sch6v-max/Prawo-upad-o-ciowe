'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { EMPTY_SNAPSHOT, createWatchlistStore } from '@/lib/watchlist-store';
import type { WatchItem, WatchKind } from '@/lib/user-data';

export type { WatchItem, WatchKind };

/**
 * Watchlista — wskaźniki i spółki obserwowane przez użytkownika.
 *
 * Zalogowany: lista należy do KONTA (`/api/me/watchlist` → `savori_users/{uid}`, zapis tylko przez serwer),
 * więc jest ta sama na telefonie i na komputerze, a dwa konta w jednej przeglądarce nie widzą swoich list.
 * `localStorage` jest wtedy tylko kopią per `uid`. Niezalogowany / tryb demo: jak dawniej, wyłącznie `localStorage`.
 * Reguły synchronizacji i ich testy: `src/lib/watchlist-store.ts`.
 *
 * Hydration-safe: snapshot serwerowy jest pusty (`ready: false`), prawdziwy stan wchodzi po zamontowaniu —
 * komponenty mają używać `ready` zamiast zgadywać. Jeden magazyn na kartę obsługuje wszystkie instancje hooka
 * (kafle KPI, pas „Obserwowane”, gwiazdki), więc widzą to samo bez przeładowania.
 */

const store = createWatchlistStore({
    fetch: (input, init) => fetch(input, init),
    storage: typeof window !== 'undefined' ? window.localStorage : null,
});

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => store.onStorage(e.key));
    window.addEventListener('online', () => store.onOnline());
}

const getServerSnapshot = () => EMPTY_SNAPSHOT;

export function useWatchlist() {
    const { user, enabled, loading } = useAuth();
    // Z włączonym logowaniem czekamy, aż Firebase powie, kto patrzy — inaczej na ułamek sekundy pokazalibyśmy
    // listę anonimową, a potem listę konta (mignięcie), albo zapisali kliknięcie pod złym kluczem.
    const pending = enabled && loading;
    const activeUid = enabled ? user?.uid ?? null : null;

    useEffect(() => {
        if (!pending) store.activate(activeUid);
    }, [pending, activeUid]);

    const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);

    const has = useCallback(
        (kind: WatchKind, id: string) => snap.items.some((i) => i.kind === kind && i.id === id),
        [snap.items],
    );
    const toggle = useCallback((kind: WatchKind, id: string) => store.toggle(kind, id), []);
    const clear = useCallback(() => store.set([]), []);

    return { items: snap.items, ready: snap.ready, has, toggle, clear };
}
