// Cron Japonia (00:30 UTC = 9:30 JST, godzinę po komunikatach Statistics Bureau o 8:30 JST).
// Drugi przebieg tego samego dnia daje cron `refresh` (06:00 UTC = 15:00 JST), gdyby Statistics
// Dashboard wciągnął komunikat dopiero po południu.
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 60;

const ENDPOINTS = ['/api/jp/cpi?refresh=1', '/api/jp/cpi-contributions?refresh=1', '/api/jp/markets?refresh=1', '/api/jp/jgb?refresh=1', '/api/jp/labour?refresh=1'];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'jp');
}
