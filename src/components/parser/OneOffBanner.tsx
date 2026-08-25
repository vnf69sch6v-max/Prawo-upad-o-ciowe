import { AlertTriangle } from "lucide-react";
import { fmtNum } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { OneOffResult } from "@/lib/parser/types";

export function OneOffBanner({ oneOff }: { oneOff: OneOffResult }) {
  if (!oneOff.detected) return null;
  const hl = oneOff.headlinePeriodLabel;
  const pickHeadline = (arr?: { periodLabel: string; value: number }[]) =>
    arr ? (arr.find((a) => a.periodLabel === hl) ?? arr[arr.length - 1]) : undefined;
  const adj9 = pickHeadline(oneOff.adjustedNetIncome);
  const gaap9 = pickHeadline(oneOff.gaapNetIncome);

  return (
    <div className="rounded-lg border border-rp-warn/30 bg-rp-warn/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rp-warn/30 bg-rp-warn/10">
          <AlertTriangle className="h-4 w-4 text-rp-warn" />
        </div>
        <div className="min-w-0">
          <p className="overline text-rp-warn">{pl.oneOff.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-rp-data/80">{oneOff.note}</p>
          {(adj9 || gaap9) && (
            <div className="num mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
              {gaap9 && (
                <span className="text-rp-data-muted">
                  {pl.oneOff.gaap} <span className="text-rp-data">{fmtNum(gaap9.value)}</span> ({gaap9.periodLabel})
                </span>
              )}
              {adj9 && (
                <span className="text-rp-data-muted">
                  {pl.oneOff.adjusted} <span className="text-rp-data">{fmtNum(adj9.value)}</span>
                </span>
              )}
              {oneOff.oneOffEstimate !== undefined && (
                <span className="text-rp-data-muted">
                  {pl.oneOff.estimate} <span className="text-rp-warn">{fmtNum(oneOff.oneOffEstimate)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
