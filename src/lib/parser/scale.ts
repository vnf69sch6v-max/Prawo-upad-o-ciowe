// lib/scale.ts
// One consistent magnitude system for the whole app. Reported values live in the
// filing's own unit (millions / thousands); this converts them to absolute
// currency and renders at a chosen scale (Auto / Billions / Millions / Thousands
// / as-reported). "Auto" picks the scale that makes the revenue line read with a
// natural magnitude, so a big issuer shows in $B and a small one in $M.

import { pl } from "./copy.pl";

export type ScaleMode = "auto" | "B" | "M" | "K" | "raw";

export interface ActiveScale {
  mode: ScaleMode;
  id: "B" | "M" | "K" | "raw";
  divisor: number; // divides absolute currency
  suffix: string; // "B" / "M" / "K" / ""
  decimals: number;
  unitLabel: string; // e.g. "PLN · miliony"
  reportUnitScale: number;
  currency: string;
}

export function currencySymbol(currency: string | null): string {
  switch (currency) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "PLN": return "zł";
    default: return "";
  }
}

function localeFor(currency: string): string {
  return currency === "PLN" ? "pl-PL" : "en-US";
}

function unitWord(scale: number): string {
  if (scale >= 1e9) return "miliardy";
  if (scale >= 1e6) return "miliony";
  if (scale >= 1e3) return "tysiące";
  return "jednostki";
}

export function autoScaleId(revenueAbs: number | null): "B" | "M" | "K" | "raw" {
  const v = Math.abs(revenueAbs ?? 0);
  if (v >= 1e9) return "B";
  if (v >= 1e6) return "M";
  if (v >= 1e3) return "K";
  return "raw";
}

/** Full-złoty / as-reported filings (unitScale=1) default to 1:1 display. */
export function defaultScaleMode(reportUnitScale: number): ScaleMode {
  return reportUnitScale === 1 ? "raw" : "auto";
}

export function resolveScale(
  mode: ScaleMode,
  reportUnitScale: number,
  currency: string | null,
  revenueAbs: number | null,
): ActiveScale {
  const cur = currency ?? "USD";
  const id = mode === "auto" ? autoScaleId(revenueAbs) : mode;
  if (id === "raw") {
    return {
      mode, id: "raw", divisor: reportUnitScale, suffix: "", decimals: reportUnitScale === 1 ? 2 : 0,
      unitLabel: `${cur} · ${unitWord(reportUnitScale)} (jak w raporcie)`,
      reportUnitScale, currency: cur,
    };
  }
  const table = {
    B: { divisor: 1e9, suffix: " mld", decimals: 1, name: "miliardy" },
    M: { divisor: 1e6, suffix: " mln", decimals: 1, name: "miliony" },
    K: { divisor: 1e3, suffix: " tys.", decimals: 0, name: "tysiące" },
  } as const;
  const x = table[id];
  return {
    mode, id, divisor: x.divisor, suffix: x.suffix, decimals: x.decimals,
    unitLabel: `${cur} · ${x.name}`, reportUnitScale, currency: cur,
  };
}

export interface FormatOpts {
  unit?: boolean; // prefix/suffix currency + scale (for cards/charts)
  decimals?: number;
  parens?: boolean; // negatives in parentheses (default true)
}

/** Format a reported money value at the active scale. */
export function formatScaled(value: number | null | undefined, active: ActiveScale, opts: FormatOpts = {}): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const { unit = false, parens = true } = opts;
  const absDollars = Math.abs(value) * active.reportUnitScale;
  const scaled = absDollars / active.divisor;
  const loc = localeFor(active.currency);

  let body: string;
  if (active.id === "raw") {
    const isInt = Math.abs(scaled - Math.round(scaled)) < 1e-9;
    const dp = opts.decimals ?? (isInt ? 0 : active.decimals);
    body = scaled.toLocaleString(loc, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  } else {
    const dp = opts.decimals ?? (scaled >= 1000 ? 0 : active.decimals);
    body = scaled.toLocaleString(loc, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  let core: string;
  if (!unit) {
    core = body;
  } else if (active.currency === "PLN") {
    // Polish: "2 924 056,55 zł" or "2,9 mln zł"
    const suf = active.id === "raw" ? " zł" : `${active.suffix} zł`;
    core = `${body}${suf}`;
  } else {
    const sym = currencySymbol(active.currency);
    const compact = active.suffix.trimStart()
      .replace(/^mld$/i, "B")
      .replace(/^mln$/i, "M")
      .replace(/^tys\.$/i, "K");
    core = `${sym}${body}${compact}`;
  }

  if (value < 0) return parens ? `(${core})` : `-${core}`;
  return core;
}

export const SCALE_OPTIONS: { mode: ScaleMode; label: string }[] = [
  { mode: "auto", label: pl.scale.auto },
  { mode: "B", label: pl.scale.B },
  { mode: "M", label: pl.scale.M },
  { mode: "K", label: pl.scale.K },
  { mode: "raw", label: pl.scale.raw },
];
