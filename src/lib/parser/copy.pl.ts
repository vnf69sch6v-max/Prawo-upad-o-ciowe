// lib/copy.pl.ts — Polish UI chrome. Parser/export internals stay English;
// components look up display strings here.

import type { MetricKey } from "./types";

export const pl = {
  app: {
    title: "report-parser",
    subtitle: "ekstrakcja sprawozdań finansowych",
    badgeLocal: "plik zostaje na urządzeniu",
    badgeNoLlm: "reguły, nie model",
  },
  tabs: {
    results: "Wyniki",
    all: "Wszystkie liczby",
    raw: "Surowy tekst",
  },
  meta: {
    pages: (n: number) => `${n} stron`,
    chars: (n: number) => `${n.toLocaleString("pl-PL")} znaków`,
    ms: (n: number) => `${n} ms`,
  },
  upload: {
    drop: "Upuść raport (HTML z SEC, PDF) lub kliknij, aby wybrać",
    browse: "najdokładniej: plik .htm z EDGAR (dane XBRL) · PDF do 100 MB i 800 stron",
    sampleHint: "lub wczytaj przykład (bez pliku)",
    uploading: "Wysyłam na serwer…",
    extractingLocal: "Czytam plik w przeglądarce…",
    parsing: "Parsowanie…",
    parsed: "przetworzono",
    uploadAnother: "Wczytaj kolejny",
    uploadFailed: "Nie udało się odczytać pliku",
    tryAgain: "Spróbuj ponownie",
  },
  empty: {
    title: "Wczytaj raport, aby zacząć",
    errorTitle: "Coś poszło nie tak",
    body:
      "Wgraj PDF sprawozdania: 10-Q, 10-K, raport kwartalny lub roczny. Analiza odbywa się w Twojej przeglądarce — plik nie jest wysyłany na serwer. Parsowanie regułami, bez AI.",
    orSample: "Albo wczytaj przykład",
    badges: ["Wodospad", "Segmenty · produkty", "Wskaźniki · FCF", "CSV · XLSX · JSON"],
  },
  toast: {
    needPdf: "Wgraj plik HTML (.htm z EDGAR), PDF lub .txt.",
    tooLarge: "Plik za duży — limit 100 MB. Wgraj samo sprawozdanie finansowe.",
    parsed: (name: string, matched: number, total: number) =>
      `Przetworzono ${name} — ${matched}/${total} metryk`,
    parseFailed: "Parsowanie nie powiodło się.",
    sampleFailed: "Nie udało się wczytać przykładu.",
    exportOk: (name: string) => `Wyeksportowano ${name}`,
    exportFail: "Eksport nie powiódł się.",
  },
  scale: {
    unitHint: "Skala",
    auto: "Auto",
    B: "Mld",
    M: "Mln",
    K: "Tys",
    raw: "1:1",
  },
  hero: {
    revenue: "Przychody",
    netIncome: "Zysk netto",
    fcf: "Wolne przepływy (FCF)",
    netCash: "Gotówka netto",
    netDebt: "Dług netto",
  },
  statements: {
    income: "Rachunek zysków i strat",
    balance: "Bilans",
    cashflow: "Przepływy pieniężne",
    lineItem: "Pozycja",
    showSource: "Pokaż wiersz źródłowy",
  },
  allRows: {
    title: "Wszystkie wyciągnięte liczby",
    unit: (n: number) => `${n} wierszy z etykietą`,
    filterPlaceholder: "Filtruj etykiety…",
    kindAll: "Wszystkie",
    kindIncome: "RZiS",
    kindBalance: "Bilans",
    kindOther: "Inne",
    moneyOnly: "Tylko kwoty",
    empty: "Brak wierszy pasujących do filtra.",
    showing: (shown: number, total: number) => `Pokazano ${shown} z ${total} wierszy.`,
    colLabel: "Etykieta",
    sectionIncome: "Rachunek zysków i strat",
    sectionBalance: "Bilans",
    sectionOther: "Pozostałe / niesklasyfikowane",
  },
  ratios: {
    profitability: (period: string) => `Rentowność · ${period}`,
    grossMargin: "Marża brutto",
    operatingMargin: "Marża operacyjna",
    netMargin: "Marża netto",
    fcfTitle: (period: string) => `Wolne przepływy · ${period}`,
    ocf: "Przepływy operacyjne",
    capex: "− CapEx",
    fcf: "Wolne przepływy",
    advanced: "Wskaźniki",
    advancedUnit: "jakość · zwroty · dźwignia · płynność",
  },
  cash: {
    netCashTitle: (period: string) => `Gotówka netto · ${period}`,
    netCash: "Gotówka netto",
    netDebt: "Dług netto",
    totalDebt: "Zadłużenie ogółem",
    cash: "Gotówka i ekwiwalenty",
    stInv: "Inwestycje krótkoterminowe",
    netExcl: "Gotówka netto (bez KT)",
    netIncl: "Gotówka netto (z KT)",
    returnsTitle: (period: string) => `Zwroty dla akcjonariuszy · ${period}`,
    dividends: "Wypłacone dywidendy",
    buybacks: "Wykup akcji własnych",
    totalReturned: "Łącznie zwrócono",
    payoutFcf: "Wypłata z FCF",
  },
  perShare: {
    title: (period: string) => `Na akcję · ${period}`,
    epsBasic: "EPS podstawowy",
    epsDiluted: "EPS rozwodniony",
    dps: "Dywidenda / akcję",
    shares: "Akcje rozwodnione",
  },
  segments: {
    title: (period: string) => `Segmenty · ${period}`,
    reconciled: "Uzgodnione",
    checkTotals: "Sprawdź sumy",
    opIncome: "zysk operacyjny",
    costs: "koszty",
    total: "Razem",
    op: "op",
  },
  products: {
    title: (period: string) => `Przychody wg produktu · ${period}`,
    reconciled: "Uzgodnione",
    checkTotal: "Sprawdź sumę",
  },
  charts: {
    pnl: (period: string) => `Wodospad RZiS · ${period}`,
    pnlSub: "przychody → zysk netto",
    tiesNet: (v: string) => `stopnie sumują się do zysku netto ${v}`,
    capital: (period: string) => `Alokacja kapitału · ${period}`,
    payoutOfFcf: (pct: string) => `wypłata ${pct} FCF`,
    retainedAfter: (v: string) => `zatrzymano ${v} po zwrotach`,
    composition: (kind: string) => `Struktura przychodów · ${kind}`,
    bySegment: "wg segmentu",
    byProduct: "wg produktu",
    revenue: "Przychody",
    costOfRev: "− Koszt sprzedaży",
    grossProfit: "Zysk brutto",
    opEx: "− Koszty operacyjne",
    totalCosts: "− Koszty razem",
    opIncome: "Zysk operacyjny",
    otherTaxAdd: "+ Pozostałe − podatek",
    otherTaxSub: "− Pozostałe i podatek",
    netIncome: "Zysk netto",
    fcf: "Wolne przepływy",
    dividends: "− Dywidendy",
    buybacks: "− Wykup akcji",
    retained: "Zatrzymane",
  },
  validation: {
    title: "Walidacja danych",
    passed: (a: number, b: number) => `${a}/${b} OK`,
  },
  detection: {
    title: "Detekcja",
    unknownIssuer: "Nieznany emitent",
    unknownForm: "Nieznany formularz",
    metrics: (a: number, b: number) => `${a}/${b} metryk`,
  },
  pipeline: {
    title: "Pipeline",
  },
  raw: {
    search: "Szukaj w wyciągniętym tekście…",
    lines: (shown: number, total: number) =>
      `${shown.toLocaleString("pl-PL")} / ${total.toLocaleString("pl-PL")} linii`,
    capped: (shown: number, total: number) =>
      `Pokazano ${shown.toLocaleString("pl-PL")} z ${total.toLocaleString("pl-PL")} wierszy — zawęź wyszukiwaniem.`,
  },
  source: {
    sourceLine: (n: string) => `Źródło · wiersz ${n}`,
    matched: (label: string) => `dopasowano: „${label}”`,
  },
  oneOff: {
    title: "Wykryto pozycję one-off / non-GAAP",
    gaap: "Zysk netto GAAP",
    adjusted: "Skorygowany",
    estimate: "One-off ≈",
  },
  confidence: {
    HIGH: "Wysoka",
    MEDIUM: "Średnia",
    LOW: "Niska",
    title: (level: string, matched?: string) =>
      matched ? `Pewność ${level} · ${matched}` : `Pewność ${level}`,
  },
  export: {
    aria: "Eksport",
    tooLarge: "Ten raport jest za duży na eksport — skróć plik do samego sprawozdania finansowego.",
  },
  progress: {
    reading: (page: number, pages: number) => `Czytam stronę ${page} z ${pages}`,
    readingText: "Czytam plik…",
    analysing: "Analizuję tabele i liczby…",
    hint: "Plik nie opuszcza Twojego urządzenia. Duży raport roczny na telefonie: zwykle do minuty.",
    cancel: "Anuluj",
  },
  failure: {
    notIxbrl:
      "To nie jest raport z danymi XBRL. Pobierz z EDGAR plik .htm raportu 10-K lub 10-Q (strona „Filing Detail”, pierwszy plik na liście), a nie podgląd w przeglądarce. Masz tylko PDF? Wgraj go, ale liczby będą mniej dokładne.",
    ixbrlCorrupt: "Plik HTML wygląda na uszkodzony albo ucięty. Pobierz go ponownie.",
    scan: "W pliku prawie nie ma tekstu — to pewnie skan albo tekst zamieniony na obraz. Parser nie odczytuje skanów.",
    parser: "Parser nie poradził sobie z tym raportem. Spróbuj samego sprawozdania finansowego.",
    extractTechnical: "Przeglądarka nie odczytała tego PDF-a.",
    extractTimeout: "Odczyt pliku trwał ponad 4 minuty.",
    parseTimeout: "Analiza trwała ponad 4 minuty.",
    worker: "Przeglądarka nie uruchomiła analizy w tle.",
    server: "Przetwórz na serwerze",
    sendFile: (size: string) => `Wyślemy plik (${size}), przeanalizujemy go w pamięci i nie zapiszemy.`,
    sendText: (size: string) => `Wyślemy odczytany tekst (${size}, bez pliku PDF), przeanalizujemy go w pamięci i nie zapiszemy.`,
    desktop: "Spróbuj w aktualnej przeglądarce na komputerze.",
    other: "Wybierz inny plik",
  },
} as const;

