// Współdzielony warm cron: sekwencyjne odświeżanie listy endpointów z odstępem + guard CRON_SECRET.
// DBW dzieli globalny limit ~100 żądań/15 min, więc ciężkie endpointy są rozbite na grupy dbw-1..4
// odpalane co 2 h (09:40–15:40 UTC, po komunikatach GUS o 10:00 czasu PL) — odstęp wytrzymuje nawet
// godzinną tolerancję startu cronów na planie Hobby. Każda grupa woła endpoint z ?refresh=1,
// co wymusza refetch (pomija 48h cache czytany przez użytkownika) i wpisuje świeże dane do cache.
import { NextRequest, NextResponse } from 'next/server';
import { recordCronRun } from '@/lib/cron-log';
import { summarizeResults } from '@/lib/cron-runs';
import { internalCall, internalOrigin } from '@/lib/internal-fetch';

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

    // Publiczna domena, nie adres wdrożenia `*.vercel.app` (za logowaniem Vercela) — src/lib/internal-fetch.ts.
    const origin = internalOrigin(request);
    const startedAt = Date.now();
    const results: Record<string, number | string> = {};
    let ok = 0;
    for (const ep of endpoints) {
        results[ep] = await internalCall(origin + ep);
        if (results[ep] === 200) ok++;
        await sleep(spacingMs);
    }
    // Ślad przebiegu → /status i /api/health/freshness (dowód, że cron faktycznie działa).
    await recordCronRun(group, summarizeResults(results, startedAt, origin));
    return NextResponse.json({ group, origin, ok, total: endpoints.length, timestamp: new Date().toISOString(), results });
}
