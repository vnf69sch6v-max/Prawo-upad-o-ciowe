// lib/extract.ts
// Server-side PDF text extraction that reconstructs table rows from glyph
// coordinates. Naive extraction concatenates text in reading order and scrambles
// multi-column financial tables; here we group glyphs into rows by their Y
// position and order them left-to-right by X, inserting column separators on
// large horizontal gaps. This layout fidelity is what makes the parser possible.

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

// pdfjs ships an ESM "legacy" build that runs in Node without a browser worker.
// Loaded lazily so importing this module (e.g. from tests) is cheap.
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
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
