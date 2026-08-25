// lib/derived.ts
// Derived metrics: margins, free cash flow, net debt / net cash, capital returns,
// per-share headline, and one-off (non-GAAP) detection. Every figure is computed
// generically from the canonical metrics — no issuer-specific branches.

import type {
  AdvancedRatio,
  CapitalReturnsResult,
  DerivedResult,
  FreeCashFlowPoint,
  Metric,
  MetricKey,
  NetCashResult,
  OneOffResult,
  PerShareResult,
  Period,
  RatioPoint,
} from "./types";
import { splitLabelAndCells } from "./numbers";
import { normalizeLabel } from "./patterns";

type MetricMap = Map<MetricKey, Metric>;

function valAt(m: Metric | undefined, periodKey: string): number | null {
  if (!m) return null;
  return m.values.find((v) => v.periodKey === periodKey)?.value ?? null;
}

function pct(numer: number | null, denom: number | null): number | null {
  if (numer === null || denom === null || denom === 0) return null;
  return (numer / denom) * 100;
}

function growth(cur: number | null, prior: number | null): number | null {
  if (cur === null || prior === null || prior === 0) return null;
  return ((cur - prior) / Math.abs(prior)) * 100;
}

export function computeDerived(byKey: MetricMap, income: Period[], balance: Period[]): DerivedResult {
  const revenue = byKey.get("revenue");
  const cost = byKey.get("costOfRevenue");
  const gross = byKey.get("grossProfit");
  const op = byKey.get("operatingIncome");
  const net = byKey.get("netIncome");
  const ocfM = byKey.get("ocf");
  const capexM = byKey.get("capex");

  const ratios: RatioPoint[] = [];
  const fcf: FreeCashFlowPoint[] = [];

  for (const p of income) {
    const rev = valAt(revenue, p.key);
    let grossVal = valAt(gross, p.key);
    const costVal = valAt(cost, p.key);
    if (grossVal === null && rev !== null && costVal !== null) grossVal = rev - costVal;

    ratios.push({
      periodKey: p.key,
      periodLabel: p.short,
      grossMargin: pct(grossVal, rev),
      operatingMargin: pct(valAt(op, p.key), rev),
      netMargin: pct(valAt(net, p.key), rev),
    });

    const ocf = valAt(ocfM, p.key);
    const capex = valAt(capexM, p.key);
    fcf.push({
      periodKey: p.key,
      periodLabel: p.short,
      ocf,
      capex,
      fcf: ocf !== null && capex !== null ? ocf - capex : null,
    });
  }

  // Capex-intensity flag: OCF and FCF diverging over the longest duration.
  let capexIntensityFlag: string | undefined;
  const durations = income.filter((p) => p.months);
  if (durations.length > 0) {
    const longest = Math.max(...durations.map((p) => p.months!));
    const cur = income.find((p) => p.months === longest && p.current);
    const prior = income.find((p) => p.months === longest && !p.current);
    if (cur && prior) {
      const fc = fcf.find((f) => f.periodKey === cur.key);
      const fp = fcf.find((f) => f.periodKey === prior.key);
      if (fc && fp && fc.ocf !== null && fp.ocf !== null && fc.fcf !== null && fp.fcf !== null) {
        const ocfG = growth(fc.ocf, fp.ocf);
        const fcfG = growth(fc.fcf, fp.fcf);
        const capexG = growth(fc.capex, fp.capex);
        if (ocfG !== null && fcfG !== null && ocfG - fcfG > 12) {
          capexIntensityFlag =
            `Capex intensity rising: ${longest}M operating cash flow ${ocfG >= 0 ? "+" : ""}${ocfG.toFixed(0)}% ` +
            `but free cash flow only ${fcfG >= 0 ? "+" : ""}${fcfG.toFixed(0)}%` +
            (capexG !== null ? ` (capex ${capexG >= 0 ? "+" : ""}${capexG.toFixed(0)}%).` : ".");
        }
      }
    }
  }

  const advanced = computeAdvancedRatios(byKey, income, balance, fcf);
  return { ratios, fcf, capexIntensityFlag, advanced };
}

/**
 * Quality / return / leverage / liquidity ratios. Interim flow figures are
 * annualised (×12/months) for stock-vs-flow ratios (ROE, ROA, net debt/EBITDA),
 * and the basis string says so. Every ratio is a formula over canonical metrics.
 */
