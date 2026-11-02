import { describe, expect, it } from "vitest";
import fixture from "./fixtures/gus-cpi-divisions-2026.json";
import { CPI_WEIGHTS_2026, applyOfficialWeights } from "@/lib/cpi-weights";

const months = fixture.months as Record<string, { cpi: number; divisions: Record<string, number> }>;
const gusSum = (yoy: Record<string, number>) => CPI_WEIGHTS_2026.reduce((a, d) => a + (d.weight * yoy[d.code]) / 100, 0);

describe("wagi koszyka CPI GUS 2026 (kryterium 1)", () => {
  it("13 działów 01–13, wartości z Wykresu 2 komunikatu GUS", () => {
    expect(CPI_WEIGHTS_2026.map((d) => d.code)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]);
    expect(CPI_WEIGHTS_2026.map((d) => d.weight)).toEqual([25.91, 4.81, 3.75, 20.35, 5.18, 6.2, 10.18, 5.02, 6.37, 1.03, 5.55, 1.24, 4.41]);
  });
  it("suma = 100 ± 0,005", () => {
    expect(Math.abs(CPI_WEIGHTS_2026.reduce((a, d) => a + d.weight, 0) - 100)).toBeLessThanOrEqual(0.005);
  });
});

describe("odtworzenie CPI z wag GUS (kryterium 2)", () => {
  it("fixture ma 8 miesięcy (luty–wrzesień 2026) z 13 działami", () => {
    expect(Object.keys(months)).toHaveLength(8);
    for (const m of Object.values(months)) expect(Object.keys(m.divisions)).toHaveLength(13);
  });
  it.each(Object.entries(months))("%s: |Σ w·r/r − CPI| ≤ 0,10 p.p.", (_, m) => {
    expect(Math.abs(gusSum(m.divisions) - m.cpi)).toBeLessThanOrEqual(0.1);
  });
  it("wrzesień: Σ = 4,122, reszta −0,022", () => {
    const sep = months["2026-09"];
    expect(gusSum(sep.divisions)).toBeCloseTo(4.122, 3);
    expect(sep.cpi - gusSum(sep.divisions)).toBeCloseTo(-0.022, 3);
  });
});

describe("applyOfficialWeights (kryterium 8)", () => {
  const payload = {
    weightsApprox: true,
    headline: [],
    divisions: [
      { code: "07", weight: 9.8, yoy: 17.9, contribution: 1.75, history: [] },
      { code: "02", weight: 6.1, yoy: 6.9, contribution: 0.42, history: [] },
      { code: "10", weight: 1.0, yoy: null, contribution: null, history: [] },
    ],
  };
  it("nadpisuje wagę i wkład, weightsApprox = false, reszta pól bez zmian", () => {
    const out = applyOfficialWeights(payload);
    expect(out.weightsApprox).toBe(false);
    expect(out.divisions[0]).toMatchObject({ code: "07", weight: 10.18, contribution: 1.82, history: [] });
    expect(out.divisions[1]).toMatchObject({ weight: 4.81, contribution: 0.33 });
    expect(out.divisions[2]).toMatchObject({ weight: 1.03, contribution: null });
    expect(payload.divisions[0].weight).toBe(9.8); // bez mutacji wpisu cache
  });
});

describe("applyOfficialWeights — wpis bez działów", () => {
  it("zwraca wpis bez zmian zamiast rzucać", () => {
    const odd = { headline: [] } as unknown as { divisions: never[] };
    expect(applyOfficialWeights(odd)).toBe(odd);
  });
});
