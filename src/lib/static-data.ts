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
    { date: '2020-01', rate: 1.50 },
    { date: '2020-04', rate: 0.50 },  // COVID cut
    { date: '2020-06', rate: 0.10 },  // COVID minimum
    // 0.10% through all of 2020 and 2021 until October
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
    // 6.75% from Oct 2022 through Sept 2023
    { date: '2023-10', rate: 5.75 },  // surprise -100bp
    // 5.75% through all of 2024
    { date: '2025-05', rate: 5.50 },  // start of 2025 easing cycle
    { date: '2025-06', rate: 5.25 },
    { date: '2025-07', rate: 5.00 },
    { date: '2025-09', rate: 4.75 },
    { date: '2025-10', rate: 4.50 },
    { date: '2025-11', rate: 4.25 },
    { date: '2025-12', rate: 4.00 },  // current
];

// Get RPP rate for a given month (YYYY-MM format)
export function getRPPRate(month: string): number {
    const applicable = RPP_HISTORY.filter(r => r.date <= month);
    return applicable.length > 0 ? applicable[applicable.length - 1].rate : 0.10;
}

// Market consensus (manually updated)
export const CONSENSUS = {
    rateEndYear: 3.50,
    source: 'Focus Economics / Reuters poll, II.2026',
    rateCuts2026: 50,  // bp of expected cuts in 2026
};
