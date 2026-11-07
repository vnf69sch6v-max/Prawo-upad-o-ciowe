// PS2a (docs/specs/2026-11-07-parser-ps2a-spacex-10q.md): 10-Q SpaceX za Q3 2026,
// https://www.sec.gov/Archives/edgar/data/1181412/000162828026066880/spcx-20260930.htm (accession
// 0001628280-26-066880). Fixture = tekst z `extractPdfText` (pdfjs legacy + reconstructPage, ten sam co w
// przeglądarce) z wydruku tego HTML do PDF w Chromium (61 stron); sha256 fixture'u e445a3de….
// Wartości przepisane z dokumentu (mln USD): rachunek wyników s. 4, bilans s. 3, przepływy s. 8. Przed
// poprawką parser brał zysk operacyjny z tabeli segmentów, sklejał „140 885 632” i gubił korzyść podatkową.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseReport, getMetric, reconcileTaxSign } from "@/lib/parser/parser";
import { computeDerived } from "@/lib/parser/derived";
import type { Metric, MetricKey, Period } from "@/lib/parser/types";
import { looksUsDocument, parseCells, withNumberFormat } from "@/lib/parser/numbers";
import { stripRelatedPartyNotes } from "@/lib/parser/notes";

const text = readFileSync("tests/fixtures/spacex-10q-q3-2026.txt", "utf8");
const r = parseReport({ text, pages: 61, charCount: text.length });
const vals = (key: Parameters<typeof getMetric>[1]) => getMetric(r, key)!.values.map((v) => v.value);

describe("10-Q SpaceX Q3 2026 — rachunek wyników (Q3'26, Q3'25, 9M'26, 9M'25)", () => {
  it.each([
    ["revenue", [14575, 5576, 27083, 13714]],
    ["costOfRevenue", [5478, 2705, 11361, 6949]],
    ["rAndD", [4596, 2291, 11658, 5806]],
    ["sga", [1707, 575, 3365, 1674]],
    ["totalOpEx", [11784, 5849, 26378, 14930]],
    ["operatingIncome", [2791, -273, 705, -1216]],
    ["interestExpense", [675, 514, 1968, 1372]],
    ["otherIncome", [1025, 140, -937, 342]],
    ["incomeBeforeTax", [4014, -492, -774, -1876]],
    ["incomeTax", [-390, 562, -361, 714]],
    ["netIncome", [4404, -1054, -413, -2590]],
  ] as const)("%s", (key, expected) => {
    expect(vals(key)).toEqual(expected);
    // RZiS: linie 172–204 pliku. Przychody biorą „Total revenues” z noty o przychodach (l. 487, te same
    // liczby) — kolejność synonimów przychodów jest celowa (segmenty), poza zakresem PS2a.
    const line = getMetric(r, key)!.sourceLine;
    if (line !== undefined && key !== "revenue") {
      expect(line).toBeGreaterThanOrEqual(171);
      expect(line).toBeLessThanOrEqual(203);
    }
  });

  it("EPS z nagłówka „Net income (loss) per share”, liczba akcji bez zmian", () => {
    expect(vals("epsBasic")).toEqual([0.37, -0.36, -0.15, -0.89]);
    expect(vals("epsDiluted")).toEqual([0.35, -0.36, -0.15, -0.89]);
    expect(vals("weightedSharesBasic")).toEqual([11942, 2941, 7274, 2915]);
    expect(vals("weightedSharesDiluted")).toEqual([12475, 2941, 7274, 2915]);
  });

  it("kontrole: netto i bilans przechodzą; 1c (bez przychodów odsetkowych) to znana luka — PS2c", () => {
    const failed = r.validation.checks.filter((c) => !c.passed).map((c) => c.name);
    expect(failed).toEqual(["Operating income + Other = Pre-tax income"]);
    expect(r.validation.checks.find((c) => c.name === "Pre-tax − Tax = Net income")?.passed).toBe(true);
    expect(r.validation.checks.find((c) => c.name.startsWith("Assets"))?.passed).toBe(true);
  });

});

