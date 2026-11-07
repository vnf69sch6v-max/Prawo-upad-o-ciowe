// PS2b-1 (docs/specs/2026-11-07-parser-ps2b-bilans-trzy-daty.md): bilans z trzema datami (rok bieżący,
// poprzedni przekształcony, 1 stycznia), numery not i liczby sklejone spacją w raportach europejskich.
// Fixture'y to fragmenty tekstu z naszego pdfjs (sprawozdania na stronach spółek):
//   pzu-2024-statements.txt — PZU, skonsolidowane sprawozdanie finansowe za 2024, RZiS i bilans (mln zł);
//   orlen-2025-balance-en.txt — ORLEN, Consolidated Financial Statements 2025 (EN), bilans (mln zł);
//   pkobp-2024-balance.txt — PKO BP, skonsolidowane sprawozdanie finansowe za 2024, aktywa i kapitał (mln zł).
// Przed zmianą parser brał dwie OSTATNIE kolumny, czyli rok poprzedni jako bieżący (Orlen: aktywa 255 395 zamiast
// 265 048), a liczby powyżej 99 999 sklejał w jedną.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getMetric, parseReport } from "@/lib/parser/parser";
import { parseCells, resegmentEuropean } from "@/lib/parser/numbers";
import type { MetricKey } from "@/lib/parser/types";

const parse = (name: string) => {
  const text = readFileSync(`tests/fixtures/${name}.txt`, "utf8");
  return parseReport({ text, pages: 1, charCount: text.length });
};
const vals = (r: ReturnType<typeof parse>, key: MetricKey) => getMetric(r, key)!.values.map((v) => v.value);

describe("PZU 2024 — bilans 31.12.2024 / 31.12.2023 / 01.01.2023", () => {
  const r = parse("pzu-2024-statements");
  it("trzy daty bilansu z nagłówka, od najnowszej (pdfjs wypisuje 2023 przed 2024)", () => {
    expect(r.detection.periods.balance.map((p) => p.short)).toEqual(["31.12.2024", "31.12.2023", "01.01.2023"]);
    expect(r.detection.periods.balance[0].current).toBe(true);
  });
  it.each([
    ["goodwill", [2792, 2801, 2808]], // „Wartość firmy 27 2 792 2 801 2 808” — 27 to nota
    ["ppeNet", [4256, 4445, 4304]],
    ["cash", [15127, 17702, 15960]],
    ["totalAssets", [503257, 467945, 429205]], // „Aktywa, razem 503 257 467 945 429 205” — sklejone
    ["totalEquity", [65257, 60552, 48431]],
    ["totalLiabilities", [438000, 407393, 380774]],
  ] as const)("%s", (key, expected) => {
    expect(vals(r, key)).toEqual(expected);
  });
  it("podatek bez numeru noty („Podatek dochodowy 25 (3 484) (3 626)”), aktywa = pasywa", () => {
    expect(vals(r, "incomeTax")).toEqual([3484, 3626]);
    expect(r.validation.checks.find((c) => c.name.startsWith("Assets"))?.passed).toBe(true);
  });
});

describe("ORLEN 2025 (EN) — bilans z notami „12.4” i trzema datami", () => {
  const r = parse("orlen-2025-balance-en");
  it("daty kolumn", () => {
    expect(r.detection.periods.balance.map((p) => p.short)).toEqual(["31.12.2025", "31.12.2024", "01.01.2024"]);
  });
  it.each([
    ["totalAssets", [265048, 255395, 264082]],
    ["totalEquity", [144543, 146750, 152117]],
    ["totalLiabilities", [120505, 108645, 111965]],
    ["goodwill", [3812, 4372, 2179]],
    ["intangiblesNet", [4526, 7012, 11651]],
    ["inventories", [19126, 21739, 22917]],
  ] as const)("%s", (key, expected) => {
    expect(vals(r, key)).toEqual(expected);
  });
});

describe("PKO BP 2024 — nota całkowita nie psuje kolumn", () => {
  const r = parse("pkobp-2024-balance");
  it("rzeczowe aktywa trwałe 3 320 / 3 203 / 2 917 (nie 18 / 41, nie przesunięte o kolumnę)", () => {
    expect(vals(r, "ppeNet")).toEqual([3320, 3203, 2917]);
    expect(vals(r, "totalEquity")).toEqual([52370, 45227, 35707]);
  });
  it("trzecia kolumna z datą 01.01.2023; suma aktywów z „AKTYWA”, nie z tabeli przekształceń z wartością ujemną", () => {
    expect(r.detection.periods.balance.map((p) => p.short).at(-1)).toBe("01.01.2023");
    // „SUMA AKTYWÓW 501 516 (6 127) - 495 389” (przekształcenie danych) nie jest kandydatem.
    expect(vals(r, "totalAssets")).toEqual([525225, 495389, 417797]);
  });
});

describe("resegmentEuropean", () => {
  const split = (s: string, n: number) => resegmentEuropean(parseCells(s), n).map((c) => c.value);
  it("dzieli długie ciągi na tyle kolumn, ile ma tabela", () => {
    expect(split("503 257 467 945 429 205", 3)).toEqual([503257, 467945, 429205]);
    expect(split("32 232 166 218 874 212 725", 3)).toEqual([32, 232166, 218874, 212725]); // nota + 3
    expect(split("11 108 111 68", 3)).toEqual([11, 108, 111, 68]);
  });
  it("nie rusza poprawnych wierszy i krótkich ciągów", () => {
    expect(split("3 072 764 2 711 820", 2)).toEqual([3072764, 2711820]); // tysiące zł, 2 kolumny
    expect(split("525 225", 2)).toEqual([525225]);
    expect(split("11 521 758,92 11 889 658,12", 2)).toEqual([11521758.92, 11889658.12]);
  });
  it("wiersz PLN + EUR (4 kolumny) przestaje „pasować” do bilansu z 3 datami", () => {
    expect(split("262 742 264 463 61 489 60 824", 3)).toEqual([262742, 264463, 61489, 60824]);
    expect(split("262 742 264 463 313 177", 3)).toEqual([262742, 264463, 313177]);
  });
});
