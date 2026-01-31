'use client';

/**
 * App Layout with Liquid Glass Sidebar
 * Wraps authenticated pages with the auto-collapsing sidebar
 */

import { ReactNode } from 'react';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { useAuth } from '@/hooks/use-auth';

interface AppLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
    const { profile } = useAuth();
    const stats = profile?.stats;

    return (
        <>
            {showSidebar && (
                <LiquidGlassSidebar
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0
                    }}
                />
            )}
            {children}
        </>
    );
}
