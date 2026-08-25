import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Wspólne prymitywy prezentacyjne. Widoki komponują te elementy i nigdy nie
 * zapisują koloru ani rozmiaru na sztywno — system wizualny mieszka tutaj oraz
 * w warstwie tokenów (globals.css, sekcja PARSER RAPORTÓW).
 */

export function SectionHeader({
  icon,
  label,
  unit,
  action,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  unit?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between border-b border-rp-hairline pb-2", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-mk-primary">{icon}</span>}
        <h2 className="mk-section-label">{label}</h2>
      </div>
      <div className="flex items-center gap-3">
        {unit && <span className="overline">{unit}</span>}
        {action}
      </div>
    </div>
  );
}

/** Kafelek KPI — jedyne miejsce, gdzie wolno użyć dużych (28 px) liczb. */
export function Metric({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="overline">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="t-metric">{value}</span>
        {unit && <span className="t-label">{unit}</span>}
      </div>
      {sub !== undefined && <span className="t-label">{sub}</span>}
    </div>
  );
}

/** Komórka liczbowa: mono, tabularna, wyrównana do prawej; nacisk przez kontrast. */
export function DataCell({
  value,
  emphasis = false,
  className,
}: {
  value: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("cell text-right", emphasis ? "font-medium text-rp-data" : "text-rp-data-muted", className)}>
      {value}
    </span>
  );
}

export type DeltaDirection = "auto" | "neutral";

/**
 * Delta o stałej szerokości. Zieleń/czerwień tylko wtedy, gdy kierunek coś
 * znaczy (auto); niejednoznaczny (koszt, capex, dług) dostaje szarość i brak
 * strzałki. Brak danych → przygaszona pauza.
 */
export function Delta({
  value,
  direction = "auto",
  className,
}: {
  value: number | null | undefined;
  direction?: DeltaDirection;
  className?: string;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className={cn("num inline-block w-[4.5rem] text-right text-rp-data-dim", className)}>—</span>;
  }
  const up = value >= 0;
  const neutral = direction === "neutral";
  const color = neutral ? "text-rp-dir-neutral" : up ? "text-rp-dir-up" : "text-rp-dir-down";
  return (
    <span className={cn("num inline-block w-[4.5rem] text-right", color, className)}>
      {!neutral && <span className="mr-0.5">{up ? "▲" : "▼"}</span>}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/** Karta — biała powierzchnia Savori (mk-card), używana dla realnych kart. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mk-card min-w-0", className)}>{children}</div>;
}
