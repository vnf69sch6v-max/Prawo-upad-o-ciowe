// Cron GUS BDL (harmonogram 05:00) — sekwencyjnie, z odstępami (`warmEndpoints`).
// BDL bez klucza API wpuszcza ~5 żądań/s i ~100 / 15 min; ta grupa to ~60 zapytań, więc idzie
// w swoim oknie i po kolei. `refresh=1` → pobranie u źródła z `no-store` (src/lib/upstream-fetch.ts);
// pusta albo nieudana odpowiedź nie nadpisuje poprzednich danych (withCache).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/bdl-series?start=461680&count=12&refresh=1',                 // bezrobocie rejestrowane (Przegląd, Praca)
    '/api/gus-monthly?refresh=1',                                      // przeciętne wynagrodzenie (Praca)
    '/api/bdl-series?start=154348&count=12&refresh=1',
    '/api/bdl-series?start=1615281&count=1&refresh=1',
    '/api/bdl-series?start=1615673&count=4&freq=q&step=6&refresh=1',   // BAEL stopa bezrobocia (P3982)
    '/api/bdl-series?start=1750141&count=12&step=6&refresh=1',         // mediana wynagrodzeń (P4610)
    '/api/regional-gus?refresh=1',                                     // PKB regionalne + demografia
    '/api/gus-regional',
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'bdl');
}
