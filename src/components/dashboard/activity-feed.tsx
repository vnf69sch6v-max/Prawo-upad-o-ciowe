'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Trophy, Target, Zap, Loader2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirebaseDb, isFirebaseAvailable } from '@/lib/firebase/config';
import { ActivityItem } from '@/lib/types/user';

const ICONS: Record<string, React.ElementType> = {
    exam_completed: Trophy,
    streak_milestone: Zap,
    achievement: Trophy,
    study_session: MessageSquare,
    flashcard_mastered: Target,
};

const COLORS: Record<string, string> = {
    exam_completed: 'text-green-500 bg-green-500/10',
    streak_milestone: 'text-orange-500 bg-orange-500/10',
    achievement: 'text-yellow-500 bg-yellow-500/10',
    study_session: 'text-blue-500 bg-blue-500/10',
    flashcard_mastered: 'text-purple-500 bg-purple-500/10',
};

interface ActivityFeedProps {
    userId?: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const uid = userId || user?.uid;

    useEffect(() => {
        async function fetchActivities() {
            if (!uid || !isFirebaseAvailable()) {
                setLoading(false);
                return;
            }

            try {
                const db = getFirebaseDb();
                if (!db) {
                    setLoading(false);
                    return;
                }

                const activitiesRef = collection(db, 'users', uid, 'activities');
                const q = query(
                    activitiesRef,
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                })) as ActivityItem[];

                setActivities(data);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchActivities();
    }, [uid]);

    if (loading) {
        return (
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4">Aktywność</h3>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin" size={24} style={{ color: '#1a365d' }} />
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4">Aktywność</h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                        <Inbox size={24} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Brak aktywności</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Zacznij naukę, aby zobaczyć swoje postępy</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lex-card">
            <h3 className="text-lg font-semibold mb-4">Aktywność</h3>

            <div className="space-y-4">
                {activities.map(activity => {
                    const Icon = ICONS[activity.type] || Trophy;
                    const colorClass = COLORS[activity.type] || 'text-gray-500 bg-gray-500/10';

                    return (
                        <div key={activity.id} className="flex gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{activity.title}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{activity.description}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: pl })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
