// Skład WIG20 — WYŁĄCZNIE tickery zweryfikowane realnym żądaniem do Yahoo (2026-07-17).
// Każdy z poniższych zwrócił 125 punktów historii dziennej i kurs w PLN.
//
// ⚠️ Santander Bank Polska (GPW: SPL) ODRZUCONY — nie ma działającego tickera na Yahoo:
//    `SPL.WA` → błąd, `SPL1.WA` → błąd, `BZW.WA` → brak danych.
//    `SAN.WA` to Banco Santander S.A. (hiszpańska spółka matka), a `STP.WA` to Stalprodukt —
//    PODSTAWIENIE ICH BYŁOBY FAŁSZEM. Lepiej pokazać 21 spółek niż 22 z jedną zmyśloną.
//
// UWAGA przy dodawaniu spółek: tickery są ALL-CAPS, więc muszą trafić na whitelistę detektora
// clickbaitu w `lib/news/score.ts` (CAPS_WHITELIST) — inaczej nasz własny ranking ukarałby
// newsy o KGHM czy PKN jako „krzyczące".

export interface Wig20Company {
    /** Ticker GPW (bez sufiksu). Symbol Yahoo = `${ticker}.WA`. */
    ticker: string;
    name: string;
    /** Frazy do dopasowania newsów — nazwa i jej odmiany, bez diakrytyków (porównanie po `norm()`). */
    aliases: string[];
}

export const WIG20: Wig20Company[] = [
    { ticker: 'ALE', name: 'Allegro', aliases: ['allegro'] },
    { ticker: 'ALR', name: 'Alior Bank', aliases: ['alior'] },
    { ticker: 'BDX', name: 'Budimex', aliases: ['budimex'] },
    { ticker: 'CDR', name: 'CD Projekt', aliases: ['cd projekt', 'cdprojekt', 'cyberpunk', 'wiedzmin'] },
    { ticker: 'CPS', name: 'Cyfrowy Polsat', aliases: ['cyfrowy polsat', 'polsat'] },
    { ticker: 'DNP', name: 'Dino Polska', aliases: ['dino'] },
    { ticker: 'JSW', name: 'JSW', aliases: ['jastrzebska spolka weglowa', 'jsw'] },
    { ticker: 'KGH', name: 'KGHM', aliases: ['kghm'] },
    { ticker: 'KRU', name: 'Kruk', aliases: ['kruk'] },
    { ticker: 'KTY', name: 'Grupa Kęty', aliases: ['grupa kety', 'kety'] },
    { ticker: 'LPP', name: 'LPP', aliases: ['lpp', 'reserved', 'sinsay'] },
    { ticker: 'MBK', name: 'mBank', aliases: ['mbank'] },
    { ticker: 'OPL', name: 'Orange Polska', aliases: ['orange polska', 'orange'] },
    { ticker: 'PCO', name: 'Pepco', aliases: ['pepco'] },
    { ticker: 'PEO', name: 'Pekao', aliases: ['pekao', 'bank pekao'] },
    { ticker: 'PGE', name: 'PGE', aliases: ['pge', 'polska grupa energetyczna'] },
    { ticker: 'PKN', name: 'Orlen', aliases: ['orlen', 'pkn orlen'] },
    { ticker: 'PKO', name: 'PKO BP', aliases: ['pko bp', 'pko bank'] },
    { ticker: 'PZU', name: 'PZU', aliases: ['pzu'] },
    { ticker: 'ZAB', name: 'Żabka', aliases: ['zabka'] },
    { ticker: 'TPE', name: 'Tauron', aliases: ['tauron'] },
];

/** Tickery do whitelisty detektora clickbaitu (ALL-CAPS nie może karać newsów o spółkach). */
export const WIG20_TICKERS = WIG20.map((c) => c.ticker);
