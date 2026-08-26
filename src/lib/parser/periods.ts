// lib/periods.ts
// Detect document context (form, issuer, currency, units) and — the hard part —
// label the statement columns with real period descriptors instead of "COL N".
// Distinguishes duration periods ("Three/Nine Months Ended …") from point-in-time
// balance-sheet dates, and infers the fiscal quarter from the fiscal year end.

import type { Period } from "./types";
import { PATTERNS, labelMatches, isExcluded } from "./patterns";
import { parseCells } from "./numbers";
import { splitLeadingLabel } from "./split";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DURATION_RE = /\b(three|six|nine|twelve|3|6|9|12)\s+months\s+ended/i;
const MONTHDAY_RE =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})/i;
const FULLDATE_RE =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+((?:19|20)\d{2})\b/i;

const DURATION_WORD: Record<string, number> = {
  three: 3, six: 6, nine: 9, twelve: 12, "3": 3, "6": 6, "9": 9, "12": 12,
};

export function detectForm(text: string): string | null {
  // Anchor on the "FORM 10-X" cover-page header; body text often references the
  // prior annual "Form 10-K", which must not override a quarterly filing.
  const m = text.match(/FORM\s+10-?([KQ])\b/i);
  if (m) return m[1].toUpperCase() === "K" ? "SEC 10-K" : "SEC 10-Q";
  const head = text.slice(0, 8000);
  if (/\b10-?Q\b/i.test(head)) return "SEC 10-Q";
  if (/\b10-?K\b/i.test(head)) return "SEC 10-K";
  // Polish NewConnect / ASO periodic reports (Załącznik nr 3 Regulaminu ASO).
  if (
    /raport\s+okresowy/i.test(head) ||
    /alternatywnym\s+systemie\s+obrotu/i.test(head) ||
    /\bNewConnect\b/i.test(head) ||
    /załącznik\s+nr\s*3\s+regulaminu\s+aso/i.test(head)
  ) {
    if (/kwartał/i.test(head) || /kwartaln/i.test(head)) return "NewConnect Q";
    if (/półrocz/i.test(head)) return "NewConnect H";
    return "NewConnect";
  }
  return null;
}

/** Title-case an ALL-CAPS issuer name while preserving normal-cased ones. */
export function smartTitleCase(name: string): string {
  if (name !== name.toUpperCase()) return name.trim();
  const keepUpper = new Set(["LLC", "L.L.C.", "PLC", "N.V.", "S.A.", "AG", "USA"]);
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      const up = w.toUpperCase();
      if (keepUpper.has(up)) return up;
      if (/^inc\.?$/.test(w)) return "Inc.";
      if (/^corp\.?$/.test(w)) return "Corp.";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .trim();
}

