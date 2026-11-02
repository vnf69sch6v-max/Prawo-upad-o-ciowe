// PLACEHOLDER — zastępowane zweryfikowanymi wagami GUS 2026.
export interface CpiWeight { code: string; name: string; weight: number }
export const CPI_WEIGHTS_2026: CpiWeight[] = [
    { code: '01', name: 'Żywność i napoje bezalk.', weight: 25.9 },
    { code: '02', name: 'Alkohol i tytoń', weight: 6.1 },
    { code: '03', name: 'Odzież i obuwie', weight: 4.2 },
    { code: '04', name: 'Mieszkanie, woda, energia', weight: 19.5 },
    { code: '05', name: 'Wyposażenie mieszkania', weight: 5.1 },
    { code: '06', name: 'Zdrowie', weight: 6.3 },
    { code: '07', name: 'Transport', weight: 9.8 },
    { code: '08', name: 'Informacja i komunikacja', weight: 5.5 },
    { code: '09', name: 'Rekreacja, sport i kultura', weight: 5.9 },
    { code: '10', name: 'Edukacja', weight: 1.0 },
    { code: '11', name: 'Restauracje i hotele', weight: 6.4 },
    { code: '12', name: 'Ubezpieczenia i usługi fin.', weight: 1.3 },
    { code: '13', name: 'Higiena i pozostałe', weight: 3.0 },
];
export const CPI_WEIGHTS_SOURCE = { year: 2026, label: 'GUS', url: '' };
