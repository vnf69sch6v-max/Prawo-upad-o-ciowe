'use client';

/**
 * Układ pulpitu Przeglądu — kafle wybrane przez użytkownika, trzymane w `localStorage`.
 *
 * Wzorowane na `lib/watchlist.ts`: hydration-safe (flaga `ready`, bo `localStorage` nie istnieje
 * po stronie serwera), a zmiany rozsyłamy zdarzeniem `mk:overview`, żeby wiele instancji hooka
 * na jednej stronie widziało to samo. Walidujemy kształt i odrzucamy nieznane id widgetów.
 *
 * Pierwsza wizyta NIE zapisuje nic — brak klucza = dokładnie dzisiejszy Przegląd.
 * „Przywróć domyślny układ" kasuje klucz, zamiast zapisywać kopię defaultu.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_LAYOUT, MAX_COLS, MAX_ROWS, STORAGE_KEY, STORAGE_EVENT,
    layoutsEqual, type WidgetInstance,
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

function defaultLayout(): WidgetInstance[] {
    return DEFAULT_LAYOUT.map(sanitize).filter((x): x is WidgetInstance => x != null);
}

function read(): WidgetInstance[] {
    if (typeof window === 'undefined') return defaultLayout();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultLayout();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return defaultLayout();
        const seen = new Set<string>();
        const next = parsed
            .filter((x): x is WidgetInstance => x && typeof x.widgetId === 'string' && widgetExists(x.widgetId))
            .map(sanitize)
            .filter((x): x is WidgetInstance => {
                if (!x || seen.has(x.widgetId)) return false;
                seen.add(x.widgetId);
                return true;
            });
        return next.length ? next : defaultLayout();
    } catch {
        return defaultLayout();
    }
}

function write(items: WidgetInstance[]) {
    try {
        if (layoutsEqual(items, defaultLayout())) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    } catch { /* tryb prywatny / brak miejsca — układ jest dodatkiem, nie blokujemy UI */ }
    window.dispatchEvent(new Event(STORAGE_EVENT));
}

function clearStorage() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useDashboardLayout() {
    const [layout, setLayoutState] = useState<WidgetInstance[]>(() => defaultLayout());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setLayoutState(read()); // eslint-disable-line react-hooks/set-state-in-effect -- hydration: localStorage only exists on the client
        setReady(true);
        const sync = () => setLayoutState(read());
        window.addEventListener(STORAGE_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(STORAGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const isDefault = useMemo(() => layoutsEqual(layout, defaultLayout()), [layout]);

    const commit = useCallback((next: WidgetInstance[]) => {
        write(next);
        setLayoutState(next);
    }, []);

    const setLayout = useCallback((next: WidgetInstance[]) => commit(next), [commit]);

    const addWidget = useCallback((widgetId: string) => {
        const def = getWidget(widgetId);
        if (!def) return;
        const next = read();
        if (next.some((i) => i.widgetId === widgetId)) return;
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

    const reset = useCallback(() => {
        clearStorage();
        setLayoutState(defaultLayout());
    }, []);

    return {
        layout,
        ready,
        isDefault,
        setLayout,
        addWidget,
        removeWidget,
        resize,
        cycleWidth,
        cycleHeight,
        reset,
    };
}
