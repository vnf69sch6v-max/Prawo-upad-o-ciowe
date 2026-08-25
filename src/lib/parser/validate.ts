// lib/validate.ts
// Reconciliations and confidence calibration. A metric that participates in a
// passing reconciliation is promoted to HIGH confidence — confidence is tied to
// whether the numbers actually close, not just to how cleanly the label matched.

import type {
  Metric,
  MetricKey,
  Period,
  SegmentsResult,
  ValidationCheck,
  ValidationResult,
} from "./types";

type MetricMap = Map<MetricKey, Metric>;

function valAt(m: Metric | undefined, periodKey: string): number | null {
  if (!m) return null;
  return m.values.find((v) => v.periodKey === periodKey)?.value ?? null;
}

function tol(base: number): number {
  return Math.max(2, Math.abs(base) * 0.005);
}

export function validate(
  byKey: MetricMap,
  segments: SegmentsResult | null,
  income: Period[],
  balance: Period[],
): ValidationResult {
  const checks: ValidationCheck[] = [];
  const incCur = income.find((p) => p.current) ?? income[0];
  const balCur = balance.find((p) => p.current) ?? balance[0];

  // 1) Revenue − Cost of revenue = Gross profit
  if (incCur) {
    const rev = valAt(byKey.get("revenue"), incCur.key);
    const cost = valAt(byKey.get("costOfRevenue"), incCur.key);
    const gross = valAt(byKey.get("grossProfit"), incCur.key);
    if (rev !== null && cost !== null && gross !== null) {
      const expected = rev - cost;
      const passed = Math.abs(expected - gross) <= tol(rev);
      checks.push({
        name: "Revenue − Cost = Gross profit",
        passed,
        detail: `${rev.toLocaleString()} − ${cost.toLocaleString()} = ${expected.toLocaleString()} vs reported ${gross.toLocaleString()}`,
      });
    }
  }

  // 1b) Gross profit − Operating expenses = Operating income
  if (incCur) {
    const gross = valAt(byKey.get("grossProfit"), incCur.key);
    const opex = valAt(byKey.get("totalOpEx"), incCur.key);
    const opInc = valAt(byKey.get("operatingIncome"), incCur.key);
    if (gross !== null && opex !== null && opInc !== null) {
      const expected = gross - Math.abs(opex);
      checks.push({
        name: "Gross − Operating expenses = Operating income",
        passed: Math.abs(expected - opInc) <= tol(gross),
        detail: `${gross.toLocaleString()} − ${Math.abs(opex).toLocaleString()} = ${expected.toLocaleString()} vs ${opInc.toLocaleString()}`,
      });
    }
  }

  // 1c) Operating income + Other income (− interest) = Pre-tax income
  if (incCur) {
    const opInc = valAt(byKey.get("operatingIncome"), incCur.key);
    const other = valAt(byKey.get("otherIncome"), incCur.key);
    const preTax = valAt(byKey.get("incomeBeforeTax"), incCur.key);
    if (opInc !== null && other !== null && preTax !== null) {
      const expected = opInc + other;
      checks.push({
        name: "Operating income + Other = Pre-tax income",
        passed: Math.abs(expected - preTax) <= tol(Math.max(Math.abs(preTax), Math.abs(opInc))),
        detail: `${opInc.toLocaleString()} + ${other.toLocaleString()} = ${expected.toLocaleString()} vs ${preTax.toLocaleString()}`,
      });
    }
  }

  // 1d) Pre-tax income − Tax = Net income
  if (incCur) {
    const preTax = valAt(byKey.get("incomeBeforeTax"), incCur.key);
    const taxV = valAt(byKey.get("incomeTax"), incCur.key);
    const ni = valAt(byKey.get("netIncome"), incCur.key);
    if (preTax !== null && taxV !== null && ni !== null) {
      const expected = preTax - Math.abs(taxV);
      checks.push({
        name: "Pre-tax − Tax = Net income",
        passed: Math.abs(expected - ni) <= tol(Math.max(Math.abs(preTax), Math.abs(ni))),
        detail: `${preTax.toLocaleString()} − ${Math.abs(taxV).toLocaleString()} = ${expected.toLocaleString()} vs ${ni.toLocaleString()}`,
      });
    }
  }

  // 2) Total assets = Total liabilities + Total equity
  if (balCur) {
    const assets = valAt(byKey.get("totalAssets"), balCur.key);
    const liab = valAt(byKey.get("totalLiabilities"), balCur.key);
    const equity = valAt(byKey.get("totalEquity"), balCur.key);
    if (assets !== null && liab !== null && equity !== null) {
      const sum = liab + equity;
      const passed = Math.abs(assets - sum) <= tol(assets);
      checks.push({
        name: "Assets = Liabilities + Equity",
        passed,
        detail: `${assets.toLocaleString()} vs ${liab.toLocaleString()} + ${equity.toLocaleString()} = ${sum.toLocaleString()}`,
      });
    }
  }

  // 3) Total debt = Current portion + Long-term debt
  if (balCur) {
    const debt = valAt(byKey.get("totalDebt"), balCur.key);
    const cur = valAt(byKey.get("currentDebt"), balCur.key);
    const lt = valAt(byKey.get("longTermDebt"), balCur.key);
    // Only a genuine cross-check: a directly reported total against BOTH of its
    // components. Aggregating a total from one component and comparing to itself
    // is circular and must not pass.
    if (debt !== null && cur !== null && lt !== null) {
      const sum = (cur ?? 0) + (lt ?? 0);
      const passed = Math.abs(debt - sum) <= tol(debt || sum);
      checks.push({
        name: "Total debt = Current + Long-term",
        passed,
        detail: `${debt.toLocaleString()} vs ${(cur ?? 0).toLocaleString()} + ${(lt ?? 0).toLocaleString()} = ${sum.toLocaleString()}`,
      });
    }
  }

  // 4) Total cash + ST investments = Cash + Short-term investments
  if (balCur) {
    const total = valAt(byKey.get("totalCashAndStInvestments"), balCur.key);
    const cash = valAt(byKey.get("cash"), balCur.key);
    const sti = valAt(byKey.get("shortTermInvestments"), balCur.key);
    if (total !== null && cash !== null && sti !== null) {
      const sum = cash + sti;
      const passed = Math.abs(total - sum) <= tol(total);
      checks.push({
        name: "Total liquidity = Cash + ST investments",
        passed,
        detail: `${total.toLocaleString()} vs ${cash.toLocaleString()} + ${sti.toLocaleString()} = ${sum.toLocaleString()}`,
      });
    }
  }

  // 5 & 6) Segment sums reconcile to consolidated totals
  if (segments && segments.segments.length > 0) {
    const sumRev = segments.segments.reduce((a, s) => a + (s.revenue ?? 0), 0);
    const sumOp = segments.segments.reduce((a, s) => a + (s.operatingIncome ?? 0), 0);
    if (segments.totalRevenue !== null) {
      checks.push({
        name: "Σ Segment revenue = Total revenue",
        passed: Math.abs(sumRev - segments.totalRevenue) <= tol(segments.totalRevenue),
        detail: `${sumRev.toLocaleString()} vs ${segments.totalRevenue.toLocaleString()}`,
      });
    }
    if (segments.totalOperatingIncome !== null) {
      checks.push({
        name: "Σ Segment operating income = Total",
        passed: Math.abs(sumOp - segments.totalOperatingIncome) <= tol(segments.totalOperatingIncome),
        detail: `${sumOp.toLocaleString()} vs ${segments.totalOperatingIncome.toLocaleString()}`,
      });
    }
  }

  const passed = checks.filter((c) => c.passed).length;
  return { checks, passed, total: checks.length };
}

