'use client';

import { formatRate, formatPercent, getChangeColor } from '@/lib/formatters';

export interface TickerItem {
    label: string;
    value: number | string;
    change?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export function TickerBar({ items }: { items: TickerItem[] }) {
    if (!items.length) return null;

    // Duplicate items for seamless infinite scroll
    const doubled = [...items, ...items];

    return (
        <div className="h-8 bg-bb-surface border-b border-bb-border overflow-hidden relative">
            <div className="ticker-animate flex items-center h-full whitespace-nowrap">
                {doubled.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-4 h-full border-r border-bb-border/50">
                        <span className="text-xs text-bb-muted font-medium">{item.label}</span>
                        <span className="text-xs font-mono text-bb-text font-semibold">
                            {item.prefix || ''}
                            {typeof item.value === 'number'
                                ? formatRate(item.value, item.decimals ?? 2)
                                : item.value
                            }
                            {item.suffix || ''}
                        </span>
                        {item.change !== undefined && (
                            <span className={`text-xs font-mono font-medium ${getChangeColor(item.change)}`}>
                                {formatPercent(item.change)}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