export function detectIssuer(lines: string[]): string | null {
  const idx = lines.findIndex((l) => /exact name of registrant/i.test(l));
  if (idx > 0) {
    for (let i = idx - 1; i >= Math.max(0, idx - 4); i--) {
      const cand = lines[i].trim();
      if (cand && cand.length > 1 && !/^_+$/.test(cand) && /[a-z]/i.test(cand)) {
        return smartTitleCase(cand);
      }
    }
  }
  // Polish cover: "KOMBINAT KONOPNY S.A." near the top, or "Nazwa emitenta".
  const emitent = lines.findIndex((l) => /nazwa\s+emitenta/i.test(l));
  if (emitent >= 0) {
    for (let i = emitent; i <= Math.min(lines.length - 1, emitent + 3); i++) {
      const cand = lines[i].replace(/nazwa\s+emitenta\s*:?\s*/i, "").trim();
      if (cand && cand.length > 2 && cand.length < 80) return smartTitleCase(cand);
    }
  }
  const top = lines.slice(0, 60);
  // Prefer a clean ALL-CAPS "…. S.A." cover title near the top.
  const caps = top.find(
    (l) =>
      /^[A-ZĄĆĘŁŃÓŚŹŻ0-9 .,&'-]{5,70}S\.A\.\s*$/.test(l.trim()) &&
      !/RAPORT|KWARTAŁ|SPRAWOZDANIE|ZARZĄD/i.test(l),
  );
  if (caps) return smartTitleCase(caps.trim());

  const pl = top.find(
    (l) =>
      /\bS\.A\.\b|\bSpółka\s+Akcyjna\b|\bSp\.\s*z\s*o\.o\./i.test(l.trim()) &&
      l.trim().length < 80 &&
      !/kapitał|adres|krs|nip|regon/i.test(l),
  );
  if (pl) {
    return smartTitleCase(
      pl
        .trim()
        .replace(/\s+Spółka\s+Akcyjna.*/i, " S.A.")
        .replace(/\s+/g, " "),
    );
  }
  // Fallback: a CORPORATION / INC line near the top.
  const corp = top.find((l) => /\b(corporation|incorporated|holdings|company)\b/i.test(l.trim()) && l.trim().length < 60);
  return corp ? smartTitleCase(corp.trim()) : null;
}

export function detectCurrency(text: string): string | null {
  const head = text.slice(0, 40000);
  if (/\bPLN\b|złot/i.test(head)) return "PLN";
  // Dollars dominate SEC filings; a stray € for foreign ops must not win.
  const dollars = (head.match(/\$/g) || []).length;
  if (dollars > 3 || /U\.?S\.?\s*dollars|USD/i.test(head)) return "USD";
  if (/€|\bEUR\b/.test(head)) return "EUR";
  if (/£|\bGBP\b/.test(head)) return "GBP";
  return /\$/.test(head) ? "USD" : null;
}

export function detectUnits(text: string): { unitLabel: string | null; unitScale: number } {
  const head = text.slice(0, 20000);
  if (/in\s+billions/i.test(head)) return { unitLabel: "in billions", unitScale: 1e9 };
  if (/in\s+millions/i.test(head)) return { unitLabel: "in millions", unitScale: 1e6 };
  if (/in\s+thousands/i.test(head)) return { unitLabel: "in thousands", unitScale: 1e3 };
  // Polish scaled tables (narrative may say "tys." even when statements are full zł).
  if (/dane\s+w\s+tys/i.test(head) || /w\s+tys\.\s*(zł|pln)/i.test(head) || /(?:^|\n)[^\n]*tys\.\s*zł/i.test(head.slice(0, 5000))) {
    // Only apply scale when an explicit "dane w tys." / table-unit banner is present.
    if (/dane\s+w\s+tys/i.test(head) || /kwoty\s+w\s+tys/i.test(head) || /w\s+tysiącach\s+zł/i.test(head)) {
      return { unitLabel: "w tys. zł", unitScale: 1e3 };
    }
  }
  if (/w\s+mln\s*(zł|pln)/i.test(head) && /dane\s+w\s+mln/i.test(head)) {
    return { unitLabel: "w mln zł", unitScale: 1e6 };
  }
  return { unitLabel: null, unitScale: 1 };
}

export function detectLanguage(text: string): string {
  const head = text.slice(0, 12000);
  const plHits =
    (head.match(/przychody|sprawozdanie|kwartał|aktywa|pasywa|zysk|strata|złot/gi) || []).length;
  const enHits =
    (head.match(/\brevenue\b|\bassets\b|\bstockholders\b|\bquarter\b|form\s+10/gi) || []).length;
  if (plHits >= 3 && plHits > enHits) return "PL";
  return "EN";
}

function countNumericCells(line: string): number {
  return parseCells(line).filter((c) => c.value !== null || c.isDash).length;
}

/** A row dominated by 2+ four-digit years — the header that fixes column count. */
function yearRowAt(lines: string[], from: number, to: number): { index: number; years: number[] } | null {
  for (let i = from; i <= to && i < lines.length; i++) {
    const tokens = lines[i].trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0 || tokens.length > 8) continue;
    const years = tokens
      .filter((t) => /^\(?(?:19|20)\d{2}\)?$/.test(t))
      .map((t) => parseInt(t.replace(/[()]/g, ""), 10));
    if (years.length >= 2 && years.length >= tokens.length - 1) {
      return { index: i, years };
    }
  }
  return null;
}

const revenuePattern = PATTERNS.find((m) => m.key === "revenue")!;

function lineMatchesMetric(line: string, pattern = revenuePattern): boolean {
  const { label } = splitLeadingLabel(line);
  if (!label) return false;
  if (isExcluded(label, pattern.exclude)) return false;
  return pattern.synonyms.some((syn) => labelMatches(label, syn));
}

const PL_DATE_RE = /(\d{1,2})\.(\d{1,2})\.((?:19|20)\d{2})/g;

