// Rata annuitetowa — używana przez symulator na /prognozy (WIBOR + marża).

export interface MortgageParams {
    principal: number;
    years: number;
    margin: number;
    wiborTenor: '3M' | '6M';
}

/** Miesięczna rata równa przy oprocentowaniu WIBOR + marża. */
export function calculateMonthlyPayment(params: MortgageParams, wiborRate: number): number {
    const annualRate = (wiborRate + params.margin) / 100;
    const monthlyRate = annualRate / 12;
    const n = params.years * 12;
    if (monthlyRate <= 0) return params.principal / n;
    return params.principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}
