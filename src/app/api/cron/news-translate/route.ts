/**
 * Cron: polskie tytuły i leady dla zagranicznych newsów (ROADMAP N3, spec docs/specs/2026-11-03-newsy-tlumaczenie.md).
 *
 * Trzy wpisy w vercel.json (05:15, 11:15, 19:15 UTC — poza szczytem DeepSeek 01–04 i 06–10 UTC pn–pt): rano
 * noc w USA i Azji, w południe Europa, wieczorem sesja w USA. Osobna grupa zamiast `news-digest`: digest idzie raz
 * na dobę (wieczorne newsy z USA czekałyby do następnego dnia), ma 60 s i własne RSS + makro + model.
 * Tłumaczy tylko pozycje bez wpisu w słowniku (klucz = hash tytułu), więc to samo nie jest tłumaczone dwa razy.
 * Bez DEEPSEEK_API_KEY → `skipped`, przebieg 0/0.
 */
import { NextRequest, NextResponse } from 'next/server';
import { runNewsTranslate } from '@/lib/news/translate-server';
import { recordCronRun } from '@/lib/cron-log';

// ≥ MAX_BATCHES (3) × timeout DeepSeek (30 s) + RSS i Firestore (tests/function-limits.test.ts).
export const maxDuration = 120;

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const started = Date.now();
    const result = await runNewsTranslate();
    await recordCronRun('news-translate', {
        at: new Date().toISOString(),
        // Jednostką jest partia (wywołanie modelu): odrzucona pojedyncza pozycja to nie awaria crona.
        ok: result.batches.ok,
        total: result.status === 'error' && !result.batches.total ? 1 : result.batches.total,
        ms: Date.now() - started,
        failed: result.status === 'error' && result.reason ? [result.reason.slice(0, 120)] : result.failed.slice(0, 10),
        costUsd: result.costUsd,
    });
    return NextResponse.json({ ok: result.status !== 'error', ...result });
}
