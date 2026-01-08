'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { StatCard, PerformanceChart } from '@/components/dashboard';

// Mock data for development
const MOCK_STATS = {
  knowledgeEquity: 12000,
  retentionIndex: 87,
  accuracy: 92,
  streak: 12,
  longestStreak: 28,
  totalStudyTime: 4200,
  totalQuestionsAnswered: 1847,
  totalFlashcardsReviewed: 892,
  lastStudyDate: new Date(),
  rank: 32,
};

const MOCK_HISTORY = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
  }),
  value: 8000 + Math.floor(Math.random() * 4000) + i * 200,
}));

type View =
  | 'dashboard'
  | 'flashcards'
  | 'exam'
  | 'ai'
  | 'leaderboard'
  | 'practice'
  | 'weakareas'
  | 'customdecks'
  | 'results'
  | 'performance'
  | 'timetracker'
  | 'predictions'
  | 'analyzer'
  | 'generator'
  | 'groups'
  | 'forum';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const stats = MOCK_STATS;

  const handleNavigate = (view: string) => setCurrentView(view as View);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userStats={{ streak: stats.streak, knowledgeEquity: stats.knowledgeEquity }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userStats={stats}
          currentView={currentView}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Knowledge Equity"
                    value={stats.knowledgeEquity}
                    prefix="€"
                    change={12}
                    trend="up"
                    icon="💰"
                  />
                  <StatCard
                    label="Retention Index"
                    value={stats.retentionIndex}
                    suffix="%"
                    change={3}
                    trend="up"
                    icon="🧠"
                  />
                  <StatCard
                    label="Accuracy"
                    value={stats.accuracy}
                    suffix="%"
                    change={-2}
                    trend="down"
                    icon="🎯"
                  />
                  <StatCard
                    label="Streak"
                    value={`${stats.streak} dni`}
                    icon="🔥"
                    trend="neutral"
                  />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <PerformanceChart data={MOCK_HISTORY} target={15000} />

                  {/* Quick Actions */}
                  <div className="lex-card">
                    <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleNavigate('flashcards')}
                        className="p-4 bg-[var(--bg-hover)] hover:bg-purple-600/20 border border-[var(--border-color)] hover:border-purple-500/50 rounded-xl transition-all text-left"
                      >
                        <span className="text-2xl mb-2 block">📚</span>
                        <span className="font-medium">Study Flashcards</span>
                        <p className="text-xs text-[var(--text-muted)] mt-1">15 cards due</p>
                      </button>
                      <button
                        onClick={() => handleNavigate('exam')}
                        className="p-4 bg-[var(--bg-hover)] hover:bg-purple-600/20 border border-[var(--border-color)] hover:border-purple-500/50 rounded-xl transition-all text-left"
                      >
                        <span className="text-2xl mb-2 block">📋</span>
                        <span className="font-medium">Quick Quiz</span>
                        <p className="text-xs text-[var(--text-muted)] mt-1">10 questions</p>
                      </button>
                      <button
                        onClick={() => handleNavigate('ai')}
                        className="p-4 bg-[var(--bg-hover)] hover:bg-purple-600/20 border border-[var(--border-color)] hover:border-purple-500/50 rounded-xl transition-all text-left"
                      >
                        <span className="text-2xl mb-2 block">🤖</span>
                        <span className="font-medium">AI Assistant</span>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Ask anything</p>
                      </button>
                      <button
                        onClick={() => handleNavigate('weakareas')}
                        className="p-4 bg-[var(--bg-hover)] hover:bg-purple-600/20 border border-[var(--border-color)] hover:border-purple-500/50 rounded-xl transition-all text-left"
                      >
                        <span className="text-2xl mb-2 block">🎯</span>
                        <span className="font-medium">Weak Areas</span>
                        <p className="text-xs text-[var(--text-muted)] mt-1">3 domains need work</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Today's Progress */}
                <div className="lex-card">
                  <h3 className="text-lg font-semibold mb-4">📊 Today&apos;s Progress</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-purple-400">47</p>
                      <p className="text-sm text-[var(--text-muted)]">Cards Reviewed</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-400">89%</p>
                      <p className="text-sm text-[var(--text-muted)]">Accuracy Today</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-orange-400">1h 23m</p>
                      <p className="text-sm text-[var(--text-muted)]">Study Time</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--text-muted)]">Daily Goal</span>
                      <span className="font-medium">73%</span>
                    </div>
                    <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                        style={{ width: '73%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other views */}
            {currentView !== 'dashboard' && (
              <div className="lex-card animate-fade-in">
                <div className="text-center py-16">
                  <span className="text-6xl mb-4 block">🚧</span>
                  <h2 className="text-2xl font-bold mb-2 capitalize">
                    {currentView.replace(/([A-Z])/g, ' $1')}
                  </h2>
                  <p className="text-[var(--text-muted)] mb-6">
                    Ta funkcja jest w trakcie rozwoju
                  </p>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="btn btn-secondary"
                  >
                    ← Wróć do Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="hidden lg:block border-t border-[var(--border-color)] p-4 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            LexCapital Pro © 2025 • Premium Legal Education Platform
          </p>
        </footer>
      </div>

      {/* Mobile Navigation */}
      <MobileNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}
