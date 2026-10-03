import { describe, expect, it } from "vitest";
import { CRON_SPECS, evaluateCronRuns, summarizeResults, type CronRun } from "@/lib/cron-runs";

const run = (at: string, ok = 3, total = 3): CronRun => ({ at, ok, total, ms: 1000, failed: [] });
const byGroup = (runs: Record<string, CronRun>, now: string) =>
  Object.fromEntries(evaluateCronRuns(runs, new Date(now)).map((r) => [r.group, r]));

describe("evaluateCronRuns", () => {
  it("lists every scheduled group, never-run ones included", () => {
    const r = byGroup({}, "2026-10-04T12:00:00Z");
    expect(Object.keys(r).sort()).toEqual(Object.keys(CRON_SPECS).sort());
    expect(r["dbw-1"].status).toBe("never");
    expect(r["dbw-1"].ageHours).toBeNull();
  });

  it("is ok within a day and late after 26 h for daily crons", () => {
    expect(byGroup({ "dbw-1": run("2026-10-04T09:41:00Z") }, "2026-10-04T12:00:00Z")["dbw-1"].status).toBe("ok");
    expect(byGroup({ "dbw-1": run("2026-10-03T09:41:00Z") }, "2026-10-04T11:00:00Z")["dbw-1"].status).toBe("ok");
    expect(byGroup({ "dbw-1": run("2026-10-03T09:41:00Z") }, "2026-10-04T12:00:00Z")["dbw-1"].status).toBe("late");
  });

  it("gives weekday-only crons the weekend", () => {
    // piątek 13:00 → poniedziałek 12:00 = 71 h
    expect(byGroup({ nbp: run("2026-10-02T13:00:00Z") }, "2026-10-05T12:00:00Z").nbp.status).toBe("ok");
    expect(byGroup({ nbp: run("2026-10-02T13:00:00Z") }, "2026-10-05T15:30:00Z").nbp.status).toBe("late");
  });

  it("flags a run where most endpoints failed", () => {
    expect(byGroup({ refresh: run("2026-10-04T06:01:00Z", 10, 40) }, "2026-10-04T08:00:00Z").refresh.status).toBe("failing");
    expect(byGroup({ refresh: run("2026-10-04T06:01:00Z", 30, 40) }, "2026-10-04T08:00:00Z").refresh.status).toBe("ok");
  });
});

describe("summarizeResults", () => {
  it("counts non-200 results and trims query strings", () => {
    const s = summarizeResults({ "/api/a?refresh=1": 200, "/api/b?x=1&refresh=1": 429, "/api/c": "error: timeout" }, Date.now() - 50);
    expect(s.ok).toBe(1);
    expect(s.total).toBe(3);
    expect(s.failed).toEqual(["/api/b?… → 429", "/api/c → error: timeout"]);
    expect(s.ms).toBeGreaterThanOrEqual(50);
  });
});
