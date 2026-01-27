'use client';

import { useState, useEffect } from 'react';
import {
    BookOpen,
    Clock,
    Heart,
    Coffee,
    RefreshCw,
    Rocket,
    Loader2,
    Sparkles,
    ChevronRight,
    Target
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import type { Recommendation } from '@/lib/agents';

const RECOMMENDATION_ICONS: Record<string, React.ElementType> = {
    study_focus: BookOpen,
    timing: Clock,
    motivation: Heart,
    break: Coffee,
    review: RefreshCw,
    challenge: Rocket,
};

const RECOMMENDATION_COLORS: Record<string, string> = {
    study_focus: 'text-blue-500 bg-blue-500/10',
    timing: 'text-purple-500 bg-purple-500/10',
    motivation: 'text-pink-500 bg-pink-500/10',
    break: 'text-green-500 bg-green-500/10',
    review: 'text-amber-500 bg-amber-500/10',
    challenge: 'text-orange-500 bg-orange-500/10',
};

interface BehaviorRecommendationsProps {
    maxItems?: number;
    onSelectTopic?: (topic: string) => void;
}

export function BehaviorRecommendations({
    maxItems = 4,
    onSelectTopic
}: BehaviorRecommendationsProps) {
    const { user, getIdToken } = useAuth();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecommendations() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = await getIdToken();
                const response = await fetch('/api/behavior?type=recommendations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }

                const data = await response.json();
                setRecommendations((data.data?.recommendations || []).slice(0, maxItems));
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, [user, maxItems]);

    if (loading) {
        return (
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target size={20} className="text-[var(--accent)]" />
                    Rekomendacje
                </h3>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target size={20} className="text-[var(--accent)]" />
                    Rekomendacje
                </h3>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                        <Sparkles size={24} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Brak rekomendacji</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Kontynuuj naukę, a agent przygotuje dla Ciebie spersonalizowane wskazówki
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="lex-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} className="text-[var(--accent)]" />
                Rekomendacje AI
            </h3>

            <div className="space-y-3">
                {recommendations.map((rec) => {
                    const Icon = RECOMMENDATION_ICONS[rec.type] || Sparkles;
                    const colorClass = RECOMMENDATION_COLORS[rec.type] || 'text-gray-500 bg-gray-500/10';

                    return (
                        <div
                            key={rec.id}
                            className="group p-3 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] transition-all cursor-pointer"
                            onClick={() => {
                                if (rec.relatedTopics?.[0] && onSelectTopic) {
                                    onSelectTopic(rec.relatedTopics[0]);
                                }
                            }}
                        >
                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                    colorClass
                                )}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm">{rec.title}</p>
                                        <ChevronRight
                                            size={16}
                                            className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        />
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                                        {rec.description}
                                    </p>

                                    {rec.relatedTopics && rec.relatedTopics.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {rec.relatedTopics.slice(0, 2).map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                            {rec.relatedTopics.length > 2 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)]">
                                                    +{rec.relatedTopics.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--accent)] rounded-full transition-all"
                                                style={{ width: `${rec.expectedImpact * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-[var(--text-muted)]">
                                            {Math.round(rec.expectedImpact * 100)}% wpływ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
