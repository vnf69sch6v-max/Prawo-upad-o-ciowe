// Współdzielony warm cron: sekwencyjne odświeżanie listy endpointów z odstępem + guard CRON_SECRET.
// DBW dzieli globalny limit ~100 żądań/15 min, więc ciężkie endpointy są rozbite na grupy dbw-1/2/3
// odpalane w ODDZIELNYCH oknach 15-min (harmonogram co 30 min). Każda grupa woła endpoint z ?refresh=1,
// co wymusza refetch (pomija 48h cache czytany przez użytkownika) i wpisuje świeże dane do cache.
import { NextRequest, NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function warmEndpoints(
    request: NextRequest,
    endpoints: string[],
    group: string,
    spacingMs = 1500,
) {
    // Vercel dołącza `Authorization: Bearer ${CRON_SECRET}` automatycznie, gdy CRON_SECRET jest ustawiony.
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    const results: Record<string, number | string> = {};
    let ok = 0;
    for (const ep of endpoints) {
        try {
            const res = await fetch(origin + ep, { cache: 'no-store' });
            results[ep] = res.status;
            if (res.status === 200) ok++;
        } catch (e) {
            results[ep] = `error: ${String(e).slice(0, 60)}`;
        }
        await sleep(spacingMs);
    }
    return NextResponse.json({ group, ok, total: endpoints.length, timestamp: new Date().toISOString(), results });
}
