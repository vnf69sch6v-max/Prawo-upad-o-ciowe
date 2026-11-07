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
import {
  parseCells,
  isNoteLike,
  isUsDocument,
  looksUsDocument,
  resegmentEuropean,
  withNumberFormat,
  type NumericCell,
} from "./numbers";
import { splitLeadingLabel } from "./split";
import { stripRelatedPartyNotes } from "./notes";
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
  /** One entry per column; a dash cell ("—", nil) is null but still a column. */
  money: (number | null)[];
  /** Words among the numbers: the label itself carries amounts ("net of allowance of $67 and $39 at …"). */
  wordy: boolean;
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
  /** Money cells on the matched row (before trimming to the column count). */
  cellCount: number;
  note?: string;
}

/**
 * Resolve one metric: try synonyms in priority order; the first synonym that
 * yields a candidate with the expected column count wins. Among candidates for
 * one synonym, prefer that count, then the earliest in document order
 * (statements precede notes / MD&A). If no synonym has a row with the expected
 * count, the first synonym's best row is used (downgraded) — so "Income before
 * income taxes $ 4,014" in a one-column segment table no longer beats
 * "Income (loss) before income taxes" on the statement itself.
 *
 * `ytd` (cash flow in an interim report): indices of the year-to-date periods. A
 * 10-Q cash-flow statement has only those columns, so a row with exactly that
 * many cells goes there instead of into the quarter columns.
 */
// splitLeadingLabel per line, once per parse (resolveMetric runs ~45 patterns × ~8 synonyms over every line).
const splitCache = new WeakMap<string[], ReturnType<typeof splitLeadingLabel>[]>();
function splitLines(lines: string[]) {
  let hit = splitCache.get(lines);
  if (!hit) {
    hit = lines.map((l) => splitLeadingLabel(l));
    splitCache.set(lines, hit);
  }
  return hit;
}

function resolveMetric(
  lines: string[],
  pattern: MetricPattern,
  expected: number,
  ytd: number[] = [],
): Resolution | null {
  const split = splitLines(lines);
  const fits = (n: number) => n === expected || (ytd.length > 0 && n === ytd.length);
  // 2 = column count fits; 1 = extra numbers come from the label text (keep the last columns);
  // 0 = another table (segments, MD&A change columns, equity statement).
  const score = (c: Candidate) => (fits(c.money.length) ? 2 : c.wordy && c.money.length > expected ? 1 : 0);
  let fallback: { res: Resolution; score: number } | null = null;
  for (let si = 0; si < pattern.synonyms.length; si++) {
    const syn = pattern.synonyms[si];
    const cands: Candidate[] = [];
    for (let i = 0; i < lines.length; i++) {
      const { label, rest } = split[i];
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
      // Dashes keep their column: "Marketable securities 38,561 —" is two columns, not one, and
      // "Impairment — — — 29" puts 29 in the last column, not the first.
      let kept = cells.filter((c) => (pattern.allowPercent ? true : !c.isPercent) && (c.value !== null || c.isDash));
      if (!isUsDocument()) kept = resegmentEuropean(kept, expected, ytd.length);
      // A note reference before the columns: "Cost of sales 5.2 (255 132) …", "Wartość firmy 27 2 792 …",
      // "Goodwill 12.4 3,812 …". In a US-formatted document only when the amounts have no decimals
      // (an EPS row "0.37 (0.36) …" keeps its first value).
      if (
        expected > 0 &&
        kept.length === expected + 1 &&
        isNoteLike(kept[0]) &&
        // With a single column every "label 82 (554)" would fit — integers count as notes from 2 columns up.
        (kept[0].raw.includes(".") || expected >= 2) &&
        (!isUsDocument() || kept.slice(1).every((c) => c.value === null || Number.isInteger(c.value)))
      ) {
        kept = kept.slice(1);
      }
      const money = kept.map((c) => (c.isDash ? null : c.value));
      if (!money.some((v) => v !== null)) continue;
      if (pattern.nonNegative && money.some((v) => v !== null && v < 0)) continue;
      // Score 1 only when the last columns stand after the last word: "… respectively 4,772 1,579" yes,
      // a date header "Wartość firmy 31 grudnia 2024 31 grudnia 2023" no.
      const words = [...(rest ?? "").matchAll(/[a-ząćęłńóśźż]{3,}/gi)];
      const lastWord = words[words.length - 1];
      const tail = lastWord ? (rest ?? "").slice(lastWord.index! + lastWord[0].length) : "";
      const wordy =
        !!lastWord && expected > 0 && parseCells(tail).filter((c) => !c.isPercent && (c.value !== null || c.isDash)).length >= expected;
      cands.push({ lineIndex: i, label, money, wordy, synonymIndex: si, primary: syn.tier === "primary" });
    }
    if (cands.length === 0) continue;

    cands.sort((a, b) => score(b) - score(a) || a.lineIndex - b.lineIndex);

    if (expected <= 0) return build(cands[0], si);
    if (!fallback) {
      if (score(cands[0]) === 2) return build(cands[0], si);
      fallback = { res: build(cands[0], si), score: score(cands[0]) };
      continue;
    }
    // A later synonym replaces an inexact row with a row that fits. Over a row whose label carries
    // amounts ("Accounts receivable, net of allowance … $67 and $39 … 4,772 1,579" on the balance
    // sheet) only if it comes earlier in the document — not the cash-flow "Accounts receivable (2,882)".
    const fit = cands.find((c) => score(c) === 2 && (fallback!.score === 0 || c.lineIndex < fallback!.res.lineIndex));
    if (fit) return build(fit, si);
    const leak = cands.find((c) => score(c) === 1);
    if (leak && fallback.score === 0) fallback = { res: build(leak, si), score: 1 };
  }
  return fallback?.res ?? null;

  function build(best: Candidate, si: number): Resolution {
    let nums = best.money.map((v) => (v !== null && pattern.magnitude ? Math.abs(v) : v));
    const slots = expected > 0 ? expected : nums.length;
    let values: (number | null)[] = [];
    let note: string | undefined;
    if (expected > 0 && ytd.length > 0 && ytd.length < expected && nums.length === ytd.length) {
      values = Array.from({ length: slots }, () => null);
      ytd.forEach((col, k) => (values[col] = nums[k]));
      note = "year-to-date columns only";
    } else {
      if (expected > 0 && nums.length > expected) nums = nums.slice(nums.length - expected);
      for (let i = 0; i < slots; i++) values.push(i < nums.length ? nums[i] : null);
    }

    let confidence: Confidence = best.primary ? "HIGH" : "MEDIUM";
    if (expected > 0 && !fits(best.money.length)) confidence = downgrade(confidence);

    return {
      values,
      confidence,
      matchedLabel: best.label,
      lineIndex: best.lineIndex,
      synonymRank: si,
      cellCount: best.money.length,
      note,
    };
  }
}

