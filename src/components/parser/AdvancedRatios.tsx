"use client";

import { Panel } from "@/components/parser/ui/primitives";
import { useScale } from "@/components/parser/ScaleContext";
import { fmtPct } from "@/lib/parser/format";
import { pl, ratioLabelPl } from "@/lib/parser/copy.pl";
import type { AdvancedRatio } from "@/lib/parser/types";

export function AdvancedRatios({ ratios }: { ratios: AdvancedRatio[] }) {
  const { fmt } = useScale();
  if (!ratios.length) return null;

  const render = (a: AdvancedRatio): string => {
    if (a.format === "text") {
      if (a.text === "net cash") return pl.hero.netCash;
      return a.text ?? "—";
    }
    if (a.value === null) return "—";
    if (a.format === "money") return fmt(a.value, { unit: true });
    if (a.format === "pct") return fmtPct(a.value);
    return `${a.value.toFixed(2)}×`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ratios.map((a) => (
          <Panel key={a.key} className="p-3">
            <p className="overline">{ratioLabelPl(a.key, a.label)}</p>
            <p className="num mt-1 text-sm font-medium text-rp-data">{render(a)}</p>
            <p className="mt-0.5 text-[10px] text-rp-data-dim">{a.basis}</p>
          </Panel>
        ))}
    </div>
  );
}
