'use client';

import { useState, useEffect } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Zap, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SAMPLE_EXAM_QUESTIONS, shuffleQuestions, type ExamQuestion } from '@/lib/data';

const QUIZ_LENGTH = 5;

export default function QuickQuizPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [quizState, setQuizState] = useState<'intro' | 'active' | 'results'>('intro');
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);

    const startQuiz = () => {
        const shuffled = shuffleQuestions(SAMPLE_EXAM_QUESTIONS).slice(0, QUIZ_LENGTH);
        setQuestions(shuffled);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setResults([]);
        setStartTime(new Date());
        setQuizState('active');
    };

    const handleAnswer = (optionId: string) => {
        if (showAnswer) return;
        setSelectedAnswer(optionId);
        setShowAnswer(true);

        const isCorrect = optionId === questions[currentIndex].correctOptionId;
        setResults(prev => [...prev, { questionId: questions[currentIndex].id, correct: isCorrect }]);
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
        } else {
            setQuizState('results');
        }
    };

    const currentQuestion = questions[currentIndex];
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="quick-quiz"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="quick-quiz"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6 flex items-center justify-center">
                    {quizState === 'intro' && (
                        <div className="max-w-md text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Zap size={40} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-4">Quick Quiz</h1>
                            <p className="text-[var(--text-muted)] mb-8">
                                {QUIZ_LENGTH} losowych pytań. Sprawdź swoją wiedzę w kilka minut!
                            </p>
                            <button
                                onClick={startQuiz}
                                className="btn btn-primary px-8 py-4 text-lg"
                            >
                                Rozpocznij Quiz
                            </button>
                        </div>
                    )}

                    {quizState === 'active' && currentQuestion && (
                        <div className="max-w-2xl w-full">
                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Pytanie {currentIndex + 1} z {questions.length}</span>
                                    <span className="text-[var(--text-muted)]">{correctCount}/{results.length} poprawnych</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="lex-card mb-6">
                                <span className={cn(
                                    'inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4',
                                    currentQuestion.difficulty === 'easy' && 'bg-green-500/20 text-green-400',
                                    currentQuestion.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                    currentQuestion.difficulty === 'hard' && 'bg-red-500/20 text-red-400'
                                )}>
                                    {currentQuestion.difficulty}
                                </span>
                                <h2 className="text-xl font-semibold leading-relaxed">
                                    {currentQuestion.text}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-6">
                                {currentQuestion.options.map((option) => {
                                    const isSelected = selectedAnswer === option.id;
                                    const isCorrect = option.id === currentQuestion.correctOptionId;

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(option.id)}
                                            disabled={showAnswer}
                                            className={cn(
                                                'w-full p-4 rounded-xl border text-left transition-all',
                                                !showAnswer && 'hover:border-purple-500/50 hover:bg-[var(--bg-hover)]',
                                                !showAnswer && 'bg-[var(--bg-card)] border-[var(--border-color)]',
                                                showAnswer && isCorrect && 'bg-green-500/20 border-green-500 text-green-400',
                                                showAnswer && isSelected && !isCorrect && 'bg-red-500/20 border-red-500 text-red-400',
                                                showAnswer && !isSelected && !isCorrect && 'opacity-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center font-semibold">
                                                    {option.id.toUpperCase()}
                                                </span>
                                                <span className="flex-1">{option.text}</span>
                                                {showAnswer && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                                                {showAnswer && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation & Next */}
                            {showAnswer && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)]">
                                        <p className="text-sm text-[var(--text-muted)] mb-2">Wyjaśnienie:</p>
                                        <p>{currentQuestion.explanation}</p>
                                        <p className="text-sm text-purple-400 mt-2">{currentQuestion.legalReference}</p>
                                    </div>
                                    <button onClick={nextQuestion} className="btn btn-primary w-full">
                                        {currentIndex < questions.length - 1 ? 'Następne pytanie' : 'Zobacz wyniki'}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {quizState === 'results' && (
                        <div className="max-w-md text-center">
                            <div className={cn(
                                'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
                                accuracy >= 80 && 'bg-green-500/20',
                                accuracy >= 50 && accuracy < 80 && 'bg-yellow-500/20',
                                accuracy < 50 && 'bg-red-500/20'
                            )}>
                                <span className={cn(
                                    'text-4xl font-bold',
                                    accuracy >= 80 && 'text-green-400',
                                    accuracy >= 50 && accuracy < 80 && 'text-yellow-400',
                                    accuracy < 50 && 'text-red-400'
                                )}>
                                    {accuracy}%
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">
                                {accuracy >= 80 ? 'Świetny wynik! 🎉' : accuracy >= 50 ? 'Dobra robota! 💪' : 'Nie poddawaj się! 📚'}
                            </h1>
                            <p className="text-[var(--text-muted)] mb-6">
                                {correctCount} z {questions.length} poprawnych odpowiedzi
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="lex-card text-center">
                                    <Clock size={24} className="mx-auto mb-2 text-blue-400" />
                                    <p className="text-2xl font-bold">
                                        {startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0}s
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">Czas</p>
                                </div>
                                <div className="lex-card text-center">
                                    <Zap size={24} className="mx-auto mb-2 text-yellow-400" />
                                    <p className="text-2xl font-bold">+{correctCount * 10}</p>
                                    <p className="text-xs text-[var(--text-muted)]">XP zdobyte</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button onClick={startQuiz} className="btn btn-primary w-full">
                                    Zagraj ponownie
                                </button>
                                <button onClick={() => setQuizState('intro')} className="btn btn-secondary w-full">
                                    Powrót
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <MobileNav currentView="exam" onNavigate={() => { }} />
        </div>
    );
}
