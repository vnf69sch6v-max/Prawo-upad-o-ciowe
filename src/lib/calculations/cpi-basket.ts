// CPI z koszyka inflacyjnego GUS — rekonstrukcja headline CPI z 12 dywizji COICOP.
// Nowcast = Σ (waga_i × YoY_i). Wagi aktualizowane przez GUS co luty (struktura
// wydatków gosp. domowych z roku poprzedniego). Poniżej przybliżenie 2026 (COICOP 2018).
// Wartości YoY komponentów pobierane na żywo z Eurostat HICP (prc_hicp_manr, per COICOP).

export interface BasketDivision {
    code: string;      // CP01..CP12
    coicop: string;    // Eurostat COICOP code (same here)
    name: string;
    weight: number;    // % of the basket (sum ≈ 100)
}

// Przybliżone wagi koszyka 2026 (do zweryfikowania z komunikatem GUS z lutego).
export const COICOP_2026: BasketDivision[] = [
    { code: 'CP01', coicop: 'CP01', name: 'Żywność i napoje bezalkoholowe', weight: 25.9 },
    { code: 'CP04', coicop: 'CP04', name: 'Mieszkanie, woda, energia, paliwa', weight: 20.4 },
    { code: 'CP07', coicop: 'CP07', name: 'Transport', weight: 10.2 },
    { code: 'CP11', coicop: 'CP11', name: 'Restauracje i hotele', weight: 6.4 },
    { code: 'CP06', coicop: 'CP06', name: 'Zdrowie', weight: 6.3 },
    { code: 'CP02', coicop: 'CP02', name: 'Napoje alkoholowe i wyroby tytoniowe', weight: 6.1 },
    { code: 'CP09', coicop: 'CP09', name: 'Rekreacja i kultura', weight: 5.9 },
    { code: 'CP08', coicop: 'CP08', name: 'Łączność', weight: 5.5 },
    { code: 'CP05', coicop: 'CP05', name: 'Wyposażenie mieszkania', weight: 5.1 },
    { code: 'CP03', coicop: 'CP03', name: 'Odzież i obuwie', weight: 4.2 },
    { code: 'CP12', coicop: 'CP12', name: 'Inne towary i usługi', weight: 3.0 },
    { code: 'CP10', coicop: 'CP10', name: 'Edukacja', weight: 1.0 },
];

export const BASKET_WEIGHTS_YEAR = 2026;

export interface BasketItem extends BasketDivision {
    yoy: number | null;         // roczna dynamika komponentu (%)
    contribution: number | null; // wkład do headline (pp) = weight/100 × yoy
}

export interface BasketResult {
    headlineNowcast: number | null; // Σ contributions (pp)
    official: number | null;        // oficjalny CP00 (do porównania)
    items: BasketItem[];            // posortowane wg wkładu malejąco
    dataDate: string | null;
    coverage: number;               // % koszyka pokryty danymi
}

export function buildBasket(
    divisions: BasketDivision[],
    yoyByCode: Record<string, number | null>,
    official: number | null,
    dataDate: string | null,
): BasketResult {
    const items: BasketItem[] = divisions.map((d) => {
        const yoy = yoyByCode[d.code] ?? null;
        return { ...d, yoy, contribution: yoy != null ? +((d.weight / 100) * yoy).toFixed(3) : null };
    });
    const covered = items.filter((i) => i.contribution != null);
    const headlineNowcast = covered.length
        ? +covered.reduce((s, i) => s + (i.contribution as number), 0).toFixed(2)
        : null;
    const coverage = +covered.reduce((s, i) => s + i.weight, 0).toFixed(1);

    items.sort((a, b) => (b.contribution ?? -99) - (a.contribution ?? -99));
    return { headlineNowcast, official, items, dataDate, coverage };
}
