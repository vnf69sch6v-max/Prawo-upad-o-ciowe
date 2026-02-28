// Leading Indicators — GDP Nowcasting (Fund-Grade, Polish-calibrated)
// Polish OLS: GDP_PL = 0.542 × PMI_quarterly_avg − 24.01
// R² = 0.349, RMSE = 3.20pp, N = 24 quarters (2020Q1–2025Q4)

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface IndicatorInput {
    name: string;
    label: string;
    value: number;
    prevValue: number | null;   // previous month for MoM
    weight: number;
    loading?: boolean;
    lastUpdated: string;        // e.g. "XII.2025"
}

export interface NowcastResult {
    pmiNowcast: number;
    compositeNowcast: number;
    confidenceInterval: { low1s: number; high1s: number; low2s: number; high2s: number };
    contributions: ContributionItem[];
    cyclePhase: CyclePhase;
    cliValue: number;
    modelQuality: { r2: number; rmse: number; n: number };
    disagreement: 'LOW' | 'MED' | 'HIGH';
    disagreementPP: number;
}

export interface ContributionItem {
    name: string;
    label: string;
    value: number;
    prevValue: number | null;
    gdpContrib: number;
    weight: number;
    signal: 'green' | 'yellow' | 'red';
    lastUpdated: string;
}

export type CyclePhase = 'RECOVERY' | 'EXPANSION' | 'SLOWDOWN' | 'CONTRACTION';

export interface BacktestPoint {
    q: string;
    pmi: number;
    actual: number;
    predicted: number;
    error: number;
}

// ═══════════════════════════════════════════════════════════════
// POLISH OLS REGRESSION COEFFICIENTS
// Source: Our own OLS on PMI_DATA_PL vs GDP_QUARTERLY_PL
// Sample: 2020Q1–2025Q4, N=24
// No arbitrary adjustments — β and α are from Polish data
// ═══════════════════════════════════════════════════════════════

const PL_BETA = 0.5421;       // slope: each PMI point ≈ 0.54pp GDP
const PL_ALPHA = -24.0064;    // intercept
const PL_R2 = 0.3485;         // R² — only 35% variance explained
const PL_RMSE = 3.20;         // in-sample RMSE (pp)
const PL_SE_PRED = 3.27;      // SE of prediction at PMI=48.4
const PL_N = 24;              // sample size
const BACKTEST_RMSE = 3.80;   // rolling 8-qt out-of-sample RMSE

// ═══════════════════════════════════════════════════════════════
// PMI → GDP (POLISH CALIBRATION)
// ═══════════════════════════════════════════════════════════════

export function pmiToGDP(pmi: number): number {
    return +(PL_BETA * pmi + PL_ALPHA).toFixed(2);
}

export function gdpToPMI(gdp: number): number {
    return +((gdp - PL_ALPHA) / PL_BETA).toFixed(1);
}

// Confidence interval for a given PMI prediction
export function predictionCI(pmi: number): { point: number; low1s: number; high1s: number; low2s: number; high2s: number } {
    const point = pmiToGDP(pmi);
    return {
        point,
        low1s: +(point - PL_SE_PRED).toFixed(2),
        high1s: +(point + PL_SE_PRED).toFixed(2),
        low2s: +(point - 1.96 * PL_SE_PRED).toFixed(2),
        high2s: +(point + 1.96 * PL_SE_PRED).toFixed(2),
    };
}

// ═══════════════════════════════════════════════════════════════
// INDIVIDUAL INDICATOR → GDP CONTRIBUTION
// ═══════════════════════════════════════════════════════════════

function indicatorToGDP(name: string, value: number): number {
    if (name === 'PMI') return pmiToGDP(value);
    if (name === 'IP') return +(value / 1.5).toFixed(2);
    if (name === 'RETAIL') return +(value / 1.2 * 0.6).toFixed(2);
    if (name === 'YIELD') return +(value > 0 ? 3.0 + value * 0.3 : -1.0 + value * 2.0).toFixed(2);
    if (name === 'WAGES') return +(value * 0.4).toFixed(2);
    return 0;
}

function getSignal(name: string, value: number): 'green' | 'yellow' | 'red' {
    if (name === 'PMI') return value >= 50 ? 'green' : value >= 47 ? 'yellow' : 'red';
    if (name === 'IP') return value > 3 ? 'green' : value > 0 ? 'yellow' : 'red';
    if (name === 'RETAIL') return value > 3 ? 'green' : value > 0 ? 'yellow' : 'red';
    if (name === 'YIELD') return value > 0.5 ? 'green' : value > -0.5 ? 'yellow' : 'red';
    if (name === 'WAGES') return value > 5 ? 'green' : value > 2 ? 'yellow' : 'red';
    return 'yellow';
}