describe("10-Q SpaceX — przepływy tylko narastająco (9M) i dług z bilansu", () => {
  it("przepływy trafiają do kolumn 9M, nie Q3, i pochodzą z rachunku przepływów", () => {
    for (const key of ["ocf", "capex", "depreciationAmortization", "stockComp", "buybacks"] as const) {
      expect(getMetric(r, key)!.sourceLine).toBeGreaterThanOrEqual(302); // przepływy: linie 303–362
      expect(getMetric(r, key)!.sourceLine).toBeLessThanOrEqual(361);
    }
    expect(vals("ocf")).toEqual([null, null, 13097, 4120]);
    expect(vals("capex")).toEqual([null, null, 48069, 13846]);
    expect(vals("depreciationAmortization")).toEqual([null, null, 8934, 4784]);
    expect(vals("stockComp")).toEqual([null, null, 3833, 1044]);
    expect(vals("buybacks")).toEqual([null, null, 4426, 525]);
    expect(r.derived.fcf.map((f) => f.fcf)).toEqual([null, null, 13097 - 48069, 4120 - 13846]);
  });

  it("dług = bieżący + długoterminowy z bilansu, nie wiersz noty (principal / koszty / netto)", () => {
    expect(vals("currentDebt")).toEqual([2698, 928]);
    expect(vals("longTermDebt")).toEqual([36146, 21968]);
    expect(vals("totalDebt")).toEqual([38844, 22896]);
    expect(vals("shortTermInvestments")).toEqual([38561, null]);
    expect(r.netCash).toMatchObject({ totalDebt: 38844, netCashInclStInv: 51294 + 38561 - 38844 });
  });

  it("należności z bilansu, mimo kwot odpisu w etykiecie, nie zmiana z przepływów", () => {
    expect(vals("accountsReceivable")).toEqual([4772, 1579]);
  });
});

describe("znak podatku z uzgodnienia (dane syntetyczne)", () => {
  const metric = (key: MetricKey, values: (number | null)[]): Metric => ({
    key, label: key, statement: "income", confidence: "HIGH",
    values: values.map((value, i) => ({ periodKey: `p${i}`, value })),
  });
  it("korzyść → ujemny; koszt → dodatni; brak uzgodnienia → |podatek| i flaga", () => {
    const byKey = new Map<MetricKey, Metric>([
      ["incomeBeforeTax", metric("incomeBeforeTax", [100, 100, 100])],
      ["incomeTax", metric("incomeTax", [20, 20, 20])],
      ["netIncome", metric("netIncome", [120, 80, 95])],
    ]);
    reconcileTaxSign(byKey);
    const tax = byKey.get("incomeTax")!;
    expect(tax.values.map((v) => v.value)).toEqual([-20, 20, 20]);
    expect(tax.flags).toEqual(["tax sign not reconciled with pre-tax and net income"]);
  });

  it("efektywna stopa podatku przy korzyści podatkowej jest ujemna", () => {
    const fy = { key: "p0", short: "FY26", label: "FY26", kind: "duration", months: 12, current: true } as Period;
    const byKey = new Map<MetricKey, Metric>([
      ["incomeBeforeTax", metric("incomeBeforeTax", [4014])],
      ["incomeTax", metric("incomeTax", [-390])],
      ["netIncome", metric("netIncome", [4404])],
    ]);
    const etr = computeDerived(byKey, [fy], []).advanced.find((x) => x.key === "effectiveTaxRate");
    expect(etr?.value).toBeCloseTo((-390 / 4014) * 100, 5);
  });
});

