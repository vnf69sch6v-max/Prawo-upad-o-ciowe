// PS3a (docs/specs/2026-11-07-parser-ixbrl-html.md): czytnik inline XBRL + ParseResult z faktów. Fixture'y to przycięte pliki z EDGAR
// (oryginalne znaczniki faktów): SpaceX 10-Q Q3 2026 (CIK 1181412, acc. 0001628280-26-066880) i Cipher Digital 10-K FY2025
// (CIK 1819989, acc. 0001819989-26-000009); generuje je scripts/make-ixbrl-fixture.ts. Pełne pliki (2,3 MB) sprawdza się tylko, gdy
// ustawiono IXBRL_FULL_DIR (SpaceX_10-Q_Q3_2026.html, Cipher_Digital_10-K_FY2025.html).
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IxbrlError, parseIxNumber, readIxbrl } from "@/lib/parser/ixbrl/read";
import { parseIxbrl } from "@/lib/parser/ixbrl/to-result";
import { getMetric } from "@/lib/parser/parser";
import type { MetricKey } from "@/lib/parser/types";

const NS = `xmlns="http://www.w3.org/1999/xhtml" xmlns:ix="http://www.xbrl.org/2013/inlineXBRL" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:us-gaap="http://fasb.org/us-gaap/2025" xmlns:dei="http://xbrl.sec.gov/dei/2025" xmlns:xbrldi="http://xbrl.org/2006/xbrldi"`;
const CTX = `<xbrli:context id="d"><xbrli:entity><xbrli:identifier scheme="x">1</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>`
  + `<xbrli:context id="s"><xbrli:entity><xbrli:identifier scheme="x">1</xbrli:identifier><xbrli:segment><xbrldi:explicitMember dimension="us-gaap:StatementBusinessSegmentsAxis">a:SegMember</xbrldi:explicitMember></xbrli:segment></xbrli:entity><xbrli:period><xbrli:startDate>2025-01-01</xbrli:startDate><xbrli:endDate>2025-12-31</xbrli:endDate></xbrli:period></xbrli:context>`
  + `<xbrli:unit id="usd"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>`;
const doc = (body: string, ns = NS) => `<html ${ns}><body><ix:header><ix:resources>${CTX}</ix:resources></ix:header><table>${body}</table></body></html>`;
const one = (attr: string, text: string) =>
  readIxbrl(doc(`<tr><td>Revenue</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="d" unitRef="usd" ${attr}>${text}</ix:nonFraction></td></tr>`)).facts[0];

describe("czytnik iXBRL — przypadki syntetyczne", () => {
  it("scale, sign, num-dot-decimal, etykieta wiersza", () => {
    const f = one('scale="6" decimals="-6" format="ixt:num-dot-decimal" sign="-"', "1,054");
    expect(f).toMatchObject({ concept: "Revenues", family: "us-gaap", value: -1054e6, scale: 6, unit: "USD", rowLabel: "Revenue", sig: "2025-01-01|2025-12-31" });
  });
  it("`>` w wartości atrybutu nie rwie znacznika", () => {
    expect(readIxbrl(doc(`<tr><td>x</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="d" unitRef="usd" title="a > b" scale="0">5</ix:nonFraction></td></tr>`)).facts[0].value).toBe(5);
  });
  it("zagnieżdżony nonFraction (nawias wokół wartości): oba fakty, bez zgubienia stosu", () => {
    const d = readIxbrl(doc(`<tr><td>Par</td><td><ix:nonFraction name="us-gaap:A" contextRef="d" unitRef="usd" scale="0"><ix:nonFraction name="us-gaap:B" contextRef="d" unitRef="usd" scale="0">7</ix:nonFraction></ix:nonFraction></td></tr>`));
    expect(d.facts.map((f) => f.concept).sort()).toEqual(["A", "B"]);
    expect(d.facts.find((f) => f.concept === "B")?.value).toBe(7);
  });
  it("xsi:nil pominięty, fixed-zero = 0, num-comma-decimal „1 234,5” = 1234,5", () => {
    expect(readIxbrl(doc(`<tr><td>x</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="d" unitRef="usd" xsi:nil="true"></ix:nonFraction></td></tr>`)).facts).toHaveLength(0);
    expect(one('format="ixt:fixed-zero"', "—").value).toBe(0);
    expect(parseIxNumber("1 234,5", "ixt:num-comma-decimal")).toBe(1234.5);
    expect(parseIxNumber("1.234,5", "ixt:numcommadecimal")).toBe(1234.5);
  });
  it("nieznany format pominięty i policzony w ostrzeżeniu, nigdy zgadywany", () => {
    const d = readIxbrl(doc(`<tr><td>x</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="d" unitRef="usd" format="ixt-sec:numwordsen">eleven</ix:nonFraction></td></tr>`));
    expect(d.facts).toHaveLength(0);
    expect(d.warnings.join()).toContain("numwordsen");
    expect(parseIxNumber("1,234", undefined)).toBeNull(); // bez formatu przecinek = pominięty
  });
  it("kontekst z wymiarem = segment (dims), bez wymiarów = skonsolidowany", () => {
    const d = readIxbrl(doc(`<tr><td>a</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="s" unitRef="usd" scale="0">3</ix:nonFraction></td></tr>`));
    expect(d.facts[0].dims).toEqual(["us-gaap:StatementBusinessSegmentsAxis=a:SegMember"]);
  });
  it("inny prefiks niż ix: (przestrzeń nazw decyduje)", () => {
    const ns = NS.replace("xmlns:ix=", "xmlns:ixt1=").replace("xmlns:us-gaap=", "xmlns:gaap=");
    const d = readIxbrl(`<html ${ns}><body><ixt1:header><ixt1:resources>${CTX}</ixt1:resources></ixt1:header><table><tr><td>r</td><td><ixt1:nonFraction name="gaap:Revenues" contextRef="d" unitRef="usd" scale="0">9</ixt1:nonFraction></td></tr></table></body></html>`);
    expect(d.facts[0]).toMatchObject({ concept: "Revenues", family: "us-gaap", value: 9 });
  });
  it("brak iXBRL i niezbalansowany stos to błędy, nie wyniki", () => {
    expect(() => readIxbrl("<html><body><table><tr><td>Revenue</td><td>1</td></tr></table></body></html>")).toThrow(IxbrlError);
    expect(() => readIxbrl(doc(`<tr><td>x</td><td><ix:nonFraction name="us-gaap:Revenues" contextRef="d" unitRef="usd">1</td></tr>`))).toThrow(/Unbalanced/);
  });
});

