import * as React from "react";
import { cn } from "@/lib/utils/cn";

// Odznaki są domyślnie neutralne — „uzgodnione / zaliczone" NIE są malowane na
// zielono. Jedyny kolorowy wariant to `warn` (bursztyn), zarezerwowany dla
// prawdziwych ostrzeżeń.
const VARIANTS = {
  default: "border-rp-hairline bg-rp-surface-raised text-rp-data-muted",
  outline: "border-rp-hairline text-rp-data-muted",
  neutral: "border-rp-hairline bg-rp-surface-raised text-rp-data",
  warn: "border-rp-warn/30 bg-rp-warn/10 text-rp-warn",
  // stare nazwy zmapowane na neutralne, żeby starsze wywołania trzymały kontrakt
  success: "border-rp-hairline bg-rp-surface-raised text-rp-data-muted",
  accent: "border-rp-hairline bg-rp-surface-raised text-rp-data",
  warning: "border-rp-warn/30 bg-rp-warn/10 text-rp-warn",
  danger: "border-rp-hairline text-rp-data-muted",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
