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

export interface ExtractResult {
  text: string;
  pages: number;
  charCount: number;
}

interface Glyph {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
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

/** Reconstruct one page's text from its positioned glyph runs. */
function reconstructPage(rawItems: unknown[]): string {
  const glyphs: Glyph[] = [];
  for (const raw of rawItems) {
    const it = raw as {
      str?: unknown;
      transform?: number[];
      width?: number;
      height?: number;
    };
    if (typeof it.str !== "string" || it.str.length === 0) continue;
    const t = it.transform;
    if (!t) continue;
    // Font size proxy from the vertical scale of the text transform.
    const h = Math.hypot(t[2], t[3]) || it.height || 10;
    glyphs.push({ str: it.str, x: t[4], y: t[5], w: it.width || 0, h });
  }
  if (glyphs.length === 0) return "";

  // Top-to-bottom (PDF Y grows upward), then left-to-right.
  glyphs.sort((a, b) => b.y - a.y || a.x - b.x);

  // Cluster into rows by Y proximity. Reference Y is fixed at each row's first
  // (highest) glyph so a long row cannot drift into the next line.
  const rows: Glyph[][] = [];
  let current: Glyph[] = [];
  let rowY = 0;
  for (const g of glyphs) {
    if (current.length === 0) {
      current = [g];
      rowY = g.y;
      continue;
    }
    const tol = Math.max(2, g.h * 0.5);
    if (Math.abs(g.y - rowY) <= tol) {
      current.push(g);
    } else {
      rows.push(current);
      current = [g];
      rowY = g.y;
    }
  }
  if (current.length) rows.push(current);

  const lines: string[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let line = row[0].str;
    let prevEnd = row[0].x + row[0].w;
    let prevH = row[0].h;
    for (let i = 1; i < row.length; i++) {
      const g = row[i];
      const gap = g.x - prevEnd;
      const ref = Math.max(prevH, g.h);
      if (gap < 0.15 * ref) {
        line += g.str; // same token (split number / word) — glue
      } else if (gap < 0.7 * ref) {
        line += (/\s$/.test(line) ? "" : " ") + g.str; // ordinary word space
      } else {
        line += (/\s$/.test(line) ? "  " : "   ") + g.str; // column separator
      }
      prevEnd = g.x + g.w;
      prevH = g.h;
    }
    const trimmed = line.replace(/\s+$/g, "");
    if (trimmed.trim().length > 0) lines.push(trimmed);
  }
  return lines.join("\n");
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
