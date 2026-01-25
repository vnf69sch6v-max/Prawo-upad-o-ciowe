'use client';

import { useState } from 'react';
import { Sidebar, MobileNav } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { SearchPageContent } from '@/components/search';

export default function SearchPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { profile } = useAuth();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex dark">
            {/* Desktop Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: profile?.stats?.currentStreak || 0,
                    knowledgeEquity: profile?.stats?.knowledgeEquity || 0
                }}
            />

            {/* Mobile Nav */}
            <MobileNav />

            {/* Main Content */}
            <main className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300 pb-20 lg:pb-0`}>
                <SearchPageContent />
            </main>
        </div>
    );
}
