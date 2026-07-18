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
    // Eurostat
    '/api/eurostat?indicator=cpi&geo=PL',
    '/api/eurostat?indicator=unemployment&geo=PL',
    '/api/eurostat?indicator=gdp_yoy&geo=PL',
    '/api/eurostat?indicator=gdp_qoq&geo=PL',
    '/api/eurostat?indicator=gdp_consumption&geo=PL',
    '/api/eurostat?indicator=gdp_investment&geo=PL',
    '/api/eurostat?indicator=gdp_exports&geo=PL',
    '/api/eurostat?indicator=gdp_imports&geo=PL',
    '/api/eurostat?indicator=industrial&geo=PL',
    '/api/eurostat?indicator=retail&geo=PL',
    '/api/eurostat?indicator=ppi&geo=PL',            // struktura inflacji (CPI vs PPI)
    '/api/eurostat?indicator=hicp_core_yoy&geo=PL',  // inflacja bazowa
    '/api/regional-eu',                              // PKB regionalne + demografia (NUTS-2)
    // NBP + rynki
    '/api/nbp?table=a',
    '/api/nbp-rates',
    '/api/wibor',
    '/api/nbp?gold=true&last=90',
    // Rynki: indeks GPW + surowce (Yahoo Finance)
    '/api/stooq?symbol=wig20&limit=60',
    '/api/stooq?symbol=mwig40&limit=60',
    '/api/stooq?symbol=swig80&limit=60',
    '/api/stooq?symbol=cb.c&limit=90',
    '/api/stooq?symbol=cl.c&limit=90',
    '/api/stooq?symbol=gc.c&limit=90',
    '/api/stooq?symbol=hg.c&limit=90',
    '/api/stooq?symbol=ng.c&limit=90',
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
