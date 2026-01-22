// src/hooks/useQuestionManagement.ts
// Hook do zarządzania pytaniami w CMS

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Typy
interface QuestionFilters {
    status?: string
    categoryId?: string
    search?: string
    page?: number
    limit?: number
}

interface Question {
    id: string
    question_text: string
    question_type: string
    answers: { id: string; text: string }[]
    correct_answer_ids: string[]
    explanation?: string
    legal_basis?: string
    legal_area?: string
    category_id?: string
    difficulty: number
    status: string
    source?: string
    exam_type?: string
    created_at: string
    updated_at?: string
    category?: { name: string }
}

// Hook: Pobierz pytania dla admina
export function useAdminQuestions(filters: QuestionFilters = {}) {
    const { status, categoryId, search, page = 1, limit = 20 } = filters

    return useQuery({
        queryKey: ['admin-questions', filters],
        queryFn: async () => {
            let query = supabase
                .from('questions')
                .select(`
          *,
          category:categories(name)
        `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            if (status) {
                query = query.eq('status', status)
            }
            if (categoryId) {
                query = query.eq('category_id', categoryId)
            }
            if (search) {
                query = query.ilike('question_text', `%${search}%`)
            }

            const { data, count, error } = await query

            if (error) throw error

            return {
                questions: data as Question[],
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        }
    })
}

// Hook: Statystyki pytań
export function useQuestionStats() {
    return useQuery({
        queryKey: ['question-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('question_stats_view')
                .select('*')

            if (error) throw error
            return data
        }
    })
}

// Hook: Zmiana statusu
export function useChangeQuestionStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            questionId,
            newStatus,
            notes
        }: {
            questionId: string
            newStatus: string
            notes?: string
        }) => {
            const { data: { user } } = await supabase.auth.getUser()

            const { data, error } = await supabase
                .rpc('change_question_status', {
                    p_question_id: questionId,
                    p_new_status: newStatus,
                    p_changed_by: user?.id,
                    p_notes: notes
                })

            if (error) throw error
            if (!data?.success) throw new Error(data?.error || 'Błąd zmiany statusu')

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
            queryClient.invalidateQueries({ queryKey: ['question-stats'] })
        }
    })
}

// Hook: Tworzenie pytania
export function useCreateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionData: Partial<Question>) => {
            const { data: { user } } = await supabase.auth.getUser()

            const { data, error } = await supabase
                .from('questions')
                .insert({
                    ...questionData,
                    created_by: user?.id,
                    status: 'draft',
                    import_source: 'manual'
                })
                .select()
                .single()

            if (error) throw error

            // Zapisz historię
            await supabase
                .from('question_history')
                .insert({
                    question_id: data.id,
                    action: 'created',
                    changed_by: user?.id
                })

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
            queryClient.invalidateQueries({ queryKey: ['question-stats'] })
        }
    })
}

// Hook: Aktualizacja pytania
export function useUpdateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            updates
        }: {
            id: string
            updates: Partial<Question>
        }) => {
            const { data: { user } } = await supabase.auth.getUser()

            // Pobierz stare dane
            const { data: oldData } = await supabase
                .from('questions')
                .select('*')
                .eq('id', id)
                .single()

            const { data, error } = await supabase
                .from('questions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // Zapisz historię
            await supabase
                .from('question_history')
                .insert({
                    question_id: id,
                    action: 'updated',
                    changes: { old: oldData, new: data },
                    changed_by: user?.id
                })

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
        }
    })
}

// Hook: Usuwanie pytania
export function useDeleteQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) => {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', questionId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
            queryClient.invalidateQueries({ queryKey: ['question-stats'] })
        }
    })
}

// Hook: Bulk import
export function useBulkImport() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            questions,
            categoryId,
            autoPublish = false
        }: {
            questions: any[]
            categoryId?: string
            autoPublish?: boolean
        }) => {
            const { data: { user } } = await supabase.auth.getUser()

            // Utwórz batch
            const { data: batch, error: batchError } = await supabase
                .from('import_batches')
                .insert({
                    name: `Import ${new Date().toISOString()}`,
                    source_type: 'json',
                    total_rows: questions.length,
                    created_by: user?.id,
                    status: 'processing',
                    started_at: new Date().toISOString()
                })
                .select()
                .single()

            if (batchError) throw batchError

            // Wywołaj RPC
            const { data, error } = await supabase
                .rpc('bulk_import_questions', {
                    p_questions: questions,
                    p_batch_id: batch.id,
                    p_created_by: user?.id,
                    p_default_category_id: categoryId,
                    p_auto_publish: autoPublish
                })

            if (error) throw error

            return { ...data, batchId: batch.id }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
            queryClient.invalidateQueries({ queryKey: ['question-stats'] })
        }
    })
}

// Hook: Historia pytania
export function useQuestionHistory(questionId: string) {
    return useQuery({
        queryKey: ['question-history', questionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('question_history')
                .select('*')
                .eq('question_id', questionId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
        enabled: !!questionId
    })
}

// Hook: Tagi
export function useContentTags() {
    return useQuery({
        queryKey: ['content-tags'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('content_tags')
                .select('*')
                .order('name')

            if (error) throw error
            return data
        }
    })
}
