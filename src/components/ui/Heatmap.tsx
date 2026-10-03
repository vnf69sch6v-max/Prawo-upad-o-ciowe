'use client';

// Ogólna macierzowa mapa ciepła (wiersze × kolumny) z dywergentną skalą kolorów.
// Interakcje: podświetlenie wiersza/kolumny (crosshair) + „inspektor" wartości nad siatką
// (bez pływającego tooltipa — brak problemów z pozycjonowaniem pod transformem), klik wiersza.
// Telefon: tap komórki pokazuje inspektor i ZOSTAJE do następnego tapu / tapu poza siatką.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AXIS_INK, TICK_FONT } from '@/lib/chart-theme';
import { usePlotWidth } from '@/components/ui/ChartContainer';
import { useScrollFade } from '@/lib/use-scroll-fade';

// Kolumna etykiet: na telefonie węższa (104 px zamiast 152 px z 326 px karty) i PRZYKLEJONA —
// przy przewijaniu siatki w bok nazwa wiersza zostaje w kadrze.
const LABEL_W = 'w-[6.5rem] sm:w-[9.5rem]';
const LABEL_LEFT = 'left-[6.5rem] sm:left-[9.5rem]';

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
    scheme?: 'heat' | 'sentiment';                    // heat: +czerwony/−niebieski (inflacja); sentiment: +zielony/−czerwony (nastroje)
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
// sentiment (nastroje): dodatnie = zielony (optymizm), ujemne = czerwony (pesymizm)
const SENT_POS: [number, number, number][] = [BASE, [134, 239, 172], [34, 197, 94], [21, 128, 61]];
const SENT_NEG: [number, number, number][] = [BASE, [252, 165, 165], [239, 68, 68], [153, 27, 27]];