const fixture = (name: string) => parseIxbrl(readFileSync(`tests/fixtures/ixbrl/${name}.htm`, "utf8"));
const vals = (r: ReturnType<typeof parseIxbrl>, key: MetricKey) => getMetric(r, key)!.values.map((v) => v.value);

describe("SpaceX 10-Q Q3 2026 z XBRL = wartości z PDF (PS2a) i z komunikatu", () => {
  const r = fixture("spacex-10q-q3-2026");
  it("detection i kolumny", () => {
    expect(r.detection).toMatchObject({ structureLabel: "SEC 10-Q · Space Exploration Technologies Corp.", currency: "USD", unitScale: 1e6, unitLabel: "in millions" });
    expect(r.detection.periods.income.map((p) => p.short)).toEqual(["Q3 FY26", "Q3 FY25", "9M FY26", "9M FY25"]);
    // bieżące = najnowszy okres każdej długości (kafle i Δ r/r): Q3'26 i 9M'26
    expect(r.detection.periods.income.map((p) => p.current)).toEqual([true, false, true, false]);
    expect(r.detection.periods.balance.map((p) => p.short)).toEqual(["FY26 · Sep 30", "FY25 close"]);
  });
  it.each([
    ["revenue", [14575, 5576, 27083, 13714]], ["costOfRevenue", [5478, 2705, 11361, 6949]],
    ["rAndD", [4596, 2291, 11658, 5806]], ["sga", [1707, 575, 3365, 1674]], ["totalOpEx", [11784, 5849, 26378, 14930]],
    ["operatingIncome", [2791, -273, 705, -1216]], ["interestExpense", [675, 514, 1968, 1372]],
    ["otherIncome", [1025, 140, -937, 342]], ["incomeBeforeTax", [4014, -492, -774, -1876]],
    ["incomeTax", [-390, 562, -361, 714]], ["netIncome", [4404, -1054, -413, -2590]],
    ["epsBasic", [0.37, -0.36, -0.15, -0.89]], ["weightedSharesBasic", [11942, 2941, 7274, 2915]],
    ["ocf", [null, null, 13097, 4120]], ["capex", [null, null, 48069, 13846]],
    ["depreciationAmortization", [null, null, 8934, 4784]], ["stockComp", [null, null, 3833, 1044]], ["buybacks", [null, null, 4426, 525]],
    ["currentDebt", [2698, 928]], ["longTermDebt", [36146, 21968]], ["totalDebt", [38844, 22896]],
    ["accountsReceivable", [4772, 1579]], ["shortTermInvestments", [38561, 0]], ["cash", [51294, 24747]], ["totalAssets", [254045, 92079]],
  ] as const)("%s", (key, expected) => expect(vals(r, key)).toEqual(expected));
  it("EPS rozwodniony Q3'26 0,35; FCF 9M −34 972 / −9 726; gotówka netto 51 011", () => {
    expect(vals(r, "epsDiluted")[0]).toBe(0.35);
    expect(r.derived.fcf.map((f) => f.fcf)).toEqual([null, null, -34972, -9726]);
    expect(r.netCash).toMatchObject({ totalDebt: 38844, cash: 51294, netCashInclStInv: 51011 });
  });
  it("wszystkie kontrole przechodzą, także mezzanine 31.12.2025 (38 752)", () => {
    expect(r.validation.passed).toBe(r.validation.total);
    expect(r.validation.total).toBeGreaterThanOrEqual(4);
    expect(r.validation.checks.find((c) => c.detail.includes("38,752"))?.passed).toBe(true);
  });
  it("źródło: etykieta wiersza i pojęcie; wyciąg faktów jest rawText", () => {
    const m = getMetric(r, "revenue")!;
    expect(m.note).toBe("us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax");
    expect(m.matchedLabel).toBe("Revenue");
    expect(r.rawText.split("\n")[m.sourceLine!]).toContain("Revenue");
    expect(r.segments).toBeNull();
  });
});

