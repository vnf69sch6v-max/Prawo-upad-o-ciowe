// lib/parse-in-worker.ts — promise wrapper around parse.worker.ts. Aborting `signal` terminates the worker.
import type { ParseResult } from "./types";
import { BrowserParseError } from "./upload-strategy";

type WorkerReply = { ok: true; result: ParseResult } | { ok: false; message: string };

export function parseInWorker(text: string, pages: number, signal?: AbortSignal): Promise<ParseResult> {
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
    worker.postMessage({ text, pages });
  });
}
