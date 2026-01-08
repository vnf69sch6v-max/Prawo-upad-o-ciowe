'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface PerformanceChartProps {
    data: { date: string; value: number }[];
    target?: number;
}

export function PerformanceChart({ data, target = 15000 }: PerformanceChartProps) {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const filteredData =
        timeRange === '7d' ? data.slice(-7) : timeRange === '30d' ? data.slice(-30) : data;

    const max = Math.max(...filteredData.map((d) => d.value), target);
    const min = Math.min(...filteredData.map((d) => d.value));
    const range = max - min || 1;

    const peakValue = Math.max(...filteredData.map((d) => d.value));
    const avgGrowth =
        filteredData.length > 1
            ? Math.round(
                (filteredData[filteredData.length - 1].value - filteredData[0].value) /
                filteredData.length
            )
            : 0;
    const periodChange =
        filteredData.length > 1
            ? (
                ((filteredData[filteredData.length - 1].value - filteredData[0].value) /
                    filteredData[0].value) *
                100
            ).toFixed(1)
            : '0';

    return (
        <div className="lex-card space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span className="text-sm font-semibold">Performance Trend</span>
                </div>
                <div className="flex gap-1 bg-[var(--bg-hover)] rounded-lg p-1">
                    {(['7d', '30d', 'all'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={cn(
                                'px-3 py-1 text-xs font-medium rounded transition-all',
                                timeRange === r
                                    ? 'bg-purple-600 text-white'
                                    : 'text-[var(--text-muted)] hover:text-white'
                            )}
                        >
                            {r === 'all' ? 'All' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-52">
                {/* Target Line */}
                {target && (
                    <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500/50 z-10"
                        style={{ bottom: `${((target - min) / range) * 100}%` }}
                    >
                        <span className="absolute right-0 -top-5 text-xs text-yellow-500 bg-[var(--bg-card)] px-2 rounded">
                            Target €{(target / 1000).toFixed(1)}k
                        </span>
                    </div>
                )}

                {/* Bars */}
                <div className="h-full flex items-end gap-1">
                    {filteredData.map((point, i) => {
                        const height = ((point.value - min) / range) * 100;
                        const isHovered = hoveredIndex === i;
                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-1 relative"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2 shadow-lg z-20 whitespace-nowrap animate-fade-in">
                                        <p className="text-xs text-[var(--text-muted)]">{point.date}</p>
                                        <p className="text-sm font-bold">€{point.value.toLocaleString()}</p>
                                    </div>
                                )}

                                {/* Bar */}
                                <div
                                    className={cn(
                                        'w-full rounded-t transition-all duration-200 cursor-pointer',
                                        isHovered
                                            ? 'bg-gradient-to-t from-purple-500 to-purple-300 shadow-lg shadow-purple-500/30'
                                            : 'bg-gradient-to-t from-purple-600/80 to-purple-400/60'
                                    )}
                                    style={{ height: `${Math.max(height, 3)}%` }}
                                />

                                {/* X-axis label */}
                                {i % 2 === 0 && (
                                    <span className="text-[10px] text-[var(--text-muted)] absolute -bottom-4">
                                        {point.date.slice(-2)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-color)]">
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Peak Value</p>
                    <p className="text-sm font-semibold text-purple-400">€{peakValue.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Avg. Daily</p>
                    <p
                        className={cn(
                            'text-sm font-semibold',
                            avgGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                        )}
                    >
                        {avgGrowth >= 0 ? '+' : ''}€{avgGrowth}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-[var(--text-muted)]">Period Change</p>
                    <p
                        className={cn(
                            'text-sm font-semibold',
                            Number(periodChange) >= 0 ? 'text-green-400' : 'text-red-400'
                        )}
                    >
                        {Number(periodChange) >= 0 ? '+' : ''}{periodChange}%
                    </p>
                </div>
            </div>
        </div>
    );
}
