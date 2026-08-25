// lib/types.ts — shared types for the parser pipeline and API payload.

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export type StatementType =
  | "income"
  | "balance"
  | "cashflow"
  | "perShare";

export type MetricKey =
  // income statement
  | "revenue"
  | "costOfRevenue"
  | "grossProfit"
  | "rAndD"
  | "sellingMarketing"
  | "generalAdmin"
  | "sga"
  | "totalOpEx"
  | "operatingIncome"
  | "otherIncome"
  | "interestExpense"
  | "incomeBeforeTax"
  | "incomeTax"
  | "netIncome"
  // balance sheet
  | "totalAssets"
  | "totalCurrentAssets"
  | "totalCurrentLiabilities"
  | "accountsReceivable"
  | "inventories"
  | "goodwill"
  | "intangiblesNet"
  | "ppeNet"
  | "totalLiabilities"
  | "totalEquity"
  | "cash"
  | "shortTermInvestments"
  | "totalCashAndStInvestments"
  | "currentDebt"
  | "longTermDebt"
  | "totalDebt"
  // cash flow
  | "ocf"
  | "capex"
  | "depreciationAmortization"
  | "dividendsPaid"
  | "buybacks"
  | "stockComp"
  // per share
  | "epsBasic"
  | "epsDiluted"
  | "dps"
  | "weightedSharesBasic"
  | "weightedSharesDiluted";

/** A column of a financial statement, with a human-readable descriptor. */
export interface Period {
  key: string; // stable id, e.g. "inc0"
  label: string; // full descriptor, e.g. "Q3 FY26 (3M ended Mar 31, 2026)"
  short: string; // compact, e.g. "Q3 FY26"
  kind: "duration" | "point";
  months?: number; // 3 / 6 / 9 / 12 for durations
  endDate?: string; // display date, e.g. "Mar 31, 2026"
  fiscal?: string; // e.g. "FY26"
  current: boolean; // is this the most recent period of its kind
}

export interface MetricValue {
  periodKey: string;
  value: number | null;
}

export interface Metric {
  key: MetricKey;
  label: string;
  statement: StatementType;
  values: MetricValue[];
  confidence: Confidence;
  /** Raw label text matched in the document. */
  matchedLabel?: string;
  /** 0 = primary synonym, >0 = secondary. */
  synonymRank?: number;
  sourceLine?: number;
  note?: string;
  flags?: string[];
}

export interface Segment {
  name: string;
  revenue: number | null;
  revenuePrior: number | null;
  revenueYoY: number | null;
  operatingIncome: number | null;
  operatingMargin: number | null;
}

export interface ProductRevenueItem {
  name: string;
  value: number | null;
  share: number | null; // % of total revenue
}

export interface ProductRevenueResult {
  periodKey: string;
  periodLabel: string;
  items: ProductRevenueItem[];
  total: number | null;
  reconciles: boolean;
}

export interface SegmentsResult {
  periodKey: string; // which period the captured figures belong to
  periodLabel: string;
  segments: Segment[];
  totalRevenue: number | null;
  totalOperatingIncome: number | null;
  reconciles: boolean;
  note?: string;
}

export interface RatioPoint {
  periodKey: string;
  periodLabel: string;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
}

export interface FreeCashFlowPoint {
  periodKey: string;
  periodLabel: string;
  ocf: number | null;
  capex: number | null;
  fcf: number | null;
}

export interface AdvancedRatio {
  key: string;
  label: string;
  value: number | null;
  format: "money" | "pct" | "x" | "text";
  text?: string; // used when format === "text" (e.g. "net cash")
  basis: string; // period / annualisation note, e.g. "9M FY26 · annualised"
}

export interface DerivedResult {
  ratios: RatioPoint[];
  fcf: FreeCashFlowPoint[];
  capexIntensityFlag?: string;
  advanced: AdvancedRatio[];
}

export interface NetCashResult {
  periodKey: string;
  periodLabel: string;
  totalDebt: number | null;
  cash: number | null;
  shortTermInvestments: number | null;
  netCashExclStInv: number | null; // cash - debt
  netCashInclStInv: number | null; // cash + ST inv - debt
  isNetCash: boolean; // true => more liquidity than debt
}

export interface CapitalReturnsResult {
  periodKey: string;
  periodLabel: string;
  dividends: number | null;
  buybacks: number | null;
  total: number | null;
  fcf: number | null;
  payoutOfFcf: number | null; // total / fcf
}

export interface PerShareResult {
  periodKey: string;
  periodLabel: string;
  epsBasic: number | null;
  epsDiluted: number | null;
  dps: number | null;
  weightedSharesDiluted: number | null;
}

export interface OneOffResult {
  detected: boolean;
  headlinePeriodLabel?: string;
  adjustedNetIncome?: { periodLabel: string; value: number }[];
  adjustedEpsDiluted?: { periodLabel: string; value: number }[];
  gaapNetIncome?: { periodLabel: string; value: number }[];
  oneOffEstimate?: number;
  gaapGrowth?: number;
  adjustedGrowth?: number;
  note?: string;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface ValidationResult {
  checks: ValidationCheck[];
  passed: number;
  total: number;
}

export interface Detection {
  formType: string | null; // "SEC 10-Q" / "SEC 10-K"
  issuer: string | null;
  structureLabel: string; // "SEC 10-Q · Microsoft Corporation"
  language: string;
  currency: string | null;
  unitLabel: string | null; // "in millions"
  unitScale: number; // 1e6, 1e3, or 1
  fiscalYearEndMonth: number | null; // 1-12
  periods: {
    income: Period[];
    balance: Period[];
  };
}

export interface PipelineStage {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
}

/** One labeled numeric row from the filing — independent of metric synonyms. */
export interface ExtractedRow {
  lineIndex: number;
  label: string;
  /** Column values left-to-right; null = dash / empty cell. */
  values: (number | null)[];
  /** Period keys when column count matches income or balance periods. */
  periodKeys?: string[];
  periodKind: "income" | "balance" | "unknown";
  rawLine: string;
}

export interface ParseResult {
  detection: Detection;
  metrics: Metric[];
  /** Exhaustive inventory of labeled numeric rows (all numbers, not just headlines). */
  extractedRows: ExtractedRow[];
  segments: SegmentsResult | null;
  productRevenue: ProductRevenueResult | null;
  derived: DerivedResult;
  netCash: NetCashResult | null;
  capitalReturns: CapitalReturnsResult | null;
  perShare: PerShareResult | null;
  oneOff: OneOffResult;
  validation: ValidationResult;
  pipeline: PipelineStage[];
  matchedCount: number;
  totalMetrics: number;
  rawText: string;
  charCount: number;
  pages: number;
}
