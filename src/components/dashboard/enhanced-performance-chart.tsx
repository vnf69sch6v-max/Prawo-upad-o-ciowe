'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, ChevronDown } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface PerformanceDataPoint {
    date: string;
    knowledgeEquity: number;
    cardsReviewed: number;
    accuracy: number;
    timeSpent: number; // minutes
}

export interface EnhancedPerformanceChartProps {
    data: PerformanceDataPoint[];
    timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
    onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
    target?: number;
}

type MetricKey = 'knowledgeEquity' | 'cardsReviewed' | 'accuracy';

interface TooltipData {
    x: number;
    y: number;
    visible: boolean;
    data: PerformanceDataPoint | null;
}

// ============================================
// CONSTANTS
// ============================================

const TIME_RANGES = [
    { value: '7d', label: '7 dni' },
    { value: '30d', label: '30 dni' },
    { value: '90d', label: '90 dni' },
    { value: '1y', label: '1 rok' },
    { value: 'all', label: 'Wszystko' },
] as const;

const METRICS: { key: MetricKey; label: string; color: string; format: (v: number) => string }[] = [
    { key: 'knowledgeEquity', label: 'Knowledge Equity', color: '#8b5cf6', format: (v) => `{(v / 1000).toFixed(1)}k` },
    { key: 'cardsReviewed', label: 'Karty', color: '#10b981', format: (v) => v.toString() },
    { key: 'accuracy', label: 'Dokładność', color: '#f59e0b', format: (v) => `${v}%` },
];

// ============================================
// CHART COMPONENT
// ============================================

