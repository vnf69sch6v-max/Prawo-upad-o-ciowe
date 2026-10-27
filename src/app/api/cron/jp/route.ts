// Cron Japonia (00:30 UTC = 9:30 JST, godzinę po komunikatach Statistics Bureau o 8:30 JST).
// Drugi przebieg tego samego dnia daje cron `refresh` (06:00 UTC = 15:00 JST), gdyby Statistics
// Dashboard wciągnął komunikat dopiero po południu.
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

// CPI ma własny limit 60 s. Pozostałe trasy kończą się w kilka sekund, gdy Dashboard odpowiada.
// 120 s zostawia zapas na wolniejszą odpowiedź i zapis przebiegu po ostatniej trasie.
export const maxDuration = 120;

const ENDPOINTS = ['/api/jp/cpi?refresh=1', '/api/jp/cpi-contributions?refresh=1', '/api/jp/markets?refresh=1', '/api/jp/jgb?refresh=1', '/api/jp/labour?refresh=1', '/api/jp/jobs?refresh=1', '/api/jp/wages?refresh=1', '/api/jp/industry?refresh=1', '/api/jp/tertiary?refresh=1', '/api/jp/retail?refresh=1', '/api/jp/gdp?refresh=1', '/api/jp/trade?refresh=1', '/api/jp/cgpi?refresh=1', '/api/jp/sppi?refresh=1', '/api/jp/orders?refresh=1', '/api/jp/housing?refresh=1'];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'jp');
}
