// Cron: odświeżenie danych NBP (kursy, złoto, stopy, WIBOR).
// Harmonogram: pn–pt 13:00 CET (NBP publikuje tabelę ok. 12:15).
//
// UWAGA — poprzednia wersja tego crona pobierała dane z api.nbp.pl i JE WYRZUCAŁA
// (przypisywała do nieużywanych zmiennych, nigdy nie wołała setServerCache). Raportowała
// „ok", a cache serwerowy nie był odświeżany — przez co produkcja potrafiła miesiącami
// serwować starą tabelę kursów. Teraz cron uderza we WŁASNE endpointy z `?refresh=1`,
// co wymusza pobranie u źródła i zapis do cache'u.
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/nbp?table=a&refresh=1',              // tabela kursów średnich
    '/api/nbp?table=c&refresh=1',              // kursy kupna/sprzedaży
    '/api/nbp?gold=true&last=90&refresh=1',    // ceny złota
    '/api/nbp-rates',                          // stopy NBP (bez cache — zawsze świeże)
    '/api/wibor',
    // Historie głównych walut (wykresy kursów)
    '/api/nbp?code=EUR&last=30&refresh=1',
    '/api/nbp?code=USD&last=30&refresh=1',
    '/api/nbp?code=CHF&last=30&refresh=1',
    '/api/nbp?code=GBP&last=30&refresh=1',
];

export async function GET(request: NextRequest) {
    // NBP nie ma restrykcyjnego limitu jak DBW — wystarczy krótki odstęp.
    return warmEndpoints(request, ENDPOINTS, 'nbp', 300);
}