// ═══════════════════════════════════════════════════════════════
// COMPOSITE NOWCAST
// ═══════════════════════════════════════════════════════════════

export function compositeNowcast(indicators: IndicatorInput[], consensusGDP: number): NowcastResult {
    const ready = indicators.filter(i => !i.loading);
    const totalWeight = ready.reduce((s, i) => s + i.weight, 0);

    const contributions: ContributionItem[] = ready.map(ind => ({
        name: ind.name,
        label: ind.label,
        value: ind.value,
        prevValue: ind.prevValue,
        gdpContrib: indicatorToGDP(ind.name, ind.value),
        weight: ind.weight,
        signal: getSignal(ind.name, ind.value),
        lastUpdated: ind.lastUpdated,
    }));

    const compositeGDP = +(contributions.reduce((s, c) => s + c.gdpContrib * (c.weight / totalWeight), 0)).toFixed(2);

    const pmiInd = indicators.find(i => i.name === 'PMI');
    const pmiNowcast = pmiInd ? pmiToGDP(pmiInd.value) : compositeGDP;

    const ci = predictionCI(pmiInd?.value ?? 48.4);
    const cliValue = Math.max(0, Math.min(100, 50 + (compositeGDP - 3.0) * 10));
    const cyclePhase = classifyCycle(cliValue, compositeGDP);

    // Model disagreement: spread between PMI Bridge, Composite, and Consensus
    const models = [pmiNowcast, compositeGDP, consensusGDP];
    const spread = Math.max(...models) - Math.min(...models);
    const disagreement: 'LOW' | 'MED' | 'HIGH' = spread < 1.0 ? 'LOW' : spread < 2.5 ? 'MED' : 'HIGH';

    return {
        pmiNowcast: +pmiNowcast.toFixed(2),
        compositeNowcast: compositeGDP,
        confidenceInterval: { low1s: ci.low1s, high1s: ci.high1s, low2s: ci.low2s, high2s: ci.high2s },
        contributions,
        cyclePhase,
        cliValue: +cliValue.toFixed(1),
        modelQuality: { r2: PL_R2, rmse: PL_RMSE, n: PL_N },
        disagreement,
        disagreementPP: +spread.toFixed(1),
    };
}

function classifyCycle(cli: number, gdp: number): CyclePhase {
    const aboveTrend = cli >= 50;
    const positive = gdp > 2.0;
    if (aboveTrend && positive) return 'EXPANSION';
    if (!aboveTrend && positive) return 'RECOVERY';
    if (aboveTrend && !positive) return 'SLOWDOWN';
    return 'CONTRACTION';
}

// ═══════════════════════════════════════════════════════════════
// BACKTEST TRACK RECORD
// Pre-computed rolling 8-qt OLS results
// ═══════════════════════════════════════════════════════════════

export const BACKTEST_RESULTS: BacktestPoint[] = [
    { q: '2022Q1', pmi: 53.2, actual: 8.6, predicted: 3.3, error: -5.3 },
    { q: '2022Q2', pmi: 48.4, actual: 5.5, predicted: -1.3, error: -6.8 },
    { q: '2022Q3', pmi: 42.0, actual: 3.6, predicted: -6.6, error: -10.2 },
    { q: '2022Q4', pmi: 43.7, actual: 0.3, predicted: 2.1, error: 1.8 },
    { q: '2023Q1', pmi: 48.1, actual: -0.3, predicted: 4.0, error: 4.3 },
    { q: '2023Q2', pmi: 46.4, actual: -0.6, predicted: 3.1, error: 3.7 },
    { q: '2023Q3', pmi: 43.6, actual: 0.5, predicted: 1.2, error: 0.7 },
    { q: '2023Q4', pmi: 46.9, actual: 1.5, predicted: 2.8, error: 1.3 },
    { q: '2024Q1', pmi: 47.7, actual: 1.9, predicted: 3.0, error: 1.1 },
    { q: '2024Q2', pmi: 45.3, actual: 3.2, predicted: 1.5, error: -1.7 },
    { q: '2024Q3', pmi: 47.9, actual: 3.2, predicted: 0.6, error: -2.6 },
    { q: '2024Q4', pmi: 48.8, actual: 3.5, predicted: 1.6, error: -1.9 },
    { q: '2025Q1', pmi: 50.0, actual: 3.4, predicted: 2.4, error: -1.0 },
    { q: '2025Q2', pmi: 49.8, actual: 3.3, predicted: 3.3, error: 0.0 },
    { q: '2025Q3', pmi: 48.6, actual: 3.8, predicted: 3.0, error: -0.8 },
    { q: '2025Q4', pmi: 48.8, actual: 3.6, predicted: 3.1, error: -0.5 },
];

