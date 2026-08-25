"use client";

import * as React from "react";
import { Panel } from "@/components/parser/ui/primitives";
import { Badge } from "@/components/parser/ui/badge";
import { Waypoints, Layers, GitBranch } from "lucide-react";
import { useScale } from "@/components/parser/ScaleContext";
import { fmtPct } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { ParseResult, Period, MetricKey, SegmentsResult, ProductRevenueResult } from "@/lib/parser/types";

function mv(result: ParseResult, key: MetricKey, periodKey: string): number | null {
  const m = result.metrics.find((x) => x.key === key);
  return m ? (m.values.find((v) => v.periodKey === periodKey)?.value ?? null) : null;
}

function ChartHeader({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-rp-data-muted">{icon}</span>
        <p className="overline text-rp-data">{label}</p>
      </div>
      {right}
    </div>
  );
}

interface Bar {
  label: string;
  from: number;
  to: number;
  kind: "level" | "sub" | "add";
  running: number;
}

function WaterfallChart({ bars, tiesNote }: { bars: Bar[]; tiesNote?: string }) {
  const { fmt } = useScale();
  if (bars.length === 0) return null;
  const vals = bars.flatMap((b) => [b.from, b.to]);
  const maxV = Math.max(0, ...vals);
  const minV = Math.min(0, ...vals);
  const range = maxV - minV || 1;

  const W = 720;
  const H = 220;
  const padTop = 22;
  const padBottom = 40;
  const plotH = H - padTop - padBottom;
  const n = bars.length;
  const slot = W / n;
  const bw = Math.min(64, slot * 0.62);
  const y = (v: number) => padTop + ((maxV - v) / range) * plotH;
  const zeroY = y(0);
  // Levels/totals = bright data; deductions dim; additions muted. No green/red.
  const fillOf = (k: Bar["kind"]) =>
    k === "level" ? "var(--rp-data)" : k === "sub" ? "var(--rp-data-dim)" : "var(--rp-data-muted)";
  const opacityOf = (k: Bar["kind"]) => (k === "level" ? 0.92 : 0.8);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img">
        <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="var(--rp-hairline)" strokeWidth={1} />
        {bars.map((b, i) => {
          const cx = i * slot + slot / 2;
          const x = cx - bw / 2;
          const top = Math.min(y(b.from), y(b.to));
          const h = Math.max(2, Math.abs(y(b.from) - y(b.to)));
          const next = bars[i + 1];
          const labelVal =
            b.kind === "level"
              ? fmt(b.to, { unit: true })
              : (b.kind === "sub" ? "−" : "+") + fmt(Math.abs(b.to - b.from), { unit: true });
          return (
            <g key={b.label + i}>
              {next && (
                <line
                  x1={cx + bw / 2}
                  y1={y(b.running)}
                  x2={(i + 1) * slot + slot / 2 - bw / 2}
                  y2={y(b.running)}
                  stroke="var(--rp-hairline)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )}
              <rect x={x} y={top} width={bw} height={h} rx={2} fill={fillOf(b.kind)} opacity={opacityOf(b.kind)} />
              <text x={cx} y={top - 5} textAnchor="middle" fill="var(--rp-data)" style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}>
                {labelVal}
              </text>
              <text x={cx} y={H - padBottom + 16} textAnchor="middle" fill="var(--rp-data-muted)" style={{ fontSize: 9.5 }}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
      {tiesNote && <p className="num mt-1 text-center text-[11px] text-rp-data-muted">{tiesNote}</p>}
    </div>
  );
}

function primaryQuarter(income: Period[]): Period | undefined {
  return income.find((p) => p.months === 3 && p.current) ?? income.find((p) => p.current) ?? income[0];
}
function longestDuration(income: Period[]): Period | undefined {
  const d = income.filter((p) => p.months);
  if (!d.length) return income.find((p) => p.current) ?? income[0];
  const m = Math.max(...d.map((p) => p.months!));
  return income.find((p) => p.months === m && p.current);
}

export function PnLWaterfall({ result }: { result: ParseResult }) {
  const { fmt } = useScale();
  const income = result.detection.periods.income;
  const p = primaryQuarter(income);
  if (!p) return null;
  const rev = mv(result, "revenue", p.key);
  const cost = mv(result, "costOfRevenue", p.key);
  const gross = mv(result, "grossProfit", p.key);
  const opInc = mv(result, "operatingIncome", p.key);
  const net = mv(result, "netIncome", p.key);
  if (rev === null || opInc === null || net === null) return null;

  const bars: Bar[] = [{ label: pl.charts.revenue, from: 0, to: rev, kind: "level", running: rev }];
  if (gross !== null && cost !== null) {
    bars.push({ label: pl.charts.costOfRev, from: gross, to: rev, kind: "sub", running: gross });
    bars.push({ label: pl.charts.grossProfit, from: 0, to: gross, kind: "level", running: gross });
    bars.push({ label: pl.charts.opEx, from: opInc, to: gross, kind: "sub", running: opInc });
  } else {
    bars.push({ label: pl.charts.totalCosts, from: opInc, to: rev, kind: "sub", running: opInc });
  }
  bars.push({ label: pl.charts.opIncome, from: 0, to: opInc, kind: "level", running: opInc });
  if (net >= opInc) bars.push({ label: pl.charts.otherTaxAdd, from: opInc, to: net, kind: "add", running: net });
  else bars.push({ label: pl.charts.otherTaxSub, from: net, to: opInc, kind: "sub", running: net });
  bars.push({ label: pl.charts.netIncome, from: 0, to: net, kind: "level", running: net });

  return (
    <Panel className="p-4">
      <ChartHeader
        icon={<Waypoints className="h-4 w-4" />}
        label={pl.charts.pnl(p.short)}
        right={<span className="overline">{pl.charts.pnlSub}</span>}
      />
      <WaterfallChart bars={bars} tiesNote={pl.charts.tiesNet(fmt(net, { unit: true }))} />
    </Panel>
  );
}

export function CapitalBridge({ result }: { result: ParseResult }) {
  const { fmt } = useScale();
  const cr = result.capitalReturns;
  const income = result.detection.periods.income;
  const p = longestDuration(income);
  if (!cr || !p) return null;
  const fcf = result.derived.fcf.find((f) => f.periodKey === p.key)?.fcf ?? cr.fcf;
  if (fcf === null || fcf === undefined) return null;
  const div = cr.dividends ?? 0;
  const buy = cr.buybacks ?? 0;
  const afterDiv = fcf - div;
  const retained = fcf - div - buy;

  const bars: Bar[] = [
    { label: pl.charts.fcf, from: 0, to: fcf, kind: "level", running: fcf },
    { label: pl.charts.dividends, from: afterDiv, to: fcf, kind: "sub", running: afterDiv },
    { label: pl.charts.buybacks, from: retained, to: afterDiv, kind: "sub", running: retained },
    { label: pl.charts.retained, from: 0, to: retained, kind: "level", running: retained },
  ];

  return (
    <Panel className="p-4">
      <ChartHeader
        icon={<GitBranch className="h-4 w-4" />}
        label={pl.charts.capital(p.short)}
        right={cr.payoutOfFcf !== null ? <Badge variant="outline">{pl.charts.payoutOfFcf(fmtPct(cr.payoutOfFcf, 0))}</Badge> : undefined}
      />
      <WaterfallChart bars={bars} tiesNote={pl.charts.retainedAfter(fmt(retained, { unit: true }))} />
    </Panel>
  );
}

/** Monochrome data ramp for categorical slices — honours the 2-channel contract. */
function rampAlpha(i: number, n: number): number {
  if (n <= 1) return 0.85;
  return 0.85 - (i / (n - 1)) * 0.6; // 0.85 → 0.25
}

export function RevenueComposition({
  segments,
  products,
}: {
  segments: SegmentsResult | null;
  products: ProductRevenueResult | null;
}) {
  const source =
    segments && segments.segments.length > 1
      ? { title: pl.charts.bySegment, items: segments.segments.map((s) => ({ name: s.name, value: Math.abs(s.revenue ?? 0) })) }
      : products && products.items.length > 1
        ? { title: pl.charts.byProduct, items: products.items.map((i) => ({ name: i.name, value: Math.abs(i.value ?? 0) })) }
        : null;
  if (!source) return null;
  const total = source.items.reduce((a, s) => a + s.value, 0) || 1;
  const n = source.items.length;

  return (
    <Panel className="p-4">
      <ChartHeader icon={<Layers className="h-4 w-4" />} label={pl.charts.composition(source.title)} />
      <div className="flex h-4 w-full overflow-hidden rounded-md border border-rp-hairline">
        {source.items.map((s, i) => (
          <div
            key={s.name}
            style={{ width: `${(s.value / total) * 100}%`, background: `color-mix(in oklab, var(--rp-data) ${(rampAlpha(i, n)) * 100}%, transparent)` }}
            title={`${s.name} ${((s.value / total) * 100).toFixed(1)}%`}
            className="border-r border-rp-surface last:border-0"
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {source.items.slice(0, 9).map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: `color-mix(in oklab, var(--rp-data) ${(rampAlpha(i, n)) * 100}%, transparent)` }} />
            <span className="truncate text-rp-data-muted">{s.name}</span>
            <span className="num ml-auto text-rp-data">{((s.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
