'use client';

import { useEffect, useRef } from 'react';

interface SegmentedProps<T extends string> {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md';
    'aria-label'?: string;
}

/** Light segmented control — used for M/M vs R/R, range pickers, etc. */
export function Segmented<T extends string>({ options, value, onChange, size = 'md', ...rest }: SegmentedProps<T>) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
        active?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }, [value]);

    const move = (dir: 1 | -1) => {
        const i = options.findIndex((o) => o.value === value);
        const next = options[Math.min(options.length - 1, Math.max(0, i + dir))];
        if (next) onChange(next.value);
    };

    return (
        <div
            ref={listRef}
            className="mk-seg"
            role="tablist"
            aria-label={rest['aria-label']}
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
            }}
        >
            {options.map((o) => {
                const selected = value === o.value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(o.value)}
                        className={`mk-seg-btn ${selected ? 'mk-seg-btn-active' : ''}`}
                        style={size === 'sm' ? { padding: '4px 9px', fontSize: 12, minHeight: 28 } : undefined}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
