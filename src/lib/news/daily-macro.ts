// Blok makro „Co się zmieniło w liczbach" — tylko odczyty z datą = dziś (Europe/Warsaw).
// Źródła: cache Firestore (GUS CPI/PPI, NBP, Stooq). Bez hammerowania DBW.
// W weekend / bez publikacji GUS pusta lista jest oczekiwana (spec: data odczytu = dzisiaj).

import { generateMacroCalendar } from '@/lib/calendar';
import { formatDecimalPL } from '@/lib/formatters';
import { getAdminDb } from '@/lib/firebase/admin';
import type { MacroChange } from '@/lib/news/daily';
import { warsawDateKey } from '@/lib/news/warsaw-date';
import { getServerCache } from '@/lib/server-cache';

interface CacheMeta<T> {
    payload: T;
    updatedAt: number;
}

export interface MacroFetchDiagnostics {
    date: string;
    weekday: boolean;
    included: string[];
    skipped: { id: string; reason: string }[];
    /** Krótki powód pustej listy — do logów / odpowiedzi crona. */
    emptyReason: string | null;
}

export interface MacroFetchResult {
    changes: MacroChange[];
    diagnostics: MacroFetchDiagnostics;
}

async function readCacheWithMeta<T>(collection: string, docId: string): Promise<CacheMeta<T> | null> {
    const db = getAdminDb();
    if (db) {
        try {
            const snap = await db.collection(collection).doc(docId).get();
            if (snap.exists) {
                const data = snap.data()!;
                const updatedAt = data.updatedAt?.toMillis?.() ?? data.updatedAt ?? 0;
                return { payload: data.payload as T, updatedAt: typeof updatedAt === 'number' ? updatedAt : 0 };
            }
        } catch (err) {
            console.error(`[daily-macro] read ${collection}/${docId}:`, err);
        }
    }
    // Fallback bez meta — CPI/PPI wymagają updatedAt; rynki i tak filtrują po dacie odczytu w payloadzie.
    const payload = await getServerCache<T>(collection, docId, 365 * 24 * 3600 * 1000);
    if (payload == null) return null;
    return { payload, updatedAt: 0 };
}

/** Delta: `pp` = punkty procentowe, `pct` = zmiana względna w %, `abs` = różnica absolutna. */
export function fmtDelta(cur: number, prev: number, unit: 'pp' | 'pct' | 'abs'): string {
    if (unit === 'pct') {
        if (prev === 0) return '—';
        const d = ((cur - prev) / prev) * 100;
        const sign = d >= 0 ? '+' : '';
        return `${sign}${d.toFixed(2)}%`;
    }
    const d = cur - prev;
    const sign = d >= 0 ? '+' : '';
    if (unit === 'pp') return `${sign}${d.toFixed(1)} pp`;
    return `${sign}${formatDecimalPL(d, 3)}`;
}

interface CpiCache {
    headline: { date: string; yoy: number | null; mom: number | null }[];
    dataDate: string;
}

interface PpiCache {
    headline: { date: string; yoy: number | null; mom: number | null }[];
    dataDate: string;
}

interface NbpTable {
    effectiveDate: string;
    rates: { code: string; mid: number }[];
}

interface NbpHistPoint {
    effectiveDate: string;
    mid: number;
}

interface StooqCache {
    symbol: string;
    data: { date: string; close: number }[];
    latest: { date: string; close: number } | null;
}

function lastTwo<T extends { close?: number; mid?: number; yoy?: number | null }>(
    series: T[],
    key: 'close' | 'mid' | 'yoy',
): [number, number] | null {
    const vals = series
        .map((p) => p[key])
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
    if (vals.length < 2) return null;
    return [vals[vals.length - 1], vals[vals.length - 2]];
}

/** Normalizuj YYYY-MM-DD z cache (Stooq/Yahoo czasem daje ISO) do daty kalendarzowej Warsaw. */
export function readingDateKey(raw: string | undefined | null): string | null {
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const t = Date.parse(raw);
    if (Number.isNaN(t)) return null;
    return warsawDateKey(t);
}

function isWarsawWeekday(yyyyMmDd: string): boolean {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    // Południe UTC → ten sam dzień kalendarzowy w Warsaw (CET/CEST).
    const dow = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
    return dow !== 0 && dow !== 6;
}

function pushSkip(
    skipped: MacroFetchDiagnostics['skipped'],
    id: string,
    reason: string,
): void {
    skipped.push({ id, reason });
}

/**
 * Zwraca wiersze makro opublikowane / odczytane w dniu `date` (Warsaw).
 * Pusty wynik w weekend bez sesji GPW / bez tabeli NBP / bez publikacji GUS jest zgodny ze spec.
 */
export async function fetchMacroChangesForDate(
    date: string = warsawDateKey(),
): Promise<MacroChange[]> {
    const { changes } = await fetchMacroChangesWithDiagnostics(date);
    return changes;
}

