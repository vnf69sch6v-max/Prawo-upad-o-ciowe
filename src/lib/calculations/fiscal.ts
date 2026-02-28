// Fiscal debt trajectory calculations

export interface FiscalParams {
    gdpGrowthReal: number;    // %
    inflation: number;         // % (GDP deflator)
    deficitToGdp: number;     // % (negative = deficit)
    avgInterestRate: number;  // %
    years: number;            // projection horizon
}

export const FISCAL_DEFAULTS: FiscalParams = {
    gdpGrowthReal: 3.6,
    inflation: 3.0,
    deficitToGdp: -6.5,
    avgInterestRate: 4.5,
    years: 10,
};

export const INITIAL_DEBT = 55.1; // % of GDP (2024, Eurostat)
export const NOMINAL_GDP_2024 = 3550; // bln PLN

export interface DebtProjection {
    year: number;
    debtToGdp: number;
    nominalDebt: number; // bln PLN
    nominalGdp: number;
}

export function projectDebt(params: FiscalParams, initialDebt = INITIAL_DEBT): DebtProjection[] {
    const results: DebtProjection[] = [];
    let debt = initialDebt;
    let gdp = NOMINAL_GDP_2024;

    for (let y = 1; y <= params.years; y++) {
        const nominalGrowth = params.gdpGrowthReal + params.inflation;
        gdp = gdp * (1 + nominalGrowth / 100);

        // Debt dynamics: d(t) = d(t-1) × (1+r)/(1+g) + deficit
        const snowball = debt * (params.avgInterestRate - nominalGrowth) / 100;
        debt = debt + snowball + Math.abs(params.deficitToGdp);

        results.push({
            year: 2024 + y,
            debtToGdp: Math.round(debt * 10) / 10,
            nominalDebt: Math.round(gdp * debt / 100),
            nominalGdp: Math.round(gdp),
        });
    }

    return results;
}

// Run sensitivity: base + recession + consolidation
export function sensitivityAnalysis(params: FiscalParams): {
    base: DebtProjection[];
    recession: DebtProjection[];
    consolidation: DebtProjection[];
} {
    return {
        base: projectDebt(params),
        recession: projectDebt({
            ...params,
            gdpGrowthReal: -1.0,
            deficitToGdp: params.deficitToGdp - 2,
        }),
        consolidation: projectDebt({
            ...params,
            deficitToGdp: params.deficitToGdp + 2,
        }),
    };
}

// Threshold crossings
export function findCrossing(projections: DebtProjection[], threshold: number): number | null {
    const crossing = projections.find(p => p.debtToGdp >= threshold);
    return crossing ? crossing.year : null;
}
