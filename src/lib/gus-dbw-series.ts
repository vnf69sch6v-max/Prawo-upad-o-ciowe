// Konfiguracje serii GUS DBW współdzielone przez hooki (klient), crony warm i kontrolę świeżości.
// `/api/dbw-series` buforuje pod kluczem z (var, przekrój, poz, rok, freq, prez) — jeśli cron albo
// health-check zbuduje URL inaczej niż hook, ogrzeje/sprawdzi INNY wpis niż ten, który czyta użytkownik.
// Dlatego URL powstaje w jednym miejscu: `dbwSeriesPath()`.

export interface DbwSeriesConfig {
    var: number; przekroj: number; poz: number[];
    year?: number; freq?: 'm' | 'q'; prez?: number; poz1?: number; sub100?: boolean;
}

/** Sposób prezentacji DBW: „analogiczny okres roku poprzedniego=100; szereg niewyrównany; ceny stałe"
 *  — liczba z nagłówka komunikatu GUS (np. „produkcja sprzedana przemysłu wzrosła o 4,3% r/r"). */
export const DBW_PREZ_YOY_CONSTANT = 7;

// Wskaźniki krótkookresowe (miesięczne r/r). ⚠ Zmienna 312 / przekrój 93 to WSKAŹNIKI CEN produkcji
// budowlano-montażowej — do października 2026 Przegląd pokazywał ją jako „produkcję przemysłową"
// (poz 6661771 = ceny robót w dziale 42, inżynieria lądowa). Poprawne zmienne poniżej (zweryfikowane
// w katalogu DBW: variable-section-periods + variable-section-position).

/** Produkcja sprzedana przemysłu (DBW zm. 814), przekrój 807 „Przemysł – sekcje i działy PKD", poz „Przemysł". */
export const GUS_INDUSTRY_SERIES: DbwSeriesConfig = { var: 814, przekroj: 807, poz: [6661769], prez: DBW_PREZ_YOY_CONSTANT };

/** Produkcja budowlano-montażowa, dane krótkookresowe (DBW zm. 392), przekrój 93, poz „F – Budownictwo". */
export const GUS_CONSTRUCTION_SERIES: DbwSeriesConfig = { var: 392, przekroj: 93, poz: [6661787], prez: DBW_PREZ_YOY_CONSTANT };

/** Sprzedaż detaliczna towarów (DBW zm. 109), przekrój 849 (PKD 2007), poz „Sprzedaż detaliczna ogółem"
 *  — podmioty >9 osób, jak w komunikacie GUS. BDL (P3860) publikuje tę samą serię kilka tygodni później
 *  i w cenach bieżących, stąd Przegląd stał na lipcu, gdy GUS podał już sierpień. */
export const GUS_RETAIL_SERIES: DbwSeriesConfig = { var: 109, przekroj: 849, poz: [6661586], prez: DBW_PREZ_YOY_CONSTANT };

export function dbwSeriesParams(config: DbwSeriesConfig, year = new Date().getFullYear()): URLSearchParams {
    const { var: v, przekroj, poz, freq = 'm', prez = 5, poz1 = 33617, sub100 = true } = config;
    const qs = new URLSearchParams({
        var: String(v), przekroj: String(przekroj), year: String(config.year ?? year), freq,
        prez: String(prez), poz1: String(poz1), sub100: sub100 ? '1' : '0',
    });
    poz.forEach((p) => qs.append('poz', String(p)));
    return qs;
}

/** Ścieżka `/api/dbw-series?...` dla konfiguracji; `extra` dokleja np. `refresh=1` (cron). */
export function dbwSeriesPath(config: DbwSeriesConfig, extra: Record<string, string> = {}): string {
    const qs = dbwSeriesParams(config);
    for (const [k, v] of Object.entries(extra)) qs.set(k, v);
    return `/api/dbw-series?${qs}`;
}
