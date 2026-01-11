import { cn } from '@/lib/utils/cn';

interface ProgressProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'success' | 'warning' | 'danger';
    animated?: boolean;
}

export function Progress({
    value,
    max = 100,
    label,
    showValue = false,
    size = 'md',
    color = 'default',
    animated = false,
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className="space-y-2">
            {(label || showValue) && (
                <div className="flex justify-between text-sm">
                    {label && (
                        <span className="text-[var(--text-muted)]">{label}</span>
                    )}
                    {showValue && (
                        <span className="font-medium">{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            <div className={cn(
                'w-full bg-[var(--bg-hover)] rounded-full overflow-hidden',
                {
                    'h-1': size === 'sm',
                    'h-2': size === 'md',
                    'h-3': size === 'lg',
                }
            )}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        {
                            'bg-gradient-to-r from-#1a365d to-#1a365d': color === 'default',
                            'bg-gradient-to-r from-green-600 to-green-400': color === 'success',
                            'bg-gradient-to-r from-yellow-600 to-yellow-400': color === 'warning',
                            'bg-gradient-to-r from-red-600 to-red-400': color === 'danger',
                        },
                        animated && 'animate-pulse'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
