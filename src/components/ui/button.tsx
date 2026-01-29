import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading,
        leftIcon,
        rightIcon,
        fullWidth,
        children,
        disabled,
        ...props
    }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                    // Variants
                    {
                        // Primary - Gold accent
                        'bg-[var(--accent-gold)] hover:bg-[#e6c200] text-[#1a1a1a] font-semibold focus-visible:ring-[var(--accent-gold)] shadow-sm hover:shadow-md active:scale-[0.98]': variant === 'primary',

                        // Secondary - Subtle
                        'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-gold)]/50 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] focus-visible:ring-[var(--accent-gold)]': variant === 'secondary',

                        // Ghost - Minimal
                        'hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--accent-gold)]': variant === 'ghost',

                        // Danger - Red
                        'bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500 shadow-sm hover:shadow-md active:scale-[0.98]': variant === 'danger',

                        // Success - Green
                        'bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-emerald-500 shadow-sm hover:shadow-md active:scale-[0.98]': variant === 'success',

                        // Premium - Gradient
                        'bg-gradient-to-r from-[var(--accent-gold)] to-amber-500 hover:from-amber-400 hover:to-[var(--accent-gold)] text-[#1a1a1a] font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98]': variant === 'premium',

                        // Outline - Bordered
                        'border-2 border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 focus-visible:ring-[var(--accent-gold)]': variant === 'outline',
                    },
                    // Sizes
                    {
                        'h-8 px-3 text-xs': size === 'sm',
                        'h-10 px-4 text-sm': size === 'md',
                        'h-12 px-6 text-base': size === 'lg',
                        'h-14 px-8 text-lg': size === 'xl',
                    },
                    // Full width
                    fullWidth && 'w-full',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

// Icon Button variant
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({
        className,
        variant = 'default',
        size = 'md',
        isLoading,
        children,
        disabled,
        ...props
    }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] focus-visible:ring-[var(--accent-gold)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    // Variants
                    {
                        'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-gold)]/50 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]': variant === 'default',
                        'hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]': variant === 'ghost',
                        'hover:bg-red-500/10 text-red-400 hover:text-red-300': variant === 'danger',
                    },
                    // Sizes
                    {
                        'w-8 h-8': size === 'sm',
                        'w-10 h-10': size === 'md',
                        'w-12 h-12': size === 'lg',
                    },
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';
