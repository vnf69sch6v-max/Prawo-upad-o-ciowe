'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: string;
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
    render?: (row: T) => ReactNode;
    /** Value used for sorting (defaults to render output not usable) */
    sortValue?: (row: T) => number | string;
    width?: number | string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    initialSort?: string;
    initialDir?: 'asc' | 'desc';
    maxHeight?: number;
    /** Optional row key extractor */
    rowKey?: (row: T, i: number) => string | number;
    emptyText?: string;
    /** Optional row click → interactive rows (kursor + hover). */
    onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, initialSort, initialDir = 'desc', maxHeight, rowKey, emptyText = 'Brak danych', onRowClick }: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | undefined>(initialSort);
    const [dir, setDir] = useState<'asc' | 'desc'>(initialDir);

    const sorted = useMemo(() => {
        if (!sortKey) return rows;
        const col = columns.find((c) => c.key === sortKey);
        if (!col?.sortValue) return rows;
        const arr = [...rows];
        arr.sort((a, b) => {
            const av = col.sortValue!(a);
            const bv = col.sortValue!(b);
            const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'pl');
            return dir === 'asc' ? cmp : -cmp;
        });
        return arr;
    }, [rows, sortKey, dir, columns]);

    const toggle = (key: string) => {
        if (sortKey === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setDir('desc');
        }
    };

    const align = (a?: string) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

    return (
        <div style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}>
            <table className="mk-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} className={align(c.align)} style={{ width: c.width, cursor: c.sortable ? 'pointer' : undefined }} onClick={c.sortable ? () => toggle(c.key) : undefined}>
                                <span className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                                    {c.header}
                                    {c.sortable && sortKey === c.key && (dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-6 text-center text-mk-faint">{emptyText}</td>
                        </tr>
                    ) : (
                        sorted.map((row, i) => (
                            <tr key={rowKey ? rowKey(row, i) : i} onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={onRowClick ? 'cursor-pointer transition-colors hover:bg-mk-surface-alt' : undefined}>
                                {columns.map((c) => (
                                    <td key={c.key} className={align(c.align)}>
                                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
