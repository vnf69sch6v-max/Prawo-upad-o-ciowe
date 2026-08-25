"use client";

import * as React from "react";
import { UploadCloud, FileText, Loader2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fmtBytes } from "@/lib/parser/format";
import { pl } from "@/lib/parser/copy.pl";

export type UploadStatus = "idle" | "dragging" | "uploading" | "parsing" | "done" | "error";

export function UploadZone({
  status,
  fileName,
  fileSize,
  onFile,
  onReset,
  samples,
  onSample,
}: {
  status: UploadStatus;
  fileName?: string;
  fileSize?: number;
  onFile: (file: File) => void;
  onReset: () => void;
  samples?: { file: string; name: string; label: string }[];
  onSample?: (file: string, name: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const busy = status === "uploading" || status === "parsing";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={busy ? (e) => e.preventDefault() : handleDrop}
      onClick={() => !busy && inputRef.current?.click()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-mk)] border border-dashed bg-rp-surface-raised px-4 py-8 text-center transition-colors",
        drag ? "border-mk-primary bg-mk-primary-soft" : "border-mk-border-strong hover:border-mk-primary hover:bg-mk-surface-alt",
        busy && "cursor-default",
        status === "error" && "border-rp-warn/40 bg-rp-warn/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,text/plain,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      {status === "idle" || status === "dragging" ? (
        <>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-mk-primary-soft text-mk-primary">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-rp-data">{pl.upload.drop}</p>
          <p className="mt-1 text-xs text-rp-data-muted">{pl.upload.browse}</p>
          {onSample && samples && samples.length > 0 && (
            <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
              <p className="overline mb-2 text-center">{pl.upload.sampleHint}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {samples.map((s) => (
                  <button
                    key={s.file}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSample(s.file, s.name);
                    }}
                    className="mk-btn px-2 py-1 text-[11px]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : busy ? (
        <>
          <Loader2 className="mb-3 h-7 w-7 animate-spin text-mk-primary" />
          <p className="text-sm font-medium text-rp-data">
            {status === "uploading" ? pl.upload.uploading : pl.upload.parsing}
          </p>
          <p className="mt-1 max-w-[14rem] truncate text-xs text-rp-data-muted">{fileName}</p>
        </>
      ) : status === "done" ? (
        <>
          <Check className="mb-3 h-7 w-7 text-mk-positive" />
          <p className="max-w-[14rem] truncate text-sm font-medium text-rp-data">{fileName}</p>
          <p className="mt-1 text-xs text-rp-data-muted">
            {fileSize ? fmtBytes(fileSize) : ""} · {pl.upload.parsed}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="mt-3 text-xs text-rp-data-muted underline-offset-2 hover:text-rp-data hover:underline"
          >
            {pl.upload.uploadAnother}
          </button>
        </>
      ) : (
        <>
          <AlertTriangle className="mb-3 h-7 w-7 text-rp-warn" />
          <p className="text-sm font-medium text-rp-data">{pl.upload.uploadFailed}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="mt-2 text-xs text-rp-data-muted underline-offset-2 hover:text-rp-data hover:underline"
          >
            {pl.upload.tryAgain}
          </button>
        </>
      )}

      {status === "done" && fileName && (
        <div className="mt-4 flex w-full items-center gap-2 rounded-lg border border-rp-hairline bg-rp-secondary/40 px-3 py-2 text-left">
          <FileText className="h-4 w-4 shrink-0 text-rp-data-muted" />
          <span className="truncate text-xs text-rp-data">{fileName}</span>
        </div>
      )}
    </div>
  );
}
