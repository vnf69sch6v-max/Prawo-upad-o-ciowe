// Kryterium 3 (docs/specs/2026-11-07-parser-w-przegladarce.md): przeniesienie parsera do przeglądarki
// i pamięć dla `normalizeLabel` nie zmieniają wyniku ani o bajt. Hashe policzone na `main` (b27a430)
// przed zmianą. Celowa zmiana zachowania parsera (krok 2) = nowe hashe w tym samym PR, z uzasadnieniem.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseReport } from "@/lib/parser/parser";

const BASELINE: Record<string, string> = {
  // PS2a (docs/specs/2026-11-07-parser-ps2a-spacex-10q.md) — celowa zmiana tylko w raportach US, przejrzana
  // wiersz po wierszu (tabela w PR): Microsoft — „wszystkie wiersze”, gdzie „450 287” było jedną liczbą;
  // NVIDIA — D&A i wartości niematerialne „997 611” / „700 807” sklejone w jedną kolumnę; Cipher — „- 29,400”
  // to pusta kolumna i liczba, nie −29 400, a dług długoterminowy z bilansu (4 376 761), nie dyskonto z noty
  // (4 597). Polskie raporty: hashe bez zmian.
  "microsoft-10q": "cc40347634bed6bb460b54faa6947b45323e9ac5481f48eb57fc404542d87d9b",
  "cipher-digital-10q": "c7b0e0700ec4bbb30304d7b36d5e24d9fa98203be754bb9cf3ffc1bf5d8dffa3",
  "kombinat-konopny-2q2026": "33a6615551bc812320a080b1d840689bdc1352fbd2bd703338fbd827f9c81948",
  "nvidia-10q": "6903f02055ab8378f5ccd737e08e100cf784d3f28d6454e60dae1d69c00a52ad",
  "polish-ifrs-slash": "2e30966b2a77cb6ca568f35c5e62a6cea998c9de077e31555ae678b3827a8f2e",
  "spacex-10q-q3-2026": "5762aebdc47c607b4d8455a56d44d7a69e733ee63b609a04e97ae80118e8c4e9",
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
