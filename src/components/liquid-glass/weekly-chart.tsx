'use client';

/**
 * Weekly Trend Chart
 * Liquid glass card with gradient line chart
 */

import { cn } from '@/lib/utils/cn';

interface WeeklyChartProps {
    data: number[];
    className?: string;
}

export function WeeklyChart({ data, className }: WeeklyChartProps) {
    const days = ['Pon', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    const maxValue = Math.max(...data, 1);

    // Calculate comparison to last week
    const currentWeekAvg = data.reduce((a, b) => a + b, 0) / data.length;
    const comparison = Math.round((currentWeekAvg / 10) * 100 - 100);

    // Generate SVG path
    const generatePath = () => {
        const width = 280;
        const height = 80;
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - (value / maxValue) * chartHeight;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    return (
        <div
            className={cn(
                'relative mt-6 px-6 py-5 rounded-2xl',
                className
            )}
            style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `
                    0 4px 24px rgba(0, 0, 0, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
            }}
        >
            {/* Iridescent border */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.4), rgba(147, 197, 253, 0.3), rgba(249, 168, 212, 0.3))',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1.5px'
                }}
            />

            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Tygodniowy trend nauki</h3>
            </div>

            {/* Chart */}
            <svg viewBox="0 0 280 80" className="w-full h-24">
                <defs>
                    {/* Gradient fill under line */}
                    <linearGradient id="chart-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0.1" />
                    </linearGradient>
                    {/* Gradient for line */}
                    <linearGradient id="chart-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A78BFA" />
                        <stop offset="50%" stopColor="#F9A8D4" />
                        <stop offset="100%" stopColor="#93C5FD" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={`${generatePath()} L 270,70 L 10,70 Z`}
                    fill="url(#chart-fill-gradient)"
                />

                {/* Line */}
                <path
                    d={generatePath()}
                    fill="none"
                    stroke="url(#chart-line-gradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points with glow */}
                {data.map((value, index) => {
                    const x = 10 + (index / (data.length - 1)) * 260;
                    const y = 70 - (value / maxValue) * 60;
                    return (
                        <g key={index}>
                            {/* Glow */}
                            <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="rgba(167, 139, 250, 0.2)"
                            />
                            {/* Point */}
                            <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="white"
                                stroke="#A78BFA"
                                strokeWidth="2"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Day labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                {days.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            {/* Comparison text */}
            <p className="text-xs text-gray-500 mt-3 text-center">
                O {Math.abs(comparison)}% {comparison >= 0 ? 'więcej' : 'mniej'} niż w zeszłym tygodniu.
            </p>
        </div>
    );
}
