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

// ─── GUS Wages (for CPI Core block — NECMOD) ────────────

export function useGUSWages(years = 5) {
    return useQuery<{ latest: number | null; prevYear: number | null; yoy: number | null; source: string }>({
        queryKey: ['gus-wages', years],
        queryFn: async () => {
            const data = await fetchJSON<{ results?: Array<{ name: string; values: Array<{ year: number; val: number | null }> }> }>(`/api/gus?indicator=wages_enterprise&years=${years}`);
            const vals = data?.results?.[0]?.values?.filter((v: { val: number | null }) => v.val !== null) ?? [];
            if (vals.length < 2) return { latest: vals[0]?.val ?? null, prevYear: null, yoy: null, source: 'GUS BDL' };
            const latest = vals[vals.length - 1];
            const prev = vals[vals.length - 2];
            const yoy = prev.val && latest.val ? +((latest.val / prev.val - 1) * 100).toFixed(1) : null;
            return { latest: latest.val, prevYear: prev.val, yoy, source: 'GUS BDL var:196229' };
        },
        staleTime: 24 * 60 * 60 * 1000,
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

// ─── CPI Forecaster Data Hooks ──────────────────────────

export function useHICPIndex(component: 'hicp_index' | 'hicp_food' | 'hicp_fuel' | 'hicp_energy' | 'hicp_core' = 'hicp_index') {
    return useEurostat(component, 'PL');
}

export function useHICPFoodYoY() { return useEurostat('hicp_food_yoy', 'PL'); }
export function useHICPCoreYoY() { return useEurostat('hicp_core_yoy', 'PL'); }
export function usePPI() { return useEurostat('ppi', 'PL'); }
export function useBrent() { return useStooq('cb.c', 90); } // legacy — prefer useBrentMM()
export function useUSDPLN() { return useNBPCurrencyHistory('usd', 90); }
export function useEURPLN() { return useNBPCurrencyHistory('eur', 90); }

// ─── Brent M/M (proper monthly avg, Stooq→EIA fallback) ─

interface BrentMMResult {
    avg30d: number | null;
    avgPrev30d: number | null;
    changeMM: number | null;  // M/M %
    latest: number | null;
    source: string;
    error: boolean;
}

interface EIABrentResponse {
    data: Array<{ date: string; close: number }>;
    latest: { date: string; close: number } | null;
    avg30d: number | null;
    avgPrev30d: number | null;
    changeMM: number | null;
    source: string;
    error?: string;
}

export function useBrentMM(): { data: BrentMMResult | undefined; isLoading: boolean } {
    // Try Stooq first (90 days)
    const stooq = useStooq('cb.c', 90);  // cb.c = Brent crude on Stooq (brent.c is broken)

    // Try EIA as fallback
    const eia = useQuery<EIABrentResponse>({
        queryKey: ['eia-brent'],
        queryFn: () => fetchJSON('/api/eia?limit=90'),
        staleTime: 2 * 60 * 60 * 1000, // 2h
        enabled: !stooq.data || (stooq.data?.data?.length ?? 0) < 10, // only fetch if Stooq fails
    });

    const isLoading = stooq.isLoading || (eia.isLoading && !stooq.data);

    // Compute M/M from Stooq data (30d avg vs prev 30d avg)
    if (stooq.data && stooq.data.data && stooq.data.data.length >= 30) {
        const closes = stooq.data.data.map((d: { close: number }) => d.close);
        const last30 = closes.slice(-30);
        const prev30 = closes.slice(-60, -30);
        const avg = (a: number[]) => a.length > 0 ? a.reduce((s, v) => s + v, 0) / a.length : null;
        const a30 = avg(last30);
        const p30 = avg(prev30);
        const mm = a30 && p30 ? +((a30 / p30 - 1) * 100).toFixed(1) : null;
        return {
            data: {
                avg30d: a30 ? +a30.toFixed(2) : null,
                avgPrev30d: p30 ? +p30.toFixed(2) : null,
                changeMM: mm,
                latest: stooq.data.latest?.close ?? null,
                source: 'Stooq brent.c',
                error: false,
            },
            isLoading,
        };
    }

    // Fallback to EIA
    if (eia.data && !eia.data.error) {
        return {
            data: {
                avg30d: eia.data.avg30d,
                avgPrev30d: eia.data.avgPrev30d,
                changeMM: eia.data.changeMM,
                latest: eia.data.latest?.close ?? null,
                source: 'EIA RBRTE',
                error: false,
            },
            isLoading,
        };
    }

    // Both failed
    return {
        data: {
            avg30d: null, avgPrev30d: null, changeMM: null, latest: null,
            source: 'NO DATA', error: true,
        },
        isLoading,
    };
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

