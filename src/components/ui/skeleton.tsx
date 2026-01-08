import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    style,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-[var(--bg-hover)]',
                {
                    'rounded': variant === 'text',
                    'rounded-full': variant === 'circular',
                    'rounded-xl': variant === 'rectangular',
                },
                className
            )}
            style={{
                width: width ?? '100%',
                height: height ?? (variant === 'text' ? '1em' : '100%'),
                ...style,
            }}
            {...props}
        />
    );
}

// Preset Skeletons
export function CardSkeleton() {
    return (
        <div className="lex-card space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton width={60} height={20} />
            </div>
            <Skeleton variant="text" height={16} width="40%" />
            <Skeleton variant="text" height={32} width="60%" />
        </div>
    );
}

export function FlashcardSkeleton() {
    return (
        <div className="lex-card p-8 max-w-2xl mx-auto">
            <div className="flex justify-between mb-6">
                <Skeleton width={100} height={24} />
                <Skeleton width={60} height={24} />
            </div>
            <div className="space-y-4 py-12">
                <Skeleton variant="text" height={24} width="80%" className="mx-auto" />
                <Skeleton variant="text" height={24} width="60%" className="mx-auto" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="lex-card">
                    <div className="flex items-center gap-4">
                        <Skeleton variant="circular" width={48} height={48} />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="text" height={16} width="70%" />
                            <Skeleton variant="text" height={12} width="40%" />
                        </div>
                        <Skeleton width={80} height={32} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="lex-card">
            <div className="flex justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton width={150} height={20} />
                    <Skeleton width={80} height={16} />
                </div>
                <Skeleton width={200} height={32} />
            </div>
            <Skeleton height={200} className="mb-6" />
            <div className="grid grid-cols-3 gap-4">
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={50} />
            </div>
        </div>
    );
}
