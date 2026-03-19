// GDP Nowcasting Tool — Bottom-Up Quarterly GDP Estimate
// Uses monthly indicators to estimate GDP before official GUS release
// Methodology: weighted average of production-side + demand-side indicators (ESA 2010)
// Sources: GUS BDL (retail, wages), Eurostat (industrial, construction, trade, GDP official)

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NowcastComponent {
    name: string;
    label: string;
    weight: number;
    value: number | null;      // YoY % (latest month)
    contribution: number;      // weight × value (pp)
    monthsAvailable: number;   // how many months of Q we have
    source: string;
    trend: 'up' | 'down' | 'flat';
}

export interface QuarterlyEstimate {
    quarter: string;           // e.g. "Q1.2026"
    year: number;
    q: number;                 // 1-4
    nowcast: number;           // GDP YoY % estimate
    coverage: number;          // 0-1 (months available / 3)
    components: NowcastComponent[];
    confidence: number;        // 1-5 bars
}

export interface BacktestRow {
    quarter: string;
    nowcast: number;
    official: number | null;
    error: number | null;      // nowcast - official (pp)
}

export interface NowcastResult {
    current: QuarterlyEstimate;
    previous: QuarterlyEstimate | null;
    backtest: BacktestRow[];
    mae: number | null;        // Mean Absolute Error
    ciLow: number | null;      // Confidence interval low (nowcast - MAE)
    ciHigh: number | null;     // Confidence interval high (nowcast + MAE)
    consensus: { value: number; source: string; date: string };
    modelStatus: string;
}

// ═══════════════════════════════════════════════════════════════
// SECTOR WEIGHTS (GUS Rachunki Narodowe 2024, production + demand side)
// ═══════════════════════════════════════════════════════════════

export const GDP_WEIGHTS = {
    // Production side
    industrial: 0.18,      // Przemysł (sekcje B-D PKD) — downweighted from 0.24
    retail: 0.32,          // Usługi rynkowe (proxy: retail G47) — downweighted from 0.52
    construction: 0.06,    // Budownictwo (sekcja F)
    // Demand side (new)
    wages: 0.22,           // Płace realne → proxy popytu konsumpcyjnego (~60% PKB expenditure)
    trade: 0.10,           // Eksport netto → saldo handlu zagranicznego (~10% PKB)
    // Remainder
    constant: 0.3,         // Correction for non-tracked sectors (agriculture, public admin)
    lastUpdated: '2024',
};