/** Indices of the longest-duration periods when the set mixes quarter and year-to-date columns. */
function ytdIndices(periods: Period[]): number[] {
  const months = periods.map((p) => (p.kind === "duration" ? p.months ?? 0 : 0));
  const max = Math.max(0, ...months);
  if (max <= 3) return [];
  const idx = months.flatMap((m, i) => (m === max ? [i] : []));
  return idx.length < periods.length ? idx : [];
}

/**
 * The tax line's sign differs by convention: US "Provision for (benefit from) income taxes (390)" is a
 * benefit, IFRS "Podatek dochodowy (1 234)" is an expense. `magnitude` stores |tax|; when only
 * pre-tax + |tax| = net holds, it was a benefit and is stored negative (as on the statement).
 */
export function reconcileTaxSign(byKey: Map<MetricKey, Metric>): void {
  const tax = byKey.get("incomeTax");
  const pre = byKey.get("incomeBeforeTax");
  const net = byKey.get("netIncome");
  if (!tax || !pre || !net) return;
  let flipped = false;
  let unreconciled = false;
  for (const v of tax.values) {
    if (v.value === null || v.value === 0) continue;
    const p = metricVal(pre, v.periodKey);
    const n = metricVal(net, v.periodKey);
    if (p === null || n === null) continue;
    const t = Math.abs(v.value);
    const tol = Math.max(1, Math.abs(n) * 0.001);
    if (Math.abs(p - t - n) <= tol) continue;
    if (Math.abs(p + t - n) <= tol) {
      v.value = -t;
      flipped = true;
    } else {
      unreconciled = true; // minorities, discontinued ops, or a wrong row — keep |tax|, say so
    }
  }
  if (flipped) tax.note = "negative = tax benefit (pre-tax − tax = net)";
  if (unreconciled) tax.flags = [...(tax.flags ?? []), "tax sign not reconciled with pre-tax and net income"];
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
    ...(res.note ? { note: res.note } : {}),
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
    const vals = balance.map((p) => {
      const c = current?.values.find((v) => v.periodKey === p.key)?.value ?? null;
      const l = longTerm?.values.find((v) => v.periodKey === p.key)?.value ?? null;
      if (c === null && l === null) return null;
      return Math.abs(c ?? 0) + Math.abs(l ?? 0);
    });
    return vals.some((v) => v !== null) ? vals : null;
  };

  // A "Total debt" row with more cells than balance dates is a debt note (principal / costs / net),
  // not the balance sheet: "Total debt 38,006 145 37,861" gave debt = 145. The balance sheet wins.
  if (direct && direct.cellCount !== expected && aggregate()) {
    return aggregatedDebt(balance, aggregate()!);
  }

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
  if (agg) return aggregatedDebt(balance, agg);
  return emptyMetric(pattern, balance);
}

