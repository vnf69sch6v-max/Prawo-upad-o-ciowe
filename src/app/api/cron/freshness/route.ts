// Dzienna kontrola świeżości (vercel.json: 16:40 UTC — po cronach GUS 09:40–15:40, NBP 13:00 i giełdy 16:20).
//  1. Sprawdza wszystkie zbiory jak /api/health/freshness.
//  2. Samonaprawa: zbiory `stale`/`error` spoza GUS (NBP, Yahoo, Eurostat) woła z `?refresh=1`
//     i sprawdza ponownie. GUS DBW/BDL NIGDY z refresh — wspólny limit ~100 żądań/15 min, mają własne crony.
//  3. Zapisuje wynik do Firestore (`health/freshness_latest` + historia `health/freshness_history`),
//     jeśli Firebase jest skonfigurowany (w trybie demo pomija).
//  4. Gdy po samonaprawie coś nadal jest `stale`/`error` i jest `ALERT_WEBHOOK_URL` → POST { text } (Slack/Discord).
// Vercel dołącza `Authorization: Bearer ${CRON_SECRET}` automatycznie, gdy CRON_SECRET jest ustawiony.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import type { FreshnessReport } from '@/lib/freshness';
import { runFreshnessCheck, selfHeal, sendFreshnessAlert, type HealAttempt } from '@/lib/freshness-check';
import { recordCronRun } from '@/lib/cron-log';

export const maxDuration = 120;

const HISTORY_LIMIT = 30;

/** Firestore nie przyjmuje `undefined` — JSON round-trip je usuwa. */
function plain<T>(v: T): T {
    return JSON.parse(JSON.stringify(v)) as T;
}

async function persist(report: FreshnessReport, attempts: HealAttempt[]): Promise<boolean> {
    const db = getAdminDb();
    if (!db) return false; // tryb demo — brak Firestore
    try {
        const col = db.collection('health');
        await col.doc('freshness_latest').set(plain({ ...report, selfHeal: attempts, updatedAt: Date.now() }));
        const histRef = col.doc('freshness_history');
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(histRef);
            const runs = ((snap.exists ? snap.data()?.runs : null) ?? []) as unknown[];
            const entry = {
                checkedAt: report.checkedAt,
                overall: report.overall,
                problems: report.items
                    .filter((i) => i.status !== 'ok')
                    .map((i) => ({ id: i.id, status: i.status, latest: i.latest, expected: i.expected })),
                healed: attempts.map((a) => a.endpoint),
            };
            tx.set(histRef, plain({ runs: [entry, ...runs].slice(0, HISTORY_LIMIT), updatedAt: Date.now() }));
        });
        return true;
    } catch (err) {
        console.error('[cron/freshness] Firestore:', err);
        return false;
    }
}

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    const startedAt = Date.now();
    const initial = await runFreshnessCheck(origin);
    const { report, attempts } = await selfHeal(origin, initial);
    const [persisted, alerted] = await Promise.all([
        persist(report, attempts),
        sendFreshnessAlert(process.env.ALERT_WEBHOOK_URL, origin, report),
    ]);

    const problems = report.items.filter((i) => i.status === 'stale' || i.status === 'error');
    await recordCronRun('freshness', {
        at: new Date().toISOString(),
        ok: report.items.length - problems.length,
        total: report.items.length,
        ms: Date.now() - startedAt,
        failed: problems.map((i) => `${i.id} → ${i.status}`).slice(0, 10),
    });

    return NextResponse.json({
        ...report,
        initialOverall: initial.overall,
        selfHeal: attempts,
        persisted,
        alerted,
    });
}
