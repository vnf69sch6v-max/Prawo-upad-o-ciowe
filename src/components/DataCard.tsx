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
    icon,
    accentColor,
}: DataCardProps) {
    return (
        <div className="data-card group">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-bb-muted">{icon}</span>}
                    <h3 className="text-xs font-medium text-bb-muted uppercase tracking-wide">
                        {title}
                    </h3>
                </div>
                <span className="live-dot" />
            </div>

            {/* Value */}
            <div className="flex items-end gap-3 mb-2">
                <span
                    className="text-2xl font-mono font-bold text-bb-text leading-none"
                    style={accentColor ? { color: accentColor } : undefined}
                >
                    {value}
                </span>
                {change !== undefined && <ChangeIndicator value={change} />}
            </div>

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 1 && (
                <div className="mb-2">
                    <SparklineChart data={sparklineData} />
                </div>
            )}

            {/* Footer */}
            {(source || lastUpdated) && (
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-bb-border/50">
                    {source && (
                        <span className="text-[10px] text-bb-muted uppercase tracking-wider">
                            {source}
                        </span>
                    )}
                    {lastUpdated && (
                        <span className="text-[10px] text-bb-muted">
                            {lastUpdated}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