function computeAdvancedRatios(
  byKey: MetricMap,
  income: Period[],
  balance: Period[],
  fcf: FreeCashFlowPoint[],
): AdvancedRatio[] {
  const durations = income.filter((p) => p.months);
  const longest = durations.length ? Math.max(...durations.map((p) => p.months!)) : null;
  const flowP =
    (longest !== null && income.find((p) => p.months === longest && p.current)) ||
    income.find((p) => p.current) ||
    income[0];
  const balP = balance.find((p) => p.current) ?? balance[0];
  if (!flowP) return [];

  const months = flowP.months ?? 12;
  const ann = months && months < 12 ? 12 / months : 1;
  const annNote = ann !== 1 ? `${flowP.short} · annualised` : flowP.short;

  const f = (k: MetricKey) => valAt(byKey.get(k), flowP.key);
  const b = (k: MetricKey) => (balP ? valAt(byKey.get(k), balP.key) : null);

  const opInc = f("operatingIncome");
  const da = f("depreciationAmortization");
  const ni = f("netIncome");
  const rev = f("revenue");
  const sbc = f("stockComp");
  const preTax = f("incomeBeforeTax");
  const tax = f("incomeTax");
  const interest = f("interestExpense");
  const fcfVal = fcf.find((x) => x.periodKey === flowP.key)?.fcf ?? null;

  const equity = b("totalEquity");
  const assets = b("totalAssets");
  const curA = b("totalCurrentAssets");
  const curL = b("totalCurrentLiabilities");
  const debt = b("totalDebt");
  const cash = b("cash");
  const sti = b("shortTermInvestments");

  const ebitda = opInc !== null && da !== null ? opInc + da : null;
  const out: AdvancedRatio[] = [];

  if (ebitda !== null) out.push({ key: "ebitda", label: "EBITDA", value: ebitda, format: "money", basis: `${flowP.short} · operating income + D&A` });
  if (ni !== null && equity && equity !== 0)
    out.push({ key: "roe", label: "Return on equity", value: ((ni * ann) / equity) * 100, format: "pct", basis: annNote });
  if (ni !== null && assets && assets !== 0)
    out.push({ key: "roa", label: "Return on assets", value: ((ni * ann) / assets) * 100, format: "pct", basis: annNote });
  if (fcfVal !== null && ni !== null && ni > 0)
    out.push({ key: "cashConversion", label: "Cash conversion", value: (fcfVal / ni) * 100, format: "pct", basis: `${flowP.short} · FCF / net income` });
  if (sbc !== null && rev && rev !== 0)
    out.push({ key: "sbcPctRevenue", label: "SBC % of revenue", value: (sbc / rev) * 100, format: "pct", basis: flowP.short });
  if (curA !== null && curL && curL !== 0)
    out.push({ key: "currentRatio", label: "Current ratio", value: curA / curL, format: "x", basis: balP?.short ?? "" });
  if (ebitda !== null && ebitda !== 0 && debt !== null) {
    const netDebt = debt - ((cash ?? 0) + (sti ?? 0));
    if (netDebt < 0) {
      out.push({ key: "netDebtToEbitda", label: "Net debt / EBITDA", value: netDebt / (ebitda * ann), format: "text", text: "net cash", basis: `${annNote} · liquidity > debt` });
    } else {
      out.push({ key: "netDebtToEbitda", label: "Net debt / EBITDA", value: netDebt / (ebitda * ann), format: "x", basis: annNote });
    }
  }
  if (interest && interest !== 0 && opInc !== null)
    out.push({ key: "interestCoverage", label: "Interest coverage", value: opInc / Math.abs(interest), format: "x", basis: `${flowP.short} · EBIT / interest` });
  if (tax !== null && preTax && preTax > 0)
    out.push({ key: "effectiveTaxRate", label: "Effective tax rate", value: (Math.abs(tax) / preTax) * 100, format: "pct", basis: flowP.short });

  return out;
}

