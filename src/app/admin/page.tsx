'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    FileQuestion,
    FolderTree,
    Users,
    Settings,
    Upload,
    BarChart3,
    Loader2,
    Shield
} from 'lucide-react';

// Admin check - should match your admin users
const ADMIN_EMAILS = ['admin@lexcapital.pl', 'mikolaj@lexcapital.pl'];

export default function AdminPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalResponses: 0
    });
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!loading && user) {
            // Check if user is admin
            const adminCheck = ADMIN_EMAILS.includes(user.email || '');
            setIsAdmin(adminCheck);

            if (adminCheck) {
                fetchStats();
            }
        }
    }, [user, loading]);

    async function fetchStats() {
        try {
            const [questionsRes, categoriesRes] = await Promise.all([
                supabase.from('questions').select('id', { count: 'exact', head: true }),
                supabase.from('categories').select('id', { count: 'exact', head: true })
            ]);

            setStats({
                totalQuestions: questionsRes.count || 0,
                totalCategories: categoriesRes.count || 0,
                totalUsers: 0, // Would need admin access
                totalResponses: 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <Shield size={64} className="mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Brak dostępu</h1>
                    <p className="text-[var(--text-muted)] mb-4">
                        Ta strona jest dostępna tylko dla administratorów.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#2d4a7c] transition-colors"
                    >
                        Wróć do Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'questions', label: 'Pytania', icon: <FileQuestion size={20} /> },
        { id: 'categories', label: 'Kategorie', icon: <FolderTree size={20} /> },
        { id: 'import', label: 'Import', icon: <Upload size={20} /> },
        { id: 'users', label: 'Użytkownicy', icon: <Users size={20} /> },
        { id: 'analytics', label: 'Analityka', icon: <BarChart3 size={20} /> },
        { id: 'settings', label: 'Ustawienia', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)] p-4">
                <div className="flex items-center gap-3 mb-8 p-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#2563eb] flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Admin Panel</h1>
                        <p className="text-xs text-[var(--text-muted)]">LexCapital Pro</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id
                                    ? 'bg-[#1a365d] text-white'
                                    : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        ← Wróć do aplikacji
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {activeTab === 'dashboard' && (
                    <DashboardTab stats={stats} />
                )}
                {activeTab === 'questions' && (
                    <QuestionsTab />
                )}
                {activeTab === 'categories' && (
                    <CategoriesTab />
                )}
                {activeTab === 'import' && (
                    <ImportTab onImportComplete={fetchStats} />
                )}
                {activeTab === 'users' && (
                    <UsersTab />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab />
                )}
            </div>
        </div>
    );
}

// Dashboard Tab
function DashboardTab({ stats }: { stats: { totalQuestions: number; totalCategories: number; totalUsers: number; totalResponses: number } }) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="lex-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Pytania</span>
                        <FileQuestion size={20} className="text-[#1a365d]" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalQuestions}</div>
                </div>
                <div className="lex-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Kategorie</span>
                        <FolderTree size={20} className="text-green-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalCategories}</div>
                </div>
                <div className="lex-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Użytkownicy</span>
                        <Users size={20} className="text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                </div>
                <div className="lex-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Odpowiedzi</span>
                        <BarChart3 size={20} className="text-orange-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalResponses}</div>
                </div>
            </div>

            <div className="lex-card">
                <h3 className="font-bold mb-4">Szybkie akcje</h3>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] transition-colors">
                        + Dodaj pytanie
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        + Dodaj kategorię
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Import z JSON
                    </button>
                </div>
            </div>
        </div>
    );
}

