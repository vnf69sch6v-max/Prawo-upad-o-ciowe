// lib/rows.ts
// Exhaustive inventory of labeled numeric rows in the extracted text.
// Independent of synonym matching — every row with a label + money cells is
// captured so the UI/API can show "all numbers", not only headline metrics.

import type { ExtractedRow, Period } from "./types";
import { splitLabelAndCells, parseCells } from "./numbers";

const FOOTER_RE =
  /^(jednostkowy raport|skonsolidowany raport|table of contents|page\s+\d|-\s*\d+\s*-|\d+\s*$)/i;

/** Skip TOC / page markers / blank-ish lines. */
function isNoiseLabel(label: string): boolean {
  const t = label.trim();
  if (!t) return true;
  if (t.length > 180) return true;
  if (FOOTER_RE.test(t)) return true;
  // Pure section letters without substance: "A." / "II." alone — keep if short? skip bare.
  if (/^[A-ZĄĆĘŁŃÓŚŹŻ]\.?$/i.test(t)) return true;
  return false;
}

/**
 * Walk every line and emit labeled numeric rows. When a label line has no
 * trailing numbers but the next line is values-only, join them (common in PAS
 * PDFs where OCF / capex labels wrap).
 */
export function extractAllRows(
  lines: string[],
  income: Period[],
  balance: Period[],
): ExtractedRow[] {
  const rows: ExtractedRow[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !/\d|[‒–—―−-]/.test(line)) continue;

    const split = splitLabelAndCells(line);
    const label = split.label;
    let cells = split.cells;
    const lineIndex = i;
    let rawLine = line;

    // Label-only row + values on the next line.
    if (label && cells.filter((c) => c.value !== null || c.isDash).length === 0) {
      const next = lines[i + 1];
      if (next) {
        const n = splitLabelAndCells(next);
        const nextVals = n.cells.filter((c) => c.value !== null || c.isDash);
        if ((!n.label || n.label.length < 2) && nextVals.length >= 1) {
          cells = n.cells;
          rawLine = `${line}\n${next}`;
          i++; // consume the value line
        }
      }
    }

    // Values-only line with prior label already consumed — skip orphans here;
    // they were joined above when possible.
    if (!label || isNoiseLabel(label)) continue;

    const money = cells.filter((c) => !c.isPercent);
    if (money.length === 0) continue;
    if (!money.some((c) => c.value !== null)) {
      // All dashes — still useful as a labeled nil row; keep if ≥2 columns.
      if (money.length < 2) continue;
    }

    const values = money.map((c) => c.value);
    const key = `${label}::${values.map((v) => (v == null ? "-" : v)).join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const periodKind = inferPeriodKind(values.length, income, balance);
    const periods = periodKind === "balance" ? balance : periodKind === "income" ? income : [];

    rows.push({
      lineIndex,
      label: label.replace(/\s+/g, " ").trim(),
      values,
      periodKeys: periods.length === values.length ? periods.map((p) => p.key) : undefined,
      periodKind,
      rawLine,
    });
  }

  return rows;
}

function inferPeriodKind(
  n: number,
  income: Period[],
  balance: Period[],
): ExtractedRow["periodKind"] {
  if (balance.length > 0 && n === balance.length && n !== income.length) return "balance";
  if (income.length > 0 && n === income.length) return "income";
  if (balance.length > 0 && n === balance.length) return "balance";
  return "unknown";
}

/** Count rows that carry at least one real number (not only dashes). */
export function countedNumericRows(rows: ExtractedRow[]): number {
  return rows.filter((r) => r.values.some((v) => v !== null)).length;
}

/** Convenience: re-parse a region (exported for tests). */
export function cellsFromRegion(region: string) {
  return parseCells(region);
}
