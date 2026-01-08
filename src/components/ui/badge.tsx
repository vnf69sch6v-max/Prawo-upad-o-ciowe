import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium' | 'pro' | 'new';
    size?: 'sm' | 'md';
}

export function Badge({
    className,
    variant = 'default',
    size = 'md',
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-semibold rounded-full',
                {
                    // Sizes
                    'px-2 py-0.5 text-xs': size === 'sm',
                    'px-2.5 py-1 text-xs': size === 'md',
                    // Variants
                    'bg-[var(--bg-hover)] text-[var(--text-primary)]': variant === 'default',
                    'bg-green-500/20 text-green-400': variant === 'success',
                    'bg-yellow-500/20 text-yellow-400': variant === 'warning',
                    'bg-red-500/20 text-red-400': variant === 'danger',
                    'bg-blue-500/20 text-blue-400': variant === 'info',
                    'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white': variant === 'premium',
                    'bg-purple-600 text-white': variant === 'pro',
                    'bg-green-600 text-white': variant === 'new',
                },
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
