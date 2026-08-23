// Blok makro „Co się zmieniło w liczbach" — tylko odczyty z datą = dziś (Europe/Warsaw).
// Źródła: cache Firestore (GUS CPI/PPI, NBP, Stooq). Bez sieci w buildDailyDigest — wołane z crona.

import { getAdminDb } from '@/lib/firebase/admin';
import { getServerCache } from '@/lib/server-cache';
import { warsawDateKey } from '@/lib/news/warsaw-date';
import { formatDecimalPL } from '@/lib/formatters';
import type { MacroChange } from '@/lib/news/daily';

interface CacheMeta<T> {
    payload: T;
    updatedAt: number;
}

async function readCacheWithMeta<T>(collection: string, docId: string): Promise<CacheMeta<T> | null> {
    const db = getAdminDb();
    if (db) {
        try {
            const snap = await db.collection(collection).doc(docId).get();
            if (snap.exists) {
                const data = snap.data()!;
                const updatedAt = data.updatedAt?.toMillis?.() ?? data.updatedAt ?? 0;
                return { payload: data.payload as T, updatedAt };
            }
        } catch (err) {
            console.error(`[daily-macro] read ${collection}/${docId}:`, err);
        }
    }
    const payload = await getServerCache<T>(collection, docId, 365 * 24 * 3600 * 1000);
    if (payload == null) return null;
    return { payload, updatedAt: 0 };
}

function fmtDelta(cur: number, prev: number, unit: 'pp' | 'pct' | 'abs'): string {
    const d = cur - prev;
    const sign = d >= 0 ? '+' : '';
    if (unit === 'pp') return `${sign}${d.toFixed(1)} pp`;
    if (unit === 'pct') return `${sign}${d.toFixed(2)}%`;
    return `${sign}${formatDecimalPL(d, unit === 'abs' ? 3 : 2)}`;
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

/** Zwraca wiersze makro opublikowane / odczytane w dniu `date` (Warsaw). */
export async function fetchMacroChangesForDate(date: string = warsawDateKey()): Promise<MacroChange[]> {
    const year = parseInt(date.slice(0, 4), 10);
    const out: MacroChange[] = [];

    // ── CPI (GUS DBW) — tylko gdy cache odświeżony dziś ──
    const cpiMeta = await readCacheWithMeta<CpiCache>('dbw', `gus_cpi_full_${year}_v5`);
    if (cpiMeta && cpiMeta.updatedAt > 0 && warsawDateKey(cpiMeta.updatedAt) === date) {
        const hl = cpiMeta.payload.headline?.filter((h) => h.yoy != null) ?? [];
        const last = hl[hl.length - 1];
        const prev = hl[hl.length - 2];
        if (last?.yoy != null) {
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

    // ── PPI (GUS DBW) ──
    const ppiMeta = await readCacheWithMeta<PpiCache>('dbw', `gus_ppi_full_${year}_v2`);
    if (ppiMeta && ppiMeta.updatedAt > 0 && warsawDateKey(ppiMeta.updatedAt) === date) {
        const hl = ppiMeta.payload.headline?.filter((h) => h.yoy != null) ?? [];
        const last = hl[hl.length - 1];
        const prev = hl[hl.length - 2];
        if (last?.yoy != null) {
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

    // ── NBP EUR / USD — effectiveDate = dziś ──
    const nbpMeta = await readCacheWithMeta<NbpTable[]>('exchange_rates', 'table_a');
    const nbpTable = Array.isArray(nbpMeta?.payload) ? nbpMeta!.payload[0] : nbpMeta?.payload as NbpTable | undefined;
    if (nbpTable?.effectiveDate === date) {
        for (const code of ['EUR', 'USD'] as const) {
            const rate = nbpTable.rates.find((r) => r.code === code);
            if (!rate) continue;
            // Historia dzienna w cache hist_a_eur_2 — opcjonalnie delta; tu sama wartość.
            out.push({
                id: `nbp-${code.toLowerCase()}`,
                label: `${code} / PLN`,
                value: formatDecimalPL(rate.mid, 4),
                unit: 'zł',
                readingDate: date,
                href: '/rynki',
            });
        }
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
        const latest = meta?.payload.latest;
        if (!latest || latest.date !== date) continue;
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

    return out;
}
