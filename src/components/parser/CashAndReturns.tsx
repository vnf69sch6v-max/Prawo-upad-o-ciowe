"use client";

import { Panel } from "@/components/parser/ui/primitives";
import { Badge } from "@/components/parser/ui/badge";
import { Wallet, HandCoins } from "lucide-react";
import { useScale } from "@/components/parser/ScaleContext";
import { fmtPct } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { NetCashResult, CapitalReturnsResult } from "@/lib/parser/types";

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-rp-data-muted">{label}</span>
      <span className={"num text-[13px] " + (emphasis ? "font-medium text-rp-data" : "text-rp-data")}>{value}</span>
    </div>
  );
}

export function NetCashCard({ netCash }: { netCash: NetCashResult | null }) {
  const { fmt } = useScale();
  if (!netCash) return null;
  return (
    <Panel className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-rp-data-muted" />
          <p className="overline text-rp-data">{pl.cash.netCashTitle(netCash.periodLabel)}</p>
        </div>
        <Badge variant="default">{netCash.isNetCash ? pl.cash.netCash : pl.cash.netDebt}</Badge>
      </div>
      <Row label={pl.cash.totalDebt} value={fmt(netCash.totalDebt, { unit: true })} />
      <Row label={pl.cash.cash} value={fmt(netCash.cash, { unit: true })} />
      {netCash.shortTermInvestments !== null && (
        <Row label={pl.cash.stInv} value={fmt(netCash.shortTermInvestments, { unit: true })} />
      )}
      <div className="my-1 h-px bg-rp-hairline" />
      <Row label={pl.cash.netExcl} value={fmt(netCash.netCashExclStInv, { unit: true })} emphasis />
      <Row label={pl.cash.netIncl} value={fmt(netCash.netCashInclStInv, { unit: true })} emphasis />
    </Panel>
  );
}

export function CapitalReturnsCard({ cr }: { cr: CapitalReturnsResult | null }) {
  const { fmt } = useScale();
  if (!cr || (cr.dividends === null && cr.buybacks === null)) return null;
  return (
    <Panel className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <HandCoins className="h-4 w-4 text-rp-data-muted" />
        <p className="overline text-rp-data">{pl.cash.returnsTitle(cr.periodLabel)}</p>
      </div>
      <Row label={pl.cash.dividends} value={fmt(cr.dividends, { unit: true })} />
      <Row label={pl.cash.buybacks} value={fmt(cr.buybacks, { unit: true })} />
      <div className="my-1 h-px bg-rp-hairline" />
      <Row label={pl.cash.totalReturned} value={fmt(cr.total, { unit: true })} emphasis />
      {cr.payoutOfFcf !== null && <Row label={pl.cash.payoutFcf} value={fmtPct(cr.payoutOfFcf)} />}
    </Panel>
  );
}
