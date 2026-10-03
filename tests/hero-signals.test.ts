import { describe, expect, it } from "vitest";
import {
  daysBetween,
  evaluateSignal,
  nextPublication,
  publicationDate,
  rankHeroSignals,
  type HeroCandidate,
  type Point,
} from "@/lib/hero-signals";

const monthly = (start: string, values: number[]): Point[] => {
  const [y0, m0] = start.split("-").map(Number);
  return values.map((value, i) => {
    const m = m0 - 1 + i;
    const y = y0 + Math.floor(m / 12);
    return { date: `${y}-${String((m % 12) + 1).padStart(2, "0")}`, value };
  });
};

const macro = (over: Partial<HeroCandidate> & Pick<HeroCandidate, "id" | "kind" | "series">): HeroCandidate => ({
  label: over.id,
  unit: "%",
  decimals: 1,
  deltaMode: "pp",
  href: "/",
  ...over,
});

// Spokojna historia (zmiany ±0,1–0,2 p.p.), ostatni odczyt podawany osobno.
const calm = [3.0, 3.1, 3.0, 3.2, 3.1, 3.0, 3.1, 3.2, 3.1, 3.0, 3.1];

describe("calendar lookups", () => {
  it("dates the first publication of a period from the GUS calendar", () => {
    expect(publicationDate("retail", "2026-08")).toBe("2026-09-21");
    expect(publicationDate("industrial", "2026-08")).toBe("2026-09-21");
    expect(publicationDate("employment", "2026-08")).toBe("2026-09-24");
    // CPI: pierwsza publikacja = flash z ostatniego dnia roboczego miesiąca
    expect(publicationDate("cpi", "2026-09")).toBe("2026-09-30");
    expect(publicationDate("market", "2026-08")).toBeNull();
  });

  it("finds the next scheduled release, across the year boundary", () => {
    expect(nextPublication("retail", "2026-10-03")?.date).toBe("2026-10-20");
    expect(nextPublication("cpi", "2026-10-03")?.date).toBe("2026-10-15");
    // grudzień publikowany w styczniu kolejnego roku (~20.)
    expect(nextPublication("industrial", "2026-12-28")?.date.startsWith("2027-01-")).toBe(true);
    expect(publicationDate("retail", "2026-12")?.startsWith("2027-01-")).toBe(true);
  });

  it("counts calendar days", () => {
    expect(daysBetween("2026-09-21", "2026-10-03")).toBe(12);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });
});

describe("evaluateSignal", () => {
  it("measures the latest change against its own history", () => {
    const r = evaluateSignal(macro({ id: "retail", kind: "retail", series: monthly("2025-09", [...calm, 4.6]) }), "2026-10-03")!;
    expect(r.period).toBe("2026-08");
    expect(r.delta).toBe(1.5);
    expect(r.z).toBeGreaterThan(3);
    expect(r.biggestSince).toBe(10);
    expect(r.publishedOn).toBe("2026-09-21");
    expect(r.ageDays).toBe(12);
    expect(r.fresh).toBe(false);
  });

  it("flags CPI crossing the NBP target", () => {
    const r = evaluateSignal(macro({ id: "cpi", kind: "cpi", series: monthly("2026-06", [2.8, 2.6, 2.4]) }), "2026-09-01")!;
    expect(r.crossedTarget).toBe(true);
  });

  it("drops an ordinary market move", () => {
    const wig: Point[] = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, "0")}`,
      value: 2500 + (i % 2 ? 10 : -10),
    }));
    const r = evaluateSignal({ ...macro({ id: "wig20", kind: "market", series: wig }), deltaMode: "pct", unit: "pkt" }, "2026-10-01")!;
    expect(r.score).toBe(-Infinity);
  });

  it("works without a date (prerender) and never marks anything fresh", () => {
    const r = evaluateSignal(macro({ id: "cpi", kind: "cpi", series: monthly("2026-01", [3, 3.1, 3.2]) }), null)!;
    expect(r.ageDays).toBeNull();
    expect(r.fresh).toBe(false);
    expect(Number.isFinite(r.score)).toBe(true);
  });
});

describe("rankHeroSignals", () => {
  // Stan na 22.09.2026: CPI za sierpień (flash 31.08), sprzedaż za sierpień (21.09), bezrobocie za lipiec.
  const cpi = macro({ id: "cpi", kind: "cpi", weight: 1.3, series: monthly("2025-08", [...calm, 3.1, 3.0]) });
  const retailBig = macro({ id: "retail", kind: "retail", series: monthly("2025-09", [...calm, 4.6]) });
  const unemp = macro({ id: "unemp", kind: "employment", invert: true, weight: 0.8, series: monthly("2025-08", [...calm, 3.1]) });

  it("puts a fresh, unusually large reading ahead of a routine CPI print", () => {
    const ranked = rankHeroSignals([cpi, retailBig, unemp], "2026-09-22");
    expect(ranked[0].candidate.id).toBe("retail");
    expect(ranked[0].fresh).toBe(true);
  });

  it("keeps input order on ties so the layout is stable", () => {
    const a = macro({ id: "a", kind: "industrial", series: monthly("2026-01", [1, 1]) });
    const b = macro({ id: "b", kind: "industrial", series: monthly("2026-01", [1, 1]) });
    expect(rankHeroSignals([a, b], null).map((r) => r.candidate.id)).toEqual(["a", "b"]);
  });

  it("lets a fresh CPI flash that crosses the target lead", () => {
    const flash = macro({ id: "cpi", kind: "cpi", weight: 1.3, series: monthly("2025-10", [...calm.map((v) => v - 0.5), 2.3]) });
    const ranked = rankHeroSignals([flash, retailBig, unemp], "2026-10-01");
    expect(ranked[0].candidate.id).toBe("cpi");
    expect(ranked[0].crossedTarget).toBe(true);
  });

  it("skips empty series", () => {
    expect(rankHeroSignals([macro({ id: "x", kind: "retail", series: [] })], "2026-10-03")).toEqual([]);
  });
});
