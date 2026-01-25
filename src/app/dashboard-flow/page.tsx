'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard } from '@/lib/services/user-service';
import { Loader2, Menu, ArrowLeft } from 'lucide-react';
import { DEFAULT_USER_STATS } from '@/lib/types/user';
import Link from 'next/link';

// High-Dopamine Neural Override Components
import { ExamReadinessGauge } from '@/components/dashboard/exam-readiness-gauge';
import { DopamineButton } from '@/components/dashboard/dopamine-button';
import { RetinaHeatmap } from '@/components/dashboard/retina-heatmap';
import { SocialPredatorTicker } from '@/components/dashboard/social-predator-ticker';

/**
 * HIGH-DOPAMINE DASHBOARD - "Neural Override" Mode
 * 
 * This is an experimental, aggressive dashboard design that uses
 * behavioral psychology (Loss Aversion, Completion Bias, Flow State)
 * to create habit-forming engagement.
 * 
 * Access via: /dashboard-flow
 */
export default function DopamineDashboardPage() {
    const { user, profile, loading, profileLoading } = useAuth();
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const [userRank, setUserRank] = useState<number | undefined>();
    const [totalUsers, setTotalUsers] = useState(100);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const fetchLeaderboard = useCallback(async () => {
        if (!user) return;
        try {
            const leaderboard = await getLeaderboard(50);
            setTotalUsers(Math.max(leaderboard.length, 100));
            const userIndex = leaderboard.findIndex(entry => entry.uid === user.uid);
            if (userIndex !== -1) setUserRank(userIndex + 1);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user && !loading) fetchLeaderboard();
    }, [user, loading, fetchLeaderboard]);

    const stats = profile?.stats || DEFAULT_USER_STATS;
    const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
    const examReadiness = Math.min(accuracy, 100);

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 size={48} className="animate-spin text-[var(--vapor-violet)]" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-[var(--text-primary)]">
            {/* === MINIMAL HEADER - Menu only === */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#050505]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Back to classic dashboard"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
                        Savori // Neural Training
                    </div>
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* === SLIDE-OUT MENU (Hidden by default) === */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowMenu(false)}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-64 bg-[#0A0A0A] border-l border-[var(--border-color)] p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-6">Navigation</div>
                        <nav className="space-y-4">
                            {[
                                { href: '/dashboard', label: '← Classic Dashboard' },
                                { href: '/exam', label: 'Exam Simulations' },
                                { href: '/flashcards', label: 'Flashcards' },
                                { href: '/ai', label: 'AI Assistant' },
                                { href: '/leaderboard', label: 'Leaderboard' },
                                { href: '/search', label: 'Search' },
                                { href: '/profile', label: 'Profile' },
                            ].map(link => (
                                <button
                                    key={link.href}
                                    onClick={() => {
                                        router.push(link.href);
                                        setShowMenu(false);
                                    }}
                                    className="block w-full text-left py-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* === MAIN CONTENT === */}
            <main className="pt-16 pb-8 px-4 max-w-lg mx-auto">

                {/* === SOCIAL PREDATOR TICKER === */}
                <div className="mt-4 -mx-4">
                    <SocialPredatorTicker />
                </div>

                {/* === PANIC & GLORY HEADER === */}
                <div className="mt-6">
                    <ExamReadinessGauge
                        readiness={examReadiness}
                        retentionLoss={2}
                    />
                </div>

                {/* === THE ONE BUTTON === */}
                <div className="mt-8">
                    <DopamineButton recoveryReady={stats.totalQuestions > 0} />
                </div>

                {/* === RETINA HEATMAP === */}
                <div className="mt-10">
                    <RetinaHeatmap gridSize={12} />
                </div>

                {/* === MINIMAL STATS (Condensed) === */}
                <div className="mt-8 flex justify-center gap-8 text-center">
                    <div>
                        <div className="text-2xl font-bold text-orange-400">
                            {stats.currentStreak}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">streak</div>
                    </div>
                    <div className="w-px bg-[var(--border-subtle)]" />
                    <div>
                        <div className="text-2xl font-bold text-[var(--vapor-violet)]">
                            {stats.knowledgeEquity}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">XP</div>
                    </div>
                    <div className="w-px bg-[var(--border-subtle)]" />
                    <div>
                        <div className="text-2xl font-bold text-[var(--text-primary)]">
                            #{userRank || '—'}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">rank</div>
                    </div>
                </div>

            </main>
        </div>
    );
}
