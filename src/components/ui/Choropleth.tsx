'use client';

import { useState } from 'react';
import { VOIVODESHIP_PATHS, LABEL_POS, SLUG_TO_PATH } from '@/lib/poland-geo';
import { usePlotWidth } from '@/components/ui/ChartContainer';

const VB_W = 580;
/** Etykieta województwa ma mieć na ekranie ~11 px niezależnie od skali mapy (viewBox 580 → 326 px
 *  na telefonie dawał 5,6 px — nieczytelne). Jednostki viewBoxa, zaciśnięte 10–20. */
const labelSize = (w: number) => (w > 0 ? Math.min(20, Math.max(10, (11 * VB_W) / w)) : 10);

const SCHEMES: Record<string, string[]> = {
    blue: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
    teal: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490'],
    violet: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9'],
    amber: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
};

export interface ChoroItem { slug: string; name: string; value: number | null }

interface ChoroplethProps {
    items: ChoroItem[];
    /** Format wartości w tooltipie. */
    format: (v: number) => string;
    /** Krótszy format etykiety na mapie (domyślnie = format). */
    labelFormat?: (v: number) => string;
    scheme?: keyof typeof SCHEMES;
    /** Odwróć skalę (gdy niższa wartość = „lepsza"/ciemniejsza). */
    reverse?: boolean;
    unit?: string;
    selected?: string | null;
    onSelect?: (slug: string | null) => void;
}

export function Choropleth({ items, format, labelFormat, scheme = 'blue', reverse, unit, selected, onSelect }: ChoroplethProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const { ref, width } = usePlotWidth();

    const bySlug = new Map(items.map((i) => [i.slug, i]));
    const vals = items.map((i) => i.value).filter((v): v is number => v != null);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;
    const pal = SCHEMES[scheme];
    const norm = (v: number) => {
        const t = max > min ? (v - min) / (max - min) : 0.5;
        return reverse ? 1 - t : t;
    };
    const colorAt = (v: number | null) => (v == null ? '#E5E7EB' : pal[Math.min(pal.length - 1, Math.max(0, Math.floor(norm(v) * pal.length)))]);
    const hov = hovered ? bySlug.get(hovered) : null;

    return (
        <div ref={ref} data-choropleth className="relative w-full" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}>
            <svg viewBox={`0 0 ${VB_W} 550`} className="h-auto w-full" style={{ maxHeight: '62vh' }}>
                {Object.entries(SLUG_TO_PATH).map(([slug, pathKey]) => {
                    const d = VOIVODESHIP_PATHS[pathKey];
                    if (!d) return null;
                    const v = bySlug.get(slug)?.value ?? null;
                    const isSel = selected === slug;
                    const isHov = hovered === slug;
                    const lp = LABEL_POS[pathKey];
                    return (
                        <g key={slug}>
                            <path d={d} fill={colorAt(v)} stroke={isSel ? '#0F172A' : '#ffffff'} strokeWidth={isSel ? 2.5 : 1}
                                className={onSelect ? 'cursor-pointer transition-opacity duration-150 [-webkit-tap-highlight-color:transparent]' : 'transition-opacity duration-150'}
                                opacity={isHov || isSel ? 1 : 0.92}
                                onMouseEnter={() => setHovered(slug)} onMouseLeave={() => setHovered(null)}
                                onClick={() => onSelect?.(selected === slug ? null : slug)} />
                            {lp && v != null && (
                                <text x={lp[0]} y={lp[1]} textAnchor="middle" dominantBaseline="middle" fontSize={labelSize(width)} fontWeight="700"
                                    className="pointer-events-none select-none" fill={norm(v) > 0.5 ? '#ffffff' : '#0F172A'}>
                                    {(labelFormat ?? format)(v)}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
            {/* Dymek przy krawędzi wyrównany do niej — wyśrodkowany przy prawym brzegu wychodził poza
                kartę i poszerzał stronę na telefonie. */}
            {hov && (
                <div
                    className="pointer-events-none absolute z-50"
                    style={{
                        left: pos.x,
                        top: pos.y,
                        transform: `translate(${width && pos.x > width * 0.7 ? '-100%' : width && pos.x < width * 0.3 ? '0%' : '-50%'},-115%)`,
                    }}
                >
                    <div className="whitespace-nowrap rounded-lg border border-mk-border bg-mk-surface px-3 py-2 shadow-xl">
                        <div className="text-sm font-semibold text-mk-text">{hov.name}</div>
                        <div className="text-xs text-mk-muted">{hov.value != null ? `${format(hov.value)}${unit ?? ''}` : '—'}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
