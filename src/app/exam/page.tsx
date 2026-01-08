'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ExamSimulator, ExamResults } from '@/components/exam';
import { BookOpen, Clock, Trophy, Target, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MOCK_EXAMS = [
    {
        id: '1',
        title: 'Prawo Cywilne - Część Ogólna',
        description: 'Podstawowe pojęcia, zdolność prawna, czynności prawne',
        questionCount: 20,
        timeLimit: 30,
        difficulty: 'medium',
        passRate: 78,
        isPremium: false,
    },
    {
        id: '2',
        title: 'Postępowanie Cywilne',
        description: 'Właściwość sądu, pisma procesowe, środki odwoławcze',
        questionCount: 30,
        timeLimit: 45,
        difficulty: 'hard',
        passRate: 62,
        isPremium: false,
    },
    {
        id: '3',
        title: 'Prawo Karne - Część Szczególna',
        description: 'Przestępstwa przeciwko mieniu, życiu i zdrowiu',
        questionCount: 25,
        timeLimit: 40,
        difficulty: 'hard',
        passRate: 58,
        isPremium: true,
    },
    {
        id: '4',
        title: 'Symulacja Egzaminu Zawodowego',
        description: 'Pełna symulacja egzaminu radcowskiego/adwokackiego',
        questionCount: 100,
        timeLimit: 180,
        difficulty: 'expert',
        passRate: 45,
        isPremium: true,
    },
];

const MOCK_QUESTIONS = [
    {
        id: 'q1',
        text: 'Zdolność prawna to:',
        options: [
            { id: 'a', text: 'Zdolność do nabywania praw i zaciągania zobowiązań we własnym imieniu' },
            { id: 'b', text: 'Zdolność do bycia podmiotem praw i obowiązków' },
            { id: 'c', text: 'Zdolność do samodzielnego dokonywania czynności prawnych' },
            { id: 'd', text: 'Zdolność do ponoszenia odpowiedzialności karnej' },
        ],
        domain: 'prawo_cywilne',
        difficulty: 'easy',
    },
    {
        id: 'q2',
        text: 'Pełną zdolność do czynności prawnych nabywa się:',
        options: [
            { id: 'a', text: 'Z chwilą ukończenia 16 lat' },
            { id: 'b', text: 'Z chwilą uzyskania pełnoletności' },
            { id: 'c', text: 'Z chwilą urodzenia' },
            { id: 'd', text: 'Z chwilą ukończenia 21 lat' },
        ],
        domain: 'prawo_cywilne',
        difficulty: 'easy',
    },
    {
        id: 'q3',
        text: 'Termin przedawnienia roszczenia o naprawienie szkody wyrządzonej czynem niedozwolonym wynosi:',
        options: [
            { id: 'a', text: '3 lata od dnia, w którym poszkodowany dowiedział się o szkodzie' },
            { id: 'b', text: '6 lat od dnia powstania szkody' },
            { id: 'c', text: '10 lat od dnia zdarzenia wywołującego szkodę' },
            { id: 'd', text: '1 rok od dnia powstania szkody' },
        ],
        domain: 'prawo_cywilne',
        difficulty: 'medium',
    },
];

type ViewState = 'list' | 'exam' | 'results';

export default function ExamPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<ViewState>('list');
    const [selectedExam, setSelectedExam] = useState<typeof MOCK_EXAMS[0] | null>(null);
    const [examResult, setExamResult] = useState<{
        score: number;
        passed: boolean;
        correctAnswers: number;
        totalQuestions: number;
        timeSpent: number;
    } | null>(null);

    const handleStartExam = (exam: typeof MOCK_EXAMS[0]) => {
        if (exam.isPremium) {
            alert('Ta funkcja wymaga subskrypcji PRO');
            return;
        }
        setSelectedExam(exam);
        setView('exam');
    };

    const handleSubmitExam = (answers: Record<string, string>) => {
        // Simulate scoring
        const correctCount = Math.floor(Object.keys(answers).length * 0.7);
        const totalQuestions = MOCK_QUESTIONS.length;
        const score = Math.round((correctCount / totalQuestions) * 100);

        setExamResult({
            score,
            passed: score >= 60,
            correctAnswers: correctCount,
            totalQuestions,
            timeSpent: 245,
        });
        setView('results');
    };

    if (view === 'exam' && selectedExam) {
        return (
            <ExamSimulator
                sessionId="demo-session"
                examTitle={selectedExam.title}
                questions={MOCK_QUESTIONS}
                timeLimit={selectedExam.timeLimit * 60}
                onSubmit={handleSubmitExam}
                onCancel={() => setView('list')}
            />
        );
    }

    if (view === 'results' && examResult && selectedExam) {
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
                    onRetry={() => setView('exam')}
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
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="exam"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold">Egzaminy</h1>
                            <p className="text-[var(--text-muted)]">Sprawdź swoją wiedzę i przygotuj się do egzaminu</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <BookOpen size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">24</p>
                                    <p className="text-xs text-[var(--text-muted)]">Ukończone egzaminy</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Trophy size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">78%</p>
                                    <p className="text-xs text-[var(--text-muted)]">Średni wynik</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Target size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">18</p>
                                    <p className="text-xs text-[var(--text-muted)]">Zdanych</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Clock size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">12h</p>
                                    <p className="text-xs text-[var(--text-muted)]">Czas nauki</p>
                                </div>
                            </div>
                        </div>

                        {/* Exams List */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Dostępne egzaminy</h2>
                            {MOCK_EXAMS.map(exam => (
                                <div
                                    key={exam.id}
                                    className={cn(
                                        'lex-card hover:border-purple-500/50 transition-all cursor-pointer',
                                        exam.isPremium && 'opacity-75'
                                    )}
                                    onClick={() => handleStartExam(exam)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{exam.title}</h3>
                                                {exam.isPremium && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                                        <Lock size={10} />
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)]">{exam.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                                                <span>{exam.questionCount} pytań</span>
                                                <span>•</span>
                                                <span>{exam.timeLimit} min</span>
                                                <span>•</span>
                                                <span className={cn(
                                                    exam.difficulty === 'easy' && 'text-green-400',
                                                    exam.difficulty === 'medium' && 'text-yellow-400',
                                                    exam.difficulty === 'hard' && 'text-orange-400',
                                                    exam.difficulty === 'expert' && 'text-red-400'
                                                )}>
                                                    {exam.difficulty}
                                                </span>
                                                <span>•</span>
                                                <span>{exam.passRate}% zdawalność</span>
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
