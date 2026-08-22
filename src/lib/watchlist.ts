'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Watchlista — wskaźniki i spółki obserwowane przez użytkownika, trzymane w `localStorage`.
 *
 * ─── Dlaczego JEDEN store na moduł, a nie stan per komponent ───
 * Gwiazdka wisi przy każdym kaflu KPI i przy każdym wierszu tabeli spółek — na Przeglądzie i na
 * `/rynki?tab=gpw` to kilkadziesiąt instancji hooka naraz. Wersja ze `useState` + `useEffect`
 * w każdej z nich zakładała 2 listenery na instancję i przy KAŻDYM przełączeniu gwiazdki robiła
 * tyle `JSON.parse` ile jest gwiazdek na stronie. Stąd: jedna kopia listy w module, jeden komplet
 * listenerów okna (podpinany przy pierwszym subskrybencie, odpinany przy ostatnim) i
 * `useSyncExternalStore`, który rozsyła zmianę do wszystkich naraz.
 *
 * ─── Hydration ───
 * `localStorage` NIE istnieje na serwerze, więc `getServerSnapshot` zwraca stałą pustą tablicę.
 * React używa jej TAKŻE przy pierwszym renderze klienckim (hydracji) i dopiero po niej przechodzi
 * na snapshot kliencki — dlatego mismatch jest niemożliwy i NIE potrzeba tu żadnej flagi `ready`
 * ani `useEffect`. Poprzednia wersja trzymała taką flagę w `useState` + `useEffect`; to jest
 * dokładnie ten `setState` w efekcie, przed którym ostrzega `react-hooks/set-state-in-effect`.
 * Konsekwencja do zapamiętania: przez jeden render po stronie klienta lista jest PUSTA, więc
 * gwiazdki startują niezaznaczone, a pas „Obserwowane" jest ukryty — to poprawne, nie błąd.
 *
 * ⚠ `getSnapshot` MUSI zwracać tę samą referencję, dopóki dane się nie zmienią — inaczej
 * `useSyncExternalStore` wpada w pętlę renderów. Stąd `cache` i unieważnianie go w `emit()`.
 */

export type WatchKind = 'wskaznik' | 'spolka';
export interface WatchItem { kind: WatchKind; id: string }

const KEY = 'mk:watchlist:v1';
const EVENT = 'mk:watchlist';
const EMPTY: WatchItem[] = [];

function read(): WatchItem[] {
    if (typeof window === 'undefined') return EMPTY;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return EMPTY;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return EMPTY;
        // Walidujemy kształt — w localStorage może siedzieć cokolwiek (stara wersja, ręczna edycja).
        return parsed.filter(
            (x): x is WatchItem =>
                x && typeof x.id === 'string' && (x.kind === 'wskaznik' || x.kind === 'spolka'),
        );
    } catch {
        return EMPTY;
    }
}

// ── store ──────────────────────────────────────────────────
let cache: WatchItem[] | null = null;
const listeners = new Set<() => void>();

function emit() {
    cache = null;
    listeners.forEach((l) => l());
}

function getSnapshot(): WatchItem[] {
    if (cache === null) cache = read();
    return cache;
}

function getServerSnapshot(): WatchItem[] {
    return EMPTY;
}

// `storage` łapie zmianę z INNEJ karty tej samej witryny; `mk:watchlist` — z tej samej.
const onExternalChange = () => emit();

function subscribe(listener: () => void) {
    if (listeners.size === 0) {
        window.addEventListener(EVENT, onExternalChange);
        window.addEventListener('storage', onExternalChange);
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            window.removeEventListener(EVENT, onExternalChange);
            window.removeEventListener('storage', onExternalChange);
        }
    };
}

function write(items: WatchItem[]) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch { /* prywatny tryb / brak miejsca — watchlista jest dodatkiem, nie blokujemy UI */ }
    // Zdarzenie odświeża instancje w TEJ karcie; `storage` odpala się tylko w pozostałych.
    window.dispatchEvent(new Event(EVENT));
}

export function toggleWatch(kind: WatchKind, id: string) {
    const next = read().slice();
    const idx = next.findIndex((i) => i.kind === kind && i.id === id);
    if (idx >= 0) next.splice(idx, 1);
    else next.push({ kind, id });
    write(next);
}

export function useWatchlist() {
    const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const has = useCallback(
        (kind: WatchKind, id: string) => items.some((i) => i.kind === kind && i.id === id),
        [items],
    );

    const clear = useCallback(() => write([]), []);

    return { items, has, toggle: toggleWatch, clear };
}
