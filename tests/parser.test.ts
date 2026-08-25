// tests/parser.test.ts
// Correctness proof: the SAME parser must read two structurally different real
// filings. Microsoft (profitable, 4 columns, "Gross margin"/"Net income",
// per-segment blocks) is checked against the published ground truth. Cipher
// Digital (loss-making, 2 columns, "Net loss", "Revenue - bitcoin mining",
// December year-end) proves the logic is not overfit to one issuer.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { parseReport } from "@/lib/parser/parser";
import { toCSV, buildExportTables } from "@/lib/parser/export";
import type { MetricKey, ParseResult } from "@/lib/parser/types";

function parseFixture(name: string): ParseResult {
  const text = readFileSync(resolve(process.cwd(), "tests/fixtures", name), "utf8");
  return parseReport({ text, pages: 1, charCount: text.length });
}

/** All column values of a metric, in detected period order. */
function values(r: ParseResult, key: MetricKey): (number | null)[] {
  const m = r.metrics.find((x) => x.key === key);
  return m ? m.values.map((v) => v.value) : [];
}
function confidence(r: ParseResult, key: MetricKey): string | undefined {
  return r.metrics.find((x) => x.key === key)?.confidence;
}

const MSFT = parseFixture("microsoft-10q.txt");
const CIPHER = parseFixture("cipher-digital-10q.txt");
const NVDA = parseFixture("nvidia-10q.txt");

