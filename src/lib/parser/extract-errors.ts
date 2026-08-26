// lib/extract-errors.ts — map pdfjs failures to a client-visible status.
// Kept free of Node APIs so the browser extractor can reuse the same copy.

export interface ClassifiedExtractError {
  userMessage: string;
  status: number;
  detail: string;
}

/** Password / invalid PDF are expected inputs, not 500s. Worker/OOM stay 500. */
export function classifyPdfExtractError(err: unknown): ClassifiedExtractError {
  const detail = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : "";
  if (
    name === "PasswordException" ||
    /no password given/i.test(detail) ||
    /password required/i.test(detail) ||
    /incorrect password/i.test(detail)
  ) {
    return {
      userMessage: "PDF jest chroniony hasłem. Parser nie otwiera plików zaszyfrowanych.",
      status: 422,
      detail,
    };
  }
  if (
    name === "InvalidPDFException" ||
    /invalid pdf structure/i.test(detail) ||
    /invalid PDF/i.test(detail) ||
    /size is zero bytes/i.test(detail)
  ) {
    return {
      userMessage: "Plik nie jest prawidłowym PDF (uszkodzony, pusty albo to nie jest PDF).",
      status: 422,
      detail,
    };
  }
  if (/too many pages/i.test(detail)) {
    return {
      userMessage: detail,
      status: 422,
      detail,
    };
  }
  if (/extract timeout/i.test(detail) || /timed out/i.test(detail)) {
    return {
      userMessage: "Odczyt PDF w przeglądarce trwał zbyt długo. Spróbuj mniejszego pliku.",
      status: 422,
      detail,
    };
  }
  return {
    userMessage: "Parsowanie nie powiodło się. Ślad stosu jest w logach serwera.",
    status: 500,
    detail,
  };
}
