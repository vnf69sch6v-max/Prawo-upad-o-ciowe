'use client';

import { useState, useMemo, useCallback } from 'react';

// ===== Range Filter Buttons =====

type RangeKey = '3M' | '6M' | '1Y' | 'ALL';

interface RangeButtonsProps {
    active: RangeKey;
    onChange: (range: RangeKey) => void;
}

export function RangeButtons({ active, onChange }: RangeButtonsProps) {
    const ranges: RangeKey[] = ['3M', '6M', '1Y', 'ALL'];
    return (
        <div className="flex gap-1">
            {ranges.map((r) => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase border transition-all duration-100 ${active === r
                            ? 'bg-bb-accent text-black border-bb-accent'
                            : 'bg-transparent text-bb-muted border-bb-border hover:border-bb-accent hover:text-bb-text'
                        }`}
                    style={{ borderRadius: '2px' }}
                >
                    {r}
                </button>
            ))}
        </div>
    );
}

// ===== Custom Bloomberg Tooltip =====

interface TooltipPayloadItem {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    formatter?: (value: number, name: string) => string;
    unit?: string;
}

export function BloombergTooltip({ active, payload, label, formatter, unit = '' }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div
            style={{
                background: '#0A0A0A',
                border: '1px solid #2D333B',
                borderRadius: '2px',
                padding: '6px 10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#E6EDF3',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{ color: '#7D8590', fontSize: '9px', marginBottom: '3px', textTransform: 'uppercase' }}>
                {label}
            </div>
            {payload.map((p, i) => {
                const displayValue = formatter
                    ? formatter(p.value ?? 0, p.name ?? '')
                    : `${p.value}${unit}`;
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '1px',
                                background: p.color || '#FF6B00',
                                display: 'inline-block',
                            }}
                        />
                        <span style={{ color: '#7D8590', fontSize: '10px' }}>{p.name || p.dataKey}</span>
                        <span style={{ color: '#E6EDF3', fontWeight: 600 }}>{displayValue}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ===== Bloomberg Crosshair Cursor =====

interface CursorProps {
    x?: number;
    y?: number;
    height?: number;
}

export function BloombergCursor({ x, height }: CursorProps) {
    if (x === undefined) return null;
    return (
        <line
            x1={x}
            x2={x}
            y1={0}
            y2={height || 300}
            stroke="#FF6B00"
            strokeWidth={0.5}
            strokeDasharray="3 3"
            strokeOpacity={0.6}
        />
    );
}

// ===== useRangeFilter Hook =====

interface MonthDataItem {
    month?: string;
    quarter?: string;
    [key: string]: unknown;
}

export function useRangeFilter<T extends MonthDataItem>(data: T[], initialRange: RangeKey = 'ALL') {
    const [range, setRange] = useState<RangeKey>(initialRange);

    const filteredData = useMemo(() => {
        if (range === 'ALL') return data;
        const months = range === '3M' ? 3 : range === '6M' ? 6 : 12;
        return data.slice(-months);
    }, [data, range]);

    return { range, setRange, filteredData };
}

// ===== useIsMobile Hook =====

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    // Use effect only on client
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useState(() => {
            const check = () => setIsMobile(window.innerWidth < 768);
            check();
            window.addEventListener('resize', check);
            return () => window.removeEventListener('resize', check);
        });
    }

    return isMobile;
}

// ===== Chart Animation Constants =====

export const CHART_ANIM = {
    duration: 800,
    easing: 'ease-out' as const,
};

// ===== Shared Tooltip Style =====

export const BB_TOOLTIP_STYLE = {
    contentStyle: {
        background: '#0D1117',
        border: '1px solid #2D333B',
        borderRadius: '2px',
        color: '#E6EDF3',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
    },
};

// ===== Active Bar Highlight =====

interface ActiveBarProps {
    activeIndex: number | null;
    setActiveIndex: (i: number | null) => void;
}

export function useActiveBar(): ActiveBarProps {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    return { activeIndex, setActiveIndex };
}

// Custom bar shape with click highlighting
export function HighlightBar(props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    index?: number;
    activeIndex?: number | null;
    onClick?: (index: number) => void;
}) {
    const { x = 0, y = 0, width = 0, height = 0, fill, index = 0, activeIndex, onClick } = props;
    const isActive = activeIndex === index;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={Math.max(0, height)}
                fill={fill}
                opacity={activeIndex !== null && !isActive ? 0.4 : 1}
                style={{ cursor: 'pointer', transition: 'opacity 150ms' }}
                onClick={() => onClick?.(index)}
                rx={2}
                ry={2}
            />
            {isActive && (
                <rect
                    x={x - 1}
                    y={y - 1}
                    width={width + 2}
                    height={Math.max(0, height + 2)}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth={1.5}
                    rx={2}
                    ry={2}
                />
            )}
        </g>
    );
}

// ===== Interactive Chart Panel =====

interface ChartPanelProps {
    title: string;
    source?: string;
    date?: string;
    children: React.ReactNode;
    rangeButtons?: React.ReactNode;
}

export function ChartPanel({ title, source, date, children, rangeButtons }: ChartPanelProps) {
    return (
        <div className="bb-panel">
            <div className="flex items-center justify-between mb-2">
                <div className="bb-panel-header" style={{ marginBottom: 0 }}>{title}</div>
                {rangeButtons}
            </div>
            {children}
            {(source || date) && (
                <div className="flex justify-between mt-2 pt-1 border-t border-bb-border/40">
                    {source && <span className="text-[9px] text-bb-muted uppercase">{source}</span>}
                    {date && <span className="text-[9px] text-bb-muted">{date}</span>}
                </div>
            )}
        </div>
    );
}
