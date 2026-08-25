"use client";

import * as React from "react";
import { X, FileSearch } from "lucide-react";
import { Badge } from "@/components/parser/ui/badge";
import { metricLabelPl, pl } from "@/lib/parser/copy.pl";
import type { Metric } from "@/lib/parser/types";

/** Provenance: show the exact extracted line(s) a metric was read from. */
export function SourceModal({
  metric,
  rawText,
  onClose,
}: {
  metric: Metric | null;
  rawText: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!metric) return null;
  const lines = rawText.split("\n");
  const idx = metric.sourceLine ?? -1;
  const from = Math.max(0, idx - 2);
  const to = Math.min(lines.length - 1, idx + 2);
  const snippet: { n: number; text: string }[] = [];
  for (let i = from; i <= to; i++) snippet.push({ n: i + 1, text: lines[i] ?? "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-rp-hairline bg-rp-surface-raised shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rp-hairline p-4">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-rp-data-muted" />
            <div>
              <p className="text-sm font-semibold">{metricLabelPl(metric.key, metric.label)}</p>
              <p className="text-[11px] text-rp-data-muted">
                {pl.source.sourceLine(idx >= 0 ? String(idx + 1) : "?")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-rp-data-muted hover:text-rp-data">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {metric.matchedLabel && (
              <Badge variant="outline">{pl.source.matched(metric.matchedLabel)}</Badge>
            )}
            {metric.note && (
              <Badge variant={/aggregat/i.test(metric.note) ? "warning" : "outline"}>{metric.note}</Badge>
            )}
            <Badge variant="accent">{metric.confidence}</Badge>
          </div>
          <pre className="num overflow-x-auto rounded-lg border border-rp-hairline bg-rp-surface p-3 text-[11px] leading-relaxed">
            {snippet.map((s) => (
              <div key={s.n} className={s.n === idx + 1 ? "rounded bg-rp-data/10 px-1 text-rp-data" : "px-1 text-rp-data-muted"}>
                <span className="mr-3 select-none text-rp-data-dim">{s.n}</span>
                {s.text || " "}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
