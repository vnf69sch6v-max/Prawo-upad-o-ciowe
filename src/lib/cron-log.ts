// Dziennik przebiegów cronów w Firestore (`health/cron_runs`, pole na grupę). Każdy warm cron po
// przebiegu zapisuje wynik; /api/health/freshness i strona /status pokazują, kiedy grupa działała
// ostatnio i z jakim skutkiem. Ocena: src/lib/cron-runs.ts.
// Cały dokument jest szyfrowany jak cache (src/lib/data-seal.ts), więc zapis to odczyt + zmiana + zapis
// w transakcji (dawniej `merge` jednego pola — tego nie da się zrobić na zaszyfrowanej treści).
import { getAdminDb } from '@/lib/firebase/admin';
import type { CronRun } from '@/lib/cron-runs';
import { docLegacy, fromStored, toStored } from '@/lib/data-seal';

const DOC = { collection: 'health', id: 'cron_runs' } as const;
const PATH = `${DOC.collection}/${DOC.id}`;

function runsOf(data: Record<string, unknown> | undefined): Record<string, CronRun> {
    const doc = fromStored<Record<string, unknown>>(PATH, data, docLegacy.read)?.value ?? {};
    const out: Record<string, CronRun> = {};
    for (const [k, v] of Object.entries(doc)) {
        if (v && typeof v === 'object' && typeof (v as CronRun).at === 'string') out[k] = v as CronRun;
    }
    return out;
}

export async function recordCronRun(group: string, run: CronRun): Promise<void> {
    const db = getAdminDb();
    if (!db) return; // tryb demo
    try {
        const ref = db.collection(DOC.collection).doc(DOC.id);
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            const runs = { ...runsOf(snap.exists ? snap.data() : undefined), [group]: run };
            tx.set(ref, toStored(PATH, runs, Date.now(), docLegacy.write));
        });
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
        return snap.exists ? runsOf(snap.data()) : {};
    } catch (err) {
        console.error('[cron-log] read:', err);
        return null;
    }
}

