import { describe, expect, it } from "vitest";
import { nbpBehindToday } from "@/lib/market-hours";

describe("nbpBehindToday", () => {
  const thu1430 = new Date("2026-10-15T12:30:00Z"); // czwartek, 14:30 w Warszawie

  it("flags yesterday's table once NBP has published today (after 12:15, working day)", () => {
    expect(nbpBehindToday("2026-10-14", thu1430)).toBe(true);
    expect(nbpBehindToday("2026-10-15", thu1430)).toBe(false);
  });

  it("leaves yesterday's table alone before the 12:15 publication", () => {
    expect(nbpBehindToday("2026-10-14", new Date("2026-10-15T10:10:00Z"))).toBe(false); // 12:10
    expect(nbpBehindToday("2026-10-14", new Date("2026-10-15T10:15:00Z"))).toBe(true); // 12:15
  });

  it("never fires at weekends or without a date", () => {
    expect(nbpBehindToday("2026-10-16", new Date("2026-10-17T12:00:00Z"))).toBe(false); // sobota
    expect(nbpBehindToday(null, thu1430)).toBe(false);
  });
});