describe("Microsoft 10-Q — ground truth", () => {
  it("detects the filing context", () => {
    expect(MSFT.detection.formType).toBe("SEC 10-Q");
    expect(MSFT.detection.issuer).toBe("Microsoft Corporation");
    expect(MSFT.detection.structureLabel).toBe("SEC 10-Q · Microsoft Corporation");
    expect(MSFT.detection.currency).toBe("USD");
    expect(MSFT.detection.unitLabel).toBe("in millions");
    expect(MSFT.detection.fiscalYearEndMonth).toBe(6);
  });

  it("labels periods with descriptors, never COL N", () => {
    const labels = [
      ...MSFT.detection.periods.income,
      ...MSFT.detection.periods.balance,
    ].flatMap((p) => [p.label, p.short]);
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) expect(l).not.toMatch(/COL\s*\d/i);
    expect(MSFT.detection.periods.income.map((p) => p.short)).toEqual([
      "Q3 FY26",
      "Q3 FY25",
      "9M FY26",
      "9M FY25",
    ]);
  });

  it("matches all 11 headline metrics", () => {
    expect(MSFT.matchedCount).toBe(11);
  });

  it("income statement — exact values (3M/3M/9M/9M)", () => {
    expect(values(MSFT, "revenue")).toEqual([82886, 70066, 241832, 205283]);
    expect(values(MSFT, "costOfRevenue")).toEqual([26828, 21919, 76849, 63817]);
    expect(values(MSFT, "grossProfit")).toEqual([56058, 48147, 164983, 141466]);
    expect(values(MSFT, "operatingIncome")).toEqual([38398, 32000, 114634, 94205]);
    expect(values(MSFT, "netIncome")).toEqual([31778, 25824, 97983, 74599]);
  });

  it("income statement metrics are HIGH confidence", () => {
    for (const k of ["revenue", "costOfRevenue", "grossProfit", "operatingIncome", "netIncome"] as MetricKey[]) {
      expect(confidence(MSFT, k)).toBe("HIGH");
    }
  });

  it("balance sheet — exact values (Mar 31 2026 / Jun 30 2025)", () => {
    expect(values(MSFT, "totalAssets")).toEqual([694228, 619003]);
    expect(values(MSFT, "totalEquity")).toEqual([414367, 343479]);
    expect(values(MSFT, "cash")).toEqual([32105, 30242]);
    expect(values(MSFT, "shortTermInvestments")).toEqual([46167, 64323]);
    expect(values(MSFT, "totalCashAndStInvestments")).toEqual([78272, 94565]);
  });

  it("total debt — direct 40,262 / 43,151 and reconciles with components", () => {
    expect(values(MSFT, "currentDebt")).toEqual([8839, 2999]);
    expect(values(MSFT, "longTermDebt")).toEqual([31423, 40152]);
    expect(values(MSFT, "totalDebt")).toEqual([40262, 43151]);
  });

  it("cash flow — OCF and capex", () => {
    expect(values(MSFT, "ocf")).toEqual([46679, 37044, 127494, 93515]);
    expect(values(MSFT, "capex")).toEqual([30876, 16745, 80146, 47472]);
  });

  it("margins for Q3 FY26", () => {
    const q3 = MSFT.derived.ratios[0];
    expect(q3.grossMargin!).toBeCloseTo(67.6, 1);
    expect(q3.operatingMargin!).toBeCloseTo(46.3, 1);
    expect(q3.netMargin!).toBeCloseTo(38.3, 1);
  });

  it("free cash flow 9M = 47,348", () => {
    const fcf9m = MSFT.derived.fcf.find((f) => f.periodLabel === "9M FY26");
    expect(fcf9m?.fcf).toBe(47348);
  });

  it("segments reconcile to 82,886 / 38,398", () => {
    const seg = MSFT.segments!;
    expect(seg.segments).toHaveLength(3);
    const byName = (n: string) => seg.segments.find((s) => s.name.includes(n))!;
    expect(byName("Productivity").revenue).toBe(35013);
    expect(byName("Productivity").operatingIncome).toBe(20973);
    expect(byName("Intelligent Cloud").revenue).toBe(34681);
    expect(byName("Intelligent Cloud").operatingIncome).toBe(13753);
    expect(byName("More Personal Computing").revenue).toBe(13192);
    expect(byName("More Personal Computing").operatingIncome).toBe(3672);
    expect(seg.totalRevenue).toBe(82886);
    expect(seg.totalOperatingIncome).toBe(38398);
    expect(seg.reconciles).toBe(true);
  });

  it("capital returns 9M = 37,379 (dividends + buybacks)", () => {
    const cr = MSFT.capitalReturns!;
    expect(cr.dividends).toBe(19687);
    expect(cr.buybacks).toBe(17692);
    expect(cr.total).toBe(37379);
  });

  it("net cash position +38,010 (incl. short-term investments)", () => {
    expect(MSFT.netCash!.netCashInclStInv).toBe(38010);
    expect(MSFT.netCash!.isNetCash).toBe(true);
  });

  it("per-share — EPS diluted 4.27 / 13.14, DPS 0.91, diluted shares 7,445", () => {
    expect(values(MSFT, "epsDiluted")).toEqual([4.27, 3.46, 13.14, 9.99]);
    expect(values(MSFT, "epsBasic")).toEqual([4.28, 3.47, 13.19, 10.03]);
    expect(values(MSFT, "dps")[0]).toBe(0.91);
    expect(values(MSFT, "dps")[2]).toBe(2.73);
    expect(values(MSFT, "weightedSharesDiluted")[0]).toBe(7445);
    expect(values(MSFT, "weightedSharesDiluted")[2]).toBe(7457);
  });

  it("non-GAAP one-off flag — adjusted 93,500 vs GAAP 97,983", () => {
    const o = MSFT.oneOff;
    expect(o.detected).toBe(true);
    expect(o.oneOffEstimate).toBe(4483);
    const adj9m = o.adjustedNetIncome?.find((a) => a.periodLabel === "9M FY26");
    expect(adj9m?.value).toBe(93500);
    const gaap9m = o.gaapNetIncome?.find((a) => a.periodLabel === "9M FY26");
    expect(gaap9m?.value).toBe(97983);
    expect(o.gaapGrowth!).toBeCloseTo(31.3, 0);
    expect(o.adjustedGrowth!).toBeCloseTo(22.0, 0);
  });

  it("all reconciliations pass (9 with the deeper income identities)", () => {
    expect(MSFT.validation.passed).toBe(MSFT.validation.total);
    expect(MSFT.validation.total).toBe(9);
  });

  // ---- v3: deeper data ----
  it("OpEx breakdown — R&D / S&M / G&A, total reconciles", () => {
    expect(values(MSFT, "rAndD")).toEqual([8915, 8198, 25565, 23659]);
    expect(values(MSFT, "sellingMarketing")).toEqual([6814, 6212, 19115, 18369]);
    expect(values(MSFT, "generalAdmin")).toEqual([1931, 1737, 5669, 5233]);
    expect(values(MSFT, "totalOpEx")).toEqual([17660, 16147, 50349, 47261]);
  });

  it("other income / pre-tax / tax", () => {
    expect(values(MSFT, "otherIncome")).toEqual([942, -623, 7253, -3194]);
    expect(values(MSFT, "incomeBeforeTax")).toEqual([39340, 31377, 121887, 91011]);
    expect(values(MSFT, "incomeTax")).toEqual([7562, 5553, 23904, 16412]);
  });

  it("deeper balance-sheet + cash-flow lines", () => {
    expect(values(MSFT, "totalCurrentAssets")[0]).toBe(175329);
    expect(values(MSFT, "totalCurrentLiabilities")[0]).toBe(136661);
    expect(values(MSFT, "accountsReceivable")[0]).toBe(60041);
    expect(values(MSFT, "inventories")[0]).toBe(1219);
    expect(values(MSFT, "goodwill")[0]).toBe(119661);
    expect(values(MSFT, "intangiblesNet")[0]).toBe(19325);
    expect(values(MSFT, "ppeNet")[0]).toBe(283228);
    expect(values(MSFT, "depreciationAmortization")[2]).toBe(27512); // 9M
  });

  it("advanced ratios match ground truth", () => {
    const a = (k: string) => MSFT.derived.advanced.find((x) => x.key === k);
    expect(a("ebitda")!.value).toBe(142146); // 114,634 + 27,512
    expect(a("cashConversion")!.value!).toBeCloseTo(48.3, 0);
    expect(a("sbcPctRevenue")!.value!).toBeCloseTo(3.8, 1);
    expect(a("currentRatio")!.value!).toBeCloseTo(1.28, 2);
    expect(a("effectiveTaxRate")!.value!).toBeCloseTo(20, 0);
    expect(a("netDebtToEbitda")!.format).toBe("text"); // net cash → not a multiple
  });

  it("segment YoY from the prior-year columns", () => {
    const byName = (n: string) => MSFT.segments!.segments.find((s) => s.name.includes(n))!;
    expect(byName("Productivity").revenueYoY!).toBeCloseTo(16.9, 1);
    expect(byName("Intelligent Cloud").revenueYoY!).toBeCloseTo(29.6, 1);
    expect(byName("More Personal Computing").revenueYoY!).toBeCloseTo(-1.3, 1);
  });

  it("revenue by product reconciles to total revenue", () => {
    const pr = MSFT.productRevenue!;
    expect(pr.reconciles).toBe(true);
    expect(pr.items.find((i) => i.name.includes("Server products"))!.value).toBe(32592);
    expect(pr.items.find((i) => i.name.includes("Microsoft 365 Commercial"))!.value).toBe(25593);
    const sum = pr.items.reduce((a, i) => a + (i.value ?? 0), 0);
    expect(sum).toBe(82886);
  });

  it("export contains statements, ratios and segments", () => {
    const csv = toCSV(MSFT);
    // Etykiety w eksporcie są polskie (jak w UI), wartości zostają surowe.
    expect(csv).toContain("Przychody,82886,70066,241832,205283");
    expect(csv).toContain("EBITDA");
    const names = buildExportTables(MSFT).map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "Podsumowanie",
        "Rachunek zysków i strat",
        "Struktura kosztów",
        "Bilans",
        "Marże",
        "Wskaźniki",
        "Segmenty",
        "Przychody wg produktów",
      ]),
    );
  });

  it("cost structure is expressed as a share of revenue", () => {
    const costs = buildExportTables(MSFT).find((t) => t.name === "Struktura kosztów");
    expect(costs).toBeDefined();
    expect(costs!.valueFormat).toBe("pct");
    const cogs = costs!.rows.find((r) => r[0] === "Koszt własny sprzedaży");
    expect(cogs).toBeDefined();
    // Udział liczony z tych samych liczb, które trafiają do tabeli RZiS.
    const rev = values(MSFT, "revenue")[0]!;
    const cost = values(MSFT, "costOfRevenue")[0]!;
    expect(cogs![1] as number).toBeCloseTo((cost / rev) * 100, 6);
    // Sanity: koszt własny Microsoftu to około jedna trzecia przychodów.
    expect(cogs![1] as number).toBeGreaterThan(25);
    expect(cogs![1] as number).toBeLessThan(40);
  });

  it("margins ship as a period matrix, one column per period", () => {
    const margins = buildExportTables(MSFT).find((t) => t.name === "Marże");
    expect(margins).toBeDefined();
    expect(margins!.rows.map((r) => r[0])).toEqual([
      "Marża brutto",
      "Marża operacyjna",
      "Marża netto",
    ]);
    // Kolumna etykiety + po jednej na każdy wykryty okres wynikowy.
    const periods = MSFT.detection.periods.income.length;
    expect(margins!.columns).toHaveLength(periods + 1);
    expect(margins!.rows[0]).toHaveLength(periods + 1);
  });
});

