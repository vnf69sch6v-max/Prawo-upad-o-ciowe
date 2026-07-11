'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { COICOP_2026, buildBasket } from '@/lib/calculations/cpi-basket';

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

// ─── GUS Regional (registered unemployment + wages by voivodeship) ───

interface GusRegion {
    id: string;
    name: string;
    slug: string;
    unemployment: number | null;
    unemploymentMonth: string | null;
    unemploymentPrev: number | null;
    wages: number | null;
    wagesPrev: number | null;
    wagesYoY: number | null;
}

interface GusRegionalData {
    regions: GusRegion[];
    timeline: { month: string; label?: string; rates: Record<string, number> }[];
    yearly?: { year: string; rates: Record<string, number> }[];
    sectorWages?: { code: string; name: string; wage: number; yoy: number }[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    timestamp: string;
}

export function useGusRegional() {
    return useQuery<GusRegionalData>({
        queryKey: ['gus-regional'],
        queryFn: () => fetchJSON('/api/gus-regional'),
        staleTime: 24 * 60 * 60 * 1000, // 24h — monthly data
    });
}

// ─── GUS Monthly (retail sales + wages) ──────────────────

interface GusMonthlyData {
    retail: { date: string; value: number; raw: number }[];
    wages: { date: string; value: number; raw: number }[];
    timestamp: string;
}

export function useGusMonthly() {
    return useQuery<GusMonthlyData>({
        queryKey: ['gus-monthly'],
        queryFn: () => fetchJSON('/api/gus-monthly'),
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

export function useConstruction(geo = 'PL') {
    return useEurostat('construction', geo);
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

// ─── GUS krajowy CPI (oficjalny, DBW) ───────────────────

interface CpiNationalData {
    trend: { date: string; value: number }[];
    latest: { date: string; ogolem: number; categories: { name: string; yoy: number | null }[] } | null;
    source: string;
}

export function useCpiNational(year = 2025) {
    return useQuery<CpiNationalData>({
        queryKey: ['gus-cpi', year],
        queryFn: () => fetchJSON(`/api/gus-cpi?year=${year}`),
        staleTime: 24 * 60 * 60 * 1000,
    });
}

// ─── Generic DBW series (PPI, ceny nieruchomości/budowlane/rolne) ───

export interface DbwSeriesConfig {
    var: number; przekroj: number; poz: number[];
    year?: number; freq?: 'm' | 'q'; prez?: number; poz1?: number; sub100?: boolean;
}

export function useDbwSeries(config: DbwSeriesConfig) {
    const { var: v, przekroj, poz, year = 2025, freq = 'm', prez = 5, poz1 = 33617, sub100 = true } = config;
    const qs = new URLSearchParams({ var: String(v), przekroj: String(przekroj), year: String(year), freq, prez: String(prez), poz1: String(poz1), sub100: sub100 ? '1' : '0' });
    poz.forEach((p) => qs.append('poz', String(p)));
    return useQuery<{ series: Record<string, number | string>[]; source: string }>({
        queryKey: ['dbw-series', v, przekroj, poz.join('-'), year, freq, prez, sub100],
        queryFn: () => fetchJSON(`/api/dbw-series?${qs}`),
        staleTime: 24 * 60 * 60 * 1000,
    });
}

// ─── GUS koniunktura (badanie koniunktury, DBW) — proxy PMI ───

interface KoniunkturaData {
    trend: Record<string, number | string>[];
    latest: { date: string; sectors: { name: string; value: number | null }[] } | null;
    sectors: { key: string; name: string }[];
    source: string;
}

export function useKoniunktura(year = 2025) {
    return useQuery<KoniunkturaData>({
        queryKey: ['gus-koniunktura', year],
        queryFn: () => fetchJSON(`/api/gus-koniunktura?year=${year}`),
        staleTime: 24 * 60 * 60 * 1000,
    });
}

// ─── CPI z koszyka (COICOP 2026) — 12 dywizji HICP na żywo ───

export function useCPIBasket() {
    const results = useQueries({
        queries: [
            { queryKey: ['hicp-div', 'CP00'], queryFn: () => fetchJSON<EurostatResult>('/api/eurostat?dataset=prc_hicp_manr&coicop=CP00&geo=PL&since=2023-01'), staleTime: 12 * 60 * 60 * 1000 },
            ...COICOP_2026.map((d) => ({
                queryKey: ['hicp-div', d.coicop],
                queryFn: () => fetchJSON<EurostatResult>(`/api/eurostat?dataset=prc_hicp_manr&coicop=${d.coicop}&geo=PL&since=2023-01`),
                staleTime: 12 * 60 * 60 * 1000,
            })),
        ],
    });

    const isLoading = results.some((r) => r.isLoading);
    const headSeries = results[0]?.data?.data?.PL ?? [];
    const official = headSeries.length ? (headSeries[headSeries.length - 1].value ?? null) : null;
    const dataDate = headSeries.length ? headSeries[headSeries.length - 1].date : null;

    const yoyByCode: Record<string, number | null> = {};
    COICOP_2026.forEach((d, i) => {
        const s = results[i + 1]?.data?.data?.PL ?? [];
        yoyByCode[d.code] = s.length ? (s[s.length - 1].value ?? null) : null;
    });

    return { basket: buildBasket(COICOP_2026, yoyByCode, official, dataDate), isLoading };
}

// ─── SMUP (System Monitorowania Usług Publicznych) ──────

export interface SmupArea { 'id-ou': number; 'nazwa-obszaru': string }
export interface SmupService { 'id-up': number; 'nazwa-uslugi': string }
export interface SmupIndicator { id: number; 'nazwa-wskaznika': string; 'id-up'?: number; 'nazwa-uslugi'?: string; 'wymiar-opisu-uslugi'?: string }
export interface SmupDataRow { id: number; 'id-daty': number; 'id-teryt': number; 'id-flaga': number; wartosc: number; precyzja: number }

export function useSmupAreas() {
    return useQuery<SmupArea[]>({ queryKey: ['smup', 'areas'], queryFn: () => fetchJSON('/api/smup?resource=areas-list'), staleTime: 7 * 24 * 60 * 60 * 1000 });
}
export function useSmupServices(areaId?: number) {
    return useQuery<SmupService[]>({ queryKey: ['smup', 'services', areaId], queryFn: () => fetchJSON(`/api/smup?resource=public-services&id=${areaId}`), enabled: !!areaId, staleTime: 7 * 24 * 60 * 60 * 1000 });
}
export function useSmupIndicators(serviceId?: number) {
    return useQuery<SmupIndicator[]>({ queryKey: ['smup', 'indicators', serviceId], queryFn: () => fetchJSON(`/api/smup?resource=indicators-list&id=${serviceId}`), enabled: !!serviceId, staleTime: 7 * 24 * 60 * 60 * 1000 });
}
export function useSmupData(indicatorId?: number) {
    return useQuery<{ data: SmupDataRow[] } | SmupDataRow[]>({ queryKey: ['smup', 'data', indicatorId], queryFn: () => fetchJSON(`/api/smup?resource=indicator-date-data&id=${indicatorId}&page-size=2000`), enabled: !!indicatorId, staleTime: 24 * 60 * 60 * 1000 });
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

