// Cron DBW grupa 2 (harmonogram 03:30) — ~77 wywołań DBW, samotnie w swoim oknie 15-min.
//  • gus-ppi-full  (53: PPI, 33 pozycje PKD, 10 lat)
//  • dbw-series var 312 / przekrój 93 (24: produkcja przemysłowa miesięcznie, 2 lata)
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/gus-ppi-full?refresh=1',
    '/api/dbw-series?var=312&przekroj=93&poz=6661787&refresh=1',
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'dbw-2');
}
