'use client';

import { useEffect, useRef } from 'react';
import { scrollChildInline } from '@/lib/tab-scroll';
import { useScrollFade } from '@/lib/use-scroll-fade';

interface SegmentedProps<T extends string> {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md';
    'aria-label'?: string;
}

/**
 * Light segmented control — used for M/M vs R/R, range pickers, etc.
 *
 * Telefon: cel dotykowy 44 px (`@media (pointer: coarse)` w globals.css), pasek przewija się
 * w bok, a niemieszcząca się krawędź jest wygaszona (`useScrollFade`) — bez tego np. czwarta
 * zakładka „Budowlano-montażowe" wyglądała na uciętą błędem.
 */
export function Segmented<T extends string>({ options, value, onChange, size = 'md', ...rest }: SegmentedProps<T>) {
    const listRef = useRef<HTMLDivElement>(null);
    const fade = useScrollFade(listRef);

    useEffect(() => {
        const list = listRef.current;
        const active = list?.querySelector<HTMLElement>('[aria-selected="true"]');
        if (list && active) scrollChildInline(list, active);
    }, [value]);

    const move = (dir: 1 | -1) => {
        const i = options.findIndex((o) => o.value === value);
        const next = options[Math.min(options.length - 1, Math.max(0, i + dir))];
        if (next) onChange(next.value);
    };

    return (
        <div
            ref={listRef}
            className="mk-seg mk-fade-x"
            data-fade={fade}
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
                        className={`mk-seg-btn ${size === 'sm' ? 'mk-seg-sm' : ''} ${selected ? 'mk-seg-btn-active' : ''}`}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
