'use client';

// Ogólna macierzowa mapa ciepła (wiersze × kolumny) z dywergentną skalą kolorów.
// Interakcje: podświetlenie wiersza/kolumny (crosshair) + „inspektor" wartości nad siatką
// (bez pływającego tooltipa — brak problemów z pozycjonowaniem pod transformem), klik wiersza.
import { useMemo, useState } from 'react';

export interface HeatmapRow { key: string; label: string }

interface HeatmapProps {
    rows: HeatmapRow[];
    cols: string[];                                   // etykiety kolumn (np. daty)
    valueAt: (rowKey: string, col: string) => number | null;
    colTickFormatter?: (col: string) => string;       // formatowanie etykiety kolumny
    valueFormatter?: (v: number) => string;           // formatowanie wartości (inspektor/tytuł)
    unit?: string;
    onRowClick?: (rowKey: string) => void;
    cellHeight?: number;
    maxTicks?: number;                                // ile etykiet kolumn pokazać
}

// Wielostopniowa interpolacja RGB.
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
function ramp(stops: [number, number, number][], t: number): string {
    const c = Math.max(0, Math.min(1, t)) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(c));
    const f = c - i;
    const [r, g, b] = [0, 1, 2].map((k) => lerp(stops[i][k], stops[i + 1][k], f));
    return `rgb(${r},${g},${b})`;
}
const BASE: [number, number, number] = [241, 245, 249];                                   // ~white (0)
const POS: [number, number, number][] = [BASE, [251, 191, 36], [234, 88, 12], [153, 27, 27]]; // → amber → orange → deep red
const NEG: [number, number, number][] = [BASE, [125, 211, 252], [37, 99, 235], [30, 58, 138]]; // → sky → blue → navy

export function Heatmap({ rows, cols, valueAt, colTickFormatter = (c) => c, valueFormatter = (v) => v.toFixed(1), unit = '', onRowClick, cellHeight = 20, maxTicks = 14 }: HeatmapProps) {
    const [hover, setHover] = useState<{ r: string; c: string; v: number | null } | null>(null);

    // Domeny skali: symetryczna intensywność, sqrt dla kontrastu w środku zakresu (nie „gubi" normalnych okresów obok skoku 2022).
    const { posMax, negMax } = useMemo(() => {
        let pos = 0.1, neg = -0.1;
        rows.forEach((row) => cols.forEach((c) => { const v = valueAt(row.key, c); if (v != null) { if (v > pos) pos = v; if (v < neg) neg = v; } }));
        return { posMax: pos, negMax: neg };
    }, [rows, cols, valueAt]);
    const colorOf = (v: number | null): string => {
        if (v == null) return '#F8FAFC';
        return v >= 0 ? ramp(POS, Math.sqrt(v / posMax)) : ramp(NEG, Math.sqrt(v / negMax));
    };

    // Które kolumny dostają etykietę (przerzedzenie, zawsze pierwsza i ostatnia).
    const tickEvery = Math.max(1, Math.ceil(cols.length / maxTicks));
    const showTick = (i: number) => i === 0 || i === cols.length - 1 || i % tickEvery === 0;

    return (
        <div className="w-full">
            {/* Inspektor: aktywna komórka */}
            <div className="mb-2 flex h-5 items-center gap-2 text-xs">
                {hover ? (
                    <>
                        <span className="font-semibold text-mk-text">{rows.find((r) => r.key === hover.r)?.label}</span>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">{colTickFormatter(hover.c)}</span>
                        <span className="text-mk-faint">·</span>
                        <span className="font-semibold tnum" style={{ color: hover.v == null ? '#94A3B8' : hover.v >= 0 ? '#B91C1C' : '#1D4ED8' }}>
                            {hover.v == null ? 'brak danych' : `${hover.v > 0 ? '+' : ''}${valueFormatter(hover.v)}${unit}`}
                        </span>
                    </>
                ) : <span className="text-mk-faint">Najedź na komórkę, aby zobaczyć wartość · kliknij wiersz, aby otworzyć szczegóły</span>}
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                    {rows.map((row) => {
                        const active = hover?.r === row.key;
                        return (
                            <div key={row.key} className="flex items-center" onMouseLeave={() => setHover((h) => (h?.r === row.key ? null : h))}>
                                <button
                                    onClick={() => onRowClick?.(row.key)}
                                    className={`w-[9.5rem] shrink-0 truncate pr-2 text-right text-[11px] transition-colors ${active ? 'font-semibold text-mk-text' : 'text-mk-muted'} ${onRowClick ? 'cursor-pointer hover:text-mk-text' : ''}`}
                                    title={row.label}>
                                    {row.label}
                                </button>
                                <div className="flex flex-1 gap-px">
                                    {cols.map((c) => {
                                        const v = valueAt(row.key, c);
                                        const isHover = hover?.r === row.key && hover?.c === c;
                                        const colHover = hover?.c === c;
                                        return (
                                            <div
                                                key={c}
                                                onMouseEnter={() => setHover({ r: row.key, c, v })}
                                                onClick={() => onRowClick?.(row.key)}
                                                title={`${row.label} · ${colTickFormatter(c)}: ${v == null ? 'brak' : `${v > 0 ? '+' : ''}${valueFormatter(v)}${unit}`}`}
                                                className={onRowClick ? 'cursor-pointer' : ''}
                                                style={{
                                                    flex: '1 1 0', height: cellHeight, background: colorOf(v),
                                                    borderRadius: 2,
                                                    outline: isHover ? '2px solid #0F172A' : colHover || active ? '1px solid rgba(15,23,42,.22)' : 'none',
                                                    outlineOffset: isHover ? -2 : -1,
                                                    transition: 'outline-color .1s',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Etykiety kolumn */}
                    <div className="mt-1 flex items-center">
                        <div className="w-[9.5rem] shrink-0" />
                        <div className="flex flex-1 gap-px">
                            {cols.map((c, i) => (
                                <div key={c} style={{ flex: '1 1 0' }} className="overflow-visible text-center">
                                    {showTick(i) && <span className="inline-block whitespace-nowrap text-[9px] text-mk-faint" style={{ transform: 'translateX(-2px)' }}>{colTickFormatter(c)}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legenda skali */}
            <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-mk-faint">
                <span>{negMax < -0.15 ? `${valueFormatter(negMax)}${unit}` : '0'}</span>
                <span className="h-2.5 w-40 rounded-full" style={{ background: `linear-gradient(90deg, ${negMax < -0.15 ? 'rgb(30,58,138), rgb(37,99,235),' : ''} rgb(241,245,249), rgb(251,191,36), rgb(234,88,12), rgb(153,27,27))` }} />
                <span>+{valueFormatter(posMax)}{unit}</span>
            </div>
        </div>
    );
}
