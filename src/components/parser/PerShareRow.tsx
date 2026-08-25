import { Panel } from "@/components/parser/ui/primitives";
import { Coins } from "lucide-react";
import { fmtNum } from "@/lib/parser/format";
import { currencySymbol } from "@/lib/parser/scale";
import { pl } from "@/lib/parser/copy.pl";
import type { PerShareResult } from "@/lib/parser/types";

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="overline">{label}</p>
      <p className="cell mt-1 text-[15px] font-medium text-rp-data">{value}</p>
    </div>
  );
}

export function PerShareRow({ perShare, currency }: { perShare: PerShareResult | null; currency: string | null }) {
  if (!perShare) return null;
  const sym = currencySymbol(currency);
  const money = (v: number | null) => {
    if (v === null) return "—";
    const body = fmtNum(Math.abs(v), 2);
    const signed = v < 0 ? `−${body}` : body;
    return currency === "PLN" ? `${signed} ${sym}` : `${v < 0 ? "−" : ""}${sym}${body}`;
  };
  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="h-4 w-4 text-rp-data-muted" />
        <p className="overline text-rp-data">{pl.perShare.title(perShare.periodLabel)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Item label={pl.perShare.epsBasic} value={money(perShare.epsBasic)} />
        <Item label={pl.perShare.epsDiluted} value={money(perShare.epsDiluted)} />
        <Item label={pl.perShare.dps} value={money(perShare.dps)} />
        <Item label={pl.perShare.shares} value={fmtNum(perShare.weightedSharesDiluted)} />
      </div>
    </Panel>
  );
}
