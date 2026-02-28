// Taylor Rule calculations — V2 (correct Taylor 1993 formula)
import { getRPPRate } from '@/lib/static-data';

export interface TaylorParams {
    rStar: number;           // r* neutral rate (default 1.5%)
    piTarget: number;        // π* inflation target (default 2.5%)
    potentialGDP: number;    // y* potential GDP growth (default 3.0%)
    weightInflation: number; // α coefficient (default 0.5)
    weightOutput: number;    // β coefficient (default 0.5)
}

export const DEFAULT_TAYLOR: TaylorParams = {
    rStar: 1.5,
    piTarget: 2.5,
    potentialGDP: 3.0,
    weightInflation: 0.5,
    weightOutput: 0.5,
};

export interface TaylorResult {
    optimalRate: number;
    inflationGap: number;
    outputGap: number;
    inflationContrib: number;
    outputContrib: number;
}

// Taylor 1993: i = π + r* + α(π − π*) + β(y − y*)
export function taylorRule(params: TaylorParams, currentInflation: number, currentGDP: number): TaylorResult {
    const inflationGap = currentInflation - params.piTarget;
    const outputGap = currentGDP - params.potentialGDP;
    const inflationContrib = params.weightInflation * inflationGap;
    const outputContrib = params.weightOutput * outputGap;
    const optimalRate = +(currentInflation + params.rStar + inflationContrib + outputContrib).toFixed(2);

    return { optimalRate, inflationGap, outputGap, inflationContrib, outputContrib };
}

// Historical Taylor Rule point
export interface TaylorPoint {
    date: string;
    taylor: number;
    rpp: number;
    gap: number;          // rpp - taylor (+ = restrictive)
    inflation: number;
    gdp: number;
}

// Calculate historical Taylor Rule from hardcoded or Eurostat data
export function buildHistoricalTaylor(
    cpiData: { date: string; value: number }[],
    gdpQuarterly: { q: string; value: number }[],
    params: TaylorParams,
    rangeMonths: number // 0 = MAX
): TaylorPoint[] {
    const startIndex = rangeMonths === 0 ? 0 : Math.max(0, cpiData.length - rangeMonths);

    return cpiData.slice(startIndex).map(cpi => {
        const gdp = getGDPForMonth(gdpQuarterly, cpi.date);
        if (gdp === null) return null;
        const taylor = +(cpi.value + params.rStar
            + params.weightInflation * (cpi.value - params.piTarget)
            + params.weightOutput * (gdp - params.potentialGDP)).toFixed(2);
        const rpp = getRPPRate(cpi.date);
        return {
            date: cpi.date,
            taylor,
            rpp,
            gap: +(rpp - taylor).toFixed(2),
            inflation: cpi.value,
            gdp,
        };
    }).filter((p): p is TaylorPoint => p !== null);
}

// Interpolate quarterly GDP to month
function getGDPForMonth(gdpData: { q: string; value: number }[], month: string): number | null {
    const [y, m] = month.split('-').map(Number);
    const q = Math.ceil(m / 3);
    const qKey = `${y}Q${q}`;
    const match = gdpData.find(d => d.q === qKey);
    return match ? match.value : null;
}

// Sensitivity table computation
export function sensitivityMatrix(
    params: TaylorParams,
    cpiRange: number[],
    gdpRange: number[]
): number[][] {
    return cpiRange.map(cpi =>
        gdpRange.map(gdp => {
            const inflGap = cpi - params.piTarget;
            const outGap = gdp - params.potentialGDP;
            return +(cpi + params.rStar + params.weightInflation * inflGap + params.weightOutput * outGap).toFixed(1);
        })
    );
}
