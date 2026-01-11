import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, type = 'text', ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        ref={ref}
                        className={cn(
                            'w-full h-10 px-4 bg-[var(--bg-card)] border rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                            'focus:outline-none focus:ring-2 focus:ring-#1a365d focus:border-transparent',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-red-500' : 'border-[var(--border-color)]',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-[var(--text-muted)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
