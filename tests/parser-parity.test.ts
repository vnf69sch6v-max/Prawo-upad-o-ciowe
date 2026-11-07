// Kryterium 3 (docs/specs/2026-11-07-parser-w-przegladarce.md): przeniesienie parsera do przeglądarki
// i pamięć dla `normalizeLabel` nie zmieniają wyniku ani o bajt. Hashe policzone na `main` (b27a430)
// przed zmianą. Celowa zmiana zachowania parsera (krok 2) = nowe hashe w tym samym PR, z uzasadnieniem.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseReport } from "@/lib/parser/parser";

const BASELINE: Record<string, string> = {
  "microsoft-10q": "7a4ff3da6367029d0426bb260597b9d1b3dda2e0d167986c8279390612db080f",
  "cipher-digital-10q": "493d3871fd8d9aa9e73246acbb1f50ee2a57acd0070a2a6329efdd89957dacf0",
  "kombinat-konopny-2q2026": "33a6615551bc812320a080b1d840689bdc1352fbd2bd703338fbd827f9c81948",
  "nvidia-10q": "7e4abd99149dc4bdbdf17940b5c50c90ed31e9a9e9ff36f8aa71ecaf42ba67d8",
  "polish-ifrs-slash": "2e30966b2a77cb6ca568f35c5e62a6cea998c9de077e31555ae678b3827a8f2e",
};

const hash = (name: string) => {
  const text = readFileSync(`tests/fixtures/${name}.txt`, "utf8");
  const r = parseReport({ text, pages: 1, charCount: text.length });
  return createHash("sha256").update(JSON.stringify({ ...r, rawText: "" })).digest("hex");
};

describe("parytet parsera", () => {
  it.each(Object.keys(BASELINE))("%s: wynik identyczny z main sprzed zmiany", (name) => {
    expect(hash(name)).toBe(BASELINE[name]);
  });

  it("drugi przebieg (pamięć `normalizeLabel` już pełna) daje to samo", () => {
    for (const name of Object.keys(BASELINE)) expect(hash(name)).toBe(BASELINE[name]);
  });
});