function parsePlDates(block: string): { day: number; month: number; year: number }[] {
  const out: { day: number; month: number; year: number }[] = [];
  const re = new RegExp(PL_DATE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    out.push({ day: parseInt(m[1], 10), month: parseInt(m[2], 10), year: parseInt(m[3], 10) });
  }
  return out;
}

function monthsBetween(
  start: { day: number; month: number; year: number },
  end: { day: number; month: number; year: number },
): number {
  return Math.max(1, (end.year - start.year) * 12 + (end.month - start.month));
}

/**
 * Polish PAS headers: "Od 01.04.2026 … do 30.06.2026" repeated per column.
 * Returns ColSpecs when ≥2 end dates sit above a revenue-like row.
 */
function findPolishIncomeHeader(lines: string[]): ColSpec[] | null {
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/\bOd\s+\d{1,2}\.\d{1,2}\.\d{4}/i.test(lines[i]) && !/\bdo\s+\d{1,2}\.\d{1,2}\.\d{4}/i.test(lines[i])) {
      continue;
    }
    const block = lines.slice(i, Math.min(lines.length, i + 4)).join(" ");
    if (!/\bOd\b/i.test(block) || !/\bdo\b/i.test(block)) continue;

    const odDates = [...block.matchAll(/Od\s+(\d{1,2})\.(\d{1,2})\.((?:19|20)\d{2})/gi)].map((m) => ({
      day: parseInt(m[1], 10),
      month: parseInt(m[2], 10),
      year: parseInt(m[3], 10),
    }));
    const doDates = [...block.matchAll(/\bdo\s+(\d{1,2})\.(\d{1,2})\.((?:19|20)\d{2})/gi)].map((m) => ({
      day: parseInt(m[1], 10),
      month: parseInt(m[2], 10),
      year: parseInt(m[3], 10),
    }));
    if (doDates.length < 2) continue;
    if (!revenueWithin(lines, i + 1, 20)) continue;

    const n = doDates.length;
    const cols: ColSpec[] = [];
    const maxYear = Math.max(...doDates.map((d) => d.year));
    for (let c = 0; c < n; c++) {
      const end = doDates[c];
      const start = odDates[c] ?? odDates[0];
      const months = start ? monthsBetween(start, end) : 3;
      cols.push({
        months: months <= 3 ? 3 : months <= 6 ? 6 : months <= 9 ? 9 : 12,
        month: end.month,
        day: end.day,
        year: end.year,
        current: end.year === maxYear && (c === 0 || end.month >= doDates[0].month),
      });
    }
    // Mark current: prefer the first column when it shares the latest year (Q then YTD).
    if (cols.length) {
      const latest = cols.reduce((a, b) =>
        b.year > a.year || (b.year === a.year && b.month > a.month) ? b : a,
      );
      for (const c of cols) c.current = c === cols[0] || (c.year === latest.year && c.months === cols[0].months && c === cols[0]);
      cols[0].current = true;
      for (let k = 1; k < cols.length; k++) cols[k].current = false;
      return cols;
    }
  }
  return null;
}

function fiscalYearOf(month: number, year: number, fyeMonth: number): number {
  return month <= fyeMonth ? year : year + 1;
}

function quarterOf(month: number, fyeMonth: number): number {
  const monthsIntoFY = ((month - (fyeMonth + 1) + 12) % 12) + 1;
  return Math.ceil(monthsIntoFY / 3);
}

function fmtDate(month: number, day: number, year: number): string {
  return `${MONTH_NAMES[month]} ${day}, ${year}`;
}

function buildDurationPeriod(
  idx: number,
  months: number,
  month: number,
  day: number,
  year: number,
  current: boolean,
  fyeMonth: number | null,
): Period {
  const endDate = fmtDate(month, day, year);
  if (fyeMonth) {
    const fy = fiscalYearOf(month, year, fyeMonth);
    const yy = String(fy % 100).padStart(2, "0");
    const fiscal = `FY${yy}`;
    if (months === 3) {
      const q = quarterOf(month, fyeMonth);
      return {
        key: `inc${idx}`,
        short: `Q${q} ${fiscal}`,
        label: `Q${q} ${fiscal} · 3M ended ${endDate}`,
        kind: "duration",
        months,
        endDate,
        fiscal,
        current,
      };
    }
    return {
      key: `inc${idx}`,
      short: `${months}M ${fiscal}`,
      label: `${months}M ${fiscal} · ended ${endDate}`,
      kind: "duration",
      months,
      endDate,
      fiscal,
      current,
    };
  }
  return {
    key: `inc${idx}`,
    short: `${months}M · ${MONTH_NAMES[month]} ${year}`,
    label: `${months}M ended ${endDate}`,
    kind: "duration",
    months,
    endDate,
    current,
  };
}

