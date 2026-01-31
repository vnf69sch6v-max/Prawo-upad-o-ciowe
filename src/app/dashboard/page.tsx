'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { DEFAULT_USER_STATS } from '@/lib/types/user';
import { HeroGreeting, StatsRow, WeeklyChart, ActionButtons, LiquidGlassSidebar } from '@/components/liquid-glass';

/**
 * Dashboard Page - Liquid Glass V1 Compact Design
 * Centered layout, no sidebar, Apple-inspired glassmorphism
 */
export default function DashboardPage() {
    const { user, profile, loading, profileLoading } = useAuth();
    const router = useRouter();

    // Redirect to landing if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Use profile stats or defaults
    const stats = profile?.stats || DEFAULT_USER_STATS;
    const displayName = profile?.displayName || user?.displayName || 'Student';

    // Calculate study time this week (mock based on questions answered)
    const studyTimeMinutes = stats.totalQuestions * 2;
    const studyTimeFormatted = studyTimeMinutes >= 60
        ? `${Math.floor(studyTimeMinutes / 60)}h ${studyTimeMinutes % 60}m`
        : `${studyTimeMinutes}m`;

    // Calculate average score
    const avgScore = stats.totalQuestions > 0
        ? (stats.correctAnswers / stats.totalQuestions) * 5
        : 0;

    // Calculate course progress (mock percentage based on knowledge equity)
    const courseProgress = Math.min(100, Math.round((stats.knowledgeEquity / 5000) * 100));

    // Weekly data calculated from actual stats (creates a realistic trend)
    // Uses knowledge equity and questions as base, with some variation for interest
    const baseActivity = Math.max(1, Math.floor(stats.totalQuestions / 7));
    const weeklyData = [
        Math.max(1, baseActivity - 2 + (stats.currentStreak % 3)),
        Math.max(1, baseActivity + 1),
        Math.max(1, baseActivity - 1 + (stats.correctAnswers % 2)),
        Math.max(1, baseActivity + 2),
        Math.max(1, baseActivity + (stats.currentStreak > 0 ? 3 : 0)),
        Math.max(1, baseActivity + 1),
        Math.max(1, baseActivity + 2 + (stats.currentStreak > 3 ? 2 : 0))
    ];

    // Loading state
    if (loading || profileLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)'
                }}
            >
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-600">Ładowanie...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div
            className="min-h-screen"
            style={{
                background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)',
                color: '#1f2937'
            }}
        >
            {/* Auto-collapsing Sidebar */}
            <LiquidGlassSidebar
                userStats={{
                    streak: stats.currentStreak,
                    knowledgeEquity: stats.knowledgeEquity
                }}
            />
            {/* Centered Content Container */}
            <div className="max-w-[700px] mx-auto px-6 py-12">

                {/* Hero Greeting Card */}
                <HeroGreeting userName={displayName} />

                {/* Stats Row - 4 cards */}
                <StatsRow
                    tasksToday={Math.min(stats.totalQuestions, 20)}
                    courseProgress={courseProgress}
                    studyTime={studyTimeFormatted}
                    avgScore={avgScore}
                />

                {/* Weekly Trend Chart */}
                <WeeklyChart data={weeklyData} />

                {/* Action Buttons */}
                <ActionButtons />

            </div>
        </div>
    );
}
