'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ExamSimulator, ExamResults } from '@/components/exam';
import { BookOpen, Clock, Trophy, Target, ChevronRight, Scale, Sparkles, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ALL_KSH_QUESTIONS, getRandomQuestions, generateBalancedExam, getQuestionStats, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS, getQuestionStats as getPUStats } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS, getKCRandomQuestions, getKCQuestionStats } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS, getQuestionStats as getASOStats, getRandomQuestions as getASORandomQuestions, generateBalancedExam as generateASOBalancedExam } from '@/lib/data/aso';
import { useAuth } from '@/hooks/use-auth';
import { useUserData } from '@/hooks/use-user-data';
import { saveExamResult, addActivity, updateStreak } from '@/lib/services/user-service';
import { LEGAL_DOMAINS, getDomainsWithExams, type LegalDomainCategory, type KSHSubdomain, type PrawoUpadloscioweSubdomain, type LegalSubdomain } from '@/lib/data/legal-domains';

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

// Exams configuration for each domain
const DOMAIN_EXAMS = {
    ksh: [
        {
            id: 'ksh-quick-10',
            title: 'Quick Quiz (10 pytań)',
            description: 'Szybki test z losowych pytań z całego KSH',
            questionCount: 10,
            timeLimit: 15,
            difficulty: 'mixed' as const,
            passRate: 75,
            isPremium: false,
            icon: <Sparkles className="text-[#1a365d]" size={24} />,
        },
        {
            id: 'ksh-standard-30',
            title: 'Standard (30 pytań)',
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
            title: 'Symulacja Egzaminu (150 pytań)',
            description: 'Pełna symulacja egzaminu zawodowego z KSH',
            questionCount: 150,
            timeLimit: 190,
            difficulty: 'hard' as const,
            passRate: 52,
            isPremium: false,
            icon: <Trophy className="text-yellow-400" size={24} />,
        },
    ],
    prawo_upadlosciowe: [
        {
            id: 'pu-quick-10',
            title: 'Quick Quiz (10 pytań)',
            description: 'Szybki test z losowych pytań z Prawa Upadłościowego',
            questionCount: 10,
            timeLimit: 15,
            difficulty: 'mixed' as const,
            passRate: 75,
            isPremium: false,
            icon: <Sparkles className="text-orange-400" size={24} />,
        },
        {
            id: 'pu-standard-30',
            title: 'Standard (30 pytań)',
            description: 'Zbalansowany test z Prawa Upadłościowego',
            questionCount: 30,
            timeLimit: 45,
            difficulty: 'medium' as const,
            passRate: 68,
            isPremium: false,
            icon: <Scale className="text-blue-400" size={24} />,
        },
        {
            id: 'pu-full-80',
            title: 'Pełny Test (80 pytań)',
            description: 'Wszystkie pytania z Prawa Upadłościowego',
            questionCount: 80,
            timeLimit: 120,
            difficulty: 'hard' as const,
            passRate: 60,
            isPremium: false,
            icon: <Trophy className="text-yellow-400" size={24} />,
        },
    ],
    prawo_cywilne: [
        {
            id: 'kc-quick-10',
            title: 'Quick Quiz (10 pytań)',
            description: 'Szybki test z losowych pytań z Kodeksu Cywilnego',
            questionCount: 10,
            timeLimit: 15,
            difficulty: 'mixed' as const,
            passRate: 75,
            isPremium: false,
            icon: <Sparkles className="text-blue-400" size={24} />,
        },
        {
            id: 'kc-standard-30',
            title: 'Standard (30 pytań)',
            description: 'Zbalansowany test z Kodeksu Cywilnego',
            questionCount: 30,
            timeLimit: 45,
            difficulty: 'medium' as const,
            passRate: 68,
            isPremium: false,
            icon: <Scale className="text-blue-400" size={24} />,
        },
        {
            id: 'kc-full-100',
            title: 'Pełny Test (100 pytań)',
            description: 'Duży test z Kodeksu Cywilnego',
            questionCount: 100,
            timeLimit: 150,
            difficulty: 'hard' as const,
            passRate: 60,
            isPremium: false,
            icon: <Trophy className="text-yellow-400" size={24} />,
        },
    ],
    aso: [
        {
            id: 'aso-quick-10',
            title: 'Quick Quiz (10 pytań)',
            description: 'Szybki test z pytań na Certyfikat Doradcy ASO',
            questionCount: 10,
            timeLimit: 15,
            difficulty: 'mixed' as const,
            passRate: 75,
            isPremium: false,
            icon: <Sparkles className="text-teal-400" size={24} />,
        },
        {
            id: 'aso-standard-30',
            title: 'Standard (30 pytań)',
            description: 'Zbalansowany test: 30% łatwe, 50% średnie, 20% trudne',
            questionCount: 30,
            timeLimit: 45,
            difficulty: 'medium' as const,
            passRate: 68,
            isPremium: false,
            icon: <Scale className="text-blue-400" size={24} />,
        },
        {
            id: 'aso-full-100',
            title: 'Symulacja Egzaminu (100 pytań)',
            description: 'Symulacja egzaminu na Certyfikat Doradcy ASO',
            questionCount: 100,
            timeLimit: 150,
            difficulty: 'hard' as const,
            passRate: 60,
            isPremium: false,
            icon: <Trophy className="text-yellow-400" size={24} />,
        },
    ],
};

