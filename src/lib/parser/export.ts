// lib/parser/export.ts
// Zamienia ParseResult na tabele do eksportu (metryki w wierszach, okresy w
// kolumnach). Wartości zostają LICZBAMI o pełnej precyzji — formatowanie
// (waluta, procenty, nawiasy dla ujemnych) nakłada dopiero arkusz, więc plik
// wpada do modelu w Excelu bez czyszczenia.

import type { MetricKey, ParseResult } from "./types";
import { METRIC_PL, RATIO_PL, VALIDATION_PL } from "./copy.pl";

/** Jak sformatować komórkę wartości. Arkusz mapuje to na `numFmt`. */
export type CellFormat = "text" | "money" | "pct" | "ratio" | "int";

export interface ExportTable {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
  /** Format kolumn wartości (wszystkich poza pierwszą, etykietową). */
  valueFormat: CellFormat;
  /** Nadpisanie formatu dla pojedynczych wierszy: indeks wiersza → format. */
  rowFormats?: Record<number, CellFormat>;
  /** Zdanie pod tabelą — podstawa wyliczenia albo zastrzeżenie. */
  note?: string;
}

const INCOME_KEYS: MetricKey[] = [
  "revenue", "costOfRevenue", "grossProfit", "rAndD", "sellingMarketing",
  "generalAdmin", "sga", "totalOpEx", "operatingIncome", "otherIncome",
  "interestExpense", "incomeBeforeTax", "incomeTax", "netIncome",
];
const CASHFLOW_KEYS: MetricKey[] = [
  "ocf", "depreciationAmortization", "stockComp", "capex", "dividendsPaid", "buybacks",
];
const PERSHARE_KEYS: MetricKey[] = [
  "epsBasic", "epsDiluted", "dps", "weightedSharesDiluted", "weightedSharesBasic",
];
const BALANCE_KEYS: MetricKey[] = [
  "totalCurrentAssets", "accountsReceivable", "inventories", "ppeNet", "goodwill",
  "intangiblesNet", "totalAssets", "totalCurrentLiabilities", "currentDebt",
  "longTermDebt", "totalDebt", "totalLiabilities", "totalEquity", "cash",
  "shortTermInvestments", "totalCashAndStInvestments",
];
/** Pozycje, których udział w przychodach coś mówi. Zyski pomijamy — te są w „Marże". */
const COST_KEYS: MetricKey[] = [
  "costOfRevenue", "rAndD", "sellingMarketing", "generalAdmin", "sga",
  "totalOpEx", "interestExpense", "incomeTax",
];

function label(key: MetricKey, fallback?: string): string {
  return METRIC_PL[key] ?? fallback ?? key;
}

function metricValues(
  result: ParseResult,
  key: MetricKey,
  periodKeys: string[],
): (number | null)[] | null {
  const m = result.metrics.find((x) => x.key === key);
  if (!m || !m.values.some((v) => v.value !== null)) return null;
  return periodKeys.map((pk) => m.values.find((v) => v.periodKey === pk)?.value ?? null);
}

function valueRow(
  result: ParseResult,
  key: MetricKey,
  periodKeys: string[],
): (string | number | null)[] | null {
  const vals = metricValues(result, key, periodKeys);
  if (!vals) return null;
  const m = result.metrics.find((x) => x.key === key);
  return [label(key, m?.label), ...vals];
}

