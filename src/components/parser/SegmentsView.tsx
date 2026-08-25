"use client";

import { Panel, Delta } from "@/components/parser/ui/primitives";
import { Badge } from "@/components/parser/ui/badge";
import { PieChart } from "lucide-react";
import { useScale } from "@/components/parser/ScaleContext";
import { fmtPct } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { SegmentsResult } from "@/lib/parser/types";

export function SegmentsView({ segments }: { segments: SegmentsResult | null }) {
  const { fmt, active } = useScale();
  if (!segments || segments.segments.length === 0) return null;
  const maxRev = Math.max(...segments.segments.map((s) => Math.abs(s.revenue ?? 0)), 1);

  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-rp-data-muted" />
          <p className="overline text-rp-data">{pl.segments.title(segments.periodLabel)}</p>
        </div>
        <Badge variant={segments.reconciles ? "default" : "warn"}>
          {segments.reconciles ? pl.segments.reconciled : pl.segments.checkTotals}
        </Badge>
      </div>
      <p className="mb-3 flex items-center gap-3 overline">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rp-data/80" /> {pl.segments.opIncome}</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rp-data/20" /> {pl.segments.costs}</span>
        <span className="ml-auto">{active.unitLabel}</span>
      </p>
      <div className="space-y-3">
        {segments.segments.map((s) => {
          const revShare = (Math.abs(s.revenue ?? 0) / maxRev) * 100;
          const opMargin = Math.max(0, Math.min(100, s.operatingMargin ?? 0));
          return (
            <div key={s.name}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-rp-data">{s.name}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <Delta value={s.revenueYoY} />
                  <span className="num text-[13px] text-rp-data">{fmt(s.revenue, { unit: true })}</span>
                  <span className="num w-12 text-right text-xs text-rp-data-muted">{pl.segments.op} {fmtPct(s.operatingMargin, 0)}</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-rp-data/10">
                <div className="h-2 rounded-full bg-rp-data/20" style={{ width: `${revShare}%` }}>
                  <div className="h-2 rounded-l-full bg-rp-data/80" style={{ width: `${opMargin}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-rp-hairline pt-2">
        <span className="text-[13px] text-rp-data-muted">{pl.segments.total}</span>
        <span className="num text-[13px] text-rp-data">
          {fmt(segments.totalRevenue, { unit: true })}
          <span className="ml-2 text-xs text-rp-data-muted">{pl.segments.op} {fmt(segments.totalOperatingIncome, { unit: true })}</span>
        </span>
      </div>
    </Panel>
  );
}
