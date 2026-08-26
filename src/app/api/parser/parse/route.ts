// src/app/api/parser/parse/route.ts
// Przyjmuje wgrany PDF (multipart/form-data, pole "file"), wyciąga tekst po
// stronie serwera przez pdfjs, uruchamia regułowy parser i zwraca pełny JSON.
// Każda awaria jest widoczna — nigdy ciche 200 z popsutymi danymi.

import { NextResponse } from "next/server";
import { extractPdfText, classifyPdfExtractError } from "@/lib/parser/extract";
import { parseReport } from "@/lib/parser/parser";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/parser/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = MAX_UPLOAD_BYTES;

function fail(message: string, status: number, detail?: string) {
  return NextResponse.json({ error: message, detail }, { status });
}

export async function POST(req: Request) {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BYTES + 1024 * 1024) {
    return fail(
      `Plik za duży (${(declared / 1e6).toFixed(1)} MB). Limit to ${MAX_UPLOAD_LABEL} (limit hostingu Vercel).`,
      413,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Oczekiwano multipart/form-data z polem pliku.", 400);
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
  if (size > MAX_BYTES) {
    return fail(`Plik za duży (${(size / 1e6).toFixed(1)} MB). Limit to ${MAX_UPLOAD_LABEL} (limit hostingu Vercel).`, 413);
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

  const startedAt = Date.now();
  try {
    let extracted: { text: string; pages: number; charCount: number };
    if (isText) {
      const text = new TextDecoder("utf-8").decode(buffer);
      extracted = { text, pages: 1, charCount: text.length };
    } else {
      extracted = await extractPdfText(new Uint8Array(buffer));
    }
    if (!extracted.text || extracted.charCount < 200) {
      return fail(
        isText
          ? "Plik tekstowy jest za krótki, żeby go sparsować."
          : "Nie udało się wyciągnąć praktycznie żadnego tekstu — PDF może być skanem/obrazem (OCR nieobsługiwany) albo jest uszkodzony.",
        422,
        `chars=${extracted.charCount}, pages=${extracted.pages}`,
      );
    }

    const result = parseReport(extracted);
    return NextResponse.json({
      ok: true,
      fileName: name,
      fileSize: size,
      elapsedMs: Date.now() - startedAt,
      result,
    });
  } catch (err) {
    console.error("[parse] pipeline error:", err);
    const classified = classifyPdfExtractError(err);
    return fail(classified.userMessage, classified.status, classified.detail);
  }
}

export function GET() {
  return NextResponse.json({
    service: "savori-parser",
    usage: "Wyślij PDF metodą POST jako multipart/form-data (pole: file), aby otrzymać sparsowane metryki.",
  });
}
