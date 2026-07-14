// Dane statyczne — wskaźniki bez darmowego API (aktualizowane ręcznie, z datą i źródłem).
// STATIC_MACRO/CPI_DATA_PL/GDP_QUARTERLY_PL usunięte — zastąpione żywymi hookami (Eurostat/GUS DBW).

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
// PMI Manufacturing Poland (S&P Global, monthly, 2020–2026)
// Source: S&P Global / Markit Poland Manufacturing PMI
// Ostatnia weryfikacja: VII.2026 — wartości sty–cze 2026 z komunikatów prasowych S&P Global
// (sty 48,8 · lut 47,1 · mar 48,7 · kwi 48,8 · maj 49,4 · cze 46,1).
// ═══════════════════════════════════════════════════════════════

export const PMI_DATA_PL: { date: string; value: number }[] = [
    { date: '2020-01', value: 47.4 }, { date: '2020-02', value: 48.2 },
    { date: '2020-03', value: 42.4 }, { date: '2020-04', value: 31.9 },
    { date: '2020-05', value: 40.6 }, { date: '2020-06', value: 47.2 },
    { date: '2020-07', value: 52.8 }, { date: '2020-08', value: 50.6 },
    { date: '2020-09', value: 50.8 }, { date: '2020-10', value: 50.8 },
    { date: '2020-11', value: 50.8 }, { date: '2020-12', value: 51.7 },
    { date: '2021-01', value: 51.9 }, { date: '2021-02', value: 53.4 },
    { date: '2021-03', value: 54.3 }, { date: '2021-04', value: 53.7 },
    { date: '2021-05', value: 57.2 }, { date: '2021-06', value: 59.4 },
    { date: '2021-07', value: 57.6 }, { date: '2021-08', value: 56.0 },
    { date: '2021-09', value: 53.4 }, { date: '2021-10', value: 53.8 },
    { date: '2021-11', value: 54.4 }, { date: '2021-12', value: 56.1 },
    { date: '2022-01', value: 54.5 }, { date: '2022-02', value: 52.4 },
    { date: '2022-03', value: 52.7 }, { date: '2022-04', value: 52.4 },
    { date: '2022-05', value: 48.5 }, { date: '2022-06', value: 44.4 },
    { date: '2022-07', value: 42.1 }, { date: '2022-08', value: 40.9 },
    { date: '2022-09', value: 43.0 }, { date: '2022-10', value: 42.0 },
    { date: '2022-11', value: 43.4 }, { date: '2022-12', value: 45.6 },
    { date: '2023-01', value: 47.5 }, { date: '2023-02', value: 48.5 },
    { date: '2023-03', value: 48.3 }, { date: '2023-04', value: 47.0 },
    { date: '2023-05', value: 47.0 }, { date: '2023-06', value: 45.1 },
    { date: '2023-07', value: 43.7 }, { date: '2023-08', value: 43.1 },
    { date: '2023-09', value: 43.9 }, { date: '2023-10', value: 44.5 },
    { date: '2023-11', value: 48.7 }, { date: '2023-12', value: 47.4 },
    { date: '2024-01', value: 47.1 }, { date: '2024-02', value: 47.9 },
    { date: '2024-03', value: 48.0 }, { date: '2024-04', value: 45.9 },
    { date: '2024-05', value: 45.0 }, { date: '2024-06', value: 45.0 },
    { date: '2024-07', value: 47.3 }, { date: '2024-08', value: 47.8 },
    { date: '2024-09', value: 48.6 }, { date: '2024-10', value: 49.2 },
    { date: '2024-11', value: 48.9 }, { date: '2024-12', value: 48.2 },
    { date: '2025-01', value: 48.6 }, { date: '2025-02', value: 50.6 },
    { date: '2025-03', value: 50.7 }, { date: '2025-04', value: 50.4 },
    { date: '2025-05', value: 49.8 }, { date: '2025-06', value: 49.2 },
    { date: '2025-07', value: 48.9 }, { date: '2025-08', value: 48.4 },
    { date: '2025-09', value: 48.6 }, { date: '2025-10', value: 49.1 },
    { date: '2025-11', value: 48.9 }, { date: '2025-12', value: 48.5 },
    { date: '2026-01', value: 48.8 }, { date: '2026-02', value: 47.1 },
    { date: '2026-03', value: 48.7 }, { date: '2026-04', value: 48.8 },
    { date: '2026-05', value: 49.4 }, { date: '2026-06', value: 46.1 },
];

// NBP GDP projection (dla porównania z nowcastem) — „Projekcja inflacji i PKB", raport o inflacji.
// Zweryfikowane VII.2026: PKB 2026 3,7% (marzec: 3,9%), 2027 2,8%, 2028 3,0%; inflacja 2026 2,9%.
export const NBP_GDP_PROJECTION = {
    year2025: 3.4,
    year2026: 3.7,
    year2027: 2.8,
    source: 'Projekcja NBP, VII.2026',
};
