// lib/ixbrl/to-result.ts — inline XBRL facts → the same ParseResult the PDF parser produces (PS3a). No heuristics: values come
// from facts, columns from their contexts, the unit scale from the facts' own `scale`. Derived figures and the net-cash tile
// reuse the PDF pipeline's functions so the UI, export and tests do not care where the numbers came from.
import { HEADLINE_METRICS, PATTERNS } from "../patterns";
import { computeCapitalReturns, computeDerived, computeNetCash, buildPerShareHeadline } from "../derived";
import type {
  Detection, ExtractedRow, FactRef, Metric, MetricKey, ParseResult, Period, PipelineStage, ValidationCheck,
} from "../types";
import { readIxbrl, type IxDocument, type IxFact } from "./read";
import { ixSegments } from "./segments";
import {
  BALANCE_KEYS, CASHFLOW_KEYS, CONCEPTS, EPS_KEYS, INTEREST_INCOME, MEZZANINE, NET_INCOME_CONSOLIDATED,
  NONOPERATING_TOTAL, PER_SHARE_KEYS, REVENUE, SHARE_KEYS,
} from "./concepts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PER_SHARE_LABEL: Record<string, string> = {
  epsBasic: "EPS (basic)", epsDiluted: "EPS (diluted)", dps: "Dividend per share",
  weightedSharesDiluted: "Weighted avg shares (diluted)", weightedSharesBasic: "Weighted avg shares (basic)",
};

