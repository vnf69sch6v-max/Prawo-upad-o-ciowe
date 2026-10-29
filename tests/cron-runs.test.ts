import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CRON_SPECS, attentionLine, cronAttention, evaluateCronRuns, formatSeconds, slowestRoute, summarizeResults, type CronRun } from "@/lib/cron-runs";

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

  it("flags a run where most endpoints failed, and a partial one as partial (not ok)", () => {
    const st = (ok: number, total: number) => byGroup({ refresh: run("2026-10-04T06:01:00Z", ok, total) }, "2026-10-04T08:00:00Z").refresh.status;
    expect(st(10, 40)).toBe("failing");
    expect(st(0, 2)).toBe("failing");
    // Do 10.2026 „30/40” i „1/2” były „Działa” — dbw-1 z gus-cpi-full → 504 świecił na zielono.
    expect(st(30, 40)).toBe("partial");
    expect(st(1, 2)).toBe("partial");
    expect(st(54, 55)).toBe("partial");
    expect(st(2, 2)).toBe("ok");
    // spóźnienie ma pierwszeństwo przed częściową awarią
    expect(byGroup({ "dbw-1": run("2026-10-03T09:41:00Z", 1, 2) }, "2026-10-04T12:00:00Z")["dbw-1"].status).toBe("late");
  });

  it("labels the jp cron by what it refreshes", () => {
    expect(CRON_SPECS.jp.label).toBe("Japonia — wszystkie wskaźniki");
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

describe("route timings", () => {
  it("keeps call order, drops refresh=1, caps at 30, absent without timings", () => {
    const eps = ["/api/gus-cpi-full?refresh=1", "/api/bdl-series?start=461680&count=12&refresh=1", "/api/gus-regional"];
    const s = summarizeResults(Object.fromEntries(eps.map((e) => [e, 200])), Date.now(), undefined, eps.map((ep, i) => ({ ep, ms: i * 10 })));
    expect(s.routes).toEqual([
      { ep: "/api/gus-cpi-full", ms: 0 },
      { ep: "/api/bdl-series?start=461680&count=12", ms: 10 },
      { ep: "/api/gus-regional", ms: 20 },
    ]);
    const many = Array.from({ length: 31 }, (_, i) => ({ ep: `/api/x${i}?refresh=1`, ms: i }));
    expect(summarizeResults({}, Date.now(), undefined, many).routes).toHaveLength(30);
    expect("routes" in summarizeResults({ "/api/a": 200 }, Date.now())).toBe(false);
  });

  it("finds the slowest route and formats seconds the Polish way", () => {
    expect(formatSeconds(24_900)).toBe("24,9 s");
    expect(slowestRoute(run("2026-10-04T09:41:00Z"))).toBeNull();
    expect(slowestRoute(null)).toBeNull();
    expect(slowestRoute({ ...run("2026-10-04T09:41:00Z"), routes: [{ ep: "/api/a", ms: 5 }, { ep: "/api/gus-cpi-full", ms: 24_900 }] }))
      .toEqual({ ep: "/api/gus-cpi-full", ms: 24_900 });
  });
});

describe("attention", () => {
  const NOW = "2026-10-04T12:00:00Z";
  const report = (runs: Record<string, CronRun>) => evaluateCronRuns(runs, new Date(NOW));
  const fresh = (ok: number, total: number) => run("2026-10-04T11:00:00Z", ok, total);

  it("collects partial, failing and late groups; skips ok and never", () => {
    const items = report({ "dbw-1": fresh(1, 2), "dbw-2": fresh(0, 2), "dbw-3": run("2026-10-02T15:40:00Z"), "dbw-4": fresh(3, 3) });
    expect(cronAttention(items).sort()).toEqual(["dbw-1", "dbw-2", "dbw-3"]);
    expect(cronAttention(report({}))).toEqual([]);
  });

  it("summary line: none, one, many (Polish plurals)", () => {
    const total = Object.keys(CRON_SPECS).length;
    expect(attentionLine(report({ "dbw-1": fresh(2, 2) }))).toBeNull();
    expect(attentionLine(report({ "dbw-1": fresh(1, 2) }))).toBe(`Automat: 1 z ${total} cronów wymaga uwagi — GUS — inflacja CPI`);
    const four = attentionLine(report({ "dbw-1": fresh(1, 2), "dbw-2": fresh(1, 2), "dbw-3": fresh(1, 2), "dbw-4": fresh(1, 3) }));
    expect(four).toBe(`Automat: 4 z ${total} cronów wymagają uwagi — GUS — inflacja CPI, GUS — produkcja, budownictwo, sprzedaż i 2 inne`);
  });
});

describe("cron coverage (vercel.json ↔ CRON_SPECS)", () => {
  // Bez wpisu w dzienniku: `gus` — cotygodniowe zapytanie do BDL, nic nie zapisuje; `news-digest` — ROADMAP 4.
  const EXCEPTIONS = new Set(["gus", "news-digest"]);
  const crons = (JSON.parse(readFileSync("vercel.json", "utf8")).crons as { path: string }[]).map((c) => c.path.replace("/api/cron/", ""));
  const groupOf = (name: string) => {
    const src = readFileSync(`src/app/api/cron/${name}/route.ts`, "utf8");
    return /warmEndpoints\([^;]*?'([\w-]+)'(?:,\s*\d+)?\)/.exec(src)?.[1] ?? /recordCronRun\('([\w-]+)'/.exec(src)?.[1] ?? null;
  };

  it("every scheduled cron logs to a group shown on /status (or is a listed exception)", () => {
    for (const name of crons) {
      if (EXCEPTIONS.has(name)) continue;
      const g = groupOf(name);
      expect(g, name).not.toBeNull();
      expect(CRON_SPECS[g!], `${name} → ${g}`).toBeDefined();
    }
  });

  it("every /status group has a scheduled cron", () => {
    const logged = new Set(crons.filter((n) => !EXCEPTIONS.has(n)).map(groupOf));
    for (const g of Object.keys(CRON_SPECS)) expect(logged.has(g), g).toBe(true);
  });
});
