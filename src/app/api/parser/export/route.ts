// src/app/api/parser/export/route.ts
// Serializuje wynik parsowania do CSV / JSON / XLSX. Klient POST-uje wynik,
// który już ma; my formatujemy i odsyłamy plik z nazwą do pobrania.

import { NextResponse } from "next/server";
import { buildExportTables, toCSV, toJSON, exportBaseName, type CellFormat } from "@/lib/parser/export";
import type { ParseResult } from "@/lib/parser/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Czerwień marki Savori — nagłówki arkuszy. */
const BRAND_ARGB = "FFDC2626";
const HEADER_TEXT_ARGB = "FFFFFFFF";
const NOTE_ARGB = "FF64748B";

/**
 * Formaty liczbowe Excela. Ujemne trafiają w nawiasy i na czerwono — to
 * konwencja sprawozdań finansowych, ta sama, którą pokazuje strona.
 * Separatory (`,` `.`) Excel podmienia na lokalne, więc plik otwarty po polsku
 * pokaże spację jako separator tysięcy i przecinek dziesiętny.
 */
function numFmtFor(format: CellFormat, currency: string | null): string {
  switch (format) {
    case "money": {
      // Symbol waluty za liczbą dla PLN, przed liczbą dla reszty — jak w UI.
      const suffix = currency === "PLN" ? '" zł"' : "";
      const prefix = currency && currency !== "PLN" ? `"${currency === "USD" ? "$" : currency + " "}"` : "";
      return `${prefix}#,##0.00${suffix};[Red]\\(${prefix}#,##0.00${suffix}\\)`;
    }
    case "pct":
      // Wartości są JUŻ w punktach procentowych (−2,87 = −2,87%), więc bez `%`,
      // które mnożyłoby przez 100.
      return '0.0"%";[Red]\\(0.0"%"\\)';
    case "ratio":
      return '0.00"×";[Red]\\(0.00"×"\\)';
    case "int":
      return "#,##0;[Red]\\(#,##0\\)";
    default:
      return "General";
  }
}

export async function POST(req: Request) {
  let body: { result?: ParseResult; format?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe ciało żądania (JSON)." }, { status: 400 });
  }
  const result = body.result;
  const format = (body.format ?? "csv").toLowerCase();
  if (!result || !result.detection) {
    return NextResponse.json({ error: "Brak wyniku parsowania." }, { status: 400 });
  }

  const base = exportBaseName(result);

  try {
    if (format === "csv") {
      // BOM — bez niego Excel otwiera polskie znaki jako krzaki.
      return new NextResponse("﻿" + toCSV(result), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${base}.csv"`,
        },
      });
    }
    if (format === "json") {
      return new NextResponse(toJSON(result), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${base}.json"`,
        },
      });
    }
    if (format === "xlsx") {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "Savori — parser raportów";
      wb.created = new Date();
      wb.title = result.detection.structureLabel;

      const currency = result.detection.currency;

      for (const table of buildExportTables(result)) {
        const ws = wb.addWorksheet(table.name.slice(0, 31));

        // ── Nagłówek ──
        const header = ws.addRow(table.columns);
        header.font = { bold: true, color: { argb: HEADER_TEXT_ARGB }, size: 11 };
        header.height = 22;
        header.eachCell((c) => {
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_ARGB } };
          c.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        });

        // ── Dane ──
        table.rows.forEach((r, i) => {
          const row = ws.addRow(r);
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber === 1) {
              cell.alignment = { vertical: "middle" };
              return;
            }
            // Kolumna zna swoją jednostkę lepiej niż wiersz, więc wygrywa.
            const fmt =
              table.columnFormats?.[colNumber - 1] ?? table.rowFormats?.[i] ?? table.valueFormat;
            if (typeof cell.value === "number") {
              cell.numFmt = numFmtFor(fmt, currency);
              cell.alignment = { horizontal: "right", vertical: "middle" };
            } else {
              cell.alignment = { horizontal: "left", vertical: "middle" };
            }
          });
        });

        // ── Notatka pod tabelą ──
        if (table.note) {
          ws.addRow([]);
          const note = ws.addRow([table.note]);
          note.font = { italic: true, size: 9, color: { argb: NOTE_ARGB } };
        }

        // ── Szerokości kolumn ──
        ws.columns.forEach((col, idx) => {
          let w = idx === 0 ? 30 : 14;
          col.eachCell?.({ includeEmpty: false }, (c) => {
            // Notatka jest długa i nie powinna rozpychać pierwszej kolumny.
            const raw = c.value;
            if (typeof raw === "string" && raw === table.note) return;
            const len = String(raw ?? "").length;
            // Liczby renderują się szerzej niż surowa wartość (separatory, waluta).
            w = Math.max(w, typeof raw === "number" ? len + 6 : len + 2);
          });
          col.width = Math.min(46, w);
        });

        // ── Zamrożony nagłówek + etykiety, autofiltr ──
        ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];
        if (table.rows.length > 1) {
          ws.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: table.columns.length },
          };
        }
      }

      const buf = await wb.xlsx.writeBuffer();
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        },
      });
    }
    return NextResponse.json({ error: `Nieznany format "${format}".` }, { status: 400 });
  } catch (err) {
    console.error("[export] failed:", err);
    return NextResponse.json({ error: "Eksport nie powiódł się." }, { status: 500 });
  }
}
