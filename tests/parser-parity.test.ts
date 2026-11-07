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
  // PS3b: komunikat „capex intensity” po polsku (Microsoft: tylko tłumaczenie) i bez procentów od ujemnej bazy (Cipher, SpaceX: fałszywa
  // flaga „FCF −215% / −260%” zniknęła; flaga tylko przy dodatnich przepływach rok wcześniej). Metryki bez zmian.
  "microsoft-10q": "948cc9bd2cbb4ad3f2d7aeaadf110fc82a5af75e69dcbec646132b0c148e3814",
  "cipher-digital-10q": "562d48156f78bf802c5a80e330b9cb0dbaf511e2205a89fdc4d8cc8f70e7237a",
  "kombinat-konopny-2q2026": "33a6615551bc812320a080b1d840689bdc1352fbd2bd703338fbd827f9c81948",
  "nvidia-10q": "6903f02055ab8378f5ccd737e08e100cf784d3f28d6454e60dae1d69c00a52ad",
  "polish-ifrs-slash": "2e30966b2a77cb6ca568f35c5e62a6cea998c9de077e31555ae678b3827a8f2e",
  "spacex-10q-q3-2026": "94bca7909d70cd22b88d8edb5c92cfc19430897f7f85f4e4b1b4b5b77f46acaa",
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