export const BACKTEST_STATS = {
    mae: 2.72,
    rmse: BACKTEST_RMSE,
    n: BACKTEST_RESULTS.length,
    worstQ: '2022Q3',
    worstError: -10.2,
};

// ═══════════════════════════════════════════════════════════════
// PMI HISTORICAL DISTRIBUTION (for scenario probability)
// ═══════════════════════════════════════════════════════════════

export function pmiProbability(threshold: number, pmiHistory: { value: number }[]): number {
    const below = pmiHistory.filter(p => p.value <= threshold).length;
    return +(below / pmiHistory.length * 100).toFixed(0);
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO TABLE (POLISH-CALIBRATED)
// ═══════════════════════════════════════════════════════════════

export function pmiScenarioTable(pmiHistory: { value: number }[]): { pmi: number; gdp: number; label: string; ci1s: string; prob: number }[] {
    return [
        { pmi: 40, gdp: pmiToGDP(40), label: 'Głęboka recesja', ci1s: `${pmiToGDP(40) - PL_SE_PRED > 0 ? '+' : ''}${(pmiToGDP(40) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(40) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(40, pmiHistory) },
        { pmi: 42, gdp: pmiToGDP(42), label: 'Recesja', ci1s: `${(pmiToGDP(42) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(42) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(42, pmiHistory) },
        { pmi: 45, gdp: pmiToGDP(45), label: 'Stagnacja', ci1s: `${(pmiToGDP(45) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(45) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(45, pmiHistory) },
        { pmi: 48, gdp: pmiToGDP(48), label: 'Spowolnienie', ci1s: `${(pmiToGDP(48) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(48) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(48, pmiHistory) },
        { pmi: 48.4, gdp: pmiToGDP(48.4), label: 'Obecny (XII.2025)', ci1s: `${(pmiToGDP(48.4) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(48.4) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(48.4, pmiHistory) },
        { pmi: 50, gdp: pmiToGDP(50), label: 'Neutralny', ci1s: `${(pmiToGDP(50) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(50) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(50, pmiHistory) },
        { pmi: 52, gdp: pmiToGDP(52), label: 'Ożywienie', ci1s: `${(pmiToGDP(52) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(52) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(52, pmiHistory) },
        { pmi: 55, gdp: pmiToGDP(55), label: 'Ekspansja', ci1s: `${(pmiToGDP(55) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(55) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(55, pmiHistory) },
        { pmi: 58, gdp: pmiToGDP(58), label: 'Boom', ci1s: `${(pmiToGDP(58) - PL_SE_PRED).toFixed(1)} do ${(pmiToGDP(58) + PL_SE_PRED).toFixed(1)}`, prob: pmiProbability(58, pmiHistory) },
    ];
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL PMI vs GDP — for dual-axis chart
// ═══════════════════════════════════════════════════════════════

export interface PMIvsGDPPoint {
    date: string;
    pmi: number;
    gdp: number | null;
    pmiGDPEstimate: number;
    ciLow: number;
    ciHigh: number;
}

export function buildPMIvsGDP(
    pmiData: { date: string; value: number }[],
    gdpData: { q: string; value: number }[]
): PMIvsGDPPoint[] {
    const gdpMap = new Map<string, number>();
    for (const g of gdpData) {
        const [year, qNum] = [g.q.slice(0, 4), parseInt(g.q.slice(5))];
        const startMonth = (qNum - 1) * 3 + 1;
        for (let m = startMonth; m < startMonth + 3; m++) {
            const key = `${year}-${String(m).padStart(2, '0')}`;
            gdpMap.set(key, g.value);
        }
    }

    return pmiData.map(p => {
        const est = pmiToGDP(p.value);
        return {
            date: p.date,
            pmi: p.value,
            gdp: gdpMap.get(p.date) ?? null,
            pmiGDPEstimate: est,
            ciLow: +(est - PL_SE_PRED).toFixed(1),
            ciHigh: +(est + PL_SE_PRED).toFixed(1),
        };
    });
}

// Bloomberg consensus (hardcoded from ECFC)
export const BLOOMBERG_CONSENSUS = {
    gdp2025: 3.6,
    gdp2026: 3.1,
    cpi2025: 3.7,
    cpi2026: 2.5,
    rate2025: 4.00,
    rate2026: 3.89,
    source: 'Bloomberg ECFC, II.2026',
};
