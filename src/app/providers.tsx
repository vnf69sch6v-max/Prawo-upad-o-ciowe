'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { FlashcardSyncInitializer } from '@/components/providers/FlashcardSyncInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 min
                retry: 1,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {/* Auto-sync flashcards on first load */}
            <FlashcardSyncInitializer />
            {children}
        </QueryClientProvider>
    )
}
