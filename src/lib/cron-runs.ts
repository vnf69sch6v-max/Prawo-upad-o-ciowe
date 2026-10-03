// Ocena przebiegów cronów (czysta, bez I/O) — `now` z zewnątrz, więc testowalna.
// Zapis/odczyt w Firestore: src/lib/cron-log.ts. Pokazywane na /status i w /api/health/freshness:
// dowód, że dane odświeżają się SAME, a nie tylko „powinny".

export interface CronRun {
    /** ISO — koniec przebiegu. */
    at: string;
    ok: number;
    total: number;
    ms: number;
    /** „endpoint → status" dla nieudanych wywołań (maks. 10). */
    failed: string[];
}

export type CronRunStatus = 'ok' | 'late' | 'failing' | 'never';

export interface CronRunReport {
    group: string;
    label: string;
    schedule: string;
    status: CronRunStatus;
    run: CronRun | null;
    ageHours: number | null;
}

interface CronSpec { label: string; schedule: string; maxAgeHours: number }

/** Grupy z vercel.json. `maxAgeHours`: dzienne 26 h; tylko w dni robocze 74 h (przez weekend). */
export const CRON_SPECS: Record<string, CronSpec> = {
    'dbw-1': { label: 'GUS — inflacja CPI', schedule: 'codziennie 09:40 UTC', maxAgeHours: 26 },
    'dbw-4': { label: 'GUS — produkcja, budownictwo, sprzedaż', schedule: 'codziennie 11:40 UTC', maxAgeHours: 26 },
    'dbw-2': { label: 'GUS — ceny producentów i budowlane', schedule: 'codziennie 13:40 UTC', maxAgeHours: 26 },
    'dbw-3': { label: 'GUS — koniunktura, ceny rolne', schedule: 'codziennie 15:40 UTC', maxAgeHours: 26 },
    bdl: { label: 'GUS BDL — rynek pracy, płace, regiony', schedule: 'codziennie 05:00 UTC', maxAgeHours: 26 },
    refresh: { label: 'Eurostat, NBP, giełda, newsy', schedule: 'codziennie 06:00 UTC', maxAgeHours: 26 },
    nbp: { label: 'NBP — kursy i złoto', schedule: 'pn–pt 13:00 UTC', maxAgeHours: 74 },
    rynki: { label: 'Giełda — kursy zamknięcia', schedule: 'pn–pt 16:20 UTC', maxAgeHours: 74 },
    'rynki-intraday': { label: 'Giełda — w trakcie sesji', schedule: 'pn–pt 14:00 UTC', maxAgeHours: 74 },
    'news-archive': { label: 'Archiwum newsów', schedule: 'codziennie 20:00 UTC', maxAgeHours: 26 },
    freshness: { label: 'Kontrola świeżości', schedule: 'codziennie 16:40 UTC', maxAgeHours: 26 },
};

export function evaluateCronRuns(runs: Record<string, CronRun>, now: Date): CronRunReport[] {
    return Object.entries(CRON_SPECS).map(([group, spec]) => {
        const run = runs[group] ?? null;
        if (!run) return { group, label: spec.label, schedule: spec.schedule, status: 'never', run: null, ageHours: null };
        const ageHours = Math.max(0, (now.getTime() - new Date(run.at).getTime()) / 3_600_000);
        let status: CronRunStatus = 'ok';
        if (ageHours > spec.maxAgeHours) status = 'late';
        else if (run.total > 0 && run.ok < run.total / 2) status = 'failing';
        return { group, label: spec.label, schedule: spec.schedule, status, run, ageHours: Math.round(ageHours * 10) / 10 };
    });
}

/** Skrót wyników `warmEndpoints`/crona do zapisu. */
export function summarizeResults(results: Record<string, number | string>, startedAt: number): CronRun {
    const entries = Object.entries(results);
    const failed = entries.filter(([, s]) => s !== 200).map(([ep, s]) => `${ep.split('?')[0]}${ep.includes('?') ? '?…' : ''} → ${s}`);
    return {
        at: new Date().toISOString(),
        ok: entries.length - failed.length,
        total: entries.length,
        ms: Date.now() - startedAt,
        failed: failed.slice(0, 10),
    };
}
