// lib/upload-strategy.ts — decide binary POST vs browser extract vs reject.
// Pure so the UI and tests share one threshold.

import {
  MAX_BINARY_UPLOAD_BYTES,
  MAX_CLIENT_FILE_BYTES,
  MAX_EXTRACTED_TEXT_BYTES,
} from "./limits";

export type ParseStrategy = "binary" | "client-extract" | "reject-too-large";

export function isPdfFile(file: { name: string; type: string }): boolean {
  return /pdf/i.test(file.type) || /\.pdf$/i.test(file.name);
}

export function isTextFile(file: { name: string; type: string }): boolean {
  return /text\/plain/i.test(file.type) || /\.txt$/i.test(file.name);
}

export function chooseParseStrategy(file: { size: number; name: string; type: string }): ParseStrategy {
  if (file.size <= MAX_BINARY_UPLOAD_BYTES) return "binary";
  if (file.size > MAX_CLIENT_FILE_BYTES) return "reject-too-large";
  if (isPdfFile(file)) return "client-extract";
  // Plain text over the binary cap can still be read locally if it fits
  // in the JSON body; otherwise reject.
  if (isTextFile(file) && file.size <= MAX_EXTRACTED_TEXT_BYTES) return "client-extract";
  return "reject-too-large";
}
