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

    const doubled = [...items, ...items];

    return (
        <div className="h-6 bg-bb-bg border-b border-bb-border overflow-hidden relative">
            <div className="ticker-animate flex items-center h-full whitespace-nowrap">
                {doubled.map((item, i) => (
                    <div key={i} className="flex items-center gap-1 px-3 h-full">
                        <span className="text-[10px] text-bb-muted font-semibold">{item.label}</span>
                        <span className="text-[10px] font-mono text-bb-text font-bold">
                            {item.prefix || ''}
                            {typeof item.value === 'number'
                                ? formatRate(item.value, item.decimals ?? 2)
                                : item.value
                            }
                            {item.suffix || ''}
                        </span>
                        {item.change !== undefined && (
                            <span className={`text-[10px] font-mono font-semibold ${getChangeColor(item.change)}`}>
                                {formatPercent(item.change)}
                            </span>
                        )}
                        <span className="text-bb-border ml-2">│</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
