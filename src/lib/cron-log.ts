// Dziennik przebiegów cronów w Firestore (`health/cron_runs`, pole na grupę). Każdy warm cron po
// przebiegu zapisuje wynik; /api/health/freshness i strona /status pokazują, kiedy grupa działała
// ostatnio i z jakim skutkiem. Ocena: src/lib/cron-runs.ts.
import { getAdminDb } from '@/lib/firebase/admin';
import type { CronRun } from '@/lib/cron-runs';

const DOC = { collection: 'health', id: 'cron_runs' } as const;

export async function recordCronRun(group: string, run: CronRun): Promise<void> {
    const db = getAdminDb();
    if (!db) return; // tryb demo
    try {
        await db.collection(DOC.collection).doc(DOC.id).set({ [group]: run, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
        console.error(`[cron-log] ${group}:`, err);
    }
}

/** `null` = brak Firestore (tryb demo) albo błąd odczytu — wtedy nie ma czego pokazać. */
export async function readCronRuns(): Promise<Record<string, CronRun> | null> {
    const db = getAdminDb();
    if (!db) return null;
    try {
        const snap = await db.collection(DOC.collection).doc(DOC.id).get();
        if (!snap.exists) return {};
        const data = snap.data() ?? {};
        const out: Record<string, CronRun> = {};
        for (const [k, v] of Object.entries(data)) {
            if (v && typeof v === 'object' && typeof (v as CronRun).at === 'string') out[k] = v as CronRun;
        }
        return out;
    } catch (err) {
        console.error('[cron-log] read:', err);
        return null;
    }
}

