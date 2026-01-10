'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ExamSimulator, ExamResults } from '@/components/exam';
import { BookOpen, Clock, Trophy, Target, ChevronRight, Scale, Sparkles, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ALL_KSH_QUESTIONS, getRandomQuestions, generateBalancedExam, getQuestionStats, type ExamQuestion } from '@/lib/data/ksh';
import { useAuth } from '@/hooks/use-auth';
import { saveExamResult, addActivity, updateStreak, incrementUserStats } from '@/lib/services/user-service';
import { LEGAL_DOMAINS, type LegalDomainCategory, type CommercialLawSubdomain } from '@/lib/data/legal-domains';

// Convert KSH questions to ExamSimulator format
function convertToSimulatorFormat(kshQuestions: ExamQuestion[]) {
    return kshQuestions.map(q => ({
        id: q.id,
        text: q.question,
        options: [
            { id: 'a', text: q.options.a },
            { id: 'b', text: q.options.b },
            { id: 'c', text: q.options.c },
            { id: 'd', text: q.options.d },
        ],
        correctAnswer: q.correct,
        domain: q.section,
        difficulty: q.difficulty,
        article: q.article,
        explanation: q.explanation,
    }));
}

// Real exams using KSH question bank
const KSH_EXAMS = [
    {
        id: 'ksh-quick-10',
        title: 'KSH - Quick Quiz (10 pytań)',
        description: 'Szybki test z losowych pytań z całego KSH',
        questionCount: 10,
        timeLimit: 15,
        difficulty: 'mixed' as const,
        passRate: 75,
        isPremium: false,
        icon: <Sparkles className="text-purple-400" size={24} />,
    },
    {
        id: 'ksh-standard-30',
        title: 'KSH - Standard (30 pytań)',
        description: 'Zbalansowany test: 30% łatwe, 50% średnie, 20% trudne',
        questionCount: 30,
        timeLimit: 45,
        difficulty: 'medium' as const,
        passRate: 68,
        isPremium: false,
        icon: <Scale className="text-blue-400" size={24} />,
    },
    {
        id: 'ksh-full-150',
        title: 'KSH - Symulacja Egzaminu (150 pytań)',
        description: 'Pełna symulacja egzaminu zawodowego z KSH',
        questionCount: 150,
        timeLimit: 190,
        difficulty: 'hard' as const,
        passRate: 52,
        isPremium: false,
        icon: <Trophy className="text-yellow-400" size={24} />,
    },
    {
        id: 'ksh-spolka-zoo',
        title: 'KSH - Spółka z o.o.',
        description: 'Pytania dotyczące spółki z ograniczoną odpowiedzialnością',
        questionCount: 30,
        timeLimit: 45,
        difficulty: 'medium' as const,
        passRate: 65,
        isPremium: false,
        section: 'Spółka z o.o.',
        icon: <BookOpen className="text-green-400" size={24} />,
    },
    {
        id: 'ksh-spolka-akcyjna',
        title: 'KSH - Spółka Akcyjna',
        description: 'Pytania dotyczące spółki akcyjnej',
        questionCount: 30,
        timeLimit: 45,
        difficulty: 'hard' as const,
        passRate: 58,
        isPremium: false,
        section: 'akcyjna',
        icon: <Target className="text-orange-400" size={24} />,
    },
];

type ViewState = 'list' | 'exam' | 'results';

interface ExamResultData {
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    answers: Record<string, string>;
    questions: ReturnType<typeof convertToSimulatorFormat>;
}