/** Display labels for headline metrics (keys stay English in data). */
export const METRIC_PL: Record<MetricKey, string> = {
  revenue: "Przychody",
  costOfRevenue: "Koszt własny sprzedaży",
  grossProfit: "Zysk brutto",
  rAndD: "Badania i rozwój",
  sellingMarketing: "Sprzedaż i marketing",
  generalAdmin: "Koszty ogólnego zarządu",
  sga: "SG&A",
  totalOpEx: "Koszty operacyjne razem",
  operatingIncome: "Zysk operacyjny",
  otherIncome: "Pozostałe przychody (koszty), netto",
  interestExpense: "Koszty odsetek",
  incomeBeforeTax: "Zysk przed opodatkowaniem",
  incomeTax: "Podatek dochodowy",
  netIncome: "Zysk netto",
  totalAssets: "Aktywa razem",
  totalCurrentAssets: "Aktywa obrotowe razem",
  accountsReceivable: "Należności",
  inventories: "Zapasy",
  goodwill: "Wartość firmy",
  intangiblesNet: "Wartości niematerialne, netto",
  ppeNet: "Rzeczowe aktywa trwałe, netto",
  totalCurrentLiabilities: "Zobowiązania krótkoterminowe razem",
  totalLiabilities: "Zobowiązania razem",
  totalEquity: "Kapitał własny razem",
  cash: "Gotówka i ekwiwalenty",
  shortTermInvestments: "Inwestycje krótkoterminowe",
  totalCashAndStInvestments: "Gotówka + inwestycje KT",
  currentDebt: "Bieżąca część zadłużenia",
  longTermDebt: "Zadłużenie długoterminowe",
  totalDebt: "Zadłużenie ogółem",
  ocf: "Przepływy operacyjne",
  capex: "Nakłady inwestycyjne (CapEx)",
  depreciationAmortization: "Amortyzacja",
  dividendsPaid: "Wypłacone dywidendy",
  buybacks: "Wykup akcji własnych",
  stockComp: "Wynagrodzenia w akcjach",
  epsBasic: "EPS podstawowy",
  epsDiluted: "EPS rozwodniony",
  dps: "Dywidenda na akcję",
  weightedSharesBasic: "Średnia ważona akcji (podst.)",
  weightedSharesDiluted: "Średnia ważona akcji (rozw.)",
};

