// Taylor Rule calculations — Pro version
import { getRPPRate } from '@/lib/static-data';

export interface TaylorParams {
    rNeutral: number;        // r* neutral rate (default 2.0%)
    piTarget: number;        // π* inflation target (default 2.5%)
    potentialGDP: number;    // y* potential GDP growth (default 3.2%)
    weightInflation: number; // α coefficient (default 0.5)
    weightGDP: number;       // β coefficient (default 0.5)
}

export const DEFAULT_TAYLOR: TaylorParams = {
    rNeutral: 2.0,
    piTarget: 2.5,
    potentialGDP: 3.2,
    weightInflation: 0.5,
    weightGDP: 0.5,
};

export interface TaylorResult {
    optimalRate: number;
    inflationGap: number;
    outputGap: number;
    inflationContrib: number;
    outputContrib: number;
}

export function taylorRule(params: TaylorParams, currentInflation: number, currentGDP: number): TaylorResult {
    const inflationGap = currentInflation - params.piTarget;
    const outputGap = currentGDP - params.potentialGDP;
    const inflationContrib = params.weightInflation * inflationGap;
    const outputContrib = params.weightGDP * outputGap;
    const optimalRate = +(params.rNeutral + inflationContrib + outputContrib).toFixed(2);

    return { optimalRate, inflationGap, outputGap, inflationContrib, outputContrib };
}

// Historical Taylor Rule point
export interface TaylorPoint {
    date: string;
    taylorRate: number;
    rppRate: number;
    gap: number;          // rpp - taylor (+ = restrictive)
    inflation: number;
    gdpGrowth: number;
}

// Interpolate quarterly GDP to monthly
function interpolateGDP(
    gdpData: { date: string; value: number }[],
    month: string  // "2020-03"
): number | null {
    const [year, m] = month.split('-');
    const quarter = Math.ceil(parseInt(m) / 3);

    // Try various Eurostat date formats
    const qKeys = [
        `${year}Q${quarter}`,
        `${year}-Q${quarter}`,
        `${year}Q0${quarter}`,
    ];

    const match = gdpData.find(d =>
        qKeys.some(k => d.date.replace('-', '').replace('Q0', 'Q') === k.replace('-', '').replace('Q0', 'Q'))
    );

    return match?.value ?? null;
}

// Calculate historical Taylor Rule for entire CPI series
export function calculateHistoricalTaylor(
    inflationData: { date: string; value: number }[],
    gdpData: { date: string; value: number }[],
    params: TaylorParams
): TaylorPoint[] {
    const results: TaylorPoint[] = [];

    for (const cpiPoint of inflationData) {
        const month = cpiPoint.date;
        const pi = cpiPoint.value;

        const gdp = interpolateGDP(gdpData, month);
        if (gdp === null) continue;

        const outputGap = gdp - params.potentialGDP;
        const taylorRate = +(params.rNeutral
            + params.weightInflation * (pi - params.piTarget)
            + params.weightGDP * outputGap).toFixed(2);

        const rppRate = getRPPRate(month);

        results.push({
            date: month,
            taylorRate,
            rppRate,
            gap: +(rppRate - taylorRate).toFixed(2),
            inflation: pi,
            gdpGrowth: gdp,
        });
    }

    return results;
}

// Sensitivity table computation
export function sensitivityMatrix(
    params: TaylorParams,
    cpiRange: number[],
    gdpRange: number[]
): number[][] {
    return cpiRange.map(cpi =>
        gdpRange.map(gdp => {
            const outputGap = gdp - params.potentialGDP;
            return +(params.rNeutral + params.weightInflation * (cpi - params.piTarget) + params.weightGDP * outputGap).toFixed(1);
        })
    );
}
