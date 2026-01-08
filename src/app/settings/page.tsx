'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Button } from '@/components/ui';
import {
    User, Bell, CreditCard, Shield, Palette, LogOut,
    ChevronRight, Moon, Globe, Trash2, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell },
    { id: 'subscription', label: 'Subskrypcja', icon: CreditCard },
    { id: 'privacy', label: 'Prywatność', icon: Shield },
    { id: 'appearance', label: 'Wygląd', icon: Palette },
];

export default function SettingsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="settings"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
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
                                                        ? 'bg-purple-600/20 text-purple-400'
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
                                            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                                                👤
                                            </div>
                                            <div>
                                                <Button variant="secondary" size="sm">Zmień zdjęcie</Button>
                                                <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG. Max 5MB</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Imię i nazwisko</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Jan Kowalski"
                                                    className="w-full px-4 py-2.5 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    defaultValue="jan@example.com"
                                                    className="w-full px-4 py-2.5 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Data egzaminu</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2.5 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <Button>Zapisz zmiany</Button>
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
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-[var(--bg-hover)] peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeSection === 'subscription' && (
                                    <div className="lex-card space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">Subskrypcja</h2>
                                            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full flex items-center gap-1">
                                                <Crown size={14} />
                                                PRO
                                            </span>
                                        </div>

                                        <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl">
                                            <p className="font-medium">LexCapital PRO</p>
                                            <p className="text-sm text-[var(--text-muted)]">49 PLN/miesiąc • Odnawia się 15 lutego 2026</p>
                                        </div>

                                        <div className="space-y-3">
                                            <Button variant="secondary" className="w-full justify-between">
                                                Zarządzaj płatnością
                                                <ChevronRight size={18} />
                                            </Button>
                                            <Button variant="secondary" className="w-full justify-between">
                                                Historia faktur
                                                <ChevronRight size={18} />
                                            </Button>
                                            <Button variant="ghost" className="w-full text-red-400 hover:bg-red-500/10">
                                                Anuluj subskrypcję
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'privacy' && (
                                    <div className="lex-card space-y-6">
                                        <h2 className="text-lg font-semibold">Prywatność</h2>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Profil publiczny</p>
                                                <p className="text-sm text-[var(--text-muted)]">Widoczność w rankingu</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                                <div className="w-11 h-6 bg-[var(--bg-hover)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>

                                        <div className="pt-4 border-t border-[var(--border-color)]">
                                            <h3 className="font-medium text-red-400 mb-4">Strefa niebezpieczna</h3>
                                            <Button variant="danger" leftIcon={<Trash2 size={16} />}>
                                                Usuń konto
                                            </Button>
                                        </div>
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
                                <Button variant="ghost" className="w-full text-red-400" leftIcon={<LogOut size={18} />}>
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
