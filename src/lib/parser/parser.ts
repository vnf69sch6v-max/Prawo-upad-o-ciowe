// lib/parser.ts
// Orchestration: detect document context, match every metric to a row, align its
// numbers to the detected period columns, aggregate Total Debt, pull per-share
// figures, then hand off to derived / segments / validation. All issuer-specific
// knowledge lives in patterns.ts — this file is generic.

import type {
  Confidence,
  Detection,
  Metric,
  MetricKey,
  ParseResult,
  Period,
  PipelineStage,
  StatementType,
} from "./types";
import {
  PATTERNS,
  HEADLINE_METRICS,
  labelMatches,
  isExcluded,
  normalizeLabel,
  type MetricPattern,
} from "./patterns";
import { parseCells, type NumericCell } from "./numbers";
import {
  detectForm,
  detectIssuer,
  detectCurrency,
  detectUnits,
  detectPeriods,
  detectLanguage,
} from "./periods";
import { extractAllRows, countedNumericRows } from "./rows";
import { parseSegments, parseProductRevenue } from "./segments";
import {
  computeDerived,
  computeNetCash,
  computeCapitalReturns,
  buildPerShareHeadline,
  detectOneOff,
} from "./derived";
import { validate, applyConfidenceBumps } from "./validate";

interface LabelSplit {
  label: string;
  rest: string;
}

