'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import {
    User, Mail, Calendar, Trophy, Flame, Target, Clock,
    BookOpen, Award, TrendingUp, Edit2, Camera, Crown,
    Shield, CheckCircle, Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: '#1a365d' }} />
                    <p className="text-[var(--text-muted)]">Ładowanie profilu...</p>
                </div>
            </div>
        );
    }

    const stats = profile?.stats;
    const accuracy = stats && stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Nieznana data';

    const isPro = profile?.subscription?.plan === 'pro' || profile?.subscription?.plan === 'premium';

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="profile"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="profile"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#1a365d] transition-colors mb-6">
                            <ArrowLeft size={20} />
                            <span>Powrót do panelu</span>
                        </Link>

                        {/* Profile Header Card */}
                        <div className="lex-card mb-6 animate-fade-in-up">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)' }}>
                                        {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    {isPro && (
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#b8860b' }}>
                                            <Crown size={16} className="text-white" />
                                        </div>
                                    )}
                                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </button>
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold">{user?.displayName || 'Student'}</h1>
                                        {isPro && (
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ background: '#b8860b' }}>
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 text-[var(--text-muted)]">
                                        <p className="flex items-center gap-2">
                                            <Mail size={16} />
                                            {user?.email || 'Brak email'}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            Dołączył: {memberSince}
                                        </p>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <Link href="/settings">
                                    <Button variant="secondary" className="flex items-center gap-2">
                                        <Edit2 size={16} />
                                        Edytuj profil
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="lex-card text-center animate-fade-in-up hover-lift" style={{ animationDelay: '100ms' }}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(184, 134, 11, 0.1)' }}>
                                    <Trophy size={24} style={{ color: '#b8860b' }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>pkt {stats?.knowledgeEquity || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Knowledge Equity</p>
                            </div>
                            <div className="lex-card text-center animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(184, 134, 11, 0.1)' }}>
                                    <Flame size={24} style={{ color: '#b8860b' }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>{stats?.currentStreak || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Dni serii</p>
                            </div>
                            <div className="lex-card text-center animate-fade-in-up hover-lift" style={{ animationDelay: '300ms' }}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                                    <Target size={24} style={{ color: '#059669' }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>{accuracy}%</p>
                                <p className="text-xs text-[var(--text-muted)]">Dokładność</p>
                            </div>
                            <div className="lex-card text-center animate-fade-in-up hover-lift" style={{ animationDelay: '400ms' }}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(26, 54, 93, 0.1)' }}>
                                    <BookOpen size={24} style={{ color: '#1a365d' }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>{stats?.totalQuestions || 0}</p>
                                <p className="text-xs text-[var(--text-muted)]">Pytań rozwiązanych</p>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Progress Card */}
                            <div className="lex-card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} style={{ color: '#1a365d' }} />
                                    Postępy nauki
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Poprawne odpowiedzi</span>
                                            <span className="font-medium" style={{ color: '#059669' }}>{stats?.correctAnswers || 0}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--bg-hover)]">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${accuracy}%`,
                                                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Najlepsza seria</span>
                                            <span className="font-medium" style={{ color: '#b8860b' }}>{stats?.longestStreak || 0} dni</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Czas nauki</span>
                                            <span className="font-medium">{Math.round((stats?.totalStudyTime || 0) / 60)} h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exams Card */}
                            <div className="lex-card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Award size={20} style={{ color: '#1a365d' }} />
                                    Egzaminy
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                                        <span className="text-[var(--text-muted)]">Ukończone egzaminy</span>
                                        <span className="font-medium">{stats?.examsCompleted || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                                        <span className="text-[var(--text-muted)]">Zdane egzaminy</span>
                                        <span className="font-medium" style={{ color: '#059669' }}>{stats?.examsPassed || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                                        <span className="text-[var(--text-muted)]">Najlepszy wynik</span>
                                        <span className="font-medium" style={{ color: '#b8860b' }}>{stats?.bestExamScore || 0}%</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-[var(--text-muted)]">Współczynnik zdawalności</span>
                                        <span className="font-medium">
                                            {stats?.examsCompleted ? Math.round((stats.examsPassed / stats.examsCompleted) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Card */}
                        <div className="lex-card animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isPro ? 'rgba(184, 134, 11, 0.1)' : 'rgba(26, 54, 93, 0.1)' }}>
                                        <Shield size={24} style={{ color: isPro ? '#b8860b' : '#1a365d' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Plan {isPro ? 'Pro' : 'Free'}
                                        </h3>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {isPro
                                                ? `Aktywny do: ${profile?.subscription?.expiresAt ? new Date(profile.subscription.expiresAt).toLocaleDateString('pl-PL') : 'Nieograniczony'}`
                                                : 'Odblokuj wszystkie funkcje'}
                                        </p>
                                    </div>
                                </div>
                                {!isPro && (
                                    <Link href="/signup">
                                        <Button className="flex items-center gap-2" style={{ background: '#1a365d' }}>
                                            <Crown size={16} />
                                            Ulepsz do Pro - 149 zł/rok
                                        </Button>
                                    </Link>
                                )}
                                {isPro && (
                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#059669' }}>
                                        <CheckCircle size={16} />
                                        Aktywna subskrypcja
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <MobileNav currentView="profile" onNavigate={() => { }} />
            </div>
        </div>
    );
}
