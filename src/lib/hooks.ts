'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueries, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { NewsResult } from '@/lib/news/types';
import type { DailyDigest } from '@/lib/news/daily';
import { refreshOptions } from '@/lib/query-refresh';

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
        ...refreshOptions('nbpDaily'),
    });
}

export function useNBPCurrencyHistory(code: string, days = 30) {
    return useQuery<NBPRate[]>({
        queryKey: ['nbp', 'history', code, days],
        queryFn: () => fetchJSON(`/api/nbp?table=a&code=${code}&last=${days}`),
        ...refreshOptions('nbpDaily'),
        enabled: !!code,
    });
}

// ─── NBP Gold ────────────────────────────────────────────

export function useGold(days = 30) {
    return useQuery<GoldPrice[]>({
        queryKey: ['nbp', 'gold', days],
        queryFn: () => fetchJSON(`/api/nbp?gold=true&last=${days}`),
        ...refreshOptions('nbpDaily'),
    });
}

// ─── NBP Interest Rates (XML) ────────────────────────────

export function useNBPInterestRates() {
    return useQuery<{ rates: NBPInterestRate[]; publishDate: string }>({
        queryKey: ['nbp', 'interest-rates'],
        queryFn: () => fetchJSON('/api/nbp-rates'),
        ...refreshOptions('nbpInterest'),
    });
}

// ─── WIBOR (GPW Benchmark) ──────────────────────────────

export function useWibor() {
    return useQuery<{ rates: WiborRate[]; nbpRefRate: number }>({
        queryKey: ['wibor'],
        queryFn: () => fetchJSON('/api/wibor'),
        ...refreshOptions('wibor'),
    });
}

// ─── Stooq (Stocks, Indices) ─────────────────────────────

export function useStooq(symbol: string, limit = 30) {
    const policy = ['cb.c', 'cl.c', 'gc.c', 'hg.c', 'ng.c'].includes(symbol.toLowerCase()) ? 'commodity' : 'market';
    return useQuery<StooqData>({
        queryKey: ['stooq', symbol, limit],
        queryFn: () => fetchJSON(`/api/stooq?symbol=${symbol}&limit=${limit}`),
        ...refreshOptions(policy),
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
        ...refreshOptions('market'),
    });
}

// ─── GUS BDL Data ────────────────────────────────────────

