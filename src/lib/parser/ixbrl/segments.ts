// lib/ixbrl/segments.ts — segments and products straight from XBRL dimensions (PS3b). A segment is a revenue fact whose only
// dimension is the business-segment axis; its operating income is the same axis plus `ConsolidationItemsAxis=OperatingSegmentsMember`.
// A product/service line is a revenue fact whose only dimension is the product-or-service axis. Names come from the row's own
// label in the filing ("Space", "Connectivity"), never from the member id.
import type { Period, ProductRevenueResult, SegmentsResult } from "../types";
import { REVENUE } from "./concepts";
import type { IxFact } from "./read";

const SEGMENT_AXIS = /(^|:)StatementBusinessSegmentsAxis=/;
const PRODUCT_AXIS = /(^|:)ProductOrServiceAxis=/;
const OPERATING_SEGMENTS = /ConsolidationItemsAxis=[\w-]+:OperatingSegmentsMember$/;

function nameOf(f: IxFact): string {
  const member = f.dims[0].split("=")[1]?.split(":").pop()?.replace(/Member$/, "") ?? "";
  return f.rowLabel.replace(/\(\d+\)$/, "").trim() || member;
}

export function ixSegments(
  facts: IxFact[],
  income: Period[],
  incomeSigs: string[],
  show: (f: IxFact) => number,
  totals: { revenue: number | null; operatingIncome: number | null },
): { segments: SegmentsResult | null; products: ProductRevenueResult | null } {
  const cur = income.find((p) => p.current && p.months === 3) ?? income.find((p) => p.current) ?? income[0];
  if (!cur) return { segments: null, products: null };
  const sigOf = (p: Period | undefined) => (p ? incomeSigs[income.indexOf(p)] : undefined);
  const prior = income.find((p) => !p.current && p.months === cur.months);
  const at = (sig: string | undefined, pick: (f: IxFact) => boolean) => (sig ? facts.filter((f) => f.sig === sig && f.dims.length && pick(f)) : []);

  let revConcept = "";
  for (const c of REVENUE) {
    if (facts.some((f) => f.concept === c && f.sig === sigOf(cur) && f.dims.length === 1 && SEGMENT_AXIS.test(f.dims[0]))) {
      revConcept = c;
      break;
    }
  }
  const opConcept = "OperatingIncomeLoss";

  let segments: SegmentsResult | null = null;
  if (revConcept) {
    const rev = at(sigOf(cur), (f) => f.concept === revConcept && f.dims.length === 1 && SEGMENT_AXIS.test(f.dims[0]));
    if (rev.length >= 2) {
      const prev = at(sigOf(prior), (f) => f.concept === revConcept && f.dims.length === 1 && SEGMENT_AXIS.test(f.dims[0]));
      const ops = at(sigOf(cur), (f) => f.concept === opConcept && f.dims.length === 2 && SEGMENT_AXIS.test(f.dims[0]) && OPERATING_SEGMENTS.test(f.dims[1]));
      const list = rev.map((f) => {
        const revenue = show(f);
        const revenuePrior = prev.find((x) => x.dims[0] === f.dims[0]);
        const op = ops.find((x) => x.dims[0] === f.dims[0]);
        const priorV = revenuePrior ? show(revenuePrior) : null;
        return {
          name: nameOf(f),
          revenue,
          revenuePrior: priorV,
          revenueYoY: priorV !== null && priorV > 0 ? ((revenue - priorV) / priorV) * 100 : null,
          operatingIncome: op ? show(op) : null,
          operatingMargin: op && revenue ? (show(op) / revenue) * 100 : null,
        };
      });
      const sumRev = list.reduce((a, s) => a + (s.revenue ?? 0), 0);
      const sumOp = list.every((s) => s.operatingIncome !== null) ? list.reduce((a, s) => a + (s.operatingIncome ?? 0), 0) : null;
      const tol = (x: number) => Math.max(2, Math.abs(x) * 0.005);
      segments = {
        periodKey: cur.key,
        periodLabel: cur.short,
        segments: list,
        totalRevenue: totals.revenue,
        totalOperatingIncome: totals.operatingIncome,
        reconciles:
          totals.revenue !== null && Math.abs(sumRev - totals.revenue) <= tol(totals.revenue) &&
          (sumOp === null || totals.operatingIncome === null || Math.abs(sumOp - totals.operatingIncome) <= tol(totals.operatingIncome)),
      };
    }
  }

  let products: ProductRevenueResult | null = null;
  const pr = at(sigOf(cur), (f) => REVENUE.includes(f.concept) && f.dims.length === 1 && PRODUCT_AXIS.test(f.dims[0]));
  const concept = REVENUE.find((c) => pr.some((f) => f.concept === c));
  const lines = pr.filter((f) => f.concept === concept);
  if (lines.length >= 2) {
    const total = lines.reduce((a, f) => a + show(f), 0);
    products = {
      periodKey: cur.key,
      periodLabel: cur.short,
      items: lines.map((f) => ({ name: nameOf(f), value: show(f), share: totals.revenue ? (show(f) / totals.revenue) * 100 : null })),
      total,
      reconciles: totals.revenue !== null && Math.abs(total - totals.revenue) <= Math.max(2, Math.abs(totals.revenue) * 0.005),
    };
  }
  return { segments, products };
}
