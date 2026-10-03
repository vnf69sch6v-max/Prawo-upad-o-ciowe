'use client';

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useScrollFade } from '@/lib/use-scroll-fade';

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
    /**
     * Optional control rendered beside the mobile card (e.g. WatchStar).
     * Kept outside the row button so we never nest <button> in <button>.
     */
    cardAction?: (row: T) => ReactNode;
    /**
     * Układ poniżej `sm`, gdy nie ma `mobileAsCards`:
     * `auto` (domyślnie) — ≤ 4 kolumn → lista (nazwa po lewej, wartość po prawej), więcej → tabela
     * przewijana w karcie z przyklejoną pierwszą kolumną i wygaszoną krawędzią;
     * `table` — zawsze tabela.
     */
    mobileLayout?: 'auto' | 'table';
}

/** Wiersze listy mobilnej widoczne przed „Pokaż wszystkie" — liczone z `maxHeight` tabeli. */
const LIST_ROW_PX = 52;

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
    cardAction,
    mobileLayout = 'auto',
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | undefined>(initialSort);
    const [dir, setDir] = useState<'asc' | 'desc'>(initialDir);
    const [expanded, setExpanded] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const wrapFade = useScrollFade(wrapRef);
    const asList = !mobileAsCards && mobileLayout === 'auto' && columns.length <= 4;
    const sortFade = useScrollFade(sortRef, asList);

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

    // Wygaszamy tylko PRAWĄ krawędź: lewą zajmuje przyklejona pierwsza kolumna, maska by ją zjadła.
    const table = (
        <div
            ref={wrapRef}
            className="mk-table-wrap mk-fade-x"
            data-fade={wrapFade === 'end' || wrapFade === 'both' ? 'end' : 'none'}
            style={wrapStyle}
        >
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

    if (asList) {
        const [primary, ...restCols] = columns;
        const leftCols = restCols.filter((c) => c.align !== 'right');
        const rightCols = restCols.filter((c) => c.align === 'right');
        const sortable = columns.filter((c) => c.sortable && c.sortValue);
        const limit = maxHeight ? Math.max(6, Math.floor(maxHeight / LIST_ROW_PX)) : Infinity;
        const shown = expanded ? sorted : sorted.slice(0, limit);
        const hidden = sorted.length - shown.length;

        const rowInner = (row: T) => (
            <>
                <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-medium leading-snug text-mk-text">{primary ? cell(primary, row) : null}</span>
                    {leftCols.length > 0 && (
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-mk-muted">
                            {leftCols.map((c) => (
                                <span key={c.key} className="inline-flex min-w-0 items-center gap-1.5">
                                    <span className="text-mk-faint">{c.header}</span>
                                    {cell(c, row)}
                                </span>
                            ))}
                        </span>
                    )}
                </span>
                {rightCols.length > 0 && (
                    <span className="shrink-0 text-right tnum">
                        <span className="block text-sm font-semibold text-mk-text">{cell(rightCols[0], row)}</span>
                        {rightCols.slice(1).map((c) => (
                            <span key={c.key} className="mt-0.5 block text-xs text-mk-muted">
                                <span className="mr-1 text-mk-faint">{c.header}</span>
                                {cell(c, row)}
                            </span>
                        ))}
                    </span>
                )}
                {onRowClick && <ChevronRight size={16} className="-mr-1 shrink-0 text-mk-faint" aria-hidden />}
            </>
        );

        return (
            <>
                <div className="sm:hidden">
                    {sortable.length > 1 && (
                        <div className="mb-2 flex min-w-0 items-center gap-2">
                            <span className="shrink-0 text-xs font-medium text-mk-muted">Sortuj</span>
                            <div ref={sortRef} className="mk-seg mk-fade-x" data-fade={sortFade} role="group" aria-label="Sortowanie listy">
                                {sortable.map((c) => {
                                    const active = sortKey === c.key;
                                    return (
                                        <button
                                            key={c.key}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => toggle(c.key)}
                                            className={`mk-seg-btn mk-seg-sm gap-1 ${active ? 'mk-seg-btn-active' : ''}`}
                                        >
                                            {c.header}
                                            {active && (dir === 'asc' ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />)}
                                            {active && <span className="sr-only">{dir === 'asc' ? ' (rosnąco)' : ' (malejąco)'}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {sorted.length === 0 ? (
                        <p className="py-6 text-center text-sm text-mk-faint">{emptyText}</p>
                    ) : (
                        <ul className="mk-table-list">
                            {shown.map((row, i) => (
                                <li key={rowKey ? rowKey(row, i) : i}>
                                    {onRowClick ? (
                                        <button type="button" onClick={() => onRowClick(row)} className="mk-table-row mk-press-row">
                                            {rowInner(row)}
                                        </button>
                                    ) : (
                                        <div className="mk-table-row">{rowInner(row)}</div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {(hidden > 0 || (expanded && sorted.length > limit)) && (
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            aria-expanded={expanded}
                            className="mk-press mt-1 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-mk-border text-sm font-medium text-mk-text-soft hover:bg-mk-surface-alt"
                        >
                            {expanded ? 'Zwiń' : `Pokaż wszystkie (${sorted.length})`}
                            {expanded ? <ChevronUp size={15} aria-hidden /> : <ChevronDown size={15} aria-hidden />}
                        </button>
                    )}
                </div>
                <div className="hidden sm:block">{table}</div>
            </>
        );
    }

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
                        const action = cardAction?.(row);
                        const inner = (
                            <>
                                <div className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-mk-text">{titleOf(row)}</div>
                                <div className="mt-0.5 flex items-baseline justify-between gap-3 text-sm text-mk-text-soft">{metaOf(row)}</div>
                            </>
                        );
                        const card = onRowClick ? (
                            <button
                                type="button"
                                onClick={() => onRowClick(row)}
                                className="mk-table-card min-w-0 flex-1 transition-transform duration-100"
                            >
                                {inner}
                            </button>
                        ) : (
                            <div className="mk-table-card min-w-0 flex-1">{inner}</div>
                        );
                        return (
                            <li key={key} className={action ? 'flex items-center gap-1' : undefined}>
                                {action}
                                {card}
                            </li>
                        );
                    })
                )}
            </ul>
            <div className="hidden sm:block">{table}</div>
        </>
    );
}
