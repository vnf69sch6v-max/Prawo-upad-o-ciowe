// PS3b-2c (docs/specs/2026-11-12-parser-ps3b2c-wyliczone.md): wzór „wyliczone” przelicza się na wartość z `derived`.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DERIVED_FORMULAS, DERIVED_KEYS } from "@/lib/parser/derived-meta";
import { parseIxbrl } from "@/lib/parser/ixbrl/to-result";
import { parseReport } from "@/lib/parser/parser";
import type { ParseResult } from "@/lib/parser/types";

const html = (n: string) => parseIxbrl(readFileSync(`tests/fixtures/ixbrl/${n}.htm`, "utf8"));
const txt = (n: string) => {
  const text = readFileSync(`tests/fixtures/${n}.txt`, "utf8");
  return parseReport({ text, pages: 1, charCount: text.length });
};
const cases: [string, ParseResult][] = [
  ["SpaceX", html("spacex-10q-q3-2026")],
  ["Cipher", html("cipher-10k-fy2025")],
  ["Microsoft PDF", txt("microsoft-10q")],
];
const close = (a: number | null, b: number | null, tol: number) =>
  a === null || b === null ? a === b : Math.abs(a - b) <= tol;

describe("DERIVED_FORMULAS", () => {
  it("każdy klucz ma nazwę i wzór po polsku", () => {
    for (const k of DERIVED_KEYS) {
      expect(DERIVED_FORMULAS[k].labelPl.length).toBeGreaterThan(3);
      expect(DERIVED_FORMULAS[k].formulaPl).toMatch(/[=÷−]|porównuje/i);
    }
  });

  it("klucze z plakietką = tylko liczby wyliczone (nigdy przychody, zysk netto, aktywa)", () => {
    expect(new Set(DERIVED_KEYS)).toEqual(new Set([
      "fcf", "netDebt", "grossMargin", "operatingMargin", "netMargin", "payoutOfFcf", "capexIntensity", "delta",
    ]));
    for (const k of ["revenue", "netIncome", "totalAssets"]) expect(DERIVED_KEYS).not.toContain(k);
  });

  for (const [name, r] of cases) {
    it(`${name}: składniki przeliczają się na wartość w wyniku`, () => {
      let checked = 0;
      for (const p of r.detection.periods.income) {
        const ratio = r.derived.ratios.find((x) => x.periodKey === p.key)!;
        for (const [k, field] of [["grossMargin", "grossMargin"], ["operatingMargin", "operatingMargin"], ["netMargin", "netMargin"]] as const) {
          const f = DERIVED_FORMULAS[k];
          const v = f.compute!(f.inputs!(r, p.key).map((i) => i.value));
          expect(close(v, ratio[field], 0.05), `${k} ${p.key}`).toBe(true);
          if (v !== null) checked++;
        }
        const fcf = r.derived.fcf.find((x) => x.periodKey === p.key)?.fcf ?? null;
        expect(DERIVED_FORMULAS.fcf.compute!(DERIVED_FORMULAS.fcf.inputs!(r, p.key).map((i) => i.value))).toBe(fcf);
      }
      if (r.netCash) {
        const v = DERIVED_FORMULAS.netDebt.compute!(DERIVED_FORMULAS.netDebt.inputs!(r, r.netCash.periodKey).map((i) => i.value));
        expect(close(v, r.netCash.netCashInclStInv, 1)).toBe(true);
      }
      if (r.capitalReturns) {
        const v = DERIVED_FORMULAS.payoutOfFcf.compute!(DERIVED_FORMULAS.payoutOfFcf.inputs!(r, r.capitalReturns.periodKey).map((i) => i.value));
        expect(close(v, r.capitalReturns.payoutOfFcf, 0.05)).toBe(true);
      }
      expect(checked).toBeGreaterThan(0);
    });
  }
});
