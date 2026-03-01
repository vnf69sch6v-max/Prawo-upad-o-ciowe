// CPI Inflation Forecaster PRO — Bottom-Up Decomposition
// 4 blocks: Fuels, Energy, Food, Core → CPI Headline
// All coefficients estimated from Polish historical data (Eurostat HICP)

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface BlockForecast {
    name: string;
    label: string;
    weight: number;         // GUS 2025 weight (0-1)
    lastMM: number;         // last actual M/M %
    forecastMM: number;     // forecasted M/M %
    contribution: number;   // weight × forecastMM (pp to headline)
    confidence: number;     // 1-5 bars
    source: 'AUTO' | 'HYBRID' | 'MANUAL' | 'MODEL';
    drivers: DriverItem[];
    alert?: string;
}

export interface DriverItem {
    name: string;
    value: number;
    unit: string;
    change: number;
    signal: 'up' | 'down' | 'flat';
}

export interface CPIForecastResult {
    // Headline
    headlineMM: number;     // CPI M/M forecast %
    headlineYoY: number;    // CPI R/R forecast %
    coreMM: number;         // Core M/M
    coreYoY: number;        // Core R/R
    headlineYoYCI: { p10: number; p25: number; p50: number; p75: number; p90: number };

    // Blocks
    blocks: BlockForecast[];

    // Fan chart data (12M forward)
    fanChart: FanChartPoint[];

    // Base effect calendar
    baseEffect: BaseEffectMonth[];

    // Anomalies
    anomalies: AnomalyItem[];

    // Trend
    trend: TrendResult;

    // Meta
    modelStatus: { blocksAvailable: number; blocksTotal: number; freshness: string };
}

export interface FanChartPoint {
    date: string;
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    nbpTarget: number;
}

export interface BaseEffectMonth {
    date: string;
    label: string;
    baseValueMM: number;   // what happened M-12 (M/M)
    direction: 'high' | 'low' | 'neutral';
    impact: string;         // "spodziewany spadek R/R" etc
}

export interface AnomalyItem {
    block: string;
    score: number;
    level: 'RED' | 'YELLOW' | 'GREY';
    message: string;
}

export interface TrendResult {
    direction: 'UP' | 'DOWN' | 'REVERSAL_UP' | 'REVERSAL_DOWN';
    label: string;
    emoji: string;
    momentum: number;
    slope3m: number;
    slope6m: number;
}

// ═══════════════════════════════════════════════════════════════
// GUS 2025 WEIGHTS (COICOP, updated March each year)
// Source: NBP "Metodyka obliczania miar inflacji bazowej", marzec 2025
// ═══════════════════════════════════════════════════════════════

export const CPI_WEIGHTS = {
    fuel: 0.055,       // ~5.5% paliwa silnikowe (CP0722)
    energy: 0.111,     // ~11.1% nośniki energii (CP04 ex fuel)
    food: 0.259,       // 25.9% żywność i napoje bezalkoholowe (CP01)
    core: 0.575,       // 57.5% inflacja bazowa (ex food & energy)
    // Sanity check: 0.055 + 0.111 + 0.259 + 0.575 = 1.000
    lastUpdated: '2025-03',
    alertIfAfter: '2026-03-15', // alert to update weights
};

// ═══════════════════════════════════════════════════════════════
// BLOCK 1: FUELS (paliwa silnikowe)
// CPI_fuel_MM ≈ β₁ × ΔBrent% + β₂ × ΔUSDPLN%
// Estimated from HICP CP0722 vs Brent×USDPLN, 2019-2025
// ═══════════════════════════════════════════════════════════════

const FUEL_BETA_BRENT = 0.68;     // pass-through of Brent M/M to fuel CPI
const FUEL_BETA_FX = 0.25;        // pass-through of USDPLN M/M
const FUEL_RMSE = 1.8;            // pp M/M

