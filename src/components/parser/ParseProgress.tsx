"use client";

// Karty ścieżki przeglądarkowej /parser (docs/specs/2026-11-07-parser-w-przegladarce.md): postęp z „Anuluj”
// i błąd z „Przetwórz na serwerze” — ten przycisk to JEDYNE miejsce, z którego treść pliku może opuścić urządzenie.

import { FileText } from "lucide-react";
import { fmtBytes } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";
import type { ServerFallback } from "@/lib/parser/upload-strategy";

export type ParsePhase = { kind: "read"; page: number; pages: number } | { kind: "read-text" } | { kind: "parse" };

export function ParseProgressCard({
  fileName, fileSize, phase, onCancel,
}: { fileName: string; fileSize: number; phase: ParsePhase; onCancel: () => void }) {
  // Zanim pdfjs poda liczbę stron, „Czytam stronę 0 z 0” byłoby nieprawdą.
  const label =
    phase.kind === "read" && phase.pages > 0 ? pl.progress.reading(phase.page, phase.pages)
      : phase.kind === "parse" ? pl.progress.analysing
        : pl.progress.readingText;
  const pct = phase.kind === "read" && phase.pages > 0 ? Math.round((phase.page / phase.pages) * 100) : null;
  return (
    <div className="mk-card mk-card-pad space-y-4">
      <div className="flex min-w-0 items-center gap-2 text-[13px] text-mk-muted">
        <FileText className="h-4 w-4 shrink-0 text-mk-faint" aria-hidden />
        <span className="min-w-0 truncate font-medium text-mk-text" title={fileName}>{fileName}</span>
        <span className="shrink-0">{fmtBytes(fileSize)}</span>
      </div>
      <p className="text-lg font-semibold text-mk-text" data-testid="parse-phase">{label}</p>
      {/* Fazę ogłaszamy czytnikom ekranu, pojedynczych stron nie. */}
      <span className="sr-only" aria-live="polite">{phase.kind === "parse" ? pl.progress.analysing : pl.progress.readingText}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={pct === null ? undefined : 0}
        aria-valuemax={pct === null ? undefined : 100}
        aria-valuenow={pct ?? undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-mk-surface-alt"
      >
        <div
          className={pct === null ? "h-full w-1/3 animate-pulse rounded-full bg-mk-primary" : "h-full rounded-full bg-mk-primary transition-[width] duration-150"}
          style={pct === null ? undefined : { width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-mk-muted">{pl.progress.hint}</p>
        <button type="button" onClick={onCancel} className="mk-btn min-h-11 w-full shrink-0 lg:w-auto">
          {pl.progress.cancel}
        </button>
      </div>
    </div>
  );
}

export function ParseFailureCard({
  message, fallback, sendBytes, onServer, onOther,
}: {
  message: string;
  fallback: ServerFallback;
  /** Rozmiar tego, co wyślemy: plik albo odczytany tekst. */
  sendBytes: number;
  onServer: () => void;
  onOther: () => void;
}) {
  return (
    <div className="mk-card mk-card-pad mb-5 space-y-3" role="alert">
      <p className="text-[15px] font-medium text-mk-text">{message}</p>
      {fallback ? (
        <p className="text-sm text-mk-muted">
          {fallback === "file" ? pl.failure.sendFile(fmtBytes(sendBytes)) : pl.failure.sendText(fmtBytes(sendBytes))}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 lg:flex-row lg:justify-end">
        {fallback ? (
          <button type="button" onClick={onServer} className="mk-btn mk-btn-primary min-h-11 w-full lg:w-auto">
            {pl.failure.server}
          </button>
        ) : null}
        <button type="button" onClick={onOther} className="mk-btn min-h-11 w-full lg:w-auto">
          {pl.failure.other}
        </button>
      </div>
    </div>
  );
}
