import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDashboardData } from "@/lib/jp/stat-dashboard";
import { JP_CPI_SERIES, type JpCpiPayload } from "@/lib/jp/cpi";
import { breakdownRows, breakdownSentence, formatStep, heroSentence, latestBreakdown, latestCommonPeriod } from "@/lib/jp/breakdown";
import { datasetById, evaluateDataset, extractJpCpiBreakdown } from "@/lib/freshness";

// Utrwalone odpowiedzi Statistics Dashboard API z 24.10.2026 (TimeFrom=202501) — specyfikacja PM
// docs/specs/2026-10-24-jp-inflacja-rozbicie.md, kryteria 1–6 i 13.
const cfg = (id: string) => JP_CPI_SERIES.find((s) => s.id === id)!.query;
const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/dashboard-cpi-${name}.json`, "utf8"));
const points = (name: string, id: string) => parseDashboardData(fixture(name), cfg(id)).points;

const series: JpCpiPayload["series"] = {
  headline: points("headline", "headline"),
  core: points("core", "core"),
  coreCore: points("corecore", "coreCore"),
  exFoodEnergy: points("exfoodenergy", "exFoodEnergy"),
  tokyo: points("tokyo", "tokyo"),
};
const row = (date: string) => breakdownRows(series).find((r) => r.date === date)!;

describe("exFoodEnergy series (食料（酒類を除く）及びエネルギーを除く総合, 2025 base)", () => {
  it("parses the persisted answer and validates its name", () => {
    const s = parseDashboardData(fixture("exfoodenergy"), cfg("exFoodEnergy"));
    expect(s.name).toContain("食料（酒類を除く）及びエネルギーを除く総合");
    expect(s.name).toContain("2025年基準");
    expect(s.points.slice(-2)).toEqual([{ date: "2026-08", value: 1.6 }, { date: "2026-09", value: 2.2 }]);
  });

  it("rejects a swapped series in both directions", () => {
    expect(() => parseDashboardData(fixture("corecore"), { ...cfg("exFoodEnergy"), indicator: cfg("coreCore").indicator })).toThrow(/食料/);
    expect(() => parseDashboardData(fixture("exfoodenergy"), { ...cfg("coreCore"), indicator: cfg("exFoodEnergy").indicator })).toThrow(/生鮮食品及びエネルギー/);
  });
});

describe("breakdown into differences of official measures", () => {
  it("adds up exactly: R + food + energy + fresh = CPI for every month", () => {
    const rows = breakdownRows(series);
    expect(rows.length).toBe(21);
    for (const r of rows) expect(Math.round((r.R + r.food + r.energy + r.fresh) * 10)).toBe(Math.round(r.T * 10));
  });

  it("matches the MIC release numbers (09.2026, 08.2026, 05.2025)", () => {
    expect(row("2026-09")).toMatchObject({ R: 2.2, food: 0.2, energy: -0.3, fresh: 0, T: 2.1, CC: 2.4, C: 2.1 });
    expect(row("2026-08")).toMatchObject({ R: 1.6, food: 0.3, energy: -0.2, fresh: 0.2, T: 1.9 });
    expect(row("2025-05")).toMatchObject({ R: 1.6, food: 1.7, energy: 0.4, fresh: -0.2, T: 3.5 });
  });

  it("formats steps with the right sign", () => {
    expect([formatStep(0.2), formatStep(-0.3), formatStep(0)]).toEqual(["+0,2 p.p.", "−0,3 p.p.", "±0,0 p.p."]);
  });
});

describe("conclusion sentence", () => {
  const sentence = (date: string) => {
    const prev = breakdownRows(series).find((r, i, all) => all[i + 1]?.date === date);
    return breakdownSentence(row(date), prev ? prev.R : null);
  };

  it("names only drivers ≥0.3 p.p., at most two, ties in fixed order", () => {
    expect(sentence("2026-09")).toBe("Energia obniża inflację o 0,3 p.p.; ceny bez żywności i energii rosną 2,2% r/r (miesiąc wcześniej 1,6%).");
    expect(sentence("2026-08")).toBe("Żywność poza świeżą podnosi inflację o 0,3 p.p.; ceny bez żywności i energii rosną 1,6% r/r (miesiąc wcześniej 1,4%).");
    expect(sentence("2026-02")).toBe("Żywność poza świeżą podnosi inflację o 0,9 p.p., energia obniża ją o 0,9 p.p.; ceny bez żywności i energii rosną 1,5% r/r (miesiąc wcześniej 1,5%).");
    expect(sentence("2025-05")).toBe("Żywność poza świeżą podnosi inflację o 1,7 p.p., energia podnosi ją o 0,4 p.p.; ceny bez żywności i energii rosną 1,6% r/r (miesiąc wcześniej 1,6%).");
  });

  it("handles no drivers, falling prices and a missing previous month", () => {
    const base = { date: "2026-01", R: 1.9, CC: 2.0, C: 2.0, T: 2.0, food: 0.1, energy: 0, fresh: 0 };
    expect(breakdownSentence(base, 1.8)).toBe("Inflację niesie koszyk bez żywności i energii: ceny bez żywności i energii rosną 1,9% r/r (miesiąc wcześniej 1,8%).");
    expect(breakdownSentence({ ...base, R: -0.4 }, null)).toBe("Inflację niesie koszyk bez żywności i energii: ceny bez żywności i energii spadają o 0,4% r/r.");
  });
});

describe("misaligned months and freshness", () => {
  const lagging: JpCpiPayload["series"] = { ...series, exFoodEnergy: series.exFoodEnergy.filter((p) => p.date !== "2026-09") };
  const now = new Date("2026-10-24T09:00:00Z");

  it("uses the latest month common to all four measures, never mixing months", () => {
    expect(latestBreakdown(lagging)?.row.date).toBe("2026-08");
    expect(latestCommonPeriod(lagging)).toBe("2026-08");
    expect(latestBreakdown({ ...series, exFoodEnergy: [] })).toBeNull();
    expect(breakdownRows({ ...series, exFoodEnergy: undefined as never })).toEqual([]);
  });

  it("puts the sentence into the hero only when its month equals the hero CPI month", () => {
    expect(heroSentence(series)).toBe("Energia obniża inflację o 0,3 p.p.; ceny bez żywności i energii rosną 2,2% r/r (miesiąc wcześniej 1,6%).");
    expect(heroSentence(lagging)).toBeNull(); // hero: CPI za wrzesień, rozbicie tylko za sierpień
    expect(heroSentence({ ...series, exFoodEnergy: [] })).toBeNull();
  });

  it("is checked as jp-cpi-breakdown: ok for a full set, lag when one measure is behind", () => {
    const spec = datasetById("jp-cpi-breakdown")!;
    expect(spec.endpoint(now)).toBe("/api/jp/cpi");
    expect(evaluateDataset(spec, extractJpCpiBreakdown({ series }), now).status).toBe("ok");
    expect(evaluateDataset(spec, extractJpCpiBreakdown({ series: lagging }), now).status).toBe("lag");
  });
});
