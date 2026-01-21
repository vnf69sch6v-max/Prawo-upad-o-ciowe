'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LEGAL_AREAS, type LegalAreaKey } from '@/lib/constants';

export interface Category {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    legal_area: LegalAreaKey;
    icon: string | null;
    color: string | null;
    order_index: number;
    total_questions: number;
    is_free: boolean;
    is_active: boolean;
}

export interface CategoryWithMeta extends Category {
    areaInfo: typeof LEGAL_AREAS[LegalAreaKey];
    userProgress?: {
        mastery: number;
        questionsAnswered: number;
    };
}

export function useCategories() {
    const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);

                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (fetchError) throw fetchError;

                const categoriesWithMeta: CategoryWithMeta[] = (data || []).map(cat => ({
                    ...cat,
                    areaInfo: LEGAL_AREAS[cat.legal_area as LegalAreaKey] || LEGAL_AREAS.civil
                }));

                setCategories(categoriesWithMeta);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Nie udało się pobrać kategorii');
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    // Get categories by legal area
    const getCategoriesByArea = (area: LegalAreaKey): CategoryWithMeta[] => {
        return categories.filter(cat => cat.legal_area === area);
    };

    // Get category by slug
    const getCategoryBySlug = (slug: string): CategoryWithMeta | undefined => {
        return categories.find(cat => cat.slug === slug);
    };

    // Get free categories
    const freeCategories = categories.filter(cat => cat.is_free);

    // Get premium categories
    const premiumCategories = categories.filter(cat => !cat.is_free);

    return {
        categories,
        loading,
        error,
        getCategoriesByArea,
        getCategoryBySlug,
        freeCategories,
        premiumCategories
    };
}
