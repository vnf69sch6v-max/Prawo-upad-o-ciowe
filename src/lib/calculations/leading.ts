// Leading Indicators — GDP Nowcasting calculations
// Based on: S&P Global PMI regression, GS CAI concept, OECD CLI methodology

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface IndicatorInput {
    name: string;
    value: number;
    weight: number;
    loading?: boolean;
}

export interface NowcastResult {
    pmiNowcast: number;       // GDP from PMI bridge equation alone
    compositeNowcast: number; // weighted multi-indicator GDP estimate
    contributions: { name: string; gdpContrib: number; weight: number; signal: 'green' | 'yellow' | 'red' }[];
    cyclePhase: CyclePhase;
    cliValue: number;         // 0-100 composite score
}

export type CyclePhase = 'RECOVERY' | 'EXPANSION' | 'SLOWDOWN' | 'CONTRACTION';

// ═══════════════════════════════════════════════════════════════
// PMI → GDP BRIDGE EQUATION
// Source: S&P Global (2023, OLS regression 2008-2019)
// Global: GDP_q = 0.582 × PMI − 27.8
// Poland adjustment: +1.0pp (higher trend growth, EM calibration)
// PMI 50 → GDP ~1.5% in Poland (vs ~1.3% globally)
// ═══════════════════════════════════════════════════════════════

const PMI_BETA = 0.582;      // regression coefficient
const PMI_ALPHA = -27.8;     // intercept
const POLAND_ADJ = 1.0;      // EM/Poland trend growth premium

export function pmiToGDP(pmi: number): number {
    const globalEstimate = PMI_BETA * pmi + PMI_ALPHA;
    return +(globalEstimate + POLAND_ADJ).toFixed(2);
}

// Inverse: what PMI is needed for X% GDP?
export function gdpToPMI(gdp: number): number {
    return +((gdp - POLAND_ADJ - PMI_ALPHA) / PMI_BETA).toFixed(1);
}

// ═══════════════════════════════════════════════════════════════
// INDIVIDUAL INDICATOR → GDP CONTRIBUTION
// Each indicator is converted to an estimated GDP contribution
// ═══════════════════════════════════════════════════════════════

