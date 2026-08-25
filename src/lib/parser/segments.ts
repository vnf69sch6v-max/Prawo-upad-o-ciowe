// lib/segments.ts
// Parse the reportable-segment table — "the company from the inside". Segment
// names are captured dynamically (never hardcoded). Handles the common
// per-segment block layout (name → Revenue / Cost / Opex / Operating income) and
// falls back to a matrix layout (a Revenue section then an Operating income
// section). Reconciles segment sums to the consolidated totals.

import type { Metric, Period, ProductRevenueResult, Segment, SegmentsResult } from "./types";
import { splitLabelAndCells, parseNumber, denoise } from "./numbers";
import { normalizeLabel } from "./patterns";

const PRODUCT_SECTION_RE =
  /revenue,? (classified by|disaggregated by).*(product|service offering)|revenue by (product|offering|type)|disaggregation of revenue/i;

/**
 * Parse a flat "revenue by product / offering" table (name + values, ending in
 * Total) and reconcile the sum to consolidated revenue. Generic — product names
 * are captured dynamically.
 */
const NUM_TOKEN_RE = /\(?-?[\d][\d,]*(?:\.\d+)?\)?/g;

/**
 * Split a flat table row into its name and the trailing K value columns. Anchors
 * on the right-most numbers so a digit inside the name ("Microsoft 365",
 * "Windows 11") stays part of the name instead of being read as a value.
 */
function splitTrailingValues(line: string, k: number): { name: string; values: number[] } | null {
  const s = denoise(line);
  const toks: { raw: string; index: number }[] = [];
  NUM_TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUM_TOKEN_RE.exec(s))) toks.push({ raw: m[0], index: m.index });
  if (toks.length === 0) return null;
  const valTokens = toks.slice(Math.max(0, toks.length - k));
  const name = s.slice(0, valTokens[0].index).replace(/[\s$:,-]+$/, "").trim();
  const values = valTokens
    .map((t) => parseNumber(t.raw))
    .filter((v): v is number => v !== null);
  return { name, values };
}

