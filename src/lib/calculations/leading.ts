// Leading Indicators — GDP Nowcasting (V3 Fund-Grade)
// Multiple OLS: GDP = 7.12 − 0.119×PMI + 0.240×IP + 0.220×RetailReal
// R² = 74.7%, Adj.R² = 70.9%, RMSE = 2.09pp, N = 24

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface IndicatorInput {
    name: string;
    label: string;
    value: number;
    prevValue: number | null;
    weight: number;       // normalized coefficient weight
    rawBeta: number;      // raw OLS β
    loading?: boolean;
    lastUpdated: string;
    isDeflated?: boolean; // true if value is real (deflated by CPI)
    fallback?: boolean;   // true if carry-over data
}

export interface NowcastResult {
    multiModelGDP: number;          // Multiple OLS prediction
    pmiBridgeGDP: number;           // Single-var PMI bridge
    confidenceInterval: { low1s: number; high1s: number; low2s: number; high2s: number };
    contributions: ContributionItem[];
    cyclePhase: CyclePhase;
    cliValue: number;
    modelQuality: { r2: number; adjR2: number; rmse: number; n: number; k: number };
    disagreement: 'LOW' | 'MED' | 'HIGH';
    disagreementPP: number;
    residualsHistory: { q: string; actual: number; predicted: number; error: number }[];
}

