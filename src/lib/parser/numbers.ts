// lib/numbers.ts
// Convention-agnostic parsing of financial numbers out of reconstructed table
// rows. Handles: parentheses-as-negative, $ / currency symbols, thousands
// commas (US) OR space thousands + comma decimals (European/PL), em/en dashes
// as empty cells, percent signs, and footnote/superscript noise.
// Nothing here is issuer-specific.

import { VALUE_START_RE } from "./split";

export interface NumericCell {
  raw: string;
  /** Parsed numeric value; null when the cell is a dash / blank / unparseable. */
  value: number | null;
  isPercent: boolean;
  isDash: boolean;
}

// Figure dash, en dash, em dash, horizontal bar, minus sign, hyphen.
const DASH_CHARS = "‒–—―−-";
const DASH_RE = new RegExp(`^[${DASH_CHARS}]+$`);

// Non-breaking / narrow / thin spaces that pdfjs sometimes emits.
const ODD_SPACE_RE = /[\u00A0\u202F\u2009\u200A]/g;

// Superscript footnote glyphs and reference marks.
const SUPERSCRIPT_RE = /[¹²³⁰-₟†‡∗*]/g;

/**
 * Strip footnote/superscript noise and currency symbols and normalise spaces.
 * Deliberately does NOT touch digits, commas, dots, parens or % so that the
 * numeric content survives intact.
 */
export function denoise(input: string): string {
  return String(input)
    .replace(ODD_SPACE_RE, " ")
    // "(Note 9)", "(Notes 9 and 12)", "(see Note 3)" — reference, not a value
    .replace(/\((?:see\s+)?notes?\s+[^)]*\)/gi, " ")
    .replace(/[$€£¥]/g, " ")
    .replace(/\bPLN\b/gi, " ")
    .replace(/zł/gi, " ")
    .replace(SUPERSCRIPT_RE, " ");
}

/**
 * True when the token looks European: space thousands and/or a comma decimal
 * (e.g. "2 924 056,55", "207919,72", "-83 942,75").
 * US thousands ("82,886", "1,234,567.89") must NOT match.
 */
function looksEuropean(s: string): boolean {
  const t = s.replace(/[()]/g, "").replace(/^[−-]\s*/, "").replace(/\s+/g, " ").trim();
  if (/\d\s+\d{3}/.test(t)) return true; // space thousands → European
  if (/\./.test(t)) return false; // dotted decimal → US (or plain)
  const compact = t.replace(/\s+/g, "");
  // Classic US thousands: 1,234 or 1,234,567
  if (/^\d{1,3}(,\d{3})+$/.test(compact)) return false;
  // European decimal: …,dd (1–2 fractional digits), optionally with spaces already stripped
  if (/^\d+,\d{1,2}$/.test(compact)) return true;
  return false;
}

/**
 * Parse one numeric token into a number.
 *   (30,876) → -30876      $82,886 → 82886      67.6% → 67.6
 *   2 924 056,55 → 2924056.55     - 83 942,75 → -83942.75
 *   —/–/-    → null        4.27 → 4.27
 */
