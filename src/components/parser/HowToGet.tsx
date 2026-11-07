"use client";

// Instrukcja pod formularzem /parser (PS3b): skąd wziąć plik, który parser czyta najdokładniej (HTML z danymi XBRL),
// i uczciwie o PDF. Zwykłe linki: przeglądarka tylko nawiguje, żadnego fetcha do innych domen (CSP bez zmian).

import { FileCode2, ExternalLink } from "lucide-react";
import { pl } from "@/lib/parser/copy.pl";

export function HowToGet() {
  const h = pl.howTo;
  return (
    <div className="mk-card mk-card-pad mt-5 space-y-4 text-left">
      <div className="flex items-start gap-3">
        <FileCode2 className="mt-0.5 h-5 w-5 shrink-0 text-mk-primary" aria-hidden />
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-mk-text">{h.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-mk-muted">{h.lead}</p>
        </div>
      </div>
      <ol className="list-decimal space-y-1.5 pl-9 text-sm leading-relaxed text-mk-muted marker:text-mk-faint">
        {h.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <a
        href="https://www.sec.gov/edgar/search/"
        target="_blank"
        rel="noopener noreferrer"
        className="mk-btn min-h-11 w-full sm:w-auto"
      >
        {h.edgar}
        <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden />
      </a>
      <p className="text-sm leading-relaxed text-mk-muted">{h.gpw}</p>
      <details className="group rounded-lg border border-mk-border px-3.5 py-2.5">
        <summary className="min-h-[28px] cursor-pointer select-none text-sm font-medium text-mk-text">{h.pdfTitle}</summary>
        <p className="mt-2 text-sm leading-relaxed text-mk-muted">{h.pdfBody}</p>
      </details>
    </div>
  );
}
