// GDP Nowcasting Tool — Bottom-Up Quarterly GDP Estimate
// Uses monthly indicators to estimate GDP before official GUS release
// Methodology: weighted average of production-side indicators (ESA 2010)
// Sources: Eurostat sts_inpr_m, sts_trtu_m, sts_copr_m, namq_10_gdp

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
    consensus: { value: number; source: string; date: string };
    modelStatus: string;
}

// ═══════════════════════════════════════════════════════════════
// SECTOR WEIGHTS (GUS Rachunki Narodowe 2024, strona produkcyjna)
// ═══════════════════════════════════════════════════════════════

export const GDP_WEIGHTS = {
    industrial: 0.24,      // Przemysł (sekcje B-D PKD) ~24% GVA
    retail: 0.52,          // Usługi rynkowe (proxy: retail G47) ~52% GVA
    construction: 0.08,    // Budownictwo (sekcja F) ~8% GVA
    // Remainder: agriculture (~3%) + public admin (~13%) ≈ stable, enters as constant
    constant: 0.5,         // Correction for non-tracked sectors (pp)
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

/** Convert YYYY-MM date to quarter label */
export function dateToQuarter(date: string): { quarter: string; year: number; q: number } {
    const [y, m] = date.split('-').map(Number);
    const q = Math.ceil(m / 3);
    return { quarter: `Q${q}.${y}`, year: y, q };
}

/** Get months belonging to a quarter */
function quarterMonths(year: number, q: number): string[] {
    const startMonth = (q - 1) * 3 + 1;
    return [0, 1, 2].map(i => {
        const m = startMonth + i;
        return `${year}-${String(m).padStart(2, '0')}`;
    });
}

/** Compute trend from recent values */
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
// CORE NOWCAST COMPUTATION
// ═══════════════════════════════════════════════════════════════

export interface TimeSeriesPoint {
    date: string;       // YYYY-MM
    value: number;
}

/**
 * Compute GDP nowcast for a given quarter from monthly indicators.
 * Each indicator is an array of {date, value} with YoY % changes.
 */
export function computeQuarterNowcast(
    year: number,
    q: number,
    industrial: TimeSeriesPoint[],
    retail: TimeSeriesPoint[],
    construction: TimeSeriesPoint[],
): QuarterlyEstimate {
    const qMonths = quarterMonths(year, q);
    const quarter = `Q${q}.${year}`;

    // Helper: get values for this quarter's months
    const getQuarterValues = (data: TimeSeriesPoint[]): number[] => {
        return qMonths
            .map(m => data.find(d => d.date === m)?.value)
            .filter((v): v is number => v !== null && v !== undefined);
    };

    const indVals = getQuarterValues(industrial);
    const retVals = getQuarterValues(retail);
    const conVals = getQuarterValues(construction);

    // Average each component for available months
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    const indAvg = avg(indVals);
    const retAvg = avg(retVals);
    const conAvg = avg(conVals);

    // Total months available
    const totalMonths = Math.max(indVals.length, retVals.length, conVals.length);
    const coverage = totalMonths / 3;

    // Weighted nowcast
    let nowcast = GDP_WEIGHTS.constant; // start with constant
    let hasData = false;

    const components: NowcastComponent[] = [];

    // Industrial
    const indContrib = indAvg !== null ? GDP_WEIGHTS.industrial * indAvg : 0;
    components.push({
        name: 'industrial',
        label: 'Produkcja przemysłowa',
        weight: GDP_WEIGHTS.industrial,
        value: indAvg,
        contribution: indAvg !== null ? +indContrib.toFixed(2) : 0,
        monthsAvailable: indVals.length,
        source: 'Eurostat sts_inpr_m',
        trend: computeTrend(indVals),
    });
    if (indAvg !== null) { nowcast += indContrib; hasData = true; }

    // Retail (proxy for services)
    const retContrib = retAvg !== null ? GDP_WEIGHTS.retail * retAvg : 0;
    components.push({
        name: 'retail',
        label: 'Sprzedaż detaliczna',
        weight: GDP_WEIGHTS.retail,
        value: retAvg,
        contribution: retAvg !== null ? +retContrib.toFixed(2) : 0,
        monthsAvailable: retVals.length,
        source: 'Eurostat sts_trtu_m',
        trend: computeTrend(retVals),
    });
    if (retAvg !== null) { nowcast += retContrib; hasData = true; }

    // Construction
    const conContrib = conAvg !== null ? GDP_WEIGHTS.construction * conAvg : 0;
    components.push({
        name: 'construction',
        label: 'Budownictwo',
        weight: GDP_WEIGHTS.construction,
        value: conAvg,
        contribution: conAvg !== null ? +conContrib.toFixed(2) : 0,
        monthsAvailable: conVals.length,
        source: 'Eurostat sts_copr_m',
        trend: computeTrend(conVals),
    });
    if (conAvg !== null) { nowcast += conContrib; hasData = true; }

    // Confidence based on coverage
    const confidence = !hasData ? 1 : coverage >= 1.0 ? 5 : coverage >= 0.67 ? 4 : coverage >= 0.33 ? 3 : 2;

    return {
        quarter,
        year,
        q,
        nowcast: hasData ? +nowcast.toFixed(1) : 0,
        coverage,
        components,
        confidence,
    };
}

// ═══════════════════════════════════════════════════════════════
// BACKTEST: compare nowcast vs official GDP
// ═══════════════════════════════════════════════════════════════

export function backtestNowcast(
    industrial: TimeSeriesPoint[],
    retail: TimeSeriesPoint[],
    construction: TimeSeriesPoint[],
    officialGDP: TimeSeriesPoint[],  // quarterly: date = "2024-Q1" or "2024-01" (Q start month)
    quarters: number = 8,           // how many quarters to backtest
): { rows: BacktestRow[]; mae: number | null } {
    const rows: BacktestRow[] = [];

    // Determine the latest quarter we can backtest
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();

    for (let i = quarters; i >= 1; i--) {
        let y = currentYear;
        let qq = currentQ - i;
        while (qq <= 0) { qq += 4; y--; }

        const estimate = computeQuarterNowcast(y, qq, industrial, retail, construction);

        // Find official GDP for this quarter
        const qLabel = `Q${qq}.${y}`;
        // Eurostat quarterly dates: "2024-Q1" format or "2024-01" (first month of Q)
        const qStartMonth = `${y}-${String((qq - 1) * 3 + 1).padStart(2, '0')}`;
        const officialPt = officialGDP.find(d =>
            d.date === qStartMonth || d.date === `${y}-Q${qq}` || d.date === `${y}Q${qq}`
        );

        const official = officialPt?.value ?? null;
        const error = official !== null && estimate.nowcast !== 0 ? +(estimate.nowcast - official).toFixed(1) : null;

        rows.push({ quarter: qLabel, nowcast: estimate.nowcast, official, error });
    }

    // MAE
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
    officialGDP: TimeSeriesPoint[],
): NowcastResult {
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();

    // Current quarter nowcast
    const current = computeQuarterNowcast(currentYear, currentQ, industrial, retail, construction);

    // Previous quarter
    let prevY = currentYear;
    let prevQ = currentQ - 1;
    if (prevQ <= 0) { prevQ = 4; prevY--; }
    const previous = computeQuarterNowcast(prevY, prevQ, industrial, retail, construction);

    // Backtest
    const { rows: backtest, mae } = backtestNowcast(industrial, retail, construction, officialGDP, 8);

    // Consensus
    const yearConsensus = GDP_CONSENSUS[String(currentYear) as keyof typeof GDP_CONSENSUS]
        ?? GDP_CONSENSUS[String(currentYear - 1) as keyof typeof GDP_CONSENSUS]
        ?? { value: 3.0, source: 'Estimate', date: '' };

    const modelStatus = current.coverage >= 0.67
        ? `${Math.round(current.coverage * 3)}/3 miesięcy`
        : current.coverage > 0
            ? `${Math.round(current.coverage * 3)}/3 miesięcy (partial)`
            : 'Brak danych miesięcznych';

    return {
        current,
        previous,
        backtest,
        mae,
        consensus: yearConsensus,
        modelStatus,
    };
}
