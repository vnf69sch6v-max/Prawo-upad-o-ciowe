// Static macro data — indicators without REST API
// Updated manually. Each entry has value, date, and source for transparency.

export const STATIC_MACRO = {
    pmi: {
        value: 48.6,
        date: '2026-01',
        source: 'S&P Global',
        label: 'PMI Przemysłowy',
        note: 'Dane aktualizowane ręcznie (brak darmowego API)',
        unit: '',
    },
    wages: {
        value: 8.4,
        date: '2025-12',
        source: 'GUS',
        label: 'Wynagrodzenia YoY',
        note: 'Przeciętne wynagrodzenie brutto w sektorze przedsiębiorstw',
        unit: '%',
    },
    gusUnemployment: {
        value: 6.0,
        date: '2026-01',
        source: 'GUS',
        label: 'Bezrobocie rejestrowane',
        note: 'Stopa rejestrowana — dane z urzędów pracy (PUP)',
        unit: '%',
    },
    debtToGdp: {
        value: 55.1,
        date: '2024',
        source: 'Eurostat',
        label: 'Dług publiczny / PKB',
        unit: '%',
        note: '',
    },
    deficitToGdp: {
        value: -6.5,
        date: '2024',
        source: 'Eurostat',
        label: 'Deficyt / PKB',
        unit: '%',
        note: '',
    },
};

// RPP reference rate history (source: NBP decisions)
// Only stores change points — getRPPRate() fills in gaps
export const RPP_HISTORY: { date: string; rate: number }[] = [
    { date: '2019-01', rate: 1.50 },
    { date: '2020-04', rate: 0.50 },  // COVID cut
    { date: '2020-06', rate: 0.10 },  // COVID minimum
    { date: '2021-10', rate: 0.50 },  // first hike
    { date: '2021-11', rate: 1.25 },
    { date: '2021-12', rate: 1.75 },
    { date: '2022-01', rate: 2.25 },
    { date: '2022-02', rate: 2.75 },
    { date: '2022-03', rate: 3.50 },
    { date: '2022-04', rate: 4.50 },
    { date: '2022-05', rate: 5.25 },
    { date: '2022-06', rate: 6.00 },
    { date: '2022-07', rate: 6.50 },
    { date: '2022-09', rate: 6.75 },  // peak
    { date: '2023-10', rate: 5.75 },  // surprise -100bp
    { date: '2025-05', rate: 5.25 },  // 2025 easing cycle
    { date: '2025-07', rate: 5.00 },
    { date: '2025-09', rate: 4.75 },
    { date: '2025-10', rate: 4.50 },
    { date: '2025-11', rate: 4.25 },
    { date: '2025-12', rate: 4.00 },  // current
];

export function getRPPRate(month: string): number {
    const applicable = RPP_HISTORY.filter(r => r.date <= month);
    return applicable.length > 0 ? applicable[applicable.length - 1].rate : 1.5;
}

// Market consensus (manually updated)
export const CONSENSUS = {
    rateEndYear: 3.50,
    source: 'ING/PKO BP/Pekao, XII.2025',
};

// ═══════════════════════════════════════════════════════════════
// HARDCODED DATA for Taylor Rule historical chart
// Source: Eurostat (HICP YoY), Eurostat (GDP YoY)
// ═══════════════════════════════════════════════════════════════

