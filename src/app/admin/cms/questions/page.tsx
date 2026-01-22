// src/app/admin/cms/questions/page.tsx
// Lista pytań CMS

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { QuestionsList } from '@/components/admin/QuestionsList'

export default function QuestionsListPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center py-8">Ładowanie...</div>}>
                    <QuestionsList />
                </Suspense>
            </div>
        </div>
    )
}
