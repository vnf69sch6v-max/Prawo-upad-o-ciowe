import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass' | 'interactive' | 'highlight' | 'clean';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export function Card({
    className,
    variant = 'default',
    padding = 'md',
    glow = false,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border transition-all duration-200',
                // Variants
                {
                    'bg-[var(--bg-card)] border-[var(--border-color)]': variant === 'default',
                    'bg-[var(--bg-elevated)] border-[var(--border-color)] shadow-lg': variant === 'elevated',
                    'bg-[var(--bg-elevated)]/50 backdrop-blur-xl border-[var(--border-color)]': variant === 'glass',
                    'bg-[var(--bg-card)] border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-gold)] hover:bg-[rgba(255,214,0,0.02)] hover:-translate-y-0.5 hover:shadow-lg': variant === 'interactive',
                    'bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] border-[var(--glass-border-strong)] relative overflow-hidden': variant === 'highlight',
                    'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[rgba(255,255,255,0.18)] hover:shadow-md': variant === 'clean',
                },
                // Padding
                {
                    'p-0': padding === 'none',
                    'p-4': padding === 'sm',
                    'p-6': padding === 'md',
                    'p-8': padding === 'lg',
                },
                // Glow effect
                glow && 'hover:border-[var(--accent-gold)]/30 hover:shadow-[0_0_30px_rgba(255,214,0,0.1)]',
                className
            )}
            {...props}
        >
            {variant === 'highlight' && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent-gold)] via-[var(--neon-cywilne)] to-[var(--accent-gold)]" />
            )}
            {children}
        </div>
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-[var(--text-muted)] mt-1', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('pt-4 mt-4 border-t border-[var(--border-color)]', className)} {...props} />;
}

// New: Stat Card Component
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode;
    label: string;
    value: string | number;
    suffix?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export function StatCard({
    icon,
    label,
    value,
    suffix = '',
    trend,
    trendValue,
    className,
    ...props
}: StatCardProps) {
    return (
        <div
            className={cn(
                'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.18)]',
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between mb-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center text-lg">
                        {icon}
                    </div>
                )}
                {trend && trendValue && (
                    <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        trend === 'up' && 'bg-emerald-500/15 text-emerald-400',
                        trend === 'down' && 'bg-red-500/15 text-red-400',
                        trend === 'neutral' && 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                    )}>
                        {trend === 'up' && '↑'}{trend === 'down' && '↓'} {trendValue}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                    {value}{suffix}
                </p>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                    {label}
                </p>
            </div>
        </div>
    );
}

// New: Action Card for quick actions
interface ActionCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
    href: string;
    icon: React.ReactNode;
    title: string;
    description?: string;
    iconColor?: string;
}

export function ActionCard({
    href,
    icon,
    title,
    description,
    iconColor = 'text-[var(--accent-gold)]',
    className,
    ...props
}: ActionCardProps) {
    return (
        <a
            href={href}
            className={cn(
                'block bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 transition-all duration-200',
                'hover:border-[var(--accent-gold)] hover:bg-[rgba(255,214,0,0.02)] hover:-translate-y-0.5',
                className
            )}
            {...props}
        >
            <div className={cn('w-11 h-11 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center mb-3', iconColor)}>
                {icon}
            </div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
            {description && (
                <p className="text-sm text-[var(--text-muted)]">{description}</p>
            )}
        </a>
    );
}
