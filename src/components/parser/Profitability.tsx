"use client";

import { DocSection } from "@/components/parser/DocSection";
import { MarginsChart } from "@/components/parser/MarginsChart";
import { useScale } from "@/components/parser/ScaleContext";
import { fmtPct } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import { TrendingUp } from "lucide-react";
import type { DerivedResult, Period } from "@/lib/parser/types";

/**
 * Rentowność jako MACIERZ: wiersz na miarę, kolumna na okres. Wcześniej strona
 * pokazywała tylko okres bieżący i jeden porównawczy, choć parser liczy
 * wszystkie — a to właśnie zestawienie kwartału z narastającym pokazuje, czy
 * poprawa jest trwała, czy to jeden dobry kwartał.
 */
export function Profitability({
  derived,
  periods,
}: {
  derived: DerivedResult;
  periods: Period[];
}) {
  const { fmt, active } = useScale();

  const ratioFor = (periodKey: string) => derived.ratios.find((r) => r.periodKey === periodKey);
  const fcfFor = (periodKey: string) => derived.fcf.find((f) => f.periodKey === periodKey);

  const hasRatios = periods.some((p) => ratioFor(p.key));
  const hasFcf = periods.some((p) => {
    const f = fcfFor(p.key);
    return f && (f.ocf !== null || f.capex !== null || f.fcf !== null);
  });
  if (!hasRatios && !hasFcf) return null;

  const marginRows: { label: string; pick: (periodKey: string) => number | null }[] = [
    { label: pl.ratios.grossMargin, pick: (k) => ratioFor(k)?.grossMargin ?? null },
    { label: pl.ratios.operatingMargin, pick: (k) => ratioFor(k)?.operatingMargin ?? null },
    { label: pl.ratios.netMargin, pick: (k) => ratioFor(k)?.netMargin ?? null },
  ];

  const cashRows: { label: string; pick: (periodKey: string) => number | null }[] = [
    { label: pl.ratios.ocf, pick: (k) => fcfFor(k)?.ocf ?? null },
    { label: pl.ratios.capex, pick: (k) => fcfFor(k)?.capex ?? null },
    { label: pl.ratios.fcf, pick: (k) => fcfFor(k)?.fcf ?? null },
  ];

  const headerCells = (
    <tr>
      <th className="border-b border-mk-border py-2.5 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-mk-muted">
        Miara
      </th>
      {periods.map((p) => (
        <th
          key={p.key}
          title={p.label}
          className={`whitespace-nowrap border-b border-mk-border px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.04em] ${
            p.current ? "text-mk-text" : "text-mk-muted"
          }`}
        >
          {p.short}
        </th>
      ))}
    </tr>
  );

  return (
    <DocSection id="rentownosc" title="Rentowność" aside={hasFcf ? active.unitLabel : undefined}>
      {hasRatios && (
        <div className="mt-4 mb-6">
          <MarginsChart derived={derived} periods={periods} />
        </div>
      )}

      {hasRatios && (
        <div className="mk-table-wrap">
          <table className="w-full min-w-[480px] border-collapse tnum">
            <thead>{headerCells}</thead>
            <tbody>
              {marginRows.map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-mk-surface-alt py-2.5 pr-3 text-[14px] font-medium text-mk-text">
                    {row.label}
                  </td>
                  {periods.map((p) => {
                    const v = row.pick(p.key);
                    return (
                      <td
                        key={p.key}
                        className={`border-b border-mk-surface-alt px-3 py-2.5 text-right text-[14px] ${
                          v !== null && v < 0
                            ? "text-mk-negative"
                            : p.current
                              ? "font-medium text-mk-text"
                              : "text-mk-muted"
                        }`}
                      >
                        {fmtPct(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasFcf && (
        <div className="mk-table-wrap mt-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-mk-muted">
            Przepływy i wolne przepływy
          </p>
          <table className="w-full min-w-[480px] border-collapse tnum">
            <thead>{headerCells}</thead>
            <tbody>
              {cashRows.map((row, i) => (
                <tr key={row.label}>
                  <td
                    className={`border-b border-mk-surface-alt py-2.5 pr-3 text-[14px] ${
                      i === cashRows.length - 1 ? "font-semibold text-mk-text" : "text-mk-text-soft"
                    }`}
                  >
                    {row.label}
                  </td>
                  {periods.map((p) => {
                    const v = row.pick(p.key);
                    return (
                      <td
                        key={p.key}
                        className={`border-b border-mk-surface-alt px-3 py-2.5 text-right text-[14px] ${
                          i === cashRows.length - 1
                            ? "font-semibold text-mk-text"
                            : p.current
                              ? "text-mk-text"
                              : "text-mk-muted"
                        }`}
                      >
                        {fmt(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {derived.capexIntensityFlag && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-mk-warn/30 bg-mk-warn-soft px-3.5 py-2.5">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mk-warn" aria-hidden />
          <p className="text-[12px] leading-relaxed text-mk-warn">{derived.capexIntensityFlag}</p>
        </div>
      )}
    </DocSection>
  );
}
