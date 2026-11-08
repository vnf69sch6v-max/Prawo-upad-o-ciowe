"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, X } from "lucide-react";
import { pl } from "@/lib/parser/copy.pl";
import { summarizeValidation, type ValidationItem } from "@/lib/parser/validation-view";
import type { ParseResult } from "@/lib/parser/types";

// PS3b-2a: wynik kontroli spójności na pierwszym ekranie. Stan BŁĄD to baner NAD kaflami, stan OK to jedna linia POD nimi
// (`variant`); w danym wyniku renderuje się tylko jeden z nich, więc wystarczy jeden `useState` na komponent.
export function ValidationStatus({ result, variant }: { result: ParseResult; variant: "banner" | "line" }) {
  const [open, setOpen] = useState(false);
  const v = summarizeValidation(result.validation, result.detection);
  if (v.state === "none") return null;
  if (v.state === "fail" && variant !== "banner") return null;
  if (v.state === "ok" && variant !== "line") return null;

  const button = (label: string) => (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-1 inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 text-[12px] font-semibold text-mk-muted hover:text-rp-data lg:min-h-0 lg:px-1"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
  );
  const list = (items: ValidationItem[]) => (
    <>
      {open && (
        <ul className="mt-2 space-y-2">
          {items.map((i, n) => (
            <li key={n} className="flex items-start gap-2 text-[12px] leading-snug">
              {i.passed ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rp-data-dim" aria-label={pl.validation.okMark} />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rp-warn" aria-label={pl.validation.failMark} />
              )}
              <span className="min-w-0 break-words">
                <span className="text-rp-data">{i.namePl}</span>
                <span className="num block text-rp-data-muted">{i.equationPl}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && <p className="mt-2 text-[11px] leading-relaxed text-rp-data-dim">{pl.validation.unitNote(v.unitNote)}</p>}
    </>
  );

  if (v.state === "fail") {
    return (
      <div className="rounded-lg border border-rp-warn/30 bg-rp-warn/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rp-warn/30 bg-rp-warn/10">
            <AlertTriangle className="h-4 w-4 text-rp-warn" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-rp-warn">{pl.validation.failTitle(v.failed.length, v.total)}</p>
            <ul className="mt-2 space-y-2">
              {v.failed.map((i, n) => (
                <li key={n} className="text-[12px] leading-snug break-words">
                  <span className="text-rp-data">{i.namePl}</span>
                  <span className="num block text-rp-data-muted">{i.equationPl}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-rp-data/80">{pl.validation.failBody}</p>
            {button(open ? pl.validation.hideAll : pl.validation.showAll)}
            {list(v.items)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-mk-muted">
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{pl.validation.okLine(v.passed, v.total)}</span>
        {button(open ? pl.validation.hide : pl.validation.show)}
      </div>
      {list(v.items)}
    </div>
  );
}
