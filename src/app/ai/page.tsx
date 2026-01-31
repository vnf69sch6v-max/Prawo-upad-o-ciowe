'use client';

import { useState } from 'react';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { AIChat } from '@/components/ai';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AIPage() {
    const { profile } = useAuth();
    const stats = profile?.stats || { currentStreak: 0, knowledgeEquity: 0 };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
            <LiquidGlassSidebar
                userStats={{ streak: stats.currentStreak, knowledgeEquity: stats.knowledgeEquity }}
            />

            {/* Apple-style Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Asystent AI</h1>
                            <p className="text-sm text-gray-500">Zapytaj o cokolwiek z prawa</p>
                        </div>
                    </div>
                    {/* Usage indicator */}
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">3/5 zapytań</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full w-3/5 bg-purple-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="overflow-auto p-6 pb-24 lg:pb-6">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {/* Chat container */}
                    <div className="flex-1 min-h-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>
                            <AIChat />
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav currentView="ai" onNavigate={() => { }} />
        </div>
    );
}