describe("Cipher Digital 10-K FY2025 (tys. USD): wartości zgodne z komunikatem i API SEC", () => {
  const r = fixture("cipher-10k-fy2025");
  it("detection i kolumny", () => {
    expect(r.detection).toMatchObject({ structureLabel: "SEC 10-K · Cipher Digital Inc.", unitScale: 1e3, unitLabel: "in thousands" });
    expect(r.detection.periods.income.map((p) => p.short)).toEqual(["FY25", "FY24", "FY23"]);
    expect(r.detection.periods.balance).toHaveLength(2);
  });
  it.each([
    ["revenue", [223942, 151270, 126842]], ["costOfRevenue", [81216, 62364, 50309]], ["operatingIncome", [-421563, -43699, -20115]],
    ["incomeBeforeTax", [-825557, -44317, -22210]], ["incomeTax", [-3313, 318, 3567]], ["netIncome", [-822244, -44635, -25777]],
    ["epsBasic", [-2.15, -0.14, -0.1]], ["depreciationAmortization", [198973, 102448, 59093]], ["stockComp", [52787, 42132, 38470]],
    ["ocf", [-207938, -87511, -94241]], ["capex", [487921, 139495, 20480]],
    ["cash", [628263, 5585]], ["totalAssets", [4291908, 855446]], ["totalLiabilities", [3456054, 173493]], ["totalEquity", [805535, 681953]],
    ["currentDebt", [37793, 32330]], ["longTermDebt", [2711648, 0]], ["totalDebt", [2749441, 32330]],
  ] as const)("%s", (key, expected) => expect(vals(r, key)).toEqual(expected));
  it("FCF −695 859 / −227 006 / −114 721; kontrole z mezzanine (30 319) przechodzą", () => {
    expect(r.derived.fcf.map((f) => f.fcf)).toEqual([-695859, -227006, -114721]);
    expect(r.validation.passed).toBe(r.validation.total);
    expect(r.validation.checks.find((c) => c.detail.includes("30,319"))?.passed).toBe(true);
  });
});

describe("wejście", () => {
  it("HTML bez ix: → IxbrlError not-ixbrl (komunikat o pliku, nie „parser nie poradził sobie”)", () => {
    expect(() => parseIxbrl("<html><body><table><tr><td>Revenue</td><td>10</td></tr></table></body></html>")).toThrow(
      expect.objectContaining({ kind: "not-ixbrl" }),
    );
  });
});

const FULL = process.env.IXBRL_FULL_DIR;
describe.skipIf(!FULL || !existsSync(`${FULL}/SpaceX_10-Q_Q3_2026.html`))("pełne pliki z EDGAR (IXBRL_FULL_DIR)", () => {
  it("SpaceX: ten sam wynik co z fixture'u, odczyt + mapowanie ≤ 1,5 s", () => {
    const html = readFileSync(`${FULL}/SpaceX_10-Q_Q3_2026.html`, "utf8");
    const t0 = performance.now();
    const r = parseIxbrl(html);
    expect(performance.now() - t0).toBeLessThan(1500);
    expect(vals(r, "revenue")).toEqual([14575, 5576, 27083, 13714]);
    expect(r.validation.passed).toBe(r.validation.total);
  });
});
