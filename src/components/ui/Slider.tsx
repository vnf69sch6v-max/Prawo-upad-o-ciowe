'use client';

interface SliderProps {
    id?: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    /** Widoczna wartość (np. „450 000 zł”). */
    display: string;
    /** Tekst dla czytników — musi zawierać jednostkę. */
    valueText: string;
}

/** Zakres z etykietą i `aria-valuetext` (WCAG 1.3.1 / 4.1.2). */
export function Slider({ id, label, value, min, max, step, onChange, display, valueText }: SliderProps) {
    const inputId = id ?? `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label className="mk-label" htmlFor={inputId}>{label}</label>
                <span className="text-lg font-bold tnum text-mk-text" aria-hidden>{display}</span>
            </div>
            <input
                id={inputId}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={valueText}
                className="h-7 w-full"
                style={{ accentColor: 'var(--color-mk-primary)' }}
            />
        </div>
    );
}
