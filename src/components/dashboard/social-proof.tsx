'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, Users } from 'lucide-react';

interface SocialProofProps {
    userPercentile: number; // 0-100, where 78 means "faster than 78%"
    totalUsers?: number;
    examType?: string;
    className?: string;
}

export function SocialProof({
    userPercentile,
    totalUsers = 2500,
    examType = "egzaminu radcowskiego",
    className
}: SocialProofProps) {
    // Calculate message based on percentile
    const getMessage = useMemo(() => {
        if (userPercentile >= 90) return { emoji: '🏆', text: 'Jesteś w TOP 10%!', color: 'var(--accent-gold)' };
        if (userPercentile >= 75) return { emoji: '🚀', text: 'Świetny postęp!', color: 'var(--accent-success)' };
        if (userPercentile >= 50) return { emoji: '💪', text: 'Powyżej średniej!', color: 'var(--accent-info)' };
        return { emoji: '📈', text: 'Rozwijasz się!', color: 'var(--text-muted)' };
    }, [userPercentile]);

    return (
        <div className={cn(
            "px-5 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]",
            className
        )}>
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `color-mix(in srgb, ${getMessage.color} 20%, transparent)` }}
                >
                    <TrendingUp size={24} style={{ color: getMessage.color }} />
                </div>

                {/* Main content */}
                <div className="flex-1">
                    <div className="text-sm text-[var(--text-muted)] mb-1">
                        {getMessage.emoji} {getMessage.text}
                    </div>
                    <div className="text-[var(--text-primary)]">
                        Jesteś szybszy niż{' '}
                        <span
                            className="font-bold text-lg"
                            style={{ color: getMessage.color }}
                        >
                            {userPercentile}%
                        </span>
                        {' '}studentów przygotowujących się do {examType}
                    </div>
                </div>
            </div>

            {/* Footer with user count */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                <Users size={14} />
                <span>Na podstawie {totalUsers.toLocaleString()} aktywnych użytkowników</span>
            </div>
        </div>
    );
}
