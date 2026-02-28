'use client';

import { SparklineChart } from './SparklineChart';
import { ChangeIndicator } from './ChangeIndicator';

interface DataCardProps {
    title: string;
    value: string;
    change?: number;
    sparklineData?: number[];
    source?: string;
    lastUpdated?: string;
    icon?: React.ReactNode;
    accentColor?: string;
}

export function DataCard({
    title,
    value,
    change,
    sparklineData,
    source,
    lastUpdated,
    accentColor,
}: DataCardProps) {
    return (
        <div className="data-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <h3 className="bb-label">{title}</h3>
            </div>

            {/* Value */}
            <div className="flex items-end gap-2 mb-1">
                <span
                    className="text-lg font-mono font-bold leading-none"
                    style={{ color: accentColor || 'var(--color-bb-text)' }}
                >
                    {value}
                </span>
                {change !== undefined && <ChangeIndicator value={change} />}
            </div>

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 1 && (
                <div className="mb-1">
                    <SparklineChart data={sparklineData} height={24} />
                </div>
            )}

            {/* Footer */}
            {(source || lastUpdated) && (
                <div className="flex items-center justify-between pt-1 border-t border-bb-border/40">
                    {source && (
                        <span className="text-[9px] text-bb-muted uppercase tracking-wider">
                            {source}
                        </span>
                    )}
                    {lastUpdated && (
                        <span className="text-[9px] text-bb-muted">
                            {lastUpdated}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
