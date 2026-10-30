/**
 * Cron: brief dnia (codziennie) i tygodnia (w poniedziałek) z DeepSeek.
 *
 * 05:10 UTC — poza szczytem DeepSeek (01–04 i 06–10 UTC pn–pt, cena ×2); Hobby uruchamia w obrębie
 * godziny, więc 05:00–05:59. Wejście: wczorajszy digest (16:05 UTC) + archiwum newsów zagranicznych.
 * Bez DEEPSEEK_API_KEY każdy brief to `skipped`, przebieg zapisuje się jako ok (0/0).
 */
import { NextRequest, NextResponse } from 'next/server';
import { runBrief, type BriefRunResult } from '@/lib/news/brief-server';
import { recordCronRun } from '@/lib/cron-log';

export const maxDuration = 150;

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const started = Date.now();
    const now = new Date();
    const monday = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short' }).format(now) === 'Mon';
    const results: BriefRunResult[] = [await runBrief('daily', now)];
    if (monday) results.push(await runBrief('weekly', now));

    const attempted = results.filter((r) => r.status !== 'skipped');
    const costUsd = Math.round(results.reduce((s, r) => s + r.costUsd, 0) * 1e6) / 1e6;
    await recordCronRun('brief', {
        at: new Date().toISOString(),
        ok: attempted.filter((r) => r.status === 'ok').length,
        total: attempted.length,
        ms: Date.now() - started,
        failed: attempted.filter((r) => r.status !== 'ok').map((r) => `${r.kind} → ${r.reason ?? r.status}`.slice(0, 120)),
        costUsd,
    });
    return NextResponse.json({ ok: true, costUsd, results });
}
