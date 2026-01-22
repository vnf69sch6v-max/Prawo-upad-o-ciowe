// src/app/admin/cms/import/page.tsx
// Strona importu Excel

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ExcelImport } from '@/components/admin/ExcelImport'

export default function ImportPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center py-8">Ładowanie...</div>}>
                    <ExcelImport />
                </Suspense>
            </div>
        </div>
    )
}
