'use client';

import { TrendingUp, MessageSquare, Trophy, Target, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Activity {
    id: string;
    type: 'achievement' | 'milestone' | 'rank' | 'streak' | 'study';
    title: string;
    description: string;
    timestamp: Date;
}

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        type: 'achievement',
        title: 'Nowa odznaka!',
        description: 'Zdobyłeś odznakę "Prawo Cywilne Master"',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: '2',
        type: 'rank',
        title: 'Awans w rankingu',
        description: 'Awansowałeś o 3 pozycje (#32)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
        id: '3',
        type: 'milestone',
        title: 'Kamień milowy',
        description: 'Przekroczyłeś €10,000 Knowledge Equity',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
        id: '4',
        type: 'streak',
        title: 'Nowy streak!',
        description: '12 dni nauki z rzędu 🔥',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
        id: '5',
        type: 'study',
        title: 'Sesja zakończona',
        description: '45 fiszek, 87% poprawnych',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
];

const ICONS = {
    achievement: Trophy,
    milestone: Target,
    rank: TrendingUp,
    streak: Zap,
    study: MessageSquare,
};

const COLORS = {
    achievement: 'text-yellow-400 bg-yellow-500/20',
    milestone: 'text-#1a365d bg-#1a365d/20',
    rank: 'text-green-400 bg-green-500/20',
    streak: 'text-orange-400 bg-orange-500/20',
    study: 'text-blue-400 bg-blue-500/20',
};

export function ActivityFeed() {
    return (
        <div className="lex-card">
            <h3 className="text-lg font-semibold mb-4">Aktywność</h3>

            <div className="space-y-4">
                {MOCK_ACTIVITIES.map(activity => {
                    const Icon = ICONS[activity.type];
                    const colorClass = COLORS[activity.type];

                    return (
                        <div key={activity.id} className="flex gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{activity.title}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{activity.description}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: pl })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-#1a365d hover:text-purple-300 transition-colors">
                Zobacz wszystko →
            </button>
        </div>
    );
}
