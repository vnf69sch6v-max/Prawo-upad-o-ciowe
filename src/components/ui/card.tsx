import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass';
    glow?: boolean;
}

export function Card({
    className,
    variant = 'default',
    glow = false,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border transition-all duration-300',
                {
                    'bg-[var(--bg-card)] border-[var(--border-color)]': variant === 'default',
                    'bg-[var(--bg-elevated)] border-[var(--border-color)] shadow-lg': variant === 'elevated',
                    'bg-[var(--bg-elevated)]/50 backdrop-blur-xl border-[var(--border-color)]': variant === 'glass',
                },
                glow && 'hover:border-[#1a365d]/30 hover:shadow-#1a365d/10 hover:shadow-lg',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-[var(--text-muted)]', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-6 pt-4 border-t border-[var(--border-color)]', className)} {...props} />;
}
