'use client';

/**
 * Układ „Mojego panelu" — kafle wybrane przez użytkownika, trzymane w `localStorage`.
 *
 * Wzorowane na `lib/watchlist.ts`: hydration-safe (flaga `ready`, bo `localStorage` nie istnieje
 * po stronie serwera), a zmiany rozsyłamy zdarzeniem `mk:dashboard`, żeby wiele instancji hooka
 * na jednej stronie widziało to samo. Walidujemy kształt i odrzucamy nieznane id widgetów
 * (np. po usunięciu widgetu z katalogu albo ręcznej edycji storage).
 */

import { useCallback, useEffect, useState } from 'react';
import {
    DEFAULT_LAYOUT, MAX_COLS, MAX_ROWS, STORAGE_KEY, STORAGE_EVENT, type WidgetInstance,
} from './types';
import { getWidget, widgetExists } from './registry';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function sanitize(instance: WidgetInstance): WidgetInstance | null {
    const def = getWidget(instance.widgetId);
    if (!def) return null;
    const minW = def.minW ?? 1;
    const minH = def.minH ?? 1;
    return {
        widgetId: instance.widgetId,
        w: clamp(Math.round(instance.w) || def.defaultSize.w, minW, MAX_COLS),
        h: clamp(Math.round(instance.h) || def.defaultSize.h, minH, MAX_ROWS),
    };
}

function read(): WidgetInstance[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_LAYOUT.map(sanitize).filter((x): x is WidgetInstance => x != null);
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const seen = new Set<string>();
        return parsed
            .filter((x): x is WidgetInstance => x && typeof x.widgetId === 'string' && widgetExists(x.widgetId))
            .map(sanitize)
            .filter((x): x is WidgetInstance => {
                if (!x || seen.has(x.widgetId)) return false; // bez duplikatów — id jest kluczem sortable
                seen.add(x.widgetId);
                return true;
            });
    } catch {
        return [];
    }
}

function write(items: WidgetInstance[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* tryb prywatny / brak miejsca — panel jest dodatkiem, nie blokujemy UI */ }
    window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function defaultLayout(): WidgetInstance[] {
    return DEFAULT_LAYOUT.map(sanitize).filter((x): x is WidgetInstance => x != null);
}

export function useDashboardLayout() {
    const [layout, setLayoutState] = useState<WidgetInstance[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setLayoutState(read());
        setReady(true);
        const sync = () => setLayoutState(read());
        window.addEventListener(STORAGE_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(STORAGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const commit = useCallback((next: WidgetInstance[]) => {
        write(next);
        setLayoutState(next);
    }, []);

    const setLayout = useCallback((next: WidgetInstance[]) => commit(next), [commit]);

    const addWidget = useCallback((widgetId: string) => {
        const def = getWidget(widgetId);
        if (!def) return;
        const next = read();
        if (next.some((i) => i.widgetId === widgetId)) return; // już dodany
        next.push({ widgetId, w: def.defaultSize.w, h: def.defaultSize.h });
        commit(next);
    }, [commit]);

    const removeWidget = useCallback((widgetId: string) => {
        commit(read().filter((i) => i.widgetId !== widgetId));
    }, [commit]);

    const resize = useCallback((widgetId: string, patch: Partial<Pick<WidgetInstance, 'w' | 'h'>>) => {
        const next = read().map((i) => (i.widgetId === widgetId ? sanitize({ ...i, ...patch }) ?? i : i));
        commit(next);
    }, [commit]);

    /** Cykl szerokości 1→2→3→1 (klamrowany do minW). */
    const cycleWidth = useCallback((widgetId: string) => {
        const cur = read().find((i) => i.widgetId === widgetId);
        if (!cur) return;
        const minW = getWidget(widgetId)?.minW ?? 1;
        const nextW = cur.w >= MAX_COLS ? minW : cur.w + 1;
        resize(widgetId, { w: nextW });
    }, [resize]);

    /** Cykl wysokości 1→2→3→1 (klamrowany do minH). */
    const cycleHeight = useCallback((widgetId: string) => {
        const cur = read().find((i) => i.widgetId === widgetId);
        if (!cur) return;
        const minH = getWidget(widgetId)?.minH ?? 1;
        const nextH = cur.h >= MAX_ROWS ? minH : cur.h + 1;
        resize(widgetId, { h: nextH });
    }, [resize]);

    const reset = useCallback(() => commit(defaultLayout()), [commit]);

    return { layout, ready, setLayout, addWidget, removeWidget, resize, cycleWidth, cycleHeight, reset };
}
