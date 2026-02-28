// Mortgage & WIBOR projection calculations

// WIBOR spread vs reference rate (observed 28.02.2026)
export const WIBOR_SPREADS: Record<string, number> = {
    'ON': -0.09,
    '1M': -0.06,
    '3M': -0.15,
    '6M': -0.29,
    '1Y': -0.39,
};

export interface RateDecision {
    date: string;
    change: number; // bp: -50, -25, 0, +25, +50
    rate: number;   // cumulative rate after decision
}

export interface MortgageParams {
    principal: number;    // PLN
    years: number;
    margin: number;       // % (bank margin)
    wiborTenor: '3M' | '6M';
}

// Project WIBOR for each RPP meeting date
export function projectWIBOR(
    ratePath: RateDecision[],
    tenor: string
): { date: string; wibor: number }[] {
    const spread = WIBOR_SPREADS[tenor] ?? -0.15;
    return ratePath.map(({ date, rate }) => ({
        date,
        wibor: Math.max(0, +(rate + spread).toFixed(2)),
    }));
}

// Monthly annuity payment
export function calculateMonthlyPayment(params: MortgageParams, wiborRate: number): number {
    const annualRate = (wiborRate + params.margin) / 100;
    const monthlyRate = annualRate / 12;
    const n = params.years * 12;
    if (monthlyRate <= 0) return params.principal / n;
    return params.principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

// Build rate path from decisions
export function buildRatePath(
    currentRate: number,
    decisions: { date: string; change: number }[]
): RateDecision[] {
    let rate = currentRate;
    return decisions.map(d => {
        rate = +(rate + d.change / 100).toFixed(2); // change is in bp
        return { date: d.date, change: d.change, rate };
    });
}

// RPP meeting dates 2026 (remaining)
export const RPP_DATES_2026 = [
    '2026-03-04', '2026-04-01', '2026-05-06', '2026-06-03',
    '2026-07-01', '2026-09-02', '2026-10-07', '2026-11-04', '2026-12-02',
];

// Presets
export const PRESETS = {
    dovish: RPP_DATES_2026.map(date => ({ date, change: -25 })),
    hawkish: RPP_DATES_2026.map(date => ({ date, change: 0 })),
    market: RPP_DATES_2026.map((date, i) => ({
        date,
        change: i < 2 ? -25 : 0, // -25bp in March and April, then hold
    })),
};

// Yield curve projection (simplified: expected avg rate + term premium)
export function projectYieldCurve(
    ratePath: RateDecision[],
    currentYields: { y2: number | null; y5: number | null; y10: number | null },
    currentRefRate: number
): { y2: number; y5: number; y10: number } {
    const avgRate = ratePath.length > 0
        ? ratePath.reduce((s, r) => s + r.rate, 0) / ratePath.length
        : currentRefRate;

    // Term premium = current yield - current ref rate
    const tp2 = (currentYields.y2 ?? 3.56) - currentRefRate;
    const tp5 = (currentYields.y5 ?? 4.30) - currentRefRate;
    const tp10 = (currentYields.y10 ?? 4.96) - currentRefRate;

    return {
        y2: +(avgRate + tp2).toFixed(3),
        y5: +(avgRate + tp5).toFixed(3),
        y10: +(avgRate + tp10).toFixed(3),
    };
}
