'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Timer, Zap, X, Check, Flame } from 'lucide-react';
import type { Flashcard } from '@/types';

interface SpeedRunModeProps {
    cards: Flashcard[];
    duration?: number; // in seconds, default 300 (5 min)
    onComplete: (results: SpeedRunResults) => void;
    onExit: () => void;
}

export interface SpeedRunResults {
    totalCards: number;
    correctCards: number;
    incorrectCards: number;
    score: number;
    maxCombo: number;
    timeSpent: number;
}

export function SpeedRunMode({
    cards,
    duration = 300,
    onComplete,
    onExit
}: SpeedRunModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [results, setResults] = useState<('correct' | 'incorrect')[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastAnswerTime, setLastAnswerTime] = useState(Date.now());
    const [isFinished, setIsFinished] = useState(false);

    const currentCard = cards[currentIndex];

    // Timer effect
    useEffect(() => {
        if (!isRunning || isFinished) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsFinished(true);
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, isFinished]);

    // Complete handler
    useEffect(() => {
        if (isFinished) {
            const finalResults: SpeedRunResults = {
                totalCards: results.length,
                correctCards: results.filter(r => r === 'correct').length,
                incorrectCards: results.filter(r => r === 'incorrect').length,
                score,
                maxCombo,
                timeSpent: duration - timeRemaining
            };
            onComplete(finalResults);
        }
    }, [isFinished, results, score, maxCombo, duration, timeRemaining, onComplete]);

    const startGame = () => {
        setIsRunning(true);
        setLastAnswerTime(Date.now());
    };

    const handleAnswer = useCallback((knows: boolean) => {
        if (!isRunning || isFinished) return;

        const responseTime = (Date.now() - lastAnswerTime) / 1000;
        const result: 'correct' | 'incorrect' = knows ? 'correct' : 'incorrect';

        setResults(prev => [...prev, result]);

        if (knows) {
            // Calculate score based on speed (faster = more points)
            const speedBonus = Math.max(1, Math.floor((10 - responseTime) * 5));
            const comboMultiplier = Math.min(5, 1 + combo * 0.2);
            const points = Math.floor((100 + speedBonus) * comboMultiplier);

            setScore(prev => prev + points);
            setCombo(prev => {
                const newCombo = prev + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
        } else {
            setCombo(0);
        }

        // Move to next card or show answer briefly
        setShowAnswer(true);
        setTimeout(() => {
            setShowAnswer(false);
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setLastAnswerTime(Date.now());
            } else {
                setIsFinished(true);
                setIsRunning(false);
            }
        }, 500);
    }, [isRunning, isFinished, currentIndex, cards.length, combo, maxCombo, lastAnswerTime]);

    // Keyboard controls
    useEffect(() => {
        if (!isRunning) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === '1') {
                handleAnswer(false);
            } else if (e.key === 'ArrowRight' || e.key === '2') {
                handleAnswer(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRunning, handleAnswer]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Start Screen
    if (!isRunning && !isFinished) {
        return (
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Zap size={40} className="text-white" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">Speed Run</h2>
                    <p className="text-[var(--text-muted)]">
                        Ile fiszek dasz radę w 5 minut?
                    </p>
                </div>

                <div className="lex-card space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Dostępne fiszki:</span>
                        <span className="font-medium">{cards.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Czas:</span>
                        <span className="font-medium">{formatTime(duration)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Zasady:</span>
                        <span className="font-medium">Wiem / Nie wiem</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={startGame}
                        className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                        🚀 Start!
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        );
    }

    // Game Screen
    if (isRunning && !isFinished && currentCard) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg",
                            timeRemaining <= 30 ? 'bg-red-500/20 text-red-400' : 'bg-[var(--bg-hover)]'
                        )}>
                            <Timer size={18} />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Combo */}
                        {combo >= 2 && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 animate-pulse">
                                <Flame size={16} />
                                <span className="font-bold">x{combo}</span>
                            </div>
                        )}

                        {/* Score */}
                        <div className="text-2xl font-bold text-[#1a365d]">
                            {score.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <span>Fiszka {currentIndex + 1}</span>
                    <span className="text-green-400">✓ {results.filter(r => r === 'correct').length}</span>
                    <span className="text-red-400">✗ {results.filter(r => r === 'incorrect').length}</span>
                </div>

                {/* Card */}
                <div className={cn(
                    "lex-card min-h-[250px] flex flex-col justify-center items-center text-center p-8 transition-all",
                    showAnswer && 'scale-95 opacity-70'
                )}>
                    <p className="text-xl font-medium">{currentCard.question}</p>

                    {currentCard.legalReference && (
                        <p className="mt-4 text-sm text-[var(--text-muted)]">
                            {currentCard.legalReference}
                        </p>
                    )}
                </div>

                {/* Answer Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAnswer(false)}
                        disabled={showAnswer}
                        className="p-6 rounded-2xl bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 group"
                    >
                        <X size={40} className="mx-auto mb-2 text-red-400 group-hover:scale-110 transition-transform" />
                        <p className="text-lg font-semibold text-red-400">Nie wiem</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">← lub 1</p>
                    </button>

                    <button
                        onClick={() => handleAnswer(true)}
                        disabled={showAnswer}
                        className="p-6 rounded-2xl bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all disabled:opacity-50 group"
                    >
                        <Check size={40} className="mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                        <p className="text-lg font-semibold text-green-400">Wiem</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">→ lub 2</p>
                    </button>
                </div>
            </div>
        );
    }

    return null; // Results are handled by parent via onComplete
}

// Results Screen Component (to be used by parent)
export function SpeedRunResults({ results, onPlayAgain, onExit }: {
    results: SpeedRunResults;
    onPlayAgain: () => void;
    onExit: () => void;
}) {
    const accuracy = results.totalCards > 0
        ? Math.round((results.correctCards / results.totalCards) * 100)
        : 0;

    return (
        <div className="max-w-md mx-auto text-center space-y-6">
            <div className="text-6xl">
                {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}
            </div>

            <div>
                <h2 className="text-3xl font-bold mb-2">
                    {results.score.toLocaleString()} pkt
                </h2>
                <p className="text-[var(--text-muted)]">
                    {accuracy >= 80 ? 'Niesamowity wynik!' :
                        accuracy >= 60 ? 'Dobra robota!' :
                            'Trenuj dalej!'}
                </p>
            </div>

            <div className="lex-card space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{results.totalCards}</p>
                        <p className="text-xs text-[var(--text-muted)]">Fiszki</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-400">{results.correctCards}</p>
                        <p className="text-xs text-[var(--text-muted)]">Poprawne</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-400">{results.incorrectCards}</p>
                        <p className="text-xs text-[var(--text-muted)]">Błędne</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xl font-bold">{accuracy}%</p>
                        <p className="text-xs text-[var(--text-muted)]">Dokładność</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold flex items-center justify-center gap-1">
                            <Flame size={18} className="text-orange-400" />
                            {results.maxCombo}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">Max combo</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onPlayAgain}
                    className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
                >
                    🔄 Jeszcze raz
                </button>
                <button
                    onClick={onExit}
                    className="w-full py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                    Zakończ
                </button>
            </div>
        </div>
    );
}
