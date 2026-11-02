// Oficjalne wagi koszyka CPI GUS na 2026 r. (COICOP 2018, 13 działów, %).
// Źródło: GUS, „Wskaźniki cen towarów i usług konsumpcyjnych we wrześniu 2026 r.” (14.10.2026), Wykres 2
// „System wag stosowany w obliczeniach wskaźników cen towarów i usług konsumpcyjnych w 2026 r., wg klasyfikacji
// COICOP 2018 (w %)” — ta sama tabela jest w każdym komunikacie miesięcznym 2026. DBW wag nie ma (zmienna 305,
// przekrój 1698 zwraca tylko miary 2, 5 i 8), więc to stała w kodzie. Spec: docs/specs/2026-11-02-twoja-inflacja.md.
// Wagi 2027 GUS poda w komunikacie za styczeń 2027 (luty–marzec) — dopisać razem z ROADMAP P2.

export interface CpiWeight { code: string; name: string; weight: number }

export const CPI_WEIGHTS_2026: readonly CpiWeight[] = [
    { code: '01', name: 'Żywność i napoje bezalk.', weight: 25.91 },
    { code: '02', name: 'Alkohol i tytoń', weight: 4.81 },
    { code: '03', name: 'Odzież i obuwie', weight: 3.75 },
    { code: '04', name: 'Mieszkanie, woda, energia', weight: 20.35 },
    { code: '05', name: 'Wyposażenie mieszkania', weight: 5.18 },
    { code: '06', name: 'Zdrowie', weight: 6.2 },
    { code: '07', name: 'Transport', weight: 10.18 },
    { code: '08', name: 'Informacja i komunikacja', weight: 5.02 },
    { code: '09', name: 'Rekreacja, sport i kultura', weight: 6.37 },
    { code: '10', name: 'Edukacja', weight: 1.03 },
    { code: '11', name: 'Restauracje i hotele', weight: 5.55 },
    { code: '12', name: 'Ubezpieczenia i usługi fin.', weight: 1.24 },
    { code: '13', name: 'Higiena i pozostałe', weight: 4.41 },
];

/** Pełne nazwy działów wg GUS (etykiety dla czytników i `title`). */
export const CPI_DIVISION_FULL_NAMES: Readonly<Record<string, string>> = {
    '01': 'Żywność i napoje bezalkoholowe',
    '02': 'Napoje alkoholowe i wyroby tytoniowe',
    '03': 'Odzież i obuwie',
    '04': 'Użytkowanie mieszkania lub domu, zaopatrzenie w wodę, energię elektryczną, gaz i inne paliwa',
    '05': 'Wyposażenie mieszkania i prowadzenie gospodarstwa domowego',
    '06': 'Zdrowie',
    '07': 'Transport',
    '08': 'Informacja i komunikacja',
    '09': 'Rekreacja, sport i kultura',
    '10': 'Edukacja',
    '11': 'Restauracje i usługi zakwaterowania',
    '12': 'Ubezpieczenia i usługi finansowe',
    '13': 'Higiena osobista, ochrona socjalna oraz pozostałe towary i usługi',
};

export const CPI_WEIGHTS_SOURCE = {
    year: 2026,
    label: 'GUS, system wag 2026 (COICOP 2018)',
    url: 'https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/wskazniki-cen-towarow-i-uslug-konsumpcyjnych-we-wrzesniu-2026-r-,2,179.html',
} as const;

const WEIGHT_BY_CODE = new Map(CPI_WEIGHTS_2026.map((d) => [d.code, d.weight]));

interface DivisionLike { code: string; weight: number; yoy: number | null; contribution: number | null }

/**
 * Nakłada oficjalne wagi na odpowiedź `gus-cpi-full` PO `withCache` — poprawka działa od razu, bez podbijania
 * klucza `v5` (to ~72 wywołania DBW). Wkład = waga × r/r / 100, tak jak liczyła trasa.
 */
export function applyOfficialWeights<T extends { divisions: D[]; weightsApprox?: boolean }, D extends DivisionLike>(payload: T): T {
    // Wpis bez działów (inny kształt, pusta odpowiedź) przechodzi bez zmian — nakładka nie może zrobić z niego 500.
    if (!payload || !Array.isArray(payload.divisions)) return payload;
    return {
        ...payload,
        weightsApprox: false,
        divisions: payload.divisions.map((d) => {
            const weight = WEIGHT_BY_CODE.get(d.code) ?? d.weight;
            return { ...d, weight, contribution: d.yoy != null ? +((weight / 100) * d.yoy).toFixed(2) : null };
        }),
    };
}
