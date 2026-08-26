// lib/limits.ts — upload caps shared by the API route and the /parser UI.
//
// Vercel Functions reject request bodies over 4.5 MB with 413
// FUNCTION_PAYLOAD_TOO_LARGE. That cap is platform-level (Hobby and Pro) and
// cannot be raised via vercel.json, maxDuration, or bodyParser.sizeLimit.
// Binary PDFs therefore stay under ~4 MB (multipart overhead). Larger PDFs
// are extracted in the browser with pdfjs; only the text is POSTed.

/** Hard Vercel Function request-body limit. Do not "raise" this. */
export const VERCEL_BODY_LIMIT_BYTES = Math.floor(4.5 * 1024 * 1024);

/**
 * Max binary PDF/txt posted to /api/parser/parse. Slightly under 4.5 MB so
 * multipart wrapping does not 413.
 */
export const MAX_BINARY_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Files bigger than this are rejected even for client-side extract. */
export const MAX_CLIENT_FILE_BYTES = 40 * 1024 * 1024;
export const MAX_CLIENT_FILE_LABEL = "40 MB";

/** Browser extract gives up after this many pages. */
export const MAX_CLIENT_PAGES = 250;

/** Browser extract wall clock. */
export const MAX_CLIENT_EXTRACT_MS = 45_000;

/**
 * Extracted text (JSON) must still fit in the 4.5 MB function body.
 * Leave headroom for JSON quoting / filename.
 */
export const MAX_EXTRACTED_TEXT_BYTES = 3.5 * 1024 * 1024;

/** @deprecated alias — binary path only; UI now allows up to MAX_CLIENT_FILE_BYTES. */
export const MAX_UPLOAD_BYTES = MAX_BINARY_UPLOAD_BYTES;
export const MAX_UPLOAD_LABEL = MAX_CLIENT_FILE_LABEL;
