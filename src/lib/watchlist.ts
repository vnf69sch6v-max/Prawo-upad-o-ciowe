'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Watchlista — wskaźniki i spółki obserwowane przez użytkownika, trzymane w `localStorage`.
 *
 * Hydration-safe: `localStorage` NIE istnieje po stronie serwera, więc render serwerowy zawsze
 * dostaje pustą listę, a realny stan wczytujemy dopiero po zamontowaniu. Stąd flaga `ready` —
 * komponenty mają jej używać zamiast zgadywać (bez tego React zgłosiłby mismatch, a gwiazdki
 * mrugałyby przy każdym wejściu).
 *
 * Zmiany rozsyłamy zdarzeniem `mk:watchlist`, żeby kilka instancji hooka na jednej stronie
 * (np. kafle KPI + pas „Obserwowane") widziało to samo bez przeładowania.
 */

export type WatchKind = 'wskaznik' | 'spolka';
export interface WatchItem { kind: WatchKind; id: string }

const KEY = 'mk:watchlist:v1';
const EVENT = 'mk:watchlist';

function read(): WatchItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Walidujemy kształt — w localStorage może siedzieć cokolwiek (stara wersja, ręczna edycja).
        return parsed.filter(
            (x): x is WatchItem =>
                x && typeof x.id === 'string' && (x.kind === 'wskaznik' || x.kind === 'spolka'),
        );
    } catch {
        return [];
    }
}

function write(items: WatchItem[]) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch { /* prywatny tryb / brak miejsca — watchlista jest dodatkiem, nie blokujemy UI */ }
    window.dispatchEvent(new Event(EVENT));
}

export function useWatchlist() {
    const [items, setItems] = useState<WatchItem[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setItems(read());
        setReady(true);
        const sync = () => setItems(read());
        window.addEventListener(EVENT, sync);
        // `storage` łapie zmianę z INNEJ karty tej samej witryny.
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const has = useCallback(
        (kind: WatchKind, id: string) => items.some((i) => i.kind === kind && i.id === id),
        [items],
    );

    const toggle = useCallback((kind: WatchKind, id: string) => {
        const next = read();
        const idx = next.findIndex((i) => i.kind === kind && i.id === id);
        if (idx >= 0) next.splice(idx, 1);
        else next.push({ kind, id });
        write(next);
        setItems(next);
    }, []);

    const clear = useCallback(() => { write([]); setItems([]); }, []);

    return { items, ready, has, toggle, clear };
}
