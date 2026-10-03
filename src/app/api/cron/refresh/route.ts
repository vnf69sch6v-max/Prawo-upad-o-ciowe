// Dzienny warm cache dla źródeł SPOZA GUS DBW/BDL (Eurostat, NBP, Yahoo, SMUP, newsy).
// Każde z nich ma osobny limit → bezpiecznie równolegle.
// Ciężkie DBW (CPI/PPI/koniunktura/serie) dzielą globalny limit ~100 żądań/15 min, więc mają
// WŁASNE crony dbw-1..4 co 2 h po komunikatach GUS (09:40–15:40 UTC) — patrz vercel.json.
// Vercel dołącza `Authorization: Bearer ${CRON_SECRET}` automatycznie, gdy CRON_SECRET jest ustawiony.
import { NextRequest, NextResponse } from 'next/server';
import { recordCronRun } from '@/lib/cron-log';
import { summarizeResults } from '@/lib/cron-runs';
import { internalCall, internalOrigin } from '@/lib/internal-fetch';

export const maxDuration = 120;

const ENDPOINTS = [
    // GUS BDL (rynek pracy, płace, regiony) → osobny, sekwencyjny cron `bdl` (05:00): równolegle
    // z resztą tej listy przekraczał limit BDL (~5 żądań/s bez klucza) i serie wracały z dziurami.
    // Eurostat — `refresh=1` WYMUSZA pobranie u źródła. Bez tego warm tylko czytał cache
    // i, gdy wpis wyglądał na świeży, nie odświeżał niczego (produkcja potrafiła stać
    // tygodniami na starych danych mimo „zielonego" crona).
    '/api/eurostat?indicator=cpi&geo=PL&refresh=1',
    '/api/eurostat?indicator=unemployment&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_yoy&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_qoq&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_consumption&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_investment&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_exports&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_imports&geo=PL&refresh=1',
    '/api/eurostat?indicator=industrial&geo=PL&refresh=1',
    '/api/eurostat?indicator=retail&geo=PL&refresh=1',
    '/api/eurostat?indicator=ppi&geo=PL&refresh=1',            // struktura inflacji (CPI vs PPI)
    '/api/eurostat?indicator=hicp_core_yoy&geo=PL&refresh=1',  // inflacja bazowa
    '/api/eurostat?indicator=construction&geo=PL&refresh=1',
    '/api/eurostat?indicator=exports&geo=PL&refresh=1',
    '/api/eurostat?indicator=imports&geo=PL&refresh=1',
    '/api/eurostat?indicator=current_account&geo=PL&refresh=1',
    '/api/eurostat?indicator=consumer_confidence&geo=PL&refresh=1',
    '/api/eurostat?indicator=bond_yield_10y&geo=PL&refresh=1',
    '/api/eurostat?indicator=gov_debt&geo=PL&refresh=1',
    '/api/eurostat?indicator=gov_deficit&geo=PL&refresh=1',
    '/api/eurostat?indicator=gdp_annual&geo=PL&refresh=1',
    '/api/eurostat?indicator=cpi_annual&geo=PL&refresh=1',
    '/api/eurostat?indicator=hicp_food_yoy&geo=PL&refresh=1',
    // NBP + rynki — dublują crony nbp/stooq (pn–pt); tu codziennie, więc dane nie stoją w weekend
    '/api/nbp?table=a&refresh=1',
    '/api/nbp-rates',
    '/api/wibor?refresh=1',
    '/api/nbp?gold=true&last=90&refresh=1',
    // Rynki: indeksy GPW + spółki + surowce (Yahoo Finance)
    '/api/stooq?symbol=wig20&limit=60&refresh=1',
    '/api/stooq?symbol=mwig40&limit=60&refresh=1',
    '/api/stooq?symbol=swig80&limit=60&refresh=1',
    '/api/wig20?refresh=1',
    '/api/stooq?symbol=cb.c&limit=90&refresh=1',
    '/api/stooq?symbol=cl.c&limit=90&refresh=1',
    '/api/stooq?symbol=gc.c&limit=90&refresh=1',
    '/api/stooq?symbol=hg.c&limit=90&refresh=1',
    '/api/stooq?symbol=ng.c&limit=90&refresh=1',
    // Samorząd
    '/api/smup?resource=areas-list',
    // Newsy (RSS — limity niezależne od DBW)
    '/api/news?refresh=1',
];

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Publiczna domena, nie adres wdrożenia `*.vercel.app` (za logowaniem Vercela) — src/lib/internal-fetch.ts.
    const origin = internalOrigin(request);
    const startedAt = Date.now();
    const results: Record<string, number | string> = {};
    let ok = 0;
    await Promise.allSettled(
        ENDPOINTS.map(async (ep) => {
            results[ep] = await internalCall(origin + ep);
            if (results[ep] === 200) ok++;
        }),
    );

    await recordCronRun('refresh', summarizeResults(results, startedAt, origin));
    return NextResponse.json({ origin, ok, total: ENDPOINTS.length, timestamp: new Date().toISOString(), results });
}