// Bloomberg consensus for comparison
export const GDP_CONSENSUS = {
    '2025': { value: 3.5, source: 'Bloomberg ECFC', date: 'III.2026' },
    '2026': { value: 3.2, source: 'Bloomberg ECFC', date: 'III.2026' },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export function dateToQuarter(date: string): { quarter: string; year: number; q: number } {
    const [y, m] = date.split('-').map(Number);
    const q = Math.ceil(m / 3);
    return { quarter: `Q${q}.${y}`, year: y, q };
}

function quarterMonths(year: number, q: number): string[] {
    const startMonth = (q - 1) * 3 + 1;
    return [0, 1, 2].map(i => {
        const m = startMonth + i;
        return `${year}-${String(m).padStart(2, '0')}`;
    });
}

function computeTrend(values: number[]): 'up' | 'down' | 'flat' {
    if (values.length < 2) return 'flat';
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const diff = last - prev;
    if (diff > 0.5) return 'up';
    if (diff < -0.5) return 'down';
    return 'flat';
}

// ═══════════════════════════════════════════════════════════════
// CORE NOWCAST COMPUTATION — 5 components
// ═══════════════════════════════════════════════════════════════

export interface TimeSeriesPoint {
    date: string;       // YYYY-MM
    value: number;
}

/**
 * Compute GDP nowcast for a given quarter from 5 monthly indicators.
 */
export function computeQuarterNowcast(
    year: number,
    q: number,
    industrial: TimeSeriesPoint[],
    retail: TimeSeriesPoint[],
    construction: TimeSeriesPoint[],
    wages: TimeSeriesPoint[],
    trade: TimeSeriesPoint[],
): QuarterlyEstimate {
    const qMonths = quarterMonths(year, q);
    const quarter = `Q${q}.${year}`;

    const getQuarterValues = (data: TimeSeriesPoint[]): number[] => {
        return qMonths
            .map(m => data.find(d => d.date === m)?.value)
            .filter((v): v is number => v !== null && v !== undefined);
    };

    const indVals = getQuarterValues(industrial);
    const retVals = getQuarterValues(retail);
    const conVals = getQuarterValues(construction);
    const wagVals = getQuarterValues(wages);
    const trdVals = getQuarterValues(trade);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    const indAvg = avg(indVals);
    const retAvg = avg(retVals);
    const conAvg = avg(conVals);
    const wagAvg = avg(wagVals);
    const trdAvg = avg(trdVals);

    // Coverage = max months across all components
    const totalMonths = Math.max(indVals.length, retVals.length, conVals.length, wagVals.length, trdVals.length);
    const coverage = totalMonths / 3;

    let nowcast = GDP_WEIGHTS.constant;
    let hasData = false;

    const components: NowcastComponent[] = [];

    // Helper to add component
    const addComponent = (
        name: string, label: string, weight: number,
        avgVal: number | null, vals: number[], source: string
    ) => {
        const contrib = avgVal !== null ? weight * avgVal : 0;
        components.push({
            name, label, weight,
            value: avgVal,
            contribution: avgVal !== null ? +contrib.toFixed(2) : 0,
            monthsAvailable: vals.length,
            source,
            trend: computeTrend(vals),
        });
        if (avgVal !== null) { nowcast += contrib; hasData = true; }
    };

    addComponent('industrial', 'Produkcja przemysłowa', GDP_WEIGHTS.industrial, indAvg, indVals, 'Eurostat sts_inpr_m');
    addComponent('retail', 'Sprzedaż detaliczna', GDP_WEIGHTS.retail, retAvg, retVals, 'GUS BDL P3860');
    addComponent('construction', 'Budownictwo', GDP_WEIGHTS.construction, conAvg, conVals, 'Eurostat sts_copr_m');
    addComponent('wages', 'Płace realne', GDP_WEIGHTS.wages, wagAvg, wagVals, 'GUS P2687 − HICP');
    addComponent('trade', 'Eksport netto', GDP_WEIGHTS.trade, trdAvg, trdVals, 'Eurostat BOP');

    // Confidence: more dimensions = better
    const dimCount = components.filter(c => c.value !== null).length;
    const confidence = !hasData ? 1
        : coverage >= 1.0 && dimCount >= 4 ? 5
        : coverage >= 0.67 || dimCount >= 3 ? 4
        : coverage >= 0.33 || dimCount >= 2 ? 3
        : 2;

    return {
        quarter, year, q,
        nowcast: hasData ? +nowcast.toFixed(1) : 0,
        coverage, components, confidence,
    };
}

// ═══════════════════════════════════════════════════════════════
// BACKTEST
// ═══════════════════════════════════════════════════════════════

export function backtestNowcast(
    industrial: TimeSeriesPoint[],
    retail: TimeSeriesPoint[],
    construction: TimeSeriesPoint[],
    wages: TimeSeriesPoint[],
    trade: TimeSeriesPoint[],
    officialGDP: TimeSeriesPoint[],
    quarters: number = 8,
): { rows: BacktestRow[]; mae: number | null } {
    const rows: BacktestRow[] = [];
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();

    for (let i = quarters; i >= 1; i--) {
        let y = currentYear;
        let qq = currentQ - i;
        while (qq <= 0) { qq += 4; y--; }

        const estimate = computeQuarterNowcast(y, qq, industrial, retail, construction, wages, trade);

        const qStartMonth = `${y}-${String((qq - 1) * 3 + 1).padStart(2, '0')}`;
        const officialPt = officialGDP.find(d =>
            d.date === qStartMonth || d.date === `${y}-Q${qq}` || d.date === `${y}Q${qq}`
        );

        const official = officialPt?.value ?? null;
        const error = official !== null && estimate.nowcast !== 0 ? +(estimate.nowcast - official).toFixed(1) : null;

        rows.push({ quarter: `Q${qq}.${y}`, nowcast: estimate.nowcast, official, error });
    }

    const errors = rows.filter(r => r.error !== null).map(r => Math.abs(r.error!));
    const mae = errors.length > 0 ? +(errors.reduce((s, e) => s + e, 0) / errors.length).toFixed(1) : null;

    return { rows, mae };
}

// ═══════════════════════════════════════════════════════════════
// FULL NOWCAST RESULT
// ═══════════════════════════════════════════════════════════════

export function buildNowcastResult(
    industrial: TimeSeriesPoint[],
    retail: TimeSeriesPoint[],
    construction: TimeSeriesPoint[],
    wages: TimeSeriesPoint[],
    trade: TimeSeriesPoint[],
    officialGDP: TimeSeriesPoint[],
): NowcastResult {
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();

    const current = computeQuarterNowcast(currentYear, currentQ, industrial, retail, construction, wages, trade);

    let prevY = currentYear;
    let prevQ = currentQ - 1;
    if (prevQ <= 0) { prevQ = 4; prevY--; }
    const previous = computeQuarterNowcast(prevY, prevQ, industrial, retail, construction, wages, trade);

    const { rows: backtest, mae } = backtestNowcast(industrial, retail, construction, wages, trade, officialGDP, 8);

    const yearConsensus = GDP_CONSENSUS[String(currentYear) as keyof typeof GDP_CONSENSUS]
        ?? GDP_CONSENSUS[String(currentYear - 1) as keyof typeof GDP_CONSENSUS]
        ?? { value: 3.0, source: 'Estimate', date: '' };

    const dimCount = current.components.filter(c => c.value !== null).length;
    const modelStatus = `${Math.round(current.coverage * 3)}/3 mies. · ${dimCount}/5 wsk.`;

    return {
        current, previous, backtest, mae,
        ciLow: mae !== null ? +(current.nowcast - mae).toFixed(1) : null,
        ciHigh: mae !== null ? +(current.nowcast + mae).toFixed(1) : null,
        consensus: yearConsensus, modelStatus,
    };
}
