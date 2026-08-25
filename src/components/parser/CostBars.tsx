"use client";

import * as React from "react";
import { fmtPct } from "@/lib/parser/format";
import type { Period } from "@/lib/parser/types";

/**
 * Koszty jako udział w przychodach, z przychodami jako linią odniesienia 100%.
 * Cała informacja siedzi w tym, czy słupek przebija linię: jeśli tak, pozycja
 * kosztowa zjadła całą sprzedaż. Wykres jest wart tyle, ile ta jedna linia —
 * bez niej to byłyby po prostu paski.
 */

export interface CostBarRow {
  key: string;
  label: string;
  shares: (number | null)[];
}

export function CostBars({
  rows,
  periods,
}: {
  rows: CostBarRow[];
  periods: Period[];
}) {
  const currentIdx = Math.max(0, periods.findIndex((p) => p.current));
  const [periodIdx, setPeriodIdx] = React.useState(currentIdx);
  const [hover, setHover] = React.useState<string | null>(null);

  const data = rows
    .map((r) => ({ key: r.key, label: r.label, value: r.shares[periodIdx] }))
    .filter((d): d is { key: string; label: string; value: number } => d.value !== null);
  if (data.length === 0) return null;

  const maxValue = Math.max(100, ...data.map((d) => d.value));
  // Skala zostawia margines za linią 100%, żeby przebicie było widoczne, a nie ucięte.
  const scaleMax = maxValue * 1.06;

  const LABEL_W = 190;
  const BAR_H = 26;
  const GAP = 10;
  const W = 860;
  const TOP = 24;
  const plotW = W - LABEL_W - 24;
  const H = TOP + data.length * (BAR_H + GAP) + 14;
  const x = (v: number) => (v / scaleMax) * plotW;
  const hundredX = LABEL_W + x(100);

  return (
    <div className="mk-card mk-card-pad">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-mk-text">
          Koszty wobec przychodów
        </p>
        {periods.length > 1 && (
          <div className="mk-seg">
            {periods.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriodIdx(i)}
                className={`mk-seg-btn ${i === periodIdx ? "mk-seg-btn-active" : ""}`}
              >
                {p.short}
              </button>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        role="img"
        aria-label={`Udział kosztów w przychodach, okres ${periods[periodIdx]?.short ?? ""}`}
        onMouseLeave={() => setHover(null)}
      >
        {/* Linia 100% — przychody okresu */}
        <line x1={hundredX} y1={TOP - 14} x2={hundredX} y2={H - 8} stroke="#0F172A" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={hundredX} y={TOP - 20} textAnchor="middle" fill="#0F172A" style={{ fontSize: 10, fontWeight: 700 }}>
          PRZYCHODY 100%
        </text>

        {data.map((d, i) => {
          const yTop = TOP + i * (BAR_H + GAP);
          const over = d.value > 100;
          const active = hover === null || hover === d.key;
          return (
            <g key={d.key} onMouseEnter={() => setHover(d.key)} opacity={active ? 1 : 0.4} style={{ transition: "opacity .15s ease" }}>
              <rect x={0} y={yTop} width={W} height={BAR_H} fill={hover === d.key ? "#F7F8FA" : "transparent"} />
              <text
                x={LABEL_W - 12}
                y={yTop + BAR_H / 2 + 4}
                textAnchor="end"
                fill="#334155"
                style={{ fontSize: 12.5 }}
              >
                {d.label}
              </text>
              <rect
                x={LABEL_W}
                y={yTop + 4}
                width={Math.max(2, x(d.value))}
                height={BAR_H - 8}
                rx={3}
                fill={over ? "#DC2626" : "#64748B"}
              />
              <text
                x={LABEL_W + x(d.value) + 8}
                y={yTop + BAR_H / 2 + 4}
                fill={over ? "#DC2626" : "#475569"}
                style={{ fontSize: 12, fontWeight: over ? 700 : 600, fontVariantNumeric: "tabular-nums" }}
              >
                {fmtPct(d.value)}
              </text>
            </g>
          );
        })}
      </svg>

      {data.some((d) => d.value > 100) && (
        <p className="mt-1 text-[12px] leading-relaxed text-mk-negative">
          Czerwony słupek przebija linię przychodów — ta pozycja kosztowa jest większa niż cała sprzedaż okresu.
        </p>
      )}
    </div>
  );
}
