'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase/client';

interface CategoryProgress {
    id: string;
    user_id: string;
    category_id: string;
    mastery_level: number;
    total_questions_seen: number;
    total_correct: number;
    total_wrong: number;
    last_reviewed_at: string | null;
    mastery_trend: 'improving' | 'declining' | 'stable' | null;
    category?: {
        id: string;
        name: string;
        slug: string;
        legal_area: string;
        total_questions: number;
    };
}

interface WeakArea {
    category_id: string;
    category_name: string;
    mastery_level: number;
    legal_area: string;
    recommended_action: string;
}

export function useProgress() {
    const { user } = useAuth();
    const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
    const [loading, setLoading] = useState(true);

    // Pobierz postępy w kategoriach
    const fetchCategoryProgress = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const { data, error } = await supabase
                .from('category_progress')
                .select(`
          *,
          category:categories(id, name, slug, legal_area, total_questions)
        `)
                .eq('user_id', user.uid)
                .order('mastery_level', { ascending: false });

            if (error) throw error;
            setCategoryProgress(data || []);
        } catch (err) {
            console.error('Error fetching category progress:', err);
        }
    }, [user?.uid]);

    // Pobierz słabe obszary
    const fetchWeakAreas = useCallback(async (threshold = 60) => {
        if (!user?.uid) return;

        try {
            const { data, error } = await supabase
                .from('category_progress')
                .select(`
          *,
          category:categories(id, name, slug, legal_area)
        `)
                .eq('user_id', user.uid)
                .lt('mastery_level', threshold)
                .order('mastery_level', { ascending: true })
                .limit(5);

            if (error) throw error;

            const weak: WeakArea[] = (data || []).map(p => ({
                category_id: p.category_id,
                category_name: p.category?.name || 'Nieznana',
                mastery_level: p.mastery_level,
                legal_area: p.category?.legal_area || '',
                recommended_action: p.mastery_level < 30
                    ? 'Zacznij od podstaw'
                    : p.mastery_level < 50
                        ? 'Powtórz kluczowe tematy'
                        : 'Ćwicz trudniejsze pytania'
            }));

            setWeakAreas(weak);
        } catch (err) {
            console.error('Error fetching weak areas:', err);
        }
    }, [user?.uid]);

    // Aktualizuj postęp w kategorii
    const updateCategoryProgress = useCallback(async ({
        categoryId,
        correct,
        total
    }: {
        categoryId: string;
        correct: number;
        total: number;
    }) => {
        if (!user?.uid) return null;

        try {
            // Pobierz aktualny postęp
            const { data: current } = await supabase
                .from('category_progress')
                .select('*')
                .eq('user_id', user.uid)
                .eq('category_id', categoryId)
                .single();

            const newTotalSeen = (current?.total_questions_seen || 0) + total;
            const newTotalCorrect = (current?.total_correct || 0) + correct;
            const newMastery = newTotalSeen > 0
                ? Math.round((newTotalCorrect / newTotalSeen) * 100)
                : 0;

            // Oblicz trend
            let trend: 'improving' | 'declining' | 'stable' = 'stable';
            if (current?.mastery_level) {
                const diff = newMastery - current.mastery_level;
                trend = diff > 2 ? 'improving' : diff < -2 ? 'declining' : 'stable';
            }

            const updates = {
                user_id: user.uid,
                category_id: categoryId,
                total_questions_seen: newTotalSeen,
                total_correct: newTotalCorrect,
                total_wrong: (current?.total_wrong || 0) + (total - correct),
                mastery_level: newMastery,
                mastery_trend: trend,
                last_reviewed_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('category_progress')
                .upsert(updates)
                .select()
                .single();

            if (error) throw error;

            // Odśwież dane
            fetchCategoryProgress();
            fetchWeakAreas();

            return data;
        } catch (err) {
            console.error('Error updating category progress:', err);
            return null;
        }
    }, [user?.uid, fetchCategoryProgress, fetchWeakAreas]);

    // Pobierz postęp dla konkretnej kategorii
    const getCategoryProgress = useCallback((categoryId: string): CategoryProgress | undefined => {
        return categoryProgress.find(p => p.category_id === categoryId);
    }, [categoryProgress]);

    // Inicjalizacja
    useEffect(() => {
        if (user?.uid) {
            setLoading(true);
            Promise.all([fetchCategoryProgress(), fetchWeakAreas()])
                .finally(() => setLoading(false));
        }
    }, [user?.uid, fetchCategoryProgress, fetchWeakAreas]);

    // Statystyki ogólne
    const overallStats = {
        totalCategories: categoryProgress.length,
        masteredCategories: categoryProgress.filter(p => p.mastery_level >= 80).length,
        averageMastery: categoryProgress.length > 0
            ? Math.round(categoryProgress.reduce((sum, p) => sum + p.mastery_level, 0) / categoryProgress.length)
            : 0,
        totalQuestionsAnswered: categoryProgress.reduce((sum, p) => sum + p.total_questions_seen, 0),
        totalCorrect: categoryProgress.reduce((sum, p) => sum + p.total_correct, 0)
    };

    return {
        categoryProgress,
        weakAreas,
        loading,
        overallStats,
        fetchCategoryProgress,
        fetchWeakAreas,
        updateCategoryProgress,
        getCategoryProgress
    };
}