type ViewState = 'list' | 'exam' | 'results';
type ExamType = typeof DOMAIN_EXAMS.ksh[0] | typeof DOMAIN_EXAMS.prawo_upadlosciowe[0];

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
    const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
    const [currentQuestions, setCurrentQuestions] = useState<ReturnType<typeof convertToSimulatorFormat>>([]);
    const [examResult, setExamResult] = useState<ExamResultData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<LegalDomainCategory>('ksh');
    const [selectedSubdomain, setSelectedSubdomain] = useState<LegalSubdomain | 'all'>('all');

    const { user, profile, refreshProfile } = useAuth();
    const { saveTestResult, saveWrongAnswer } = useUserData();
    const userStats = profile?.stats;

    // Get stats for current domain
    const stats = useMemo(() => {
        if (selectedDomain === 'ksh') {
            return getQuestionStats();
        } else if (selectedDomain === 'prawo_upadlosciowe') {
            return getPUStats();
        } else if (selectedDomain === 'prawo_cywilne') {
            return getKCQuestionStats();
        } else if (selectedDomain === 'aso') {
            return getASOStats();
        }
        return { total: 0, byDifficulty: { easy: 0, medium: 0, hard: 0 } };
    }, [selectedDomain]);

    // Get exams for current domain
    const currentExams = useMemo(() => {
        return DOMAIN_EXAMS[selectedDomain as keyof typeof DOMAIN_EXAMS] || [];
    }, [selectedDomain]);

    const handleStartExam = (exam: ExamType) => {
        let questions: ExamQuestion[];

        if (selectedDomain === 'ksh') {
            // KSH exams
            if (exam.id === 'ksh-quick-10') {
                questions = getRandomQuestions(10);
            } else if (exam.id === 'ksh-standard-30') {
                questions = generateBalancedExam(30);
            } else if (exam.id === 'ksh-full-150') {
                questions = generateBalancedExam(150);
            } else {
                questions = getRandomQuestions(exam.questionCount);
            }
        } else if (selectedDomain === 'prawo_upadlosciowe') {
            // Prawo Upadłościowe exams
            const allPU = ALL_PRAWO_UPADLOSCIOWE_QUESTIONS;
            const shuffled = [...allPU].sort(() => Math.random() - 0.5);
            const count = Math.min(exam.questionCount, shuffled.length);
            questions = shuffled.slice(0, count);
        } else if (selectedDomain === 'prawo_cywilne') {
            // Kodeks Cywilny exams
            questions = getKCRandomQuestions(exam.questionCount);
        } else if (selectedDomain === 'aso') {
            // ASO exams
            if (exam.id === 'aso-quick-10') {
                questions = getASORandomQuestions(10);
            } else if (exam.id === 'aso-standard-30') {
                questions = generateASOBalancedExam(30);
            } else if (exam.id === 'aso-full-100') {
                questions = generateASOBalancedExam(100);
            } else {
                questions = getASORandomQuestions(exam.questionCount);
            }
        } else {
            questions = [];
        }

        const converted = convertToSimulatorFormat(questions);
        setCurrentQuestions(converted);
        setSelectedExam(exam);
        setView('exam');
    };

    const handleSubmitExam = async (answers: Record<string, string>, timeSpent: number) => {
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
            timeSpent,
            answers,
            questions: currentQuestions,
        });
        setView('results');

        // Save to Firebase and Supabase if user is logged in
        if (user && selectedExam) {
            setIsSaving(true);
            try {
                // Prepare question results
                const questionResults = currentQuestions.map(q => ({
                    questionId: q.id,
                    userAnswer: answers[q.id] || '',
                    correctAnswer: q.correctAnswer,
                    isCorrect: answers[q.id] === q.correctAnswer,
                    article: q.article,
                }));

                // Save to Firebase
                await saveExamResult({
                    uid: user.uid,
                    examId: selectedExam.id,
                    examTitle: selectedExam.title,
                    completedAt: new Date(),
                    score,
                    passed,
                    correctAnswers: correctCount,
                    totalQuestions,
                    timeSpent,
                    questionResults,
                });

                // Save to Supabase
                await saveTestResult({
                    examId: selectedExam.id,
                    examTitle: selectedExam.title,
                    score,
                    passed,
                    correctAnswers: correctCount,
                    totalQuestions,
                    timeSpent,
                    questionResults,
                });

                // Save wrong answers to Supabase
                const wrongQuestions = currentQuestions.filter(q => answers[q.id] !== q.correctAnswer);
                for (const wq of wrongQuestions) {
                    // Determine domain from exam ID
                    const domain = selectedExam.id.startsWith('ksh') ? 'ksh' : 'prawo_upadlosciowe';
                    await saveWrongAnswer(wq.id, domain as 'ksh' | 'prawo_upadlosciowe');
                }

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

                console.log('Exam result saved to Firebase and Supabase');
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

                        {/* Domain Tabs - Only show domains with questions */}
                        <div className="flex flex-wrap gap-3">
                            {getDomainsWithExams().map(domain => (
                                <button
                                    key={domain.id}
                                    onClick={() => {
                                        setSelectedDomain(domain.id);
                                        setSelectedSubdomain('all');
                                    }}
                                    className={cn(
                                        'px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                                        selectedDomain === domain.id
                                            ? domain.id === 'ksh'
                                                ? 'bg-[#1a365d] text-white'
                                                : 'bg-orange-600 text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'
                                    )}
                                >
                                    <span className="text-xl">{domain.icon}</span>
                                    <span>{domain.name}</span>
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                        {domain.id === selectedDomain ? stats.total : domain.id === 'ksh' ? 879 : domain.id === 'prawo_cywilne' ? 774 : domain.id === 'aso' ? 1000 : 80} pytań
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* MAIN CTA - Exam Modes - NOW ON TOP */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Wybierz tryb egzaminu</h2>
                            <div className="grid lg:grid-cols-3 gap-4">
                                {currentExams.slice(0, 3).map((exam, index) => (
                                    <button
                                        key={exam.id}
                                        onClick={() => handleStartExam(exam)}
                                        className={cn(
                                            "lex-card transition-all text-left group hover:scale-[1.02]",
                                            index === 0 && "hover:border-[#1a365d]/50 hover:shadow-lg hover:shadow-purple-500/10",
                                            index === 1 && "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
                                            index === 2 && "hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
                                        )}
                                    >
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4",
                                                index === 0 && (selectedDomain === 'ksh' ? "bg-gradient-to-br from-purple-600 to-pink-600" : "bg-gradient-to-br from-orange-600 to-red-600"),
                                                index === 1 && "bg-gradient-to-br from-blue-600 to-cyan-600",
                                                index === 2 && "bg-gradient-to-br from-yellow-600 to-orange-600"
                                            )}>
                                                {index === 0 && <Play size={28} className="text-white" />}
                                                {index === 1 && <Scale size={28} className="text-white" />}
                                                {index === 2 && <Trophy size={28} className="text-white" />}
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
                                            <p className="text-sm text-[var(--text-muted)] mb-3">
                                                {exam.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="px-2 py-1 bg-[var(--bg-hover)] rounded-full">
                                                    📝 {exam.questionCount} pytań
                                                </span>
                                                <span className="px-2 py-1 bg-[var(--bg-hover)] rounded-full">
                                                    ⏱️ {exam.timeLimit} min
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="exam" onNavigate={() => { }} />
        </div>
    );
}
