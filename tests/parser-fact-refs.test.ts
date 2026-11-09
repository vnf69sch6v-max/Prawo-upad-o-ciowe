// PS3b-2b-1 (docs/specs/2026-11-09-parser-ps3b2-fakty-w-oknie-zrodla.md): fakty XBRL w oknie źródła.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { toJSON } from "@/lib/parser/export";
import { describeDecimals, describeScale, formatFactPeriod, formatFullValue } from "@/lib/parser/fact-view";
import { parseIxbrl } from "@/lib/parser/ixbrl/to-result";
import { readIxbrl } from "@/lib/parser/ixbrl/read";
import { parseReport } from "@/lib/parser/parser";
import { PER_SHARE_KEYS } from "@/lib/parser/ixbrl/concepts";

const NBSP = " ";
const html = (n: string) => readFileSync(`tests/fixtures/ixbrl/${n}.htm`, "utf8");
const spacex = parseIxbrl(html("spacex-10q-q3-2026"));
const cipher = parseIxbrl(html("cipher-10k-fy2025"));

describe("factRefs — SpaceX 10-Q", () => {
  const refs = spacex.factRefs!.revenue!;
  it("przychody: 4 okresy, pierwszy to f-137 / c-14", () => {
    expect(refs).toHaveLength(4);
    const f = refs[0];
    expect(f).toMatchObject({
      factId: "f-137", contextId: "c-14", decimals: "-6", scale: 6, value: 14_575_000_000,
      qname: "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax",
    });
    expect(f.period.endsWith("|2026-09-30")).toBe(true);
    expect(f.unit).toMatch(/usd/i);
    expect(refs.map((r) => r.factId)).toEqual(["f-137", "f-138", "f-139", "f-140"]);
  });
  it("kontekst faktu zgadza się z dokumentem", () => {
    const doc = readIxbrl(html("spacex-10q-q3-2026"));
    expect(doc.facts.find((x) => x.factId === "f-137")?.sig).toBe(refs[0].period);
  });
});

describe("factRefs — Cipher 10-K", () => {
  it("przychody FY25: f-171 / c-1, skala tysięczna", () => {
    expect(cipher.factRefs!.revenue![0]).toMatchObject({
      factId: "f-171", contextId: "c-1", decimals: "-3", scale: 3, value: 223_942_000,
    });
    expect(cipher.factRefs!.revenue!.map((r) => r.factId)).toEqual(["f-171", "f-172", "f-173"]);
  });
});

describe("factRefs — spójność z metrykami", () => {
  for (const [name, r] of [["SpaceX", spacex], ["Cipher", cipher]] as const) {
    it(`${name}: wartość faktu w jednostkach raportu = wartość metryki; LOW i totalDebt bez wpisu`, () => {
      const unit = r.detection.unitScale;
      for (const [key, list] of Object.entries(r.factRefs!)) {
        const m = r.metrics.find((x) => x.key === key)!;
        expect(m.confidence).toBe("HIGH");
        for (const f of list!) {
          const shown = m.values.find((v) => v.periodKey === f.periodKey)!.value!;
          // EPS i DPS w dolarach na akcję, reszta w jednostkach raportu; akcje (liczby sztuk) sprawdzamy z oboma kształtami
          const candidates = PER_SHARE_KEYS.includes(key as never) ? [f.value, f.value / unit] : [f.value / unit];
          expect(candidates.some((e) => Math.abs(e - shown) < 1e-6 * Math.max(1, Math.abs(shown))), `${key} ${f.periodKey}`).toBe(true);
        }
      }
      expect(r.factRefs!.totalDebt).toBeUndefined();
      for (const m of r.metrics.filter((x) => x.confidence === "LOW")) expect(r.factRefs![m.key]).toBeUndefined();
    });
  }
});

describe("factRefs — nie wyciekają", () => {
  it("toJSON nie zawiera factRefs, a reszta wyniku jest ta sama", () => {
    const out = JSON.parse(toJSON(spacex));
    expect("factRefs" in out).toBe(false);
    const { rawText, factRefs, ...rest } = spacex;
    void rawText; void factRefs;
    expect(out).toEqual(JSON.parse(JSON.stringify(rest)));
  });
  it("PDF/TXT nie ma klucza factRefs", () => {
    const text = readFileSync("tests/fixtures/microsoft-10q.txt", "utf8");
    expect("factRefs" in parseReport({ text, pages: 1, charCount: text.length })).toBe(false);
  });
});

describe("fact-view", () => {
  it("describeDecimals", () => {
    expect(describeDecimals("-6")).toContain("milion");
    expect(describeDecimals("-3")).toContain("tysi");
    expect(describeDecimals("INF")).toContain("dokładnie");
    expect(describeDecimals(null)).toContain("nie podano");
    expect(describeDecimals("2")).toContain("2 miejsc");
  });
  it("formatFullValue: twarde spacje, jednostka osobno, ujemne z U+2212", () => {
    expect(formatFullValue(14_575_000_000, "USD")).toBe(`14${NBSP}575${NBSP}000${NBSP}000${NBSP}USD`);
    expect(formatFullValue(-1234, "shares")).toBe(`−1${NBSP}234${NBSP}shares`);
    expect(formatFullValue(0.85, "USD/shares")).toBe(`0,85${NBSP}USD/shares`);
    expect(formatFullValue(12, null)).toBe("12");
  });
  it("okres i skala", () => {
    expect(formatFactPeriod("2026-07-01|2026-09-30")).toBe("2026-07-01 → 2026-09-30");
    expect(formatFactPeriod("2025-12-31")).toBe("2025-12-31");
    expect(describeScale(6)).toBe("10^6 · mln");
  });
});