export default function ExamPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<ViewState>('list');
    const [selectedExam, setSelectedExam] = useState<typeof KSH_EXAMS[0] | null>(null);
    const [currentQuestions, setCurrentQuestions] = useState<ReturnType<typeof convertToSimulatorFormat>>([]);
    const [examResult, setExamResult] = useState<ExamResultData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<LegalDomainCategory>('prawo_handlowe');
    const [selectedSubdomain, setSelectedSubdomain] = useState<CommercialLawSubdomain | 'all'>('all');

    const { user, profile, refreshProfile } = useAuth();
    const userStats = profile?.stats;

    // Get stats for display
    const stats = useMemo(() => getQuestionStats(), []);

    const handleStartExam = (exam: typeof KSH_EXAMS[0]) => {
        let questions: ExamQuestion[];

        if (exam.id === 'ksh-quick-10') {
            questions = getRandomQuestions(10);
        } else if (exam.id === 'ksh-standard-30') {
            questions = generateBalancedExam(30);
        } else if (exam.id === 'ksh-full-150') {
            questions = generateBalancedExam(150);
        } else if (exam.section) {
            // Filter by section
            const filtered = ALL_KSH_QUESTIONS.filter(q =>
                q.section.toLowerCase().includes(exam.section!.toLowerCase())
            );
            // Shuffle and take required count
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            questions = shuffled.slice(0, Math.min(exam.questionCount, shuffled.length));
        } else {
            questions = getRandomQuestions(exam.questionCount);
        }

        const converted = convertToSimulatorFormat(questions);
        setCurrentQuestions(converted);
        setSelectedExam(exam);
        setView('exam');
    };

    const handleSubmitExam = async (answers: Record<string, string>) => {
        // Calculate real score
        let correctCount = 0;
        currentQuestions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });

        const totalQuestions = currentQuestions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= 60;

        // Set local result immediately for UI
        setExamResult({
            score,
            passed,
            correctAnswers: correctCount,
            totalQuestions,
            timeSpent: 0,
            answers,
            questions: currentQuestions,
        });
        setView('results');

        // Save to Firebase if user is logged in
        if (user && selectedExam) {
            setIsSaving(true);
            try {
                // Save exam result
                await saveExamResult({
                    uid: user.uid,
                    examId: selectedExam.id,
                    examTitle: selectedExam.title,
                    completedAt: new Date(),
                    score,
                    passed,
                    correctAnswers: correctCount,
                    totalQuestions,
                    timeSpent: 0,
                    questionResults: currentQuestions.map(q => ({
                        questionId: q.id,
                        userAnswer: answers[q.id] || '',
                        correctAnswer: q.correctAnswer,
                        isCorrect: answers[q.id] === q.correctAnswer,
                        article: q.article,
                    })),
                });

                // Add activity
                await addActivity({
                    uid: user.uid,
                    type: 'exam_completed',
                    title: passed ? '🎉 Egzamin zdany!' : '📝 Egzamin ukończony',
                    description: `${selectedExam.title} - ${score}% (${correctCount}/${totalQuestions})`,
                });

                // Update streak
                await updateStreak(user.uid);

                // Refresh profile to get updated stats
                await refreshProfile();

                console.log('Exam result saved to Firebase');
            } catch (error) {
                console.error('Failed to save exam result:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (view === 'exam' && selectedExam) {
        return (
            <ExamSimulator
                sessionId={`exam-${Date.now()}`}
                examTitle={selectedExam.title}
                questions={currentQuestions}
                timeLimit={selectedExam.timeLimit * 60}
                onSubmit={handleSubmitExam}
                onCancel={() => setView('list')}
            />
        );
    }

    if (view === 'results' && examResult && selectedExam) {
        // Build questionResults for review
        const questionResults = examResult.questions.map(q => ({
            id: q.id,
            question: q.text,
            options: q.options,
            userAnswer: examResult.answers[q.id] || '',
            correctAnswer: q.correctAnswer,
            isCorrect: examResult.answers[q.id] === q.correctAnswer,
            explanation: q.explanation,
            article: q.article,
        }));

        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <ExamResults
                    examTitle={selectedExam.title}
                    score={examResult.score}
                    passed={examResult.passed}
                    passingThreshold={60}
                    correctAnswers={examResult.correctAnswers}
                    totalQuestions={examResult.totalQuestions}
                    timeSpent={examResult.timeSpent}
                    questionResults={questionResults}
                    onRetry={() => {
                        handleStartExam(selectedExam);
                    }}
                    onBack={() => {
                        setView('list');
                        setExamResult(null);
                        setSelectedExam(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="exam"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: userStats?.currentStreak || 0,
                    knowledgeEquity: userStats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: userStats?.currentStreak || 0,
                        knowledgeEquity: userStats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="exam"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold">Egzaminy Prawnicze</h1>
                            <p className="text-[var(--text-muted)]">
                                Wybierz dziedzinę prawa i rozpocznij naukę
                            </p>
                        </div>

                        {/* Domain Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {LEGAL_DOMAINS.filter(d => d.subdomains.length > 0 || d.id === 'prawo_handlowe').map(domain => (
                                <button
                                    key={domain.id}
                                    onClick={() => {
                                        setSelectedDomain(domain.id);
                                        setSelectedSubdomain('all');
                                    }}
                                    className={cn(
                                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                                        selectedDomain === domain.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'
                                    )}
                                >
                                    <span>{domain.icon}</span>
                                    <span>{domain.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Subdomain Pills (for commercial law) - organized by groups */}
                        {selectedDomain === 'prawo_handlowe' && (
                            <div className="space-y-3">
                                {/* All button */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedSubdomain('all')}
                                        className={cn(
                                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                            selectedSubdomain === 'all'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'
                                        )}
                                    >
                                        Wszystkie pytania
                                    </button>
                                </div>

                                {/* KSH Groups */}
                                <div className="lex-card p-4 space-y-4">
                                    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Kodeks Spółek Handlowych</h3>

                                    {/* Ogólne */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)] w-20">Ogólne:</span>
                                        {LEGAL_DOMAINS.find(d => d.id === 'prawo_handlowe')?.subdomains
                                            .filter(sub => sub.group === 'ogolne')
                                            .map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubdomain(sub.id as CommercialLawSubdomain)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                        selectedSubdomain === sub.id
                                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                                            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white'
                                                    )}
                                                >
                                                    {sub.shortName}
                                                </button>
                                            ))}
                                    </div>

                                    {/* Spółki osobowe */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)] w-20">Osobowe:</span>
                                        {LEGAL_DOMAINS.find(d => d.id === 'prawo_handlowe')?.subdomains
                                            .filter(sub => sub.group === 'osobowe')
                                            .map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubdomain(sub.id as CommercialLawSubdomain)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                        selectedSubdomain === sub.id
                                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white'
                                                    )}
                                                >
                                                    {sub.shortName}
                                                </button>
                                            ))}
                                    </div>

                                    {/* Spółki kapitałowe */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-[var(--text-muted)] w-20">Kapitałowe:</span>
                                        {LEGAL_DOMAINS.find(d => d.id === 'prawo_handlowe')?.subdomains
                                            .filter(sub => sub.group === 'kapitalowe')
                                            .map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubdomain(sub.id as CommercialLawSubdomain)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                        selectedSubdomain === sub.id
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white'
                                                    )}
                                                >
                                                    {sub.shortName}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Inne ustawy */}
                                <div className="lex-card p-4">
                                    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Inne ustawy</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {LEGAL_DOMAINS.find(d => d.id === 'prawo_handlowe')?.subdomains
                                            .filter(sub => sub.group === 'inne')
                                            .map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubdomain(sub.id as CommercialLawSubdomain)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                        selectedSubdomain === sub.id
                                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                                            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white'
                                                    )}
                                                >
                                                    {sub.shortName}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats - Only show for KSH */}
                        {selectedDomain === 'prawo_handlowe' && (
                            <div className="lex-card bg-gradient-to-r from-purple-900/20 to-[var(--bg-card)]">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">⚖️</div>
                                    <div>
                                        <h3 className="font-semibold">Kodeks Spółek Handlowych</h3>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Baza {stats.total} pytań • Przygotuj się do egzaminu zawodowego
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <BookOpen size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Pytań w bazie</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-green-400 font-bold">{stats.byDifficulty.easy}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-400">Łatwe</p>
                                    <p className="text-xs text-[var(--text-muted)]">pytania</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-yellow-400 font-bold">{stats.byDifficulty.medium}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-400">Średnie</p>
                                    <p className="text-xs text-[var(--text-muted)]">pytania</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-red-400 font-bold">{stats.byDifficulty.hard}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-400">Trudne</p>
                                    <p className="text-xs text-[var(--text-muted)]">pytania</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Start */}
                        <div className="grid lg:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleStartExam(KSH_EXAMS[0])}
                                className="lex-card hover:border-purple-500/50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Quick Quiz</h3>
                                        <p className="text-sm text-[var(--text-muted)]">10 losowych pytań • 15 min</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStartExam(KSH_EXAMS[1])}
                                className="lex-card hover:border-blue-500/50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Scale size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Standard Test</h3>
                                        <p className="text-sm text-[var(--text-muted)]">30 pytań • 45 min</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStartExam(KSH_EXAMS[2])}
                                className="lex-card hover:border-yellow-500/50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Trophy size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Symulacja Egzaminu</h3>
                                        <p className="text-sm text-[var(--text-muted)]">100 pytań • 2.5h</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* All Exams List */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Dostępne egzaminy</h2>
                            {KSH_EXAMS.map(exam => (
                                <div
                                    key={exam.id}
                                    className="lex-card hover:border-purple-500/50 transition-all cursor-pointer"
                                    onClick={() => handleStartExam(exam)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--bg-hover)] rounded-xl flex items-center justify-center">
                                            {exam.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{exam.title}</h3>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)]">{exam.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                                                <span>{exam.questionCount} pytań</span>
                                                <span>•</span>
                                                <span>{exam.timeLimit} min</span>
                                                <span>•</span>
                                                <span className={cn(
                                                    exam.difficulty === 'mixed' && 'text-purple-400',
                                                    exam.difficulty === 'medium' && 'text-yellow-400',
                                                    exam.difficulty === 'hard' && 'text-red-400',
                                                )}>
                                                    {exam.difficulty === 'mixed' ? 'Mix' : exam.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-[var(--text-muted)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="exam" onNavigate={() => { }} />
        </div>
    );
}