describe("Cipher Digital 10-Q — generality (not overfit)", () => {
  it("detects a different issuer / convention with the same code", () => {
    expect(CIPHER.detection.formType).toBe("SEC 10-Q");
    expect(CIPHER.detection.structureLabel).toBe("SEC 10-Q · Cipher Digital Inc.");
    expect(CIPHER.detection.currency).toBe("USD");
    expect(CIPHER.detection.unitLabel).toBe("in thousands");
    expect(CIPHER.detection.fiscalYearEndMonth).toBe(12);
    expect(CIPHER.detection.periods.income.map((p) => p.short)).toEqual(["Q1 FY26", "Q1 FY25"]);
  });

  it("reads an unusual revenue label and parenthesised losses", () => {
    expect(values(CIPHER, "revenue")).toEqual([34838, 48959]);
    expect(values(CIPHER, "costOfRevenue")).toEqual([17705, 14894]);
    expect(values(CIPHER, "operatingIncome")).toEqual([-114569, -38088]);
    expect(values(CIPHER, "netIncome")).toEqual([-114316, -38975]);
  });

  it("reads the balance sheet and cash flow", () => {
    expect(values(CIPHER, "totalAssets")).toEqual([6393585, 4291908]);
    expect(values(CIPHER, "totalEquity")).toEqual([714187, 805535]);
    expect(values(CIPHER, "cash")).toEqual([715203, 628263]);
    expect(values(CIPHER, "ocf")).toEqual([91531, -47238]);
  });

  it("reads a combined basic & diluted EPS line", () => {
    expect(values(CIPHER, "epsDiluted")).toEqual([-0.28, -0.11]);
  });

  it("labels periods with descriptors, never COL N", () => {
    const labels = [...CIPHER.detection.periods.income, ...CIPHER.detection.periods.balance].map((p) => p.short);
    for (const l of labels) expect(l).not.toMatch(/COL\s*\d/i);
  });

  it("matches the bulk of headline metrics and balances the sheet", () => {
    expect(CIPHER.matchedCount).toBeGreaterThanOrEqual(9);
    const assets = CIPHER.validation.checks.find((c) => c.name === "Assets = Liabilities + Equity");
    expect(assets?.passed).toBe(true);
  });

  it("does not raise a false non-GAAP flag on a widening loss", () => {
    expect(CIPHER.oneOff.detected).toBe(false);
  });

  it("export round-trips the parsed values", () => {
    const csv = toCSV(CIPHER);
    expect(csv).toContain("Przychody,34838,48959");
    expect(csv).toContain("Cipher Digital Inc.");
  });

  it("income identities reconcile even for a loss-maker", () => {
    // OpInc + Other = Pre-tax, and Pre-tax − Tax = Net, with negative numbers.
    expect(CIPHER.validation.passed).toBe(CIPHER.validation.total);
    expect(CIPHER.validation.total).toBeGreaterThanOrEqual(3);
    const ebitda = CIPHER.derived.advanced.find((x) => x.key === "ebitda");
    expect(ebitda && ebitda.value !== null && ebitda.value < 0).toBe(true);
  });
});