export function useGUSData(indicator: string = 'all', years = 3) {
    return useQuery<Record<string, GUSIndicator>>({
        queryKey: ['gus', indicator, years],
        queryFn: () => fetchJSON(`/api/gus?indicator=${indicator}&years=${years}`),
        ...refreshOptions('gusMonthly'),
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
        ...refreshOptions('gusMonthly'),
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
    wagesSeries?: { year: number | string; value: number }[];
}

interface GusRegionalData {
    regions: GusRegion[];
    timeline: { month: string; label?: string; rates: Record<string, number> }[];
    yearly?: { year: string; rates: Record<string, number> }[];
    sectorWages?: { code: string; name: string; wage: number; yoy: number }[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    timestamp: string;
}

export interface RegionalGusRow { slug: string; name: string; gdpTotal: number | null; population: number | null; gdpPerCapita: number | null }
interface RegionalGusData {
    regions: RegionalGusRow[];
    gdpYear: string;
    popYear: string;
    national: { population: number | null; gdpPerCapita: number | null; gdpTotal?: number | null };
    source?: string;
}
/** @deprecated alias — dane z GUS BDL, nie Eurostat */
export type RegionalEURow = RegionalGusRow;

export function useRegionalGus() {
    return useQuery<RegionalGusData>({
        queryKey: ['regional-gus'],
        queryFn: () => fetchJSON('/api/regional-gus'),
        ...refreshOptions('regionalGus'),
    });
}

/** @deprecated Użyj useRegionalGus — źródło zmienione z Eurostat na GUS BDL */
export function useRegionalEU() {
    return useRegionalGus();
}

export function useGusRegional() {
    return useQuery<GusRegionalData>({
        queryKey: ['gus-regional'],
        queryFn: () => fetchJSON('/api/gus-regional'),
        ...refreshOptions('gusMonthly'),
    });
}

// ─── GUS Monthly (retail sales + wages) ──────────────────
// STEP7 research (2026-08-23): mediana wynagrodzeń IS in BDL — subject P4610
// "Mediana wynagrodzeń miesięcznych brutto według badania Rozkład wynagrodzeń
// w gospodarce narodowej". Monthly (availability quarterly="K"), years from 2024.
// Ogółem / miejsce zamieszkania: Jan=1750141 … Dec=1750207, stride +6/month
// (6 vars/month: 2 scopes × 3 płcie). National unit-level=0 works; latest live
// check: 2026-02 = 7690.82 zł. Do NOT use /api/bdl-series without stride=6.
// Suggested: useGusMedianWages() → dedicated route or bdl-series?stride=6.
// Sibling mean from same survey: P4609 (≠ P2687 enterprise przeciętne).

interface GusMonthlyData {
    retail: { date: string; value: number; raw: number }[];
    wages: { date: string; value: number; raw: number }[];
    source: string;
    timestamp: string;
}

export function useGusMonthly() {
    return useQuery<GusMonthlyData>({
        queryKey: ['gus-monthly'],
        queryFn: () => fetchJSON('/api/gus-monthly'),
        ...refreshOptions('gusMonthly'),
    });
}

/** Rentowność obligacji skarbowych 10Y (rynek GPW/Stooq — nie Eurostat Maastricht) */
export function useBondYield10YPl(limit = 30) {
    return useStooq('10ypl.b', limit);
}

// ─── Eurostat (Monthly/Quarterly Data) ───────────────────
// AUDIT 2026-08-22 — Eurostat vs GUS dla PL (macro → GUS; rynek → NBP/GPW/Stooq):
//
// | Hook                      | Strony / komponenty                          | GUS?                    | Akcja                          |
// |---------------------------|----------------------------------------------|-------------------------|--------------------------------|
// | useInflationMonthly       | macro-sections, prognozy, KorelacjeMakro, page| useCpiFull ✓            | Migrować do useCpiFull         |
// | useHICPFoodYoY/CoreYoY    | macro-sections                               | useCpiFull (działy) ✓   | Migrować do useCpiFull         |
// | useUnemploymentMonthly    | page, KorelacjeMakro                         | useGusRegional ✓ (rej.) | Migrować (LFS≠rejestr.)        |
// | useGDPQuarterly/QoQ       | macro-sections, prognozy, page               | brak kwartalnego GUS    | Nowy /api/gus-gdp              |
// | useIndustrialProduction   | macro-sections, prognozy, page, Korelacje    | GUS BDL produkcja       | Nowy hook BDL/DBW              |
// | useRetailSales            | macro-sections, prognozy, page, Korelacje    | useGusMonthly ✓         | Migrować do useGusMonthly      |
// | useConstruction           | macro-sections                               | GUS DBW budowlane       | useDbwSeries / nowy hook       |
// | useGDPConsumption/Inv/Exp/Imp | macro-sections                           | GUS PKB składowe        | Nowy /api/gus-gdp-components   |
// | useTradeData              | (usunięte z /rynki)                          | GUS DBHZ obroty         | Nowy /api/gus-trade            |
// | useCurrentAccount         | (usunięte z /rynki)                          | NBP rachunek bieżący    | Nowy /api/nbp-bop              |
// | useConsumerConfidence     | gospodarka, KorelacjeMakro                   | useKoniunktura ✓        | Migrować do useKoniunktura     |
// | useBondYield10Y           | gospodarka, page, KorelacjeMakro             | Stooq 10ypl.b ✓ (rynek) | Migrować do useStooq           |
// | useGovDebt/Deficit        | gospodarka, RzadyGospodarka                  | MF/GUS rocznie          | Nowy hook GUS/MF               |
// | useGDPAnnual/CPIAnnual    | RzadyGospodarka                              | useGUSData ✓ (roczne)   | Migrować do useGUSData         |
// | usePPI                    | InflacjaFull, KorelacjeMakro                 | usePpiFull ✓            | Migrować do usePpiFull         |
// | useHICPIndex/Division     | useCPIBasket, prognozy                       | useCpiFull (krajowy)    | Koszyk: GUS; HICP tylko EU      |
// | usePLvsEU                 | (porównania PL/EU)                           | celowo Eurostat         | Zostaje (benchmark UE)         |
// | useDashboardData          | (composite)                                  | częściowo GUS           | Po migracji powyższych         |
//

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

export function useEurostat(indicator: string, geo = 'PL'): UseQueryResult<EurostatResult> {
    return useQuery<EurostatResult>({
        queryKey: ['eurostat', indicator, geo],
        queryFn: (): Promise<EurostatResult> => fetchJSON(`/api/eurostat?indicator=${indicator}&geo=${geo}`),
        ...refreshOptions('eurostat'),
    });
}

// Convenience hooks for specific indicators
export function useInflationMonthly(geo = 'PL') {
    return useEurostat('cpi', geo);
}

export function useUnemploymentMonthly(geo = 'PL') {
    return useEurostat('unemployment', geo);
}

/** Stopa bezrobocia rejestrowanego (GUS BDL P3559) — miesięczna, krajowa */
export function useGusRegisteredUnemployment(months = 12) {
    return useBdlSeries(461680, months);
}

export function useGDPQuarterly(geo = 'PL') {
    return useEurostat('gdp_yoy', geo);
}

export function useGDPQoQ(geo = 'PL') {
    return useEurostat('gdp_qoq', geo);
}
export function useGDPConsumption() { return useEurostat('gdp_consumption', 'PL'); }
export function useGDPInvestment() { return useEurostat('gdp_investment', 'PL'); }
export function useGDPExports() { return useEurostat('gdp_exports', 'PL'); }
export function useGDPImports() { return useEurostat('gdp_imports', 'PL'); }

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
    // TODO: migrate → /api/gus-trade (GUS DBHZ obroty towarowe). UI usunięte z /rynki (brak hooka GUS).
    return useEurostat(flow, 'PL');
}

export function useCurrentAccount() {
    // TODO: migrate → /api/nbp-bop (NBP rachunek bieżący). UI usunięte z /rynki (brak hooka GUS/NBP).
    return useEurostat('current_account', 'PL');
}

// ─── Nowe wskaźniki makro (Eurostat, dane realne PL) ─────
export function useConsumerConfidence() { return useEurostat('consumer_confidence', 'PL'); }
export function useBondYield10Y() {
    // TODO: migrate → useStooq('10ypl.b') — dane rynkowe GPW/Stooq, nie Eurostat Maastricht.
    return useEurostat('bond_yield_10y', 'PL');
}
export function useGovDebt() { return useEurostat('gov_debt', 'PL'); }
export function useGovDeficit() { return useEurostat('gov_deficit', 'PL'); }
export function useGDPAnnual() { return useEurostat('gdp_annual', 'PL'); }
export function useCPIAnnual() { return useEurostat('cpi_annual', 'PL'); }

// ─── CPI Forecaster Data Hooks ──────────────────────────

export function useHICPIndex(component: 'hicp_index' | 'hicp_food' | 'hicp_fuel' | 'hicp_energy' | 'hicp_core' = 'hicp_index') {
    return useEurostat(component, 'PL');
}

export function useHICPFoodYoY() { return useEurostat('hicp_food_yoy', 'PL'); }
export function useHICPCoreYoY() { return useEurostat('hicp_core_yoy', 'PL'); }
export function usePPI() { return useEurostat('ppi', 'PL'); }

/** 10-letni INDEKS cen dywizji COICOP (HICP, Eurostat, 2015=100) — leniwie, gdy podany kod (np. 'CP04').
 *  Z indeksu liczymy zmianę roczną (÷12 mies.), kwartalną (÷3) i miesięczną (÷1). */
export function useHicpDivision(coicop?: string, since = `${new Date().getFullYear() - 10}-01`) {
    return useQuery<EurostatResult>({
        queryKey: ['hicp-div-idx', coicop, since],
        queryFn: () => fetchJSON(`/api/eurostat?dataset=prc_hicp_midx&coicop=${coicop}&unit=I15&geo=PL&since=${since}`),
        enabled: !!coicop,
        ...refreshOptions('eurostat'),
    });
}
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
        ...refreshOptions('commodity'),
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

// ─── GUS CPI pełny (headline y/y+m/m + 13 działów COICOP, DBW) ───

export interface CpiHistPoint { date: string; yoy: number | null; qoq?: number | null; mom?: number | null }
export interface CpiSubcategory {
    code: string; name: string;
    yoy: number | null; mom: number | null; qoq?: number | null; weight?: number | null;
    history?: CpiHistPoint[];
}
export interface CpiDivision {
    code: string; name: string; weight: number;
    yoy: number | null; mom: number | null; qoq?: number | null; contribution: number | null;
    history: CpiHistPoint[];
    subcategories?: CpiSubcategory[];
}
interface CpiFullData {
    headline: { date: string; yoy: number | null; mom: number | null }[];
    divisions: CpiDivision[];
    dataDate: string;
    weightsApprox: boolean;
    spliceDate?: string | null;   // od kiedy dane miesięczne (COICOP 2018); wcześniej kwartalne (COICOP 1999)
    source?: string;
}

export function useCpiFull(year = new Date().getFullYear()) {
    const queryClient = useQueryClient();
    const queryKey = ['gus-cpi-full', year] as const;
    const query = useQuery<CpiFullData>({
        queryKey,
        queryFn: () => fetchJSON(`/api/gus-cpi-full?year=${year}`),
        ...refreshOptions('gusDbw'),
    });
    const refreshFromSource = useCallback(
        () => queryClient.fetchQuery({
            queryKey,
            queryFn: () => fetchJSON<CpiFullData>(`/api/gus-cpi-full?year=${year}&refresh=1`),
        }),
        [queryClient, year],
    );
    return { ...query, refreshFromSource };
}

// ─── GUS PPI pełny (ceny produkcji, PKD 2007) ────────────
export interface PpiHistPoint { date: string; yoy: number | null; mom: number | null }
export interface PpiDivision { code: string; name: string; sec: string; yoy: number | null; mom: number | null; history: PpiHistPoint[] }
export interface PpiSection { code: string; name: string; yoy: number | null; mom: number | null; history: PpiHistPoint[]; divisions: PpiDivision[] }
export interface PpiFullData { headline: PpiHistPoint[]; sections: PpiSection[]; dataDate: string; source: string }
export function usePpiFull() {
    const queryClient = useQueryClient();
    const queryKey = ['gus-ppi-full'] as const;
    const query = useQuery<PpiFullData>({
        queryKey,
        queryFn: () => fetchJSON('/api/gus-ppi-full'),
        ...refreshOptions('gusDbw'),
    });
    const refreshFromSource = useCallback(
        () => queryClient.fetchQuery({
            queryKey,
            queryFn: () => fetchJSON<PpiFullData>('/api/gus-ppi-full?refresh=1'),
        }),
        [queryClient],
    );
    return { ...query, refreshFromSource };
}

// ─── GUS krajowy CPI (oficjalny, DBW) ───────────────────

interface CpiNationalData {
    trend: { date: string; value: number }[];
    latest: { date: string; ogolem: number; categories: { name: string; yoy: number | null }[] } | null;
    source: string;
}

export function useCpiNational(year = new Date().getFullYear()) {
    return useQuery<CpiNationalData>({
        queryKey: ['gus-cpi', year],
        queryFn: () => fetchJSON(`/api/gus-cpi?year=${year}`),
        ...refreshOptions('gusDbw'),
    });
}

// ─── Generic BDL series (zatrudnienie, bezrobotni, wakaty) ───

export function useBdlSeries(start: number, count = 12, year = new Date().getFullYear(), freq: 'm' | 'q' = 'm') {
    return useQuery<{ series: { date: string; value: number }[]; source: string }>({
        queryKey: ['bdl-series', start, count, year, freq],
        queryFn: () => fetchJSON(`/api/bdl-series?start=${start}&count=${count}&year=${year}&freq=${freq}`),
        ...refreshOptions('gusMonthly'),
    });
}

// ─── Generic DBW series (PPI, ceny nieruchomości/budowlane/rolne) ───

export interface DbwSeriesConfig {
    var: number; przekroj: number; poz: number[];
    year?: number; freq?: 'm' | 'q'; prez?: number; poz1?: number; sub100?: boolean;
}

export function useDbwSeries(config: DbwSeriesConfig) {
    const { var: v, przekroj, poz, year = new Date().getFullYear(), freq = 'm', prez = 5, poz1 = 33617, sub100 = true } = config;
    const qs = new URLSearchParams({ var: String(v), przekroj: String(przekroj), year: String(year), freq, prez: String(prez), poz1: String(poz1), sub100: sub100 ? '1' : '0' });
    poz.forEach((p) => qs.append('poz', String(p)));
    return useQuery<{ series: Record<string, number | string>[]; source: string }>({
        queryKey: ['dbw-series', v, przekroj, poz.join('-'), year, freq, prez, sub100],
        queryFn: () => fetchJSON(`/api/dbw-series?${qs}`),
        ...refreshOptions('gusDbw'),
    });
}

// ─── GUS koniunktura (badanie koniunktury, DBW) — proxy PMI ───

interface KoniunkturaData {
    trend: Record<string, number | string>[];
    latest: { date: string; sectors: { name: string; value: number | null }[] } | null;
    sectors: { key: string; name: string }[];
    source: string;
}

export function useKoniunktura(year = new Date().getFullYear()) {
    return useQuery<KoniunkturaData>({
        queryKey: ['gus-koniunktura', year],
        queryFn: () => fetchJSON(`/api/gus-koniunktura?year=${year}`),
        ...refreshOptions('gusDbw'),
    });
}

// ─── GUS aktywność gospodarcza (miesięcznie r/r) — Ceny/Gospodarka ───

interface GusBdlVariableResponse {
    results?: Array<{ values: Array<{ year: number | string; val: number | null }> }>;
}

/** DBW short-term stats: var 312 / przekrój 93 — poz 6661771 = produkcja przemysłowa ogółem (r/r). */
const GUS_INDUSTRIAL_POZ = 6661771;
/** DBW short-term stats: var 312 / przekrój 93 — poz 6661787 = produkcja budowlano-montażowa (r/r). */
const GUS_CONSTRUCTION_POZ = 6661787;

function dbwSeriesToEurostat(
    q: UseQueryResult<{ series: Record<string, number | string>[]; source: string }>,
    poz: number,
    label: string,
): UseQueryResult<EurostatResult> {
    const data = useMemo((): EurostatResult | undefined => {
        if (!q.data?.series?.length) return undefined;
        const key = String(poz);
        const PL = q.data.series
            .map((row) => {
                const v = row[key];
                return typeof v === 'number' ? { date: String(row.date), value: v } : null;
            })
            .filter((p): p is EurostatTimeSeries & { value: number } => p != null);
        return { dataset: 'gus-dbw', label, geo: ['PL'], updated: '', data: { PL }, source: q.data.source };
    }, [q.data, poz, label]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

function bdlPrevYearToEurostat(
    q: UseQueryResult<GusBdlVariableResponse>,
    label: string,
    source: string,
): UseQueryResult<EurostatResult> {
    const data = useMemo((): EurostatResult | undefined => {
        const vals = q.data?.results?.[0]?.values?.filter((v) => v.val != null) ?? [];
        if (!vals.length) return undefined;
        const PL = vals
            .sort((a, b) => Number(a.year) - Number(b.year))
            .map((v) => ({ date: String(v.year), value: +((v.val as number) - 100).toFixed(1) }));
        return { dataset: 'gus-bdl', label, geo: ['PL'], updated: '', data: { PL }, source };
    }, [q.data, label, source]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

/** Sprzedaż detaliczna (r/r) — GUS BDL P3860, ogółem. */
export function useGusRetailSales(): UseQueryResult<EurostatResult> {
    const q = useGusMonthly();
    const data = useMemo((): EurostatResult | undefined => {
        if (!q.data?.retail?.length) return undefined;
        const PL = q.data.retail.map((r) => ({ date: r.date, value: r.value }));
        return {
            dataset: 'gus-bdl',
            label: 'Sprzedaż detaliczna (r/r)',
            geo: ['PL'],
            updated: q.data.timestamp,
            data: { PL },
            source: q.data.source,
        };
    }, [q.data]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

/** Produkcja przemysłowa (r/r) — GUS DBW var 312. */
export function useGusIndustrialProduction(): UseQueryResult<EurostatResult> {
    const q = useDbwSeries({ var: 312, przekroj: 93, poz: [GUS_INDUSTRIAL_POZ] });
    return dbwSeriesToEurostat(q, GUS_INDUSTRIAL_POZ, 'Produkcja przemysłowa (r/r)');
}

/** Produkcja budowlano-montażowa (r/r) — GUS DBW var 312. */
export function useGusConstructionOutput(): UseQueryResult<EurostatResult> {
    const q = useDbwSeries({ var: 312, przekroj: 93, poz: [GUS_CONSTRUCTION_POZ] });
    return dbwSeriesToEurostat(q, GUS_CONSTRUCTION_POZ, 'Produkcja budowlano-montażowa (r/r)');
}

/** PKB (r/r) rocznie — GUS BDL var 458272 (rok poprzedni = 100). */
export function useGusGdpAnnual(): UseQueryResult<EurostatResult> {
    const q = useQuery<GusBdlVariableResponse>({
        queryKey: ['gus-bdl', 'gdp_growth'],
        queryFn: () => fetchJSON('/api/gus?indicator=gdp_growth&years=20'),
        ...refreshOptions('gusMonthly'),
    });
    return bdlPrevYearToEurostat(q, 'PKB (r/r)', 'GUS BDL var:458272');
}

/** Inflacja roczna — GUS BDL var 217230 (rok poprzedni = 100). */
export function useGusCpiAnnual(): UseQueryResult<EurostatResult> {
    const q = useQuery<GusBdlVariableResponse>({
        queryKey: ['gus-bdl', 'cpi_annual'],
        queryFn: () => fetchJSON('/api/gus?indicator=cpi&years=20'),
        ...refreshOptions('gusMonthly'),
    });
    return bdlPrevYearToEurostat(q, 'Inflacja (r/r)', 'GUS BDL var:217230');
}

/** Bezrobocie rejestrowane — średnia województw, GUS BDL P3559 (miesięcznie, poziom). */
export function useGusUnemploymentNational(): UseQueryResult<EurostatResult> {
    const q = useGusRegional();
    const data = useMemo((): EurostatResult | undefined => {
        if (!q.data?.timeline?.length) return undefined;
        const PL = q.data.timeline.map((t) => {
            const vals = Object.values(t.rates);
            if (!vals.length) return null;
            const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
            return { date: t.month, value: +avg.toFixed(1) };
        }).filter((p): p is EurostatTimeSeries & { value: number } => p != null);
        return {
            dataset: 'gus-bdl',
            label: 'Bezrobocie rejestrowane',
            geo: ['PL'],
            updated: q.data.timestamp,
            data: { PL },
            source: 'GUS BDL P3559',
        };
    }, [q.data]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

/** PPI ogółem (r/r) — alias na GUS DBW pełny PPI (zastępuje Eurostat w sekcjach Ceny/Gospodarka). */
export function useGusPpiHeadline(): UseQueryResult<EurostatResult> {
    const q = usePpiFull();
    const data = useMemo((): EurostatResult | undefined => {
        const headline = q.data?.headline ?? [];
        if (!headline.length) return undefined;
        const PL = headline
            .filter((h) => h.yoy != null)
            .map((h) => ({ date: h.date, value: h.yoy as number }));
        return {
            dataset: 'gus-dbw',
            label: 'PPI (r/r)',
            geo: ['PL'],
            updated: q.data?.dataDate ?? '',
            data: { PL },
            source: q.data?.source ?? 'GUS DBW',
        };
    }, [q.data]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

/** CPI ogółem (r/r) — alias na krajowy CPI GUS DBW (zastępuje Eurostat HICP w korelacjach). */
export function useGusCpiHeadline(): UseQueryResult<EurostatResult> {
    const q = useCpiFull();
    const data = useMemo((): EurostatResult | undefined => {
        const headline = q.data?.headline ?? [];
        if (!headline.length) return undefined;
        const PL = headline
            .filter((h) => h.yoy != null)
            .map((h) => ({ date: h.date, value: h.yoy as number }));
        return {
            dataset: 'gus-dbw',
            label: 'CPI (r/r)',
            geo: ['PL'],
            updated: q.data?.dataDate ?? '',
            data: { PL },
            source: q.data?.source ?? 'GUS DBW',
        };
    }, [q.data]);
    return { ...q, data } as unknown as UseQueryResult<EurostatResult>;
}

// ─── SMUP (System Monitorowania Usług Publicznych) ──────

export interface SmupArea { 'id-ou': number; 'nazwa-obszaru': string }
export interface SmupService { 'id-up': number; 'nazwa-uslugi': string }
export interface SmupIndicator { id: number; 'nazwa-wskaznika': string; 'id-up'?: number; 'nazwa-uslugi'?: string; 'wymiar-opisu-uslugi'?: string }
export interface SmupDataRow { id: number; 'id-daty': number; 'id-teryt': number; 'id-flaga': number; wartosc: number; precyzja: number }

export function useSmupAreas() {
    return useQuery<SmupArea[]>({ queryKey: ['smup', 'areas'], queryFn: () => fetchJSON('/api/smup?resource=areas-list'), ...refreshOptions('smupCatalog') });
}
export function useSmupServices(areaId?: number) {
    return useQuery<SmupService[]>({ queryKey: ['smup', 'services', areaId], queryFn: () => fetchJSON(`/api/smup?resource=public-services&id=${areaId}`), enabled: !!areaId, ...refreshOptions('smupCatalog') });
}
export function useSmupIndicators(serviceId?: number) {
    return useQuery<SmupIndicator[]>({ queryKey: ['smup', 'indicators', serviceId], queryFn: () => fetchJSON(`/api/smup?resource=indicators-list&id=${serviceId}`), enabled: !!serviceId, ...refreshOptions('smupCatalog') });
}
export function useSmupData(indicatorId?: number) {
    return useQuery<{ data: SmupDataRow[] } | SmupDataRow[]>({ queryKey: ['smup', 'data', indicatorId], queryFn: () => fetchJSON(`/api/smup?resource=indicator-date-data&id=${indicatorId}&page-size=2000`), enabled: !!indicatorId, ...refreshOptions('smupData') });
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

// ─── Newsy (agregat RSS) ─────────────────────────────────
// Typy mieszkają w lib/news/types.ts — współdzielone z serwerem (api/news) i match.ts.

export type { NewsItem, NewsSourceStatus, NewsResult } from '@/lib/news/types';

export function useNews() {
    return useQuery<NewsResult>({
        queryKey: ['news'],
        queryFn: () => fetchJSON('/api/news'),
        ...refreshOptions('news'),
    });
}

// ─── Daily Digest ────────────────────────────────────────

export function useDailyDigest(date?: string) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return useQuery<DailyDigest | null>({
        queryKey: ['daily-digest', date ?? 'today'],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/news/daily${qs}`, { cache: 'no-store' });
                if (res.status === 404) return null;
                if (!res.ok) return null;
                const body = await res.json() as { digest?: DailyDigest | null };
                return body.digest ?? null;
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

// ─── Spółki WIG20 (notowania zbiorczo) ───────────────────

export interface Wig20Quote {
    ticker: string;
    name: string;
    price: number | null;
    changePct: number | null;
    date: string | null;
}
export interface Wig20Result { timestamp: string; count: number; ok: number; items: Wig20Quote[] }

/**
 * @param enabled Przegląd potrzebuje notowań spółek TYLKO wtedy, gdy użytkownik ma jakąś
 * w watchliście — bez tego każde wejście na stronę główną ciągnęłoby 21 spółek na zapas.
 */
export function useWig20(enabled = true) {
    return useQuery<Wig20Result>({
        queryKey: ['wig20-spolki'],
        queryFn: () => fetchJSON('/api/wig20'),
        ...refreshOptions('market'),
        enabled,
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