export interface ContributionItem {
    name: string;
    label: string;
    value: number;
    prevValue: number | null;
    gdpContrib: number;     // β × value contribution to GDP
    weightPct: number;      // % of total explanation
    signal: 'green' | 'yellow' | 'red';
    lastUpdated: string;
    isDeflated?: boolean;
    fallback?: boolean;
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
// MULTIPLE OLS COEFFICIENTS (from Polish data)
// GDP_PL = α + β₁×PMI + β₂×IP + β₃×RetailReal
// Sample: 2020Q1–2025Q4, N=24 quarters
// All weights from regression, ZERO ad-hoc adjustments
// ═══════════════════════════════════════════════════════════════

// Best model by AIC: PMI + IP + RetailReal
const M_ALPHA = 7.1223;       // intercept
const M_BETA_PMI = -0.1186;   // PMI: NEGATIVE and insignificant (t=-0.65)
const M_BETA_IP = 0.2400;     // IP: positive (t=1.82, near significant)
const M_BETA_RETAIL = 0.2202; // RetailReal: SIGNIFICANT (t=2.10) ✅

const M_R2 = 0.747;
const M_ADJ_R2 = 0.709;
const M_RMSE = 2.09;
const M_N = 24;
const M_K = 3;

// Single-variable PMI bridge (for comparison)
const PMI_ALPHA = -24.0064;
const PMI_BETA = 0.5421;
const PMI_R2 = 0.349;
const PMI_RMSE = 3.20;

// Rolling backtest stats (V3 Multiple OLS)
const BT_MAE = 1.58;
const BT_RMSE = 2.59;

// ═══════════════════════════════════════════════════════════════
// GDP PREDICTIONS
// ═══════════════════════════════════════════════════════════════

export function multiModelGDP(pmi: number, ip: number, retailReal: number): number {
    return +(M_ALPHA + M_BETA_PMI * pmi + M_BETA_IP * ip + M_BETA_RETAIL * retailReal).toFixed(2);
}

export function pmiToGDP(pmi: number): number {
    return +(PMI_BETA * pmi + PMI_ALPHA).toFixed(2);
}

export function predictionCI(gdpEst: number): { low1s: number; high1s: number; low2s: number; high2s: number } {
    return {
        low1s: +(gdpEst - M_RMSE).toFixed(2),
        high1s: +(gdpEst + M_RMSE).toFixed(2),
        low2s: +(gdpEst - 1.96 * M_RMSE).toFixed(2),
        high2s: +(gdpEst + 1.96 * M_RMSE).toFixed(2),
    };
}

// ═══════════════════════════════════════════════════════════════
// SIGNAL CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

function getSignal(name: string, value: number): 'green' | 'yellow' | 'red' {
    if (name === 'PMI') return value >= 50 ? 'green' : value >= 47 ? 'yellow' : 'red';
    if (name === 'IP') return value > 3 ? 'green' : value > 0 ? 'yellow' : 'red';
    if (name === 'RETAIL_REAL') return value > 2 ? 'green' : value > 0 ? 'yellow' : 'red';
    if (name === 'YIELD') return value > 0.5 ? 'green' : value > -0.5 ? 'yellow' : 'red';
    return 'yellow';
}

// ═══════════════════════════════════════════════════════════════
// COMPOSITE NOWCAST (V3 Multiple OLS)
// ═══════════════════════════════════════════════════════════════

export function compositeNowcast(indicators: IndicatorInput[], consensusGDP: number): NowcastResult {
    const pmiInd = indicators.find(i => i.name === 'PMI');
    const ipInd = indicators.find(i => i.name === 'IP');
    const retailInd = indicators.find(i => i.name === 'RETAIL_REAL');

    const pmiVal = pmiInd?.value ?? 48.4;
    const ipVal = ipInd?.value ?? 2.0;
    const retailVal = retailInd?.value ?? 0.3;

    // Multiple OLS prediction
    const multiGDP = multiModelGDP(pmiVal, ipVal, retailVal);
    const pmiBridge = pmiToGDP(pmiVal);

    // Individual contributions: β × x_i
    const pmiContrib = +(M_BETA_PMI * pmiVal).toFixed(2);
    const ipContrib = +(M_BETA_IP * ipVal).toFixed(2);
    const retailContrib = +(M_BETA_RETAIL * retailVal).toFixed(2);
    const totalVarContrib = Math.abs(pmiContrib) + Math.abs(ipContrib) + Math.abs(retailContrib);

    const contributions: ContributionItem[] = indicators.map(ind => {
        let beta = 0, contrib = 0;
        if (ind.name === 'PMI') { beta = M_BETA_PMI; contrib = pmiContrib; }
        else if (ind.name === 'IP') { beta = M_BETA_IP; contrib = ipContrib; }
        else if (ind.name === 'RETAIL_REAL') { beta = M_BETA_RETAIL; contrib = retailContrib; }

        const weightPct = totalVarContrib > 0 ? Math.abs(contrib) / totalVarContrib * 100 : 0;

        return {
            name: ind.name,
            label: ind.label,
            value: ind.value,
            prevValue: ind.prevValue,
            gdpContrib: contrib,
            weightPct: +weightPct.toFixed(0),
            signal: getSignal(ind.name, ind.value),
            lastUpdated: ind.lastUpdated,
            isDeflated: ind.isDeflated,
            fallback: ind.fallback,
        };
    });

    const ci = predictionCI(multiGDP);
    const cliValue = Math.max(0, Math.min(100, 50 + (multiGDP - 3.0) * 10));
    const cyclePhase = classifyCycle(cliValue, multiGDP);

    // Model disagreement
    const models = [multiGDP, pmiBridge, consensusGDP];
    const spread = Math.max(...models) - Math.min(...models);
    const disagreement: 'LOW' | 'MED' | 'HIGH' = spread < 1.0 ? 'LOW' : spread < 2.5 ? 'MED' : 'HIGH';

    return {
        multiModelGDP: multiGDP,
        pmiBridgeGDP: pmiBridge,
        confidenceInterval: ci,
        contributions,
        cyclePhase,
        cliValue: +cliValue.toFixed(1),
        modelQuality: { r2: M_R2, adjR2: M_ADJ_R2, rmse: M_RMSE, n: M_N, k: M_K },
        disagreement,
        disagreementPP: +spread.toFixed(1),
        residualsHistory: INSAMPLE_RESIDUALS,
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
// IN-SAMPLE RESIDUALS (for residuals chart)
// ═══════════════════════════════════════════════════════════════

export const INSAMPLE_RESIDUALS = [
    { q: '2020Q1', actual: 1.7, predicted: 1.0, error: 0.7 },
    { q: '2020Q2', actual: -8.0, predicted: -5.4, error: -2.6 },
    { q: '2020Q3', actual: -1.5, predicted: 1.2, error: -2.7 },
    { q: '2020Q4', actual: -2.7, predicted: 2.5, error: -5.2 },
    { q: '2021Q1', actual: -0.9, predicted: 3.2, error: -4.1 },
    { q: '2021Q2', actual: 10.8, predicted: 10.7, error: 0.1 },
    { q: '2021Q3', actual: 5.3, predicted: 5.0, error: 0.3 },
    { q: '2021Q4', actual: 7.3, predicted: 5.7, error: 1.6 },
    { q: '2022Q1', actual: 8.6, predicted: 7.8, error: 0.8 },
    { q: '2022Q2', actual: 5.5, predicted: 6.2, error: -0.7 },
    { q: '2022Q3', actual: 3.6, predicted: 5.0, error: -1.4 },
    { q: '2022Q4', actual: 0.3, predicted: 1.8, error: -1.5 },
    { q: '2023Q1', actual: -0.3, predicted: -1.7, error: 1.4 },
    { q: '2023Q2', actual: -0.6, predicted: -2.3, error: 1.7 },
    { q: '2023Q3', actual: 0.5, predicted: -1.0, error: 1.5 },
    { q: '2023Q4', actual: 1.5, predicted: 0.6, error: 0.9 },
    { q: '2024Q1', actual: 1.9, predicted: 2.2, error: -0.3 },
    { q: '2024Q2', actual: 3.2, predicted: 2.1, error: 1.1 },
    { q: '2024Q3', actual: 3.2, predicted: 1.6, error: 1.6 },
    { q: '2024Q4', actual: 3.5, predicted: 1.9, error: 1.6 },
    { q: '2025Q1', actual: 3.4, predicted: 2.1, error: 1.3 },
    { q: '2025Q2', actual: 3.3, predicted: 2.4, error: 0.9 },
    { q: '2025Q3', actual: 3.8, predicted: 2.2, error: 1.6 },
    { q: '2025Q4', actual: 3.6, predicted: 2.1, error: 1.5 },
];

// ═══════════════════════════════════════════════════════════════
// ROLLING BACKTEST (8-qt window, Multiple OLS)
// ═══════════════════════════════════════════════════════════════

export const BACKTEST_RESULTS: BacktestPoint[] = [
    { q: '2022Q1', pmi: 53.2, actual: 8.6, predicted: 10.1, error: 1.5 },
    { q: '2022Q2', pmi: 48.4, actual: 5.5, predicted: 7.9, error: 2.4 },
    { q: '2022Q3', pmi: 42.0, actual: 3.6, predicted: -1.9, error: -5.5 },
    { q: '2022Q4', pmi: 43.7, actual: 0.3, predicted: -0.8, error: -1.1 },
    { q: '2023Q1', pmi: 48.1, actual: -0.3, predicted: -8.0, error: -7.7 },
    { q: '2023Q2', pmi: 46.4, actual: -0.6, predicted: -1.4, error: -0.8 },
    { q: '2023Q3', pmi: 43.6, actual: 0.5, predicted: -0.3, error: -0.8 },
    { q: '2023Q4', pmi: 46.9, actual: 1.5, predicted: 1.3, error: -0.2 },
    { q: '2024Q1', pmi: 47.7, actual: 1.9, predicted: 1.4, error: -0.5 },
    { q: '2024Q2', pmi: 45.3, actual: 3.2, predicted: 1.1, error: -2.1 },
    { q: '2024Q3', pmi: 47.9, actual: 3.2, predicted: 1.9, error: -1.3 },
    { q: '2024Q4', pmi: 48.8, actual: 3.5, predicted: 3.3, error: -0.2 },
    { q: '2025Q1', pmi: 50.0, actual: 3.4, predicted: 3.3, error: -0.1 },
    { q: '2025Q2', pmi: 49.8, actual: 3.3, predicted: 3.8, error: 0.5 },
    { q: '2025Q3', pmi: 48.6, actual: 3.8, predicted: 3.4, error: -0.4 },
    { q: '2025Q4', pmi: 48.8, actual: 3.6, predicted: 3.5, error: -0.1 },
];

export const BACKTEST_STATS = {
    mae: BT_MAE,
    rmse: BT_RMSE,
    n: BACKTEST_RESULTS.length,
    worstQ: '2023Q1',
    worstError: -7.7,
};

// ═══════════════════════════════════════════════════════════════
// PMI SCENARIO TABLE
// ═══════════════════════════════════════════════════════════════

export function pmiProbability(threshold: number, pmiHistory: { value: number }[]): number {
    return +(pmiHistory.filter(p => p.value <= threshold).length / pmiHistory.length * 100).toFixed(0);
}

export function pmiScenarioTable(pmiHistory: { value: number }[]): {
    pmi: number; gdpPMI: number; gdpMulti: number; label: string; ci1s: string; prob: number;
}[] {
    // For scenario, we fix IP=3.0, RetailReal=0.3 (current) and vary PMI
    const ipFixed = 3.0, retailFixed = 0.3;
    return [
        { pmi: 40, label: 'Głęboka recesja' },
        { pmi: 42, label: 'Recesja' },
        { pmi: 45, label: 'Stagnacja' },
        { pmi: 48, label: 'Spowolnienie' },
        { pmi: 48.4, label: 'Obecny (XII.2025)' },
        { pmi: 50, label: 'Neutralny' },
        { pmi: 52, label: 'Ożywienie' },
        { pmi: 55, label: 'Ekspansja' },
        { pmi: 58, label: 'Boom' },
    ].map(s => {
        const gdpPMI = pmiToGDP(s.pmi);
        const gdpMulti = multiModelGDP(s.pmi, ipFixed, retailFixed);
        return {
            ...s,
            gdpPMI,
            gdpMulti,
            ci1s: `${(gdpMulti - M_RMSE).toFixed(1)} do ${(gdpMulti + M_RMSE).toFixed(1)}`,
            prob: pmiProbability(s.pmi, pmiHistory),
        };
    });
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL PMI vs GDP — for chart
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
            gdpMap.set(`${year}-${String(m).padStart(2, '0')}`, g.value);
        }
    }
    return pmiData.map(p => {
        const est = pmiToGDP(p.value);
        return {
            date: p.date,
            pmi: p.value,
            gdp: gdpMap.get(p.date) ?? null,
            pmiGDPEstimate: est,
            ciLow: +(est - M_RMSE).toFixed(1),
            ciHigh: +(est + M_RMSE).toFixed(1),
        };
    });
}

// Bloomberg consensus (from ECFC II.2026)
export const BLOOMBERG_CONSENSUS = {
    gdp2025: 3.6,
    gdp2026: 3.1,
    cpi2025: 3.7,
    cpi2026: 2.5,
    rate2025: 4.00,
    rate2026: 3.89,
    source: 'Bloomberg ECFC, II.2026',
};
