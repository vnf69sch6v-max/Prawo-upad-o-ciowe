// PS3b-2c (docs/specs/2026-11-12-parser-ps3b2c-wyliczone.md): pochodzenie liczb, których nie ma w sprawozdaniu.
// Jedna mapa: klucz → nazwa, wzór po polsku i składniki z wyniku. Czyste TS (bez React), testowane przeliczeniem,
// żeby opis wzoru nie rozjechał się z kodem w `derived.ts`. Nie dopisuje niczego do `ParseResult` ani do eksportu.
import type { MetricKey, ParseResult } from "./types";

export type DerivedKey =
  | "fcf" | "netDebt" | "grossMargin" | "operatingMargin" | "netMargin" | "payoutOfFcf" | "capexIntensity" | "delta";

export type DerivedSource = Pick<ParseResult, "metrics" | "derived" | "netCash" | "capitalReturns">;

export interface DerivedInput {
  label: string;
  value: number | null;
}

export interface DerivedFormula {
  labelPl: string;
  formulaPl: string;
  /** Składniki dla okresu; brak funkcji = wzór opisowy (Δ%, capex intensity porównują dwa okresy). */
  inputs?: (r: DerivedSource, periodKey: string) => DerivedInput[];
  /** Przeliczenie ze składników — test porównuje je z wartością w `derived`. */
  compute?: (values: (number | null)[]) => number | null;
}

const metric = (r: DerivedSource, key: MetricKey, pk: string) =>
  r.metrics.find((m) => m.key === key)?.values.find((v) => v.periodKey === pk)?.value ?? null;

const margin = (label: string, key: MetricKey): DerivedFormula => ({
  labelPl: label,
  formulaPl: `${label} = ${key === "grossProfit" ? "zysk brutto" : key === "operatingIncome" ? "zysk operacyjny" : "zysk netto"} ÷ przychody × 100`,
  inputs: (r, pk) => {
    let num = metric(r, key, pk);
    const rev = metric(r, "revenue", pk);
    const cost = metric(r, "costOfRevenue", pk);
    // jak w `computeDerived`: brak wiersza „zysk brutto” → przychody − koszt sprzedaży
    if (key === "grossProfit" && num === null && rev !== null && cost !== null) num = rev - cost;
    return [
      { label: key === "grossProfit" ? "Zysk brutto" : key === "operatingIncome" ? "Zysk operacyjny" : "Zysk netto", value: num },
      { label: "Przychody", value: rev },
    ];
  },
  compute: ([num, rev]) => (num === null || rev === null || rev === 0 ? null : (num / rev) * 100),
});

export const DERIVED_FORMULAS: Record<DerivedKey, DerivedFormula> = {
  fcf: {
    labelPl: "Wolne przepływy (FCF)",
    formulaPl: "FCF = przepływy operacyjne − nakłady inwestycyjne (capex)",
    inputs: (r, pk) => {
      const f = r.derived.fcf.find((x) => x.periodKey === pk);
      return [
        { label: "Przepływy operacyjne", value: f?.ocf ?? null },
        { label: "Capex", value: f?.capex ?? null },
      ];
    },
    compute: ([ocf, capex]) => (ocf === null || capex === null ? null : ocf - capex),
  },
  netDebt: {
    labelPl: "Gotówka netto / dług netto",
    formulaPl: "Gotówka netto = gotówka + inwestycje krótkoterminowe − zadłużenie ogółem (ujemna = dług netto)",
    inputs: (r) => [
      { label: "Gotówka i ekwiwalenty", value: r.netCash?.cash ?? null },
      { label: "Inwestycje krótkoterminowe", value: r.netCash?.shortTermInvestments ?? null },
      { label: "Zadłużenie ogółem", value: r.netCash?.totalDebt ?? null },
    ],
    compute: ([cash, st, debt]) => (debt === null ? null : (cash ?? 0) + (st ?? 0) - debt),
  },
  grossMargin: margin("Marża brutto", "grossProfit"),
  operatingMargin: margin("Marża operacyjna", "operatingIncome"),
  netMargin: margin("Marża netto", "netIncome"),
  payoutOfFcf: {
    labelPl: "Wypłata z FCF",
    formulaPl: "Wypłata z FCF = (dywidendy + wykup akcji) ÷ FCF × 100",
    inputs: (r) => [
      { label: "Dywidendy", value: r.capitalReturns?.dividends ?? null },
      { label: "Wykup akcji", value: r.capitalReturns?.buybacks ?? null },
      { label: "FCF", value: r.capitalReturns?.fcf ?? null },
    ],
    compute: ([d, b, fcf]) => (!fcf ? null : (((d ?? 0) + (b ?? 0)) / fcf) * 100),
  },
  capexIntensity: {
    labelPl: "Intensywność capexu",
    formulaPl: "Porównuje wzrost przepływów operacyjnych, FCF i capexu rok do roku; tylko przy dodatnich przepływach rok wcześniej",
  },
  delta: {
    labelPl: "Zmiana Δ%",
    formulaPl: "Δ% = (okres bieżący − okres porównawczy) ÷ okres porównawczy × 100; przy bazie ≤ 0: n/d",
  },
};

/** Klucze, które dostają plakietkę „wyliczone” — tylko te, nigdy liczby wprost ze sprawozdania. */
export const DERIVED_KEYS = Object.keys(DERIVED_FORMULAS) as DerivedKey[];
