// Wykonanie kontroli świeżości (I/O) — wspólne dla /api/health/freshness i /api/cron/freshness.
// Reguły i katalog zbiorów są czyste w `freshness.ts`; tu tylko pobranie TYCH SAMYCH endpointów,
// które odpytują strony (fetch do własnego originu, bez `refresh=1`), z timeoutem per sprawdzenie.
// Tu też samonaprawa i alert crona (eksportowane, bo plik `route.ts` w App Routerze nie może
// eksportować nic poza handlerami i konfiguracją).
import {
    datasetById,
    errorItem,
    evaluateDataset,
    formatPeriodPl,
    FRESHNESS_DATASETS,
    isProblem,
    overallStatus,
    pluralPl,
    STATUS_LABELS,
    withRefreshParam,
    type DatasetSpec,
    type FreshnessItem,
    type FreshnessReport,
} from '@/lib/freshness';

// 20 s: w trybie demo (bez Firestore) pełne CPI z DBW składa się ~10 s; na produkcji to odczyt cache.
export const CHECK_TIMEOUT_MS = 20_000;

export type FetchOutcome =
    | { ok: true; status: number; json: unknown; ms: number }
    | { ok: false; status: number | null; error: string; ms: number };

/** GET z timeoutem (AbortController) — nigdy nie rzuca; błąd wraca jako `{ ok: false }`. */
export async function fetchJsonWithTimeout(url: string, timeoutMs = CHECK_TIMEOUT_MS): Promise<FetchOutcome> {
    const started = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal, headers: { Accept: 'application/json' } });
        const ms = Date.now() - started;
        let json: unknown = null;
        try {
            json = await res.json();
        } catch {
            return { ok: false, status: res.status, error: `Odpowiedź HTTP ${res.status} nie jest JSON-em.`, ms };
        }
        if (!res.ok) {
            return { ok: false, status: res.status, error: `Źródło nie odpowiada poprawnie (HTTP ${res.status}).`, ms };
        }
        const apiError = json && typeof json === 'object' && !Array.isArray(json) ? (json as { error?: unknown }).error : undefined;
        if (apiError) {
            return { ok: false, status: res.status, error: `API zwróciło błąd: ${String(apiError).slice(0, 120)}`, ms };
        }
        return { ok: true, status: res.status, json, ms };
    } catch (e) {
        const ms = Date.now() - started;
        const aborted = ctrl.signal.aborted;
        return {
            ok: false,
            status: null,
            error: aborted
                ? `Przekroczony czas odpowiedzi (${Math.round(timeoutMs / 1000)} s).`
                : `Brak połączenia ze źródłem: ${String(e).slice(0, 100)}`,
            ms,
        };
    } finally {
        clearTimeout(timer);
    }
}

/** Ocena jednego zbioru na podstawie już pobranej odpowiedzi. */
export function itemFromOutcome(spec: DatasetSpec, outcome: FetchOutcome, endpoint: string, now: Date): FreshnessItem {
    if (!outcome.ok) return errorItem(spec, now, endpoint, outcome.error, outcome.ms);
    let latest: string | null = null;
    try {
        latest = spec.extract(outcome.json);
    } catch {
        latest = null;
    }
    return { ...evaluateDataset(spec, latest, now), endpoint, durationMs: outcome.ms };
}

/**
 * Sprawdza zbiory równolegle. Ten sam endpoint (np. /api/gus-monthly) pobierany jest raz.
 * Jeden padnięty endpoint daje `error` dla swoich zbiorów i nie przerywa reszty.
 */
export async function runFreshnessCheck(
    origin: string,
    opts: { now?: Date; ids?: string[]; timeoutMs?: number } = {},
): Promise<FreshnessReport> {
    const now = opts.now ?? new Date();
    const specs = opts.ids ? FRESHNESS_DATASETS.filter((d) => opts.ids!.includes(d.id)) : FRESHNESS_DATASETS;
    const endpoints = new Map<string, Promise<FetchOutcome>>();
    for (const spec of specs) {
        const ep = spec.endpoint(now);
        if (!endpoints.has(ep)) endpoints.set(ep, fetchJsonWithTimeout(origin + ep, opts.timeoutMs ?? CHECK_TIMEOUT_MS));
    }
    const items = await Promise.all(
        specs.map(async (spec) => {
            const ep = spec.endpoint(now);
            try {
                return itemFromOutcome(spec, await endpoints.get(ep)!, ep, now);
            } catch (e) {
                return errorItem(spec, now, ep, `Błąd kontroli: ${String(e).slice(0, 100)}`);
            }
        }),
    );
    return { checkedAt: now.toISOString(), overall: overallStatus(items), items };
}

// ─── Samonaprawa (cron) ─────────────────────────────────

const REFRESH_TIMEOUT_MS = 25_000;
/** `withCache` zapisuje do Firestore bez `await` — chwila, zanim ponowna kontrola przeczyta cache. */
const CACHE_SETTLE_MS = 2_000;

