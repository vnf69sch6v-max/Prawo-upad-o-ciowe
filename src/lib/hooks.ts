'use client';

import { useQuery } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────

interface NBPRate {
    currency: string;
    code: string;
    mid?: number;
    bid?: number;
    ask?: number;
}

interface NBPTable {
    table: string;
    no: string;
    effectiveDate: string;
    rates: NBPRate[];
}

interface StooqData {
    symbol: string;
    data: { date: string; close: number; volume?: number }[];
    latest: { date: string; close: number; volume?: number } | null;
}

interface GoldPrice {
    data: string;
    cena: number;
}

interface NBPInterestRate {
    name: string;
    nameEn: string;
    value: number;
    validFrom: string;
}

interface WiborRate {
    tenor: string;
    wibor: number;
    wibid: number;
    spread: number;
    date: string;
    source: string;
}

interface GUSIndicator {
    value: number;
    year: number;
    unit: string;
}

// ─── Fetchers ────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
    return res.json();
}

// ─── NBP Exchange Rates ──────────────────────────────────

export function useNBPTable(table: 'a' | 'b' | 'c' = 'a') {
    return useQuery<NBPTable>({
        queryKey: ['nbp', 'table', table],
        queryFn: () => fetchJSON(`/api/nbp?table=${table}`),
        staleTime: 60 * 60 * 1000,     // 1 hour (NBP updates once daily ~12:15)
        refetchInterval: 60 * 60 * 1000,
    });
}

export function useNBPCurrencyHistory(code: string, days = 30) {
    return useQuery<NBPRate[]>({
        queryKey: ['nbp', 'history', code, days],
        queryFn: () => fetchJSON(`/api/nbp?table=a&code=${code}&last=${days}`),
        staleTime: 60 * 60 * 1000,
        enabled: !!code,
    });
}

// ─── NBP Gold ────────────────────────────────────────────

export function useGold(days = 30) {
    return useQuery<GoldPrice[]>({
        queryKey: ['nbp', 'gold', days],
        queryFn: () => fetchJSON(`/api/nbp?gold=true&last=${days}`),
        staleTime: 60 * 60 * 1000,
    });
}

// ─── NBP Interest Rates (XML) ────────────────────────────

export function useNBPInterestRates() {
    return useQuery<{ rates: NBPInterestRate[]; publishDate: string }>({
        queryKey: ['nbp', 'interest-rates'],
        queryFn: () => fetchJSON('/api/nbp-rates'),
        staleTime: 24 * 60 * 60 * 1000, // 24h — changes only when RPP decides
    });
}

// ─── WIBOR (GPW Benchmark) ──────────────────────────────

export function useWibor() {
    return useQuery<{ rates: WiborRate[]; nbpRefRate: number }>({
        queryKey: ['wibor'],
        queryFn: () => fetchJSON('/api/wibor'),
        staleTime: 60 * 60 * 1000, // 1h — changes once daily
    });
}

// ─── Stooq (Stocks, Indices) ─────────────────────────────

export function useStooq(symbol: string, limit = 30) {
    return useQuery<StooqData>({
        queryKey: ['stooq', symbol, limit],
        queryFn: () => fetchJSON(`/api/stooq?symbol=${symbol}&limit=${limit}`),
        staleTime: 30 * 60 * 1000, // 30 min during market hours
        enabled: !!symbol,
    });
}

export function useMultiStooq(symbols: string[], limit = 30) {
    return useQuery<Record<string, StooqData>>({
        queryKey: ['stooq', 'multi', ...symbols, limit],
        queryFn: async () => {
            const results: Record<string, StooqData> = {};
            await Promise.all(
                symbols.map(async (sym) => {
                    try {
                        const data = await fetchJSON<StooqData>(`/api/stooq?symbol=${sym}&limit=${limit}`);
                        results[sym] = data;
                    } catch { /* skip failed */ }
                })
            );
            return results;
        },
        staleTime: 30 * 60 * 1000,
    });
}

// ─── GUS BDL Data ────────────────────────────────────────

export function useGUSData(indicator: string = 'all', years = 3) {
    return useQuery<Record<string, GUSIndicator>>({
        queryKey: ['gus', indicator, years],
        queryFn: () => fetchJSON(`/api/gus?indicator=${indicator}&years=${years}`),
        staleTime: 24 * 60 * 60 * 1000, // 24h — annual data
    });
}

// ─── Composite Dashboard Hook ────────────────────────────

export function useDashboardData() {
    const nbpRates = useNBPTable('a');
    const gold = useGold(30);
    const wig20 = useStooq('wig20', 30);
    const interestRates = useNBPInterestRates();
    const wibor = useWibor();
    const gus = useGUSData('all', 3);

    return {
        nbpRates,
        gold,
        wig20,
        interestRates,
        wibor,
        gus,
        isLoading: nbpRates.isLoading || gold.isLoading || wig20.isLoading,
    };
}

// Re-export types for page components
export type { NBPRate, NBPTable, StooqData, GoldPrice, NBPInterestRate, WiborRate, GUSIndicator };
