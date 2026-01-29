'use client';

import { useState } from 'react';
import { Sidebar, MobileNav } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { SearchPageContent } from '@/components/search';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { profile } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Desktop Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: profile?.stats?.currentStreak || 0,
                    knowledgeEquity: profile?.stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Apple-style Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Search size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Wyszukiwarka</h1>
                            <p className="text-sm text-gray-500">Szukaj pytań, artykułów i przepisów</p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto pb-24 lg:pb-0">
                    <SearchPageContent />
                </main>
            </div>

            {/* Mobile Nav */}
            <MobileNav />
        </div>
    );
}
