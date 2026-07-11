'use client';

import { Download } from 'lucide-react';

type Cell = string | number | null | undefined;

interface CsvExportProps {
    filename: string;
    headers?: string[];
    rows: Cell[][];
    label?: string;
    variant?: 'button' | 'ghost';
}

/**
 * Client-side CSV download (no server round-trip, no file writes).
 * Uses `;` separator + UTF-8 BOM so Polish Excel opens it cleanly.
 */
export function CsvExport({ filename, headers, rows, label = 'Eksportuj CSV', variant = 'button' }: CsvExportProps) {
    const handle = () => {
        const esc = (v: Cell) => {
            const s = String(v ?? '');
            return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines: string[] = [];
        if (headers) lines.push(headers.map(esc).join(';'));
        for (const r of rows) lines.push(r.map(esc).join(';'));

        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    if (variant === 'ghost') {
        return (
            <button type="button" onClick={handle} className="inline-flex items-center gap-1.5 text-sm font-medium text-mk-muted transition-colors hover:text-mk-primary">
                <Download size={15} /> {label}
            </button>
        );
    }

    return (
        <button type="button" onClick={handle} className="mk-btn">
            <Download size={15} /> {label}
        </button>
    );
}
