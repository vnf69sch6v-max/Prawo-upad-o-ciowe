// src/app/admin/cms/page.tsx
// Główna strona CMS

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { AdminCMSDashboard } from '@/components/admin/AdminCMSDashboard'

export default function AdminCMSPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center py-8">Ładowanie...</div>}>
                    <AdminCMSDashboard />
                </Suspense>
            </div>
        </div>
    )
}
