// Dzienny warm cache dla źródeł SPOZA DBW (Eurostat, NBP, Stooq, BDL, SMUP, regiony).
// Każde z nich ma osobny limit → bezpiecznie równolegle.
// Ciężkie DBW (CPI/PPI/koniunktura/serie) dzielą globalny limit ~100 żądań/15 min, więc mają
// WŁASNE crony dbw-1/2/3 rozłożone na osobne okna 15-min (03:00 / 03:30 / 04:00) — patrz vercel.json.
// Vercel dołącza `Authorization: Bearer ${CRON_SECRET}` automatycznie, gdy CRON_SECRET jest ustawiony.
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

const ENDPOINTS = [
    // Rynek pracy + regiony (BDL — osobny limit, wszystkie lata w 1 wywołaniu)
    '/api/bdl-series?start=154348&count=12',
    '/api/bdl-series?start=1615281&count=1',
    '/api/bdl-series?start=1615457&count=1',
    '/api/gus-regional',
    '/api/gus-monthly',
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
    '/api/regional-eu?refresh=1',                              // PKB regionalne + demografia (NUTS-2)
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

    const origin = new URL(request.url).origin;
    const results: Record<string, number | string> = {};
    let ok = 0;
    await Promise.allSettled(
        ENDPOINTS.map(async (ep) => {
            try {
                const res = await fetch(origin + ep, { cache: 'no-store' });
                results[ep] = res.status;
                if (res.status === 200) ok++;
            } catch (e) {
                results[ep] = `error: ${String(e).slice(0, 60)}`;
            }
        }),
    );

    return NextResponse.json({ ok, total: ENDPOINTS.length, timestamp: new Date().toISOString(), results });
}
