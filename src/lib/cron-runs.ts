// Ocena przebiegów cronów (czysta, bez I/O) — `now` z zewnątrz, więc testowalna.
// Zapis/odczyt w Firestore: src/lib/cron-log.ts. Pokazywane na /status i w /api/health/freshness:
// dowód, że dane odświeżają się SAME, a nie tylko „powinny".
import { pluralPl } from '@/lib/freshness';

export interface CronRun {
    /** ISO — koniec przebiegu. */
    at: string;
    ok: number;
    total: number;
    ms: number;
    /** „endpoint → status" dla nieudanych wywołań (maks. 10). */
    failed: string[];
    /** Host, pod który cron wołał własne endpointy (diagnostyka: adres wdrożenia za logowaniem = 0 odświeżeń). */
    origin?: string;
    /** Czas każdego wywołania w kolejności listy crona (bez `refresh=1`, maks. 30) — podstawa limitów `maxDuration`. */
    routes?: { ep: string; ms: number }[];
    /** Koszt wywołań modelu w USD (cron `brief`). */
    costUsd?: number;
}

/** `partial` = część tras padła (dawniej „Działa” aż do połowy porażek — `dbw-1` z 504 na CPI był zielony). */
export type CronRunStatus = 'ok' | 'partial' | 'late' | 'failing' | 'never';

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
    brief: { label: 'Brief dnia (DeepSeek)', schedule: 'codziennie 17:20 UTC', maxAgeHours: 26 },
    jp: { label: 'Japonia — wszystkie wskaźniki', schedule: 'codziennie 00:30 UTC (9:30 JST)', maxAgeHours: 26 },
};

export function evaluateCronRuns(runs: Record<string, CronRun>, now: Date): CronRunReport[] {
    return Object.entries(CRON_SPECS).map(([group, spec]) => {
        const run = runs[group] ?? null;
        if (!run) return { group, label: spec.label, schedule: spec.schedule, status: 'never', run: null, ageHours: null };
        const ageHours = Math.max(0, (now.getTime() - new Date(run.at).getTime()) / 3_600_000);
        let status: CronRunStatus = 'ok';
        if (ageHours > spec.maxAgeHours) status = 'late';
        else if (run.total > 0 && run.ok < run.total / 2) status = 'failing';
        else if (run.ok < run.total) status = 'partial';
        return { group, label: spec.label, schedule: spec.schedule, status, run, ageHours: Math.round(ageHours * 10) / 10 };
    });
}

const MAX_ROUTES = 30;

/** Ścieżka do dziennika: bez `refresh=1` (każdy cron go wysyła), reszta parametrów zostaje (`bdl-series` × 5). */
function withoutRefresh(ep: string): string {
    const [path, query] = ep.split('?');
    if (!query) return path;
    const qs = new URLSearchParams(query);
    qs.delete('refresh');
    const rest = qs.toString();
    return rest ? `${path}?${rest}` : path;
}

/** Skrót wyników `warmEndpoints`/crona do zapisu. Sukces = dokładnie 200 (patrz `internalCall`). */
export function summarizeResults(
    results: Record<string, number | string>,
    startedAt: number,
    origin?: string,
    routes?: { ep: string; ms: number }[],
): CronRun {
    const entries = Object.entries(results);
    const failed = entries.filter(([, s]) => s !== 200).map(([ep, s]) => `${ep.split('?')[0]}${ep.includes('?') ? '?…' : ''} → ${s}`);
    return {
        at: new Date().toISOString(),
        ok: entries.length - failed.length,
        total: entries.length,
        ms: Date.now() - startedAt,
        failed: failed.slice(0, 10),
        ...(origin ? { origin: origin.replace(/^https?:\/\//, '') } : {}),
        ...(routes ? { routes: routes.slice(0, MAX_ROUTES).map((r) => ({ ep: withoutRefresh(r.ep), ms: r.ms })) } : {}),
    };
}

/** `crons` w `/api/health/freshness`. `attention` nie zmienia kodu HTTP — ten zależy tylko od zbiorów. */
export interface CronRunsSummary {
    available: boolean;
    items: CronRunReport[];
    attention: string[];
}

/** Grupy wymagające uwagi: częściowe i całkowite awarie oraz spóźnienia. `never` czeka na 1. przebieg — nie alarm. */
export function cronAttention(items: CronRunReport[]): string[] {
    return items.filter((c) => c.status === 'partial' || c.status === 'failing' || c.status === 'late').map((c) => c.group);
}

/** „Automat: 1 z 12 cronów wymaga uwagi — GUS — inflacja CPI”; `null`, gdy wszystko w porządku. */
export function attentionLine(items: CronRunReport[]): string | null {
    const groups = new Set(cronAttention(items));
    const flagged = items.filter((c) => groups.has(c.group));
    if (flagged.length === 0) return null;
    const n = flagged.length;
    const names = flagged.slice(0, 2).map((c) => c.label).join(', ');
    const rest = n - 2;
    const more = rest > 0 ? ` i ${rest} ${pluralPl(rest, 'inny', 'inne', 'innych')}` : '';
    return `Automat: ${n} z ${items.length} cronów ${pluralPl(n, 'wymaga', 'wymagają', 'wymaga')} uwagi — ${names}${more}`;
}

/** 24 900 ms → „24,9 s”. */
export function formatSeconds(ms: number): string {
    return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

/** Najdłuższa trasa przebiegu (kandydat do limitu czasu) albo `null` dla starych wpisów bez `routes`. */
export function slowestRoute(run: CronRun | null): { ep: string; ms: number } | null {
    if (!run?.routes?.length) return null;
    return run.routes.reduce((a, b) => (b.ms > a.ms ? b : a));
}