const ymd = (iso: string) => iso.split("-").map(Number) as [number, number, number];
const niceDate = (iso: string) => {
  const [y, m, d] = ymd(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
const dayMs = 86_400_000;

function fiscalYear(endIso: string, fyEndMonth: number): number {
  const [y, m] = ymd(endIso);
  return y + (m > fyEndMonth ? 1 : 0);
}

function durationPeriod(key: string, sig: string, fyEndMonth: number, current: boolean): Period {
  const [start, end] = sig.split("|");
  const days = (Date.parse(end) - Date.parse(start)) / dayMs + 1;
  const months = Math.max(1, Math.round(days / 30.4375));
  const fy = `FY${String(fiscalYear(end, fyEndMonth)).slice(-2)}`;
  const [, endM] = ymd(end);
  const q = Math.ceil((((endM - fyEndMonth + 12) % 12) || 12) / 3);
  const short = months >= 12 ? fy : months === 3 ? `Q${q} ${fy}` : `${months}M ${fy}`;
  return {
    key, short, label: `${short} · ${months}M ended ${niceDate(end)}`, kind: "duration", months,
    endDate: niceDate(end), fiscal: fy, current,
  };
}

function pointPeriod(key: string, sig: string, fyEndMonth: number, current: boolean): Period {
  const [y, m, d] = ymd(sig);
  const fy = `FY${String(fiscalYear(sig, fyEndMonth)).slice(-2)}`;
  const isYearEnd = m === fyEndMonth && d >= 28;
  return {
    key, short: isYearEnd ? `${fy} close` : `${fy} · ${MONTHS[m - 1]} ${d}`, label: `As of ${niceDate(sig)}`,
    kind: "point", endDate: niceDate(sig), fiscal: `FY${String(y).slice(-2)}`, current,
  };
}

/** Distinct signatures of the first row (in document order) whose consolidated facts match `concepts`, in the row's order. */
function anchorSigs(facts: IxFact[], concepts: string[], instant: boolean, min: number): string[] {
  let best: string[] = [];
  const rows = new Map<number, string[]>();
  for (const f of facts) {
    if (f.dims.length || f.rowId === null || !concepts.includes(f.concept)) continue;
    if (f.sig.includes("|") === instant) continue;
    const list = rows.get(f.rowId) ?? [];
    if (!list.includes(f.sig)) list.push(f.sig);
    rows.set(f.rowId, list);
  }
  for (const list of rows.values()) {
    if (list.length >= min) return list.slice(0, 6);
    if (list.length > best.length) best = list;
  }
  return best.slice(0, 6);
}

export function ixbrlToResult(doc: IxDocument, fileBytes: number): ParseResult {
  const free = doc.facts.filter((f) => f.dims.length === 0 && f.family !== "dei");
  const byConcept = new Map<string, IxFact[]>();
  for (const f of free) {
    const list = byConcept.get(f.concept);
    if (list) list.push(f);
    else byConcept.set(f.concept, [f]);
  }
  const find = (concepts: string[], sig: string): IxFact | null => {
    for (const c of concepts) {
      const hit = byConcept.get(c)?.find((f) => f.sig === sig);
      if (hit) return hit;
    }
    return null;
  };

  // ---- Columns, from the statements' own anchor rows ----
  const fyEnd = Number((doc.dei.get("CurrentFiscalYearEndDate") ?? "").match(/--(\d{2})-/)?.[1]) || 12;
  let incomeSigs = anchorSigs(doc.facts, REVENUE, false, 2);
  if (incomeSigs.length < 2) incomeSigs = anchorSigs(doc.facts, NET_INCOME_CONSOLIDATED, false, 2);
  if (incomeSigs.length === 0) incomeSigs = anchorSigs(doc.facts, [...REVENUE, ...NET_INCOME_CONSOLIDATED], false, 1);
  const balanceSigs = anchorSigs(doc.facts, ["Assets"], true, 2);
  // `current` = the newest period of each length (the Q3 and the 9M of a 10-Q), as the hero KPIs and prior-year deltas expect.
  const income = incomeSigs.map((s, i) => durationPeriod(`inc${i}`, s, fyEnd, false));
  for (const p of income) {
    const newest = Math.max(...income.filter((x) => x.months === p.months).map((x) => Date.parse(x.endDate ?? "")));
    p.current = Date.parse(p.endDate ?? "") === newest;
  }
  const balance = balanceSigs.map((s, i) => pointPeriod(`bal${i}`, s, fyEnd, i === 0));

  // ---- Unit: the scale of the first revenue (or net income) fact ----
  const anchorFact = find(REVENUE, incomeSigs[0] ?? "") ?? find(NET_INCOME_CONSOLIDATED, incomeSigs[0] ?? "");
  const scale = anchorFact ? Math.max(0, anchorFact.scale) : 0;
  const unitScale = 10 ** scale;
  const unitLabel = unitScale === 1e9 ? "in billions" : unitScale === 1e6 ? "in millions" : unitScale === 1e3 ? "in thousands" : null;
  const currency = anchorFact?.unit && /^[A-Z]{3}$/.test(anchorFact.unit) ? anchorFact.unit : null;

  const monetary = (f: IxFact) => !!f.unit && /^[A-Z]{3}$/.test(f.unit);
  const show = (f: IxFact) => (monetary(f) || f.unit === "shares" ? f.value / unitScale : f.value);
  const sigKey = new Map<string, string>();
  income.forEach((p, i) => sigKey.set(incomeSigs[i], p.key));
  balance.forEach((p, i) => sigKey.set(balanceSigs[i], p.key));

  // ---- Raw-text extract and the all-rows inventory: one line per table row ----
  const rowFacts = new Map<number, IxFact[]>();
  for (const f of doc.facts) {
    if (f.rowId === null || !f.rowLabel || f.dims.length) continue;
    const list = rowFacts.get(f.rowId);
    if (list) list.push(f);
    else rowFacts.set(f.rowId, [f]);
  }
  const lines: string[] = [];
  const rows: ExtractedRow[] = [];
  const lineOfRow = new Map<number, number>();
  for (const [rowId, list] of rowFacts) {
    const values = list.map((f) => show(f));
    const concepts = [...new Set(list.map((f) => f.concept))].slice(0, 3).join(", ");
    const keys = list.map((f) => sigKey.get(f.sig));
    const inc = keys.every((k) => k?.startsWith("inc"));
    const bal = keys.every((k) => k?.startsWith("bal"));
    const line = `${list[0].rowLabel} | ${concepts} | ${values.join(" · ")}`;
    lineOfRow.set(rowId, lines.length);
    rows.push({
      lineIndex: lines.length, label: list[0].rowLabel, values,
      periodKeys: inc || bal ? (keys as string[]) : undefined,
      periodKind: inc ? "income" : bal ? "balance" : "unknown", rawLine: line,
    });
    lines.push(line);
  }
  const rawText = lines.join("\n");

  // ---- Metrics ----
  const metrics: Metric[] = [];
  const byKey = new Map<MetricKey, Metric>();
  const factRefs: Partial<Record<MetricKey, FactRef[]>> = {};
  const meta: { key: MetricKey; label: string; statement: Metric["statement"] }[] = [
    ...PATTERNS.filter((p) => p.key !== "totalDebt" && p.key !== "totalOpEx").map((p) => ({ key: p.key, label: p.label, statement: p.statement })),
    { key: "totalDebt", label: "Total debt", statement: "balance" },
    { key: "totalOpEx", label: "Total operating expenses", statement: "income" },
    ...PER_SHARE_KEYS.map((key) => ({ key, label: PER_SHARE_LABEL[key], statement: "perShare" as const })),
  ];
  for (const { key, label, statement } of meta) {
    const periods = statement === "balance" ? balance : income;
    const sigs = statement === "balance" ? balanceSigs : incomeSigs;
    let metric: Metric | null = null;
    if (key === "totalDebt") {
      const cur = byKey.get("currentDebt");
      const lt = byKey.get("longTermDebt");
      const values = balance.map((p) => {
        const c = cur?.values.find((v) => v.periodKey === p.key)?.value ?? null;
        const l = lt?.values.find((v) => v.periodKey === p.key)?.value ?? null;
        return { periodKey: p.key, value: c === null && l === null ? null : Math.abs(c ?? 0) + Math.abs(l ?? 0) };
      });
      if (values.some((v) => v.value !== null)) {
        metric = { key, label, statement, values, confidence: "MEDIUM", note: "aggregated: current portion + long-term debt" };
      }
    } else {
      // Income and balance rows: the concept that covers the most columns wins (ties: the table's priority order), so a
      // concept that appears for one year only (a note) never beats the statement row that has every year. Cash flow
      // and per-share rows follow the priority order: a 10-Q cash flow has only the year-to-date columns, and a notes
      // concept with more columns (SBC by quarter) must not replace it.
      const byPriority = CASHFLOW_KEYS.includes(key) || PER_SHARE_KEYS.includes(key);
      let best: { hits: (IxFact | null)[]; count: number } | null = null;
      for (const concept of CONCEPTS[key] ?? []) {
        const hits = sigs.map((s) => byConcept.get(concept)?.find((f) => f.sig === s) ?? null);
        const count = hits.filter(Boolean).length;
        if (byPriority ? count > 0 && !best : count > (best?.count ?? 0)) best = { hits, count };
      }
      const first = best?.hits.find((h) => h);
      if (best && first) {
        metric = {
          key, label, statement,
          values: periods.map((p, i) => ({ periodKey: p.key, value: best.hits[i] ? show(best.hits[i]!) : null })),
          confidence: "HIGH", matchedLabel: first.rowLabel || first.concept,
          sourceLine: first.rowId !== null ? lineOfRow.get(first.rowId) : undefined,
          note: `${first.family}:${first.concept}`,
        };
        factRefs[key] = best.hits.flatMap((f, i) => f ? [{
          periodKey: periods[i].key, factId: f.factId, contextId: f.contextId, qname: f.qname, period: f.sig,
          unit: f.unit, value: f.value, scale: f.scale, decimals: f.decimals,
        }] : []);
      }
    }
    if (!metric) {
      metric = {
        key, label, statement, values: periods.map((p) => ({ periodKey: p.key, value: null })),
        confidence: "LOW", flags: ["not found"],
      };
    }
    metrics.push(metric);
    byKey.set(key, metric);
  }

  const detection: Detection = {
    formType: doc.dei.get("DocumentType") ? `SEC ${doc.dei.get("DocumentType")}` : null,
    issuer: doc.dei.get("EntityRegistrantName") ?? null,
    structureLabel: [doc.dei.get("DocumentType") ? `SEC ${doc.dei.get("DocumentType")}` : null, doc.dei.get("EntityRegistrantName")]
      .filter(Boolean).join(" · ") || "Unknown filing",
    language: "EN", currency, unitLabel, unitScale, fiscalYearEndMonth: fyEnd,
    periods: { income, balance },
  };

  const derived = computeDerived(byKey, income, balance);
  const netCash = computeNetCash(byKey, balance);
  const capitalReturns = computeCapitalReturns(byKey, income, derived);
  const perShare = buildPerShareHeadline(byKey, income);
  const curRev = byKey.get("revenue")?.values.find((v) => v.periodKey === (income.find((p) => p.current && p.months === 3) ?? income[0])?.key)?.value ?? null;
  const curOp = byKey.get("operatingIncome")?.values.find((v) => v.periodKey === (income.find((p) => p.current && p.months === 3) ?? income[0])?.key)?.value ?? null;
  const { segments, products } = ixSegments(doc.facts, income, incomeSigs, show, { revenue: curRev, operatingIncome: curOp });
  const validation = validateFacts(find, incomeSigs, balanceSigs, byKey, show, income, balance);
  if (segments) {
    validation.checks.push({
      name: "Sum of segments = Total revenue", passed: segments.reconciles,
      detail: `${segments.segments.map((s) => (s.revenue ?? 0).toLocaleString("en-US")).join(" + ")} vs ${(curRev ?? 0).toLocaleString("en-US")}`,
    });
    validation.total = validation.checks.length;
    validation.passed = validation.checks.filter((c) => c.passed).length;
  }
  const matchedCount = HEADLINE_METRICS.filter((k) => byKey.get(k)?.values.some((v) => v.value !== null)).length;

  const factCount = doc.facts.length;
  const pipeline: PipelineStage[] = [
    { id: "file", label: "File received & decoded", status: "ok", detail: `${(fileBytes / 1024 / 1024).toFixed(1)} MB HTML` },
    { id: "facts", label: "XBRL facts read", status: factCount >= 50 ? "ok" : "warn", detail: `${factCount.toLocaleString()} facts · ${doc.contexts.size.toLocaleString()} contexts` },
    { id: "context", label: "Context detected", status: detection.formType ? "ok" : "warn", detail: [detection.formType, detection.currency, detection.unitLabel].filter(Boolean).join(" · ") },
    { id: "periods", label: "Period columns labelled", status: income.length && balance.length ? "ok" : "warn", detail: `${income.length} duration · ${balance.length} point-in-time` },
    { id: "metrics", label: "Metrics matched", status: matchedCount >= 9 ? "ok" : matchedCount >= 5 ? "warn" : "fail", detail: `${matchedCount}/${HEADLINE_METRICS.length} headline metrics` },
    { id: "segments", label: "Segments parsed", status: segments && !segments.reconciles ? "warn" : "ok", detail: segments ? `${segments.segments.length} segments${products ? ` · ${products.items.length} product lines` : ""}` : "no segment dimensions (single segment)" },
    { id: "allRows", label: "All numeric rows", status: rows.length >= 20 ? "ok" : "warn", detail: `${rows.length} labeled rows` },
    { id: "validation", label: "Reconciliations", status: validation.passed === validation.total ? "ok" : validation.passed > 0 ? "warn" : "fail", detail: `${validation.passed}/${validation.total} passed` },
    ...(doc.warnings.length ? [{ id: "warnings", label: "Reader warnings", status: "warn" as const, detail: doc.warnings.join("; ") }] : []),
  ];

  return {
    detection, metrics, extractedRows: rows, segments, productRevenue: products, derived, netCash, capitalReturns,
    perShare, oneOff: { detected: false }, validation, pipeline, matchedCount, totalMetrics: HEADLINE_METRICS.length,
    rawText, charCount: rawText.length, pages: 1,
    ...(Object.keys(factRefs).length ? { factRefs } : {}),
  };
}

/** Reconciliations on the facts themselves: operating + non-operating = pre-tax, pre-tax − tax = net, assets = liabilities + mezzanine + equity. */
function validateFacts(
  find: (concepts: string[], sig: string) => IxFact | null,
  incomeSigs: string[],
  balanceSigs: string[],
  byKey: Map<MetricKey, Metric>,
  show: (f: IxFact) => number,
  income: Period[],
  balance: Period[],
) {
  const checks: ValidationCheck[] = [];
  const fmt = (n: number) => n.toLocaleString("en-US");
  const tol = (base: number) => Math.max(2, Math.abs(base) * 0.005);
  const val = (c: string[], sig: string) => {
    const f = find(c, sig);
    return f ? show(f) : null;
  };
  const get = (key: MetricKey, pk: string) => byKey.get(key)?.values.find((v) => v.periodKey === pk)?.value ?? null;

  incomeSigs.slice(0, 1).forEach((sig, i) => {
    const pk = income[i].key;
    const op = get("operatingIncome", pk);
    const pre = get("incomeBeforeTax", pk);
    if (op !== null && pre !== null) {
      let nonop = val(NONOPERATING_TOTAL, sig);
      if (nonop === null) {
        const interest = get("interestExpense", pk);
        const income2 = val(INTEREST_INCOME, sig);
        const other = get("otherIncome", pk);
        if (interest !== null && income2 !== null && other !== null) nonop = -interest + income2 + other;
      }
      if (nonop !== null) {
        checks.push({
          name: "Operating income + Other = Pre-tax income", passed: Math.abs(op + nonop - pre) <= tol(pre),
          detail: `${fmt(op)} + ${fmt(nonop)} = ${fmt(op + nonop)} vs ${fmt(pre)}`,
        });
      }
    }
    const tax = get("incomeTax", pk);
    const net = val(NET_INCOME_CONSOLIDATED, sig);
    if (pre !== null && tax !== null && net !== null) {
      checks.push({
        name: "Pre-tax − Tax = Net income", passed: Math.abs(pre - tax - net) <= tol(net),
        detail: `${fmt(pre)} − ${fmt(tax)} = ${fmt(pre - tax)} vs ${fmt(net)}`,
      });
    }
  });
  balanceSigs.forEach((sig, i) => {
    const pk = balance[i].key;
    const a = get("totalAssets", pk);
    const l = get("totalLiabilities", pk);
    const e = get("totalEquity", pk);
    if (a === null || l === null || e === null) return;
    const mezz = val(MEZZANINE, sig) ?? 0;
    checks.push({
      name: `Assets = Liabilities + Equity (${balance[i].short})`, passed: Math.abs(a - (l + mezz + e)) <= tol(a),
      detail: `${fmt(a)} vs ${fmt(l)} + ${fmt(mezz)} mezzanine + ${fmt(e)} = ${fmt(l + mezz + e)}`,
    });
  });
  const passed = checks.filter((c) => c.passed).length;
  return { checks, passed, total: checks.length };
}

/** Full pipeline: HTML text → reader → ParseResult. Throws `IxbrlError` for non-iXBRL / corrupt files. */
export function parseIxbrl(html: string, fileBytes = html.length): ParseResult {
  return ixbrlToResult(readIxbrl(html), fileBytes);
}

export { EPS_KEYS, SHARE_KEYS, BALANCE_KEYS, CASHFLOW_KEYS };
