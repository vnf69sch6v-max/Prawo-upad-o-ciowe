'use client';

import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'subtle' | 'frosted' | 'iridescent';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Glass Card Component - Premium Liquid Glass Effect
 * 
 * Variants:
 * - default: White glass with subtle transparency
 * - subtle: More transparent, blends with background
 * - frosted: More blur, icier feel
 * - iridescent: Rainbow border shimmer effect
 */
export function GlassCard({
    children,
    className,
    variant = 'default',
    hover = true,
    padding = 'md'
}: GlassCardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6'
    };

    const baseStyles = cn(
        'rounded-2xl overflow-hidden',
        'transition-all duration-300 ease-out',
        paddingClasses[padding]
    );

    const variantStyles = {
        default: cn(
            'bg-white/70 backdrop-blur-xl',
            'border border-white/50',
            'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
            hover && 'hover:bg-white/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5'
        ),
        subtle: cn(
            'bg-white/40 backdrop-blur-lg',
            'border border-white/30',
            'shadow-[0_4px_24px_rgba(0,0,0,0.05)]',
            hover && 'hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
        ),
        frosted: cn(
            'bg-white/50 backdrop-blur-2xl',
            'border border-white/60',
            'shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]',
            hover && 'hover:bg-white/70 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]'
        ),
        iridescent: cn(
            'bg-white/60 backdrop-blur-xl',
            'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
            hover && 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5'
        )
    };

    if (variant === 'iridescent') {
        return (
            <div
                className={cn(baseStyles, 'relative p-[1px]', className)}
                style={{
                    background: 'linear-gradient(135deg, rgba(249,168,212,0.5), rgba(167,139,250,0.5), rgba(147,197,253,0.5), rgba(167,139,250,0.5), rgba(249,168,212,0.5))',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 3s ease-in-out infinite'
                }}
            >
                <div className={cn(
                    'bg-white/80 backdrop-blur-xl rounded-[15px]',
                    paddingClasses[padding],
                    'transition-all duration-300',
                    hover && 'hover:bg-white/90'
                )}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(baseStyles, variantStyles[variant], className)}>
            {children}
        </div>
    );
}

/**
 * Glass Panel - For larger sections with more prominence
 */
export function GlassPanel({
    children,
    className,
    title,
    subtitle,
    icon
}: {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    icon?: ReactNode;
}) {
    return (
        <div className={cn(
            'rounded-3xl overflow-hidden',
            'bg-white/60 backdrop-blur-xl',
            'border border-white/40',
            'shadow-[0_12px_48px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]',
            'transition-all duration-300',
            className
        )}>
            {(title || subtitle || icon) && (
                <div className="flex items-center gap-3 p-5 border-b border-gray-100/50">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            {icon}
                        </div>
                    )}
                    <div>
                        {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>
            )}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

/**
 * Stat Card - For displaying metrics with glass effect
 */
export function GlassStatCard({
    label,
    value,
    icon,
    trend,
    trendValue,
    color = 'purple'
}: {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
}) {
    const colorStyles = {
        purple: 'from-purple-500/20 to-purple-600/10 text-purple-600',
        blue: 'from-blue-500/20 to-blue-600/10 text-blue-600',
        green: 'from-green-500/20 to-green-600/10 text-green-600',
        orange: 'from-orange-500/20 to-orange-600/10 text-orange-600',
        pink: 'from-pink-500/20 to-pink-600/10 text-pink-600'
    };

    const trendStyles = {
        up: 'text-green-500',
        down: 'text-red-500',
        neutral: 'text-gray-400'
    };

    return (
        <GlassCard variant="default" className="min-w-[140px]">
            <div className="flex items-start justify-between mb-2">
                {icon && (
                    <div className={cn(
                        'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center',
                        colorStyles[color]
                    )}>
                        {icon}
                    </div>
                )}
                {trend && trendValue && (
                    <span className={cn('text-xs font-medium', trendStyles[trend])}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
        </GlassCard>
    );
}
