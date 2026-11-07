// lib/parse.worker.ts — runs parseReport off the main thread. A 300-page annual report is 2.5–3.5 s of parsing
// on a desktop and ~15 s on a mid-tier phone; on the main thread that froze the page. No network here: the
// worker only receives text and returns the result (tests/parser-browser-path.test.ts checks for fetch).
import { parseReport } from "./parser";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<{ text: string; pages: number }>) => void) | null;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = (e) => {
  try {
    const { text, pages } = e.data;
    ctx.postMessage({ ok: true, result: parseReport({ text, pages, charCount: text.length }) });
  } catch (err) {
    ctx.postMessage({ ok: false, message: err instanceof Error ? err.message : String(err) });
  }
};
