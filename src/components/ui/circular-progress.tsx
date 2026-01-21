import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
    showValue?: boolean;
    children?: ReactNode;
    className?: string;
}

export function CircularProgress({
    value = 0,
    size = 120,
    strokeWidth = 8,
    color = 'primary',
    showValue = true,
    children,
    className
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min(100, Math.max(0, value));
    const offset = circumference - (percent / 100) * circumference;

    // Auto color based on value
    const getAutoColor = () => {
        if (percent >= 80) return 'text-green-500';
        if (percent >= 60) return 'text-yellow-500';
        if (percent >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const colors = {
        primary: 'text-[#1a365d]',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500',
        auto: getAutoColor(),
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-[var(--bg-hover)]"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className={cn('transition-all duration-700 ease-out', colors[color])}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children || (showValue && <span className="text-2xl font-bold">{Math.round(percent)}%</span>)}
            </div>
        </div>
    );
}
