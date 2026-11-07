// tests/parser-upload-limits.test.ts
// Every file is parsed in the browser (docs/specs/2026-11-07-parser-w-przegladarce.md). The server route stays
// as a click-only fallback: binary POST under Vercel's 4.5 MB body, or JSON { text } after a browser extract.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  MAX_BINARY_UPLOAD_BYTES,
  MAX_CLIENT_FILE_BYTES,
  MAX_CLIENT_PAGES,
  MAX_CLIENT_TEXT_BYTES,
  MAX_CLIENT_TOTAL_MS,
  MAX_EXTRACTED_TEXT_BYTES,
  VERCEL_BODY_LIMIT_BYTES,
} from "@/lib/parser/limits";
import { chooseParseStrategy, serverFallbackFor } from "@/lib/parser/upload-strategy";
import { POST } from "@/app/api/parser/parse/route";

function pdf(size: number, name = "report.pdf") {
  return { size, name, type: "application/pdf" };
}

describe("browser path and the Vercel body cap", () => {
  it("does not pretend the 4.5 MB function body can be raised", () => {
    expect(VERCEL_BODY_LIMIT_BYTES).toBe(Math.floor(4.5 * 1024 * 1024));
    expect(MAX_BINARY_UPLOAD_BYTES).toBeLessThan(VERCEL_BODY_LIMIT_BYTES);
    expect(MAX_EXTRACTED_TEXT_BYTES).toBeLessThan(VERCEL_BODY_LIMIT_BYTES);
  });

  it("browser caps: 100 MB, 800 pages, 6 MB of text, 240 s", () => {
    expect(MAX_CLIENT_FILE_BYTES).toBe(100 * 1024 * 1024);
    expect(MAX_CLIENT_PAGES).toBe(800);
    expect(MAX_CLIENT_TEXT_BYTES).toBe(6 * 1024 * 1024);
    expect(MAX_CLIENT_TOTAL_MS).toBe(240_000);
  });

  it("every PDF within 100 MB goes to the browser — small ones too", () => {
    for (const size of [612_000, MAX_BINARY_UPLOAD_BYTES, Math.floor(4.5 * 1024 * 1024) + 1, 40 * 1024 * 1024, MAX_CLIENT_FILE_BYTES]) {
      expect(chooseParseStrategy(pdf(size))).toBe("browser");
    }
    expect(chooseParseStrategy(pdf(MAX_CLIENT_FILE_BYTES + 1))).toBe("reject-too-large");
  });

  it("TXT up to 6 MB in the browser, other types rejected", () => {
    const txt = (size: number) => ({ size, name: "r.txt", type: "text/plain" });
    expect(chooseParseStrategy(txt(MAX_CLIENT_TEXT_BYTES))).toBe("browser");
    expect(chooseParseStrategy(txt(MAX_CLIENT_TEXT_BYTES + 1))).toBe("reject-too-large");
    expect(chooseParseStrategy({ size: 1000, name: "r.docx", type: "application/vnd.openxmlformats" })).toBe("reject-type");
  });
});

describe("server fallback — only on click, only when the server could do better", () => {
  const MB = 1024 * 1024;
  it("worker / parse timeout → the extracted text, up to 3.5 MB", () => {
    for (const kind of ["worker", "parse-timeout"] as const) {
      expect(serverFallbackFor(kind, { fileBytes: 50 * MB, textBytes: MAX_EXTRACTED_TEXT_BYTES })).toBe("text");
      expect(serverFallbackFor(kind, { fileBytes: 1 * MB, textBytes: MAX_EXTRACTED_TEXT_BYTES + 1 })).toBeNull();
      expect(serverFallbackFor(kind, { fileBytes: 1 * MB, textBytes: null })).toBeNull();
    }
  });

  it("technical extraction failure / extraction timeout → the file, up to 4 MB", () => {
    for (const kind of ["extract-technical", "extract-timeout"] as const) {
      expect(serverFallbackFor(kind, { fileBytes: MAX_BINARY_UPLOAD_BYTES, textBytes: null })).toBe("file");
      expect(serverFallbackFor(kind, { fileBytes: MAX_BINARY_UPLOAD_BYTES + 1, textBytes: null })).toBeNull();
    }
  });

  it("input problems and cancel never offer the server — it would do the same", () => {
    for (const kind of ["password", "invalid", "scan", "too-many-pages", "too-much-text", "parser", "cancelled"] as const) {
      expect(serverFallbackFor(kind, { fileBytes: 1000, textBytes: 1000 })).toBeNull();
    }
  });
});

