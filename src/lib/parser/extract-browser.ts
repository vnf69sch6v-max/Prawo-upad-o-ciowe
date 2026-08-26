// lib/extract-browser.ts
// Client-side pdfjs extract for PDFs that would 413 on Vercel if posted whole.
// Uses the same reconstructPage as the server so layout (and therefore the
// rule parser) matches. Worker is served from /pdfjs/pdf.worker.min.mjs
// (copied from node_modules in next.config.ts).

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { reconstructPage } from "./layout-text";
import { classifyPdfExtractError } from "./extract-errors";
import {
  MAX_CLIENT_EXTRACT_MS,
  MAX_CLIENT_PAGES,
  MAX_EXTRACTED_TEXT_BYTES,
} from "./limits";

export interface BrowserExtractResult {
  text: string;
  pages: number;
  charCount: number;
}

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  workerConfigured = true;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("extract timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (err) => {
        clearTimeout(t);
        reject(err);
      },
    );
  });
}

/**
 * Extract layout-preserving text from a PDF File in the browser.
 * Throws Error with a Polish userMessage-friendly .message for UI toasts,
 * or a classified extract error's userMessage.
 */
export async function extractPdfTextInBrowser(file: File): Promise<BrowserExtractResult> {
  ensureWorker();
  const data = new Uint8Array(await file.arrayBuffer());

  const run = async (): Promise<BrowserExtractResult> => {
    const loadingTask = getDocument({
      data,
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
    });
    const doc = await loadingTask.promise;
    if (doc.numPages > MAX_CLIENT_PAGES) {
      await doc.destroy();
      throw new Error(
        `PDF ma ${doc.numPages} stron — limit to ${MAX_CLIENT_PAGES}. Wgraj krótszy raport.`,
      );
    }
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
    if (new TextEncoder().encode(text).length > MAX_EXTRACTED_TEXT_BYTES) {
      throw new Error(
        "Wyciągnięty tekst jest za duży na limit hostingu (nawet bez pliku PDF). Wgraj krótszy raport.",
      );
    }
    return { text, pages: doc.numPages, charCount: text.length };
  };

  try {
    return await withTimeout(run(), MAX_CLIENT_EXTRACT_MS);
  } catch (err) {
    const classified = classifyPdfExtractError(err);
    // Prefer the already-Polish page-count message over the generic 500 copy.
    if (err instanceof Error && /stron — limit/i.test(err.message)) {
      throw err;
    }
    if (err instanceof Error && /Wyciągnięty tekst jest za duży/i.test(err.message)) {
      throw err;
    }
    throw new Error(classified.userMessage);
  }
}
