"use client";

import { DocSection } from "@/components/parser/DocSection";
import { fmtPct } from "@/lib/parser/format";
import { metricLabelPl } from "@/lib/parser/copy.pl";
import type { MetricKey, ParseResult, Period } from "@/lib/parser/types";

/** Pozycje, których udział w przychodach coś mówi. Zyski są w „Rentowność". */
const COST_KEYS: MetricKey[] = [
  "costOfRevenue", "rAndD", "sellingMarketing", "generalAdmin", "sga",
  "totalOpEx", "interestExpense", "incomeTax",
];

interface CostRow {
  key: MetricKey;
  label: string;
  shares: (number | null)[];
}

export function buildCostRows(result: ParseResult, periods: Period[]): CostRow[] {
  const periodKeys = periods.map((p) => p.key);
  const revenue = result.metrics.find((m) => m.key === "revenue");
  if (!revenue) return [];
  const revByPeriod = periodKeys.map(
    (pk) => revenue.values.find((v) => v.periodKey === pk)?.value ?? null,
  );
  if (!revByPeriod.some((v) => v !== null && v !== 0)) return [];

  const rows: CostRow[] = [];
  for (const key of COST_KEYS) {
    const m = result.metrics.find((x) => x.key === key);
    if (!m || !m.values.some((v) => v.value !== null)) continue;
    const shares = periodKeys.map((pk, i) => {
      const v = m.values.find((x) => x.periodKey === pk)?.value ?? null;
      const rev = revByPeriod[i];
      if (v === null || rev === null || rev === 0) return null;
      return (v / rev) * 100;
    });
    if (shares.some((s) => s !== null)) {
      rows.push({ key, label: metricLabelPl(key, m.label), shares });
    }
  }
  return rows;
}

/**
 * Każda pozycja kosztowa jako udział w przychodach tego samego okresu.
 * Udział powyżej 100% nie jest błędem — to spółka sprzedająca poniżej kosztu
 * wytworzenia, więc taki wiersz dostaje ostrzegawczy kolor zamiast cichego
 * przemycenia obok reszty.
 */
export function CostStructure({
  result,
  periods,
}: {
  result: ParseResult;
  periods: Period[];
}) {
  const rows = buildCostRows(result, periods);
  if (rows.length === 0) return null;

  return (
    <DocSection id="koszty" title="Struktura kosztów" aside="udział w przychodach">
      <div className="mk-table-wrap">
        <table className="w-full min-w-[480px] border-collapse tnum">
          <thead>
            <tr>
              <th className="border-b border-mk-border py-2.5 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-mk-muted">
                Pozycja
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
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="border-b border-mk-surface-alt py-2.5 pr-3 text-[14px] text-mk-text-soft">
                  {r.label}
                </td>
                {r.shares.map((s, i) => {
                  const over = s !== null && s > 100;
                  return (
                    <td
                      key={periods[i]?.key ?? i}
                      className={`border-b border-mk-surface-alt px-3 py-2.5 text-right text-[14px] ${
                        over
                          ? "font-semibold text-mk-warn"
                          : periods[i]?.current
                            ? "text-mk-text"
                            : "text-mk-muted"
                      }`}
                    >
                      {fmtPct(s)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 text-[12px] text-mk-faint">
        Wartość powyżej 100% oznacza pozycję kosztową większą niż przychody okresu.
      </p>
    </DocSection>
  );
}
