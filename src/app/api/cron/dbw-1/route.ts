// Cron DBW grupa 1 (harmonogram 03:00) — ~72 wywołania DBW, samotnie w swoim oknie 15-min.
//  • gus-cpi-full  (64: COICOP 1999 kwartalnie 2016–2025 + COICOP 2018 miesięcznie 2026)
//  • dbw-series var 310 / przekrój 484 (8: budownictwo kwartalnie, 2 lata)
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/gus-cpi-full?refresh=1',
    '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&freq=q&refresh=1',
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'dbw-1');
}
