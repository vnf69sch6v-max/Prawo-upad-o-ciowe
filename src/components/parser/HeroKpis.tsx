"use client";

import { Metric, Delta } from "@/components/parser/ui/primitives";
import { useScale } from "@/components/parser/ScaleContext";
import { deltaChange, type DeltaValue } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import { DerivedBadge } from "@/components/parser/DerivedBadge";
import { DERIVED_FORMULAS, type DerivedKey } from "@/lib/parser/derived-meta";
import type { MetricKey, ParseResult, Period } from "@/lib/parser/types";

function priorSameDuration(income: Period[], current: Period | undefined): Period | undefined {
  if (!current) return undefined;
  return income.find((p) => !p.current && p.months === current.months && p.kind === current.kind);
}

/** The one hero KPI strip — the only place big numbers live. */
export function HeroKpis({ result }: { result: ParseResult }) {
  const { fmt } = useScale();
  const inc = result.detection.periods.income;
  const q = inc.find((p) => p.months === 3 && p.current) ?? inc.find((p) => p.current) ?? inc[0];
  const qPrior = priorSameDuration(inc, q);
  const durations = inc.filter((p) => p.months);
  const longest = durations.length ? Math.max(...durations.map((p) => p.months!)) : null;
  const lp = (longest !== null ? inc.find((p) => p.months === longest && p.current) : q) ?? q;
  const lpPrior = priorSameDuration(inc, lp);

  const val = (key: MetricKey, pk?: string) =>
    result.metrics.find((m) => m.key === key)?.values.find((v) => v.periodKey === pk)?.value ?? null;

  const fcf = result.derived.fcf.find((f) => f.periodKey === lp?.key)?.fcf ?? null;
  const fcfPrior = lpPrior
    ? result.derived.fcf.find((f) => f.periodKey === lpPrior.key)?.fcf ?? null
    : null;
  const nc = result.netCash;

  const tiles = [
    {
      label: pl.hero.revenue,
      value: fmt(val("revenue", q?.key), { unit: true }),
      sub: q?.short,
      delta: deltaChange(val("revenue", q?.key), val("revenue", qPrior?.key)),
      dir: "auto" as const,
    },
    {
      label: pl.hero.netIncome,
      value: fmt(val("netIncome", q?.key), { unit: true }),
      sub: q?.short,
      delta: deltaChange(val("netIncome", q?.key), val("netIncome", qPrior?.key)),
      dir: "auto" as const,
    },
    {
      label: pl.hero.fcf,
      value: fmt(fcf, { unit: true }),
      sub: lp?.short,
      delta: deltaChange(fcf, fcfPrior),
      dir: "auto" as const,
      derived: "fcf" as DerivedKey,
      pk: lp?.key,
    },
    {
      label: nc?.isNetCash ? pl.hero.netCash : pl.hero.netDebt,
      value: fmt(nc?.netCashInclStInv ?? null, { unit: true }),
      sub: nc?.periodLabel,
      delta: null as DeltaValue,
      dir: "neutral" as const,
      derived: "netDebt" as DerivedKey,
      pk: nc?.periodKey,
    },
  ] as { label: string; value: string; sub?: string; delta: DeltaValue; dir: "auto" | "neutral"; derived?: DerivedKey; pk?: string }[];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="mk-card mk-card-pad rp-kpi">
          <Metric label={t.label} value={t.value} sub={t.sub} />
          {t.derived && (
            <div className="mt-1">
              <DerivedBadge k={t.derived} period={t.sub} inputs={t.pk ? DERIVED_FORMULAS[t.derived].inputs?.(result, t.pk) : undefined} />
            </div>
          )}
          {t.delta !== null && t.delta !== undefined && (
            <div className="mt-1.5">
              <Delta value={t.delta} direction={t.dir} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
