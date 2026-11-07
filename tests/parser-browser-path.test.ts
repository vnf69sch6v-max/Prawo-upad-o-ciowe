// Kryterium 4 (docs/specs/2026-11-07-parser-w-przegladarce.md): ścieżka przeglądarkowa parsera nie ma dostępu
// do sieci — obietnica „plik nie opuszcza urządzenia” ma być prawdziwa. Jedyne wyjście to ścieżka awaryjna
// w `page.tsx` (`runOnServer`), uruchamiana kliknięciem, i eksport za strażnikiem rozmiaru.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportBodyFits } from "@/lib/parser/upload-strategy";

const read = (f: string) => readFileSync(f, "utf8");
const NETWORK = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/;

describe("ścieżka przeglądarkowa bez sieci", () => {
  it.each([
    "src/lib/parser/extract-browser.ts",
    "src/lib/parser/parse.worker.ts",
    "src/lib/parser/parse-in-worker.ts",
    "src/lib/parser/parser.ts",
    "src/lib/parser/upload-strategy.ts",
    "src/lib/parser/ixbrl/read.ts",
    "src/lib/parser/ixbrl/concepts.ts",
    "src/lib/parser/ixbrl/to-result.ts",
  ])("%s nie woła sieci", (file) => {
    expect(read(file)).not.toMatch(NETWORK);
  });

  it("w page.tsx /api/parser/parse pojawia się tylko w runOnServer", () => {
    const src = read("src/app/parser/page.tsx");
    const body = src.slice(src.indexOf("const runOnServer"), src.indexOf("const cancel ="));
    expect(body).toContain("/api/parser/parse");
    expect(src.replace(body, "")).not.toContain("/api/parser/parse");
  });

  it("w src nie ma już nowoczesnego buildu pdfjs w przeglądarce (Safari < 17.4)", () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
    const modern = walk("src").filter((f) => /from\s+["']pdfjs-dist["']/.test(read(f)));
    expect(modern).toEqual([]);
  });
});

describe("strażnik eksportu", () => {
  it("ciało ≤ 4 MB idzie na serwer, większe nie", () => {
    expect(exportBodyFits("x".repeat(4 * 1024 * 1024))).toBe(true);
    expect(exportBodyFits("x".repeat(4 * 1024 * 1024 + 1))).toBe(false);
    expect(exportBodyFits("ą".repeat(2 * 1024 * 1024 + 1))).toBe(false); // bajty UTF-8, nie znaki
  });
});
