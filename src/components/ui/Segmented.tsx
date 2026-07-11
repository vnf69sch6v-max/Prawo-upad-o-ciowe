'use client';

interface SegmentedProps<T extends string> {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md';
    'aria-label'?: string;
}

/** Light segmented control — used for M/M vs R/R, range pickers, etc. */
export function Segmented<T extends string>({ options, value, onChange, size = 'md', ...rest }: SegmentedProps<T>) {
    return (
        <div className="mk-seg" role="tablist" aria-label={rest['aria-label']}>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="tab"
                    aria-selected={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={`mk-seg-btn ${value === o.value ? 'mk-seg-btn-active' : ''}`}
                    style={size === 'sm' ? { padding: '3px 9px', fontSize: 12 } : undefined}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