export interface HealAttempt {
    endpoint: string;
    ids: string[];
    httpStatus: number | null;
    /** Najnowszy okres w odpowiedzi z `refresh=1` (prosto od źródła). */
    sourceLatest: string | null;
    error?: string;
}

/**
 * Zbiory `stale`/`error` z `selfHeal` (NBP, Yahoo, Eurostat — nigdy GUS DBW/BDL) woła z `?refresh=1`,
 * czeka na zapis cache i sprawdza ponownie TYM SAMYM endpointem, który czyta strona.
 */
export async function selfHeal(
    origin: string,
    report: FreshnessReport,
    opts: { settleMs?: number } = {},
): Promise<{ report: FreshnessReport; attempts: HealAttempt[] }> {
    const targets = report.items.filter((i) => isProblem(i.status) && datasetById(i.id)?.selfHeal);
    if (!targets.length) return { report, attempts: [] };

    const byEndpoint = new Map<string, string[]>();
    for (const t of targets) byEndpoint.set(t.endpoint, [...(byEndpoint.get(t.endpoint) ?? []), t.id]);

    const attempts = await Promise.all(
        [...byEndpoint].map(async ([endpoint, ids]): Promise<HealAttempt> => {
            const r = await fetchJsonWithTimeout(origin + withRefreshParam(endpoint), REFRESH_TIMEOUT_MS);
            if (!r.ok) return { endpoint, ids, httpStatus: r.status, sourceLatest: null, error: r.error };
            let sourceLatest: string | null = null;
            try { sourceLatest = datasetById(ids[0])?.extract(r.json) ?? null; } catch { /* zostaje null */ }
            return { endpoint, ids, httpStatus: r.status, sourceLatest };
        }),
    );

    await new Promise((r) => setTimeout(r, opts.settleMs ?? CACHE_SETTLE_MS));
    const recheck = await runFreshnessCheck(origin, { ids: targets.map((t) => t.id) });
    const after = new Map(recheck.items.map((i) => [i.id, i]));

    const items = report.items.map((before): FreshnessItem => {
        const cur = after.get(before.id);
        if (!cur) return before;
        const attempt = attempts.find((a) => a.ids.includes(before.id));
        let note: string;
        if (!isProblem(cur.status)) {
            note = `Naprawione automatycznie (refresh=1), wcześniej: ${STATUS_LABELS[before.status].toLowerCase()}.${cur.note ? ` ${cur.note}` : ''}`;
        } else if (attempt?.sourceLatest && (!cur.latest || attempt.sourceLatest > cur.latest)) {
            note = `${cur.note} Źródło ma już ${formatPeriodPl(attempt.sourceLatest)}, ale cache nadal podaje ${formatPeriodPl(cur.latest)}.`;
        } else if (attempt?.error) {
            note = `${cur.note} Samonaprawa (refresh=1) też się nie powiodła${attempt.httpStatus ? ` (HTTP ${attempt.httpStatus})` : ''}.`;
        } else {
            note = `${cur.note} Samonaprawa (refresh=1) nie pomogła — źródło nie ma nowszych danych.`;
        }
        return { ...cur, note };
    });

    return { report: { checkedAt: recheck.checkedAt, overall: overallStatus(items), items }, attempts };
}

// ─── Alert (cron) ───────────────────────────────────────

export function buildAlertText(origin: string, report: FreshnessReport): string | null {
    const problems = report.items.filter((i) => isProblem(i.status));
    if (!problems.length) return null;
    const n = problems.length;
    const lines = problems.map((i) => {
        const period = i.latest
            ? `najnowsze ${formatPeriodPl(i.latest)}, oczekiwane ${formatPeriodPl(i.expected)}`
            : `oczekiwane ${formatPeriodPl(i.expected)}`;
        return `• ${i.label} (${i.source}): ${STATUS_LABELS[i.status]} — ${period}. ${i.note}`.trim();
    });
    return [`Savori — stan danych: problem z ${n} ${pluralPl(n, 'zbiorem', 'zbiorami', 'zbiorami')} (po samonaprawie)`, ...lines, `${origin}/status`]
        .join('\n')
        .slice(0, 1900); // limit treści Discorda: 2000 znaków
}

/** POST { text } na webhook (Slack; Discord przez `…/slack` albo natywnie przez `content`). Tylko gdy są problemy. */
export async function sendFreshnessAlert(webhookUrl: string | undefined, origin: string, report: FreshnessReport): Promise<boolean> {
    const text = buildAlertText(origin, report);
    if (!webhookUrl || !text) return false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, content: text }),
            cache: 'no-store',
            signal: ctrl.signal,
        });
        return res.ok;
    } catch (err) {
        console.error('[freshness] webhook:', err);
        return false;
    } finally {
        clearTimeout(timer);
    }
}
