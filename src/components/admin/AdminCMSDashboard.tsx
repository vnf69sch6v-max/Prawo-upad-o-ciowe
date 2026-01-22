'use client'

// src/components/admin/AdminCMSDashboard.tsx
// Dashboard CMS ze statystykami

import { useQuestionStats } from '@/hooks/useQuestionManagement'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    Database,
    Sparkles,
    Upload,
    ListFilter,
    PieChart
} from 'lucide-react'

export function AdminCMSDashboard() {
    const { data: stats, isLoading } = useQuestionStats()

    // Oblicz sumy
    const totalQuestions = stats?.reduce((acc: number, s: any) => acc + (s.total_questions || 0), 0) || 0
    const publishedQuestions = stats?.reduce((acc: number, s: any) => acc + (s.published || 0), 0) || 0
    const pendingReview = stats?.reduce((acc: number, s: any) => acc + (s.pending_review || 0), 0) || 0
    const drafts = stats?.reduce((acc: number, s: any) => acc + (s.drafts || 0), 0) || 0
    const rejected = stats?.reduce((acc: number, s: any) => acc + (s.rejected || 0), 0) || 0
    const withEmbedding = stats?.reduce((acc: number, s: any) => acc + (s.with_embedding || 0), 0) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">CMS - Zarządzanie treścią</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Dodawaj, edytuj i publikuj pytania
                    </p>
                </div>
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                    title="Wszystkie"
                    value={totalQuestions}
                    icon={FileText}
                    color="blue"
                />
                <StatCard
                    title="Opublikowane"
                    value={publishedQuestions}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Szkice"
                    value={drafts}
                    icon={FileText}
                    color="gray"
                />
                <StatCard
                    title="Do recenzji"
                    value={pendingReview}
                    icon={Clock}
                    color="yellow"
                    highlight={pendingReview > 0}
                />
                <StatCard
                    title="Odrzucone"
                    value={rejected}
                    icon={AlertTriangle}
                    color="red"
                />
                <StatCard
                    title="Z AI"
                    value={withEmbedding}
                    icon={Sparkles}
                    color="purple"
                />
            </div>

            {/* Szybkie akcje */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                    href="/admin/cms/questions"
                    icon={ListFilter}
                    title="Lista pytań"
                    description="Przeglądaj i edytuj wszystkie pytania"
                    color="blue"
                />
                <QuickAction
                    href="/admin/cms/questions/new"
                    icon={FileText}
                    title="Nowe pytanie"
                    description="Utwórz pytanie ręcznie"
                    color="green"
                />
                <QuickAction
                    href="/admin/cms/import"
                    icon={Upload}
                    title="Import Excel"
                    description="Zaimportuj wiele pytań naraz"
                    color="purple"
                />
                <QuickAction
                    href="/admin/cms/questions?status=pending_review"
                    icon={Clock}
                    title="Do recenzji"
                    description={`${pendingReview} pytań czeka na zatwierdzenie`}
                    color="yellow"
                    badge={pendingReview > 0 ? pendingReview : undefined}
                />
            </div>

            {/* Statystyki wg kategorii */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Pytania wg kategorii
                </h3>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Ładowanie...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Kategoria</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Wszystkie</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Opublikowane</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Szkice</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Do recenzji</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Śr. trudność</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {stats?.map((cat: any) => (
                                    <tr key={cat.category_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 font-medium">{cat.category_name}</td>
                                        <td className="px-4 py-3 text-center">{cat.total_questions}</td>
                                        <td className="px-4 py-3 text-center text-green-600">{cat.published}</td>
                                        <td className="px-4 py-3 text-center text-gray-500">{cat.drafts}</td>
                                        <td className="px-4 py-3 text-center">
                                            {cat.pending_review > 0 ? (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm">
                                                    {cat.pending_review}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">{cat.avg_difficulty || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

// Stat Card
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    highlight = false
}: {
    title: string
    value: number
    icon: any
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
    highlight?: boolean
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        gray: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }

    return (
        <Card className={`p-4 ${highlight ? 'ring-2 ring-yellow-400' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-gray-500">{title}</p>
                </div>
            </div>
        </Card>
    )
}

// Quick Action Card
function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    color,
    badge
}: {
    href: string
    icon: any
    title: string
    description: string
    color: 'blue' | 'green' | 'yellow' | 'purple'
    badge?: number
}) {
    const colors = {
        blue: 'hover:border-blue-300 dark:hover:border-blue-700',
        green: 'hover:border-green-300 dark:hover:border-green-700',
        yellow: 'hover:border-yellow-300 dark:hover:border-yellow-700',
        purple: 'hover:border-purple-300 dark:hover:border-purple-700'
    }

    return (
        <Link href={href}>
            <Card className={`p-4 cursor-pointer transition-all ${colors[color]} hover:shadow-md relative`}>
                {badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {badge}
                    </span>
                )}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