export function parseNumber(raw: string): number | null {
  if (raw == null) return null;
  let s = denoise(raw).trim();
  if (s === "" || DASH_RE.test(s)) return null;

  const parenNegative = /^\(.*\)$/.test(s);
  s = s.replace(/[()]/g, "").replace(/%/g, "").trim();

  let sign = parenNegative ? -1 : 1;
  if (s.startsWith("-") || s.startsWith("−")) {
    sign *= -1;
    s = s.slice(1).trim();
  }

  if (looksEuropean(s)) {
    // Spaces = thousands; last comma = decimal.
    s = s.replace(/\s+/g, "");
    const lastComma = s.lastIndexOf(",");
    if (lastComma >= 0) {
      s = s.slice(0, lastComma).replace(/,/g, "") + "." + s.slice(lastComma + 1);
    }
  } else {
    // US: commas = thousands; dot = decimal.
    s = s.replace(/,/g, "");
  }

  const m = s.match(/\d+(?:\.\d+)?|\.\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  if (!Number.isFinite(n)) return null;
  return sign * n;
}

/** Parse a token that is expected to carry a percent sign. */
export function parsePercent(raw: string): number | null {
  return parseNumber(raw);
}

/**
 * Match one numeric / dash cell at the start of `s`. Returns the matched raw
 * string and the remainder, or null if nothing matches.
 *
 * European amounts with internal spaces ("2 924 056,55", "- 83 942,75") are
 * consumed as a single cell — they must not be split on whitespace.
 */
function matchNextCell(s: string, usRow = false): { raw: string; rest: string } | null {
  const t = s.replace(/^\s+/, "");
  if (!t) return null;

  // In a US row a negative is "(1,234)" or "-1,234"; "- 1,234" is a nil column, then 1,234.
  if (usRow) {
    const nil = t.match(new RegExp(`^([${DASH_CHARS}]+)(?=\\s)`));
    if (nil && DASH_RE.test(nil[1])) return { raw: nil[1], rest: t.slice(nil[0].length) };
  }

  // Lone dash cell (nil / empty).
  const dash = t.match(new RegExp(`^([${DASH_CHARS}]+)(?=\\s|$|[${DASH_CHARS}])`));
  if (dash && !/^\d/.test(t.slice(dash[0].length).trimStart())) {
    // Only treat as dash-cell when the token is purely dash(es), not "- 123".
    if (DASH_RE.test(dash[1]) && !/^\d/.test(t.slice(dash[0].length).replace(/^\s+/, ""))) {
      // Distinguish "- 83 942,75" (signed number) from "-" (empty).
      const after = t.slice(dash[0].length);
      if (/^\s+\d/.test(after)) {
        // Fall through to signed European/US number below.
      } else {
        return { raw: dash[1], rest: t.slice(dash[0].length) };
      }
    }
  }

  // Parenthesised: (30,876) or ( 82,886 )
  const paren = t.match(/^\(\s*([\d\s.,]+)\s*\)/);
  if (paren) return { raw: paren[0].replace(/\s+/g, " ").trim(), rest: t.slice(paren[0].length) };

  // Signed European with space thousands: - 2 924 056,55  or −83 942,75
  const euSigned = usRow ? null : t.match(/^[−-]\s*(\d{1,3}(?:\s\d{3})+(?:,\d+)?|\d+,\d+)\b/);
  if (euSigned) return { raw: euSigned[0], rest: t.slice(euSigned[0].length) };

  // Unsigned European with space thousands, or comma decimal (1–2 digits only —
  // a 3-digit group after a comma is US thousands, e.g. 82,886).
  const eu = usRow
    ? null
    : t.match(/^\d{1,3}(?:\s\d{3})+(?:,\d+)?\b/) || t.match(/^\d+,\d{1,2}\b/);
  if (eu) return { raw: eu[0], rest: t.slice(eu[0].length) };

  // US / plain: -82,886.50 or 82886 or 4.27%
  const us = t.match(/^[−-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?%?/) || t.match(/^[−-]?\d+(?:\.\d+)?%?/);
  if (us) return { raw: us[0], rest: t.slice(us[0].length) };

  // Skip a non-numeric word and retry (e.g. stray "do" in a header bleed).
  const skip = t.match(/^\S+/);
  if (!skip) return null;
  return matchNextCell(t.slice(skip[0].length), usRow);
}

/** Set by `withNumberFormat` for one parse: the whole document writes numbers the US way. */
let usDocument = false;

/**
 * Decide once per document: many "1,234" and (almost) no "1 234,56" / "12,5" → US. Then a space never
 * joins digits, even in rows with no comma at all ("Restructuring charges 3 278 (6) 472",
 * "Depreciation and amortization 997 611").
 */
export function looksUsDocument(text: string): boolean {
  // Table rows only (a label, numbers at the end): prose like "PLN 296,947 million" in an English
  // Orlen report must not outvote ~1,750 space-grouped amounts in its tables.
  const rows = text
    .split("\n")
    .filter((l) => /[\d)]\s*$/.test(l) && /[a-z]{3,}/i.test(l))
    .join("\n");
  const us = rows.match(/\d,\d{3}(?![\d,])/g)?.length ?? 0;
  const eu = rows.match(/\d,\d{1,2}(?!\d)/g)?.length ?? 0;
  const spaced = rows.match(/(?<![\d,.])\d{1,3}(?: \d{3})+(?![\d,.])/g)?.length ?? 0;
  return us >= 20 && us > 5 * eu && us > 2 * spaced;
}

/** Whether the current parse treats the document as US-formatted (see `withNumberFormat`). */
export function isUsDocument(): boolean {
  return usDocument;
}

export function withNumberFormat<T>(us: boolean, fn: () => T): T {
  const prev = usDocument;
  usDocument = us;
  try {
    return fn();
  } finally {
    usDocument = prev;
  }
}

/**
 * Split a "values region" (the part of a row after a label) into ordered cells,
 * one per column. Handles both US ("82,886") and European ("2 924 056,55")
 * thousand separators.
 */
export function parseCells(region: string): NumericCell[] {
  let s = denoise(region);
  // Glue symbols that pdfjs may have detached from their number so each cell is
  // whitespace-free at the edges: "( 82,886 )" → handled in matcher,
  // "67.6 %" → "67.6%".
  s = s.replace(/\s+%/g, "%");
  // In a US document a space never joins digits: "1,025 140 885 632.1 %" (amount, amount, change, %)
  // used to become one cell of 140,885,632. Decided per document, not per row — in a Polish table
  // "39 119,801" is 39 119.801, not two columns.
  const us = usDocument;

  const cells: NumericCell[] = [];
  let guard = 0;
  while (s.trim() && guard++ < 200) {
    const m = matchNextCell(s, us);
    if (!m) break;
    s = m.rest;
    const raw = m.raw.trim();
    if (!raw) continue;
    if (DASH_RE.test(raw)) {
      cells.push({ raw, value: null, isPercent: false, isDash: true });
      continue;
    }
    if (!/\d/.test(raw)) continue;
    cells.push({
      raw,
      value: parseNumber(raw),
      isPercent: raw.includes("%"),
      isDash: false,
    });
  }
  return cells;
}

/**
 * Split a full row into its leading text label and trailing numeric cells.
 * Used where there is no known synonym to anchor on (e.g. dynamic segment rows).
 * Digits in the label are allowed only after we locate the first money cell.
 */
export function splitLabelAndCells(line: string): {
  label: string;
  cells: NumericCell[];
} {
  const denoised = denoise(line);
  // Ignore leading list/PAS markers ("1.", "a)", "III.") when locating money.
  const marker = denoised.match(/^\s*(?:[a-ząćęłńóśźż]|[ivxlcdm]{1,6}|\d{1,2})\s*[.)]\s+/i);
  const offset = marker ? marker[0].length : 0;
  const body = denoised.slice(offset);

  const digit = body.search(VALUE_START_RE);
  if (digit < 0) {
    const onlyCells = parseCells(denoised);
    if (onlyCells.length > 0 && !/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(denoised)) {
      return { label: "", cells: onlyCells };
    }
    return { label: denoised.trim(), cells: [] };
  }

  let start = offset + digit;
  const pre = denoised.slice(0, start).match(/[(−$€£-]\s*$/);
  if (pre) start = start - pre[0].length;

  const label = denoised
    .slice(0, start)
    .replace(/[(−$\s€£-]+$/, "")
    .trim();
  return { label, cells: parseCells(denoised.slice(start)) };
}

/** Numeric (non-percent) values from a region, preserving column order. */
export function moneyValues(region: string): (number | null)[] {
  return parseCells(region)
    .filter((c) => !c.isPercent)
    .map((c) => c.value);
}

/** A note reference in front of the columns: "27", "25", "12.4", "5.2" (raw cell text, not a dash or a parenthesis). */
export function isNoteLike(cell: NumericCell): boolean {
  return !cell.isDash && !cell.isPercent && /^\d{1,2}(?:\.\d{1,2})*$/.test(cell.raw);
}

const CHAIN_RE = /^\d{1,3}(?: \d{3})+$/;
const MAX_SEGMENTATIONS = 4096;

function digits(v: number): number {
  return String(Math.trunc(Math.abs(v))).length;
}

/**
 * European tables separate both thousands and columns with a single space, so "503 257 467 945 429 205"
 * is three amounts (503 257 / 467 945 / 429 205) that the tokenizer reads as one. Given the column count
 * the row should have, try every split of such space-joined runs and keep the one whose amounts have the
 * most similar size (a leading note number is left out of that comparison). Only rows that do not fit the
 * columns, or that contain a run of 3+ groups, are touched; a split is accepted only if the sizes differ by at
 * most 2 digits. Returns the cells unchanged when nothing better exists.
 */
export function resegmentEuropean(cells: NumericCell[], expected: number, ytd = 0): NumericCell[] {
  if (expected <= 0) return cells;
  const noted = (row: NumericCell[]) => row.length === expected + 1 && !!row[0] && isNoteLike(row[0]);
  const fits = (row: NumericCell[]) => row.length === expected || (ytd > 0 && row.length === ytd) || noted(row);
  // Only runs of 3+ groups are split: "525 225" stays 525 225 (splitting it would invent two columns).
  const chains = cells.map((c) => {
    const g = !c.isDash && !c.isPercent && CHAIN_RE.test(c.raw) ? c.raw.split(" ") : null;
    return g && g.length >= 3 ? g : null;
  });
  if (!chains.some((g) => g)) return cells;

  // Every chain of k groups can be cut after any of its first k−1 groups: 2^(k−1) ways.
  const options: NumericCell[][][] = cells.map((c, i) => {
    const g = chains[i];
    if (!g) return [[c]];
    const out: NumericCell[][] = [];
    for (let mask = 0; mask < 1 << (g.length - 1); mask++) {
      const parts: NumericCell[] = [];
      let cur = [g[0]];
      for (let j = 1; j < g.length; j++) {
        if (mask & (1 << (j - 1))) {
          parts.push(chainCell(cur));
          cur = [g[j]];
        } else cur.push(g[j]);
      }
      parts.push(chainCell(cur));
      out.push(parts);
    }
    return out;
  });
  const total = options.reduce((n, o) => n * o.length, 1);
  if (total > MAX_SEGMENTATIONS) return cells;

  const cost = (row: NumericCell[]): number => {
    const d = (noted(row) ? row.slice(1) : row).filter((c) => c.value !== null).map((c) => digits(c.value as number));
    return d.length ? Math.max(...d) - Math.min(...d) : 0;
  };

  let bestFit: { row: NumericCell[]; cost: number } | null = null;
  let bestAny: { row: NumericCell[]; cost: number } | null = null;
  for (let k = 0; k < total; k++) {
    let rem = k;
    const row: NumericCell[] = [];
    for (const o of options) {
      row.push(...o[rem % o.length]);
      rem = Math.floor(rem / o.length);
    }
    const c = cost(row);
    const better = (b: { row: NumericCell[]; cost: number } | null) =>
      !b || c < b.cost || (c === b.cost && row.length < b.row.length);
    if (fits(row) && c <= 2 && better(bestFit)) bestFit = { row, cost: c };
    if (better(bestAny)) bestAny = { row, cost: c };
  }
  if (bestFit) return bestFit.row;
  // A row that "fits" only because a long run stayed glued (Orlen "Total assets 262 742 264 463 61 489
  // 60 824": PLN + EUR columns) is another table — give it its natural split so it stops fitting.
  if (fits(cells) && bestAny && cost(cells) > 2) return bestAny.row;
  return cells;
}

function chainCell(groups: string[]): NumericCell {
  return { raw: groups.join(" "), value: Number(groups.join("")), isPercent: false, isDash: false };
}