describe("NVIDIA Q1 FY27 — segments-as-columns + convention fixes", () => {
  it("detects context and labels the period Q1 FY27 (not CURRENT/PRIOR)", () => {
    expect(NVDA.detection.structureLabel).toBe("SEC 10-Q · NVIDIA Corporation");
    expect(NVDA.detection.unitLabel).toBe("in millions");
    expect(NVDA.detection.fiscalYearEndMonth).toBe(1);
    expect(NVDA.detection.periods.income.map((p) => p.short)).toEqual(["Q1 FY27", "Q1 FY26"]);
    for (const p of NVDA.detection.periods.income) expect(p.short).not.toMatch(/current|prior/i);
  });

  it("income statement incl. combined SG&A as one opex line", () => {
    expect(values(NVDA, "revenue")).toEqual([81615, 44062]);
    expect(values(NVDA, "costOfRevenue")).toEqual([20458, 17394]);
    expect(values(NVDA, "grossProfit")).toEqual([61157, 26668]);
    expect(values(NVDA, "rAndD")).toEqual([6321, 3989]);
    expect(values(NVDA, "sga")).toEqual([1300, 1041]); // "Sales, general and administrative"
    expect(values(NVDA, "totalOpEx")).toEqual([7621, 5030]); // R&D + SG&A reconciles to the reported total
    expect(values(NVDA, "operatingIncome")).toEqual([53536, 21638]);
    expect(values(NVDA, "netIncome")).toEqual([58321, 18775]);
    expect(values(NVDA, "epsDiluted")[0]).toBe(2.39);
    expect(NVDA.matchedCount).toBe(11);
  });

  it("marketable securities → liquidity (~$42B net cash), buyback, capex, FCF", () => {
    expect(values(NVDA, "shortTermInvestments")[0]).toBe(37098); // "Marketable securities"
    expect(NVDA.netCash!.netCashInclStInv).toBe(41865); // not $4.8B
    expect(NVDA.netCash!.isNetCash).toBe(true);
    expect(values(NVDA, "buybacks")[0]).toBe(19312); // "Payments related to repurchases of common stock"
    expect(values(NVDA, "capex")[0]).toBe(1757);
    expect(NVDA.derived.fcf.find((f) => f.periodLabel === "Q1 FY27")!.fcf).toBe(48587);
  });

  it("segments parsed from a COLUMN layout with a wrapped header", () => {
    const seg = NVDA.segments!;
    expect(seg.segments.map((s) => s.name)).toEqual(["Compute & Networking", "Graphics"]);
    const byName = (n: string) => seg.segments.find((s) => s.name.includes(n))!;
    expect(byName("Compute & Networking").revenue).toBe(74550);
    expect(byName("Compute & Networking").operatingIncome).toBe(53335);
    expect(byName("Compute & Networking").revenueYoY!).toBeCloseTo(88, 0);
    expect(byName("Graphics").revenue).toBe(7065);
    expect(byName("Graphics").revenueYoY!).toBeCloseTo(58, 0);
    expect(seg.totalRevenue).toBe(81615);
  });

  it("segment operating income reconciles to the segment total (unallocated items, no false error)", () => {
    const seg = NVDA.segments!;
    // Segment total (56,276) differs from consolidated operating income (53,536)
    // because of unallocated SBC / opex / acquisition costs — must NOT false-error.
    expect(seg.totalOperatingIncome).toBe(56276);
    expect(values(NVDA, "operatingIncome")[0]).toBe(53536);
    expect(seg.reconciles).toBe(true);
    const sumOp = seg.segments.reduce((a, s) => a + (s.operatingIncome ?? 0), 0);
    expect(sumOp).toBe(56276);
  });

  it("all reconciliations pass (income identities + balance + segments)", () => {
    expect(NVDA.validation.passed).toBe(NVDA.validation.total);
    expect(NVDA.validation.total).toBeGreaterThanOrEqual(6);
    const names = NVDA.validation.checks.filter((c) => c.passed).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining([
      "Σ Segment revenue = Total revenue",
      "Σ Segment operating income = Total",
      "Assets = Liabilities + Equity",
    ]));
  });
});

