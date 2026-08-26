"use client";

import * as React from "react";
import { FileBarChart2, FileText } from "lucide-react";
import { Badge } from "@/components/parser/ui/badge";
import { Skeleton } from "@/components/parser/ui/misc";
import { NoticeProvider, useNotify } from "@/components/parser/Notices";
import { ScaleProvider, ScaleToggle } from "@/components/parser/ScaleContext";
import { DocumentToc, type TocSection } from "@/components/parser/DocumentToc";
import { DocSection } from "@/components/parser/DocSection";
import { Disclosure } from "@/components/parser/Disclosure";
import { HeroKpis } from "@/components/parser/HeroKpis";
import { UploadZone, type UploadStatus } from "@/components/parser/UploadZone";
import { StatementTable } from "@/components/parser/StatementTable";
import { CostStructure, buildCostRows } from "@/components/parser/CostStructure";
import { Profitability } from "@/components/parser/Profitability";
import { AdvancedRatios } from "@/components/parser/AdvancedRatios";
import { SegmentsView } from "@/components/parser/SegmentsView";
import { ProductRevenueView } from "@/components/parser/ProductRevenueView";
import { NetCashCard, CapitalReturnsCard } from "@/components/parser/CashAndReturns";
import { PerShareRow } from "@/components/parser/PerShareRow";
import { OneOffBanner } from "@/components/parser/OneOffBanner";
import { RawTextInspector } from "@/components/parser/RawTextInspector";
import { AllRowsView } from "@/components/parser/AllRowsView";
import { ExportMenu } from "@/components/parser/ExportMenu";
import { SourceModal } from "@/components/parser/SourceModal";
import { pl } from "@/lib/parser/copy.pl";
import { chooseParseStrategy, isPdfFile, isTextFile } from "@/lib/parser/upload-strategy";
import type { Metric, MetricKey, ParseResult } from "@/lib/parser/types";

interface ApiOk {
  ok: true;
  fileName: string;
  fileSize: number;
  elapsedMs: number;
  result: ParseResult;
}

const INCOME_KEYS: MetricKey[] = [
  "revenue", "costOfRevenue", "grossProfit", "rAndD", "sellingMarketing", "generalAdmin",
  "sga", "totalOpEx", "operatingIncome", "otherIncome", "interestExpense", "incomeBeforeTax",
  "incomeTax", "netIncome",
];
const BALANCE_KEYS: MetricKey[] = [
  "totalCurrentAssets", "accountsReceivable", "inventories", "ppeNet", "goodwill", "intangiblesNet",
  "totalAssets", "totalCurrentLiabilities", "currentDebt", "longTermDebt", "totalDebt",
  "totalLiabilities", "totalEquity", "cash", "shortTermInvestments", "totalCashAndStInvestments",
];
const CASHFLOW_KEYS: MetricKey[] = [
  "ocf", "depreciationAmortization", "stockComp", "capex", "dividendsPaid", "buybacks",
];

const SAMPLES: { file: string; name: string; label: string }[] = [
  { file: "kombinat-konopny-2q2026.txt", name: "kombinat-konopny-2q2026.txt", label: "Kombinat Konopny" },
  { file: "microsoft-10q.pdf", name: "microsoft-10q.pdf", label: "Microsoft" },
  { file: "cipher-digital-10q.pdf", name: "cipher-digital-10q.pdf", label: "Cipher Digital" },
  { file: "coreweave-10q.pdf", name: "coreweave-10q.pdf", label: "CoreWeave" },
];

export default function ParserPage() {
  return (
    <NoticeProvider>
      <ParserView />
    </NoticeProvider>
  );
}

