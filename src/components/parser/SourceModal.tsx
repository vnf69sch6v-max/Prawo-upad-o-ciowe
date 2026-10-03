"use client";

import * as React from "react";
import { X, FileSearch } from "lucide-react";
import { Badge } from "@/components/parser/ui/badge";
import { metricLabelPl, pl } from "@/lib/parser/copy.pl";
import type { Metric } from "@/lib/parser/types";

/**
 * Provenance: show the exact extracted line(s) a metric was read from.
 * Telefon: arkusz od dołu (uchwyt, safe area, zamknięcie tłem / Esc / przyciskiem 44 px),
 * od `sm` — okno na środku jak dotąd.
 */
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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={metricLabelPl(metric.key, metric.label)}
        className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-2xl border border-rp-hairline bg-rp-surface-raised pb-[env(safe-area-inset-bottom)] shadow-xl sm:max-h-[80vh] sm:rounded-xl sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-rp-hairline" />
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-rp-hairline py-2 pl-4 pr-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileSearch className="h-4 w-4 shrink-0 text-rp-data-muted" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{metricLabelPl(metric.key, metric.label)}</p>
              <p className="text-xs text-rp-data-muted sm:text-[11px]">
                {pl.source.sourceLine(idx >= 0 ? String(idx + 1) : "?")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-rp-data-muted hover:text-rp-data active:bg-rp-secondary"
          >
            <X className="h-5 w-5" aria-hidden />
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
          <pre className="num overflow-x-auto overscroll-x-contain rounded-lg border border-rp-hairline bg-rp-surface p-3 text-xs leading-relaxed sm:text-[11px]">
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
