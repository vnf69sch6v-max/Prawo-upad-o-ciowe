'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { AIChat } from '@/components/ai';
import { Sparkles } from 'lucide-react';

export default function AIPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="ai"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="ai"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-4 h-full flex flex-col">
                        {/* Simple Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Asystent AI</h1>
                                    <p className="text-xs text-[var(--text-muted)]">Zapytaj o cokolwiek z prawa</p>
                                </div>
                            </div>
                            {/* Usage indicator */}
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-[var(--text-muted)]">3/5</span>
                                <div className="w-20 h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div className="h-full w-3/5 bg-[#1a365d] rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Chat takes full remaining height */}
                        <div className="flex-1 min-h-0">
                            <div className="lex-card h-full flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>
                                <AIChat />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="ai" onNavigate={() => { }} />
        </div>
    );
}
