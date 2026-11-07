// lib/parse-in-worker.ts — promise wrapper around parse.worker.ts. Aborting `signal` terminates the worker.
import type { ParseResult } from "./types";
import { BrowserParseError } from "./upload-strategy";

type WorkerReply = { ok: true; result: ParseResult } | { ok: false; kind?: "not-ixbrl" | "corrupt"; message: string };

export function parseInWorker(text: string, pages: number, signal?: AbortSignal): Promise<ParseResult> {
  return runWorker({ text, pages }, signal);
}

/** HTML / inline XBRL: the worker reads the File itself. */
export function parseHtmlInWorker(file: File, signal?: AbortSignal): Promise<ParseResult> {
  return runWorker({ html: file }, signal);
}

function runWorker(message: { text: string; pages: number } | { html: File }, signal?: AbortSignal): Promise<ParseResult> {
  return new Promise<ParseResult>((resolve, reject) => {
    const workerFailed = () => new BrowserParseError("worker", "Przeglądarka nie uruchomiła analizy w tle.");
    let worker: Worker;
    try {
      worker = new Worker(new URL("./parse.worker.ts", import.meta.url), { type: "module" });
    } catch {
      reject(workerFailed());
      return;
    }
    const finish = () => {
      worker.terminate();
      signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      finish();
      reject(new BrowserParseError("cancelled", "Anulowano."));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    worker.onmessage = (e: MessageEvent<WorkerReply>) => {
      finish();
      if (e.data.ok) resolve(e.data.result);
      else if (e.data.kind === "not-ixbrl") reject(new BrowserParseError("not-ixbrl", "To nie jest raport z danymi XBRL."));
      else if (e.data.kind === "corrupt") reject(new BrowserParseError("ixbrl-corrupt", "Plik HTML jest uszkodzony."));
      else reject(new BrowserParseError("parser", "Parser nie poradził sobie z tym raportem."));
    };
    worker.onerror = (e) => {
      e.preventDefault();
      finish();
      reject(workerFailed());
    };
    worker.onmessageerror = () => {
      finish();
      reject(workerFailed());
    };
    worker.postMessage(message);
  });
}