/** Promote metrics that participate in a passing reconciliation to HIGH. */
export function applyConfidenceBumps(byKey: MetricMap, validation: ValidationResult): void {
  const passedNames = new Set(validation.checks.filter((c) => c.passed).map((c) => c.name));
  const bump = (key: MetricKey) => {
    const m = byKey.get(key);
    if (m && m.values.some((v) => v.value !== null)) m.confidence = "HIGH";
  };

  if (passedNames.has("Revenue − Cost = Gross profit")) {
    bump("revenue");
    bump("costOfRevenue");
    bump("grossProfit");
  }
  if (passedNames.has("Gross − Operating expenses = Operating income")) {
    bump("totalOpEx");
    bump("rAndD");
    bump("sellingMarketing");
    bump("generalAdmin");
    bump("operatingIncome");
  }
  if (passedNames.has("Operating income + Other = Pre-tax income")) {
    bump("otherIncome");
    bump("incomeBeforeTax");
  }
  if (passedNames.has("Pre-tax − Tax = Net income")) {
    bump("incomeTax");
    bump("incomeBeforeTax");
    bump("netIncome");
  }
  if (passedNames.has("Assets = Liabilities + Equity")) {
    bump("totalAssets");
    bump("totalLiabilities");
    bump("totalEquity");
  }
  if (passedNames.has("Total debt = Current + Long-term")) {
    bump("totalDebt");
    bump("currentDebt");
    bump("longTermDebt");
  }
  if (passedNames.has("Total liquidity = Cash + ST investments")) {
    bump("cash");
    bump("shortTermInvestments");
    bump("totalCashAndStInvestments");
  }
}