export function computeNetCash(byKey: MetricMap, balance: Period[]): NetCashResult | null {
  const primary = balance.find((p) => p.current) ?? balance[0];
  if (!primary) return null;
  const debt = valAt(byKey.get("totalDebt"), primary.key);
  const cash = valAt(byKey.get("cash"), primary.key);
  const stInv = valAt(byKey.get("shortTermInvestments"), primary.key);
  if (debt === null && cash === null) return null;

  const netExcl = cash !== null && debt !== null ? cash - debt : null;
  const liquidity = (cash ?? 0) + (stInv ?? 0);
  const netIncl = debt !== null ? liquidity - debt : null;

  return {
    periodKey: primary.key,
    periodLabel: primary.short,
    totalDebt: debt,
    cash,
    shortTermInvestments: stInv,
    netCashExclStInv: netExcl,
    netCashInclStInv: netIncl,
    isNetCash: (netIncl ?? netExcl ?? -1) > 0,
  };
}

export function computeCapitalReturns(
  byKey: MetricMap,
  income: Period[],
  derived: DerivedResult,
): CapitalReturnsResult | null {
  const durations = income.filter((p) => p.months);
  const longest = durations.length ? Math.max(...durations.map((p) => p.months!)) : null;
  const period =
    (longest !== null && income.find((p) => p.months === longest && p.current)) ||
    income.find((p) => p.current) ||
    income[0];
  if (!period) return null;

  const dividends = valAt(byKey.get("dividendsPaid"), period.key);
  const buybacks = valAt(byKey.get("buybacks"), period.key);
  if (dividends === null && buybacks === null) return null;

  const total = (dividends ?? 0) + (buybacks ?? 0);
  const fcf = derived.fcf.find((f) => f.periodKey === period.key)?.fcf ?? null;

  return {
    periodKey: period.key,
    periodLabel: period.short,
    dividends,
    buybacks,
    total,
    fcf,
    payoutOfFcf: fcf && fcf !== 0 ? (total / fcf) * 100 : null,
  };
}

export function buildPerShareHeadline(byKey: MetricMap, income: Period[]): PerShareResult | null {
  const period =
    income.find((p) => p.months === 3 && p.current) ?? income.find((p) => p.current) ?? income[0];
  if (!period) return null;
  const epsBasic = valAt(byKey.get("epsBasic"), period.key);
  const epsDiluted = valAt(byKey.get("epsDiluted"), period.key);
  const dps = valAt(byKey.get("dps"), period.key);
  const shares = valAt(byKey.get("weightedSharesDiluted"), period.key);
  if (epsBasic === null && epsDiluted === null && dps === null) return null;
  return {
    periodKey: period.key,
    periodLabel: period.short,
    epsBasic,
    epsDiluted,
    dps,
    weightedSharesDiluted: shares,
  };
}

// Ordered most-specific → generic so the most informative driver wins.
const DRIVERS: [RegExp, string][] = [
  [/openai recapitalization/i, "OpenAI Recapitalization dilution gain"],
  [/dilution gain/i, "equity-method dilution gain"],
  [/recapitalization/i, "recapitalization gain"],
  [/gain on (sale|divestiture|disposal)/i, "gain on sale"],
  [/litigation (settlement|charge|gain)/i, "litigation item"],
  [/impairment/i, "impairment charge"],
  [/restructuring/i, "restructuring charge"],
];

function pickDriver(text: string): string | null {
  for (const [re, name] of DRIVERS) if (re.test(text)) return name;
  return null;
}

function findAdjustedRow(lines: string[], re: RegExp): number[] | null {
  for (const line of lines) {
    const { label, cells } = splitLabelAndCells(line);
    if (re.test(normalizeLabel(label))) {
      const vals = cells.filter((c) => !c.isPercent && c.value !== null).map((c) => c.value as number);
      if (vals.length) return vals;
    }
  }
  return null;
}

function signPct(x: number): string {
  return `${x >= 0 ? "+" : ""}${x.toFixed(0)}%`;
}

/**
 * Detect a one-off that distorts headline growth. Uses the filing's own
 * "Adjusted"/non-GAAP disclosure when present (the cleanest signal); otherwise
 * flags when net income grows materially faster than operating income — a
 * below-the-line item, exactly what an equity-method dilution gain produces.
 */
