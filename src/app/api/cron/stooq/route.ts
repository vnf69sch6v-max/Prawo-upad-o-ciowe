// Cron: odświeżenie danych rynkowych (indeksy GPW, spółki WIG20, surowce).
// Harmonogram: pn–pt 17:30 CET (po zamknięciu sesji GPW).
//
// UWAGA — poprzednia wersja pobierała CSV bezpośrednio ze stooq.pl i JE WYRZUCAŁA
// (nigdy nie zapisywała do cache'u), w dodatku ze źródła, którego aplikacja już nie używa:
// `/api/stooq` i `/api/wig20` biorą dane z Yahoo, bo stooq.pl na żądanie serwera zwraca HTML.
// Cron był więc podwójnie bezużyteczny. Teraz uderza we własne endpointy z `?refresh=1`.
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    // Indeksy GPW
    '/api/stooq?symbol=wig20&limit=60&refresh=1',
    '/api/stooq?symbol=mwig40&limit=60&refresh=1',
    '/api/stooq?symbol=swig80&limit=60&refresh=1',
    // Spółki WIG20 (jedno zbiorcze żądanie)
    '/api/wig20?refresh=1',
    // Surowce
    '/api/stooq?symbol=cb.c&limit=90&refresh=1',   // Brent
    '/api/stooq?symbol=cl.c&limit=90&refresh=1',   // WTI
    '/api/stooq?symbol=gc.c&limit=90&refresh=1',   // złoto
    '/api/stooq?symbol=hg.c&limit=90&refresh=1',   // miedź
    '/api/stooq?symbol=ng.c&limit=90&refresh=1',   // gaz
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'rynki', 400);
}
