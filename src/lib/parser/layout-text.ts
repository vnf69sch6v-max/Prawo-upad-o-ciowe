// lib/layout-text.ts — reconstruct table-ish lines from pdfjs glyph runs.
// Shared by the Node extractor and the browser extractor so a large PDF
// parsed locally produces the same text layout as a small PDF parsed on
// the server. No Node APIs — safe to import from client components.

interface Glyph {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Reconstruct one page's text from its positioned glyph runs. */
export function reconstructPage(rawItems: unknown[]): string {
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
