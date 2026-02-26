'use client';

import { formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';

interface ChangeIndicatorProps {
    value: number;
    className?: string;
}

export function ChangeIndicator({ value, className = '' }: ChangeIndicatorProps) {
    return (
        <span className={`font-mono text-sm font-medium ${getChangeColor(value)} ${className}`}>
            {getChangeArrow(value)} {formatPercent(value)}
        </span>
    );
}