function buildPointPeriod(
  idx: number,
  month: number,
  day: number,
  year: number,
  fyeMonth: number | null,
  current: boolean,
): Period {
  const endDate = fmtDate(month, day, year);
  let short = `as of ${MONTH_NAMES[month]} ${year}`;
  let fiscal: string | undefined;
  if (fyeMonth) {
    const fy = fiscalYearOf(month, year, fyeMonth);
    fiscal = `FY${String(fy % 100).padStart(2, "0")}`;
    short = month === fyeMonth ? `${fiscal} close` : `${fiscal} · ${MONTH_NAMES[month]} ${day}`;
  }
  return {
    key: `bal${idx}`,
    short,
    label: `As of ${endDate}`,
    kind: "point",
    endDate,
    fiscal,
    current,
  };
}

export interface DetectedPeriods {
  income: Period[];
  balance: Period[];
  fiscalYearEndMonth: number | null;
}

interface ColSpec {
  months: number;
  month: number;
  day: number;
  year: number;
  current: boolean;
}

/** A row carrying ≥2 full "Month dd, yyyy" dates (column headers like NVIDIA's). */
function fullDateRowAt(
  lines: string[],
  from: number,
  to: number,
): { index: number; dates: { month: number; day: number; year: number }[] } | null {
  for (let i = from; i <= to && i < lines.length; i++) {
    const dates = [...lines[i].matchAll(new RegExp(FULLDATE_RE, "gi"))].map((m) => ({
      month: MONTHS[m[1].toLowerCase().slice(0, 3)],
      day: parseInt(m[2], 10),
      year: parseInt(m[3], 10),
    }));
    if (dates.length >= 2) return { index: i, dates };
  }
  return null;
}

function durationsIn(text: string): number[] {
  const durations: number[] = [];
  const re = /\b(three|six|nine|twelve)\s+months\s+ended/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) durations.push(DURATION_WORD[m[1].toLowerCase()]);
  if (durations.length === 0) durations.push(3);
  return durations;
}

function revenueWithin(lines: string[], from: number, span: number): boolean {
  for (let j = from; j <= from + span && j < lines.length; j++) {
    if (lineMatchesMetric(lines[j]) && countNumericCells(lines[j]) >= 1) return true;
  }
  return false;
}

/**
 * Find the genuine income-statement period header (not a TOC row) and return the
 * column specs. Handles two real layouts: a bare-year row under the duration line
 * (Microsoft / Cipher: "2026 2025 2026 2025") and full-date column headers
 * (NVIDIA: "Apr 26, 2026  Apr 27, 2025").
 */
function findIncomeHeader(lines: string[]): ColSpec[] | null {
  const polish = findPolishIncomeHeader(lines);
  if (polish) return polish;

  for (let i = 0; i < lines.length; i++) {
    if (!DURATION_RE.test(lines[i])) continue;

    // Path 1 — bare-year row.
    const yr = yearRowAt(lines, i + 1, i + 4);
    if (yr && revenueWithin(lines, yr.index + 1, 14)) {
      const durations = durationsIn(lines.slice(i, yr.index).join(" "));
      const md = lines.slice(i, yr.index).join(" ").match(MONTHDAY_RE);
      const month = md ? MONTHS[md[1].toLowerCase().slice(0, 3)] : 1;
      const day = md ? parseInt(md[2], 10) : 1;
      const years = yr.years;
      const yearsPerDur = Math.max(1, Math.round(years.length / durations.length));
      const cols: ColSpec[] = [];
      let c = 0;
      for (const dur of durations) {
        const group = years.slice(c, c + yearsPerDur);
        const maxYear = Math.max(...group);
        for (const year of group) cols.push({ months: dur, month, day, year, current: year === maxYear });
        c += yearsPerDur;
      }
      if (cols.length) return cols;
    }

    // Path 2 — full-date column headers.
    const fd = fullDateRowAt(lines, i, i + 4);
    if (fd && revenueWithin(lines, fd.index + 1, 14)) {
      const durations = durationsIn(lines.slice(i, fd.index + 1).join(" "));
      const perDur = Math.max(1, Math.round(fd.dates.length / durations.length));
      const cols: ColSpec[] = [];
      let c = 0;
      for (const dur of durations) {
        const group = fd.dates.slice(c, c + perDur);
        const maxYear = Math.max(...group.map((d) => d.year));
        for (const d of group) cols.push({ months: dur, month: d.month, day: d.day, year: d.year, current: d.year === maxYear });
        c += perDur;
      }
      if (cols.length) return cols;
    }
  }
  return null;
}