export function parseProductRevenue(
  lines: string[],
  income: Period[],
  revenueMetric: Metric,
): ProductRevenueResult | null {
  const start = lines.findIndex((l) => PRODUCT_SECTION_RE.test(l));
  if (start < 0) return null;

  const primary = income.find((p) => p.current) ?? income[0];
  const k = Math.max(1, income.length);
  const items: { name: string; value: number }[] = [];
  let total: number | null = null;

  for (let i = start + 1; i < Math.min(lines.length, start + 40); i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (
      HEADER_NOISE_RE.test(line) ||
      /months ended|year ended|^\(in /i.test(line) ||
      /^\s*(\$?\s*(?:19|20)\d{2}\s*)+$/.test(line)
    )
      continue;
    const split = splitTrailingValues(line, k);
    if (!split || split.values.length === 0) {
      if (items.length) break;
      continue;
    }
    if (/^total\b/i.test(line.trim())) {
      total = split.values[0];
      break;
    }
    if (!split.name || split.name.length < 2) {
      if (items.length) break;
      continue;
    }
    items.push({ name: split.name, value: split.values[0] });
  }

  if (items.length < 2) return null;
  const sum = items.reduce((a, s) => a + (s.value ?? 0), 0);
  const totalRev =
    total ?? revenueMetric.values.find((v) => v.periodKey === primary?.key)?.value ?? null;
  const reconciles = totalRev !== null && Math.abs(sum - totalRev) <= Math.max(2, Math.abs(totalRev) * 0.01);

  return {
    periodKey: primary?.key ?? "inc0",
    periodLabel: primary?.short ?? "Current",
    items: items.map((it) => ({
      name: it.name,
      value: it.value,
      share: totalRev ? (it.value / totalRev) * 100 : null,
    })),
    total: totalRev,
    reconciles,
  };
}

const SECTION_RE =
  /segment revenue, cost of revenue|reportable segment|segment information|segment results of operations|results of (our|the) reportable segments|segment.*operating income (loss)?\s+(were|are|was)|our segments/i;

const REVENUE_RE = /^(revenue|revenues|total revenue|segment revenue|net revenue|net sales)$/;
const OPINCOME_RE =
  /^(operating income|operating income \(loss\)|operating loss|segment operating income|operating profit)$/;

const LINE_ITEM_RE =
  /^(revenue|revenues|cost of revenue|cost of sales|operating expenses|operating income|operating income \(loss\)|operating loss|gross margin|gross profit|research and development|sales and marketing|general and administrative|depreciation|amortization|net income|net loss|other|total)$/;

const HEADER_NOISE_RE =
  /months ended|year ended|^\(in (millions|thousands|billions)|unaudited|^\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|^\(?(?:19|20)\d{2}/i;

function firstMoney(cells: { value: number | null; isPercent: boolean }[]): number | null {
  const m = cells.filter((c) => !c.isPercent && c.value !== null);
  return m.length ? (m[0].value as number) : null;
}

function moneyCells(line: string): number[] {
  return splitLabelAndCells(line).cells.filter((c) => !c.isPercent && c.value !== null).map((c) => c.value as number);
}

function isNameLine(label: string, cells: number): boolean {
  if (cells > 0) return false;
  const nl = normalizeLabel(label);
  if (!nl || nl.length < 2 || nl.length > 60) return false;
  if (!/[a-z]/i.test(nl)) return false;
  if (LINE_ITEM_RE.test(nl)) return false;
  if (HEADER_NOISE_RE.test(label)) return false;
  return true;
}

const PERIOD_BLOCK_RE = /\b(?:three|six|nine|twelve|\d{1,2})\s+months?\s+ended\b|\byears?\s+ended\b|\bquarters?\s+ended\b/i;
const BLOCK_DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+((?:19|20)\d{2})\b/i;
const MONTH_ABBR: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

interface SegTable {
  segments: Segment[];
  totalRevenue: number | null;
  totalOperatingIncome: number | null;
}

/**
 * Detect whether the segment table lists segments down the rows (Microsoft) or
 * across the columns (NVIDIA). A "Revenue" data row preceded by a period header
 * ("Three Months Ended …") is columns; preceded by a segment name is rows.
 */
function detectOrientation(lines: string[], start: number, end: number): "rows" | "columns" {
  for (let i = start + 1; i < end; i++) {
    const { label, cells } = splitLabelAndCells(lines[i]);
    const money = cells.filter((c) => !c.isPercent && c.value !== null);
    if (REVENUE_RE.test(normalizeLabel(label)) && money.length >= 2) {
      for (let j = i - 1; j >= Math.max(start, i - 5); j--) {
        if (PERIOD_BLOCK_RE.test(lines[j])) return "columns";
        const above = splitLabelAndCells(lines[j]);
        if (isNameLine(above.label, above.cells.length)) return "rows";
      }
      return "rows";
    }
  }
  return "rows";
}

/**
 * Build the column names for a column-oriented table, stitching a header that
 * wrapped onto two lines (NVIDIA: "Compute &" / "Networking Graphics Total" →
 * ["Compute & Networking", "Graphics", "Total"]). Keeps the "&".
 */
function stitchColumnHeader(lines: string[], start: number, pb0: number, nCols: number): string[] | null {
  const cand: string[] = [];
  for (let i = pb0 - 1; i > start; i--) {
    const t = lines[i].trim();
    if (!t) continue;
    if (/^\(in (millions|thousands|billions)/i.test(t)) continue;
    if (/[.:]$/.test(t) || /\b(we have|chief operating decision|reportable segment)\b/i.test(t)) break;
    cand.unshift(t);
    if (cand.length >= 2) break;
  }
  if (cand.length === 0) return null;

  const tokensLast = cand[cand.length - 1].split(/\s+/).filter(Boolean);
  const upper = cand.length >= 2 ? cand[cand.length - 2].trim() : "";
  let names: string[];
  if (upper && /(&|\band)$/i.test(upper)) {
    // Wrapped name: upper fragment + first token of the lower line.
    names = [(upper + " " + tokensLast[0]).trim(), ...tokensLast.slice(1)];
  } else {
    names = tokensLast;
  }
  if (names.length !== nCols) {
    if (tokensLast.length === nCols) names = tokensLast;
    else return null;
  }
  return names;
}

/** Parse a segments-as-columns table (NVIDIA Note 13). */
function parseColumnSegments(lines: string[], start: number, end: number): SegTable | null {
  let pb0 = -1;
  for (let i = start + 1; i < end; i++) {
    if (PERIOD_BLOCK_RE.test(lines[i]) && BLOCK_DATE_RE.test(lines[i])) {
      pb0 = i;
      break;
    }
  }
  if (pb0 < 0) return null;

  let nCols = 0;
  for (let i = pb0 + 1; i < Math.min(end, pb0 + 6); i++) {
    if (REVENUE_RE.test(normalizeLabel(splitLabelAndCells(lines[i]).label))) {
      nCols = moneyCells(lines[i]).length;
      break;
    }
  }
  if (nCols < 2) return null;

  const names = stitchColumnHeader(lines, start, pb0, nCols);
  if (!names) return null;

  interface Block { year: number; month: number; day: number; revenue: number[]; opIncome: number[]; }
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (let i = pb0; i < end; i++) {
    const line = lines[i];
    if (/\breconciliation\b|revenue by reportable|^\s*note\s+\d/i.test(line)) break;
    if (PERIOD_BLOCK_RE.test(line) && BLOCK_DATE_RE.test(line)) {
      const m = line.match(BLOCK_DATE_RE)!;
      cur = { month: MONTH_ABBR[m[1].toLowerCase().slice(0, 3)] ?? 1, day: parseInt(m[2], 10), year: parseInt(m[3], 10), revenue: [], opIncome: [] };
      blocks.push(cur);
      continue;
    }
    if (!cur) continue;
    const nl = normalizeLabel(splitLabelAndCells(line).label);
    if (REVENUE_RE.test(nl)) {
      const mv = moneyCells(line);
      if (mv.length) cur.revenue = mv;
    } else if (OPINCOME_RE.test(nl)) {
      const mv = moneyCells(line);
      if (mv.length) cur.opIncome = mv;
    }
  }

  const usable = blocks.filter((b) => b.revenue.length >= nCols || b.opIncome.length >= nCols);
  if (usable.length === 0) return null;
  const sorted = [...usable].sort((a, b) => b.year - a.year || b.month - a.month || b.day - a.day);
  const current = sorted[0];
  const prior = sorted[1];

  let totalIdx = names.findIndex((n) => /^(total|consolidated)\b/i.test(n.trim()));
  if (totalIdx < 0) totalIdx = names.length - 1;

  const segments: Segment[] = [];
  names.forEach((name, i) => {
    if (i === totalIdx) return;
    const rev = current.revenue[i] ?? null;
    const revPrior = prior?.revenue[i] ?? null;
    const op = current.opIncome[i] ?? null;
    if (rev === null && op === null) return;
    segments.push({
      name: name.trim(),
      revenue: rev,
      revenuePrior: revPrior,
      revenueYoY: rev !== null && revPrior !== null && revPrior !== 0 ? ((rev - revPrior) / Math.abs(revPrior)) * 100 : null,
      operatingIncome: op,
      operatingMargin: rev && op !== null && rev !== 0 ? (op / rev) * 100 : null,
    });
  });

  return {
    segments,
    totalRevenue: current.revenue[totalIdx] ?? null,
    totalOperatingIncome: current.opIncome[totalIdx] ?? null,
  };
}

/** Parse a segments-as-rows table (Microsoft: name → Revenue / … / Operating income). */
function parseRowSegments(lines: string[], start: number, end: number): SegTable {
  const segments: Segment[] = [];
  let currentName: string | null = null;
  let totalRevenue: number | null = null;
  let totalOperatingIncome: number | null = null;
  let pendingRevenue: number | null = null;
  let pendingRevenuePrior: number | null = null;
  let inTotal = false;

  for (let i = start + 1; i < end; i++) {
    const { label, cells } = splitLabelAndCells(lines[i]);
    const nl = normalizeLabel(label);
    if (!label && cells.length === 0) continue;
    if (/^note\s+\d|^\d+\s*$/.test(nl) && cells.length === 0) {
      if (segments.length > 0) break;
      continue;
    }
    if ((nl === "total" || nl === "total segment" || nl === "consolidated") && cells.length === 0) {
      inTotal = true;
      currentName = "Total";
      continue;
    }
    if (isNameLine(label, cells.length)) {
      inTotal = false;
      currentName = label.trim();
      pendingRevenue = null;
      pendingRevenuePrior = null;
      continue;
    }
    if (REVENUE_RE.test(nl)) {
      const money = cells.filter((c) => !c.isPercent && c.value !== null).map((c) => c.value as number);
      if (inTotal) totalRevenue = money[0] ?? null;
      else {
        pendingRevenue = money[0] ?? null;
        pendingRevenuePrior = money[1] ?? null;
      }
      continue;
    }
    if (OPINCOME_RE.test(nl)) {
      const v = firstMoney(cells);
      if (inTotal) {
        totalOperatingIncome = v;
        break;
      }
      if (currentName) {
        segments.push({
          name: currentName,
          revenue: pendingRevenue,
          revenuePrior: pendingRevenuePrior,
          revenueYoY:
            pendingRevenue !== null && pendingRevenuePrior !== null && pendingRevenuePrior !== 0
              ? ((pendingRevenue - pendingRevenuePrior) / Math.abs(pendingRevenuePrior)) * 100
              : null,
          operatingIncome: v,
          operatingMargin: pendingRevenue && v !== null && pendingRevenue !== 0 ? (v / pendingRevenue) * 100 : null,
        });
        pendingRevenue = null;
        pendingRevenuePrior = null;
      }
    }
  }
  return { segments, totalRevenue, totalOperatingIncome };
}

export function parseSegments(
  lines: string[],
  income: Period[],
  revenueMetric: Metric,
  opIncomeMetric: Metric,
): SegmentsResult | null {
  // Locate a segment section that is actually a table (has segment-like rows
  // shortly after), preferring the note over the table of contents.
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (SECTION_RE.test(lines[i])) {
      start = i;
      const hasRevenueRow = lines
        .slice(i + 1, i + 14)
        .some((l) => REVENUE_RE.test(normalizeLabel(splitLabelAndCells(l).label)));
      if (hasRevenueRow) break;
    }
  }
  if (start < 0) return null;

  const end = Math.min(lines.length, start + 90);
  const orientation = detectOrientation(lines, start, end);
  const table = orientation === "columns" ? parseColumnSegments(lines, start, end) : parseRowSegments(lines, start, end);
  if (!table) return null;

  const clean = table.segments.filter((s) => s.revenue !== null || s.operatingIncome !== null);
  if (clean.length < 1) return null;

  const primary = income.find((p) => p.current) ?? income[0];
  const sumRev = clean.reduce((a, s) => a + (s.revenue ?? 0), 0);
  const sumOp = clean.reduce((a, s) => a + (s.operatingIncome ?? 0), 0);

  // Reconcile to the segment table's OWN total (Σ segments). For issuers with
  // unallocated items (NVIDIA: SBC, unallocated opex, acquisition costs) the
  // segment total intentionally differs from consolidated operating income — so
  // comparing to consolidated would raise a false error. We use the table total.
  const consolidatedRevenue =
    table.totalRevenue ?? revenueMetric.values.find((v) => v.periodKey === primary?.key)?.value ?? null;
  const consolidatedOp =
    table.totalOperatingIncome ?? opIncomeMetric.values.find((v) => v.periodKey === primary?.key)?.value ?? null;

  const tol = (base: number) => Math.max(2, Math.abs(base) * 0.01);
  const revReconciles = consolidatedRevenue !== null && Math.abs(sumRev - consolidatedRevenue) <= tol(consolidatedRevenue);
  const opReconciles = consolidatedOp !== null && Math.abs(sumOp - consolidatedOp) <= tol(consolidatedOp);

  return {
    periodKey: primary?.key ?? "inc0",
    periodLabel: primary?.short ?? "Current",
    segments: clean,
    totalRevenue: table.totalRevenue ?? consolidatedRevenue,
    totalOperatingIncome: table.totalOperatingIncome ?? consolidatedOp,
    reconciles: revReconciles && opReconciles,
    note:
      revReconciles && opReconciles
        ? "Segment revenue and operating income tie to the segment-table totals."
        : "Segment sums do not fully reconcile to the segment-table totals.",
  };
}
