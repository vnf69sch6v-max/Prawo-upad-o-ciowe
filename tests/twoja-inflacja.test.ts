import { describe, expect, it } from "vitest";
import fixture from "./fixtures/gus-cpi-divisions-2026.json";
import {
  DIVISION_CODES,
  computePersonalInflation,
  encodeBasket,
  gusShares,
  latestCompleteMonth,
  latestDivisionsMonth,
  parseBasket,
  parseShareInput,
  type MonthSnapshot,
} from "@/lib/twoja-inflacja";
import { isMoreActive } from "@/components/shell/mobile-nav";
import { datasetById } from "@/lib/freshness";
import { cpiFullPath } from "@/lib/gus-api-paths";

const months = fixture.months as Record<string, { cpi: number; divisions: Record<string, number> }>;
const snapOf = (date: string): MonthSnapshot => ({ date, cpi: months[date].cpi, yoy: months[date].divisions });
const SEP = snapOf("2026-09");
const EXAMPLE = "3000,200,375,2500,518,620,2000,502,300,0,300,124,441";

describe("kotwica w CPI (kryterium 3)", () => {
  it.each(Object.keys(months))("%s: wagi GUS → dokładnie CPI", (m) => {
    const r = computePersonalInflation(gusShares(), snapOf(m))!;
    expect(Math.abs(r.rate - months[m].cpi)).toBeLessThan(1e-9);
    expect(Math.abs(r.diff)).toBeLessThan(1e-9);
  });
});

describe("przykładowy koszyk, wrzesień 2026 (kryterium 4)", () => {
  const parsed = parseBasket(`w=${EXAMPLE}`);
  it("parsuje się (suma 10880)", () => {
    expect(parsed.status).toBe("ok");
    if (parsed.status === "ok") expect(parsed.shares.reduce((a, b) => a + b, 0)).toBeCloseTo(108.8, 9);
  });
  const shares = parsed.status === "ok" ? parsed.shares : [];
  const r = computePersonalInflation(shares, SEP)!;
  it("wynik 5,098 (±0,001), +1,0 p.p. wobec CPI", () => {
    expect(r.rate).toBeCloseTo(5.098, 3);
    expect(r.residual).toBeCloseTo(-0.0221, 3);
    expect(r.rate - r.cpi).toBeCloseTo(1.0, 1);
  });
  it("Σ wkładów + reszta = wynik; wkłady malejąco", () => {
    expect(Math.abs(r.contributions.reduce((a, c) => a + c.pp, 0) + r.residual - r.rate)).toBeLessThan(1e-9);
    const pps = r.contributions.map((c) => c.pp);
    expect(pps).toEqual([...pps].sort((a, b) => b - a));
  });
  it("zdanie-wniosek wskazuje transport, +1,47 p.p.", () => {
    expect(r.driver.code).toBe("07");
    expect(r.driver.vsCpi).toBeCloseTo(1.47, 2);
  });
  it("koszyk zerowy albo brak danych → null", () => {
    expect(computePersonalInflation(new Array(13).fill(0), SEP)).toBeNull();
    expect(computePersonalInflation(gusShares(), null)).toBeNull();
  });
});

describe("stan w adresie (kryteria 5–6)", () => {
  it("round-trip na siatce 0,01 (≥200 losowych koszyków)", () => {
    let seed = 42;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let k = 0; k < 250; k++) {
      const x = DIVISION_CODES.map(() => Math.round(rnd() * 10000) / 100);
      x[k % 13] = Math.max(x[k % 13], 0.01);
      const enc = encodeBasket(x);
      if (enc == null) continue; // trafiony koszyk GUS
      const dec = parseBasket(new URLSearchParams({ w: enc }));
      expect(dec).toEqual({ status: "ok", shares: x });
    }
  });
  it("wagi GUS = brak parametru; brak parametru = wagi GUS", () => {
    expect(encodeBasket(gusShares())).toBeNull();
    expect(parseBasket("")).toEqual({ status: "none" });
    expect(parseBasket("?x=1")).toEqual({ status: "none" });
  });
  const ok13 = "2591,481,375,2035,518,620,1018,502,637,103,555,124";
  it.each([
    ["12 tokenów", `w=${ok13}`],
    ["14 tokenów", `w=${ok13},441,1`],
    ["-1", `w=${ok13.replace(/^2591/, "-1")},441`],
    ["10001", `w=${ok13},10001`],
    ["1.5", `w=${ok13},1.5`],
    ["abc", `w=${ok13},abc`],
    ["pusty token", `w=2591,,375,2035,518,620,1018,502,637,103,555,124,441`],
    ["same zera", `w=${new Array(13).fill(0).join(",")}`],
    ["w dwa razy", `w=${ok13},441&w=${ok13},441`],
    ["2000 znaków", `w=${"1".repeat(2000)}`],
  ])("%s → invalid (wagi GUS), bez wyjątku", (_, q) => {
    expect(() => parseBasket(q)).not.toThrow();
    expect(parseBasket(q)).toEqual({ status: "invalid" });
  });
  it("pole liczbowe: przecinek i kropka, zakres 0–100, śmieci → null", () => {
    expect(parseShareInput("12,5")).toBe(12.5);
    expect(parseShareInput("12.25")).toBe(12.25);
    expect(parseShareInput("150")).toBe(100);
    expect(parseShareInput("abc")).toBeNull();
    expect(parseShareInput("")).toBeNull();
  });
});

