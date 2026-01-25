'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
    id: string;
    type: 'achievement' | 'warning' | 'competition';
    message: string;
    xp?: number;
}

interface SocialPredatorTickerProps {
    items?: TickerItem[];
    className?: string;
}

// Generate competitive social proof messages
function generateMockItems(): TickerItem[] {
    return [
        { id: '1', type: 'achievement', message: 'User_294 secured Civil Code', xp: 450 },
        { id: '2', type: 'warning', message: 'You fell behind top 10% of cohort', },
        { id: '3', type: 'achievement', message: 'User_187 completed KSH Chapter 5', xp: 320 },
        { id: '4', type: 'competition', message: '3 users passed you this hour', },
        { id: '5', type: 'achievement', message: 'User_412 unlocked "Streak Master"', xp: 500 },
        { id: '6', type: 'warning', message: 'Your retention dropped 2% overnight', },
        { id: '7', type: 'achievement', message: 'User_089 mastered Bankruptcy Law', xp: 380 },
        { id: '8', type: 'competition', message: 'Top performer: 847 XP today', },
    ];
}

export function SocialPredatorTicker({ items, className }: SocialPredatorTickerProps) {
    const tickerItems = useMemo(() => items || generateMockItems(), [items]);

    // Duplicate for seamless loop
    const doubledItems = [...tickerItems, ...tickerItems];

    return (
        <div className={cn("ticker-bar py-2 border-y border-[var(--border-subtle)]", className)}>
            <div className="ticker-content animate-ticker">
                {doubledItems.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        className="flex items-center gap-2 text-xs"
                    >
                        {item.type === 'achievement' && (
                            <>
                                <TrendingUp size={12} className="text-[var(--accent-success)]" />
                                <span className="text-[var(--text-muted)]">{item.message}</span>
                                {item.xp && (
                                    <span className="text-[var(--accent-success)] font-medium">+{item.xp}xp</span>
                                )}
                            </>
                        )}
                        {item.type === 'warning' && (
                            <>
                                <TrendingDown size={12} className="text-[var(--alarm-critical)]" />
                                <span className="text-[var(--alarm-critical)]">{item.message}</span>
                            </>
                        )}
                        {item.type === 'competition' && (
                            <>
                                <span className="text-orange-400">⚡</span>
                                <span className="text-orange-400">{item.message}</span>
                            </>
                        )}
                        <span className="text-[var(--text-subtle)]">•</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
