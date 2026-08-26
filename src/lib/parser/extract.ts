// lib/extract.ts
// Server-side PDF text extraction that reconstructs table rows from glyph
// coordinates. Naive extraction concatenates text in reading order and scrambles
// multi-column financial tables; here we group glyphs into rows by their Y
// position and order them left-to-right by X, inserting column separators on
// large horizontal gaps. This layout fidelity is what makes the parser possible.

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { reconstructPage } from "./layout-text";
import { classifyPdfExtractError } from "./extract-errors";

export type { ClassifiedExtractError } from "./extract-errors";
export { classifyPdfExtractError };

export interface ExtractResult {
  text: string;
  pages: number;
  charCount: number;
}

const WORKER_SEGMENTS = ["pdfjs-dist", "legacy", "build", "pdf.worker.mjs"] as const;

/**
 * Absolute file:// URL for pdf.worker.mjs.
 *
 * Two production traps:
 * 1. NFT does not follow pdfjs' webpackIgnore fake-import of `./pdf.worker.mjs`,
 *    so the worker must be in outputFileTracingIncludes (see next.config.ts).
 * 2. Webpack rewrites `require.resolve("literal")` to a numeric module id
 *    (prod then 500s: `pathToFileURL` got number 65956). Split the id and
 *    call resolve through a computed property so the bundler leaves it alone.
 */
export function resolvePdfWorkerSrc(): string {
  const candidates: string[] = [];

  try {
    const req = createRequire(import.meta.url);
    const resolveId = req["resolve"].bind(req) as (id: string) => unknown;
    const resolved = resolveId(WORKER_SEGMENTS.join("/"));
    if (typeof resolved === "string") candidates.push(resolved);
  } catch {
    // fall through to cwd / lambda layout
  }

  candidates.push(
    join(process.cwd(), "node_modules", ...WORKER_SEGMENTS),
    join("/var/task", "node_modules", ...WORKER_SEGMENTS),
  );

  for (const candidate of candidates) {
    if (typeof candidate === "string" && existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  throw new Error(
    `pdf.worker.mjs not found (tried ${candidates.filter((c) => typeof c === "string").join(", ") || "nothing"})`,
  );
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = resolvePdfWorkerSrc();
  return pdfjs;
}

function toUint8(data: Uint8Array | ArrayBuffer | Buffer): Uint8Array {
  if (data instanceof Uint8Array) return new Uint8Array(data);
  return new Uint8Array(data as ArrayBuffer);
}

/** Extract layout-preserving text from a PDF buffer. */
export async function extractPdfText(
  data: Uint8Array | ArrayBuffer | Buffer,
): Promise<ExtractResult> {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: toUint8(data),
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    useWorkerFetch: false,
    verbosity: 0,
  });

  const doc = await loadingTask.promise;
  const pages: string[] = [];
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      pages.push(reconstructPage(content.items));
      page.cleanup();
    }
  } finally {
    await doc.cleanup();
    await doc.destroy();
  }

  const text = pages.join("\n\n");
  return { text, pages: doc.numPages, charCount: text.length };
}