describe("miesiąc danych: działy i CPI z tego samego YYYY-MM", () => {
  const div = (code: string, hist: [string, number | null][]) => ({ code, history: hist.map(([date, yoy]) => ({ date, yoy })) });
  const payload = (lastHas12: boolean) => ({
    headline: [{ date: "2026-08", yoy: 3.4 }, { date: "2026-09", yoy: 4.1 }],
    divisions: DIVISION_CODES.map((c) => div(c, [["2025-Q4", 1], ["2026-08", 1], ["2026-09", lastHas12 && c === "10" ? null : 2]])),
  });
  it("13/13 + CPI → najnowszy miesiąc", () => {
    expect(latestCompleteMonth(payload(false))).toMatchObject({ date: "2026-09", cpi: 4.1 });
    expect(latestDivisionsMonth(payload(false))).toBe("2026-09");
  });
  it("ostatni miesiąc 12/13 → poprzedni (kryterium 7)", () => {
    expect(latestCompleteMonth(payload(true))).toMatchObject({ date: "2026-08", cpi: 3.4 });
    expect(latestDivisionsMonth(payload(true))).toBe("2026-08");
  });
  it("brak CPI za miesiąc działów → nie mieszamy miesięcy", () => {
    const p = { ...payload(false), headline: [{ date: "2026-07", yoy: 3 }] };
    expect(latestCompleteMonth(p)).toBeNull();
    expect(latestCompleteMonth(null)).toBeNull();
  });
  it("cpi-divisions w kontroli świeżości, ta sama trasa co strona", () => {
    const spec = datasetById("cpi-divisions")!;
    expect(spec).toBeDefined();
    expect(spec.endpoint(new Date("2026-11-02T12:00:00Z"))).toBe(cpiFullPath());
    expect(spec.extract(payload(true))).toBe("2026-08");
  });
});

describe("nawigacja (kryterium 16)", () => {
  it("/ceny/twoja-inflacja zapala zakładkę Ceny, nie „Więcej”", () => {
    expect(isMoreActive("/ceny/twoja-inflacja")).toBe(false);
  });
  it("pozostałe skróty z „Więcej” działają jak dotąd", () => {
    expect(isMoreActive("/status")).toBe(true);
    expect(isMoreActive("/japonia/gospodarka")).toBe(true);
    expect(isMoreActive("/ceny")).toBe(false);
  });
});

describe("zdanie-wniosek: dział zgodny ze znakiem różnicy (FIX 1 z recenzji PM)", () => {
  it("koszyk niżej niż CPI nie jest tłumaczony działem, który go podnosi", () => {
    // Dużo transportu (+17,9%) podnosi, ale jeszcze więcej żywności (−0,4%) i mało mieszkania (+5,1%) obniża mocniej.
    const shares = gusShares();
    shares[0] = 60; // 01 żywność
    shares[3] = 5; // 04 mieszkanie
    shares[6] = 14; // 07 transport (> waga GUS 10,18)
    const r = computePersonalInflation(shares, SEP)!;
    expect(r.diff).toBeLessThan(0);
    expect(Math.sign(r.driver.vsCpi)).toBe(-1);
    expect(r.contributions.some((c) => c.code === "07" && c.vsCpi > 0)).toBe(true);
  });
});
