// Cron DBW grupa 4 (harmonogram 11:40 UTC) — ~72 wywołania DBW, samotnie w swoim oknie 15-min.
// Wskaźniki krótkookresowe z Przeglądu i Gospodarki (r/r, ceny stałe, 2 lata × 12 miesięcy):
//  • produkcja sprzedana przemysłu (zm. 814)        — 24
//  • produkcja budowlano-montażowa (zm. 392)        — 24
//  • sprzedaż detaliczna (zm. 109)                  — 24
// URL-e z `dbwSeriesPath()` → ten sam klucz cache, który czytają hooki.
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { dbwSeriesPath, GUS_CONSTRUCTION_SERIES, GUS_INDUSTRY_SERIES, GUS_RETAIL_SERIES } from '@/lib/gus-dbw-series';

export const maxDuration = 120;

export async function GET(request: NextRequest) {
    const endpoints = [GUS_INDUSTRY_SERIES, GUS_CONSTRUCTION_SERIES, GUS_RETAIL_SERIES]
        .map((s) => dbwSeriesPath(s, { refresh: '1' }));
    return warmEndpoints(request, endpoints, 'dbw-4');
}