export const PIPELINE_PL: Record<string, string> = {
  file: "Plik odebrany i zdekodowany",
  text: "Tekst wyciągnięty",
  context: "Kontekst wykryty",
  periods: "Kolumny okresów oznaczone",
  metrics: "Metryki dopasowane",
  allRows: "Wszystkie wiersze liczbowe",
  segments: "Segmenty sparsowane",
  validation: "Uzgodnienia",
};

export const VALIDATION_PL: Record<string, string> = {
  "Revenue − Cost = Gross profit": "Przychody − Koszt = Zysk brutto",
  "Gross − Operating expenses = Operating income": "Brutto − Koszty op. = Zysk operacyjny",
  "Operating income + Other = Pre-tax income": "Zysk op. + Pozostałe = Przed podatkiem",
  "Pre-tax − Tax = Net income": "Przed podatkiem − Podatek = Zysk netto",
  "Assets = Liabilities + Equity": "Aktywa = Zobowiązania + Kapitał",
  "Total debt = Current + Long-term": "Dług = Krótkoterminowy + Długoterminowy",
  "Total liquidity = Cash + ST investments": "Płynność = Gotówka + Inwestycje KT",
  "Σ Segment revenue = Total revenue": "Σ Przychody segmentów = Przychody razem",
  "Σ Segment operating income = Total": "Σ Zysk op. segmentów = Razem",
};

export const RATIO_PL: Record<string, string> = {
  ebitda: "EBITDA",
  roe: "ROE",
  roa: "ROA",
  cashConversion: "Konwersja gotówki",
  sbcPctRevenue: "SBC % przychodów",
  currentRatio: "Wskaźnik bieżącej płynności",
  netDebtToEbitda: "Dług netto / EBITDA",
  interestCoverage: "Pokrycie odsetek",
  effectiveTaxRate: "Efektywna stopa podatku",
};

export function metricLabelPl(key: MetricKey, fallback?: string): string {
  return METRIC_PL[key] ?? fallback ?? key;
}

export function pipelineLabelPl(id: string, fallback: string): string {
  return PIPELINE_PL[id] ?? fallback;
}

export function validationNamePl(name: string): string {
  return VALIDATION_PL[name] ?? name;
}

export function ratioLabelPl(key: string, fallback: string): string {
  return RATIO_PL[key] ?? fallback;
}
