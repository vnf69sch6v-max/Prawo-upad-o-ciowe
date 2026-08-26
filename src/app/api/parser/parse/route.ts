// src/app/api/parser/parse/route.ts
// Przyjmuje wgrany PDF (multipart/form-data, pole "file") ALBO już wyciągnięty
// tekst (JSON: { text, pages, fileName, fileSize }) — ten drugi tryb omija
// limit 4.5 MB ciała funkcji Vercel, bo binarny PDF zostaje w przeglądarce.
// Każda awaria jest widoczna — nigdy ciche 200 z popsutymi danymi.

import { NextResponse } from "next/server";
import { extractPdfText, classifyPdfExtractError } from "@/lib/parser/extract";
import { parseReport } from "@/lib/parser/parser";
import {
  MAX_BINARY_UPLOAD_BYTES,
  MAX_CLIENT_FILE_LABEL,
  MAX_EXTRACTED_TEXT_BYTES,
  VERCEL_BODY_LIMIT_BYTES,
} from "@/lib/parser/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fail(message: string, status: number, detail?: string) {
  return NextResponse.json({ error: message, detail }, { status });
}

function parsedOk(opts: {
  name: string;
  size: number;
  startedAt: number;
  extracted: { text: string; pages: number; charCount: number };
}) {
  const result = parseReport(opts.extracted);
  return NextResponse.json({
    ok: true,
    fileName: opts.name,
    fileSize: opts.size,
    elapsedMs: Date.now() - opts.startedAt,
    result,
  });
}

function emptyTextFail(isText: boolean, extracted: { charCount: number; pages: number }) {
  return fail(
    isText
      ? "Plik tekstowy jest za krótki, żeby go sparsować."
      : "Nie udało się wyciągnąć praktycznie żadnego tekstu — PDF może być skanem/obrazem (OCR nieobsługiwany) albo jest uszkodzony.",
    422,
    `chars=${extracted.charCount}, pages=${extracted.pages}`,
  );
}

interface ExtractedBody {
  text: string;
  pages: number;
  fileName: string;
  fileSize: number;
}

function readExtractedJson(raw: unknown): ExtractedBody | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Oczekiwano JSON z polem text." };
  const body = raw as Record<string, unknown>;
  if (typeof body.text !== "string") return { error: "Oczekiwano JSON z polem text." };
  const pages = typeof body.pages === "number" && Number.isFinite(body.pages) ? Math.max(1, Math.floor(body.pages)) : 1;
  const fileName = typeof body.fileName === "string" && body.fileName.trim() ? body.fileName.trim() : "upload.pdf";
  const fileSize = typeof body.fileSize === "number" && Number.isFinite(body.fileSize) ? Math.max(0, body.fileSize) : body.text.length;
  return { text: body.text, pages, fileName, fileSize };
}

export async function POST(req: Request) {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > VERCEL_BODY_LIMIT_BYTES) {
    return fail(
      `Żądanie za duże (${(declared / 1e6).toFixed(1)} MB). Limit ciała funkcji Vercel to 4,5 MB — duże PDF-y trzeba odczytać lokalnie.`,
      413,
    );
  }

  const contentType = req.headers.get("content-type") || "";
  const startedAt = Date.now();

  if (/\bapplication\/json\b/i.test(contentType)) {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return fail("Nieprawidłowe ciało JSON.", 400);
    }
    const parsed = readExtractedJson(raw);
    if ("error" in parsed) return fail(parsed.error, 400);
    const byteLen = new TextEncoder().encode(parsed.text).length;
    if (byteLen > MAX_EXTRACTED_TEXT_BYTES) {
      return fail(
        `Wyciągnięty tekst jest za duży (${(byteLen / 1e6).toFixed(1)} MB). Limit to 3,5 MB tekstu.`,
        413,
      );
    }
    const extracted = { text: parsed.text, pages: parsed.pages, charCount: parsed.text.length };
    if (!extracted.text || extracted.charCount < 200) {
      return emptyTextFail(true, extracted);
    }
    try {
      return parsedOk({
        name: parsed.fileName,
        size: parsed.fileSize,
        startedAt,
        extracted,
      });
    } catch (err) {
      console.error("[parse] pipeline error (json text):", err);
      const classified = classifyPdfExtractError(err);
      return fail(classified.userMessage, classified.status, classified.detail);
    }
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Oczekiwano multipart/form-data z polem pliku (albo JSON z polem text).", 400);
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return fail("Nie wgrano pliku. Dołącz PDF w polu 'file'.", 400);
  }

  const name = (file as File).name || "upload.pdf";
  const type = (file as File).type || "";
  const isPdf = /pdf/i.test(type) || /\.pdf$/i.test(name);
  const isText = /text\/plain/i.test(type) || /\.txt$/i.test(name);
  if (!isPdf && !isText) {
    return fail(`Nieobsługiwany typ pliku "${type || "nieznany"}". Wgraj PDF (albo plik .txt).`, 415);
  }

  const size = (file as File).size ?? 0;
  if (size > MAX_BINARY_UPLOAD_BYTES) {
    return fail(
      `Plik za duży na przesłanie binarne (${(size / 1e6).toFixed(1)} MB). Limit hostingu Vercel to 4,5 MB — w interfejsie duże PDF-y są odczytywane lokalnie (do ${MAX_CLIENT_FILE_LABEL}).`,
      413,
    );
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await (file as File).arrayBuffer();
  } catch (err) {
    console.error("[parse] failed to read upload:", err);
    return fail("Nie udało się odczytać wgranego pliku.", 400);
  }
  if (buffer.byteLength === 0) {
    return fail("Wgrany plik jest pusty.", 400);
  }

  try {
    let extracted: { text: string; pages: number; charCount: number };
    if (isText) {
      const text = new TextDecoder("utf-8").decode(buffer);
      extracted = { text, pages: 1, charCount: text.length };
    } else {
      extracted = await extractPdfText(new Uint8Array(buffer));
    }
    if (!extracted.text || extracted.charCount < 200) {
      return emptyTextFail(isText, extracted);
    }

    return parsedOk({ name, size, startedAt, extracted });
  } catch (err) {
    console.error("[parse] pipeline error:", err);
    const classified = classifyPdfExtractError(err);
    return fail(classified.userMessage, classified.status, classified.detail);
  }
}

export function GET() {
  return NextResponse.json({
    service: "savori-parser",
    usage:
      "POST multipart/form-data (pole: file) z PDF-em do 4 MB, albo JSON { text, pages, fileName } z tekstem wyciągniętym lokalnie.",
    vercelBodyLimitMb: 4.5,
    clientExtractFileLimitMb: 40,
  });
}
