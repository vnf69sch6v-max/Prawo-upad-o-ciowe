import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dashboardUrl, parseDashboardData, type DashboardQuery } from "@/lib/jp/stat-dashboard";
import { JP_CPI_SERIES, changePp, chartRows, jpCpiIsEmpty, type JpCpiPayload } from "@/lib/jp/cpi";
import { expectedJpCpi, jstDateKey, latestReleasedPeriod, nextRelease, publishedOn } from "@/lib/jp/calendar";
import { evaluateDataset, datasetById, extractJpCpi } from "@/lib/freshness";

// Utrwalone odpowiedzi Statistics Dashboard API z 24.10.2026 (TimeFrom=202501, MetaGetFlg=Y).
const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, "utf8"));
const cfg = (id: string) => JP_CPI_SERIES.find((s) => s.id === id)!.query;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

describe("parseDashboardData", () => {
  it("reads national CPI y/y (2025 base) month by month", () => {
    const s = parseDashboardData(fixture("dashboard-cpi-headline"), cfg("headline"));
    expect(s.name).toContain("2025年基準");
    expect(s.points[0].date).toBe("2025-01");
    expect(s.points.at(-1)).toEqual({ date: "2026-09", value: 2.1 });
    expect(s.points).toHaveLength(21);
  });

  it("reads the Tokyo ku-area series for region 13100", () => {
    const s = parseDashboardData(fixture("dashboard-cpi-tokyo"), cfg("tokyo"));
    expect(s.points.at(-1)).toEqual({ date: "2026-09", value: 2.7 });
  });

  it("fails loudly on an unknown series instead of returning nothing", () => {
    expect(() => parseDashboardData(fixture("dashboard-error"), cfg("headline"))).toThrow(/brak danych/);
  });

  it("rejects a series whose name does not match (wrong measure or old base)", () => {
    const q: DashboardQuery = { ...cfg("headline"), mustInclude: ["2020年基準"] };
    expect(() => parseDashboardData(fixture("dashboard-cpi-headline"), q)).toThrow(/brak „2020年基準"/);
    // core CPI config against the headline answer — the measure fragment does not match
    expect(() => parseDashboardData(fixture("dashboard-cpi-headline"), { ...cfg("core"), indicator: cfg("headline").indicator }))
      .toThrow(/生鮮食品を除く総合/);
  });

  it("rejects values for another region", () => {
    expect(() => parseDashboardData(fixture("dashboard-cpi-headline"), { ...cfg("headline"), region: "13100" })).toThrow(/oczekiwano/);
  });

  it("flags provisional (速報) months and prefers the final value for the same month", () => {
    const json = clone(fixture("dashboard-cpi-tokyo"));
    const data = json.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ;
    const last = data.at(-1).VALUE;
    data.push({ VALUE: { ...last, "@time": "20261000", "@isProvisional": "1", $: "2.4" } });
    data.push({ VALUE: { ...last, "@isProvisional": "1", $: "9.9" } }); // provisional duplicate of a final month
    data.push({ VALUE: { ...last, "@time": "20261100", $: "-" } }); // no value yet
    const s = parseDashboardData(json, cfg("tokyo"));
    expect(s.points.at(-1)).toEqual({ date: "2026-10", value: 2.4, provisional: true });
    expect(s.points.find((p) => p.date === "2026-09")).toEqual({ date: "2026-09", value: 2.7 });
    expect(s.points.some((p) => p.date === "2026-11")).toBe(false);
  });

  it("builds the request the parser expects", () => {
    const url = new URL(dashboardUrl(cfg("tokyo")));
    expect(url.searchParams.get("RegionCode")).toBe("13100");
    expect(url.searchParams.get("RegionalRank")).toBe("4");
    expect(url.searchParams.get("TimeFrom")).toBe("19900100");
    expect(url.searchParams.get("MetaGetFlg")).toBe("Y");
  });
});

describe("JP CPI release calendar (8:30 JST)", () => {
  it("switches to September exactly at 8:30 JST on 23.10 (23:30 UTC the day before)", () => {
    expect(latestReleasedPeriod("national", new Date("2026-10-22T23:29:00Z"))).toBe("2026-08");
    expect(latestReleasedPeriod("national", new Date("2026-10-22T23:30:00Z"))).toBe("2026-09");
  });

  it("knows the next Tokyo preliminary and national releases", () => {
    const now = new Date("2026-10-24T09:00:00Z");
    expect(nextRelease("tokyo", now)).toEqual({ period: "2026-10", date: "2026-10-30" });
    expect(nextRelease("national", now)).toEqual({ period: "2026-10", date: "2026-11-20" });
  });

  it("dates a reading by the release that put it on the site", () => {
    expect(publishedOn("headline", { date: "2026-09", value: 2.1 })).toBe("2026-10-23");
    expect(publishedOn("tokyo", { date: "2026-10", value: 2.4, provisional: true })).toBe("2026-10-30");
    // final Tokyo numbers come with the national release
    expect(publishedOn("tokyo", { date: "2026-09", value: 2.7 })).toBe("2026-10-23");
  });

  it("falls back to a heuristic when the calendar runs out, and says so", () => {
    expect(expectedJpCpi(new Date("2026-10-24T09:00:00Z"))).toEqual({ period: "2026-09", fromCalendar: true });
    expect(expectedJpCpi(new Date("2027-06-01T03:00:00Z"))).toEqual({ period: "2027-04", fromCalendar: false });
    expect(expectedJpCpi(new Date("2027-06-26T03:00:00Z"))).toEqual({ period: "2027-05", fromCalendar: false });
  });

  it("uses the Japanese date, not the UTC one", () => {
    expect(jstDateKey(new Date("2026-10-22T23:30:00Z"))).toBe("2026-10-23");
  });
});

describe("payload helpers and freshness", () => {
  const payload: JpCpiPayload = {
    series: {
      headline: [{ date: "2026-08", value: 1.9 }, { date: "2026-09", value: 2.1 }],
      core: [{ date: "2026-08", value: 1.7 }, { date: "2026-09", value: 1.8 }],
      coreCore: [{ date: "2026-09", value: 1.9 }],
      exFoodEnergy: [],
      tokyo: [{ date: "2026-09", value: 2.7 }, { date: "2026-10", value: 2.4, provisional: true }],
    },
    source: "test",
    fetchedAt: "2026-10-24T00:00:00Z",
  };

  it("computes month-on-month change of the y/y rate", () => {
    expect(changePp(payload.series.headline)).toBe(0.2);
    expect(changePp(payload.series.coreCore)).toBeNull();
  });

  it("merges series into chart rows without inventing values", () => {
    const rows = chartRows(payload.series);
    expect(rows.map((r) => r.date)).toEqual(["2026-08", "2026-09", "2026-10"]);
    expect(rows[2]).toEqual({ date: "2026-10", tokyo: 2.4 });
  });

  it("treats a payload with only empty series as empty", () => {
    expect(jpCpiIsEmpty(payload)).toBe(false);
    expect(jpCpiIsEmpty({ ...payload, series: { headline: [], core: [], coreCore: [], exFoodEnergy: [], tokyo: [] } })).toBe(true);
  });

  it("is checked by the freshness monitor against the JST calendar", () => {
    const spec = datasetById("jp-cpi")!;
    expect(spec.endpoint(new Date())).toBe("/api/jp/cpi");
    expect(extractJpCpi(payload)).toBe("2026-09");
    expect(evaluateDataset(spec, "2026-09", new Date("2026-10-24T09:00:00Z")).status).toBe("ok");
    expect(evaluateDataset(spec, "2026-08", new Date("2026-10-24T09:00:00Z")).status).toBe("lag");
    expect(evaluateDataset(spec, "2026-07", new Date("2026-10-24T09:00:00Z")).status).toBe("stale");
  });
});