describe("POST /api/parser/parse JSON text path", () => {
  it("parses Kombinat from extracted text (no PDF bytes)", async () => {
    const text = readFileSync(
      resolve(process.cwd(), "public/parser-samples/kombinat-konopny-2q2026.txt"),
      "utf8",
    );
    const req = new Request("http://localhost/api/parser/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        pages: 12,
        fileName: "kombinat-konopny-2q2026.pdf",
        fileSize: 8_000_000,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      fileName: string;
      fileSize: number;
      result: { detection: { issuer: string | null }; pages: number };
    };
    expect(json.ok).toBe(true);
    expect(json.fileName).toBe("kombinat-konopny-2q2026.pdf");
    expect(json.fileSize).toBe(8_000_000);
    expect(json.result.pages).toBe(12);
    expect(json.result.detection.issuer?.toLowerCase()).toMatch(/kombinat/);
  });

  it("still accepts a small binary PDF on the server path", async () => {
    const buf = readFileSync(resolve(process.cwd(), "public/parser-samples/cipher-digital-10q.pdf"));
    expect(buf.byteLength).toBeLessThan(MAX_BINARY_UPLOAD_BYTES);
    const file = new File([buf], "cipher-digital-10q.pdf", { type: "application/pdf" });
    const fd = new FormData();
    fd.append("file", file);
    const req = new Request("http://localhost/api/parser/parse", { method: "POST", body: fd });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      result: { detection: { issuer: string | null }; charCount: number };
    };
    expect(json.ok).toBe(true);
    expect(json.result.charCount).toBeGreaterThan(200);
    expect(json.result.detection.issuer?.toLowerCase()).toMatch(/cipher/);
  });

  it("rejects a binary PDF over the 4 MB server path (would 413 on Vercel)", async () => {
    const fat = new Uint8Array(MAX_BINARY_UPLOAD_BYTES + 50_000);
    fat.set([0x25, 0x50, 0x44, 0x46]); // %PDF
    const file = new File([fat], "fat.pdf", { type: "application/pdf" });
    const fd = new FormData();
    fd.append("file", file);
    const req = new Request("http://localhost/api/parser/parse", { method: "POST", body: fd });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/lokalnie/i);
  });
});

function escapePdfText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Minimal one-page PDF with unused padding stream so the file exceeds 4.5 MB. */
function buildPaddedPdf(lines: string[], minBytes: number): Uint8Array {
  const ops = ["BT", "/F1 11 Tf", "50 740 Td"];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) ops.push("0 -14 Td");
    ops.push(`(${escapePdfText(lines[i])}) Tj`);
  }
  ops.push("ET");
  const content = ops.join("\n");
  const padSize = Math.max(0, minBytes);

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `6 0 obj\n<< /Length ${padSize} >>\nstream\n${"A".repeat(padSize)}endstream\nendobj\n`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj;
  }
  const xrefStart = body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const pdf = `${body}${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

describe("large PDF → extract text → JSON parse (the 4.5 MB bypass)", () => {
  it("extracts a >4.5 MB PDF and parses via JSON body", async () => {
    const { extractPdfText } = await import("@/lib/parser/extract");
    const bytes = buildPaddedPdf(
      [
        "UNITED STATES SECURITIES AND EXCHANGE COMMISSION",
        "FORM 10-Q",
        "Cipher Digital, Inc.",
        "Condensed Consolidated Statements of Operations",
        "Three Months Ended March 31, 2026 and 2025",
        "(in thousands)",
        "Revenue - bitcoin mining          45,100        12,400",
        "Cost of revenue                   28,000        11,200",
        "Gross profit                      17,100         1,200",
        "Net loss                         (4,200)       (8,100)",
        "Cash and cash equivalents        62,000        40,000",
        "Total assets                    410,000       300,000",
      ],
      Math.floor(4.6 * 1024 * 1024),
    );
    expect(bytes.byteLength).toBeGreaterThan(VERCEL_BODY_LIMIT_BYTES);

    const extracted = await extractPdfText(bytes);
    expect(extracted.charCount).toBeGreaterThan(200);
    expect(extracted.text).toMatch(/bitcoin mining/i);
    expect(new TextEncoder().encode(extracted.text).length).toBeLessThan(MAX_EXTRACTED_TEXT_BYTES);

    const req = new Request("http://localhost/api/parser/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: extracted.text,
        pages: extracted.pages,
        fileName: "cipher-fat.pdf",
        fileSize: bytes.byteLength,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      fileSize: number;
      result: { detection: { issuer: string | null }; metrics: { key: string; values: { value: number | null }[] }[] };
    };
    expect(json.ok).toBe(true);
    expect(json.fileSize).toBeGreaterThan(VERCEL_BODY_LIMIT_BYTES);
    const revenue = json.result.metrics.find((m) => m.key === "revenue");
    expect(revenue?.values.some((v) => v.value === 45100)).toBe(true);
  });
});
