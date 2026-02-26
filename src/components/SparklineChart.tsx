'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
}

export function SparklineChart({ data, color, height = 40 }: SparklineProps) {
    if (!data || data.length < 2) return null;

    const isPositive = data[data.length - 1] >= data[0];
    const lineColor = color || (isPositive ? '#22C55E' : '#EF4444');
    const chartData = data.map((value, i) => ({ i, value }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                <defs>
                    <linearGradient id={`grad-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    fill={`url(#grad-${lineColor})`}
                    dot={false}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
