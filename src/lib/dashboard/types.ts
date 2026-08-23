// Typy i stałe edytowalnego pulpitu Przeglądu.
// Oddzielone od registry.tsx i useDashboardLayout.ts, żeby uniknąć cyklu importów.

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

export interface WidgetSize { w: number; h: number }

export interface WidgetDef {
    id: string;
    title: string;
    category: WidgetCategory;
    description?: string;
    defaultSize: WidgetSize;
    minW?: number;
    minH?: number;
    autoHeight?: boolean;
    render: (size: WidgetSize) => ReactNode;
}

export interface WidgetInstance { widgetId: string; w: number; h: number }

export const MAX_COLS = 3;
export const GRID_ROW_H = 196;
export const GRID_GAP = 16;
export const MAX_ROWS = 3;

export function cellHeightPx(h: number): number {
    return h * GRID_ROW_H + (h - 1) * GRID_GAP;
}

/**
 * Domyślny układ = dzisiejszy Przegląd (`src/app/page.tsx`):
 * hero → obserwowane → 5 KPI makro → 5 KPI rynków → newsy.
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

export const FULL_WIDTH_IDS = ['overview-hero', 'watchlist-strip', 'latest-news'] as const;

export const MACRO_KPI_IDS = [
    'cpi-kpi',
    'unemployment-kpi',
    'nbp-rate-kpi',
    'industrial-kpi',
    'retail-kpi',
] as const;

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
