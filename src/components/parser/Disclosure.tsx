"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { DocSection } from "@/components/parser/DocSection";

/**
 * Sekcja zwinięta domyślnie — dla materiału źródłowego (250 wierszy, pełny
 * tekst), który ma być pod ręką, ale nie ma prawa rozdymać dokumentu ani
 * spowalniać pierwszego renderu. Treść montuje się dopiero po rozwinięciu.
 */
export function Disclosure({
  id,
  title,
  aside,
  summary,
  openLabel,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  /** Zdanie widoczne w stanie zwiniętym — mówi, co jest w środku. */
  summary: string;
  openLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DocSection id={id} title={title} aside={aside}>
      {open ? (
        <div className="mt-4">{children}</div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-[14px] text-mk-muted">{summary}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls={`${id}-tresc`}
            className="mk-btn ml-auto"
          >
            {openLabel}
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
      {open && <div id={`${id}-tresc`} className="sr-only" />}
    </DocSection>
  );
}
