// lib/numbers.ts
// Convention-agnostic parsing of financial numbers out of reconstructed table
// rows. Handles: parentheses-as-negative, $ / currency symbols, thousands
// commas (US) OR space thousands + comma decimals (European/PL), em/en dashes
// as empty cells, percent signs, and footnote/superscript noise.
// Nothing here is issuer-specific.

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
function matchNextCell(s: string): { raw: string; rest: string } | null {
  const t = s.replace(/^\s+/, "");
  if (!t) return null;

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
  const euSigned = t.match(/^[−-]\s*(\d{1,3}(?:\s\d{3})+(?:,\d+)?|\d+,\d+)\b/);
  if (euSigned) return { raw: euSigned[0], rest: t.slice(euSigned[0].length) };

  // Unsigned European with space thousands, or comma decimal (1–2 digits only —
  // a 3-digit group after a comma is US thousands, e.g. 82,886).
  const eu =
    t.match(/^\d{1,3}(?:\s\d{3})+(?:,\d+)?\b/) ||
    t.match(/^\d+,\d{1,2}\b/);
  if (eu) return { raw: eu[0], rest: t.slice(eu[0].length) };

  // US / plain: -82,886.50 or 82886 or 4.27%
  const us = t.match(/^[−-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?%?/) || t.match(/^[−-]?\d+(?:\.\d+)?%?/);
  if (us) return { raw: us[0], rest: t.slice(us[0].length) };

  // Skip a non-numeric word and retry (e.g. stray "do" in a header bleed).
  const skip = t.match(/^\S+/);
  if (!skip) return null;
  return matchNextCell(t.slice(skip[0].length));
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

  const cells: NumericCell[] = [];
  let guard = 0;
  while (s.trim() && guard++ < 200) {
    const m = matchNextCell(s);
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

  const digit = body.search(/\(?\s*[$€£]?\s*\d|—|–|[−-]\s*\d/);
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
