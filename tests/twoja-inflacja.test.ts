import { describe, expect, it } from "vitest";
import { CPI_WEIGHTS_2026 } from "@/lib/cpi-weights";
import {
  DIVISION_CODES,
  computePersonalInflation,
  encodeBasket,
  gusShares,
  isGusBasket,
  normalizeTo100,
  parseBasket,
} from "@/lib/twoja-inflacja";
import { isMoreActive } from "@/components/shell/mobile-nav";

describe("wagi GUS 2026", () => {
  it("13 działów COICOP 2018 w kolejności 01–13", () => {
    expect(DIVISION_CODES).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]);
  });
  it("suma wag = 100 (tolerancja zaokrągleń źródła)", () => {
    const sum = CPI_WEIGHTS_2026.reduce((a, d) => a + d.weight, 0);
    expect(Math.abs(sum - 100)).toBeLessThanOrEqual(0.05);
  });
});

describe("computePersonalInflation", () => {
  const flat = DIVISION_CODES.map((code) => ({ code, yoy: 2 }));
  it("równe dynamiki → wynik = ta dynamika, niezależnie od udziałów", () => {
    expect(computePersonalInflation(gusShares(), flat).rate).toBeCloseTo(2, 10);
    expect(computePersonalInflation(DIVISION_CODES.map((_, i) => i + 1), flat).rate).toBeCloseTo(2, 10);
  });
  it("wkłady sumują się do wyniku", () => {
    const r = DIVISION_CODES.map((code, i) => ({ code, yoy: i - 4 }));
    const out = computePersonalInflation(gusShares(), r);
    const sum = out.contributions.reduce((a, c) => a + (c.pp ?? 0), 0);
    expect(sum).toBeCloseTo(out.rate!, 10);
  });
  it("koszyk 100% w jednym dziale = dynamika tego działu", () => {
    const shares = DIVISION_CODES.map((c) => (c === "04" ? 100 : 0));
    const r = DIVISION_CODES.map((code, i) => ({ code, yoy: i }));
    expect(computePersonalInflation(shares, r).rate).toBeCloseTo(3, 10);
  });
  it("dział bez odczytu jest pomijany i raportowany", () => {
    const r = DIVISION_CODES.map((code) => ({ code, yoy: code === "10" ? null : 1 }));
    const out = computePersonalInflation(gusShares(), r);
    expect(out.rate).toBeCloseTo(1, 10);
    expect(out.missingShare).toBeCloseTo(CPI_WEIGHTS_2026.find((d) => d.code === "10")!.weight, 1);
    expect(out.contributions.find((c) => c.code === "10")!.pp).toBeNull();
  });
  it("brak danych → null, nie 0", () => {
    expect(computePersonalInflation(gusShares(), []).rate).toBeNull();
  });
});

describe("stan w URL (?w=)", () => {
  it("round-trip: encode → parse daje te same udziały (do 0,1 p.p.)", () => {
    const shares = [30, 5, 3.5, 25, 4, 2, 12, 5, 4, 0, 6, 1, 2.5];
    expect(parseBasket(encodeBasket(shares))).toEqual(shares);
  });
  it("wagi GUS po round-tripie dalej są koszykiem GUS", () => {
    expect(isGusBasket(parseBasket(encodeBasket(gusShares()))!)).toBe(true);
    expect(isGusBasket([30, 5, 3.5, 25, 4, 2, 12, 5, 4, 0, 6, 1, 2.5])).toBe(false);
  });
  it.each([
    [null],
    [""],
    ["1,2,3"],
    ["1,2,3,4,5,6,7,8,9,10,11,12,13,14"],
    ["0,0,0,0,0,0,0,0,0,0,0,0,0"],
    ["259,61,42,195,51,63,98,55,59,10,64,13,-1"],
    ["259,61,42,195,51,63,98,55,59,10,64,13,1.5"],
    ["259,61,42,195,51,63,98,55,59,10,64,13,1001"],
    ["259,61,42,195,51,63,98,55,59,10,64,13,abc"],
    ["259,61,42,195,51,63,98,55,59,10,64,13,"],
    ["1e3,61,42,195,51,63,98,55,59,10,64,13,1"],
    ["x".repeat(500)],
  ])("śmieci (%s) → null = wagi GUS", (raw) => {
    expect(parseBasket(raw)).toBeNull();
  });
});

describe("normalizeTo100", () => {
  it("suma dokładnie 100,0 i proporcje zachowane", () => {
    const out = normalizeTo100([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
    expect(out.reduce((a, b) => Math.round((a + b) * 10) / 10, 0)).toBe(100);
    expect(Math.max(...out) - Math.min(...out)).toBeLessThanOrEqual(0.2);
  });
  it("same zera → wagi GUS", () => {
    expect(normalizeTo100(new Array(13).fill(0))).toEqual(gusShares());
  });
});

describe("nawigacja", () => {
  it("/ceny/twoja-inflacja zapala zakładkę Ceny, nie „Więcej”", () => {
    expect(isMoreActive("/ceny/twoja-inflacja")).toBe(false);
  });
  it("pozostałe skróty z „Więcej” działają jak dotąd", () => {
    expect(isMoreActive("/status")).toBe(true);
    expect(isMoreActive("/japonia/gospodarka")).toBe(true);
    expect(isMoreActive("/ceny")).toBe(false);
  });
});
