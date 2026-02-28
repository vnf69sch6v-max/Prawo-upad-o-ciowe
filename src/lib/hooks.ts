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

// ─── Eurostat (Monthly/Quarterly Data) ───────────────────

interface EurostatTimeSeries {
    date: string;
    value: number | null;
}

interface EurostatResult {
    dataset: string;
    label: string;
    geo: string[];
    updated: string;
    data: Record<string, EurostatTimeSeries[]>;
    source: string;
    indicator?: string;
    indicatorLabel?: string;
}

export function useEurostat(indicator: string, geo = 'PL') {
    return useQuery<EurostatResult>({
        queryKey: ['eurostat', indicator, geo],
        queryFn: () => fetchJSON(`/api/eurostat?indicator=${indicator}&geo=${geo}`),
        staleTime: 12 * 60 * 60 * 1000, // 12h — Eurostat updates monthly
    });
}

// Convenience hooks for specific indicators
export function useInflationMonthly(geo = 'PL') {
    return useEurostat('cpi', geo);
}

export function useUnemploymentMonthly(geo = 'PL') {
    return useEurostat('unemployment', geo);
}

export function useGDPQuarterly(geo = 'PL') {
    return useEurostat('gdp_yoy', geo);
}

export function useGDPQoQ(geo = 'PL') {
    return useEurostat('gdp_qoq', geo);
}

export function useIndustrialProduction(geo = 'PL') {
    return useEurostat('industrial', geo);
}

export function useRetailSales(geo = 'PL') {
    return useEurostat('retail', geo);
}

export function useTradeData(flow: 'exports' | 'imports') {
    return useEurostat(flow, 'PL');
}

export function useCurrentAccount() {
    return useEurostat('current_account', 'PL');
}

// PL vs EU comparison — fetches both geos at once
export function usePLvsEU(indicator: string) {
    return useEurostat(indicator, 'PL,EU27_2020');
}

// ─── Bond Yield Curve (Stooq Live) ──────────────────────

export function useYieldCurve() {
    const y2 = useStooq('2ypl.b', 30);
    const y5 = useStooq('5ypl.b', 30);
    const y10 = useStooq('10ypl.b', 30);

    return {
        y2, y5, y10,
        isLoading: y2.isLoading || y5.isLoading || y10.isLoading,
        curve: [
            { tenor: '2Y', yield: y2.data?.latest?.close ?? null, history: y2.data?.data },
            { tenor: '5Y', yield: y5.data?.latest?.close ?? null, history: y5.data?.data },
            { tenor: '10Y', yield: y10.data?.latest?.close ?? null, history: y10.data?.data },
        ],
    };
}

// ─── Composite Dashboard Hook ────────────────────────────

export function useDashboardData() {
    const nbpRates = useNBPTable('a');
    const gold = useGold(30);
    const wig20 = useStooq('wig20', 30);
    const interestRates = useNBPInterestRates();
    const wibor = useWibor();
    const gus = useGUSData('all', 3);
    const cpi = useInflationMonthly();
    const unemployment = useUnemploymentMonthly();
    const gdp = useGDPQuarterly();
    const bondYield = useStooq('10ypl.b', 1);

    return {
        nbpRates,
        gold,
        wig20,
        interestRates,
        wibor,
        gus,
        cpi,
        unemployment,
        gdp,
        bondYield,
        isLoading: nbpRates.isLoading || gold.isLoading || wig20.isLoading,
    };
}

// Re-export types for page components
export type { NBPRate, NBPTable, StooqData, GoldPrice, NBPInterestRate, WiborRate, GUSIndicator, EurostatTimeSeries, EurostatResult };