function indicatorToGDP(name: string, value: number): number {
    // PMI Manufacturing — bridge equation
    if (name === 'PMI') return pmiToGDP(value);

    // Industrial Production YoY — regression proxy
    // IP growth ~1.5× GDP growth historically in Poland
    if (name === 'IP') return +(value / 1.5).toFixed(2);

    // Retail Sales YoY — consumption is ~60% of GDP
    // RS growth ~1.2× GDP consumption growth
    if (name === 'RETAIL') return +(value / 1.2 * 0.6).toFixed(2);

    // Yield Spread 10Y-2Y — recession probability signal
    // Positive spread → ~GDP trend; negative → recession drag
    if (name === 'YIELD') return +(value > 0 ? 3.0 + value * 0.3 : -1.0 + value * 2.0).toFixed(2);

    // Wages YoY — demand-side indicator
    // Real wage growth ≈ productivity growth ≈ potential GDP
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
// COMPOSITE NOWCAST (Goldman Sachs CAI-style)
// Weighted average of GDP estimates from each indicator
// ═══════════════════════════════════════════════════════════════

export function compositeNowcast(indicators: IndicatorInput[]): NowcastResult {
    const ready = indicators.filter(i => !i.loading);
    const totalWeight = ready.reduce((s, i) => s + i.weight, 0);

    const contributions = ready.map(ind => {
        const gdpContrib = indicatorToGDP(ind.name, ind.value);
        return {
            name: ind.name,
            gdpContrib,
            weight: ind.weight,
            signal: getSignal(ind.name, ind.value),
        };
    });

    // Weighted GDP nowcast
    const compositeGDP = contributions.reduce((s, c) => s + c.gdpContrib * (c.weight / totalWeight), 0);

    // PMI-only nowcast (for comparison)
    const pmiInd = indicators.find(i => i.name === 'PMI');
    const pmiNowcast = pmiInd ? pmiToGDP(pmiInd.value) : compositeGDP;

    // CLI: normalize to 0-100 scale (50 = trend GDP ~3%)
    const cliValue = Math.max(0, Math.min(100, 50 + (compositeGDP - 3.0) * 10));

    // Cycle phase (OECD quadrant logic)
    const cyclePhase = classifyCycle(cliValue, compositeGDP);

    return {
        pmiNowcast: +pmiNowcast.toFixed(2),
        compositeNowcast: +compositeGDP.toFixed(2),
        contributions,
        cyclePhase,
        cliValue: +cliValue.toFixed(1),
    };
}

// ═══════════════════════════════════════════════════════════════
// BUSINESS CYCLE CLASSIFICATION (OECD Quadrant)
// Above/below trend × rising/falling momentum
// ═══════════════════════════════════════════════════════════════

function classifyCycle(cli: number, gdp: number): CyclePhase {
    const aboveTrend = cli >= 50;  // above long-term average
    const positive = gdp > 2.0;    // meaningful growth

    if (aboveTrend && positive) return 'EXPANSION';
    if (!aboveTrend && positive) return 'RECOVERY';
    if (aboveTrend && !positive) return 'SLOWDOWN';
    return 'CONTRACTION';
}

// ═══════════════════════════════════════════════════════════════
// PMI REGRESSION TABLE
// For the scatter-like visualization: PMI → GDP mapping
// ═══════════════════════════════════════════════════════════════

export function pmiRegressionPoints(): { pmi: number; gdp: number }[] {
    const points = [];
    for (let pmi = 40; pmi <= 58; pmi += 0.5) {
        points.push({ pmi, gdp: pmiToGDP(pmi) });
    }
    return points;
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL PMI vs GDP — for dual-axis chart
// Merges monthly PMI data with quarterly GDP (interpolated)
// ═══════════════════════════════════════════════════════════════

export interface PMIvsGDPPoint {
    date: string;
    pmi: number;
    gdp: number | null;
    pmiGDPEstimate: number;  // bridge equation estimate
}

export function buildPMIvsGDP(
    pmiData: { date: string; value: number }[],
    gdpData: { q: string; value: number }[]
): PMIvsGDPPoint[] {
    // Build GDP lookup: quarter → value
    const gdpMap = new Map<string, number>();
    for (const g of gdpData) {
        const [year, qNum] = [g.q.slice(0, 4), parseInt(g.q.slice(5))];
        // Map quarter to its months
        const startMonth = (qNum - 1) * 3 + 1;
        for (let m = startMonth; m < startMonth + 3; m++) {
            const key = `${year}-${String(m).padStart(2, '0')}`;
            gdpMap.set(key, g.value);
        }
    }

    return pmiData.map(p => ({
        date: p.date,
        pmi: p.value,
        gdp: gdpMap.get(p.date) ?? null,
        pmiGDPEstimate: pmiToGDP(p.value),
    }));
}

// ═══════════════════════════════════════════════════════════════
// PMI SCENARIO TABLE
// Like Taylor sensitivity: what GDP at different PMI levels?
// ═══════════════════════════════════════════════════════════════

export function pmiScenarioTable(): { pmi: number; gdp: number; label: string }[] {
    return [
        { pmi: 42, gdp: pmiToGDP(42), label: 'Głęboka recesja' },
        { pmi: 45, gdp: pmiToGDP(45), label: 'Recesja' },
        { pmi: 47, gdp: pmiToGDP(47), label: 'Stagnacja' },
        { pmi: 48.6, gdp: pmiToGDP(48.6), label: 'Obecny (I.2026)' },
        { pmi: 50, gdp: pmiToGDP(50), label: 'Neutralny' },
        { pmi: 52, gdp: pmiToGDP(52), label: 'Ożywienie' },
        { pmi: 54, gdp: pmiToGDP(54), label: 'Ekspansja' },
        { pmi: 56, gdp: pmiToGDP(56), label: 'Boom' },
    ];
}
