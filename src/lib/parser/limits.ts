// lib/limits.ts — upload caps shared by the API route and the /parser UI.
//
// Since 07.11.2026 every PDF/TXT is extracted AND parsed in the browser (pdfjs legacy + our Web Worker),
// so nothing is POSTed and the Vercel body cap no longer limits the file. The server route stays only as a
// fallback the user clicks (spec docs/specs/2026-11-07-parser-w-przegladarce.md) — the binary/JSON caps
// below apply to that fallback only.

/** Hard Vercel Function request-body limit (Hobby and Pro). Do not "raise" this. */
export const VERCEL_BODY_LIMIT_BYTES = Math.floor(4.5 * 1024 * 1024);

/** Fallback: max binary PDF/txt posted to /api/parser/parse — under 4.5 MB so multipart wrapping does not 413. */
export const MAX_BINARY_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Fallback: extracted text (JSON) posted to /api/parser/parse, with headroom for quoting / filename. */
export const MAX_EXTRACTED_TEXT_BYTES = 3.5 * 1024 * 1024;

/** Browser path: a 74 MB PDF adds ~132 MB to the tab; 100 MB ≈ 270–300 MB per tab. */
export const MAX_CLIENT_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_CLIENT_FILE_LABEL = "100 MB";

/** Browser path: covers a 533-page integrated report; 800 pages ≈ 60–90 s on a mid-tier phone. */
export const MAX_CLIENT_PAGES = 800;
/** HTML/iXBRL (EDGAR .htm, ESEF .xhtml): a 10-K is 2–15 MB; the worker reads it as a File, not a copy on the main thread. */
export const MAX_HTML_BYTES = 50 * 1024 * 1024;
export const MAX_HTML_LABEL = "50 MB";

/** Browser path: text cap (also for TXT) — 6 MB ≈ 18 s desktop / ~75 s phone in the parser worker. */
export const MAX_CLIENT_TEXT_BYTES = 6 * 1024 * 1024;

/** Browser path: extraction + parsing together; the UI shows progress and a Cancel button instead of a hard 45 s. */
export const MAX_CLIENT_TOTAL_MS = 240_000;

/** @deprecated alias — the fallback's binary cap. */
export const MAX_UPLOAD_BYTES = MAX_BINARY_UPLOAD_BYTES;
export const MAX_UPLOAD_LABEL = MAX_CLIENT_FILE_LABEL;