describe("pomocnicze", () => {
  it("notka related party zawinięta na 3 linie: wiersz wraca na pierwszą linię, liczba linii bez zmian", () => {
    const lines = [
      "Interest expense (related party of $351 and $— for the three months ended September 30,",
      "2026 and 2025, respectively, and $864 and $— for the nine months ended September 30,",
      "2026 and 2025, respectively) (675) (514) (1,968) (1,372)",
      "Interest income 873 155 1,426 370",
    ];
    expect(stripRelatedPartyNotes(lines)).toEqual([
      "Interest expense (675) (514) (1,968) (1,372)",
      "",
      "",
      "Interest income 873 155 1,426 370",
    ]);
    expect(stripRelatedPartyNotes(["Revenue (related party of $5 (a)) 10 20"])).toEqual(["Revenue 10 20"]);
    // Niezamknięty nawias w zasięgu 4 linii: zostawiamy tekst bez zmian.
    const open = ["Other assets (related party of $1", "a", "b", "c", "d", "e 5 6"];
    expect(stripRelatedPartyNotes(open)).toEqual(open);
  });

  it("w dokumencie US spacja nie skleja liczb, „- 1,234” to pusta kolumna; poza nim jak dotąd", () => {
    withNumberFormat(true, () => {
      expect(parseCells("1,025 140 885 632.1 % (937) 342").map((c) => c.value)).toEqual([1025, 140, 885, 632.1, -937, 342]);
      expect(parseCells("- 10,438,413 10").map((c) => c.value)).toEqual([null, 10438413, 10]);
    });
    expect(parseCells("2 924 056,55 1 234,10").map((c) => c.value)).toEqual([2924056.55, 1234.1]);
    // Polska tabela: „39 119,801” to 39 119,801, nie dwie kolumny (Orlen, sprawozdanie zarządu).
    expect(parseCells("39 119,801 35 863,405").map((c) => c.value)).toEqual([39119.801, 35863.405]);
  });

  it("format liczb z całego dokumentu: w raporcie US „997 611” to dwie kolumny (NVIDIA)", () => {
    const nv = readFileSync("tests/fixtures/nvidia-10q.txt", "utf8");
    const n = parseReport({ text: nv, pages: 1, charCount: nv.length });
    expect(getMetric(n, "depreciationAmortization")!.values.map((v) => v.value)).toEqual([997, 611]);
    const line = text.split("\n").findIndex((l) => l.startsWith("Restructuring charges (credits)"));
    const row = r.extractedRows.find((x) => x.lineIndex === line);
    expect(row?.values).toEqual([3, 278, -6, 472]);
    const all = JSON.stringify({ ...r, rawText: "" });
    for (const glued of ["140885632", "873155", "278278", "472472"]) expect(all).not.toContain(glued);
  });

  it("Cipher: dług z bilansu (Short-term borrowings + Long-term borrowings, net), nie dyskonto z noty", () => {
    const cd = readFileSync("tests/fixtures/cipher-digital-10q.txt", "utf8");
    const c = parseReport({ text: cd, pages: 1, charCount: cd.length });
    expect(getMetric(c, "longTermDebt")!.values.map((v) => v.value)).toEqual([4376761, 2711648]);
    expect(getMetric(c, "totalDebt")!.values.map((v) => v.value)).toEqual([355348 + 4376761, 37793 + 2711648]);
  });
});

// REVIEW 1 PM (FIX): trzy reguły PS2a psuły raporty spoza fixture'ów (PZU, Orlen Q4 2024). Każdy test
// poniżej nie przechodził na pierwszej wersji PS2a (85abca4).
describe("PS2a FIX — raporty polskie i europejskie", () => {
  it("nagłówek dat w nocie („Wartość firmy 31 grudnia 2024 31 grudnia 2023”) nie wygrywa z bilansem", () => {
    const pl = [
      "Skonsolidowane sprawozdanie z sytuacji finansowej",
      "Aktywa Nota 31 grudnia 2025 31 grudnia 2024",
      "Wartość firmy 27 2 792 2 801",
      "Aktywa razem 450 000 440 000",
      "27. Wartość firmy",
      "Wartość firmy 31 grudnia 2024 31 grudnia 2023",
      "Wartość firmy, razem 2 792 2 801",
    ].join("\n");
    const p = parseReport({ text: pl, pages: 1, charCount: pl.length });
    expect(getMetric(p, "goodwill")!.values.map((v) => v.value)).toEqual([2792, 2801]);
    expect(getMetric(p, "goodwill")!.sourceLine).toBe(2);
  });

  it("przecinki w prozie („PLN 296,947 million”) nie robią z raportu europejskiego dokumentu US", () => {
    const prose = Array.from({ length: 30 }, (_, i) => `Revenue amounted to PLN 296,${100 + i} million, up from last year.`);
    const table = Array.from({ length: 30 }, (_, i) => `Item ${i} 296 947   262 342   68 990   82 318`);
    expect(looksUsDocument([...prose, ...table].join("\n"))).toBe(false);
    const us = Array.from({ length: 30 }, (_, i) => `Item ${i} $ 14,575 $ 5,576 $ 27,083`);
    expect(looksUsDocument(us.join("\n"))).toBe(true);
    expect(looksUsDocument(text)).toBe(true); // SpaceX
  });

  it("numer noty z kropką („Cost of sales 5.2 …”) nie przegrywa z późniejszym przekształceniem danych", () => {
    const eu = [
      "CONSOLIDATED STATEMENT OF PROFIT OR LOSS",
      "Revenue 296 947   75 012   372 767   90 106",
      "Cost of sales 5.2   (255 132)   (62 883)   (311 754)   (81 893)",
      "Gross profit on sales 41 815   12 129   61 013   8 213",
      "Net profit 7 953   1 004   20 969   1 112",
      "Restatement of comparative data",
      "Cost of sales (311 847)   93   -   (311 754)",
    ].join("\n");
    const q = parseReport({ text: eu, pages: 1, charCount: eu.length });
    expect(getMetric(q, "costOfRevenue")!.values.map((v) => v.value)).toEqual([255132, 62883, 311754, 81893]);
    expect(getMetric(q, "costOfRevenue")!.sourceLine).toBe(2);
  });
});
