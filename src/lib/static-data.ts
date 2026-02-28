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