export function detectOneOff(lines: string[], byKey: MetricMap, income: Period[]): OneOffResult {
  const net = byKey.get("netIncome");
  const op = byKey.get("operatingIncome");
  const durations = income.filter((p) => p.months);
  const longest = durations.length ? Math.max(...durations.map((p) => p.months!)) : null;
  const cur = longest !== null ? income.find((p) => p.months === longest && p.current) : undefined;
  const prior = longest !== null ? income.find((p) => p.months === longest && !p.current) : undefined;

  const align = (vals: number[] | null): Map<string, number> | null => {
    if (!vals) return null;
    let v = vals;
    if (income.length > 0 && v.length > income.length) v = v.slice(v.length - income.length);
    const m = new Map<string, number>();
    income.forEach((per, i) => {
      if (i < v.length) m.set(per.key, v[i]);
    });
    return m;
  };

  const adjNet = align(findAdjustedRow(lines, /^adjusted net (income|earnings|loss)/));
  const adjEps = align(
    findAdjustedRow(lines, /^adjusted (diluted )?(earnings per share|net income per share|eps)/),
  );

  const gaapCur = cur ? valAt(net, cur.key) : null;
  const gaapPrior = prior ? valAt(net, prior.key) : null;
  const gaapGrowth = growth(gaapCur, gaapPrior);
  const opGrowth = cur && prior ? growth(valAt(op, cur.key), valAt(op, prior.key)) : null;

  let adjustedGrowth: number | null = null;
  let oneOffEstimate: number | undefined;
  if (adjNet && cur && prior) {
    adjustedGrowth = growth(adjNet.get(cur.key) ?? null, adjNet.get(prior.key) ?? null);
    const ac = adjNet.get(cur.key) ?? null;
    if (ac !== null && gaapCur !== null) oneOffEstimate = Math.round(gaapCur - ac);
  }
  if (adjustedGrowth === null) adjustedGrowth = opGrowth;
  if (oneOffEstimate === undefined && cur && prior && gaapGrowth !== null && opGrowth !== null) {
    const pn = valAt(net, prior.key);
    const cn = valAt(net, cur.key);
    const co = valAt(op, cur.key);
    const po = valAt(op, prior.key);
    if (pn !== null && cn !== null && co !== null && po !== null && po !== 0 && Math.abs(gaapGrowth - opGrowth) > 6) {
      oneOffEstimate = Math.round(cn - pn * (co / po));
    }
  }

  const divergence = gaapGrowth !== null && adjustedGrowth !== null ? gaapGrowth - adjustedGrowth : null;
  // The growth-divergence heuristic is only meaningful for a profitable issuer
  // whose positive growth is flattered by a gain; on a widening loss, percentage
  // growth is not interpretable, so require explicit adjusted disclosure there.
  const profitable = (gaapCur ?? 0) > 0 && (gaapPrior ?? 0) > 0;
  const detected =
    !!adjNet || (profitable && divergence !== null && Math.abs(divergence) > 6 && (cur?.months ?? 0) > 0);
  if (!detected) return { detected: false };

  const driver = pickDriver(lines.join("\n"));
  const adjustedNetIncome = adjNet
    ? income.filter((p) => adjNet.has(p.key)).map((p) => ({ periodLabel: p.short, value: adjNet.get(p.key)! }))
    : undefined;
  const adjustedEpsDiluted = adjEps
    ? income.filter((p) => adjEps.has(p.key)).map((p) => ({ periodLabel: p.short, value: adjEps.get(p.key)! }))
    : undefined;
  const gaapNetIncome =
    cur && gaapCur !== null
      ? income
          .filter((p) => valAt(net, p.key) !== null)
          .map((p) => ({ periodLabel: p.short, value: valAt(net, p.key)! }))
      : undefined;

  const noteParts: string[] = [];
  if (cur && gaapGrowth !== null && adjustedGrowth !== null) {
    noteParts.push(
      `Over ${cur.months}M, GAAP net income ${signPct(gaapGrowth)} vs ${adjNet ? "adjusted" : "operating income"} ${signPct(adjustedGrowth)} — headline growth is flattered by a one-off.`,
    );
  }
  if (oneOffEstimate) {
    noteParts.push(`One-off impact on net income ≈ ${oneOffEstimate.toLocaleString()}${driver ? ` (${driver})` : ""}.`);
  } else if (driver) {
    noteParts.push(`Likely driver: ${driver}.`);
  }

  return {
    detected: true,
    headlinePeriodLabel: cur?.short,
    adjustedNetIncome,
    adjustedEpsDiluted,
    gaapNetIncome,
    gaapGrowth: gaapGrowth ?? undefined,
    adjustedGrowth: adjustedGrowth ?? undefined,
    oneOffEstimate,
    note: noteParts.join(" "),
  };
}