/** Find the two balance-sheet dates and, from the prior one, the fiscal year end. */
function findBalanceDates(lines: string[]): {
  dates: { month: number; day: number; year: number }[];
} {
  let anchor = -1;
  for (let i = 0; i < lines.length; i++) {
    const { label } = splitLeadingLabel(lines[i]);
    if (
      (labelMatches(label, { text: "Total assets", match: "exact", tier: "primary" }) ||
        labelMatches(label, { text: "Aktywa razem", match: "exact", tier: "primary" }) ||
        labelMatches(label, { text: "Suma aktywów", match: "exact", tier: "primary" })) &&
      countNumericCells(lines[i]) >= 1
    ) {
      anchor = i;
      break;
    }
  }
  if (anchor < 0) return { dates: [] };

  const from = Math.max(0, anchor - 30);
  const block = lines.slice(from, anchor);
  const dates: { month: number; day: number; year: number }[] = [];

  // Polish "Stan na 30.06.2026"
  for (const line of block) {
    for (const d of parsePlDates(line)) {
      dates.push(d);
    }
  }

  // Prefer full "Month dd, yyyy" dates.
  for (const line of block) {
    const re = new RegExp(FULLDATE_RE, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      dates.push({
        month: MONTHS[m[1].toLowerCase().slice(0, 3)],
        day: parseInt(m[2], 10),
        year: parseInt(m[3], 10),
      });
    }
  }
  // Fallback: a month/day line plus a year row beneath it.
  if (dates.length < 2) {
    for (let i = from; i < anchor; i++) {
      if (MONTHDAY_RE.test(lines[i])) {
        const yr = yearRowAt(lines, i, Math.min(anchor, i + 3));
        const mds = [...lines[i].matchAll(new RegExp(MONTHDAY_RE, "gi"))];
        if (yr && mds.length >= 1) {
          yr.years.forEach((year, k) => {
            const md = mds[Math.min(k, mds.length - 1)];
            dates.push({
              month: MONTHS[md[1].toLowerCase().slice(0, 3)],
              day: parseInt(md[2], 10),
              year,
            });
          });
          break;
        }
      }
    }
  }
  // Dedupe consecutive duplicates, keep order (current first).
  const uniq: typeof dates = [];
  for (const d of dates) {
    if (!uniq.some((u) => u.month === d.month && u.day === d.day && u.year === d.year)) {
      uniq.push(d);
    }
  }
  // Prefer the pair nearest the assets line (last two unique if many TOC hits).
  return { dates: uniq.length > 2 ? uniq.slice(-2) : uniq.slice(0, 2) };
}

export function detectPeriods(lines: string[]): DetectedPeriods {
  const balance = findBalanceDates(lines);
  // The comparative balance-sheet column is usually the prior fiscal year end
  // (different month). Same-month YoY interim pairs (common on NewConnect) do
  // NOT reveal FYE — fall back to calendar December.
  let fyeMonth: number | null = null;
  if (balance.dates.length >= 2) {
    fyeMonth =
      balance.dates[0].month !== balance.dates[1].month
        ? balance.dates[1].month
        : 12;
  } else if (balance.dates.length === 1) {
    fyeMonth = balance.dates[0].month;
  }

  // ---- Income / cash-flow duration columns ----
  const cols = findIncomeHeader(lines);
  const income: Period[] = (cols ?? []).map((c, i) =>
    buildDurationPeriod(i, c.months, c.month, c.day, c.year, c.current, fyeMonth),
  );

  // ---- Balance-sheet point columns ----
  const balancePeriods: Period[] = balance.dates.map((d, i) =>
    buildPointPeriod(i, d.month, d.day, d.year, fyeMonth, i === 0),
  );

  return { income, balance: balancePeriods, fiscalYearEndMonth: fyeMonth };
}
