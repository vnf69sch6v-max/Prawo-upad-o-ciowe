'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import {
    User, Bell, CreditCard, Shield, Palette, LogOut,
    ChevronRight, Moon, Globe, Trash2, Crown, Mail, Calendar,
    Trophy, Flame, Target, Clock, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'stats', label: 'Statystyki', icon: Trophy },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell },
    { id: 'subscription', label: 'Subskrypcja', icon: CreditCard },
    { id: 'appearance', label: 'Wygląd', icon: Palette },
];

export default function SettingsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#1a365d] mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Ładowanie profilu...</p>
                </div>
            </div>
        );
    }

    const stats = profile?.stats;
    const accuracy = stats && stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="settings"
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
                    currentView="settings"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">Ustawienia</h1>

                        <div className="grid lg:grid-cols-4 gap-6">
                            {/* Settings Nav */}
                            <div className="lg:col-span-1">
                                <nav className="space-y-1">
                                    {SETTINGS_SECTIONS.map(section => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                                                    activeSection === section.id
                                                        ? 'bg-[#1a365d]/20 text-[#1a365d]'
                                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                                )}
                                            >
                                                <Icon size={18} />
                                                <span className="font-medium">{section.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Settings Content */}
                            <div className="lg:col-span-3 space-y-6">
                                {activeSection === 'profile' && (
                                    <div className="lex-card space-y-6">
                                        <h2 className="text-lg font-semibold">Profil</h2>

                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-gradient-to-br from-#1a365d to-#b8860b rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{user?.displayName || 'Student'}</h3>
                                                <p className="text-[var(--text-muted)] flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {user?.email || 'Brak email'}
                                                </p>
                                                <p className="text-[var(--text-muted)] flex items-center gap-2 text-sm">
                                                    <Calendar size={14} />
                                                    Dołączył: {profile?.createdAt
                                                        ? new Date(profile.createdAt).toLocaleDateString('pl-PL')
                                                        : 'Nieznana data'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Imię i nazwisko</label>
                                                <input
                                                    type="text"
                                                    defaultValue={user?.displayName || ''}
                                                    placeholder="Twoje imię"
                                                    className="w-full px-4 py-2.5 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    defaultValue={user?.email || ''}
                                                    disabled
                                                    className="w-full px-4 py-2.5 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl opacity-60 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-[var(--text-muted)] mt-1">Email nie może być zmieniony</p>
                                            </div>
                                        </div>

                                        <Button>Zapisz zmiany</Button>
                                    </div>
                                )}

                                {activeSection === 'stats' && (
                                    <div className="space-y-6">
                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="lex-card text-center">
                                                <Trophy size={24} className="mx-auto mb-2 text-yellow-400" />
                                                <p className="text-2xl font-bold">pkt {stats?.knowledgeEquity || 0}</p>
                                                <p className="text-xs text-[var(--text-muted)]">Knowledge Equity</p>
                                            </div>
                                            <div className="lex-card text-center">
                                                <Flame size={24} className="mx-auto mb-2 text-orange-400" />
                                                <p className="text-2xl font-bold">{stats?.currentStreak || 0} dni</p>
                                                <p className="text-xs text-[var(--text-muted)]">Aktualna passa</p>
                                            </div>
                                            <div className="lex-card text-center">
                                                <Target size={24} className="mx-auto mb-2 text-green-400" />
                                                <p className="text-2xl font-bold">{accuracy}%</p>
                                                <p className="text-xs text-[var(--text-muted)]">Dokładność</p>
                                            </div>
                                            <div className="lex-card text-center">
                                                <Clock size={24} className="mx-auto mb-2 text-blue-400" />
                                                <p className="text-2xl font-bold">{stats?.examsCompleted || 0}</p>
                                                <p className="text-xs text-[var(--text-muted)]">Ukończone egzaminy</p>
                                            </div>
                                        </div>

                                        {/* Detailed Stats */}
                                        <div className="lex-card">
                                            <h2 className="text-lg font-semibold mb-4">Szczegóły</h2>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                                    <span className="text-[var(--text-muted)]">Wszystkie pytania</span>
                                                    <span className="font-medium">{stats?.totalQuestions || 0}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                                    <span className="text-[var(--text-muted)]">Poprawne odpowiedzi</span>
                                                    <span className="font-medium text-green-400">{stats?.correctAnswers || 0}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                                    <span className="text-[var(--text-muted)]">Zdane egzaminy</span>
                                                    <span className="font-medium text-green-400">{stats?.examsPassed || 0}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                                    <span className="text-[var(--text-muted)]">Najlepszy wynik</span>
                                                    <span className="font-medium text-yellow-400">{stats?.bestExamScore || 0}%</span>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <span className="text-[var(--text-muted)]">Najdłuższa passa</span>
                                                    <span className="font-medium text-orange-400">{stats?.longestStreak || 0} dni</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'notifications' && (
                                    <div className="lex-card space-y-6">
                                        <h2 className="text-lg font-semibold">Powiadomienia</h2>

                                        {[
                                            { label: 'Przypomnienia o nauce', desc: 'Codzienne powiadomienia o powtórkach' },
                                            { label: 'Streak alerts', desc: 'Ostrzeżenie przed utratą streak' },
                                            { label: 'Ranking updates', desc: 'Zmiany pozycji w rankingu' },
                                            { label: 'Nowe funkcje', desc: 'Informacje o aktualizacjach' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked={profile?.preferences?.notifications} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-[var(--bg-hover)] peer-focus:ring-2 peer-focus:ring-[#1a365d] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a365d]"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeSection === 'subscription' && (
                                    <div className="lex-card space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">Subskrypcja</h2>
                                            <span className={cn(
                                                "px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1",
                                                profile?.subscription?.plan === 'free'
                                                    ? "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                                                    : "bg-[#1a365d] text-white"
                                            )}>
                                                {profile?.subscription?.plan !== 'free' && <Crown size={14} />}
                                                {profile?.subscription?.plan?.toUpperCase() || 'FREE'}
                                            </span>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-xl border",
                                            profile?.subscription?.plan === 'free'
                                                ? "bg-[var(--bg-hover)] border-[var(--border-color)]"
                                                : "bg-[#1a365d]/10 border-[#1a365d]/30"
                                        )}>
                                            <p className="font-medium">
                                                LexCapital {profile?.subscription?.plan?.toUpperCase() || 'FREE'}
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {profile?.subscription?.plan === 'free'
                                                    ? 'Podstawowy dostęp - ograniczone funkcje'
                                                    : '49 PLN/miesiąc • Pełny dostęp do wszystkich funkcji'
                                                }
                                            </p>
                                        </div>

                                        {profile?.subscription?.plan === 'free' && (
                                            <Button className="w-full bg-gradient-to-r from-#1a365d to-#b8860b">
                                                <Crown size={16} className="mr-2" />
                                                Upgrade do PRO
                                            </Button>
                                        )}

                                        {profile?.subscription?.plan !== 'free' && (
                                            <div className="space-y-3">
                                                <Button variant="secondary" className="w-full justify-between">
                                                    Zarządzaj płatnością
                                                    <ChevronRight size={18} />
                                                </Button>
                                                <Button variant="ghost" className="w-full text-red-400 hover:bg-red-500/10">
                                                    Anuluj subskrypcję
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeSection === 'appearance' && (
                                    <div className="lex-card space-y-6">
                                        <h2 className="text-lg font-semibold">Wygląd</h2>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Moon size={20} />
                                                <div>
                                                    <p className="font-medium">Tryb ciemny</p>
                                                    <p className="text-sm text-[var(--text-muted)]">Zawsze włączony</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-[var(--text-muted)]">Domyślny</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Globe size={20} />
                                                <div>
                                                    <p className="font-medium">Język</p>
                                                    <p className="text-sm text-[var(--text-muted)]">Interfejs i treści</p>
                                                </div>
                                            </div>
                                            <span className="text-sm">Polski 🇵🇱</span>
                                        </div>
                                    </div>
                                )}

                                {/* Logout */}
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-400"
                                    leftIcon={<LogOut size={18} />}
                                    onClick={handleLogout}
                                >
                                    Wyloguj się
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="settings" onNavigate={() => { }} />
        </div>
    );
}