export function buildExportTables(result: ParseResult): ExportTable[] {
  const inc = result.detection.periods.income;
  const bal = result.detection.periods.balance;
  const incCols = inc.map((p) => p.short);
  const balCols = bal.map((p) => p.short);
  const incKeys = inc.map((p) => p.key);
  const balKeys = bal.map((p) => p.key);
  const tables: ExportTable[] = [];

  // ── Podsumowanie ─────────────────────────────────────────────
  const current = inc.find((p) => p.current) ?? inc[0];
  const currentBal = bal.find((p) => p.current) ?? bal[0];
  const kpi = (key: MetricKey) =>
    result.metrics.find((m) => m.key === key)?.values.find((v) => v.periodKey === current?.key)?.value ?? null;
  const fcfCurrent = result.derived.fcf.find((f) => f.periodKey === current?.key)?.fcf ?? null;

  const summaryRows: (string | number | null)[][] = [
    ["Emitent", result.detection.issuer ?? "—"],
    ["Rodzaj raportu", result.detection.formType ?? "—"],
    ["Waluta", result.detection.currency ?? "—"],
    ["Jednostka", result.detection.unitLabel ?? "pełne kwoty"],
    ["Okres bieżący", current?.label ?? "—"],
    ["Bilans na dzień", currentBal?.label ?? "—"],
    ["", null],
    ["Przychody", kpi("revenue")],
    ["Zysk netto", kpi("netIncome")],
    ["Wolne przepływy (FCF)", fcfCurrent],
    [
      result.netCash?.isNetCash ? "Gotówka netto" : "Dług netto",
      result.netCash?.netCashInclStInv != null ? Math.abs(result.netCash.netCashInclStInv) : null,
    ],
  ];
  tables.push({
    name: "Podsumowanie",
    columns: ["Pozycja", "Wartość"],
    rows: summaryRows,
    valueFormat: "text",
    rowFormats: { 7: "money", 8: "money", 9: "money", 10: "money" },
    note: `Kwoty KPI dotyczą okresu ${current?.label ?? "bieżącego"}.`,
  });

  // ── Rachunek zysków i strat ──────────────────────────────────
  const incomeRows = INCOME_KEYS
    .map((k) => valueRow(result, k, incKeys))
    .filter((r): r is (string | number | null)[] => r !== null);
  tables.push({
    name: "Rachunek zysków i strat",
    columns: ["Pozycja", ...incCols],
    rows: incomeRows,
    valueFormat: "money",
  });

  // ── Struktura kosztów (% przychodów) ─────────────────────────
  const revenue = metricValues(result, "revenue", incKeys);
  if (revenue) {
    const costRows: (string | number | null)[][] = [];
    for (const key of COST_KEYS) {
      const vals = metricValues(result, key, incKeys);
      if (!vals) continue;
      costRows.push([
        label(key),
        ...vals.map((v, i) => {
          const rev = revenue[i];
          if (v === null || rev === null || rev === 0) return null;
          return (v / rev) * 100;
        }),
      ]);
    }
    if (costRows.length) {
      tables.push({
        name: "Struktura kosztów",
        columns: ["Pozycja", ...incCols],
        rows: costRows,
        valueFormat: "pct",
        note: "Każda pozycja jako udział w przychodach tego samego okresu.",
      });
    }
  }

  // ── Bilans ───────────────────────────────────────────────────
  const balanceRows = BALANCE_KEYS
    .map((k) => valueRow(result, k, balKeys))
    .filter((r): r is (string | number | null)[] => r !== null);
  tables.push({
    name: "Bilans",
    columns: ["Pozycja", ...balCols],
    rows: balanceRows,
    valueFormat: "money",
  });

  // ── Przepływy pieniężne ──────────────────────────────────────
  const cashRows = CASHFLOW_KEYS
    .map((k) => valueRow(result, k, incKeys))
    .filter((r): r is (string | number | null)[] => r !== null);
  if (cashRows.length) {
    tables.push({
      name: "Przepływy pieniężne",
      columns: ["Pozycja", ...incCols],
      rows: cashRows,
      valueFormat: "money",
    });
  }

  // ── Wolne przepływy dla WSZYSTKICH okresów ───────────────────
  if (result.derived.fcf.length) {
    const byPeriod = (pick: (f: (typeof result.derived.fcf)[number]) => number | null) =>
      incKeys.map((pk) => {
        const f = result.derived.fcf.find((x) => x.periodKey === pk);
        return f ? pick(f) : null;
      });
    tables.push({
      name: "Wolne przepływy",
      columns: ["Pozycja", ...incCols],
      rows: [
        ["Przepływy operacyjne", ...byPeriod((f) => f.ocf)],
        ["Nakłady inwestycyjne", ...byPeriod((f) => f.capex)],
        ["Wolne przepływy (FCF)", ...byPeriod((f) => f.fcf)],
      ],
      valueFormat: "money",
    });
  }

  // ── Marże: macierz okres × marża (gotowa pod wykres) ─────────
  if (result.derived.ratios.length) {
    const marginRow = (pick: (r: (typeof result.derived.ratios)[number]) => number | null) =>
      incKeys.map((pk) => {
        const r = result.derived.ratios.find((x) => x.periodKey === pk);
        return r ? pick(r) : null;
      });
    tables.push({
      name: "Marże",
      columns: ["Marża", ...incCols],
      rows: [
        ["Marża brutto", ...marginRow((r) => r.grossMargin)],
        ["Marża operacyjna", ...marginRow((r) => r.operatingMargin)],
        ["Marża netto", ...marginRow((r) => r.netMargin)],
      ],
      valueFormat: "pct",
    });
  }

  // ── Wskaźniki ────────────────────────────────────────────────
  if (result.derived.advanced.length) {
    const rowFormats: Record<number, CellFormat> = {};
    const rows: (string | number | null)[][] = result.derived.advanced.map((a, i) => {
      rowFormats[i] =
        a.format === "money" ? "money" : a.format === "pct" ? "pct" : a.format === "text" ? "text" : "ratio";
      return [
        RATIO_PL[a.key] ?? a.label,
        a.format === "text" ? (a.text ?? "—") : a.value,
        a.basis,
      ];
    });
    tables.push({
      name: "Wskaźniki",
      columns: ["Wskaźnik", "Wartość", "Podstawa wyliczenia"],
      rows,
      valueFormat: "ratio",
      rowFormats,
    });
  }

  // ── Na akcję ─────────────────────────────────────────────────
  const perShareRows = PERSHARE_KEYS
    .map((k) => valueRow(result, k, incKeys))
    .filter((r): r is (string | number | null)[] => r !== null);
  if (perShareRows.length) {
    tables.push({
      name: "Na akcję",
      columns: ["Pozycja", ...incCols],
      rows: perShareRows,
      valueFormat: "money",
    });
  }

  // ── Segmenty i produkty ──────────────────────────────────────
  if (result.segments) {
    tables.push({
      name: "Segmenty",
      columns: ["Segment", "Przychody", "Zysk operacyjny", "Marża operacyjna", "Przychody r/r"],
      rows: result.segments.segments.map((s) => [
        s.name, s.revenue, s.operatingIncome, s.operatingMargin, s.revenueYoY,
      ]),
      valueFormat: "money",
      note: "Kolumny „Marża operacyjna” i „Przychody r/r” są w procentach.",
    });
  }
  if (result.productRevenue) {
    tables.push({
      name: "Przychody wg produktów",
      columns: ["Produkt", "Przychody", "Udział"],
      rows: result.productRevenue.items.map((i) => [i.name, i.value, i.share]),
      valueFormat: "money",
    });
  }

  // ── Uzgodnienia ──────────────────────────────────────────────
  tables.push({
    name: "Uzgodnienia",
    columns: ["Sprawdzenie", "Wynik", "Szczegóły"],
    rows: result.validation.checks.map((c) => [
      VALIDATION_PL[c.name] ?? c.name,
      c.passed ? "OK" : "BŁĄD",
      c.detail,
    ]),
    valueFormat: "text",
    note: "Tożsamości sprawdzane na liczbach odczytanych z dokumentu — dowód, że kolumny zostały przypisane poprawnie.",
  });

  return tables;
}

function csvCell(v: string | number | null): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(result: ParseResult): string {
  const tables = buildExportTables(result);
  const units = result.detection.unitLabel ?? "pełne kwoty";
  const lines: string[] = [
    "Savori — parser raportów",
    result.detection.structureLabel,
    `Wartości: ${result.detection.currency ?? ""} ${units}`,
    "",
  ];
  for (const t of tables) {
    lines.push(t.name);
    lines.push(t.columns.map(csvCell).join(","));
    for (const r of t.rows) lines.push(r.map(csvCell).join(","));
    if (t.note) lines.push(csvCell(t.note));
    lines.push("");
  }
  return lines.join("\n");
}

export function toJSON(result: ParseResult): string {
  // Surowy tekst wylatuje — JSON ma zostać przy danych strukturalnych.
  const { rawText, ...rest } = result;
  void rawText;
  return JSON.stringify(rest, null, 2);
}

export function exportBaseName(result: ParseResult): string {
  const issuer = (result.detection.issuer ?? "raport").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const form = (result.detection.formType ?? "").replace(/[^a-z0-9]+/gi, "").toLowerCase();
  return `${issuer}-${form || "sprawozdanie"}`;
}
