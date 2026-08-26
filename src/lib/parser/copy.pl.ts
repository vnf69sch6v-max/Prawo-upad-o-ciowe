// lib/copy.pl.ts — Polish UI chrome. Parser/export internals stay English;
// components look up display strings here.

import type { MetricKey } from "./types";

export const pl = {
  app: {
    title: "report-parser",
    subtitle: "ekstrakcja sprawozdań finansowych",
    badgeLocal: "reguły, nie model",
    badgeNoLlm: "bez LLM w runtime",
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
    drop: "Upuść PDF (10-Q / 10-K / NewConnect)",
    browse: "lub kliknij, aby wybrać · max 40 MB",
    sampleHint: "lub wczytaj przykład (bez pliku)",
    uploading: "Przesyłanie…",
    extractingLocal: "Duży plik — odczytuję lokalnie…",
    parsing: "Parsowanie…",
    parsed: "przetworzono",
    uploadAnother: "Wczytaj kolejny",
    uploadFailed: "Przesyłanie nie powiodło się",
    tryAgain: "Spróbuj ponownie",
  },
  empty: {
    title: "Wczytaj raport, aby zacząć",
    errorTitle: "Coś poszło nie tak",
    body:
      "Upuść PDF 10-Q, 10-K lub raportu NewConnect. Małe pliki idą na serwer; większe (do 40 MB) odczytywane są w przeglądarce, a na serwer leci sam tekst. Parsowanie regułami — bez AI w runtime.",
    orSample: "Albo wczytaj przykład",
    badges: ["Wodospad", "Segmenty · produkty", "Wskaźniki · FCF", "CSV · XLSX · JSON"],
  },
  toast: {
    needPdf: "Wgraj plik PDF (lub .txt z fixture).",
    tooLarge: "Plik za duży — limit 40 MB. Skanowane i zaszyfrowane PDF-y nie zadziałają.",
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
