"use client";

import * as React from "react";
import type { ExtractedRow, Period } from "@/lib/parser/types";
import { SectionHeader, DataCell } from "@/components/parser/ui/primitives";
import { useScale } from "@/components/parser/ScaleContext";
import { pl } from "@/lib/parser/copy.pl";
import { cn } from "@/lib/utils/cn";

type KindFilter = "all" | "income" | "balance" | "unknown";

/** PAS lettered totals (A./B./C. …) — slightly heavier weight for scanability. */
function isPasMajor(label: string): boolean {
  return /^(A|B|C|D|E|F|G|H)\.?\s+\S/.test(label.trim());
}

/** Drop Od/do date headers and tiny non-money noise for the default view. */
function looksLikeMoney(values: (number | null)[]): boolean {
  const nums = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length === 0) return false;
  const max = Math.max(...nums.map((v) => Math.abs(v)));
  // Full złoty filings: real lines are usually ≥ 100; date fragments are tiny.
  return max >= 100;
}

function isNoiseLabel(label: string): boolean {
  const t = label.trim().toLowerCase();
  if (t === "od" || t === "do") return true;
  if (/^załącznik|^wyszczególnienie|^stan na/.test(t)) return true;
  if (/^numer krs|^adres:|^nip|^regon/.test(t)) return true;
  return false;
}

function RowTable({
  rows,
  periods,
  fmt,
}: {
  rows: ExtractedRow[];
  periods: Period[];
  fmt: (v: number | null | undefined) => string;
}) {
  const colCount = periods.length > 0
    ? periods.length
    : Math.max(0, ...rows.map((r) => r.values.length));

  // Group separator when duration months change (Q2 block → H1 block).
  const groupBreakAfter = new Set<number>();
  for (let i = 0; i < periods.length - 1; i++) {
    if (periods[i].months !== periods[i + 1].months) groupBreakAfter.add(i);
  }

  return (
    <div className="mk-table-wrap">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-rp-surface-raised">
          <tr className="border-b border-rp-hairline">
            <th className="col-header sticky left-0 z-10 bg-rp-surface-raised py-2 pr-3 text-left">
              {pl.allRows.colLabel}
            </th>
            {Array.from({ length: colCount }).map((_, i) => (
              <th
                key={periods[i]?.key ?? i}
                className={cn(
                  "col-header whitespace-nowrap px-3 py-2 text-right",
                  groupBreakAfter.has(i - 1) && "border-l border-rp-hairline",
                )}
                title={periods[i]?.label}
              >
                {periods[i]?.short ?? `Kol. ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const major = isPasMajor(r.label);
            return (
              <tr
                key={`${r.lineIndex}-${r.label}`}
                className={cn(
                  "border-b border-rp-hairline/50 last:border-0",
                  major && "bg-rp-secondary/60",
                )}
              >
                <td
                  className={cn(
                    "sticky left-0 max-w-[280px] bg-rp-surface-raised py-1.5 pr-3 text-[13px] sm:max-w-[360px]",
                    major ? "font-medium text-rp-data" : "text-rp-data",
                  )}
                >
                  <span className="line-clamp-2" title={r.label}>{r.label}</span>
                </td>
                {Array.from({ length: colCount }).map((_, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-3 py-1.5",
                      groupBreakAfter.has(i - 1) && "border-l border-rp-hairline",
                    )}
                  >
                    <DataCell
                      value={fmt(r.values[i] ?? null)}
                      emphasis={periods[i]?.current || major}
                      className="block"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AllRowsView({
  rows,
  income,
  balance,
}: {
  rows: ExtractedRow[];
  income: Period[];
  balance: Period[];
}) {
  const { fmt, active } = useScale();
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [moneyOnly, setMoneyOnly] = React.useState(true);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== "all" && r.periodKind !== kind) return false;
      if (isNoiseLabel(r.label)) return false;
      if (moneyOnly && !looksLikeMoney(r.values)) return false;
      if (!r.values.some((v) => v !== null)) return false;
      if (needle && !r.label.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, kind, moneyOnly]);

  const incomeRows = filtered.filter((r) => r.periodKind === "income");
  const balanceRows = filtered.filter((r) => r.periodKind === "balance");
  const otherRows = filtered.filter((r) => r.periodKind === "unknown");

  const counts = React.useMemo(() => {
    const base = rows.filter((r) => !isNoiseLabel(r.label) && r.values.some((v) => v !== null));
    const applyMoney = (list: ExtractedRow[]) =>
      moneyOnly ? list.filter((r) => looksLikeMoney(r.values)) : list;
    return {
      all: applyMoney(base).length,
      income: applyMoney(base.filter((r) => r.periodKind === "income")).length,
      balance: applyMoney(base.filter((r) => r.periodKind === "balance")).length,
      unknown: applyMoney(base.filter((r) => r.periodKind === "unknown")).length,
    };
  }, [rows, moneyOnly]);

  const pills: { id: KindFilter; label: string; n: number }[] = [
    { id: "all", label: pl.allRows.kindAll, n: counts.all },
    { id: "income", label: pl.allRows.kindIncome, n: counts.income },
    { id: "balance", label: pl.allRows.kindBalance, n: counts.balance },
    { id: "unknown", label: pl.allRows.kindOther, n: counts.unknown },
  ];

  const sections: { key: string; title: string; rows: ExtractedRow[]; periods: Period[] }[] = [];
  if (kind === "all" || kind === "income") {
    if (incomeRows.length) sections.push({ key: "income", title: pl.allRows.sectionIncome, rows: incomeRows, periods: income });
  }
  if (kind === "all" || kind === "balance") {
    if (balanceRows.length) sections.push({ key: "balance", title: pl.allRows.sectionBalance, rows: balanceRows, periods: balance });
  }
  if (kind === "all" || kind === "unknown") {
    if (otherRows.length) sections.push({ key: "unknown", title: pl.allRows.sectionOther, rows: otherRows, periods: [] });
  }

  const shown = filtered.length;
  const LIMIT = 400;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <span className="mk-section-label">{pl.allRows.unit(shown)}</span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-rp-data-muted">
            <input
              type="checkbox"
              checked={moneyOnly}
              onChange={(e) => setMoneyOnly(e.target.checked)}
              className="h-3 w-3 accent-mk-primary"
            />
            {pl.allRows.moneyOnly}
          </label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={pl.allRows.filterPlaceholder}
            className="mk-input h-8 w-full max-w-xs py-0 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mk-seg">
          {pills.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setKind(p.id)}
              className={cn("mk-seg-btn gap-1.5", kind === p.id && "mk-seg-btn-active")}
            >
              {p.label}
              <span className="num text-rp-data-dim">{p.n}</span>
            </button>
          ))}
        </div>
        <span className="ml-auto overline">{active.unitLabel}</span>
      </div>

      {sections.length === 0 ? (
        <p className="py-10 text-center text-sm text-rp-data-muted">{pl.allRows.empty}</p>
      ) : (
        sections.map((sec) => {
          const slice = sec.rows.slice(0, kind === "all" ? Math.ceil(LIMIT / Math.max(sections.length, 1)) : LIMIT);
          return (
            <section key={sec.key} className="mk-card mk-card-pad space-y-2">
              <SectionHeader label={sec.title} unit={`${slice.length}${slice.length < sec.rows.length ? ` / ${sec.rows.length}` : ""}`} />
              <RowTable rows={slice} periods={sec.periods} fmt={fmt} />
              {slice.length < sec.rows.length && (
                <p className="text-[11px] text-rp-data-muted">
                  {pl.allRows.showing(slice.length, sec.rows.length)}
                </p>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
