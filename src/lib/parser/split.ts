// lib/split.ts
// Shared split of a reconstructed table row into "label" vs "numeric cells".
// A bare en/em dash in running text (Polish "Przychody – struktura", IFRS date
// ranges "01.07.2025 – 30.09.2025") is punctuation, not the start of values.
// Empty-cell dashes still count when they sit in the number region (followed
// by a digit, another dash, or end of string).

export interface LabelSplit {
  label: string;
  rest: string;
}

const LIST_MARKER = /^\s*(?:[a-ząćęłńóśźż]|[ivxlcdm]{1,6}|\d{1,2})\s*[.)]\s+/i;

/**
 * Start of the value region:
 *   - "(", "$", "€" or a digit (a real amount)
 *   - em/en dash that is an empty *cell* (dash then digit / dash / EOL)
 *   - hyphen/minus then a digit ("- 83 942" / "-114569")
 *
 * Deliberately does NOT match " – struktura" / " – bitcoin mining".
 */
export const VALUE_START_RE =
  /\(?\s*[$€£]?\s*\d|(?:—|–)\s*(?:\d|—|–|$)|[−-]\s*\d/;

export function splitLeadingLabel(line: string): LabelSplit {
  const marker = line.match(LIST_MARKER);
  const offset = marker ? marker[0].length : 0;
  const body = line.slice(offset);
  const idx = body.search(VALUE_START_RE);
  if (idx < 0) return { label: line.trim(), rest: "" };
  let start = offset + idx;
  const pre = line.slice(0, start).match(/[$€£(−-]\s*$/);
  if (pre) start = start - pre[0].length;
  return { label: line.slice(0, start).trim(), rest: line.slice(start) };
}
