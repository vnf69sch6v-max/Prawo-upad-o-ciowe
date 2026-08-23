// Typy i stałe edytowalnego pulpitu Przeglądu.
// Oddzielone od registry.tsx i useDashboardLayout.ts, żeby uniknąć cyklu importów
// (registry ↔ hook oba potrzebują tych typów, a domyślny układ referuje widgety po id-stringu).

import type { ReactNode } from 'react';

export type WidgetCategory =
    | 'Przegląd'
    | 'Ceny'
    | 'Gospodarka'
    | 'Rynki'
    | 'Rynek pracy'
    | 'Newsy'
    | 'Publikacje'
    | 'Regiony';

/** Rozmiar kafla w jednostkach siatki: `w` = kolumny (1–3), `h` = rzędy (1–3). */
export interface WidgetSize { w: number; h: number }

/** Definicja widgetu w katalogu. `render` dostaje realny rozmiar, żeby wykresy mogły dopasować wysokość. */
export interface WidgetDef {
    id: string;
    title: string;
    category: WidgetCategory;
    /** Krótki opis do pickera. */
    description?: string;
    defaultSize: WidgetSize;
    /** Minimalna szerokość w kolumnach (np. tabela WIG20 potrzebuje ≥2). */
    minW?: number;
    /** Minimalna wysokość w rzędach. */
    minH?: number;
    /** Sekcja pełnej szerokości (hero, newsy) — nie wciskamy jej w stałą wysokość rzędu. */
    autoHeight?: boolean;
    render: (size: WidgetSize) => ReactNode;
}

/** Pojedynczy kafel w układzie użytkownika (zapisywany w localStorage). */
export interface WidgetInstance { widgetId: string; w: number; h: number }

// ── Geometria siatki ─────────────────────────────────────────
/** Maks. liczba kolumn (desktop). Na węższych ekranach klamrujemy w kodzie strony. */
export const MAX_COLS = 3;
/** Wysokość jednego rzędu siatki w px — stała, żeby `grid-row: span h` dawał równe kafle bez „masonry". */
export const GRID_ROW_H = 196;
/** Odstęp między kaflami w px (musi zgadzać się z `gap` w stylu siatki). */
export const GRID_GAP = 16;
/** Maks. wysokość kafla w rzędach. */
export const MAX_ROWS = 3;

/** Piksele dostępne na treść kafla o wysokości `h` rzędów (z uwzględnieniem gapów). */
export function cellHeightPx(h: number): number {
    return h * GRID_ROW_H + (h - 1) * GRID_GAP;
}

/**
 * Domyślny układ = dzisiejszy Przegląd (`src/app/page.tsx`):
 * hero → obserwowane → 5 KPI makro → 5 KPI rynków → newsy.
 * Pierwsza wizyta i „Przywróć domyślny układ" renderują dokładnie ten skład.
 */
export const DEFAULT_LAYOUT: WidgetInstance[] = [
    { widgetId: 'overview-hero', w: 3, h: 2 },
    { widgetId: 'watchlist-strip', w: 3, h: 1 },
    { widgetId: 'cpi-kpi', w: 1, h: 1 },
    { widgetId: 'unemployment-kpi', w: 1, h: 1 },
    { widgetId: 'nbp-rate-kpi', w: 1, h: 1 },
    { widgetId: 'industrial-kpi', w: 1, h: 1 },
    { widgetId: 'retail-kpi', w: 1, h: 1 },
    { widgetId: 'wig20-kpi', w: 1, h: 1 },
    { widgetId: 'eurpln-kpi', w: 1, h: 1 },
    { widgetId: 'usdpln-kpi', w: 1, h: 1 },
    { widgetId: 'yield-kpi', w: 1, h: 1 },
    { widgetId: 'gold-kpi', w: 1, h: 1 },
    { widgetId: 'latest-news', w: 3, h: 2 },
];

/** Sekcje pełnej szerokości — w canvasie idą jedna pod drugą, jak na dzisiejszym Przeglądzie. */
export const FULL_WIDTH_IDS = ['overview-hero', 'watchlist-strip', 'latest-news'] as const;

/** KPI rzędu „Wskaźniki makro" — przy kolejności domyślnej zostają w siatce 5-kolumnowej. */
export const MACRO_KPI_IDS = [
    'cpi-kpi',
    'unemployment-kpi',
    'nbp-rate-kpi',
    'industrial-kpi',
    'retail-kpi',
] as const;

/** KPI rzędu „Rynki finansowe". */
export const MARKET_KPI_IDS = [
    'wig20-kpi',
    'eurpln-kpi',
    'usdpln-kpi',
    'yield-kpi',
    'gold-kpi',
] as const;

export const STORAGE_KEY = 'mk:overview:v1';
export const STORAGE_EVENT = 'mk:overview';

export function layoutsEqual(a: WidgetInstance[], b: WidgetInstance[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((it, i) => it.widgetId === b[i].widgetId && it.w === b[i].w && it.h === b[i].h);
}
