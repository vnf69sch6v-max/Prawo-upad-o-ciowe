// Daily cache-warming cron — pre-fetches every data endpoint so Firestore cache
// always holds the LATEST each source publishes (auto-updates when GUS/Eurostat release).
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when CRON_SECRET is set.
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

// DBW dzieli globalny limit ~100 żądań/15 min, a każdy z tych endpointów robi dziesiątki
// wewnętrznych wywołań — więc odpalamy je SEKWENCYJNIE z odstępem, żeby nie zthrottlować
// (równoległy blast = 429 i nieświeże dane). Reszta źródeł ma osobne limity → równolegle.
const DBW_ENDPOINTS = [
    '/api/gus-cpi-full',   // najważniejsze (flagowa inflacja) — najpierw
    '/api/gus-cpi',
    '/api/gus-koniunktura',
    '/api/gus-ppi-full',   // flagowe PPI (33 pozycje PKD, 10 lat) — zastępuje starą dbw-series PPI
    '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&freq=q',
    '/api/dbw-series?var=312&przekroj=93&poz=6661787',
    '/api/dbw-series?var=324&przekroj=775&poz=7124703&poz=7124713&poz=7124724&poz=7189791&poz=7121981',
];
const OTHER_ENDPOINTS = [
    // Rynek pracy + regiony (BDL — tanie, wszystkie lata w 1 wywołaniu)
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
    '/api/stooq?symbol=cb.c&limit=90',
    '/api/stooq?symbol=cl.c&limit=90',
    '/api/stooq?symbol=gc.c&limit=90',
    '/api/stooq?symbol=hg.c&limit=90',
    '/api/stooq?symbol=ng.c&limit=90',
    // Samorząd
    '/api/smup?resource=areas-list',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    const results: Record<string, number | string> = {};
    let ok = 0;
    const warm = async (ep: string) => {
        try {
            const res = await fetch(origin + ep, { cache: 'no-store' });
            results[ep] = res.status;
            if (res.status === 200) ok++;
        } catch (e) {
            results[ep] = `error: ${String(e).slice(0, 60)}`;
        }
    };

    // DBW sekwencyjnie (z odstępem), pozostałe równolegle — jednocześnie względem siebie.
    await Promise.all([
        Promise.allSettled(OTHER_ENDPOINTS.map(warm)),
        (async () => { for (const ep of DBW_ENDPOINTS) { await warm(ep); await sleep(3000); } })(),
    ]);

    const total = DBW_ENDPOINTS.length + OTHER_ENDPOINTS.length;
    return NextResponse.json({ ok, total, timestamp: new Date().toISOString(), results });
}