export async function fetchMacroChangesWithDiagnostics(
    date: string = warsawDateKey(),
): Promise<MacroFetchResult> {
    const year = parseInt(date.slice(0, 4), 10);
    const out: MacroChange[] = [];
    const skipped: MacroFetchDiagnostics['skipped'] = [];
    const weekday = isWarsawWeekday(date);

    // ── CPI (GUS) — dzień publikacji z kalendarza + okres w cache (bez refresh DBW) ──
    const calendar = [...generateMacroCalendar(year - 1), ...generateMacroCalendar(year), ...generateMacroCalendar(year + 1)];
    const cpiEventsToday = calendar.filter((e) => e.type === 'cpi' && e.date === date);
    const cpiMeta = await readCacheWithMeta<CpiCache>('dbw', `gus_cpi_full_${year}_v5`);
    if (cpiEventsToday.length === 0) {
        pushSkip(skipped, 'cpi-yoy', 'brak publikacji CPI w kalendarzu na ten dzień');
    } else if (!cpiMeta?.payload?.headline?.length) {
        pushSkip(skipped, 'cpi-yoy', 'brak cache gus-cpi-full');
    } else {
        const periods = new Set(cpiEventsToday.map((e) => e.dataPeriod).filter(Boolean) as string[]);
        const hl = cpiMeta.payload.headline.filter((h) => h.yoy != null);
        const last = hl[hl.length - 1];
        const prev = hl[hl.length - 2];
        const periodOk = last && (periods.has(last.date) || periods.has(cpiMeta.payload.dataDate));
        if (!periodOk) {
            pushSkip(
                skipped,
                'cpi-yoy',
                `cache ma okres ${last?.date ?? cpiMeta.payload.dataDate ?? '—'}, oczekiwano ${[...periods].join('|')}`,
            );
        } else if (last?.yoy != null) {
            out.push({
                id: 'cpi-yoy',
                label: 'Inflacja CPI (r/r)',
                value: `${formatDecimalPL(last.yoy, 1)}%`,
                delta: prev?.yoy != null ? fmtDelta(last.yoy, prev.yoy, 'pp') : undefined,
                unit: '%',
                readingDate: date,
                href: '/ceny?tab=inflacja',
            });
        }
    }

    // ── PPI — ten sam dzień co publikacja CPI (często razem) LUB cache odświeżony dziś z nowym okresem ──
    // Bez osobnego wpisu PPI w kalendarzu: tylko gdy jest event CPI dziś i PPI ma ten sam dataDate.
    const ppiMeta = await readCacheWithMeta<PpiCache>('dbw', `gus_ppi_full_${year}_v2`);
    if (cpiEventsToday.length === 0) {
        pushSkip(skipped, 'ppi-yoy', 'brak dnia publikacji CPI (proxy dla PPI)');
    } else if (!ppiMeta?.payload?.headline?.length) {
        pushSkip(skipped, 'ppi-yoy', 'brak cache gus-ppi-full');
    } else {
        const periods = new Set(cpiEventsToday.map((e) => e.dataPeriod).filter(Boolean) as string[]);
        const hl = ppiMeta.payload.headline.filter((h) => h.yoy != null);
        const last = hl[hl.length - 1];
        const prev = hl[hl.length - 2];
        const periodOk = last && (periods.has(last.date) || periods.has(ppiMeta.payload.dataDate));
        if (!periodOk) {
            pushSkip(
                skipped,
                'ppi-yoy',
                `cache ma okres ${last?.date ?? ppiMeta.payload.dataDate ?? '—'}, oczekiwano ${[...periods].join('|')}`,
            );
        } else if (last?.yoy != null) {
            out.push({
                id: 'ppi-yoy',
                label: 'Ceny producenta PPI (r/r)',
                value: `${formatDecimalPL(last.yoy, 1)}%`,
                delta: prev?.yoy != null ? fmtDelta(last.yoy, prev.yoy, 'pp') : undefined,
                unit: '%',
                readingDate: date,
                href: '/ceny?tab=ppi',
            });
        }
    }

    // ── NBP EUR / USD — effectiveDate = dziś (tabela A albo hist) ──
    const nbpMeta = await readCacheWithMeta<NbpTable[]>('exchange_rates', 'table_a');
    const nbpTable = Array.isArray(nbpMeta?.payload) ? nbpMeta!.payload[0] : (nbpMeta?.payload as NbpTable | undefined);
    const tableDate = readingDateKey(nbpTable?.effectiveDate);

    for (const code of ['EUR', 'USD'] as const) {
        const id = `nbp-${code.toLowerCase()}`;
        const histMeta = await readCacheWithMeta<NbpHistPoint[]>(
            'exchange_rates',
            `hist_a_${code.toLowerCase()}_30`,
        );
        const hist = Array.isArray(histMeta?.payload) ? histMeta!.payload : [];
        const histLast = hist[hist.length - 1];
        const histDate = readingDateKey(histLast?.effectiveDate);

        let mid: number | undefined;
        let reading: string | undefined;
        let prevMid: number | undefined;

        if (tableDate === date && nbpTable) {
            mid = nbpTable.rates.find((r) => r.code === code)?.mid;
            reading = date;
            if (hist.length >= 2 && histDate === date) prevMid = hist[hist.length - 2]?.mid;
            else if (hist.length >= 1 && histDate !== date) prevMid = histLast?.mid;
        } else if (histDate === date && histLast) {
            mid = histLast.mid;
            reading = date;
            prevMid = hist.length >= 2 ? hist[hist.length - 2]?.mid : undefined;
        }

        if (mid == null || !reading) {
            pushSkip(
                skipped,
                id,
                `brak kursu na ${date} (table=${tableDate ?? 'brak'}, hist=${histDate ?? 'brak'})${weekday ? '' : ' — weekend/święto NBP'}`,
            );
            continue;
        }
        out.push({
            id,
            label: `${code} / PLN`,
            value: formatDecimalPL(mid, 4),
            delta: prevMid != null ? fmtDelta(mid, prevMid, 'pct') : undefined,
            unit: 'zł',
            readingDate: reading,
            href: '/rynki',
        });
    }

    // ── Indeksy GPW + rentowność 10Y (Stooq) — ostatnia sesja = dziś ──
    const indices: { symbol: string; id: string; label: string; href: string; unit: string }[] = [
        { symbol: 'wig20', id: 'wig20', label: 'WIG20', href: '/rynki', unit: 'pkt' },
        { symbol: 'mwig40', id: 'mwig40', label: 'mWIG40', href: '/rynki', unit: 'pkt' },
        { symbol: 'swig80', id: 'swig80', label: 'sWIG80', href: '/rynki', unit: 'pkt' },
        { symbol: '10ypl.b', id: 'yield-10y', label: 'Rentowność 10Y', href: '/gospodarka?tab=finanse', unit: '%' },
    ];

    for (const idx of indices) {
        const limit = idx.symbol === '10ypl.b' ? 30 : 60;
        const meta = await readCacheWithMeta<StooqCache>('market_data', `stooq_${idx.symbol}_${limit}`);
        const latest = meta?.payload?.latest;
        const latestDate = readingDateKey(latest?.date);
        if (!latest || latestDate !== date) {
            // Eurostat bond (miesięczny) — tylko gdy data odczytu/aktualizacji = dziś (rzadkie).
            if (idx.symbol === '10ypl.b') {
                const eu = await readCacheWithMeta<{
                    data?: { PL?: { date: string; value: number }[] };
                    updated?: string;
                }>('eurostat', 'bond_yield_10y_PL_2018-01');
                const series = eu?.payload?.data?.PL ?? [];
                const last = series[series.length - 1];
                const updatedDay = eu?.updatedAt ? warsawDateKey(eu.updatedAt) : readingDateKey(eu?.payload?.updated ?? null);
                if (last && updatedDay === date) {
                    const prev = series[series.length - 2];
                    out.push({
                        id: idx.id,
                        label: idx.label,
                        value: formatDecimalPL(last.value, 2),
                        delta: prev ? fmtDelta(last.value, prev.value, 'pp') : undefined,
                        unit: idx.unit,
                        readingDate: date,
                        href: idx.href,
                    });
                    continue;
                }
                pushSkip(
                    skipped,
                    idx.id,
                    `stooq latest=${latestDate ?? 'brak'}; eurostat updated=${updatedDay ?? 'brak'}`,
                );
                continue;
            }
            pushSkip(
                skipped,
                idx.id,
                `ostatnia sesja ${latestDate ?? 'brak'} ≠ ${date}${weekday ? '' : ' — brak sesji GPW w weekend'}`,
            );
            continue;
        }
        const pair = lastTwo(meta!.payload.data, 'close');
        const delta = pair ? fmtDelta(pair[0], pair[1], idx.symbol === '10ypl.b' ? 'pp' : 'pct') : undefined;
        out.push({
            id: idx.id,
            label: idx.label,
            value: idx.symbol === '10ypl.b'
                ? formatDecimalPL(latest.close, 2)
                : formatDecimalPL(latest.close, 0),
            delta,
            unit: idx.unit,
            readingDate: date,
            href: idx.href,
        });
    }

    const included = out.map((r) => r.id);
    let emptyReason: string | null = null;
    if (out.length === 0) {
        if (!weekday) {
            emptyReason =
                'Weekend (Europe/Warsaw): brak sesji GPW i tabeli NBP; CPI/PPI tylko w dni publikacji GUS — puste dane zgodne ze spec (data odczytu = dzisiaj).';
        } else {
            emptyReason =
                'Brak odczytów z datą = dziś: sprawdź cache NBP/Stooq (cron przed digestem) oraz kalendarz GUS. ' +
                skipped.map((s) => `${s.id}: ${s.reason}`).join('; ');
        }
        console.info(`[daily-macro] empty date=${date} weekday=${weekday} — ${emptyReason}`);
        for (const s of skipped) {
            console.info(`[daily-macro] skip ${s.id}: ${s.reason}`);
        }
    } else {
        console.info(`[daily-macro] date=${date} included=${included.join(',')}`);
    }

    return {
        changes: out,
        diagnostics: { date, weekday, included, skipped, emptyReason },
    };
}