export function EnhancedPerformanceChart({
    data,
    timeRange,
    onTimeRangeChange,
    target,
}: EnhancedPerformanceChartProps) {
    const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(new Set(['knowledgeEquity']));
    const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, visible: false, data: null });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Chart dimensions
    const chartHeight = 280;
    const chartPadding = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

    // Calculate stats
    const stats = useMemo(() => {
        if (data.length === 0) return { peak: 0, avgDaily: 0, change: 0, bestDay: '' };

        const values = data.map(d => d.knowledgeEquity);
        const peak = Math.max(...values);
        const first = values[0];
        const last = values[values.length - 1];
        const avgDaily = (last - first) / data.length;
        const change = first > 0 ? ((last - first) / first * 100) : 0;
        const bestDayIndex = values.indexOf(Math.max(...values.map((v, i, arr) => i > 0 ? v - arr[i - 1] : 0)));
        const bestDay = data[bestDayIndex]?.date || '';

        return { peak, avgDaily, change, bestDay };
    }, [data]);

    // Generate SVG paths
    const generatePath = (metric: MetricKey) => {
        if (data.length < 2) return '';

        const values = data.map(d => d[metric]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const points = data.map((_, i) => {
            const x = chartPadding.left + (i / (data.length - 1)) * (100 - chartPadding.left - chartPadding.right);
            const y = chartPadding.top + innerHeight - ((values[i] - min) / range) * innerHeight;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    // Generate area path (for gradient fill)
    const generateAreaPath = (metric: MetricKey) => {
        if (data.length < 2) return '';

        const values = data.map(d => d[metric]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const startX = chartPadding.left;
        const endX = 100 - chartPadding.right;
        const bottomY = chartPadding.top + innerHeight;

        const points = data.map((_, i) => {
            const x = chartPadding.left + (i / (data.length - 1)) * (endX - startX);
            const y = chartPadding.top + innerHeight - ((values[i] - min) / range) * innerHeight;
            return `${x},${y}`;
        });

        return `M ${startX},${bottomY} L ${points.join(' L ')} L ${endX},${bottomY} Z`;
    };

    // Y-axis labels
    const yAxisLabels = useMemo(() => {
        const primaryMetric = Array.from(activeMetrics)[0] || 'knowledgeEquity';
        const values = data.map(d => d[primaryMetric]);
        const min = Math.min(...values);
        const max = Math.max(...values);

        return [max, (max + min) / 2, min].map(v => {
            if (primaryMetric === 'knowledgeEquity') return `{(v / 1000).toFixed(1)}k`;
            if (primaryMetric === 'accuracy') return `${v.toFixed(0)}%`;
            return v.toFixed(0);
        });
    }, [data, activeMetrics]);

    // X-axis labels
    const xAxisLabels = useMemo(() => {
        if (data.length === 0) return [];
        const step = Math.max(1, Math.floor(data.length / 6));
        return data.filter((_, i) => i % step === 0 || i === data.length - 1).map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
        });
    }, [data]);

    const toggleMetric = (metric: MetricKey) => {
        const newSet = new Set(activeMetrics);
        if (newSet.has(metric)) {
            if (newSet.size > 1) newSet.delete(metric);
        } else {
            newSet.add(metric);
        }
        setActiveMetrics(newSet);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;

        // Find closest data point
        const chartWidth = 100 - chartPadding.left - chartPadding.right;
        const relativeX = (x - chartPadding.left) / chartWidth;
        const index = Math.round(relativeX * (data.length - 1));

        if (index >= 0 && index < data.length) {
            setHoveredIndex(index);
            setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                visible: true,
                data: data[index],
            });
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    return (
        <div className="lex-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="text-[#1a365d]" />
                        Progres nauki
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">Twoje statystyki w czasie</p>
                </div>

                {/* Time range selector */}
                <div className="flex gap-1 p-1 bg-[var(--bg-hover)] rounded-xl">
                    {TIME_RANGES.map(range => (
                        <button
                            key={range.value}
                            onClick={() => onTimeRangeChange(range.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                timeRange === range.value
                                    ? 'bg-[#1a365d] text-white'
                                    : 'text-[var(--text-muted)] hover:text-white'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric toggles */}
            <div className="flex gap-3 mb-4">
                {METRICS.map(metric => (
                    <button
                        key={metric.key}
                        onClick={() => toggleMetric(metric.key)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border',
                            activeMetrics.has(metric.key)
                                ? 'border-transparent'
                                : 'border-[var(--border-color)] opacity-50'
                        )}
                        style={{
                            background: activeMetrics.has(metric.key) ? `${metric.color}20` : 'transparent',
                        }}
                    >
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: metric.color }}
                        />
                        {metric.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: chartHeight }}>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        {METRICS.map(metric => (
                            <linearGradient
                                key={metric.key}
                                id={`gradient-${metric.key}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor={metric.color} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(pct => (
                        <line
                            key={pct}
                            x1={chartPadding.left}
                            x2={100 - chartPadding.right}
                            y1={chartPadding.top + (pct / 100) * innerHeight}
                            y2={chartPadding.top + (pct / 100) * innerHeight}
                            stroke="rgba(255,255,255,0.05)"
                            strokeDasharray="2,2"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}

                    {/* Target line */}
                    {target && (
                        <line
                            x1={chartPadding.left}
                            x2={100 - chartPadding.right}
                            y1={chartPadding.top + innerHeight * 0.3}
                            y2={chartPadding.top + innerHeight * 0.3}
                            stroke="#10b981"
                            strokeDasharray="4,4"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Area fills */}
                    {METRICS.filter(m => activeMetrics.has(m.key)).map(metric => (
                        <path
                            key={`area-${metric.key}`}
                            d={generateAreaPath(metric.key)}
                            fill={`url(#gradient-${metric.key})`}
                            className="transition-all duration-500"
                        />
                    ))}

                    {/* Lines */}
                    {METRICS.filter(m => activeMetrics.has(m.key)).map(metric => (
                        <path
                            key={`line-${metric.key}`}
                            d={generatePath(metric.key)}
                            fill="none"
                            stroke={metric.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            className="transition-all duration-500"
                            style={{
                                strokeDasharray: '1000',
                                strokeDashoffset: '0',
                                animation: 'draw 1.5s ease-out forwards',
                            }}
                        />
                    ))}

                    {/* Data points on hover */}
                    {hoveredIndex !== null && METRICS.filter(m => activeMetrics.has(m.key)).map(metric => {
                        const values = data.map(d => d[metric.key]);
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        const range = max - min || 1;
                        const chartWidth = 100 - chartPadding.left - chartPadding.right;

                        const x = chartPadding.left + (hoveredIndex / (data.length - 1)) * chartWidth;
                        const y = chartPadding.top + innerHeight - ((values[hoveredIndex] - min) / range) * innerHeight;

                        return (
                            <circle
                                key={`point-${metric.key}`}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill={metric.color}
                                stroke="white"
                                strokeWidth="0.5"
                                className="transition-all duration-200"
                            />
                        );
                    })}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-[var(--text-muted)]">
                    {yAxisLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>

                {/* Tooltip */}
                {tooltip.visible && tooltip.data && (
                    <div
                        className="absolute z-20 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-lg pointer-events-none"
                        style={{
                            left: Math.min(tooltip.x, 300),
                            top: Math.max(tooltip.y - 100, 10),
                        }}
                    >
                        <p className="text-sm font-semibold mb-2">
                            {new Date(tooltip.data.date).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                        {METRICS.filter(m => activeMetrics.has(m.key)).map(metric => (
                            <div key={metric.key} className="flex items-center justify-between gap-4 text-sm">
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: metric.color }}
                                    />
                                    {metric.label}
                                </span>
                                <span className="font-semibold">{metric.format(tooltip.data![metric.key])}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2 px-14">
                {xAxisLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                ))}
            </div>

            {/* Footer stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Szczyt</p>
                    <p className="font-semibold">pkt {(stats.peak / 1000).toFixed(1)}k</p>
                </div>
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Śr. dzienny wzrost</p>
                    <p className="font-semibold text-green-400">+pkt {stats.avgDaily.toFixed(0)}</p>
                </div>
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Zmiana w okresie</p>
                    <p className={cn('font-semibold', stats.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
                    </p>
                </div>
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Najlepszy dzień</p>
                    <p className="font-semibold">{stats.bestDay ? new Date(stats.bestDay).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) : '-'}</p>
                </div>
            </div>
        </div>
    );
}