describe("Kombinat Konopny Q2 2026 — Polish PAS / NewConnect", () => {
  const KK = parseFixture("kombinat-konopny-2q2026.txt");

  it("detects NewConnect context in Polish", () => {
    expect(KK.detection.formType).toMatch(/NewConnect/);
    expect(KK.detection.language).toBe("PL");
    expect(KK.detection.currency).toBe("PLN");
    expect(KK.detection.issuer).toMatch(/Kombinat Konopny/i);
    expect(KK.detection.unitScale).toBe(1);
  });

  it("labels Q2 / H1 periods from Od…do… headers", () => {
    const shorts = KK.detection.periods.income.map((p) => p.short);
    expect(shorts.length).toBe(4);
    expect(shorts[0]).toMatch(/Q2/i);
    expect(shorts[2]).toMatch(/6M|H1|9M/i); // 6M FY from Jan–Jun
    for (const s of shorts) expect(s).not.toMatch(/COL\s*\d|Current|Prior/i);
  });

  it("reads European-format income statement (Q2 then H1)", () => {
    expect(values(KK, "revenue")[0]).toBeCloseTo(2924056.55, 1);
    expect(values(KK, "costOfRevenue")[0]).toBeCloseTo(3007999.3, 1);
    expect(values(KK, "grossProfit")[0]).toBeCloseTo(-83942.75, 1);
    expect(values(KK, "operatingIncome")[0]).toBeCloseTo(-84543.72, 1);
    expect(values(KK, "netIncome")[0]).toBeCloseTo(-207919.72, 1);
    // H1 columns
    expect(values(KK, "revenue")[2]).toBeCloseTo(4627592.48, 1);
    expect(values(KK, "netIncome")[2]).toBeCloseTo(-759259.9, 1);
  });

  it("reads balance sheet and cash", () => {
    expect(values(KK, "totalAssets")[0]).toBeCloseTo(11521758.92, 1);
    expect(values(KK, "totalEquity")[0]).toBeCloseTo(5561263.98, 1);
    expect(values(KK, "cash")[0]).toBeCloseTo(645589.76, 1);
  });

  it("reads OCF and capex (wrapped PAS labels)", () => {
    expect(values(KK, "ocf")[0]).toBeCloseTo(-245853.26, 1);
    expect(values(KK, "capex")[0]).toBeCloseTo(78046.48, 1);
  });

  it("matches most headline metrics and balances the sheet", () => {
    expect(KK.matchedCount).toBeGreaterThanOrEqual(8);
    const assets = KK.validation.checks.find((c) => c.name === "Assets = Liabilities + Equity");
    expect(assets?.passed).toBe(true);
  });

  it("extracts ALL numeric rows, not only headlines", () => {
    expect(KK.extractedRows.length).toBeGreaterThan(40);
    const labels = KK.extractedRows.map((r) => r.label.toLowerCase());
    expect(labels.some((l) => l.includes("przychody"))).toBe(true);
    expect(labels.some((l) => l.includes("aktywa"))).toBe(true);
    expect(labels.some((l) => l.includes("amortyzacja") || l.includes("zużycie"))).toBe(true);
    // A by-nature cost line that is NOT a headline metric must still appear.
    expect(labels.some((l) => l.includes("usługi obce") || l.includes("wynagrodzenia"))).toBe(true);
    const przychody = KK.extractedRows.find((r) =>
      /przychody netto ze sprzedaży i zrównane/i.test(r.label),
    );
    expect(przychody?.values[0]).toBeCloseTo(2924056.55, 1);
  });
});

describe("extractedRows — available on US fixtures too", () => {
  it("Microsoft yields a large numeric-row inventory", () => {
    expect(MSFT.extractedRows.length).toBeGreaterThan(50);
    expect(MSFT.extractedRows.some((r) => /revenue/i.test(r.label))).toBe(true);
  });
});
