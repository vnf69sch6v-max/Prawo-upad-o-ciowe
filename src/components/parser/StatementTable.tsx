"use client";

import { ConfidenceDot } from "@/components/parser/ConfidenceBadge";
import { DocSection } from "@/components/parser/DocSection";
import { DataCell, Delta } from "@/components/parser/ui/primitives";
import { useScale } from "@/components/parser/ScaleContext";
import { cn } from "@/lib/utils/cn";
import { pctChange } from "@/lib/parser/format";
import { metricLabelPl, pl } from "@/lib/parser/copy.pl";
import { Sigma, FileSearch } from "lucide-react";
import type { Metric, MetricKey, Period } from "@/lib/parser/types";

// Direction is meaningful (green/red) only for revenue / profit / op-cash flow.
const GOOD_UP = new Set<MetricKey>([
  "revenue", "grossProfit", "operatingIncome", "incomeBeforeTax", "netIncome", "ocf",
]);

interface DeltaCol {
  label: string;
  curIdx: number;
  priorIdx: number;
}

function deltaColumns(periods: Period[]): DeltaCol[] {
  return periods
    .map((p, i) => ({ p, i }))
    .filter((x) => x.p.current)
    .map(({ p, i }) => {
      const priorIdx =
        p.kind === "duration"
          ? periods.findIndex((q) => q.months === p.months && !q.current)
          : periods.findIndex((q, j) => j !== i && q.kind === "point");
      const label = p.kind === "duration" ? p.short.split(" ")[0] : "r/r";
      return { label, curIdx: i, priorIdx };
    })
    .filter((d) => d.priorIdx >= 0);
}

export function StatementTable({
  id,
  title,
  metrics,
  periods,
  onSource,
  bare = false,
}: {
  id?: string;
  title?: string;
  metrics: Metric[];
  periods: Period[];
  onSource?: (m: Metric) => void;
  /** Sama tabela, bez nagłówka sekcji — gdy woła ją sekcja nadrzędna. */
  bare?: boolean;
}) {
  const { fmt, active } = useScale();
  const present = metrics.filter((m) => m.values.some((v) => v.value !== null));
  if (present.length === 0) return null;
  const deltas = deltaColumns(periods);

  const groupBreakAfter = new Set<number>();
  for (let i = 0; i < periods.length - 1; i++) {
    if (periods[i].months !== periods[i + 1].months) groupBreakAfter.add(i);
  }

  const table = (
    <div className="mk-table-wrap">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-rp-hairline">
              <th className="col-header sticky left-0 z-[1] bg-mk-bg py-2 pr-3 text-left">
                {pl.statements.lineItem}
              </th>
              {periods.map((p, i) => (
                <th
                  key={p.key}
                  className={cn(
                    "col-header whitespace-nowrap px-3 py-2 text-right",
                    groupBreakAfter.has(i - 1) && "border-l border-rp-hairline",
                  )}
                  title={p.label}
                >
                  {p.short}
                </th>
              ))}
              {deltas.map((d) => (
                <th key={d.label} className="col-header px-3 py-2 text-right">
                  Δ {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {present.map((m) => {
              const aggregated = !!m.note && /aggregat/i.test(m.note);
              const label = metricLabelPl(m.key, m.label);
              const isTotal = /razem|total|net income|zysk netto|przychody$|revenue$/i.test(label) ||
                m.key === "revenue" || m.key === "netIncome" || m.key === "totalAssets" ||
                m.key === "totalEquity" || m.key === "operatingIncome" || m.key === "ocf";
              return (
                <tr key={m.key} className="group border-b border-rp-hairline/50 last:border-0">
                  <td className="sticky left-0 z-[1] bg-mk-bg py-1.5 pr-3">
                    <div className="flex items-center gap-2">
                      <ConfidenceDot level={m.confidence} title={m.matchedLabel} />
                      <span className={cn("text-[13px] text-rp-data", isTotal && "font-medium")}>{label}</span>
                      {aggregated && <Sigma className="h-3 w-3 text-rp-data-muted" aria-label="aggregated" />}
                      {onSource && m.sourceLine !== undefined && (
                        <button
                          onClick={() => onSource(m)}
                          title={pl.statements.showSource}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <FileSearch className="h-3 w-3 text-rp-data-muted hover:text-rp-data" />
                        </button>
                      )}
                    </div>
                  </td>
                  {m.values.map((v, i) => (
                    <td
                      key={periods[i]?.key ?? i}
                      className={cn(
                        "px-3 py-1.5",
                        groupBreakAfter.has(i - 1) && "border-l border-rp-hairline",
                      )}
                    >
                      <DataCell
                        value={fmt(v.value)}
                        emphasis={periods[i]?.current || isTotal}
                        className="block"
                      />
                    </td>
                  ))}
                  {deltas.map((d) => (
                    <td key={d.label} className="px-3 py-1.5 text-right">
                      <Delta
                        value={pctChange(m.values[d.curIdx]?.value, m.values[d.priorIdx]?.value)}
                        direction={GOOD_UP.has(m.key) ? "auto" : "neutral"}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
    </div>
  );

  return bare ? table : (
    <DocSection id={id ?? ""} title={title ?? ""} aside={active.unitLabel}>
      {table}
    </DocSection>
  );
}
