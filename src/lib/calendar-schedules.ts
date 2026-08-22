// Harmonogramy publikacji — daty zweryfikowane u GUS/NBP (2026) + heurystyki dla innych lat.
// Źródła: stat.gov.pl/kalendarz-roczny, stat.gov.pl/kalendarium, nbp.pl/decyzje-rpp

/** Święta państwowe PL (ISO) — do liczenia ostatniego dnia roboczego. */
const PL_HOLIDAYS: Record<number, string[]> = {
    2025: ['2025-01-01', '2025-01-06', '2025-04-20', '2025-04-21', '2025-05-01', '2025-05-03', '2025-06-19', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25', '2025-12-26'],
    2026: ['2026-01-01', '2026-01-06', '2026-04-05', '2026-04-06', '2026-05-01', '2026-05-03', '2026-06-04', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25', '2026-12-26'],
    2027: ['2027-01-01', '2027-01-06', '2027-03-28', '2027-03-29', '2027-05-01', '2027-05-03', '2027-05-27', '2027-08-15', '2027-11-01', '2027-11-11', '2027-12-25', '2027-12-26'],
};

function isoLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function isHoliday(iso: string, year: number): boolean {
    return (PL_HOLIDAYS[year] ?? []).includes(iso);
}

function isBusinessDay(d: Date): boolean {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return false;
    return !isHoliday(isoLocal(d), d.getFullYear());
}

/** Ostatni dzień roboczy miesiąca (flash CPI GUS). */
export function lastBusinessDayOfMonth(year: number, month: number): string {
    for (let day = new Date(year, month, 0).getDate(); day >= 1; day--) {
        const d = new Date(year, month - 1, day);
        if (isBusinessDay(d)) return isoLocal(d);
    }
    return `${year}-${String(month).padStart(2, '0')}-28`;
}

/** Przesuń datę na najbliższy dzień roboczy do przodu. */
export function nextBusinessDay(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    while (!isBusinessDay(cur)) cur.setDate(cur.getDate() + 1);
    return isoLocal(cur);
}

const MONTHS_PL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'] as const;

export function monthNamePl(m: number): string {
    return MONTHS_PL[m - 1] ?? String(m);
}

// ─── NBP RPP — dzień ogłoszenia decyzji (2. dzień posiedzenia) ───

export const RPP_DECISIONS: Record<number, string[]> = {
    2025: ['2025-01-08', '2025-02-05', '2025-03-05', '2025-04-02', '2025-05-07', '2025-06-04', '2025-07-02', '2025-09-03', '2025-10-08', '2025-11-05', '2025-12-03'],
    2026: ['2026-01-14', '2026-02-04', '2026-03-04', '2026-04-09', '2026-05-06', '2026-06-02', '2026-07-08', '2026-09-02', '2026-10-07', '2026-11-04', '2026-12-02'],
};

// ─── GUS CPI wstępne — dzień publikacji → dane za miesiąc (M-1) ───
// Zweryfikowane: stat.gov.pl/kalendarz-roczny + komunikaty sygnalne 2026.

export const CPI_PRELIMINARY_PUBLISH: Record<number, Record<number, string>> = {
    2026: {
        2: '2026-02-13',  // za styczeń
        3: '2026-03-13',  // za luty
        4: '2026-04-15',  // za marzec
        5: '2026-05-15',  // za kwiecień
        6: '2026-06-15',  // za maj (harmonogram roczny)
        7: '2026-07-15',  // za czerwiec (zweryfikowane)
        8: '2026-08-13',  // za lipiec (zweryfikowane)
        9: '2026-09-14',  // za sierpień
        10: '2026-10-15', // za wrzesień
        11: '2026-11-13', // za październik
        12: '2026-12-15', // za listopad
    },
};

// ─── GUS PKB flash — dzień publikacji ───

export const GDP_FLASH_PUBLISH: Record<number, { date: string; quarter: number; dataYear: number }[]> = {
    2026: [
        { date: '2026-02-13', quarter: 4, dataYear: 2025 },
        { date: '2026-04-14', quarter: 1, dataYear: 2026 },
        { date: '2026-08-13', quarter: 2, dataYear: 2026 },
        { date: '2026-11-13', quarter: 3, dataYear: 2026 },
    ],
};

// ─── GUS rynek pracy — bezrobocie rejestrowane (dzień publikacji w miesiącu M → dane za M-1) ───

export const UNEMPLOYMENT_PUBLISH: Record<number, Record<number, string>> = {
    2026: {
        2: '2026-02-25', 3: '2026-03-25', 4: '2026-04-24', 5: '2026-05-26', 6: '2026-06-24',
        7: '2026-07-24', 8: '2026-08-25', 9: '2026-09-24', 10: '2026-10-26', 11: '2026-11-25', 12: '2026-12-23',
    },
};

// ─── GUS produkcja przemysłowa + sprzedaż detaliczna (~20. dnia, dane za M-1) ───

export const INDUSTRIAL_PUBLISH: Record<number, Record<number, string>> = {
    2026: {
        2: '2026-02-20', 3: '2026-03-20', 4: '2026-04-21', 5: '2026-05-20', 6: '2026-06-19',
        7: '2026-07-20', 8: '2026-08-20', 9: '2026-09-21', 10: '2026-10-20', 11: '2026-11-20', 12: '2026-12-18',
    },
};

export const RETAIL_PUBLISH: Record<number, Record<number, string>> = {
    2026: {
        2: '2026-02-20', 3: '2026-03-20', 4: '2026-04-21', 5: '2026-05-20', 6: '2026-06-19',
        7: '2026-07-20', 8: '2026-08-20', 9: '2026-09-21', 10: '2026-10-20', 11: '2026-11-20', 12: '2026-12-18',
    },
};

/** CPI wstępne — heurystyka gdy brak tabeli: ~13–15. dnia M+1. */
export function cpiPreliminaryDate(year: number, publishMonth: number): string {
    const verified = CPI_PRELIMINARY_PUBLISH[year]?.[publishMonth];
    if (verified) return verified;
    const dataMonth = publishMonth === 1 ? 12 : publishMonth - 1;
    const dataYear = publishMonth === 1 ? year - 1 : year;
    const day = publishMonth === 2 ? 13 : 15; // GUS często 13 w lutym, 15 w pozostałych
    const raw = `${year}-${String(publishMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return nextBusinessDay(raw);
}

/** Bezrobocie — heurystyka: ~25. dnia miesiąca publikacji. */
export function unemploymentDate(year: number, publishMonth: number): string {
    const verified = UNEMPLOYMENT_PUBLISH[year]?.[publishMonth];
    if (verified) return verified;
    const raw = `${year}-${String(publishMonth).padStart(2, '0')}-25`;
    return nextBusinessDay(raw);
}

/** Produkcja / sprzedaż — heurystyka: ~20. dnia. */
export function industrialDate(year: number, publishMonth: number): string {
    const verified = INDUSTRIAL_PUBLISH[year]?.[publishMonth];
    if (verified) return verified;
    const raw = `${year}-${String(publishMonth).padStart(2, '0')}-20`;
    return nextBusinessDay(raw);
}

export function retailDate(year: number, publishMonth: number): string {
    const verified = RETAIL_PUBLISH[year]?.[publishMonth];
    if (verified) return verified;
    return industrialDate(year, publishMonth);
}
