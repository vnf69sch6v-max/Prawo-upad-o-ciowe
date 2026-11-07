// lib/extract-browser.ts
// Client-side pdfjs extract for every PDF (docs/specs/2026-11-07-parser-w-przegladarce.md). Uses the same
// reconstructPage and the same **legacy** pdfjs build as the server, so the text — and therefore the parser
// result — matches the server path byte for byte. pdfjs parses in its own worker
// (/pdfjs/pdf.worker.legacy.min.mjs, copied from node_modules in next.config.ts); the main thread only
// receives page by page, which is what makes the "page X of Y" progress possible.

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { reconstructPage } from "./layout-text";
import { classifyPdfExtractError } from "./extract-errors";
import { MAX_CLIENT_PAGES, MAX_CLIENT_TEXT_BYTES } from "./limits";
import { BrowserParseError } from "./upload-strategy";

export interface BrowserExtractResult {
  text: string;
  pages: number;
  charCount: number;
}

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.legacy.min.mjs";
  workerConfigured = true;
}

/**
 * Extract layout-preserving text from a PDF File in the browser. `onPage(done, total)` after every page;
 * aborting `signal` destroys the pdfjs document and rejects with kind `cancelled`. Throws `BrowserParseError`.
 */
export async function extractPdfTextInBrowser(
  file: File,
  opts: { onPage?: (done: number, total: number) => void; signal?: AbortSignal } = {},
): Promise<BrowserExtractResult> {
  const { onPage, signal } = opts;
  const cancelled = () => new BrowserParseError("cancelled", "Anulowano.");
  if (signal?.aborted) throw cancelled();
  ensureWorker();
  // pdfjs transfers this buffer to its worker, so the tab holds one copy of the file.
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    verbosity: 0,
  });
  const onAbort = () => void loadingTask.destroy();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const doc = await loadingTask.promise;
    if (doc.numPages > MAX_CLIENT_PAGES) {
      throw new BrowserParseError(
        "too-many-pages",
        `PDF ma ${doc.numPages} stron — limit to ${MAX_CLIENT_PAGES}. Wgraj samo sprawozdanie finansowe.`,
      );
    }
    const pages: string[] = [];
    const tooMuchText = () =>
      new BrowserParseError("too-much-text", "Raport ma za dużo tekstu (ponad 6 MB). Wgraj samo sprawozdanie finansowe.");
    let units = 0;
    for (let p = 1; p <= doc.numPages; p++) {
      if (signal?.aborted) throw cancelled();
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const text = reconstructPage(content.items);
      page.cleanup();
      pages.push(text);
      // UTF-8 bytes ≥ UTF-16 code units, so this cheap per-page check never stops a file under the cap.
      units += text.length;
      if (units > MAX_CLIENT_TEXT_BYTES) throw tooMuchText();
      onPage?.(p, doc.numPages);
    }
    const text = pages.join("\n\n");
    if (new TextEncoder().encode(text).length > MAX_CLIENT_TEXT_BYTES) throw tooMuchText();
    return { text, pages: doc.numPages, charCount: text.length };
  } catch (err) {
    if (err instanceof BrowserParseError) throw err;
    if (signal?.aborted) throw cancelled();
    const c = classifyPdfExtractError(err);
    if (c.kind === "password" || c.kind === "invalid") throw new BrowserParseError(c.kind, c.userMessage);
    throw new BrowserParseError("extract-technical", "Przeglądarka nie odczytała tego PDF-a.");
  } finally {
    signal?.removeEventListener("abort", onAbort);
    void loadingTask.destroy();
  }
}
