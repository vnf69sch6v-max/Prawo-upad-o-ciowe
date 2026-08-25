"use client";

import { Panel } from "@/components/parser/ui/primitives";
import { Badge } from "@/components/parser/ui/badge";
import { Boxes } from "lucide-react";
import { useScale } from "@/components/parser/ScaleContext";
import { pl } from "@/lib/parser/copy.pl";
import type { ProductRevenueResult } from "@/lib/parser/types";

export function ProductRevenueView({ product }: { product: ProductRevenueResult | null }) {
  const { fmt, active } = useScale();
  if (!product || product.items.length < 2) return null;
  const max = Math.max(...product.items.map((i) => Math.abs(i.value ?? 0)), 1);

  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-rp-data-muted" />
          <p className="overline text-rp-data">{pl.products.title(product.periodLabel)}</p>
        </div>
        <Badge variant={product.reconciles ? "default" : "warn"}>
          {product.reconciles ? pl.products.reconciled : pl.products.checkTotal}
        </Badge>
      </div>
      <div className="space-y-2">
        {product.items.map((it) => (
          <div key={it.name}>
            <div className="mb-0.5 flex items-baseline justify-between gap-2">
              <span className="truncate text-[13px] text-rp-data">{it.name}</span>
              <span className="num shrink-0 text-[13px] text-rp-data">
                {fmt(it.value, { unit: true })}
                <span className="ml-2 text-xs text-rp-data-muted">{it.share?.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-rp-data/10">
              <div className="h-1.5 rounded-full bg-rp-data/60" style={{ width: `${(Math.abs(it.value ?? 0) / max) * 100}%` }} />
            </div>
          </div>
        ))}
        <p className="pt-1 overline">{active.unitLabel}</p>
      </div>
    </Panel>
  );
}