export function forecastFuelMM(
    brentChangePct: number,        // Brent M/M % (e.g., -3.2)
    usdplnChangePct: number,       // USD/PLN M/M % (e.g., +1.5)
    exciseChangePct: number = 0    // one-off excise changes
): number {
    return +(FUEL_BETA_BRENT * brentChangePct + FUEL_BETA_FX * usdplnChangePct + exciseChangePct).toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 2: ENERGY CARRIERS (nośniki energii)
// Discrete model — tariffs change on specific dates
// ═══════════════════════════════════════════════════════════════

export interface TariffChange {
    dateFrom: string;       // YYYY-MM-DD
    dateTo: string;
    changePct: number;      // % change in energy tariff
    label: string;
    source: string;
}

// Manual tariff table — updated when URE announces changes
export const ENERGY_TARIFFS: TariffChange[] = [
    { dateFrom: '2024-07-01', dateTo: '2024-12-31', changePct: 29.0, label: 'Odmrożenie cen energii (częściowe)', source: 'Ustawa z 23.05.2024' },
    { dateFrom: '2025-01-01', dateTo: '2025-06-30', changePct: 0, label: 'Stabilizacja taryf G11', source: 'Taryfa URE XII.2024' },
    { dateFrom: '2025-07-01', dateTo: '2025-12-31', changePct: -5.0, label: 'Korekta taryfy G12', source: 'Taryfa URE VI.2025' },
    { dateFrom: '2026-01-01', dateTo: '2026-06-30', changePct: 3.5, label: 'Nowa taryfa URE 2026', source: 'Taryfa URE XII.2025 [MANUAL]' },
];

export function forecastEnergyMM(month: string): number {
    // Find if this month has a tariff change
    for (const t of ENERGY_TARIFFS) {
        const monthDate = new Date(month + '-01');
        const fromDate = new Date(t.dateFrom);
        // Change applies in the first month of the new tariff period
        if (monthDate.getFullYear() === fromDate.getFullYear() &&
            monthDate.getMonth() === fromDate.getMonth() &&
            t.changePct !== 0) {
            return t.changePct;
        }
    }
    return 0; // No tariff change this month
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 3: FOOD (żywność)
// CPI_food_MM ≈ γ₁ × ΔFAO(t-3) + γ₂ × ΔEURPLN(t-1) + seasonal(month)
// ═══════════════════════════════════════════════════════════════

const FOOD_BETA_FAO = 0.12;       // FAO Food Index M/M → PL food M/M (3m lag)
const FOOD_BETA_EUR = 0.08;       // EUR/PLN M/M → food M/M (1m lag)
const FOOD_RMSE = 0.6;            // pp M/M

// GUS historical seasonal M/M pattern for CP01 (2019-2025 average)
const FOOD_SEASONALITY: Record<number, number> = {
    1: 0.3, 2: 0.2, 3: 0.3, 4: 0.1, 5: -0.1, 6: -0.3,
    7: -0.5, 8: -0.3, 9: 0.2, 10: 0.3, 11: 0.4, 12: 0.4,
};

export function forecastFoodMM(
    faoChangeMM3: number,          // FAO index M/M % from 3 months ago
    eurplnChangeMM1: number,       // EUR/PLN M/M % from 1 month ago
    month: number,                 // 1-12
    shockAdjustment: number = 0    // manual: drought, ASF, etc.
): number {
    const seasonal = FOOD_SEASONALITY[month] ?? 0;
    return +(FOOD_BETA_FAO * faoChangeMM3 + FOOD_BETA_EUR * eurplnChangeMM1 + seasonal + shockAdjustment).toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 4: CORE CPI (inflacja bazowa, ex food & energy)
// Very inertial: Δcore_MM ≈ 0.7 × Δcore(t-1) + fundamentals
// ═══════════════════════════════════════════════════════════════

const CORE_INERTIA = 0.70;        // autoregression coefficient
const CORE_BETA_PPI = 0.04;       // PPI M/M → core M/M (3m lag)
const CORE_BETA_WAGES = 0.015;    // Real wages YoY → core M/M (2m lag)
const CORE_RMSE = 0.25;           // pp M/M

// Known excise hikes calendar (from MF roadmap)
const EXCISE_CALENDAR: Record<string, number> = {
    '2026-01': 0.05,  // tobacco/alcohol annual hike, ~0.05pp M/M contribution
    '2027-01': 0.05,
};

export function forecastCoreMM(
    prevCoreMM: number,            // previous month core M/M %
    ppiMM3: number,                // PPI M/M % from 3 months ago
    realWagesYoY2: number,         // Real wages YoY % from 2 months ago
    month: string,                 // YYYY-MM
): number {
    const excise = EXCISE_CALENDAR[month] ?? 0;
    const fundamentals = CORE_BETA_PPI * ppiMM3 + CORE_BETA_WAGES * realWagesYoY2 + excise;
    return +(CORE_INERTIA * prevCoreMM + (1 - CORE_INERTIA) * fundamentals / (1 - CORE_INERTIA)).toFixed(3);
    // Simplified: result ≈ 0.7 × prev + fundamentals
}

// ═══════════════════════════════════════════════════════════════
// AGGREGATION: blocks → CPI headline
// ═══════════════════════════════════════════════════════════════

export function aggregateCPIMM(
    fuelMM: number, energyMM: number, foodMM: number, coreMM: number
): number {
    return +(
        CPI_WEIGHTS.fuel * fuelMM +
        CPI_WEIGHTS.energy * energyMM +
        CPI_WEIGHTS.food * foodMM +
        CPI_WEIGHTS.core * coreMM
    ).toFixed(3);
}

// ═══════════════════════════════════════════════════════════════
// BASE EFFECT: compute R/R from index chain
// ═══════════════════════════════════════════════════════════════

export function computeYoY(
    currentIndex: number,
    index12MonthsAgo: number
): number {
    return +((currentIndex / index12MonthsAgo - 1) * 100).toFixed(2);
}

export function buildBaseEffectCalendar(
    historicalMM: { date: string; value: number }[]
): BaseEffectMonth[] {
    // The base effect for each future month is determined by what happened M-12
    const last12 = historicalMM.slice(-12);
    return last12.map(h => {
        const direction: 'high' | 'low' | 'neutral' =
            h.value > 0.4 ? 'high' : h.value < -0.1 ? 'low' : 'neutral';

        const impact = direction === 'high'
            ? 'Wysoka baza → spodziewany spadek R/R'
            : direction === 'low'
                ? 'Niska baza → spodziewany wzrost R/R'
                : 'Neutralna baza';

        // Compute the future month this base effect applies to
        const [y, m] = h.date.split('-').map(Number);
        const futureDate = new Date(y + 1, m - 1, 1);
        const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

        return {
            date: futureDateStr,
            label: `${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][futureDate.getMonth()]}.${futureDate.getFullYear()}`,
            baseValueMM: h.value,
            direction,
            impact,
        };
    });
}

// ═══════════════════════════════════════════════════════════════
// FAN CHART GENERATOR (probabilistic forecast)
// ═══════════════════════════════════════════════════════════════

const FORECAST_SIGMA = 0.35;  // base monthly forecast σ (pp)

export function generateFanChart(
    currentYoY: number,
    forecastedMM: number[],  // array of 12 future M/M forecasts
    historicalIndex: { date: string; value: number }[],
): FanChartPoint[] {
    const nbpTarget = 2.5;
    const points: FanChartPoint[] = [];

    // Get last 12 historical index values for base effect
    const recentIndex = historicalIndex.slice(-13);
    let currentIdx = recentIndex[recentIndex.length - 1]?.value ?? 150;

    for (let h = 0; h < Math.min(12, forecastedMM.length); h++) {
        // Project index forward
        currentIdx = currentIdx * (1 + forecastedMM[h] / 100);

        // Get index from 12 months before this future point
        const baseIdx = recentIndex[h]?.value ?? recentIndex[0]?.value ?? 140;
        const yoy = ((currentIdx / baseIdx) - 1) * 100;

        // Uncertainty grows with horizon: σ_h = σ × √h
        const sigma = FORECAST_SIGMA * Math.sqrt(h + 1);

        // Future month label
        const lastDate = historicalIndex[historicalIndex.length - 1]?.date ?? '2026-01';
        const [ly, lm] = lastDate.split('-').map(Number);
        const fDate = new Date(ly, lm - 1 + h + 1, 1);
        const fStr = `${fDate.getFullYear()}-${String(fDate.getMonth() + 1).padStart(2, '0')}`;

        points.push({
            date: fStr,
            p10: +(yoy - 1.28 * sigma).toFixed(2),
            p25: +(yoy - 0.67 * sigma).toFixed(2),
            median: +yoy.toFixed(2),
            p75: +(yoy + 0.67 * sigma).toFixed(2),
            p90: +(yoy + 1.28 * sigma).toFixed(2),
            nbpTarget,
        });
    }
    return points;
}

// ═══════════════════════════════════════════════════════════════
// ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════

export function detectAnomalies(
    blocks: { name: string; actual: number; forecast: number; rmse: number }[]
): AnomalyItem[] {
    return blocks
        .map(b => {
            const score = Math.abs(b.actual - b.forecast) / b.rmse;
            const level: AnomalyItem['level'] = score > 2.0 ? 'RED' : score > 1.5 ? 'YELLOW' : 'GREY';
            if (score < 1.0) return null;
            return {
                block: b.name,
                score: +score.toFixed(1),
                level,
                message: `${b.name}: odczyt ${b.actual >= 0 ? '+' : ''}${b.actual.toFixed(1)}% vs prognoza ${b.forecast >= 0 ? '+' : ''}${b.forecast.toFixed(1)}% (score=${score.toFixed(1)})`,
            };
        })
        .filter((a): a is AnomalyItem => a !== null);
}

// ═══════════════════════════════════════════════════════════════
// TREND ANALYSIS
// ═══════════════════════════════════════════════════════════════

function linearSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (i - xMean) * (values[i] - yMean);
        den += (i - xMean) ** 2;
    }
    return den === 0 ? 0 : num / den;
}

export function analyzeTrend(cpiMM: number[]): TrendResult {
    const slope3m = linearSlope(cpiMM.slice(-3));
    const slope6m = linearSlope(cpiMM.slice(-6));
    const momentum = cpiMM.length >= 2 ? cpiMM[cpiMM.length - 1] - cpiMM[cpiMM.length - 2] : 0;

    let direction: TrendResult['direction'];
    let label: string;
    let emoji: string;

    if (slope3m > 0.02 && slope6m > 0.02) { direction = 'UP'; label = 'TREND WZROSTOWY'; emoji = '📈'; }
    else if (slope3m < -0.02 && slope6m < -0.02) { direction = 'DOWN'; label = 'TREND SPADKOWY'; emoji = '📉'; }
    else if (slope3m > 0.02 && slope6m < -0.02) { direction = 'REVERSAL_UP'; label = 'ODBICIE'; emoji = '↗️'; }
    else { direction = 'REVERSAL_DOWN'; label = 'SPOWOLNIENIE'; emoji = '↘️'; }

    return { direction, label, emoji, momentum: +momentum.toFixed(2), slope3m: +slope3m.toFixed(3), slope6m: +slope6m.toFixed(3) };
}

// ═══════════════════════════════════════════════════════════════
// BLOCK RMSE (for confidence bars and anomaly detection)
// ═══════════════════════════════════════════════════════════════

export const BLOCK_RMSE = {
    fuel: FUEL_RMSE,
    energy: 0.5, // low — discrete, predictable
    food: FOOD_RMSE,
    core: CORE_RMSE,
    headline: 0.4, // aggregate
};

// ═══════════════════════════════════════════════════════════════
// MANUAL INPUTS TABLE (URE, excise, min wage)
// ═══════════════════════════════════════════════════════════════

export const MANUAL_INPUTS = {
    minWage: [
        { date: '2025-01-01', grossPLN: 4666, source: 'Dz.U. 2024 poz. 1286' },
        { date: '2026-01-01', grossPLN: 4750, source: 'Dz.U. 2025 [MANUAL — SPRAWDZIĆ]' },
    ],
    excisePb95: { rate2026: 1599, unit: 'PLN/1000l', source: 'Dz.U.' },
    exciseON: { rate2026: 1171, unit: 'PLN/1000l', source: 'Dz.U.' },
    vat: 0.23,
    emissionFee: 0.08, // PLN/l
};

// ═══════════════════════════════════════════════════════════════
// CONSENSUS DATA (for comparison)
// ═══════════════════════════════════════════════════════════════

export const CPI_CONSENSUS = {
    nbpProjection: { cpi2025: 4.9, cpi2026: 3.5, date: 'XI.2025', source: 'Raport o inflacji NBP' },
    bloomberg: { cpi2025: 3.7, cpi2026: 2.5, source: 'Bloomberg ECFC, II.2026' },
    focusEconomics: { cpi2025: 3.8, cpi2026: 2.8, source: 'Focus Economics, I.2026' },
};
