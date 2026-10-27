// Arkusz e-Stat (xlsx) → siatka tekstowa dla `parseContributionGrid`. Bez Firebase.
import type ExcelJS from 'exceljs';

function textOf(value: ExcelJS.CellValue): string {
    if (value == null) return '';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
        if ('richText' in value && Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('');
        if ('result' in value) return textOf(value.result as ExcelJS.CellValue);
        if ('text' in value && typeof value.text === 'string') return value.text;
    }
    return String(value);
}

/** Pierwszy arkusz. Puste wiersze zostają dziurami — parser szuka nagłówków po treści, nie po numerze. */
export async function workbookToGrid(buf: Buffer): Promise<string[][]> {
    const { default: ExcelJS } = await import('exceljs');
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buf as unknown as ExcelJS.Buffer);
    const sheet = book.worksheets[0];
    if (!sheet) throw new Error('pusty arkusz CPI');
    const grid: string[][] = [];
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const line: string[] = [];
        row.eachCell({ includeEmpty: true }, (cell, col) => {
            line[col - 1] = textOf(cell.value);
        });
        grid[rowNumber - 1] = line;
    });
    return grid;
}
