// CPI Inflation Forecaster PRO — Bottom-Up Decomposition
// 4 blocks: Fuels, Energy, Food, Core → CPI Headline
// Parameters calibrated from NBP NECMOD 2012 (Greszta et al.)
// Source: "Reestymacja kwartalnego modelu gospodarki polskiej NECMOD 2012"

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
    alertIfAfter: '2027-03-15', // alert to update weights for COICOP 2018
};

// ═══════════════════════════════════════════════════════════════
// BLOCK 1: FUELS (paliwa silnikowe)
// NECMOD eq.6: pass-through ropy do CPI energii = 0.03/Q
// Fuel share in energy basket ≈ 33% → β_fuel ≈ 0.03/0.33 ≈ 0.09/Q ≈ 0.03/M
// ═══════════════════════════════════════════════════════════════

const FUEL_BETA_BRENT_PLN = 0.03; // NECMOD: pass-through Brent_PLN → fuel CPI (monthly)
const FUEL_INERTIA = 0.08;        // NECMOD eq.6: lag-1 inertia
const FUEL_RMSE = 1.2;            // pp M/M (lower with NECMOD calibration)

export function forecastFuelMM(
    brentPLNChangePct: number,     // Brent in PLN M/M % (= ΔBrent_USD + ΔUSDPLN)
    prevFuelMM: number = 0,        // previous month fuel M/M
    exciseChangePct: number = 0    // one-off excise changes
): number {
    return +(FUEL_BETA_BRENT_PLN * brentPLNChangePct + FUEL_INERTIA * prevFuelMM + exciseChangePct).toFixed(2);
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
// BLOCK 3: FOOD (żywność) — NECMOD eq.7-8
// Key insight: world food prices only 8% weight, 92% domestic!
// Inertia: 0.11 lag1 + 0.18 lag2, INF_TARGET anchor 0.24/Q
// FAO pass-through: 0.075/Q ≈ 0.025/M (lower than spec v1.0!)
// ECM speed: -0.46/Q ≈ -0.15/M (very fast correction)
// ═══════════════════════════════════════════════════════════════

const FOOD_BETA_FAO = 0.025;      // NECMOD: 0.075/Q → 0.025/M pass-through
const FOOD_INERTIA_L1 = 0.11;     // NECMOD eq.8: lag-1
const FOOD_INERTIA_L2 = 0.18;     // NECMOD eq.8: lag-2
const FOOD_ANCHOR = 0.08;         // NECMOD: 0.24/Q ÷ 3 → INF_TARGET anchor
const FOOD_ECM = -0.15;           // NECMOD: -0.46/Q ÷ 3 → monthly ECM
const FOOD_VAT_PT = 0.35;         // NECMOD: VAT pass-through
const FOOD_RMSE = 0.5;            // pp M/M
const INF_TARGET_MONTHLY = 0.206; // log(1.025)/12 × 100 ≈ 0.206% M/M

// GUS historical seasonal M/M pattern for CP01 (2019-2025 average)
const FOOD_SEASONALITY: Record<number, number> = {
    1: 0.3, 2: 0.2, 3: 0.3, 4: 0.1, 5: -0.1, 6: -0.3,
    7: -0.5, 8: -0.3, 9: 0.2, 10: 0.3, 11: 0.4, 12: 0.4,
};

export function forecastFoodMM(
    faoPLNChangeMM: number,        // FAO×USDPLN M/M % (current, not lagged per NECMOD)
    prevFoodMM: number,            // food M/M t-1
    prevFoodMM2: number,           // food M/M t-2
    month: number,                 // 1-12
    foodGap: number = 0,           // deviation from equilibrium
    vatChange: number = 0,         // one-off VAT change
): number {
    const seasonal = FOOD_SEASONALITY[month] ?? 0;
    return +(
        FOOD_BETA_FAO * faoPLNChangeMM +
        FOOD_INERTIA_L1 * prevFoodMM +
        FOOD_INERTIA_L2 * prevFoodMM2 +
        FOOD_ANCHOR * INF_TARGET_MONTHLY +
        FOOD_ECM * foodGap +
        FOOD_VAT_PT * vatChange +
        seasonal
    ).toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 4: CORE CPI (inflacja bazowa) — NECMOD eq.1-2
// R² = 0.94 (!) on 1996q4-2011q4
// Key: 69% labor costs, 31% import prices
// Inertia: 0.52 (NOT 0.70 as in v1.0!)
// INF_TARGET anchor: 0.20/Q ÷ 3 ≈ 0.07/M
// Forward-looking expectations: 0.14
// ECM: -0.06/Q ÷ 3 ≈ -0.02/M
// ═══════════════════════════════════════════════════════════════

const CORE_INERTIA = 0.52;        // NECMOD eq.2: autoregression (was 0.70!)
const CORE_ANCHOR = 0.07;         // NECMOD: 0.20/Q ÷ 3 → INF_TARGET anchor
const CORE_EXPECT = 0.14;         // NECMOD: forward-looking expectations
const CORE_WAGES = 0.04;          // NECMOD: 0.11/Q ÷ 3 → labor costs
const CORE_IMPORT = 0.01;         // NECMOD: 0.03/Q ÷ 3 → import prices
const CORE_ECM = -0.02;           // NECMOD: -0.06/Q ÷ 3 → error correction
const CORE_VAT_PT = 0.30;         // NECMOD: VAT pass-through
const CORE_RMSE = 0.20;           // pp M/M (R²=0.94 → lower RMSE)

// Known excise hikes calendar (from MF roadmap)
const EXCISE_CALENDAR: Record<string, number> = {
    '2026-01': 0.05,  // tobacco/alcohol annual hike, ~0.05pp M/M contribution
    '2027-01': 0.05,
};

export function forecastCoreMM(
    prevCoreMM: number,            // core M/M t-1
    wagesYoY: number,              // nominal wages YoY % (lag 2M)
    importPriceMM: number,         // import price M/M % (lag 1Q ≈ 3M)
    coreGap: number = 0,           // deviation from long-run equilibrium
    month: string = '',            // YYYY-MM for excise calendar
    vatChange: number = 0,         // one-off VAT change
): number {
    const excise = EXCISE_CALENDAR[month] ?? 0;
    // Expected next-period core: naive proxy = INF_TARGET_MONTHLY
    // In full NECMOD this would be model-consistent expectations
    const expectedNextCore = INF_TARGET_MONTHLY;
    return +(
        CORE_ANCHOR * INF_TARGET_MONTHLY +              // anchor to 2.5% target
        CORE_INERTIA * prevCoreMM +                     // autoregression (NECMOD: 0.52)
        CORE_EXPECT * expectedNextCore +                // forward-looking expectations (NECMOD eq.2: 0.14)
        CORE_WAGES * (wagesYoY / 12) +                  // labor cost pass-through
        CORE_IMPORT * importPriceMM +                   // import prices
        CORE_ECM * coreGap +                            // error correction
        CORE_VAT_PT * vatChange +                       // VAT pass-through
        excise
    ).toFixed(3);
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

// ═══════════════════════════════════════════════════════════════
// IMPLIED NBP RATE (Taylor Rule) — NECMOD eq.36
// I_3M(t) = 0.88 × I_3M(t-1) + (1-0.88) × [r_eq + π(t+1) + 0.77×(π-π*) + 0.40×GAP]
// R² = 0.98 (!), sample 2001q4-2011q4
// ═══════════════════════════════════════════════════════════════

const TAYLOR_SMOOTHING = 0.88;     // NECMOD: rate smoothing
const TAYLOR_INFLATION = 0.77;     // NECMOD: reaction to inflation gap
const TAYLOR_GAP = 0.40;           // NECMOD: reaction to output gap
const R_EQ = 2.0;                  // equilibrium real rate (manual, ~1.5-2.5%)
const INF_TARGET = 2.5;            // NBP inflation target

export interface ImpliedRate {
    impliedRate: number;           // NECMOD-implied WIBOR 3M
    currentRate: number;           // actual WIBOR 3M
    gap: number;                   // implied - current
    direction: 'CUT' | 'HIKE' | 'HOLD';
    label: string;
}

export function impliedNBPRate(
    currentWIBOR3M: number,        // current WIBOR 3M %
    cpiForecastYoY: number,        // our CPI forecast R/R %
    outputGap: number = 0,         // output gap % (manual/estimated)
): ImpliedRate {
    const optimalRate = R_EQ + cpiForecastYoY + TAYLOR_INFLATION * (cpiForecastYoY - INF_TARGET) + TAYLOR_GAP * outputGap;
    const implied = +(TAYLOR_SMOOTHING * currentWIBOR3M + (1 - TAYLOR_SMOOTHING) * optimalRate).toFixed(2);
    const gap = +(implied - currentWIBOR3M).toFixed(2);
    const direction: ImpliedRate['direction'] = gap > 0.25 ? 'HIKE' : gap < -0.25 ? 'CUT' : 'HOLD';
    const label = direction === 'HIKE' ? `Podwyżka implikowana (+${gap}pp)` :
        direction === 'CUT' ? `Obniżka implikowana (${gap}pp)` :
            'Stopy odpowiednie (HOLD)';
    return { impliedRate: implied, currentRate: currentWIBOR3M, gap, direction, label };
}

// ═══════════════════════════════════════════════════════════════
// NECMOD IMPULSE RESPONSE BENCHMARKS (for model validation)
// ═══════════════════════════════════════════════════════════════

export const NECMOD_IRF = {
    oilShock10pct: { cpiPeak: 0.29, peakQuarter: 5, energyCPIPeak: 1.2 },
    foodShock10pct: { cpiPeak: 0.20, peakQuarter: 2, foodCPIPeak: 0.9 },
    fxApprec10pct: { cpiPeak: -2.0, peakQuarter: 3, erpt: 0.20 },
    monetaryShock100bp: { cpiPeak: -0.41, gdpPeak: -0.53, sacrificeRatio: 1.3 },
};