export const CPI_DATA_PL: { date: string; value: number }[] = [
    { date: '2020-01', value: 3.8 }, { date: '2020-02', value: 4.1 },
    { date: '2020-03', value: 3.5 }, { date: '2020-04', value: 3.0 },
    { date: '2020-05', value: 2.8 }, { date: '2020-06', value: 3.2 },
    { date: '2020-07', value: 3.0 }, { date: '2020-08', value: 2.9 },
    { date: '2020-09', value: 3.0 }, { date: '2020-10', value: 3.1 },
    { date: '2020-11', value: 3.0 }, { date: '2020-12', value: 2.4 },
    { date: '2021-01', value: 2.7 }, { date: '2021-02', value: 2.4 },
    { date: '2021-03', value: 3.2 }, { date: '2021-04', value: 4.3 },
    { date: '2021-05', value: 4.6 }, { date: '2021-06', value: 4.4 },
    { date: '2021-07', value: 5.0 }, { date: '2021-08', value: 5.4 },
    { date: '2021-09', value: 5.6 }, { date: '2021-10', value: 6.4 },
    { date: '2021-11', value: 7.7 }, { date: '2021-12', value: 8.0 },
    { date: '2022-01', value: 9.2 }, { date: '2022-02', value: 8.5 },
    { date: '2022-03', value: 10.9 }, { date: '2022-04', value: 12.3 },
    { date: '2022-05', value: 13.9 }, { date: '2022-06', value: 14.2 },
    { date: '2022-07', value: 15.5 }, { date: '2022-08', value: 16.1 },
    { date: '2022-09', value: 17.2 }, { date: '2022-10', value: 16.4 },
    { date: '2022-11', value: 16.1 }, { date: '2022-12', value: 15.3 },
    { date: '2023-01', value: 16.6 }, { date: '2023-02', value: 16.1 },
    { date: '2023-03', value: 14.8 }, { date: '2023-04', value: 13.0 },
    { date: '2023-05', value: 11.5 }, { date: '2023-06', value: 10.8 },
    { date: '2023-07', value: 10.3 }, { date: '2023-08', value: 9.5 },
    { date: '2023-09', value: 8.2 }, { date: '2023-10', value: 6.5 },
    { date: '2023-11', value: 6.5 }, { date: '2023-12', value: 6.1 },
    { date: '2024-01', value: 3.7 }, { date: '2024-02', value: 3.0 },
    { date: '2024-03', value: 2.0 }, { date: '2024-04', value: 2.4 },
    { date: '2024-05', value: 2.5 }, { date: '2024-06', value: 2.6 },
    { date: '2024-07', value: 4.2 }, { date: '2024-08', value: 4.0 },
    { date: '2024-09', value: 4.5 }, { date: '2024-10', value: 4.7 },
    { date: '2024-11', value: 4.7 }, { date: '2024-12', value: 4.8 },
    { date: '2025-01', value: 4.3 }, { date: '2025-02', value: 4.0 },
    { date: '2025-03', value: 3.6 }, { date: '2025-04', value: 3.2 },
    { date: '2025-05', value: 2.8 }, { date: '2025-06', value: 2.7 },
    { date: '2025-07', value: 2.5 }, { date: '2025-08', value: 2.6 },
    { date: '2025-09', value: 2.5 }, { date: '2025-10', value: 2.5 },
    { date: '2025-11', value: 2.4 }, { date: '2025-12', value: 2.4 },
];

export const GDP_QUARTERLY_PL: { q: string; value: number }[] = [
    { q: '2020Q1', value: 2.0 }, { q: '2020Q2', value: -8.0 },
    { q: '2020Q3', value: -2.0 }, { q: '2020Q4', value: -2.7 },
    { q: '2021Q1', value: -1.1 }, { q: '2021Q2', value: 11.2 },
    { q: '2021Q3', value: 5.5 }, { q: '2021Q4', value: 7.6 },
    { q: '2022Q1', value: 8.5 }, { q: '2022Q2', value: 5.8 },
    { q: '2022Q3', value: 3.8 }, { q: '2022Q4', value: 0.4 },
    { q: '2023Q1', value: -0.3 }, { q: '2023Q2', value: -0.6 },
    { q: '2023Q3', value: 0.5 }, { q: '2023Q4', value: 1.5 },
    { q: '2024Q1', value: 2.0 }, { q: '2024Q2', value: 3.3 },
    { q: '2024Q3', value: 3.2 }, { q: '2024Q4', value: 3.5 },
    { q: '2025Q1', value: 3.4 }, { q: '2025Q2', value: 3.3 },
    { q: '2025Q3', value: 3.8 }, { q: '2025Q4', value: 3.6 },
];
