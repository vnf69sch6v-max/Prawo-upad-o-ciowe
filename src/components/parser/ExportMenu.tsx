"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { useNotify } from "@/components/parser/Notices";
import { pl } from "@/lib/parser/copy.pl";
import type { ParseResult } from "@/lib/parser/types";

const FORMATS: { id: "csv" | "xlsx" | "json"; label: string }[] = [
  { id: "csv", label: "CSV" },
  { id: "xlsx", label: "XLSX" },
  { id: "json", label: "JSON" },
];

export function ExportMenu({ result }: { result: ParseResult }) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const notify = useNotify();

  const download = async (format: "csv" | "xlsx" | "json") => {
    setBusy(format);
    try {
      const res = await fetch("/api/parser/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: { ...result, rawText: "" }, format }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const name = /filename="([^"]+)"/.exec(cd)?.[1] ?? `report-export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify("success", pl.toast.exportOk(name));
    } catch (err) {
      console.error(err);
      notify("error", pl.toast.exportFail);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5" aria-label={pl.export.aria}>
      <Download className="h-3.5 w-3.5 text-mk-faint" aria-hidden />
      <div className="mk-seg">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            disabled={busy !== null}
            onClick={() => download(f.id)}
            className="mk-seg-btn gap-1"
          >
            {busy === f.id ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