export function Heatmap({ rows, cols, valueAt, colTickFormatter = (c) => c, valueFormatter = (v) => v.toFixed(1), unit = '', onRowClick, cellHeight = 20, maxTicks = 14, scheme = 'heat' }: HeatmapProps) {
    const [hover, setHover] = useState<{ r: string; c: string; v: number | null } | null>(null);
    const { ref, width } = usePlotWidth();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fade = useScrollFade(scrollRef);
    const posRamp = scheme === 'sentiment' ? SENT_POS : POS;
    const negRamp = scheme === 'sentiment' ? SENT_NEG : NEG;
    const posColor = scheme === 'sentiment' ? '#16A34A' : '#B91C1C';
    const negColor = scheme === 'sentiment' ? '#DC2626' : '#1D4ED8';
    const toRgb = (c: [number, number, number]) => `rgb(${c[0]},${c[1]},${c[2]})`;

    // Domeny skali: symetryczna intensywność, sqrt dla kontrastu w środku zakresu (nie „gubi" normalnych okresów obok skoku 2022).
    const { posMax, negMax } = useMemo(() => {
        let pos = 0.1, neg = -0.1;
        rows.forEach((row) => cols.forEach((c) => { const v = valueAt(row.key, c); if (v != null) { if (v > pos) pos = v; if (v < neg) neg = v; } }));
        return { posMax: pos, negMax: neg };
    }, [rows, cols, valueAt]);
    const colorOf = (v: number | null): string => {
        if (v == null) return '#F8FAFC';
        return v >= 0 ? ramp(posRamp, Math.sqrt(v / posMax)) : ramp(negRamp, Math.sqrt(v / negMax));
    };

    // Które kolumny dostają etykietę (przerzedzenie, zawsze pierwsza i ostatnia).
    // Na 375 px etykieta 11px ≈ 42 px — maxTicks z pomiaru, nie zgadywane.
    const tickBudget = width > 0 ? Math.max(4, Math.floor(Math.min(width, 560) / 42)) : maxTicks;
    const tickCap = Math.min(maxTicks, tickBudget);
    const tickEvery = Math.max(1, Math.ceil(cols.length / tickCap));
    const showTick = (i: number) => i === 0 || i === cols.length - 1 || i % tickEvery === 0;

    useEffect(() => {
        const hide = (e: PointerEvent) => {
            if (!ref.current?.contains(e.target as Node)) setHover(null);
        };
        document.addEventListener('pointerdown', hide);
        return () => document.removeEventListener('pointerdown', hide);
    }, [ref]);

    // Najnowsze okresy są po prawej — gdy siatka się nie mieści (telefon), startujemy od nich,
    // a starsze lata są „w lewo" (jak oś czasu w aplikacjach giełdowych).
    useEffect(() => {
        const el = scrollRef.current;
        if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
    }, [cols.length, width]);

    const pin = (rowKey: string, c: string, v: number | null) => setHover({ r: rowKey, c, v });

    return (
        <div ref={ref} className="w-full min-w-0">
            {/* Inspektor: aktywna komórka */}
            <div className="mb-2 flex min-h-5 flex-wrap items-center gap-2 text-xs">
                {hover ? (
                    <>
                        <span className="font-semibold text-mk-text">{rows.find((r) => r.key === hover.r)?.label}</span>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">{colTickFormatter(hover.c)}</span>
                        <span className="text-mk-faint">·</span>
                        <span className="font-semibold tnum" style={{ color: hover.v == null ? AXIS_INK : hover.v >= 0 ? posColor : negColor }}>
                            {hover.v == null ? 'brak danych' : `${hover.v > 0 ? '+' : ''}${valueFormatter(hover.v)}${unit}`}
                        </span>
                    </>
                ) : <span className="text-mk-faint">Dotknij komórki, aby zobaczyć wartość · kliknij wiersz, aby otworzyć szczegóły</span>}
            </div>

            <div className="relative">
            <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain">
                <div className="min-w-[560px]">
                    {rows.map((row) => {
                        const active = hover?.r === row.key;
                        return (
                            <div key={row.key} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => onRowClick?.(row.key)}
                                    className={`sticky left-0 z-[1] ${LABEL_W} min-h-7 shrink-0 truncate bg-mk-surface pr-2 text-right text-[11px] transition-colors ${active ? 'font-semibold text-mk-text' : 'text-mk-muted'} ${onRowClick ? 'cursor-pointer hover:text-mk-text' : ''}`}
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
                                                onMouseEnter={() => pin(row.key, c, v)}
                                                onPointerDown={(e) => { e.stopPropagation(); pin(row.key, c, v); }}
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
                        <div className={`sticky left-0 z-[1] ${LABEL_W} shrink-0 self-stretch bg-mk-surface`} />
                        <div className="flex flex-1 gap-px">
                            {cols.map((c, i) => (
                                <div key={c} style={{ flex: '1 1 0' }} className="overflow-visible text-center">
                                    {showTick(i) && <span className="inline-block whitespace-nowrap text-mk-faint" style={{ fontSize: TICK_FONT, transform: 'translateX(-2px)' }}>{colTickFormatter(c)}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Wygaszone krawędzie: „siatka ciągnie się dalej" (lewa — za kolumną etykiet). */}
            {(fade === 'start' || fade === 'both') && (
                <div aria-hidden className={`pointer-events-none absolute inset-y-0 ${LABEL_LEFT} z-[2] w-6`} style={{ background: 'linear-gradient(to right, var(--color-mk-surface), transparent)' }} />
            )}
            {(fade === 'end' || fade === 'both') && (
                <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-6" style={{ background: 'linear-gradient(to left, var(--color-mk-surface), transparent)' }} />
            )}
            </div>

            {/* Legenda skali */}
            <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-mk-faint">
                <span>{negMax < -0.15 ? `${valueFormatter(negMax)}${unit}` : '0'}</span>
                <span className="h-2.5 w-28 rounded-full sm:w-40" style={{ background: `linear-gradient(90deg, ${negMax < -0.15 ? negRamp.slice(1).reverse().map(toRgb).join(', ') + ', ' : ''}${posRamp.map(toRgb).join(', ')})` }} />
                <span>+{valueFormatter(posMax)}{unit}</span>
            </div>
        </div>
    );
}
