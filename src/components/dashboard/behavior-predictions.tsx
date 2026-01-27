'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Target,
    Clock,
    Flame
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import type { BehaviorPredictions } from '@/lib/agents';

interface BehaviorPredictionsWidgetProps {
    showTimeToMastery?: boolean;
}

export function BehaviorPredictionsWidget({
    showTimeToMastery = true
}: BehaviorPredictionsWidgetProps) {
    const { user, getIdToken } = useAuth();
    const [predictions, setPredictions] = useState<BehaviorPredictions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPredictions() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = await getIdToken();
                const response = await fetch('/api/behavior?type=predictions', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch predictions');
                }

                const data = await response.json();
                setPredictions(data.data?.predictions || null);
            } catch (err) {
                console.error('Error fetching predictions:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPredictions();
    }, [user]);

    if (loading) {
        return (
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[var(--accent)]" />
                    Predykcje AI
                </h3>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                </div>
            </div>
        );
    }

    if (!predictions) {
        return null;
    }

    const passChance = predictions.examPassProbability;
    const passColor = passChance >= 0.7 ? 'text-green-500' : passChance >= 0.5 ? 'text-amber-500' : 'text-red-500';
    const passBgColor = passChance >= 0.7 ? 'bg-green-500/10' : passChance >= 0.5 ? 'bg-amber-500/10' : 'bg-red-500/10';

    const churnRisk7d = predictions.churnProbability['7_days'];
    const churnColor = churnRisk7d < 0.3 ? 'text-green-500' : churnRisk7d < 0.6 ? 'text-amber-500' : 'text-red-500';

    const translateTimeOfDay = (time: string): string => {
        const translations: Record<string, string> = {
            morning: 'Rano',
            afternoon: 'Po południu',
            evening: 'Wieczorem',
            night: 'W nocy'
        };
        return translations[time] || time;
    };

    return (
        <div className="lex-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[var(--accent)]" />
                Predykcje AI
            </h3>

            <div className="space-y-4">
                {/* Exam Pass Probability */}
                <div className={cn("p-4 rounded-lg", passBgColor)}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Szansa zdania egzaminu</span>
                        {passChance >= 0.7 ? (
                            <CheckCircle2 size={18} className={passColor} />
                        ) : passChance < 0.5 ? (
                            <AlertTriangle size={18} className={passColor} />
                        ) : (
                            <Target size={18} className={passColor} />
                        )}
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={cn("text-3xl font-bold", passColor)}>
                            {Math.round(passChance * 100)}%
                        </span>
                        <span className="text-xs text-[var(--text-muted)] mb-1">
                            pewności: {Math.round(predictions.expectedExamScore.confidence * 100)}%
                        </span>
                    </div>
                    <div className="mt-2 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", passColor.replace('text-', 'bg-'))}
                            style={{ width: `${passChance * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                        Przewidywany wynik: {Math.round(predictions.expectedExamScore.value)}%
                        <span className="opacity-70">
                            {' '}({Math.round(predictions.expectedExamScore.range.min)}-{Math.round(predictions.expectedExamScore.range.max)}%)
                        </span>
                    </p>
                </div>

                {/* Next Session Prediction */}
                <div className="p-4 rounded-lg bg-[var(--bg-hover)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-[var(--accent)]" />
                        <span className="text-sm font-medium">Następna sesja</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">Optymalny czas</p>
                            <p className="font-medium">
                                {translateTimeOfDay(predictions.nextSessionPrediction.likelyTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">Sugerowany czas</p>
                            <p className="font-medium">
                                {Math.round(predictions.nextSessionPrediction.likelyDuration)} min
                            </p>
                        </div>
                    </div>
                </div>

                {/* Churn Risk */}
                <div className="p-4 rounded-lg bg-[var(--bg-hover)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Flame size={16} className={churnColor} />
                            <span className="text-sm font-medium">Ryzyko porzucenia nauki</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-[var(--bg-card)]">
                            <p className={cn("text-lg font-bold", churnColor)}>
                                {Math.round(predictions.churnProbability['7_days'] * 100)}%
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">7 dni</p>
                        </div>
                        <div className="p-2 rounded bg-[var(--bg-card)]">
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {Math.round(predictions.churnProbability['14_days'] * 100)}%
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">14 dni</p>
                        </div>
                        <div className="p-2 rounded bg-[var(--bg-card)]">
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {Math.round(predictions.churnProbability['30_days'] * 100)}%
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">30 dni</p>
                        </div>
                    </div>
                </div>

                {/* Time to Mastery */}
                {showTimeToMastery && predictions.timeToMastery.length > 0 && (
                    <div className="p-4 rounded-lg bg-[var(--bg-hover)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-[var(--accent)]" />
                            <span className="text-sm font-medium">Czas do opanowania</span>
                        </div>
                        <div className="space-y-2">
                            {predictions.timeToMastery.slice(0, 3).map((item) => (
                                <div key={item.topic} className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs truncate">{item.topic}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--accent)] rounded-full"
                                                    style={{ width: `${item.currentMastery}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-[var(--text-muted)] w-8">
                                                {Math.round(item.currentMastery)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-medium text-[var(--accent)]">
                                            ~{item.estimatedDays}d
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
