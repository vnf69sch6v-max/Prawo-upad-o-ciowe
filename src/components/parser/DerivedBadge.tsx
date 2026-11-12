"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useScale } from "@/components/parser/ScaleContext";
import { pl } from "@/lib/parser/copy.pl";
import { DERIVED_FORMULAS, type DerivedInput, type DerivedKey } from "@/lib/parser/derived-meta";

/**
 * PS3b-2c: plakietka „wyliczone” przy liczbie, której nie ma w sprawozdaniu. Klik/dotyk otwiera wzór i składniki;
 * Esc albo klik poza zamyka i oddaje fokus plakietce. Cel dotyku 44 px tylko na dotyku (`touch:`), żeby nie rozpychać tabel.
 */
export function DerivedBadge({ k, inputs, period }: { k: DerivedKey; inputs?: DerivedInput[]; period?: string }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const pop = React.useRef<HTMLSpanElement>(null);
  const btn = React.useRef<HTMLButtonElement>(null);
  const box = React.useRef<HTMLSpanElement>(null);
  const id = React.useId();
  const { fmt } = useScale();
  const f = DERIVED_FORMULAS[k];

  React.useEffect(() => {
    if (!open) return;
    const close = (refocus: boolean) => { setOpen(false); if (refocus) btn.current?.focus(); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !pop.current?.contains(t)) close(false);
    };
    const onScroll = () => close(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <span ref={box} className="relative inline-flex align-middle">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${pl.derived.badge}: ${f.labelPl}`}
        onClick={() => {
          // Tabele parsera przewijają się w poziomie (overflow), więc dymek idzie przez portal z pozycją `fixed`.
          const r = btn.current?.getBoundingClientRect();
          if (r) setPos({ top: r.bottom + 4, left: Math.max(8, Math.min(r.left, window.innerWidth - 296)) });
          setOpen((o) => !o);
        }}
        className="group inline-flex items-center text-[10px] font-semibold normal-case tracking-normal text-rp-data-muted hover:text-rp-data touch:-my-3 touch:min-h-[44px] touch:px-1"
      >
        <span className="rounded border border-rp-hairline px-1 leading-4 group-hover:border-rp-data-muted">{pl.derived.badge}</span>
      </button>
      {open && pos && createPortal(
        <span
          ref={pop}
          id={id}
          role="note"
          style={{ top: pos.top, left: pos.left }}
          className="rp-root fixed z-[70] block w-[min(18rem,calc(100vw-1rem))] rounded-lg border border-rp-hairline bg-rp-surface-raised p-3 text-left text-[12px] font-normal normal-case leading-snug tracking-normal text-rp-data shadow-lg"
        >
          <span className="block font-semibold">{f.labelPl}{period ? ` · ${period}` : ""}</span>
          <span className="mt-1 block text-rp-data-muted">{f.formulaPl}</span>
          {inputs && inputs.length > 0 && (
            <span className="mt-2 block space-y-0.5">
              {inputs.map((i) => (
                <span key={i.label} className="flex justify-between gap-3">
                  <span className="text-rp-data-muted">{i.label}</span>
                  <span className="num">{fmt(i.value, { unit: true })}</span>
                </span>
              ))}
            </span>
          )}
        </span>,
        document.body,
      )}
    </span>
  );
}