function aggregatedDebt(balance: Period[], agg: (number | null)[]): Metric {
  return {
    key: "totalDebt",
    label: "Total debt",
    statement: "balance",
    values: balance.map((p, i) => ({ periodKey: p.key, value: agg[i] ?? null })),
    confidence: "MEDIUM",
    note: "aggregated: current portion + long-term debt",
  };
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
    // "Net income (loss) per share …" is an EPS header; "Weighted average shares used in computing net
    // income (loss) per share" is the share-count header, not EPS.
    const nlx = nl.replace(/\s*\((?:loss|losses|income|earnings)\)/g, "");
    const isEpsHeader =
      cells.length === 0 &&
      /(earnings|loss|income|net loss|net income) per share/.test(nlx) &&
      !/weighted average/.test(nl);
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

const PL_MONTHS = "stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia";
const EN_MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december";
const DATE_RE = new RegExp(
  `\\b\\d{1,2}[./-]\\d{1,2}[./-]\\d{4}\\b|\\b\\d{1,2}\\s+(?:${PL_MONTHS}|${EN_MONTHS})\\s+\\d{4}\\b|\\b(?:${EN_MONTHS})\\s+\\d{1,2},?\\s+\\d{4}\\b`,
  "gi",
);
// A title line, not prose that mentions the statement ("kurs NBP (pozycje sprawozdania z sytuacji finansowej)").
const BALANCE_TITLE_RE =
  /^\s*(?:(?:skonsolidowane|jednostkowe|śródroczne|skrócone|consolidated|separate|interim|condensed)\s+)*(?:sprawozdanie z sytuacji|statements? of financial position|balance sheets?\b|bilans\b)/i;

const MONTH_INDEX = new Map<string, number>(
  [...PL_MONTHS.split("|"), ...EN_MONTHS.split("|")].map((m, i) => [m, (i % 12) + 1]),
);

/** "31.12.2024", "31/12/2025", "1 stycznia 2023", "December 31, 2024" → [y, m, d]. */
function parseHeaderDate(s: string): [number, number, number] | null {
  const t = s.toLowerCase().replace(/\s+/g, " ");
  let m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) return [+m[3], +m[2], +m[1]];
  m = t.match(/^(\d{1,2}) ([a-ząćęłńóśźż]+) (\d{4})$/);
  if (m && MONTH_INDEX.has(m[2])) return [+m[3], MONTH_INDEX.get(m[2])!, +m[1]];
  m = t.match(/^([a-z]+) (\d{1,2}),? (\d{4})$/);
  if (m && MONTH_INDEX.has(m[1])) return [+m[3], MONTH_INDEX.get(m[1])!, +m[2]];
  return null;
}

/**
 * Balance-sheet column dates from the statement's own header, newest first: PZU, PKO BP and Orlen show
 * three (31.12.2024, 31.12.2023 restated, 01.01.2023). Looks only between the title and the first data
 * row; a table-of-contents line ("… z sytuacji finansowej ....... 8") has no dates after it and is
 * skipped. pdfjs may print "31 grudnia 2023   1 stycznia 2023" above "31 grudnia 2024", so the column
 * order comes from the dates, not from the text. Returns [] when fewer than 2 dates are found.
 */
function balanceDatesFromHeader(lines: string[]): string[] {
  for (let i = 0; i < lines.length; i++) {
    if (!BALANCE_TITLE_RE.test(lines[i]) || /\.{5,}/.test(lines[i])) continue;
    const found = new Map<string, [number, number, number]>();
    for (let j = i; j < Math.min(lines.length, i + 10); j++) {
      const l = lines[j];
      if (j > i && /[a-ząćęłńóśźż]{3,}.*\d[\d ]*\s*$/i.test(l) && !(l.match(DATE_RE) ?? []).length) break; // first data row
      for (const raw of l.match(DATE_RE) ?? []) {
        const ymd = parseHeaderDate(raw);
        if (ymd) found.set(ymd.join("-"), ymd);
      }
    }
    if (found.size >= 2) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return [...found.values()]
        .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])
        .slice(0, 3)
        .map(([y, m, d]) => `${pad(d)}.${pad(m)}.${y}`);
    }
  }
  return [];
}

export interface ParseInput {
  text: string;
  pages: number;
  charCount: number;
}

export function parseReport(input: ParseInput): ParseResult {
  return withNumberFormat(looksUsDocument(input.text), () => parseReportInner(input));
}

function parseReportInner(input: ParseInput): ParseResult {
  const { text } = input;
  const lines = stripRelatedPartyNotes(text.split("\n").map((l) => l.replace(/\s+$/g, "")));

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
  // Restated comparatives add an opening balance (PZU, PKO BP, ORLEN: 31.12.2024, 31.12.2023, 01.01.2023).
  // The statement's own header wins over periods guessed elsewhere ("FY24 close", "Current").
  const balanceDates = balanceDatesFromHeader(lines);
  if (balanceDates.length === 3 && balance.length !== 3) {
    balance = balanceDates.map((d, i) => ({
      key: `bal${i}`,
      short: d,
      label: `As of ${d}`,
      kind: "point",
      endDate: d,
      current: i === 0,
    }));
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
  const ytd = ytdIndices(income);
  const metrics: Metric[] = [];
  const byKey = new Map<MetricKey, Metric>();
  for (const pattern of PATTERNS) {
    if (pattern.key === "totalDebt" || pattern.key === "totalOpEx") continue; // computed below
    const periods = periodsFor(pattern.statement, income, balance);
    const res = resolveMetric(lines, pattern, periods.length, pattern.statement === "cashflow" ? ytd : []);
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

  reconcileTaxSign(byKey);

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
