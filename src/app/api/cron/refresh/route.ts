// Daily cache-warming cron — pre-fetches every data endpoint so Firestore cache
// always holds the LATEST each source publishes (auto-updates when GUS/Eurostat release).
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when CRON_SECRET is set.
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

const ENDPOINTS = [
    // Ceny (DBW)
    '/api/gus-cpi',
    '/api/dbw-series?var=314&przekroj=657&poz=6966261&poz=6971743',
    '/api/dbw-series?var=310&przekroj=484&poz=4801795&poz=4801796&freq=q',
    '/api/dbw-series?var=312&przekroj=93&poz=6661787',
    '/api/dbw-series?var=324&przekroj=775&poz=7124703&poz=7124713&poz=7124724&poz=7189791&poz=7121981',
    // Gospodarka / koniunktura
    '/api/gus-koniunktura',
    // Rynek pracy (BDL)
    '/api/bdl-series?start=154348&count=12',
    '/api/bdl-series?start=1615281&count=1',
    '/api/bdl-series?start=1615457&count=1',
    '/api/gus-regional',
    '/api/gus-monthly',
    // Eurostat
    '/api/eurostat?indicator=cpi&geo=PL',
    '/api/eurostat?indicator=unemployment&geo=PL',
    '/api/eurostat?indicator=gdp_yoy&geo=PL',
    '/api/eurostat?indicator=industrial&geo=PL',
    '/api/eurostat?indicator=retail&geo=PL',
    // NBP + rynki
    '/api/nbp?table=a',
    '/api/nbp-rates',
    '/api/wibor',
    '/api/nbp?gold=true&last=90',
    // Samorząd
    '/api/smup?resource=areas-list',
];

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    const settled = await Promise.allSettled(
        ENDPOINTS.map(async (ep) => {
            const res = await fetch(origin + ep, { cache: 'no-store' });
            return { ep, status: res.status };
        }),
    );

    const results: Record<string, number | string> = {};
    let ok = 0;
    for (const s of settled) {
        if (s.status === 'fulfilled') { results[s.value.ep] = s.value.status; if (s.value.status === 200) ok++; }
        else results[String(s.reason)] = 'error';
    }
    return NextResponse.json({ ok, total: ENDPOINTS.length, timestamp: new Date().toISOString(), results });
}