function ParserView() {
  const notify = useNotify();
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [data, setData] = React.useState<ApiOk | null>(null);
  const [sourceMetric, setSourceMetric] = React.useState<Metric | null>(null);

  const postAndApply = async (res: Response) => {
    const raw = await res.text();
    let json: { ok?: boolean; error?: string; detail?: string } & Partial<ApiOk>;
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch {
      if (res.status === 413) throw new Error(pl.toast.tooLarge);
      throw new Error(`${pl.toast.parseFailed} (HTTP ${res.status})`);
    }
    if (!res.ok || !json.ok) {
      const detail = typeof json?.detail === "string" && json.detail.trim() ? json.detail.trim() : "";
      const msg = json?.error || `Żądanie nie powiodło się (${res.status})`;
      throw new Error(detail ? `${msg} (${detail})` : msg);
    }
    setData(json as ApiOk);
    setStatus("done");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleFile = async (file: File) => {
    if (!isPdfFile(file) && !isTextFile(file)) {
      notify("error", pl.toast.needPdf);
      return;
    }
    const strategy = chooseParseStrategy(file);
    if (strategy === "reject-too-large") {
      notify("error", pl.toast.tooLarge);
      return;
    }
    setData(null);
    try {
      if (strategy === "client-extract") {
        setStatus("extracting");
        let text: string;
        let pages = 1;
        if (isPdfFile(file)) {
          const { extractPdfTextInBrowser } = await import("@/lib/parser/extract-browser");
          const extracted = await extractPdfTextInBrowser(file);
          text = extracted.text;
          pages = extracted.pages;
        } else {
          text = await file.text();
        }
        setStatus("parsing");
        const res = await fetch("/api/parser/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            pages,
            fileName: file.name,
            fileSize: file.size,
          }),
        });
        await postAndApply(res);
        return;
      }

      setStatus("uploading");
      const fd = new FormData();
      fd.append("file", file);
      setStatus("parsing");
      const res = await fetch("/api/parser/parse", { method: "POST", body: fd });
      await postAndApply(res);
    } catch (err) {
      console.error(err);
      setStatus("error");
      notify("error", err instanceof Error ? err.message : pl.toast.parseFailed);
    }
  };

  const reset = () => {
    setStatus("idle");
    setData(null);
  };

  const loadSample = async (file: string, name: string) => {
    try {
      const res = await fetch(`/parser-samples/${file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const type = /\.txt$/i.test(name) ? "text/plain" : "application/pdf";
      handleFile(new File([blob], name, { type }));
    } catch (err) {
      console.error(err);
      notify("error", pl.toast.sampleFailed);
    }
  };

  const result = data?.result ?? null;
  const pick = (keys: MetricKey[]): Metric[] =>
    result ? (keys.map((k) => result.metrics.find((m) => m.key === k)).filter(Boolean) as Metric[]) : [];

  const revenueAbs = React.useMemo(() => {
    if (!result) return null;
    const inc = result.detection.periods.income;
    const cur = inc.find((p) => p.current) ?? inc[0];
    const v = result.metrics.find((m) => m.key === "revenue")?.values.find((x) => x.periodKey === cur?.key)?.value;
    return v != null ? v * result.detection.unitScale : null;
  }, [result]);

  // Spis treści wymienia tylko to, co ten konkretny raport faktycznie zawiera.
  const sections: TocSection[] = React.useMemo(() => {
    if (!result) return [];
    const has = (keys: MetricKey[]) =>
      keys.some((k) => result.metrics.find((m) => m.key === k)?.values.some((v) => v.value !== null));
    const list: TocSection[] = [{ id: "przeglad", label: "Przegląd" }];
    if (has(INCOME_KEYS)) list.push({ id: "rzis", label: pl.statements.income });
    if (buildCostRows(result, result.detection.periods.income).length > 0) {
      list.push({ id: "koszty", label: "Struktura kosztów" });
    }
    if (result.derived.ratios.length || result.derived.fcf.length) {
      list.push({ id: "rentownosc", label: "Rentowność" });
    }
    if (result.derived.advanced.length) list.push({ id: "wskazniki", label: "Wskaźniki" });
    if (has(BALANCE_KEYS)) list.push({ id: "bilans", label: pl.statements.balance });
    if (has(CASHFLOW_KEYS) || result.netCash) list.push({ id: "przeplywy", label: "Przepływy i dług" });
    if (result.segments || result.productRevenue) list.push({ id: "segmenty", label: "Segmenty i produkty" });
    list.push({ id: "wiersze", label: "Wszystkie wiersze" });
    list.push({ id: "zrodlo", label: "Surowy tekst" });
    return list;
  }, [result]);

  const busy = status === "parsing" || status === "uploading" || status === "extracting";

  // ── Widok startowy: tylko wgrywanie ────────────────────────────
  if (!result && !busy) {
    return (
      <div className="rp-root mk-fade-in mx-auto max-w-[720px] py-6">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mk-primary-soft text-mk-primary">
            <FileBarChart2 className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-mk-text sm:text-4xl">
            Parser raportów
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mk-muted">
            {status === "error" ? pl.empty.errorTitle : pl.empty.body}
          </p>
        </div>

        <UploadZone
          status={status}
          onFile={handleFile}
          onReset={reset}
          samples={SAMPLES}
          onSample={loadSample}
        />

        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          <Badge variant="outline">{pl.app.badgeLocal}</Badge>
          <Badge variant="neutral">{pl.app.badgeNoLlm}</Badge>
        </div>
      </div>
    );
  }

  // ── Widok wczytywania ──────────────────────────────────────────
  if (busy) {
    const busyLabel =
      status === "extracting"
        ? pl.upload.extractingLocal
        : status === "uploading"
          ? pl.upload.uploading
          : pl.upload.parsing;
    return (
      <div className="rp-root mk-fade-in mx-auto max-w-[860px] space-y-5 py-6">
        <p className="text-sm font-medium text-mk-muted">{busyLabel}</p>
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mk-card mk-card-pad">
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
        <div className="mk-card mk-card-pad">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  const inc = result.detection.periods.income;
  const bal = result.detection.periods.balance;
  const currentPeriod = inc.find((p) => p.current) ?? inc[0];

  return (
    <div className="rp-root mk-fade-in">
      <ScaleProvider
        reportUnitScale={result.detection.unitScale}
        currency={result.detection.currency}
        revenueAbs={revenueAbs}
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[248px_minmax(0,1fr)]">

          {/* ── Spis treści ─────────────────────────────────────── */}
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <DocumentToc sections={sections} />
            <div className="my-5 h-px bg-mk-border" />
            <button type="button" onClick={reset} className="mk-btn w-full">
              Wczytaj inny raport
            </button>
          </aside>

          {/* ── Dokument ────────────────────────────────────────── */}
          <div className="min-w-0 max-w-[860px] space-y-10">

            <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-mk-border bg-mk-surface px-3.5 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-mk-faint" aria-hidden />
              <span className="min-w-0 truncate text-[13px] font-medium text-mk-text">
                {data?.fileName}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-3">
                <ScaleToggle />
                <ExportMenu result={result} />
              </div>
            </div>

            <DocSection
              id="przeglad"
              title={result.detection.issuer ?? "Przegląd"}
              aside={currentPeriod?.short}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                {result.detection.formType && (
                  <span className="mk-tag-brand">{result.detection.formType}</span>
                )}
                <span className="text-[12px] font-semibold tracking-[0.04em] text-mk-muted">
                  {currentPeriod?.label}
                </span>
              </div>
              <HeroKpis result={result} />
              <OneOffBanner oneOff={result.oneOff} />
            </DocSection>

            <StatementTable
              id="rzis"
              title={pl.statements.income}
              metrics={pick(INCOME_KEYS)}
              periods={inc}
              onSource={setSourceMetric}
            />

            <CostStructure result={result} periods={inc} />

            <Profitability derived={result.derived} periods={inc} />

            {result.derived.advanced.length > 0 && (
              <DocSection id="wskazniki" title="Wskaźniki" aside={pl.ratios.advancedUnit}>
                <div className="mt-4">
                  <AdvancedRatios ratios={result.derived.advanced} />
                </div>
              </DocSection>
            )}

            <PerShareRow perShare={result.perShare} currency={result.detection.currency} />

            <StatementTable
              id="bilans"
              title={pl.statements.balance}
              metrics={pick(BALANCE_KEYS)}
              periods={bal}
              onSource={setSourceMetric}
            />

            <DocSection id="przeplywy" title="Przepływy i dług">
              <div className="mt-4 space-y-6">
                <StatementTable
                  bare
                  metrics={pick(CASHFLOW_KEYS)}
                  periods={inc}
                  onSource={setSourceMetric}
                />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <NetCashCard netCash={result.netCash} />
                  <CapitalReturnsCard cr={result.capitalReturns} />
                </div>
              </div>
            </DocSection>

            {(result.segments || result.productRevenue) && (
              <DocSection id="segmenty" title="Segmenty i produkty">
                <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <SegmentsView segments={result.segments} />
                  <ProductRevenueView product={result.productRevenue} />
                </div>
              </DocSection>
            )}

            <Disclosure
              id="wiersze"
              title="Wszystkie wiersze"
              aside="prosto z dokumentu"
              summary={`Parser opisał ${result.extractedRows.length} wierszy liczbowych — znacznie więcej niż pozycje pokazane wyżej.`}
              openLabel="Pokaż wszystkie wiersze"
            >
              <AllRowsView rows={result.extractedRows} income={inc} balance={bal} />
            </Disclosure>

            <Disclosure
              id="zrodlo"
              title="Surowy tekst"
              aside="po ekstrakcji z pliku"
              summary={`${result.charCount.toLocaleString("pl-PL")} znaków odtworzonych z układu dokumentu — źródło każdej liczby powyżej.`}
              openLabel="Pokaż tekst źródłowy"
            >
              <RawTextInspector text={result.rawText} />
            </Disclosure>
          </div>
        </div>
      </ScaleProvider>

      <SourceModal metric={sourceMetric} rawText={result.rawText} onClose={() => setSourceMetric(null)} />
    </div>
  );
}
