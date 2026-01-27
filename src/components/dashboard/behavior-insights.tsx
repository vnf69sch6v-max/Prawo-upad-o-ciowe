'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    Info,
    Zap,
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    Brain,
    Loader2,
    RefreshCw,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import type { BehaviorInsight, InsightCategory } from '@/lib/agents';

const INSIGHT_ICONS: Record<string, React.ElementType> = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
    action: Zap,
};

const INSIGHT_COLORS: Record<string, string> = {
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    success: 'text-green-500 bg-green-500/10 border-green-500/20',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    action: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
};

const CATEGORY_ICONS: Record<InsightCategory, React.ElementType> = {
    engagement: Zap,
    performance: TrendingUp,
    learning_pattern: Brain,
    risk: AlertTriangle,
    achievement: Target,
    anomaly: AlertTriangle,
    recommendation: Sparkles,
};

interface BehaviorInsightsProps {
    maxItems?: number;
    showHeader?: boolean;
    compact?: boolean;
}

export function BehaviorInsights({
    maxItems = 5,
    showHeader = true,
    compact = false
}: BehaviorInsightsProps) {
    const { user } = useAuth();
    const [insights, setInsights] = useState<BehaviorInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = async (showRefresh = false) => {
        if (!user) {
            setLoading(false);
            return;
        }

        if (showRefresh) setRefreshing(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/behavior/insights?limit=${maxItems}&minPriority=3`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch insights');
            }

            const data = await response.json();
            setInsights(data.data?.insights || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching behavior insights:', err);
            setError('Nie udało się załadować insights');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [user]);

    const handleRefresh = () => {
        fetchInsights(true);
    };

    if (loading) {
        return (
            <div className={cn("lex-card", compact && "p-4")}>
                {showHeader && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Brain size={20} className="text-[var(--accent)]" />
                            AI Insights
                        </h3>
                    </div>
                )}
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("lex-card", compact && "p-4")}>
                {showHeader && (
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Brain size={20} className="text-[var(--accent)]" />
                        AI Insights
                    </h3>
                )}
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertTriangle className="text-amber-500 mb-2" size={24} />
                    <p className="text-sm text-[var(--text-muted)]">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-3 text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
                    >
                        <RefreshCw size={12} />
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

    if (insights.length === 0) {
        return (
            <div className={cn("lex-card", compact && "p-4")}>
                {showHeader && (
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Brain size={20} className="text-[var(--accent)]" />
                        AI Insights
                    </h3>
                )}
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                        <Sparkles size={24} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Wszystko w porządku!</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Agent nie wykrył żadnych ważnych wzorców do zgłoszenia
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("lex-card", compact && "p-4")}>
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Brain size={20} className="text-[var(--accent)]" />
                        AI Insights
                    </h3>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={cn(
                            "text-[var(--text-muted)]",
                            refreshing && "animate-spin"
                        )} />
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {insights.map((insight) => {
                    const Icon = INSIGHT_ICONS[insight.type] || Info;
                    const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info;
                    const CategoryIcon = CATEGORY_ICONS[insight.category] || Brain;

                    return (
                        <div
                            key={insight.id}
                            className={cn(
                                "relative p-3 rounded-lg border transition-all hover:scale-[1.01]",
                                colorClass
                            )}
                        >
                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    colorClass
                                )}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-sm">{insight.title}</p>
                                        {insight.priority >= 7 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium shrink-0">
                                                Pilne
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                                        {insight.description}
                                    </p>

                                    {insight.actionable && !compact && (
                                        <div className="mt-2 pt-2 border-t border-current/10">
                                            <button className="flex items-center gap-1 text-xs font-medium hover:underline">
                                                {insight.actionable.action}
                                                <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                                        <CategoryIcon size={10} />
                                        <span className="capitalize">{insight.category.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <Clock size={10} />
                                        <span>
                                            {formatDistanceToNow(new Date(insight.timestamp), {
                                                addSuffix: true,
                                                locale: pl
                                            })}
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
