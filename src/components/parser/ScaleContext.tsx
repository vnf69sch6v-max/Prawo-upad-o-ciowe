"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  resolveScale,
  formatScaled,
  SCALE_OPTIONS,
  defaultScaleMode,
  type ActiveScale,
  type ScaleMode,
  type FormatOpts,
} from "@/lib/parser/scale";

interface ScaleCtx {
  mode: ScaleMode;
  setMode: (m: ScaleMode) => void;
  active: ActiveScale;
  /** Format a reported money value at the active scale. */
  fmt: (v: number | null | undefined, opts?: FormatOpts) => string;
  currency: string;
}

const Ctx = React.createContext<ScaleCtx | null>(null);

export function ScaleProvider({
  reportUnitScale,
  currency,
  revenueAbs,
  children,
}: {
  reportUnitScale: number;
  currency: string | null;
  revenueAbs: number | null;
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<ScaleMode>(() => defaultScaleMode(reportUnitScale));
  const active = React.useMemo(
    () => resolveScale(mode, reportUnitScale, currency, revenueAbs),
    [mode, reportUnitScale, currency, revenueAbs],
  );
  const fmt = React.useCallback(
    (v: number | null | undefined, opts?: FormatOpts) => formatScaled(v, active, opts),
    [active],
  );
  const value = React.useMemo(
    () => ({ mode, setMode, active, fmt, currency: currency ?? "USD" }),
    [mode, active, fmt, currency],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useScale(): ScaleCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useScale must be used within ScaleProvider");
  return ctx;
}

export function ScaleToggle() {
  const { mode, setMode, active } = useScale();
  return (
    <div className="flex items-center gap-2">
      <span className="mk-label hidden sm:inline">{active.unitLabel}</span>
      <div className="mk-seg">
        {SCALE_OPTIONS.map((o) => (
          <button
            key={o.mode}
            type="button"
            onClick={() => setMode(o.mode)}
            className={cn("mk-seg-btn", mode === o.mode && "mk-seg-btn-active")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
