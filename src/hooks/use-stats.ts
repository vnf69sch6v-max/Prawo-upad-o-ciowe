'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase/client';

interface DailyStat {
    date: string;
    questions_answered: number;
    questions_correct: number;
    accuracy_percent: number | null;
    total_time_seconds: number;
    xp_earned: number;
}

interface UserStats {
    total_sessions: number;
    total_questions_answered: number;
    total_correct: number;
    average_accuracy: number;
    best_streak: number;
    total_study_time_seconds: number;
    strongest_category?: { name: string; slug: string };
    weakest_category?: { name: string; slug: string };
}

interface WeeklyStats {
    week: string;
    questions: number;
    correct: number;
    time: number;
    accuracy: number;
}

export function useStats() {
    const { user } = useAuth();
    const [todayStats, setTodayStats] = useState<DailyStat | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [dailyHistory, setDailyHistory] = useState<DailyStat[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper: format date
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Pobierz dzisiejsze statystyki
    const fetchTodayStats = useCallback(async () => {
        if (!user?.uid) return;

        const today = formatDate(new Date());

        try {
            const { data, error } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', user.uid)
                .eq('date', today)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            setTodayStats(data || {
                date: today,
                questions_answered: 0,
                questions_correct: 0,
                accuracy_percent: null,
                total_time_seconds: 0,
                xp_earned: 0
            });
        } catch (err) {
            console.error('Error fetching today stats:', err);
        }
    }, [user?.uid]);

    // Pobierz ogólne statystyki użytkownika
    const fetchUserStats = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const { data, error } = await supabase
                .from('user_statistics')
                .select(`
          *,
          strongest_category:categories!user_statistics_strongest_category_id_fkey(name, slug),
          weakest_category:categories!user_statistics_weakest_category_id_fkey(name, slug)
        `)
                .eq('user_id', user.uid)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            setUserStats(data || {
                total_sessions: 0,
                total_questions_answered: 0,
                total_correct: 0,
                average_accuracy: 0,
                best_streak: 0,
                total_study_time_seconds: 0
            });
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    }, [user?.uid]);

    // Pobierz historię dzienną
    const fetchDailyHistory = useCallback(async (days = 30) => {
        if (!user?.uid) return;

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', user.uid)
                .gte('date', formatDate(startDate))
                .order('date', { ascending: true });

            if (error) throw error;

            // Uzupełnij brakujące dni zerami
            const statsMap: Record<string, DailyStat> = {};
            (data || []).forEach(d => {
                statsMap[d.date] = d;
            });

            const result: DailyStat[] = [];
            for (let i = days; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = formatDate(date);

                result.push(statsMap[dateStr] || {
                    date: dateStr,
                    questions_answered: 0,
                    questions_correct: 0,
                    accuracy_percent: null,
                    total_time_seconds: 0,
                    xp_earned: 0
                });
            }

            setDailyHistory(result);
        } catch (err) {
            console.error('Error fetching daily history:', err);
        }
    }, [user?.uid]);

    // Pobierz statystyki tygodniowe (do wykresów)
    const fetchWeeklyStats = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 28); // 4 tygodnie

            const { data, error } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', user.uid)
                .gte('date', formatDate(startDate))
                .order('date', { ascending: true });

            if (error) throw error;

            // Agreguj po tygodniach
            const weeks: WeeklyStats[] = [];
            let currentWeek: string | null = null;
            let weekStats = { questions: 0, correct: 0, time: 0 };

            (data || []).forEach(day => {
                const dayDate = new Date(day.date);
                const weekStart = new Date(dayDate);
                weekStart.setDate(dayDate.getDate() - dayDate.getDay() + 1); // Poniedziałek
                const weekKey = formatDate(weekStart);

                if (weekKey !== currentWeek) {
                    if (currentWeek) {
                        weeks.push({
                            week: currentWeek,
                            ...weekStats,
                            accuracy: weekStats.questions > 0
                                ? Math.round((weekStats.correct / weekStats.questions) * 100)
                                : 0
                        });
                    }
                    currentWeek = weekKey;
                    weekStats = { questions: 0, correct: 0, time: 0 };
                }

                weekStats.questions += day.questions_answered || 0;
                weekStats.correct += day.questions_correct || 0;
                weekStats.time += day.total_time_seconds || 0;
            });

            // Dodaj ostatni tydzień
            if (currentWeek) {
                weeks.push({
                    week: currentWeek,
                    ...weekStats,
                    accuracy: weekStats.questions > 0
                        ? Math.round((weekStats.correct / weekStats.questions) * 100)
                        : 0
                });
            }

            setWeeklyStats(weeks);
        } catch (err) {
            console.error('Error fetching weekly stats:', err);
        }
    }, [user?.uid]);

    // Inicjalizacja
    useEffect(() => {
        if (user?.uid) {
            setLoading(true);
            Promise.all([
                fetchTodayStats(),
                fetchUserStats(),
                fetchDailyHistory(),
                fetchWeeklyStats()
            ]).finally(() => setLoading(false));
        }
    }, [user?.uid, fetchTodayStats, fetchUserStats, fetchDailyHistory, fetchWeeklyStats]);

    // Odśwież wszystkie dane
    const refresh = useCallback(() => {
        fetchTodayStats();
        fetchUserStats();
        fetchDailyHistory();
        fetchWeeklyStats();
    }, [fetchTodayStats, fetchUserStats, fetchDailyHistory, fetchWeeklyStats]);

    // Oblicz streak info
    const streakInfo = {
        currentStreak: 0, // Pobierz z profilu
        isActiveToday: (todayStats?.questions_answered || 0) > 0
    };

    return {
        todayStats,
        userStats,
        dailyHistory,
        weeklyStats,
        streakInfo,
        loading,
        refresh,
        fetchDailyHistory
    };
}