/** Split a row into its leading label and the trailing numeric region. */
function splitLeadingLabel(line: string): LabelSplit {
  // Strip a leading list/PAS marker ("1.", "a)", "III.") so its digit is not
  // mistaken for the start of the value region.
  const marker = line.match(/^\s*(?:[a-ząćęłńóśźż]|[ivxlcdm]{1,6}|\d{1,2})\s*[.)]\s+/i);
  const offset = marker ? marker[0].length : 0;
  const body = line.slice(offset);
  const idx = body.search(/\(?\s*[$€£]?\s*\d|—|–|[−-]\s*\d/);
  if (idx < 0) return { label: line.trim(), rest: "" };
  let start = offset + idx;
  const pre = line.slice(0, start).match(/[$€£(−-]\s*$/);
  if (pre) start = start - pre[0].length;
  return { label: line.slice(0, start).trim(), rest: line.slice(start) };
}

/** True when a line is (almost) only numeric cells / dashes — a wrap continuation. */
function isValuesOnlyLine(line: string): boolean {
  const { label, rest } = splitLeadingLabel(line);
  if (label && label.length >= 3 && /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(label)) return false;
  const cells = parseCells(rest || line);
  return cells.some((c) => c.value !== null || c.isDash);
}

interface Candidate {
  lineIndex: number;
  label: string;
  money: number[];
  synonymIndex: number;
  primary: boolean;
}

function downgrade(c: Confidence): Confidence {
  return c === "HIGH" ? "MEDIUM" : c === "MEDIUM" ? "LOW" : "LOW";
}

interface Resolution {
  values: (number | null)[];
  confidence: Confidence;
  matchedLabel: string;
  lineIndex: number;
  synonymRank: number;
  note?: string;
}

/**
 * Resolve one metric: try synonyms in priority order; the first synonym that
 * yields a candidate wins. Among candidates for that synonym, prefer the one
 * whose money-cell count equals the expected column count, then the earliest in
 * document order (statements precede notes / MD&A).
 */
function resolveMetric(
  lines: string[],
  pattern: MetricPattern,
  expected: number,
): Resolution | null {
  for (let si = 0; si < pattern.synonyms.length; si++) {
    const syn = pattern.synonyms[si];
    const cands: Candidate[] = [];
    for (let i = 0; i < lines.length; i++) {
      const { label, rest } = splitLeadingLabel(lines[i]);
      if (!label) continue;
      if (!labelMatches(label, syn)) continue;
      if (isExcluded(label, pattern.exclude)) continue;

      let cells: NumericCell[] = rest ? parseCells(rest) : [];
      // PAS / wrapped rows: label on one line, values on the next.
      if (cells.filter((c) => c.value !== null).length === 0 && i + 1 < lines.length) {
        if (isValuesOnlyLine(lines[i + 1])) {
          const next = splitLeadingLabel(lines[i + 1]);
          cells = parseCells(next.rest || lines[i + 1]);
        }
      }
      const money = cells
        .filter((c) => (pattern.allowPercent ? true : !c.isPercent) && c.value !== null)
        .map((c) => c.value as number);
      if (money.length === 0) continue;
      cands.push({ lineIndex: i, label, money, synonymIndex: si, primary: syn.tier === "primary" });
    }
    if (cands.length === 0) continue;

    cands.sort((a, b) => {
      const am = a.money.length === expected ? 1 : 0;
      const bm = b.money.length === expected ? 1 : 0;
      if (am !== bm) return bm - am;
      return a.lineIndex - b.lineIndex;
    });

    const best = cands[0];
    let nums = best.money.map((v) => (pattern.magnitude ? Math.abs(v) : v));
    if (expected > 0 && nums.length > expected) nums = nums.slice(nums.length - expected);
    const slots = expected > 0 ? expected : nums.length;
    const values: (number | null)[] = [];
    for (let i = 0; i < slots; i++) values.push(i < nums.length ? nums[i] : null);

    let confidence: Confidence = best.primary ? "HIGH" : "MEDIUM";
    if (expected > 0 && best.money.length !== expected) confidence = downgrade(confidence);

    return {
      values,
      confidence,
      matchedLabel: best.label,
      lineIndex: best.lineIndex,
      synonymRank: si,
    };
  }
  return null;
}

function periodsFor(statement: StatementType, income: Period[], balance: Period[]): Period[] {
  return statement === "balance" ? balance : income;
}

function toMetric(
  pattern: MetricPattern,
  res: Resolution,
  periods: Period[],
): Metric {
  return {
    key: pattern.key,
    label: pattern.label,
    statement: pattern.statement,
    values: periods.map((p, i) => ({ periodKey: p.key, value: res.values[i] ?? null })),
    confidence: res.confidence,
    matchedLabel: res.matchedLabel,
    synonymRank: res.synonymRank,
    sourceLine: res.lineIndex,
    note: res.note,
  };
}

function emptyMetric(pattern: MetricPattern, periods: Period[]): Metric {
  return {
    key: pattern.key,
    label: pattern.label,
    statement: pattern.statement,
    values: periods.map((p) => ({ periodKey: p.key, value: null })),
    confidence: "LOW",
    flags: ["not found"],
  };
}

// ---- Total Debt: direct synonym, else aggregate current + long-term ----
function resolveTotalDebt(
  lines: string[],
  balance: Period[],
  byKey: Map<MetricKey, Metric>,
): Metric {
  const pattern = PATTERNS.find((m) => m.key === "totalDebt")!;
  const expected = balance.length;
  const direct = resolveMetric(lines, pattern, expected);

  const current = byKey.get("currentDebt");
  const longTerm = byKey.get("longTermDebt");
  const aggregate = (): (number | null)[] | null => {
    if (!current && !longTerm) return null;
    return balance.map((p) => {
      const c = current?.values.find((v) => v.periodKey === p.key)?.value ?? null;
      const l = longTerm?.values.find((v) => v.periodKey === p.key)?.value ?? null;
      if (c === null && l === null) return null;
      return Math.abs(c ?? 0) + Math.abs(l ?? 0);
    });
  };

  if (direct) {
    const agg = aggregate();
    let confidence = direct.confidence;
    let note = "direct total";
    const flags: string[] = [];
    if (agg) {
      const mismatch = balance.some((p, i) => {
        const d = direct.values[i];
        const a = agg[i];
        return d !== null && a !== null && Math.abs(d - a) > 1;
      });
      if (mismatch) {
        flags.push("direct total ≠ current + long-term");
        confidence = downgrade(confidence);
      } else {
        note = "direct total, reconciles with current + long-term";
        confidence = "HIGH";
      }
    }
    return {
      key: "totalDebt",
      label: "Total debt",
      statement: "balance",
      values: balance.map((p, i) => ({ periodKey: p.key, value: direct.values[i] ?? null })),
      confidence,
      matchedLabel: direct.matchedLabel,
      sourceLine: direct.lineIndex,
      note,
      flags: flags.length ? flags : undefined,
    };
  }

  const agg = aggregate();
  if (agg && agg.some((v) => v !== null)) {
    return {
      key: "totalDebt",
      label: "Total debt",
      statement: "balance",
      values: balance.map((p, i) => ({ periodKey: p.key, value: agg[i] ?? null })),
      confidence: "MEDIUM",
      note: "aggregated: current portion + long-term debt",
    };
  }
  return emptyMetric(pattern, balance);
}

// ---- Total operating expenses: direct line, else R&D + S&M + G&A (or SG&A) ----
function metricVal(m: Metric | undefined, periodKey: string): number | null {
  if (!m) return null;
  return m.values.find((v) => v.periodKey === periodKey)?.value ?? null;
}

function resolveTotalOpEx(lines: string[], income: Period[], byKey: Map<MetricKey, Metric>): Metric {
  const pattern = PATTERNS.find((m) => m.key === "totalOpEx")!;
  const direct = resolveMetric(lines, pattern, income.length);

  const rd = byKey.get("rAndD");
  const sm = byKey.get("sellingMarketing");
  const ga = byKey.get("generalAdmin");
  const sga = byKey.get("sga");
  const has = (m?: Metric) => !!m && m.values.some((v) => v.value !== null);
  // Below-gross opex = R&D + (combined SG&A, or separate S&M + G&A). Require R&D
  // AND at least one selling/admin line so we only synthesise a total for issuers
  // that actually break opex out — not a loss-maker with a lone G&A line.
  const sgaPresent = has(sga);
  const hasComponents = has(rd) && (sgaPresent || has(sm) || has(ga));
  const computed: (number | null)[] | null = hasComponents
    ? income.map((p) => {
        const parts = [
          metricVal(rd, p.key),
          sgaPresent ? metricVal(sga, p.key) : metricVal(sm, p.key),
          sgaPresent ? null : metricVal(ga, p.key),
        ].filter((x): x is number => x !== null);
        return parts.length === 0 ? null : parts.reduce((a, x) => a + Math.abs(x), 0);
      })
    : null;

  if (direct) {
    let confidence = direct.confidence;
    const flags: string[] = [];
    if (computed) {
      const mismatch = income.some((p, i) => {
        const d = direct.values[i];
        const a = computed[i];
        return d !== null && a !== null && Math.abs(d - a) > Math.max(2, Math.abs(d) * 0.01);
      });
      if (mismatch) {
        flags.push("direct total ≠ R&D + S&M + G&A");
        confidence = downgrade(confidence);
      } else {
        confidence = "HIGH";
      }
    }
    return {
      key: "totalOpEx",
      label: pattern.label,
      statement: "income",
      values: income.map((p, i) => ({ periodKey: p.key, value: direct.values[i] ?? null })),
      confidence,
      matchedLabel: direct.matchedLabel,
      sourceLine: direct.lineIndex,
      note: "reported total",
      flags: flags.length ? flags : undefined,
    };
  }

  if (computed && computed.some((v) => v !== null)) {
    return {
      key: "totalOpEx",
      label: pattern.label,
      statement: "income",
      values: income.map((p, i) => ({ periodKey: p.key, value: computed[i] ?? null })),
      confidence: "MEDIUM",
      note: "aggregated: R&D + S&M + G&A",
    };
  }
  return emptyMetric(pattern, income);
}

// ---- Per-share figures (EPS basic/diluted, DPS, weighted shares) ----
function cellValues(rest: string): number[] {
  return parseCells(rest)
    .filter((c) => !c.isDash && c.value !== null)
    .map((c) => c.value as number);
}

function extractPerShare(lines: string[], income: Period[]): Metric[] {
  const n = income.length;
  let epsBasic: number[] | null = null;
  let epsDiluted: number[] | null = null;
  let sharesBasic: number[] | null = null;
  let sharesDiluted: number[] | null = null;
  let dps: number[] | null = null;

  const lineMeta = lines.map((l) => {
    const { label, rest } = splitLeadingLabel(l);
    return { label, rest, nl: normalizeLabel(label), cells: cellValues(rest) };
  });

  for (let i = 0; i < lineMeta.length; i++) {
    const { nl, cells } = lineMeta[i];

    // Combined "… per share — basic and diluted" on a single row.
    if (
      cells.length > 0 &&
      /per share/.test(nl) &&
      /(basic and diluted|diluted and basic)/.test(nl)
    ) {
      epsBasic = epsBasic ?? cells;
      epsDiluted = epsDiluted ?? cells;
      continue;
    }
    if (
      cells.length > 0 &&
      /weighted average/.test(nl) &&
      /shares/.test(nl) &&
      /(basic and diluted|diluted and basic)/.test(nl)
    ) {
      sharesBasic = sharesBasic ?? cells;
      sharesDiluted = sharesDiluted ?? cells;
      continue;
    }

    // Header rows (no numbers) followed by Basic / Diluted sub-rows.
    const isEpsHeader =
      cells.length === 0 && /(earnings|loss|income|net loss|net income) per share/.test(nl);
    const isSharesHeader =
      cells.length === 0 && /weighted average/.test(nl) && /shares/.test(nl);
    if (isEpsHeader || isSharesHeader) {
      for (let j = i + 1; j <= i + 4 && j < lineMeta.length; j++) {
        const r = lineMeta[j];
        if (r.cells.length === 0) continue;
        // Stop if we hit the other section's header.
        if (isEpsHeader && /weighted average/.test(r.nl)) break;
        if (isSharesHeader && /per share/.test(r.nl)) break;
        if (/^basic$/.test(r.nl)) {
          if (isEpsHeader) epsBasic = epsBasic ?? r.cells;
          else sharesBasic = sharesBasic ?? r.cells;
        } else if (/^diluted$/.test(r.nl)) {
          if (isEpsHeader) epsDiluted = epsDiluted ?? r.cells;
          else sharesDiluted = sharesDiluted ?? r.cells;
        } else if (/^basic and diluted$/.test(r.nl)) {
          if (isEpsHeader) {
            epsBasic = epsBasic ?? r.cells;
            epsDiluted = epsDiluted ?? r.cells;
          } else {
            sharesBasic = sharesBasic ?? r.cells;
            sharesDiluted = sharesDiluted ?? r.cells;
          }
        }
      }
      continue;
    }

    // Dividends per share.
    if (
      cells.length > 0 &&
      /dividends?.*per .*share/.test(nl) &&
      !/payable|received/.test(nl)
    ) {
      dps = dps ?? cells;
    }
  }

  const mk = (
    key: MetricKey,
    label: string,
    vals: number[] | null,
    magnitude = false,
  ): Metric => {
    const trimmed =
      vals && n > 0 && vals.length > n ? vals.slice(vals.length - n) : vals;
    return {
      key,
      label,
      statement: "perShare",
      values: income.map((p, i) => ({
        periodKey: p.key,
        value: trimmed && i < trimmed.length ? (magnitude ? Math.abs(trimmed[i]) : trimmed[i]) : null,
      })),
      confidence: trimmed ? "HIGH" : "LOW",
      flags: trimmed ? undefined : ["not found"],
    };
  };

  return [
    mk("epsBasic", "EPS (basic)", epsBasic),
    mk("epsDiluted", "EPS (diluted)", epsDiluted),
    mk("dps", "Dividend per share", dps, true),
    mk("weightedSharesDiluted", "Weighted avg shares (diluted)", sharesDiluted, true),
    mk("weightedSharesBasic", "Weighted avg shares (basic)", sharesBasic, true),
  ];
}

// ---- Fallback period synthesis when header detection fails ----
function synthesize(lines: string[]): { income: Period[]; balance: Period[] } {
  const revenue = PATTERNS.find((m) => m.key === "revenue")!;
  let nInc = 0;
  for (let i = 0; i < lines.length; i++) {
    const { label, rest } = splitLeadingLabel(lines[i]);
    if (!rest) continue;
    if (isExcluded(label, revenue.exclude)) continue;
    if (revenue.synonyms.some((s) => labelMatches(label, s))) {
      nInc = parseCells(rest).filter((c) => !c.isPercent && c.value !== null).length;
      if (nInc > 0) break;
    }
  }
  if (nInc === 0) nInc = 2;
  const income: Period[] = Array.from({ length: nInc }, (_, i) => ({
    key: `inc${i}`,
    short: i === 0 ? "Current" : `Prior ${i}`,
    label: i === 0 ? "Current period" : `Prior period ${i}`,
    kind: "duration",
    current: i === 0,
  }));
  const balance: Period[] = [0, 1].map((i) => ({
    key: `bal${i}`,
    short: i === 0 ? "Current" : "Prior",
    label: i === 0 ? "Current period" : "Prior period",
    kind: "point",
    current: i === 0,
  }));
  return { income, balance };
}

export interface ParseInput {
  text: string;
  pages: number;
  charCount: number;
}

export function parseReport(input: ParseInput): ParseResult {
  const { text } = input;
  const lines = text.split("\n").map((l) => l.replace(/\s+$/g, ""));

  // ---- Detection ----
  const formType = detectForm(text);
  const issuer = detectIssuer(lines);
  const currency = detectCurrency(text);
  const { unitLabel, unitScale } = detectUnits(text);
  const language = detectLanguage(text);
  const detected = detectPeriods(lines);
  const fiscalYearEndMonth = detected.fiscalYearEndMonth;
  let income = detected.income;
  let balance = detected.balance;
  if (income.length === 0 || balance.length === 0) {
    const syn = synthesize(lines);
    if (income.length === 0) income = syn.income;
    if (balance.length === 0) balance = syn.balance;
  }

  const structureLabel = [formType, issuer].filter(Boolean).join(" · ") || "Unknown filing";
  const detection: Detection = {
    formType,
    issuer,
    structureLabel,
    language,
    currency,
    unitLabel,
    unitScale,
    fiscalYearEndMonth,
    periods: { income, balance },
  };

  // ---- Metric extraction ----
  const metrics: Metric[] = [];
  const byKey = new Map<MetricKey, Metric>();
  for (const pattern of PATTERNS) {
    if (pattern.key === "totalDebt" || pattern.key === "totalOpEx") continue; // computed below
    const periods = periodsFor(pattern.statement, income, balance);
    const res = resolveMetric(lines, pattern, periods.length);
    const metric = res ? toMetric(pattern, res, periods) : emptyMetric(pattern, periods);
    metrics.push(metric);
    byKey.set(pattern.key, metric);
  }

  const totalDebt = resolveTotalDebt(lines, balance, byKey);
  metrics.push(totalDebt);
  byKey.set("totalDebt", totalDebt);

  const totalOpEx = resolveTotalOpEx(lines, income, byKey);
  metrics.push(totalOpEx);
  byKey.set("totalOpEx", totalOpEx);

  const perShare = extractPerShare(lines, income);
  for (const m of perShare) {
    metrics.push(m);
    byKey.set(m.key, m);
  }

  // ---- Exhaustive numeric-row inventory (all numbers, not just headlines) ----
  const extractedRows = extractAllRows(lines, income, balance);

  // ---- Segments / derived / net cash / capital returns / one-off ----
  const revenueMetric = byKey.get("revenue")!;
  const opIncomeMetric = byKey.get("operatingIncome")!;
  const segments = parseSegments(lines, income, revenueMetric, opIncomeMetric);
  const productRevenue = parseProductRevenue(lines, income, revenueMetric);

  const derived = computeDerived(byKey, income, balance);
  const netCash = computeNetCash(byKey, balance);
  const capitalReturns = computeCapitalReturns(byKey, income, derived);
  const perShareHeadline = buildPerShareHeadline(byKey, income);
  const oneOff = detectOneOff(lines, byKey, income);

  // ---- Validation + confidence calibration ----
  const validation = validate(byKey, segments, income, balance);
  applyConfidenceBumps(byKey, validation);

  // ---- Pipeline diagnostics ----
  const matchedCount = HEADLINE_METRICS.filter((k) => {
    const m = byKey.get(k);
    return !!m && m.values.some((v) => v.value !== null);
  }).length;

  const pipeline: PipelineStage[] = buildPipeline(
    input,
    detection,
    matchedCount,
    segments,
    validation,
    extractedRows,
  );

  return {
    detection,
    metrics,
    extractedRows,
    segments,
    productRevenue,
    derived,
    netCash,
    capitalReturns,
    perShare: perShareHeadline,
    oneOff,
    validation,
    pipeline,
    matchedCount,
    totalMetrics: HEADLINE_METRICS.length,
    rawText: text,
    charCount: input.charCount,
    pages: input.pages,
  };
}

function buildPipeline(
  input: ParseInput,
  detection: Detection,
  matchedCount: number,
  segments: ParseResult["segments"],
  validation: ParseResult["validation"],
  extractedRows: ParseResult["extractedRows"],
): PipelineStage[] {
  const periodsOk = detection.periods.income.length > 0 && detection.periods.balance.length > 0;
  const allCount = countedNumericRows(extractedRows);
  return [
    {
      id: "file",
      label: "File received & decoded",
      status: input.pages > 0 ? "ok" : "fail",
      detail: `${input.pages} pages`,
    },
    {
      id: "text",
      label: "Text extracted",
      status: input.charCount > 500 ? "ok" : "fail",
      detail: `${input.charCount.toLocaleString()} characters`,
    },
    {
      id: "context",
      label: "Context detected",
      status: detection.formType ? "ok" : "warn",
      detail: [detection.formType, detection.currency, detection.unitLabel, detection.language]
        .filter(Boolean)
        .join(" · ") || "unknown",
    },
    {
      id: "periods",
      label: "Period columns labelled",
      status: periodsOk ? "ok" : "warn",
      detail: `${detection.periods.income.length} duration · ${detection.periods.balance.length} point-in-time`,
    },
    {
      id: "metrics",
      label: "Metrics matched",
      status: matchedCount >= 9 ? "ok" : matchedCount >= 5 ? "warn" : "fail",
      detail: `${matchedCount}/11 headline metrics`,
    },
    {
      id: "allRows",
      label: "All numeric rows",
      status: allCount >= 20 ? "ok" : allCount >= 5 ? "warn" : "fail",
      detail: `${allCount} labeled rows`,
    },
    {
      id: "segments",
      label: "Segments parsed",
      status: segments && segments.segments.length > 0 ? (segments.reconciles ? "ok" : "warn") : "warn",
      detail: segments && segments.segments.length > 0
        ? `${segments.segments.length} segments${segments.reconciles ? ", reconciled" : ""}`
        : "none found",
    },
    {
      id: "validation",
      label: "Reconciliations",
      status: validation.passed === validation.total ? "ok" : validation.passed > 0 ? "warn" : "fail",
      detail: `${validation.passed}/${validation.total} passed`,
    },
  ];
}

/** Convenience accessor used by tests. */
export function getMetric(result: ParseResult, key: MetricKey): Metric | undefined {
  return result.metrics.find((m) => m.key === key);
}

/** Value of a metric in its current (most recent) period. */
export function currentValue(result: ParseResult, key: MetricKey): number | null {
  const m = getMetric(result, key);
  if (!m) return null;
  const periods = m.statement === "balance" ? result.detection.periods.balance : result.detection.periods.income;
  const cur = periods.find((p) => p.current) ?? periods[0];
  return m.values.find((v) => v.periodKey === cur?.key)?.value ?? null;
}
