// lib/notes.ts
// US filings put related-party disclosures inside the row label, often wrapped over several lines:
//   Interest expense (related party of $351 and $— for the three months ended September 30,
//   2026 and 2025, respectively, and $864 and $— for the nine months ended September 30,
//   2026 and 2025, respectively) (675) (514) (1,968) (1,372)
// The label no longer matches "Interest expense" and its numbers sit two lines below, so the matcher
// fell through to a one-column segment table. We cut the note and put the row back on its first line.
// Line count stays the same (continuation lines become empty): `sourceLine` and the raw-text view still
// point at the original text.

const NOTE_OPEN = /\((?:including\s+)?(?:amounts?\s+(?:due\s+)?(?:to|from)\s+)?related[\s-]part(?:y|ies)\b/i;
/** A note longer than this many continuation lines is left alone (not a row label any more). */
const MAX_CONTINUATION = 4;

/** Index of the parenthesis closing the one at `open`, or -1. */
function closingParen(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

export function stripRelatedPartyNotes(lines: string[]): string[] {
  const out = lines.slice();
  for (let i = 0; i < out.length; i++) {
    for (let guard = 0; guard < 4; guard++) {
      const m = NOTE_OPEN.exec(out[i]);
      if (!m) break;
      let joined = out[i];
      let used = 0;
      let close = closingParen(joined, m.index);
      while (close < 0 && used < MAX_CONTINUATION && i + used + 1 < out.length) {
        used++;
        joined += " " + out[i + used].trim();
        close = closingParen(joined, m.index);
      }
      if (close < 0) break;
      out[i] = `${joined.slice(0, m.index).trimEnd()} ${joined.slice(close + 1).trimStart()}`.trimEnd();
      for (let k = 1; k <= used; k++) out[i + k] = "";
    }
  }
  return out;
}
