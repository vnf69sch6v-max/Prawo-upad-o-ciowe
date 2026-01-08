'use client';

import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    prefix?: string;
    suffix?: string;
}

export function StatCard({
    label,
    value,
    change,
    icon,
    trend = 'neutral',
    prefix = '',
    suffix = '',
}: StatCardProps) {
    return (
        <div className="lex-card animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                {change !== undefined && (
                    <div
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                            trend === 'up' && 'bg-green-500/10 text-green-400',
                            trend === 'down' && 'bg-red-500/10 text-red-400',
                            trend === 'neutral' && 'bg-gray-500/10 text-gray-400'
                        )}
                    >
                        {trend === 'up' && <TrendingUp size={12} />}
                        {trend === 'down' && <TrendingDown size={12} />}
                        {trend === 'neutral' && <Minus size={12} />}
                        <span>{change > 0 ? '+' : ''}{change}%</span>
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold mb-1">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
        </div>
    );
}