// Questions Tab
function QuestionsTab() {
    const [questions, setQuestions] = useState<Array<{ id: string; question_text: string; legal_area: string; difficulty: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase
                .from('questions')
                .select('id, question_text, legal_area, difficulty')
                .order('created_at', { ascending: false })
                .limit(50);
            setQuestions(data || []);
            setLoading(false);
        }
        fetch();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Pytania</h2>
                <button className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2d4a7c] transition-colors">
                    + Dodaj pytanie
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : questions.length === 0 ? (
                <div className="lex-card text-center py-12">
                    <FileQuestion size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="text-[var(--text-muted)]">Brak pytań. Dodaj pierwsze pytanie!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {questions.map(q => (
                        <div key={q.id} className="lex-card flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{q.question_text}</p>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {q.legal_area} • Trudność: {q.difficulty}/10
                                </p>
                            </div>
                            <button className="ml-4 px-3 py-1 text-sm text-[#1a365d] hover:bg-[var(--bg-hover)] rounded">
                                Edytuj
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Categories Tab
function CategoriesTab() {
    const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; legal_area: string; total_questions: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('order_index', { ascending: true });
            setCategories(data || []);
            setLoading(false);
        }
        fetch();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Kategorie</h2>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    + Dodaj kategorię
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : categories.length === 0 ? (
                <div className="lex-card text-center py-12">
                    <FolderTree size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                    <p className="text-[var(--text-muted)]">Brak kategorii. Dodaj pierwszą kategorię!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="lex-card">
                            <h3 className="font-bold mb-1">{cat.name}</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-2">{cat.legal_area}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs bg-[var(--bg-hover)] px-2 py-1 rounded">
                                    {cat.total_questions} pytań
                                </span>
                                <button className="text-sm text-[#1a365d] hover:underline">Edytuj</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Import Tab
function ImportTab({ onImportComplete }: { onImportComplete: () => void }) {
    const [jsonInput, setJsonInput] = useState('');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

    async function handleImport() {
        if (!jsonInput.trim()) return;

        try {
            setImporting(true);
            const questions = JSON.parse(jsonInput);

            if (!Array.isArray(questions)) {
                throw new Error('JSON musi być tablicą');
            }

            let success = 0;
            let errors = 0;

            for (const q of questions) {
                const { error } = await supabase.from('questions').insert({
                    question_text: q.question_text || q.text,
                    answers: q.answers || q.options,
                    correct_answer_ids: q.correct_answer_ids || [q.correctAnswer],
                    explanation: q.explanation,
                    legal_area: q.legal_area || 'civil',
                    difficulty: q.difficulty || 5,
                    is_active: true
                });

                if (error) {
                    errors++;
                } else {
                    success++;
                }
            }

            setResult({ success, errors });
            onImportComplete();
            setJsonInput('');
        } catch (err) {
            console.error('Import error:', err);
            setResult({ success: 0, errors: 1 });
        } finally {
            setImporting(false);
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Import pytań</h2>

            <div className="lex-card mb-6">
                <h3 className="font-bold mb-4">Import z JSON</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                    Wklej tablicę JSON z pytaniami. Każde pytanie powinno mieć: question_text, answers, correct_answer_ids, explanation, legal_area, difficulty.
                </p>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[{"question_text": "...", "answers": [...], ...}]'
                    className="w-full h-64 p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
                />
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={handleImport}
                        disabled={importing || !jsonInput.trim()}
                        className="px-6 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#2d4a7c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {importing ? 'Importuję...' : 'Importuj'}
                    </button>
                    {result && (
                        <span className={result.errors > 0 ? 'text-orange-500' : 'text-green-500'}>
                            ✓ {result.success} zaimportowanych, {result.errors} błędów
                        </span>
                    )}
                </div>
            </div>

            <div className="lex-card">
                <h3 className="font-bold mb-4">Format przykładowy</h3>
                <pre className="p-4 bg-[var(--bg-primary)] rounded-lg text-sm overflow-x-auto">
                    {`[
  {
    "question_text": "Jakie są przesłanki odpowiedzialności deliktowej?",
    "answers": [
      {"id": "a", "text": "Wina, szkoda, związek przyczynowy", "is_correct": true},
      {"id": "b", "text": "Tylko wina", "is_correct": false},
      {"id": "c", "text": "Tylko szkoda", "is_correct": false}
    ],
    "correct_answer_ids": ["a"],
    "explanation": "Art. 415 KC wymaga...",
    "legal_area": "civil",
    "difficulty": 5
  }
]`}
                </pre>
            </div>
        </div>
    );
}

// Placeholder tabs
function UsersTab() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Użytkownicy</h2>
            <div className="lex-card text-center py-12">
                <Users size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Zarządzanie użytkownikami wymaga dodatkowych uprawnień Supabase.</p>
            </div>
        </div>
    );
}

function AnalyticsTab() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Analityka</h2>
            <div className="lex-card text-center py-12">
                <BarChart3 size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Analityka w przygotowaniu...</p>
            </div>
        </div>
    );
}

function SettingsTab() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Ustawienia</h2>
            <div className="lex-card">
                <h3 className="font-bold mb-4">Konfiguracja aplikacji</h3>
                <p className="text-[var(--text-muted)]">Ustawienia w przygotowaniu...</p>
            </div>
        </div>
    );
}
