import { cn } from "@/lib/utils/cn";
import { pl } from "@/lib/parser/copy.pl";
import type { Confidence } from "@/lib/parser/types";

const MAP: Record<Confidence, { dot: string; text: string; label: string }> = {
  HIGH: { dot: "bg-rp-data", text: "text-rp-data", label: pl.confidence.HIGH },
  MEDIUM: { dot: "bg-rp-data-muted", text: "text-rp-data-muted", label: pl.confidence.MEDIUM },
  LOW: { dot: "bg-rp-data-dim", text: "text-rp-data-dim", label: pl.confidence.LOW },
};

export function ConfidenceDot({ level, title }: { level: Confidence; title?: string }) {
  const m = MAP[level];
  return (
    <span
      title={pl.confidence.title(m.label, title)}
      className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", m.dot)}
    />
  );
}

export function ConfidenceLabel({ level }: { level: Confidence }) {
  const m = MAP[level];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider", m.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
