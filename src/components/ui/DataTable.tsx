'use client';

import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
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
    /**
     * Below `sm` render a 2-line card list instead of the table.
     * Intended only for the clickable company quotes table.
     */
    mobileAsCards?: boolean;
    /** Line 1 of a mobile card (defaults to the first two columns). */
    cardTitle?: (row: T) => ReactNode;
    /** Line 2 of a mobile card (defaults to remaining columns). */
    cardMeta?: (row: T) => ReactNode;
}

export function DataTable<T>({
    columns,
    rows,
    initialSort,
    initialDir = 'desc',
    maxHeight,
    rowKey,
    emptyText = 'Brak danych',
    onRowClick,
    mobileAsCards = false,
    cardTitle,
    cardMeta,
}: DataTableProps<T>) {
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

    const cell = (c: Column<T>, row: T): ReactNode =>
        c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—');

    const ariaSort = (key: string): 'ascending' | 'descending' | 'none' => {
        if (sortKey !== key) return 'none';
        return dir === 'asc' ? 'ascending' : 'descending';
    };

    const onHeaderKey = (e: KeyboardEvent<HTMLButtonElement>, key: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(key);
        }
    };

    const wrapStyle = maxHeight ? { maxHeight, overflow: 'auto' as const } : undefined;

    const table = (
        <div className="mk-table-wrap" style={wrapStyle}>
            <table className="mk-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                scope="col"
                                className={align(c.align)}
                                style={{ width: c.width }}
                                aria-sort={c.sortable ? ariaSort(c.key) : undefined}
                            >
                                {c.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() => toggle(c.key)}
                                        onKeyDown={(e) => onHeaderKey(e, c.key)}
                                        className={`mk-table-sort ${c.align === 'right' ? 'mk-table-sort-end' : c.align === 'center' ? 'mk-table-sort-center' : ''}`}
                                    >
                                        <span>{c.header}</span>
                                        {sortKey === c.key && (dir === 'asc' ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />)}
                                    </button>
                                ) : (
                                    <span className={`inline-flex min-h-7 items-center ${c.align === 'right' ? 'justify-end' : c.align === 'center' ? 'justify-center' : ''}`}>
                                        {c.header}
                                    </span>
                                )}
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
                            <tr
                                key={rowKey ? rowKey(row, i) : i}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                onKeyDown={onRowClick ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onRowClick(row);
                                    }
                                } : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                                className={onRowClick ? 'cursor-pointer transition-colors hover:bg-mk-surface-alt focus:outline-none focus-visible:bg-mk-surface-alt' : undefined}
                            >
                                {columns.map((c) => (
                                    <td key={c.key} className={align(c.align)}>
                                        {cell(c, row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    if (!mobileAsCards) return table;

    const titleOf = (row: T) =>
        cardTitle ? cardTitle(row) : (
            <span className="flex min-w-0 items-baseline gap-2">
                {columns[0] ? cell(columns[0], row) : null}
                {columns[1] ? <span className="truncate">{cell(columns[1], row)}</span> : null}
            </span>
        );

    const metaOf = (row: T) =>
        cardMeta ? cardMeta(row) : (
            <span className="flex items-baseline justify-between gap-3">
                {columns.slice(2).map((c) => (
                    <span key={c.key}>{cell(c, row)}</span>
                ))}
            </span>
        );

    return (
        <>
            <ul className="space-y-2 sm:hidden">
                {sorted.length === 0 ? (
                    <li className="py-6 text-center text-sm text-mk-faint">{emptyText}</li>
                ) : (
                    sorted.map((row, i) => {
                        const key = rowKey ? rowKey(row, i) : i;
                        const inner = (
                            <>
                                <div className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-mk-text">{titleOf(row)}</div>
                                <div className="mt-0.5 flex items-baseline justify-between gap-3 text-sm text-mk-text-soft">{metaOf(row)}</div>
                            </>
                        );
                        return (
                            <li key={key}>
                                {onRowClick ? (
                                    <button
                                        type="button"
                                        onClick={() => onRowClick(row)}
                                        className="mk-table-card"
                                    >
                                        {inner}
                                    </button>
                                ) : (
                                    <div className="mk-table-card">{inner}</div>
                                )}
                            </li>
                        );
                    })
                )}
            </ul>
            <div className="hidden sm:block">{table}</div>
        </>
    );
}
