'use client'

// src/components/admin/QuestionsList.tsx
// Lista pytań z filtrami i bulk actions

import { useState } from 'react'
import { useAdminQuestions, useChangeQuestionStatus, useDeleteQuestion } from '@/hooks/useQuestionManagement'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { QuestionForm } from './QuestionForm'
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    XCircle,
    Archive,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const STATUS_CONFIG = {
    draft: {
        label: 'Szkic',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: Edit
    },
    pending_review: {
        label: 'Do recenzji',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
    },
    approved: {
        label: 'Zatwierdzony',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: CheckCircle
    },
    published: {
        label: 'Opublikowany',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
    },
    rejected: {
        label: 'Odrzucony',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
    },
    archived: {
        label: 'Zarchiwizowany',
        color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        icon: Archive
    }
} as const

export function QuestionsList() {
    // State
    const [filters, setFilters] = useState({
        status: '',
        categoryId: '',
        search: '',
        page: 1,
        limit: 20
    })
    const [showFilters, setShowFilters] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [previewQuestion, setPreviewQuestion] = useState<any>(null)

    // Hooks
    const { data, isLoading, refetch } = useAdminQuestions(filters)
    const { categories } = useCategories()
    const changeStatus = useChangeQuestionStatus()
    const deleteQuestion = useDeleteQuestion()

    // Actions
    const handleStatusChange = async (questionId: string, newStatus: string) => {
        try {
            await changeStatus.mutateAsync({ questionId, newStatus })
            refetch()
        } catch (err) {
            console.error('Status change error:', err)
        }
    }

    const handleBulkStatusChange = async (newStatus: string) => {
        for (const id of selectedQuestions) {
            await changeStatus.mutateAsync({ questionId: id, newStatus })
        }
        setSelectedQuestions([])
        refetch()
    }

    const handleDelete = async (questionId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to pytanie?')) return
        try {
            await deleteQuestion.mutateAsync(questionId)
            refetch()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    const toggleSelectAll = () => {
        if (selectedQuestions.length === data?.questions?.length) {
            setSelectedQuestions([])
        } else {
            setSelectedQuestions(data?.questions?.map(q => q.id) || [])
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Zarządzanie pytaniami</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {data?.total || 0} pytań w bazie
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nowe pytanie
                </Button>
            </div>

            {/* Filtry */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                                placeholder="Szukaj w pytaniach..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    {/* Status filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                        className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">Wszystkie statusy</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>

                    {/* Category filter */}
                    <select
                        value={filters.categoryId}
                        onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value, page: 1 }))}
                        className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">Wszystkie kategorie</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* More filters button */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Więcej filtrów
                    </Button>
                </div>
            </Card>

            {/* Bulk actions */}
            {selectedQuestions.length > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                            Zaznaczono {selectedQuestions.length} pytań
                        </span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkStatusChange('pending_review')}
                            >
                                <Send className="w-4 h-4 mr-1" />
                                Do recenzji
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkStatusChange('published')}
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Publikuj
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkStatusChange('archived')}
                            >
                                <Archive className="w-4 h-4 mr-1" />
                                Archiwizuj
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedQuestions([])}
                            >
                                Anuluj
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Questions table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedQuestions.length === data?.questions?.length && data?.questions?.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Pytanie
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Kategoria
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Trudność
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Data
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Akcje
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        Ładowanie...
                                    </td>
                                </tr>
                            ) : data?.questions?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        Brak pytań spełniających kryteria
                                    </td>
                                </tr>
                            ) : (
                                data?.questions?.map((question: any) => (
                                    <QuestionRow
                                        key={question.id}
                                        question={question}
                                        isSelected={selectedQuestions.includes(question.id)}
                                        onSelect={(selected) => {
                                            if (selected) {
                                                setSelectedQuestions([...selectedQuestions, question.id])
                                            } else {
                                                setSelectedQuestions(selectedQuestions.filter(id => id !== question.id))
                                            }
                                        }}
                                        onEdit={() => setEditingQuestion(question)}
                                        onPreview={() => setPreviewQuestion(question)}
                                        onDelete={() => handleDelete(question.id)}
                                        onStatusChange={(status) => handleStatusChange(question.id, status)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.pages > 1 && (
                    <div className="px-4 py-3 border-t dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Strona {filters.page} z {data.pages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={filters.page === 1}
                                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={filters.page === data.pages}
                                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Nowe pytanie"
            >
                <QuestionForm
                    onSuccess={() => {
                        setShowCreateModal(false)
                        refetch()
                    }}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>

            {/* Edit modal */}
            <Modal
                isOpen={!!editingQuestion}
                onClose={() => setEditingQuestion(null)}
                title="Edytuj pytanie"
            >
                {editingQuestion && (
                    <QuestionForm
                        initialData={editingQuestion}
                        onSuccess={() => {
                            setEditingQuestion(null)
                            refetch()
                        }}
                        onCancel={() => setEditingQuestion(null)}
                    />
                )}
            </Modal>

            {/* Preview modal */}
            <Modal
                isOpen={!!previewQuestion}
                onClose={() => setPreviewQuestion(null)}
                title="Podgląd pytania"
            >
                {previewQuestion && (
                    <QuestionPreview question={previewQuestion} />
                )}
            </Modal>
        </div>
    )
}

// Wiersz tabeli
function QuestionRow({
    question,
    isSelected,
    onSelect,
    onEdit,
    onPreview,
    onDelete,
    onStatusChange
}: {
    question: any
    isSelected: boolean
    onSelect: (selected: boolean) => void
    onEdit: () => void
    onPreview: () => void
    onDelete: () => void
    onStatusChange: (status: string) => void
}) {
    const [showMenu, setShowMenu] = useState(false)
    const statusConfig = STATUS_CONFIG[question.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
    const StatusIcon = statusConfig.icon

    // Dostępne przejścia
    const getTransitions = (status: string) => {
        const map: Record<string, Array<{ status: string; label: string; icon: any }>> = {
            draft: [
                { status: 'pending_review', label: 'Do recenzji', icon: Clock },
                { status: 'archived', label: 'Archiwizuj', icon: Archive }
            ],
            pending_review: [
                { status: 'approved', label: 'Zatwierdź', icon: CheckCircle },
                { status: 'rejected', label: 'Odrzuć', icon: XCircle },
                { status: 'draft', label: 'Wróć do szkicu', icon: Edit }
            ],
            approved: [
                { status: 'published', label: 'Publikuj', icon: CheckCircle },
                { status: 'draft', label: 'Wróć do szkicu', icon: Edit }
            ],
            published: [
                { status: 'archived', label: 'Archiwizuj', icon: Archive },
                { status: 'draft', label: 'Cofnij', icon: Edit }
            ],
            rejected: [{ status: 'draft', label: 'Wróć do szkicu', icon: Edit }],
            archived: [{ status: 'draft', label: 'Przywróć', icon: Edit }]
        }
        return map[status] || []
    }

    return (
        <tr className={cn('hover:bg-gray-50 dark:hover:bg-gray-800', isSelected && 'bg-blue-50 dark:bg-blue-900/20')}>
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="w-4 h-4 rounded"
                />
            </td>

            <td className="px-4 py-3">
                <div className="max-w-md">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {question.question_text}
                    </p>
                    {question.legal_basis && (
                        <p className="text-sm text-gray-500 mt-0.5">{question.legal_basis}</p>
                    )}
                </div>
            </td>

            <td className="px-4 py-3">
                {question.category?.name || (
                    <span className="text-gray-400 italic">Brak</span>
                )}
            </td>

            <td className="px-4 py-3">
                <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
                    statusConfig.color
                )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                </span>
            </td>

            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-1.5 h-4 rounded-full',
                                i < question.difficulty ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                            )}
                        />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {question.difficulty}/10
                    </span>
                </div>
            </td>

            <td className="px-4 py-3 text-sm text-gray-500">
                {format(new Date(question.created_at), 'd MMM yyyy', { locale: pl })}
            </td>

            <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                    onClick={() => { setShowMenu(false); onPreview() }}
                                >
                                    <Eye className="w-4 h-4" /> Podgląd
                                </button>
                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                    onClick={() => { setShowMenu(false); onEdit() }}
                                >
                                    <Edit className="w-4 h-4" /> Edytuj
                                </button>

                                <div className="border-t dark:border-gray-700 my-1" />

                                {getTransitions(question.status).map((t) => (
                                    <button
                                        key={t.status}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                        onClick={() => { setShowMenu(false); onStatusChange(t.status) }}
                                    >
                                        <t.icon className="w-4 h-4" /> {t.label}
                                    </button>
                                ))}

                                <div className="border-t dark:border-gray-700 my-1" />

                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                                    onClick={() => { setShowMenu(false); onDelete() }}
                                >
                                    <Trash2 className="w-4 h-4" /> Usuń
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

// Preview komponent
function QuestionPreview({ question }: { question: any }) {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-medium text-gray-500 text-sm mb-1">Treść pytania</h4>
                <p className="text-lg">{question.question_text}</p>
            </div>

            <div>
                <h4 className="font-medium text-gray-500 text-sm mb-2">Odpowiedzi</h4>
                <div className="space-y-2">
                    {question.answers?.map((a: any) => (
                        <div
                            key={a.id}
                            className={cn(
                                'p-3 rounded-lg border',
                                question.correct_answer_ids?.includes(a.id)
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                            )}
                        >
                            <span className="font-bold mr-2">{a.id.toUpperCase()}.</span>
                            {a.text}
                            {question.correct_answer_ids?.includes(a.id) && (
                                <CheckCircle className="inline-block ml-2 w-4 h-4 text-green-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {question.explanation && (
                <div>
                    <h4 className="font-medium text-gray-500 text-sm mb-1">Wyjaśnienie</h4>
                    <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
                </div>
            )}

            {question.legal_basis && (
                <div>
                    <h4 className="font-medium text-gray-500 text-sm mb-1">Podstawa prawna</h4>
                    <p className="font-mono text-sm">{question.legal_basis}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                <div>
                    <p className="text-sm text-gray-500">Trudność</p>
                    <p className="font-medium">{question.difficulty}/10</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{question.status}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Kategoria</p>
                    <p className="font-medium">{question.category?.name || 'Brak'}</p>
                </div>
            </div>
        </div>
    )
}
