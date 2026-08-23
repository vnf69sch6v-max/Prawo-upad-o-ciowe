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
    /** Branża — do filtrowania i kontekstu dla inwestora detalicznego. */
    sector: string;
    /** Jednozdaniowy, rzeczowy opis działalności (fakt, nie prognoza). */
    description: string;
}

export const WIG20: Wig20Company[] = [
    { ticker: 'ALE', name: 'Allegro', aliases: ['allegro'], sector: 'E-commerce', description: 'Największa platforma e-commerce w Polsce — internetowy marketplace z milionami ofert i usługą Allegro Smart!.' },
    { ticker: 'ALR', name: 'Alior Bank', aliases: ['alior'], sector: 'Banki', description: 'Bank uniwersalny znany z bankowości cyfrowej oraz oferty dla klientów indywidualnych i firm.' },
    { ticker: 'BDX', name: 'Budimex', aliases: ['budimex'], sector: 'Budownictwo', description: 'Największa firma budowlana w Polsce — infrastruktura drogowa, kolejowa i budownictwo kubaturowe.' },
    { ticker: 'CDR', name: 'CD Projekt', aliases: ['cd projekt', 'cdprojekt', 'cyberpunk', 'wiedzmin'], sector: 'Gry i technologia', description: 'Producent gier wideo, twórca serii Wiedźmin i Cyberpunk 2077 oraz właściciel platformy GOG.' },
    { ticker: 'CPS', name: 'Cyfrowy Polsat', aliases: ['cyfrowy polsat', 'polsat'], sector: 'Media i telekom', description: 'Grupa medialno-telekomunikacyjna — telewizja Polsat oraz internet i telefonia w sieci Plus.' },
    { ticker: 'DNP', name: 'Dino Polska', aliases: ['dino'], sector: 'Handel detaliczny', description: 'Dynamicznie rosnąca sieć supermarketów spożywczych rozwijana głównie w mniejszych miejscowościach.' },
    { ticker: 'JSW', name: 'JSW', aliases: ['jastrzebska spolka weglowa', 'jsw'], sector: 'Surowce', description: 'Największy producent węgla koksowego i koksu w Unii Europejskiej, kluczowy surowiec dla hutnictwa.' },
    { ticker: 'KGH', name: 'KGHM', aliases: ['kghm'], sector: 'Surowce', description: 'Jeden z największych na świecie producentów miedzi i srebra, z kopalniami w Polsce i za granicą.' },
    { ticker: 'KRU', name: 'Kruk', aliases: ['kruk'], sector: 'Usługi finansowe', description: 'Lider zarządzania wierzytelnościami (windykacja) w Polsce i regionie Europy Środkowej.' },
    { ticker: 'KTY', name: 'Grupa Kęty', aliases: ['grupa kety', 'kety'], sector: 'Przemysł', description: 'Producent profili i wyrobów z aluminium oraz opakowań giętkich dla przemysłu i budownictwa.' },
    { ticker: 'LPP', name: 'LPP', aliases: ['lpp', 'reserved', 'sinsay'], sector: 'Handel detaliczny', description: 'Odzieżowy potentat — właściciel marek Reserved, Sinsay, Cropp, House i Mohito.' },
    { ticker: 'MBK', name: 'mBank', aliases: ['mbank'], sector: 'Banki', description: 'Jeden z największych banków w Polsce, pionier bankowości internetowej i mobilnej.' },
    { ticker: 'OPL', name: 'Orange Polska', aliases: ['orange polska', 'orange'], sector: 'Media i telekom', description: 'Największy operator telekomunikacyjny w Polsce — telefonia, internet światłowodowy i mobilny.' },
    { ticker: 'PCO', name: 'Pepco', aliases: ['pepco'], sector: 'Handel detaliczny', description: 'Sieć dyskontowa z artykułami dla domu, zabawkami i odzieżą w niskich cenach, obecna w całej Europie.' },
    { ticker: 'PEO', name: 'Pekao', aliases: ['pekao', 'bank pekao'], sector: 'Banki', description: 'Bank Pekao — jeden z największych banków uniwersalnych w Polsce, z silną pozycją w bankowości korporacyjnej.' },
    { ticker: 'PGE', name: 'PGE', aliases: ['pge', 'polska grupa energetyczna'], sector: 'Energetyka', description: 'Największa grupa energetyczna w Polsce — wytwarzanie i dystrybucja energii elektrycznej.' },
    { ticker: 'PKN', name: 'Orlen', aliases: ['orlen', 'pkn orlen'], sector: 'Paliwa i energia', description: 'Największy koncern paliwowo-energetyczny w regionie — rafinacja, sprzedaż paliw i petrochemia.' },
    { ticker: 'PKO', name: 'PKO BP', aliases: ['pko bp', 'pko bank'], sector: 'Banki', description: 'Największy bank w Polsce pod względem aktywów, z dominującą siecią bankowości detalicznej.' },
    { ticker: 'PZU', name: 'PZU', aliases: ['pzu'], sector: 'Ubezpieczenia', description: 'Największa grupa ubezpieczeniowa w Europie Środkowo-Wschodniej, obecna też w bankowości i zdrowiu.' },
    { ticker: 'ZAB', name: 'Żabka', aliases: ['zabk'], sector: 'Handel detaliczny', description: 'Największa w Polsce sieć sklepów typu convenience — format „na rogu" z szybkimi zakupami.' },
    { ticker: 'TPE', name: 'Tauron', aliases: ['tauron'], sector: 'Energetyka', description: 'Grupa energetyczna z południa Polski — dystrybucja i wytwarzanie energii elektrycznej.' },
];

/** Tickery do whitelisty detektora clickbaitu (ALL-CAPS nie może karać newsów o spółkach). */
export const WIG20_TICKERS = WIG20.map((c) => c.ticker);
