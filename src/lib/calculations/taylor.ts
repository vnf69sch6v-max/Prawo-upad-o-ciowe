// Taylor Rule calculations

export interface TaylorParams {
    neutralRate: number;    // r* (default 2.0%)
    inflationTarget: number; // π* (default 2.5% — NBP target)
    potentialGDP: number;   // potential GDP growth (default 3.2%)
    inflationWeight: number; // default 0.5
    outputWeight: number;   // default 0.5
}

export const DEFAULT_TAYLOR: TaylorParams = {
    neutralRate: 2.0,
    inflationTarget: 2.5,
    potentialGDP: 3.2,
    inflationWeight: 0.5,
    outputWeight: 0.5,
};

export function taylorRule(
    params: TaylorParams,
    currentInflation: number,
    currentGDP: number
): { optimalRate: number; inflationGap: number; outputGap: number; inflationContrib: number; outputContrib: number } {
    const inflationGap = currentInflation - params.inflationTarget;
    const outputGap = currentGDP - params.potentialGDP;

    const inflationContrib = params.inflationWeight * inflationGap;
    const outputContrib = params.outputWeight * outputGap;

    const optimalRate = +(params.neutralRate + inflationContrib + outputContrib).toFixed(2);

    return { optimalRate, inflationGap, outputGap, inflationContrib, outputContrib };
}

// Historical Taylor Rule from time series
export function historicalTaylor(
    params: TaylorParams,
    cpiSeries: { date: string; value: number }[],
    gdpSeries: { date: string; value: number }[]
): { date: string; taylor: number; label: string }[] {
    // Match GDP quarters to CPI months (use closest CPI)
    return gdpSeries.map(gdp => {
        // Find closest CPI value
        const closestCPI = cpiSeries.reduce((best, cpi) => {
            const diff = Math.abs(new Date(cpi.date.replace('Q', '-Q').replace('-Q1', '-03').replace('-Q2', '-06').replace('-Q3', '-09').replace('-Q4', '-12')).getTime() -
                new Date(gdp.date.replace('Q', '-Q').replace('-Q1', '-03').replace('-Q2', '-06').replace('-Q3', '-09').replace('-Q4', '-12')).getTime());
            const bestDiff = Math.abs(new Date(best.date.replace('Q', '-Q').replace('-Q1', '-03').replace('-Q2', '-06').replace('-Q3', '-09').replace('-Q4', '-12')).getTime() -
                new Date(gdp.date.replace('Q', '-Q').replace('-Q1', '-03').replace('-Q2', '-06').replace('-Q3', '-09').replace('-Q4', '-12')).getTime());
            return diff < bestDiff ? cpi : best;
        }, cpiSeries[0]);

        const result = taylorRule(params, closestCPI?.value ?? 2.5, gdp.value);
        return {
            date: gdp.date,
            taylor: result.optimalRate,
            label: `CPI=${closestCPI?.value?.toFixed(1)}%, PKB=${gdp.value.toFixed(1)}%`,
        };
    });
}
