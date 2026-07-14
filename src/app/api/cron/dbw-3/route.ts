// Cron DBW grupa 3 (harmonogram 04:00) — ~72 wywołania DBW, samotnie w swoim oknie 15-min.
//  • gus-cpi          (24: krajowy CPI headline, miesięcznie, 2 lata)
//  • gus-koniunktura  (24: badanie koniunktury GUS, miesięcznie, 2 lata)
//  • dbw-series var 324 / przekrój 775 (24: sprzedaż detaliczna miesięcznie, 2 lata)
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/gus-cpi?refresh=1',
    '/api/gus-koniunktura?refresh=1',
    '/api/dbw-series?var=324&przekroj=775&poz=7124703&poz=7124713&poz=7124724&poz=7189791&poz=7121981&refresh=1',
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'dbw-3');
}
