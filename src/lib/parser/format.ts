// lib/format.ts — display formatting for numbers, percents and deltas.

const DASH = "—";

export function fmtNum(v: number | null | undefined, dp = 0): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  return v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function fmtSigned(v: number | null | undefined, dp = 0): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  const s = fmtNum(Math.abs(v), dp);
  return v < 0 ? `(${s})` : s;
}

export function fmtPct(v: number | null | undefined, dp = 1): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  return `${v.toFixed(dp)}%`;
}

export function pctChange(cur: number | null | undefined, prior: number | null | undefined): number | null {
  if (cur === null || cur === undefined || prior === null || prior === undefined || prior === 0) return null;
  return ((cur - prior) / Math.abs(prior)) * 100;
}

export function fmtDeltaPct(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

/** Compact absolute figure from a reported value and its unit scale, e.g. 38,010 (millions) → "$38.0B". */
export function fmtCompactScaled(
  v: number | null | undefined,
  scale: number,
  currency = "USD",
): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  const abs = Math.abs(v) * scale;
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  let out: string;
  if (abs >= 1e12) out = `${(abs / 1e12).toFixed(2)}T`;
  else if (abs >= 1e9) out = `${(abs / 1e9).toFixed(1)}B`;
  else if (abs >= 1e6) out = `${(abs / 1e6).toFixed(1)}M`;
  else if (abs >= 1e3) out = `${(abs / 1e3).toFixed(1)}K`;
  else out = abs.toFixed(0);
  return `${v < 0 ? "−" : ""}${sym}${out}`;
}

export function fmtBytes(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} KB`;
  return `${n} B`;
}
