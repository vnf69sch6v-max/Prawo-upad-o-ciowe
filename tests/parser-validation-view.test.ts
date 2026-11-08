// PS3b-2a (docs/specs/2026-11-08-parser-ps3b2-kontrole-spojnosci.md): widok kontroli spójności.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validationNamePl } from "@/lib/parser/copy.pl";
import { parseIxbrl } from "@/lib/parser/ixbrl/to-result";
import { parseReport } from "@/lib/parser/parser";
import { formatEquationPl, summarizeValidation } from "@/lib/parser/validation-view";

const NBSP = " ";
const spacexHtml = readFileSync("tests/fixtures/ixbrl/spacex-10q-q3-2026.htm", "utf8");
const cipherHtml = readFileSync("tests/fixtures/ixbrl/cipher-10k-fy2025.htm", "utf8");
const view = (html: string) => {
  const r = parseIxbrl(html);
  return { r, v: summarizeValidation(r.validation, r.detection) };
};

describe("summarizeValidation — XBRL", () => {
  it("SpaceX 5/5 i Cipher 4/4: stan ok", () => {
    const s = view(spacexHtml).v;
    expect(s).toMatchObject({ state: "ok", total: 5, passed: 5, failed: [] });
    const c = view(cipherHtml).v;
    expect(c).toMatchObject({ state: "ok", total: 4, passed: 4 });
  });

  it("nazwy kontroli bilansu niosą okres, po polsku", () => {
    const names = view(spacexHtml).v.items.map((i) => i.namePl);
    expect(names).toContain(`Aktywa = Zobowiązania + mezzanine + Kapitał (FY25 close)`);
    expect(names).toContain("Suma segmentów = Przychody razem");
  });

  it("zmieniony fakt Assets (31.12.2025 +1 000 mln) → fail, jedna kontrola, równanie z „93 079”", () => {
    const mutated = spacexHtml.replace(/(name="us-gaap:Assets"[^>]*>)92,079/, "$193,079");
    expect(mutated).not.toBe(spacexHtml);
    const { v } = view(mutated);
    expect(v.state).toBe("fail");
    expect(v.failed).toHaveLength(1);
    expect(v.failed[0].namePl).toContain("Aktywa");
    expect(v.failed[0].namePl).toContain("FY25 close");
    expect(v.failed[0].equationPl).toContain(`93${NBSP}079`);
  });

  it("jednostka raportu w zdaniu pod listą", () => {
    expect(view(spacexHtml).v.unitNote).toBe("mln USD");
  });
});

describe("summarizeValidation — nazwy z PDF/TXT", () => {
  it("żadna nazwa z fixture'ów PDF/TXT ani XBRL nie zostaje po angielsku", () => {
    const names = new Set<string>();
    for (const f of ["microsoft-10q", "cipher-digital-10q", "nvidia-10q", "spacex-10q-q3-2026", "kombinat-konopny-2q2026", "polish-ifrs-slash"]) {
      const text = readFileSync(`tests/fixtures/${f}.txt`, "utf8");
      for (const c of parseReport({ text, pages: 1, charCount: text.length }).validation.checks) names.add(c.name);
    }
    for (const html of [spacexHtml, cipherHtml]) for (const c of parseIxbrl(html).validation.checks) names.add(c.name);
    expect(names.size).toBeGreaterThan(4);
    for (const n of names) expect(validationNamePl(n), n).not.toBe(n);
  });

  it("brak kontroli → stan none", () => {
    expect(summarizeValidation({ checks: [], passed: 0, total: 0 }, { unitScale: 1, currency: null }).state).toBe("none");
  });
});

describe("formatEquationPl", () => {
  it("grupy tysięcy twardą spacją, przecinek dziesiętny", () => {
    expect(formatEquationPl("38,752 vs 1,234.5")).toBe(`38${NBSP}752 vs 1${NBSP}234,5`);
  });
  it("liczba ujemna po operatorze w nawiasie, na początku goła", () => {
    expect(formatEquationPl("4,014 − -390")).toBe(`4${NBSP}014 − (−390)`);
    expect(formatEquationPl("-421,563 + -403,994")).toBe(`−421${NBSP}563 + (−403${NBSP}994)`);
  });
  it("liczba bez separatora zostaje", () => {
    expect(formatEquationPl("2791 vs 12")).toBe("2791 vs 12");
  });
});
