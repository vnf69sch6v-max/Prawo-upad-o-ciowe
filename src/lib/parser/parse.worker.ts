// lib/parse.worker.ts — runs parseReport / parseIxbrl off the main thread. A 300-page annual report is 2.5–3.5 s of parsing
// on a desktop and ~15 s on a mid-tier phone; on the main thread that froze the page. No network here: the
// worker only receives text or a File and returns the result (tests/parser-browser-path.test.ts checks for fetch).
import { parseReport } from "./parser";
import { IxbrlError } from "./ixbrl/read";
import { parseIxbrl } from "./ixbrl/to-result";

type Message = { text: string; pages: number } | { html: File };

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<Message>) => void) | null;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = async (e) => {
  try {
    if ("html" in e.data) {
      // The File is read here, off the main thread: a 10 MB filing never exists as a string there.
      const html = await e.data.html.text();
      ctx.postMessage({ ok: true, result: parseIxbrl(html, e.data.html.size) });
      return;
    }
    const { text, pages } = e.data;
    ctx.postMessage({ ok: true, result: parseReport({ text, pages, charCount: text.length }) });
  } catch (err) {
    ctx.postMessage({
      ok: false,
      kind: err instanceof IxbrlError ? err.kind : undefined,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
