"use client";

import * as React from "react";
import { fmtPct } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { DerivedResult, Period } from "@/lib/parser/types";

/**
 * Marże we wszystkich wykrytych okresach — słupki grupowane, nie linia.
 * Linia sugerowałaby ciągłość, a okresy bywają niejednorodne (kwartał obok
 * narastającego), więc łączenie ich linią byłoby kłamstwem wizualnym.
 * Zero jest kotwicą: przy stratnej spółce wszystkie słupki wiszą pod nią.
 */

interface Series {
  key: string;
  label: string;
  color: string;
  pick: (periodKey: string) => number | null;
}

const W = 860;
const H = 260;
const PAD_TOP = 26;
const PAD_BOTTOM = 46;
const PAD_LEFT = 52;
const PAD_RIGHT = 12;

export function MarginsChart({
  derived,
  periods,
}: {
  derived: DerivedResult;
  periods: Period[];
}) {
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  const ratioFor = React.useCallback(
    (periodKey: string) => derived.ratios.find((r) => r.periodKey === periodKey),
    [derived.ratios],
  );

  const series: Series[] = React.useMemo(
    () => [
      { key: "gross", label: pl.ratios.grossMargin, color: "#2563EB", pick: (k) => ratioFor(k)?.grossMargin ?? null },
      { key: "op", label: pl.ratios.operatingMargin, color: "#7C3AED", pick: (k) => ratioFor(k)?.operatingMargin ?? null },
      { key: "net", label: pl.ratios.netMargin, color: "#0F172A", pick: (k) => ratioFor(k)?.netMargin ?? null },
    ],
    [ratioFor],
  );

  const shown = series.filter((s) => !hidden.has(s.key));

  const all: number[] = [];
  for (const p of periods) for (const s of shown) {
    const v = s.pick(p.key);
    if (v !== null && Number.isFinite(v)) all.push(v);
  }
  if (periods.length === 0 || all.length === 0) return null;

  const rawMax = Math.max(0, ...all);
  const rawMin = Math.min(0, ...all);
  const pad = (rawMax - rawMin) * 0.12 || 1;
  const maxV = rawMax + (rawMax > 0 ? pad : pad * 0.3);
  const minV = rawMin - (rawMin < 0 ? pad : 0);
  const range = maxV - minV || 1;

  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const y = (v: number) => PAD_TOP + ((maxV - v) / range) * plotH;
  const zeroY = y(0);

  const groupW = plotW / periods.length;
  const barGap = 5;
  const barW = Math.min(28, (groupW * 0.66 - barGap * (shown.length - 1)) / Math.max(1, shown.length));
  const groupInner = barW * shown.length + barGap * (shown.length - 1);

  // Linie siatki na okrągłych wartościach — czytelnik ma się zaczepić wzrokiem.
  const step = range > 60 ? 20 : range > 25 ? 10 : range > 10 ? 5 : 2;
  const gridlines: number[] = [];
  for (let v = Math.ceil(minV / step) * step; v <= maxV; v += step) gridlines.push(v);

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (prev.size < series.length - 1) next.add(key); // ostatniej serii nie da się zgasić
      return next;
    });

  const hovered = hoverIdx !== null ? periods[hoverIdx] : null;

  return (
    <div className="mk-card mk-card-pad">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-mk-text">
          Marże w wykrytych okresach
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {series.map((s) => {
            const off = hidden.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggle(s.key)}
                aria-pressed={!off}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                  off ? "text-mk-faint" : "text-mk-text-soft hover:bg-mk-surface-alt"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: off ? "#CBD2DD" : s.color }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: H }}
          role="img"
          aria-label={`Marże w okresach: ${periods.map((p) => p.short).join(", ")}`}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {gridlines.map((v) => (
            <g key={v}>
              <line
                x1={PAD_LEFT}
                y1={y(v)}
                x2={W - PAD_RIGHT}
                y2={y(v)}
                stroke={v === 0 ? "#94A3B8" : "#E7EAF0"}
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 8}
                y={y(v) + 3.5}
                textAnchor="end"
                fill="#64748B"
                style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
              >
                {v}%
              </text>
            </g>
          ))}

          {periods.map((p, gi) => {
            const gx = PAD_LEFT + gi * groupW;
            const startX = gx + (groupW - groupInner) / 2;
            return (
              <g key={p.key}>
                <rect
                  x={gx}
                  y={PAD_TOP}
                  width={groupW}
                  height={plotH}
                  fill={hoverIdx === gi ? "#F1F3F7" : "transparent"}
                  onMouseEnter={() => setHoverIdx(gi)}
                />
                {shown.map((s, si) => {
                  const v = s.pick(p.key);
                  if (v === null || !Number.isFinite(v)) return null;
                  const yv = y(v);
                  const top = Math.min(yv, zeroY);
                  const h = Math.max(1.5, Math.abs(yv - zeroY));
                  return (
                    <rect
                      key={s.key}
                      x={startX + si * (barW + barGap)}
                      y={top}
                      width={barW}
                      height={h}
                      rx={2}
                      fill={s.color}
                      opacity={hoverIdx === null || hoverIdx === gi ? 1 : 0.35}
                      style={{ transition: "opacity .15s ease" }}
                      onMouseEnter={() => setHoverIdx(gi)}
                    />
                  );
                })}
                <text
                  x={gx + groupW / 2}
                  y={H - PAD_BOTTOM + 18}
                  textAnchor="middle"
                  fill={p.current ? "#0F172A" : "#64748B"}
                  style={{ fontSize: 11, fontWeight: p.current ? 600 : 400 }}
                >
                  {p.short}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-2 rounded-[10px] border border-mk-border bg-mk-surface px-3 py-2 shadow-[var(--shadow-mk-lg)]"
            style={{
              left: `${((PAD_LEFT + (hoverIdx! + 0.5) * groupW) / W) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="mb-1 text-[11px] font-semibold text-mk-text">{hovered.short}</p>
            {shown.map((s) => (
              <p key={s.key} className="flex items-center gap-2 text-[12px] tnum text-mk-muted">
                <span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
                {s.label}
                <span className="ml-auto pl-3 font-semibold text-mk-text">
                  {fmtPct(s.pick(hovered.key))}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
