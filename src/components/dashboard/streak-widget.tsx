'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Flame, Snowflake, AlertTriangle } from 'lucide-react';

interface StreakWidgetProps {
    currentStreak: number;
    hasCompletedTodaySession: boolean;
    lastSessionDate?: Date;
    className?: string;
}

export function StreakWidget({
    currentStreak,
    hasCompletedTodaySession,
    lastSessionDate,
    className
}: StreakWidgetProps) {
    // Calculate hours until midnight
    const hoursUntilMidnight = useMemo(() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return Math.floor((midnight.getTime() - now.getTime()) / 3600000);
    }, []);

    const isAtRisk = !hasCompletedTodaySession && currentStreak > 0;
    const isCritical = isAtRisk && hoursUntilMidnight <= 2;
    const isLost = currentStreak === 0 && lastSessionDate &&
        (Date.now() - lastSessionDate.getTime()) > 86400000 * 2; // Lost if no session for 2+ days

    // Determine state
    const state = isLost ? 'lost' : isCritical ? 'critical' : isAtRisk ? 'at-risk' : 'safe';

    const getContent = () => {
        switch (state) {
            case 'lost':
                return {
                    icon: <Snowflake size={24} className="text-blue-400" />,
                    title: 'Seria przerwana',
                    message: 'Zacznij od nowa!',
                    bgClass: 'bg-blue-500/10 border-blue-500/30',
                    textColor: 'text-blue-400'
                };
            case 'critical':
                return {
                    icon: <AlertTriangle size={24} className="text-[var(--accent-danger)] animate-pulse" />,
                    title: `${currentStreak} dni`,
                    message: `⏰ Zostało ${hoursUntilMidnight}h! Uratuj serię!`,
                    bgClass: 'bg-[var(--accent-danger)]/10 border-[var(--accent-danger)]/30 animate-pulse',
                    textColor: 'text-[var(--accent-danger)]'
                };
            case 'at-risk':
                return {
                    icon: <Flame size={24} className="text-orange-400 opacity-50" />,
                    title: `${currentStreak} dni`,
                    message: `Seria zagrożona! Zostało ${hoursUntilMidnight}h`,
                    bgClass: 'bg-orange-500/10 border-orange-500/30',
                    textColor: 'text-orange-400'
                };
            default:
                return {
                    icon: <Flame size={24} className="text-orange-500" />,
                    title: `${currentStreak} dni`,
                    message: currentStreak > 7 ? '🔥 Niesamowita seria!' : currentStreak > 0 ? 'Tak trzymaj!' : 'Zacznij serię!',
                    bgClass: 'bg-orange-500/10 border-orange-500/30',
                    textColor: 'text-orange-500'
                };
        }
    };

    const content = getContent();

    return (
        <div
            className={cn(
                "px-4 py-3 rounded-xl border transition-all",
                content.bgClass,
                className
            )}
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    state === 'lost' && "bg-blue-500/20",
                    state === 'critical' && "bg-[var(--accent-danger)]/20",
                    state === 'at-risk' && "bg-orange-500/20",
                    state === 'safe' && "bg-orange-500/20"
                )}>
                    {content.icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                    <div className={cn("font-bold text-lg", content.textColor)}>
                        {content.title}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                        {content.message}
                    </div>
                </div>

                {/* Badge for streak count */}
                {currentStreak > 0 && state !== 'lost' && (
                    <div className={cn(
                        "text-2xl",
                        state === 'critical' && "animate-bounce"
                    )}>
                        🔥
                    </div>
                )}
            </div>

            {/* Progress to midnight (only show if at risk) */}
            {isAtRisk && (
                <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                        <span>Do północy</span>
                        <span>{hoursUntilMidnight}h</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                isCritical ? "bg-[var(--accent-danger)]" : "bg-orange-500"
                            )}
                            style={{ width: `${Math.max(0, (hoursUntilMidnight / 24) * 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
