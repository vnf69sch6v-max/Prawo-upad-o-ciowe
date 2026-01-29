'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Calendar, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, Play, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';

// Deadline scenario
interface DeadlineScenario {
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    deadlineDays: number;
    deadlineType: 'days' | 'weeks' | 'months';
    legalBasis: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

// Generate scenarios
const generateScenarios = (): DeadlineScenario[] => {
    const baseDate = new Date(2026, 0, 15); // 15 January 2026 (Wednesday)

    return [
        {
            id: '1',
            title: 'Termin na apelację',
            description: `Wyrok sądu I instancji został doręczony stronie w dniu ${baseDate.toLocaleDateString('pl-PL')} (środa).`,
            eventDate: baseDate,
            deadlineDays: 14,
            deadlineType: 'days',
            legalBasis: 'Art. 369 § 1 KPC',
            explanation: 'Termin na wniesienie apelacji wynosi 14 dni od doręczenia wyroku z uzasadnieniem. Termin liczy się od dnia następnego po doręczeniu.',
            difficulty: 'easy'
        },
        {
            id: '2',
            title: 'Termin na zażalenie',
            description: `Postanowienie sądu zostało doręczone stronie w dniu ${new Date(2026, 0, 17).toLocaleDateString('pl-PL')} (piątek).`,
            eventDate: new Date(2026, 0, 17),
            deadlineDays: 7,
            deadlineType: 'days',
            legalBasis: 'Art. 394 § 2 KPC',
            explanation: 'Termin na wniesienie zażalenia wynosi tydzień (7 dni). Jeśli ostatni dzień terminu przypada na sobotę lub niedzielę, termin upływa następnego dnia roboczego.',
            difficulty: 'medium'
        },
        {
            id: '3',
            title: 'Wniosek o upadłość',
            description: `Spółka stała się niewypłacalna w dniu ${new Date(2026, 0, 10).toLocaleDateString('pl-PL')} (piątek).`,
            eventDate: new Date(2026, 0, 10),
            deadlineDays: 30,
            deadlineType: 'days',
            legalBasis: 'Art. 21 ust. 1 Prawa Upadłościowego',
            explanation: 'Dłużnik jest obowiązany zgłosić wniosek o ogłoszenie upadłości nie później niż w terminie 30 dni od dnia wystąpienia podstawy do ogłoszenia upadłości.',
            difficulty: 'easy'
        },
        {
            id: '4',
            title: 'Sprzeciw od nakazu zapłaty',
            description: `Nakaz zapłaty w postępowaniu upominawczym został doręczony pozwanemu w dniu ${new Date(2026, 0, 20).toLocaleDateString('pl-PL')} (poniedziałek).`,
            eventDate: new Date(2026, 0, 20),
            deadlineDays: 14,
            deadlineType: 'days',
            legalBasis: 'Art. 502 § 1 KPC',
            explanation: 'Pozwany może wnieść sprzeciw od nakazu zapłaty w terminie dwóch tygodni od doręczenia nakazu.',
            difficulty: 'easy'
        },
        {
            id: '5',
            title: 'Termin kończący się w weekend',
            description: `Wyrok sądu I instancji został doręczony w dniu ${new Date(2026, 0, 11).toLocaleDateString('pl-PL')} (sobota).`,
            eventDate: new Date(2026, 0, 11),
            deadlineDays: 14,
            deadlineType: 'days',
            legalBasis: 'Art. 115 KC w zw. z Art. 369 § 1 KPC',
            explanation: 'Jeżeli ostatni dzień terminu przypada na sobotę lub dzień ustawowo wolny od pracy, termin upływa następnego dnia, który nie jest dniem wolnym od pracy ani sobotą.',
            difficulty: 'hard'
        },
    ];
};

const SCENARIOS = generateScenarios();

// Calculate correct deadline date
function calculateDeadline(eventDate: Date, days: number): Date {
    const deadline = new Date(eventDate);
    deadline.setDate(deadline.getDate() + days);

    // If falls on weekend, move to Monday
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek === 0) { // Sunday
        deadline.setDate(deadline.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
        deadline.setDate(deadline.getDate() + 2);
    }

    return deadline;
}

// Calendar component
function InteractiveCalendar({
    baseDate,
    selectedDate,
    onSelectDate,
    correctDate,
    showResult
}: {
    baseDate: Date;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    correctDate: Date;
    showResult: boolean;
}) {
    const [viewMonth, setViewMonth] = useState(baseDate.getMonth());
    const [viewYear, setViewYear] = useState(baseDate.getFullYear());

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

    const isEventDate = (day: number) => {
        return baseDate.getDate() === day &&
            baseDate.getMonth() === viewMonth &&
            baseDate.getFullYear() === viewYear;
    };

    const isSelectedDate = (day: number) => {
        return selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getFullYear() === viewYear;
    };

    const isCorrectDate = (day: number) => {
        return correctDate.getDate() === day &&
            correctDate.getMonth() === viewMonth &&
            correctDate.getFullYear() === viewYear;
    };

    return (
        <div className="lex-card">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => {
                        if (viewMonth === 0) {
                            setViewMonth(11);
                            setViewYear(viewYear - 1);
                        } else {
                            setViewMonth(viewMonth - 1);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-bold">{monthNames[viewMonth]} {viewYear}</h3>
                <button
                    onClick={() => {
                        if (viewMonth === 11) {
                            setViewMonth(0);
                            setViewYear(viewYear + 1);
                        } else {
                            setViewMonth(viewMonth + 1);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(viewYear, viewMonth, day);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                        <button
                            key={day}
                            onClick={() => !showResult && onSelectDate(date)}
                            disabled={showResult}
                            className={cn(
                                "h-10 rounded-lg text-sm font-medium transition-all relative",
                                isEventDate(day) && "bg-[#3b82f6] text-white",
                                isSelectedDate(day) && !showResult && "bg-[#8b5cf6] text-white",
                                showResult && isCorrectDate(day) && "bg-green-500 text-white",
                                showResult && isSelectedDate(day) && !isCorrectDate(day) && "bg-red-500 text-white",
                                !isEventDate(day) && !isSelectedDate(day) && !showResult && "hover:bg-gray-100",
                                isWeekend && !isEventDate(day) && !isSelectedDate(day) && "text-gray-400"
                            )}
                        >
                            {day}
                            {isEventDate(day) && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px]">📅</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#3b82f6]" />
                    <span>Data zdarzenia</span>
                </div>
                {selectedDate && !showResult && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#8b5cf6]" />
                        <span>Twoja odpowiedź</span>
                    </div>
                )}
                {showResult && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span>Poprawna odpowiedź</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DeadlinesPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    const currentScenario = SCENARIOS[currentScenarioIndex];
    const correctDate = calculateDeadline(currentScenario.eventDate, currentScenario.deadlineDays);

    const handleCheck = () => {
        if (!selectedDate) return;

        setShowResult(true);
        const isCorrect = selectedDate.toDateString() === correctDate.toDateString();
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const handleNext = () => {
        setSelectedDate(null);
        setShowResult(false);
        setCurrentScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
    };

    const handleReset = () => {
        setSelectedDate(null);
        setShowResult(false);
        setCurrentScenarioIndex(0);
        setScore({ correct: 0, total: 0 });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <Sidebar
                currentView="deadlines"
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
                    currentView="deadlines"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#8b5cf6' }}>
                                <Calendar size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-900">Symulator terminów</h1>
                            <p className="text-gray-500">
                                Naucz się poprawnie liczyć terminy procesowe
                            </p>
                        </div>

                        {/* Score */}
                        {score.total > 0 && (
                            <div className="flex justify-center gap-4">
                                <div className="lex-card px-6 py-3 flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span className="font-bold">{score.correct}</span>
                                    <span className="text-gray-500">poprawnych</span>
                                </div>
                                <div className="lex-card px-6 py-3 flex items-center gap-3">
                                    <span className="font-bold">{score.total}</span>
                                    <span className="text-gray-500">łącznie</span>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="lex-card px-4 py-3 flex items-center gap-2 hover:border-[#8b5cf6]/50"
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>
                            </div>
                        )}

                        {/* Scenario */}
                        <div className="lex-card">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium",
                                    currentScenario.difficulty === 'easy' && "bg-green-500/20 text-green-500",
                                    currentScenario.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                    currentScenario.difficulty === 'hard' && "bg-red-500/20 text-red-500"
                                )}>
                                    {currentScenario.difficulty === 'easy' ? '🟢 Łatwy' :
                                        currentScenario.difficulty === 'medium' ? '🟡 Średni' : '🔴 Trudny'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Scenariusz {currentScenarioIndex + 1}/{SCENARIOS.length}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold mb-4 text-gray-900">{currentScenario.title}</h2>
                            <p className="text-gray-600 mb-4">{currentScenario.description}</p>

                            <div className="p-4 bg-[#8b5cf6]/10 rounded-xl mb-4">
                                <p className="font-medium">
                                    ❓ Kiedy upływa {currentScenario.deadlineDays}-dniowy termin?
                                </p>
                            </div>

                            <p className="text-sm text-gray-500">
                                Podstawa prawna: {currentScenario.legalBasis}
                            </p>
                        </div>

                        {/* Calendar */}
                        <InteractiveCalendar
                            baseDate={currentScenario.eventDate}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            correctDate={correctDate}
                            showResult={showResult}
                        />

                        {/* Result */}
                        {showResult && (
                            <div className={cn(
                                "lex-card",
                                selectedDate?.toDateString() === correctDate.toDateString()
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-red-500/10 border-red-500/30"
                            )}>
                                <div className="flex items-center gap-3 mb-4">
                                    {selectedDate?.toDateString() === correctDate.toDateString() ? (
                                        <>
                                            <CheckCircle size={24} className="text-green-500" />
                                            <span className="text-xl font-bold text-green-500">Poprawnie!</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={24} className="text-red-500" />
                                            <span className="text-xl font-bold text-red-500">Niepoprawnie</span>
                                        </>
                                    )}
                                </div>

                                <p className="font-medium mb-2">
                                    Termin upływa: {correctDate.toLocaleDateString('pl-PL', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>

                                <div className="p-4 bg-gray-100 rounded-xl mt-4">
                                    <div className="flex items-start gap-2">
                                        <Info size={16} className="text-[#8b5cf6] mt-0.5 shrink-0" />
                                        <p className="text-sm">{currentScenario.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4">
                            {!showResult ? (
                                <button
                                    onClick={handleCheck}
                                    disabled={!selectedDate}
                                    className={cn(
                                        "flex-1 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                                        selectedDate
                                            ? "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
                                            : "bg-white text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    <Play size={20} />
                                    Sprawdź odpowiedź
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-4 rounded-xl font-medium bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-2"
                                >
                                    Następny scenariusz
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="deadlines" onNavigate={() => { }} />
        </div>
    );
}
