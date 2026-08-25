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
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-data-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={pl.raw.search}
            className="h-9 w-full rounded-lg border border-rp-hairline bg-rp-surface-raised pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-rp-data/30"
          />
        </div>
        <span className="shrink-0 text-xs text-rp-data-muted">
          {pl.raw.lines(filtered.length, lines.length)}
        </span>
      </div>
      <div className="max-h-[70vh] overflow-auto rounded-xl border border-rp-hairline bg-rp-surface-raised">
        <pre className="num whitespace-pre-wrap p-3 text-[11px] leading-relaxed">
          {filtered.map(([n, l]) => (
            <div key={n} className="flex gap-3 hover:bg-rp-secondary/40">
              <span className="w-10 shrink-0 select-none text-right text-rp-data-muted/50">{n}</span>
              <span className="text-rp-data/90">{l || " "}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
