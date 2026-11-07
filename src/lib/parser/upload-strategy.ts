// lib/upload-strategy.ts — which files the browser path accepts, and when the server fallback is offered.
// Pure so the UI and tests share one threshold.

import {
  MAX_BINARY_UPLOAD_BYTES,
  VERCEL_BODY_LIMIT_BYTES,
  MAX_CLIENT_FILE_BYTES,
  MAX_CLIENT_TEXT_BYTES,
  MAX_EXTRACTED_TEXT_BYTES,
  MAX_HTML_BYTES,
} from "./limits";

export type ParseStrategy = "browser" | "reject-type" | "reject-too-large";

export function isPdfFile(file: { name: string; type: string }): boolean {
  return /pdf/i.test(file.type) || /\.pdf$/i.test(file.name);
}

/** EDGAR .htm and ESEF .xhtml: inline XBRL, read in the browser by `ixbrl/`. */
export function isHtmlFile(file: { name: string; type: string }): boolean {
  return /\.(x?html?)$/i.test(file.name) || /text\/html|application\/xhtml/i.test(file.type);
}

export function isTextFile(file: { name: string; type: string }): boolean {
  return /text\/plain/i.test(file.type) || /\.txt$/i.test(file.name);
}

/** Every PDF/TXT within the caps is extracted and parsed in the browser — the file never leaves the device. */
export function chooseParseStrategy(file: { size: number; name: string; type: string }): ParseStrategy {
  if (!isPdfFile(file) && !isTextFile(file) && !isHtmlFile(file)) return "reject-type";
  const cap = isHtmlFile(file) ? MAX_HTML_BYTES : isPdfFile(file) ? MAX_CLIENT_FILE_BYTES : MAX_CLIENT_TEXT_BYTES;
  return file.size > cap ? "reject-too-large" : "browser";
}

/** Why the browser path stopped. Only technical failures may offer the server; input problems would fail there too. */
export type BrowserFailure =
  | "password" | "invalid" | "scan" | "too-many-pages" | "too-much-text" | "parser"
  | "extract-technical" | "extract-timeout" | "worker" | "parse-timeout" | "cancelled" | "not-ixbrl" | "ixbrl-corrupt";

/** A browser-path failure with its kind (`serverFallbackFor`) and a Polish message for the UI. */
export class BrowserParseError extends Error {
  constructor(readonly kind: BrowserFailure, message: string) {
    super(message);
    this.name = "BrowserParseError";
  }
}

/** What the "Przetwórz na serwerze" button would send: the file (≤ 4 MB), the extracted text (≤ 3.5 MB), or nothing. */
export type ServerFallback = "file" | "text" | null;

export function serverFallbackFor(
  kind: BrowserFailure,
  size: { fileBytes: number; textBytes: number | null },
): ServerFallback {
  switch (kind) {
    case "worker":
    case "parse-timeout":
      return size.textBytes != null && size.textBytes <= MAX_EXTRACTED_TEXT_BYTES ? "text" : null;
    case "extract-technical":
    case "extract-timeout":
      return size.fileBytes <= MAX_BINARY_UPLOAD_BYTES ? "file" : null;
    default:
      return null;
  }
}

/** Export still runs on the server (exceljs needs eval under CSP): a body over 4 MB would 413, so it is not sent. */
export function exportBodyFits(body: string): boolean {
  return new TextEncoder().encode(body).length <= Math.min(MAX_BINARY_UPLOAD_BYTES, VERCEL_BODY_LIMIT_BYTES);
}
