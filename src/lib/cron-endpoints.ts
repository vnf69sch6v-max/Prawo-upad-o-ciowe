// Listy endpointów cronów warm. Osobny moduł, bo plik `route.ts` w App Routerze może eksportować tylko handlery
// i konfigurację — a test (tests/gus-params.test.ts) sprawdza, że żaden z tych adresów nie dostaje 400, a test
// limitów (tests/function-limits.test.ts), że cron zdąży wywołać wszystkie trasy ze swojej listy.
//
// DBW dzieli globalny limit ~100 żądań/15 min, więc grupy dbw-1..4 idą co 2 h (09:40–15:40 UTC) i każda mieści
// się w jednym oknie.
import { cpiFullPath, dbwSeriesPath, gusMonthlyPath, koniunkturaPath, ppiFullPath } from '@/lib/gus-api-paths';

const R = { refresh: '1' };

export const CRON_ENDPOINTS = {
    // 09:40 UTC — ~72 wywołania: gus-cpi-full (64: COICOP 1999 kwartalnie 2016–2025 + COICOP 2018 miesięcznie 2026)
    // i ceny mieszkań (8: kwartalnie, 2 lata).
    'dbw-1': [cpiFullPath(R), dbwSeriesPath('housePrices', R)],
    // 13:40 UTC — ~77 wywołań: gus-ppi-full (53: 33 pozycje PKD, 10 lat) i ceny robót budowlanych (24).
    'dbw-2': [ppiFullPath(R), dbwSeriesPath('constructionPrices', R)],
    // 15:40 UTC — ~48 wywołań: koniunktura (24) i ceny skupu produktów rolnych (24). `/api/gus-cpi` wypadło
    // 25.10.2026: żadna strona go nie czyta, a cron palił na nie 24 wywołania dziennie i dostawał 504.
    'dbw-3': [koniunkturaPath(R), dbwSeriesPath('agriPrices', R)],
    // 11:40 UTC — ~72 wywołania: produkcja przemysłu, budownictwo, sprzedaż detaliczna (r/r, ceny stałe, po 24).
    'dbw-4': [dbwSeriesPath('industry', R), dbwSeriesPath('construction', R), dbwSeriesPath('retail', R)],
    // 05:00 UTC — GUS BDL po kolei (bez klucza ~5 żądań/s i ~100 / 15 min); ~60 zapytań.
    bdl: [
        '/api/bdl-series?start=461680&count=12&refresh=1',                 // bezrobocie rejestrowane (Przegląd, Praca)
        gusMonthlyPath(R),                                                 // przeciętne wynagrodzenie (Praca)
        '/api/bdl-series?start=154348&count=12&refresh=1',
        '/api/bdl-series?start=1615281&count=1&refresh=1',
        '/api/bdl-series?start=1615673&count=4&freq=q&step=6&refresh=1',   // BAEL stopa bezrobocia (P3982)
        '/api/bdl-series?start=1750141&count=12&step=6&refresh=1',         // mediana wynagrodzeń (P4610)
        '/api/regional-gus?refresh=1',                                     // PKB regionalne + demografia
        '/api/gus-regional',
    ],
} as const satisfies Record<string, readonly string[]>;

export type CronGroup = keyof typeof CRON_ENDPOINTS;

/** Odstęp między wywołaniami w `warmEndpoints` (ms). */
export const CRON_SPACING_MS = 1500;
