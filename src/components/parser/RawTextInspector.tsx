"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { pl } from "@/lib/parser/copy.pl";

export function RawTextInspector({ text }: { text: string }) {
  const [q, setQ] = React.useState("");
  const lines = React.useMemo(() => text.split("\n"), [text]);
  const filtered = React.useMemo(() => {
    if (!q.trim()) return lines.map((l, i) => [i + 1, l] as const);
    const needle = q.toLowerCase();
    return lines
      .map((l, i) => [i + 1, l] as const)
      .filter(([, l]) => l.toLowerCase().includes(needle));
  }, [lines, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-data-muted" aria-hidden />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={pl.raw.search}
            aria-label={pl.raw.search}
            className="h-11 w-full rounded-lg border border-rp-hairline bg-rp-surface-raised pl-9 pr-3 text-base outline-none focus:ring-2 focus:ring-rp-data/30 sm:h-9 sm:text-sm"
          />
        </div>
        <span className="shrink-0 text-xs text-rp-data-muted">
          {pl.raw.lines(filtered.length, lines.length)}
        </span>
      </div>
      <div className="max-h-[60vh] overflow-auto overscroll-contain rounded-xl border border-rp-hairline bg-rp-surface-raised sm:max-h-[70vh]">
        <pre className="num whitespace-pre-wrap break-words p-3 text-xs leading-relaxed sm:text-[11px]">
          {filtered.map(([n, l]) => (
            <div key={n} className="flex gap-2 hover:bg-rp-secondary/40 sm:gap-3">
              <span className="w-8 shrink-0 select-none text-right text-rp-data-muted/50 sm:w-10">{n}</span>
              <span className="min-w-0 text-rp-data/90">{l || " "}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
