// Konfiguracje serii GUS DBW współdzielone przez hooki (klient), crony warm, kontrolę świeżości i walidację
// `/api/dbw-series`. Trasa buforuje pod kluczem z (var, przekrój, poz, rok, freq, prez) — jeśli cron albo
// health-check zbuduje URL inaczej niż hook, ogrzeje/sprawdzi INNY wpis niż ten, który czyta użytkownik.
// Dlatego URL powstaje w jednym miejscu (`dbwSeriesPath()` w src/lib/gus-api-paths.ts), a trasa przyjmuje
// wyłącznie serie z `DBW_SERIES` (specyfikacja docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md, B3).

export interface DbwSeriesConfig {
    var: number; przekroj: number; poz: number[];
    freq?: 'm' | 'q'; prez?: number;
    /** Wartość podana wprost (np. stopa w %), bez odejmowania 100 jak przy indeksach. */
    raw?: boolean;
    /** Przekrój bez `id-pozycja-2` (np. 143: tylko terytorium) — `poz` to wtedy `id-pozycja-1`. */
    level1?: boolean;
}

/** Sposób prezentacji DBW: „analogiczny okres roku poprzedniego=100; szereg niewyrównany; ceny stałe"
 *  — liczba z nagłówka komunikatu GUS (np. „produkcja sprzedana przemysłu wzrosła o 4,3% r/r"). */
export const DBW_PREZ_YOY_CONSTANT = 7;

/** Wszystkie serie dotyczą Polski (`id-pozycja-1`) i są pokazywane jako odchylenie od 100. */
export const DBW_POLSKA = 33617;

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

/** Ceny mieszkań (DBW zm. 310), przekrój 484, rynek pierwotny i wtórny — kwartalnie (/ceny → Nieruchomości). */
export const GUS_HOUSE_PRICES_SERIES: DbwSeriesConfig = { var: 310, przekroj: 484, poz: [4801795, 4801796], freq: 'q' };

/** Ceny robót budowlano-montażowych (DBW zm. 312), przekrój 93, „F – Budownictwo" (/ceny → Budowlane). */
export const GUS_CONSTRUCTION_PRICES_SERIES: DbwSeriesConfig = { var: 312, przekroj: 93, poz: [6661787] };

/** Ceny skupu produktów rolnych (DBW zm. 324), przekrój 775: pszenica, żyto, bydło, trzoda, mleko (/ceny → Rolne). */
export const GUS_AGRI_PRICES_SERIES: DbwSeriesConfig = { var: 324, przekroj: 775, poz: [7124703, 7124713, 7124724, 7189791, 7121981] };

/** Stopa bezrobocia rejestrowanego (DBW zm. 875), przekrój 143 „Polska, województwa, powiaty", miara 95 [%].
 *  Przekrój nie ma `id-pozycja-2`, więc seria to wiersz Polski (`id-pozycja-1` = 33617), a wartość to stopa wprost.
 *  BDL (P3559) dostawał miesiąc kilka tygodni po komunikacie GUS — hero Przeglądu stał miesiąc z tyłu (ROADMAP P4). */
export const GUS_UNEMPLOYMENT_SERIES: DbwSeriesConfig = { var: 875, przekroj: 143, poz: [33617], prez: 95, raw: true, level1: true };

/** Jedyne serie, które przyjmuje `/api/dbw-series` (i `/api/dbw`). Nowa seria = nowy wpis tutaj. */
export const DBW_SERIES = {
    industry: GUS_INDUSTRY_SERIES,
    construction: GUS_CONSTRUCTION_SERIES,
    retail: GUS_RETAIL_SERIES,
    housePrices: GUS_HOUSE_PRICES_SERIES,
    constructionPrices: GUS_CONSTRUCTION_PRICES_SERIES,
    agriPrices: GUS_AGRI_PRICES_SERIES,
    unemployment: GUS_UNEMPLOYMENT_SERIES,
} as const satisfies Record<string, DbwSeriesConfig>;

export type DbwSeriesId = keyof typeof DBW_SERIES;

/** Parametry zapytania bez roku — rok ustala serwer (strefa Europe/Warsaw), nie zegar urządzenia. */
export function dbwSeriesParams(id: DbwSeriesId): URLSearchParams {
    const { var: v, przekroj, poz, freq = 'm', prez = 5 } = DBW_SERIES[id];
    const qs = new URLSearchParams({
        var: String(v), przekroj: String(przekroj), freq, prez: String(prez), poz1: String(DBW_POLSKA), sub100: '1',
    });
    poz.forEach((p) => qs.append('poz', String(p)));
    return qs;
}

/** Klucz cache trasy — ten sam format co przed walidacją (B8), więc wdrożenie nie zeruje cache. */
export function dbwSeriesCacheKey(id: DbwSeriesId, year: number): string {
    const { var: v, przekroj, poz, freq = 'm', prez = 5 } = DBW_SERIES[id];
    return `dbwser_${v}_${przekroj}_${poz.join('-')}_${year}_${freq}_${prez}_v3`.slice(0, 120);
}

export interface DbwDataRow { 'id-pozycja-1': number; 'id-pozycja-2'?: number; 'id-sposob-prezentacji-miara': number; wartosc: number | null }

/** Wartości serii w jednym okresie DBW: klucz = `poz`, wartość = odchylenie od 100 (indeksy) albo wprost (`raw`).
 *  `wartosc === 0` to placeholder „brak publikacji" i jest pomijany (luka zamiast fałszywego −100% albo 0%). */
export function pickDbwPoint(rows: DbwDataRow[], cfg: DbwSeriesConfig): Record<string, number> {
    const { poz, prez = 5, raw = false, level1 = false } = cfg;
    const out: Record<string, number> = {};
    for (const p of poz) {
        const r = rows.find((x) => (level1
            ? x['id-pozycja-1'] === p
            : x['id-pozycja-1'] === DBW_POLSKA && x['id-pozycja-2'] === p) && x['id-sposob-prezentacji-miara'] === prez);
        if (r && r.wartosc != null && r.wartosc !== 0) out[String(p)] = raw ? +r.wartosc.toFixed(1) : +(r.wartosc - 100).toFixed(1);
    }
    return out;
}
