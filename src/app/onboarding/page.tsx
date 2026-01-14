'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui';
import {
    BookOpen, Target, Clock, ArrowRight, Check,
    Scale, Briefcase, GraduationCap, Sparkles, Loader2
} from 'lucide-react';
import { saveOnboardingData } from '@/lib/services/user-service';
import { OnboardingData } from '@/lib/types/user';
import { cn } from '@/lib/utils/cn';
import { Confetti } from '@/components/ui/confetti';

interface Step {
    id: string;
    title: string;
    subtitle: string;
}

const STEPS: Step[] = [
    { id: 'welcome', title: 'Witaj w Savori Legal!', subtitle: 'Przygotujmy Twoje doświadczenie nauki' },
    { id: 'goal', title: 'Jaki jest Twój cel?', subtitle: 'Pomoże nam to dostosować materiały' },
    { id: 'domain', title: 'Wybierz dziedziny prawa', subtitle: 'Możesz wybrać więcej niż jedną' },
    { id: 'pace', title: 'Twój dzienny cel', subtitle: 'Ile czasu chcesz poświęcać na naukę?' },
    { id: 'ready', title: 'Wszystko gotowe!', subtitle: 'Rozpocznij swoją przygodę z prawem' },
];

const GOALS = [
    { id: 'radcowski', label: 'Egzamin radcowski', icon: Scale, description: 'Przygotowanie do egzaminu na aplikację radcowską' },
    { id: 'adwokacki', label: 'Egzamin adwokacki', icon: Briefcase, description: 'Przygotowanie do egzaminu na aplikację adwokacką' },
    { id: 'student', label: 'Studia prawnicze', icon: GraduationCap, description: 'Nauka na egzaminy uczelniane' },
    { id: 'other', label: 'Inne', icon: Sparkles, description: 'Ogólne poszerzanie wiedzy prawniczej' },
];

const DOMAINS = [
    { id: 'ksh', label: 'Prawo handlowe (KSH)', questions: 500 },
    { id: 'upadlosciowe', label: 'Prawo upadłościowe', questions: 320 },
];

const PACE_OPTIONS = [
    { id: 15, label: '15 min/dzień', description: 'Spokojne tempo' },
    { id: 30, label: '30 min/dzień', description: 'Regularna nauka' },
    { id: 60, label: '60 min/dzień', description: 'Intensywne przygotowanie' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState<OnboardingData['goal'] | null>(null);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedPace, setSelectedPace] = useState<number>(30);
    const [saving, setSaving] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Redirect if already completed onboarding
    useEffect(() => {
        if (!authLoading && profile?.onboardingCompleted) {
            router.push('/dashboard');
        }
    }, [profile, authLoading, router]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const toggleDomain = (domainId: string) => {
        setSelectedDomains(prev =>
            prev.includes(domainId)
                ? prev.filter(id => id !== domainId)
                : [...prev, domainId]
        );
    };

    const canProceed = () => {
        switch (STEPS[currentStep].id) {
            case 'goal': return !!selectedGoal;
            case 'domain': return selectedDomains.length > 0;
            default: return true;
        }
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            // Show confetti when reaching ready step
            if (STEPS[currentStep + 1].id === 'ready') {
                setShowConfetti(true);
            }
        } else {
            // Save preferences and redirect
            if (user && selectedGoal) {
                setSaving(true);
                try {
                    await saveOnboardingData(user.uid, {
                        goal: selectedGoal,
                        domains: selectedDomains,
                        dailyGoal: selectedPace,
                    });
                    router.push('/dashboard');
                } catch (error) {
                    console.error('Error saving onboarding data:', error);
                    router.push('/dashboard');
                }
            } else {
                router.push('/dashboard');
            }
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    const step = STEPS[currentStep];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Progress bar */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full transition-all duration-500"
                    style={{
                        width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                        background: 'linear-gradient(90deg, #1a365d 0%, #2c5282 100%)'
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    {/* Step indicator */}
                    <div className="flex justify-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.id}
                                className={cn(
                                    'w-2 h-2 rounded-full transition-all',
                                    i === currentStep ? 'w-8 bg-[#1a365d]' : i < currentStep ? 'bg-[#1a365d]' : 'bg-gray-300'
                                )}
                            />
                        ))}
                    </div>

                    {/* Step content */}
                    <div className="text-center mb-8 animate-fade-in-up">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a365d' }}>{step.title}</h1>
                        <p className="text-gray-600">{step.subtitle}</p>
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {/* Welcome step */}
                        {step.id === 'welcome' && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)' }}>
                                    S
                                </div>
                                <p className="text-lg text-gray-700 max-w-md mx-auto">
                                    Savori Legal pomoże Ci opanować prawo i zdać egzamin za pierwszym razem.
                                    Kilka pytań pomoże nam dostosować naukę do Twoich potrzeb.
                                </p>
                            </div>
                        )}

                        {/* Goal step */}
                        {step.id === 'goal' && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {GOALS.map(goal => {
                                    const Icon = goal.icon;
                                    const isSelected = selectedGoal === goal.id;
                                    return (
                                        <button
                                            key={goal.id}
                                            onClick={() => setSelectedGoal(goal.id as OnboardingData['goal'])}
                                            className={cn(
                                                'p-6 rounded-xl border-2 text-left transition-all hover-lift',
                                                isSelected
                                                    ? 'border-[#1a365d] bg-[#1a365d]/5'
                                                    : 'border-gray-200 bg-white hover:border-[#1a365d]/30'
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    'w-12 h-12 rounded-lg flex items-center justify-center',
                                                    isSelected ? 'bg-[#1a365d] text-white' : 'bg-gray-100 text-gray-600'
                                                )}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{goal.label}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <Check size={20} style={{ color: '#1a365d' }} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Domain step */}
                        {step.id === 'domain' && (
                            <div className="space-y-4">
                                {DOMAINS.map(domain => {
                                    const isSelected = selectedDomains.includes(domain.id);
                                    return (
                                        <button
                                            key={domain.id}
                                            onClick={() => toggleDomain(domain.id)}
                                            className={cn(
                                                'w-full p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 hover-lift',
                                                isSelected
                                                    ? 'border-[#1a365d] bg-[#1a365d]/5'
                                                    : 'border-gray-200 bg-white hover:border-[#1a365d]/30'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-12 h-12 rounded-lg flex items-center justify-center',
                                                isSelected ? 'bg-[#1a365d] text-white' : 'bg-gray-100 text-gray-600'
                                            )}>
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{domain.label}</p>
                                                <p className="text-sm text-gray-500">{domain.questions}+ pytań egzaminacyjnych</p>
                                            </div>
                                            <div className={cn(
                                                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                                isSelected ? 'bg-[#1a365d] border-[#1a365d]' : 'border-gray-300'
                                            )}>
                                                {isSelected && <Check size={14} className="text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pace step */}
                        {step.id === 'pace' && (
                            <div className="grid sm:grid-cols-3 gap-4">
                                {PACE_OPTIONS.map(pace => {
                                    const isSelected = selectedPace === pace.id;
                                    return (
                                        <button
                                            key={pace.id}
                                            onClick={() => setSelectedPace(pace.id)}
                                            className={cn(
                                                'p-6 rounded-xl border-2 text-center transition-all hover-lift',
                                                isSelected
                                                    ? 'border-[#1a365d] bg-[#1a365d]/5'
                                                    : 'border-gray-200 bg-white hover:border-[#1a365d]/30'
                                            )}
                                        >
                                            <Clock size={32} className={cn('mx-auto mb-3', isSelected ? 'text-[#1a365d]' : 'text-gray-400')} />
                                            <p className="font-semibold text-gray-900">{pace.label}</p>
                                            <p className="text-sm text-gray-500 mt-1">{pace.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Ready step - Premium celebration */}
                        {step.id === 'ready' && (
                            <>
                                <Confetti active={showConfetti} duration={4000} particleCount={80} />
                                <div className="text-center py-8">
                                    {/* Glassmorphism celebration card */}
                                    <div className="relative max-w-md mx-auto p-8 rounded-3xl mb-8" style={{
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 25px 50px -12px rgba(26, 54, 93, 0.25)'
                                    }}>
                                        {/* Animated celebration icon */}
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-celebration" style={{
                                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                            boxShadow: '0 10px 40px rgba(5, 150, 105, 0.3)'
                                        }}>
                                            <Check size={48} className="text-white" strokeWidth={3} />
                                        </div>

                                        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a365d' }}>
                                            🎉 Gratulacje!
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            Twoje konto jest w pełni skonfigurowane. Jesteś gotowy do nauki!
                                        </p>

                                        {/* Selected options display */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="text-gray-500">Cel:</span>
                                                <span className="font-semibold" style={{ color: '#1a365d' }}>
                                                    {GOALS.find(g => g.id === selectedGoal)?.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                {selectedDomains.map(id => (
                                                    <span key={id} className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg" style={{
                                                        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)'
                                                    }}>
                                                        📚 {DOMAINS.find(d => d.id === id)?.label}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="px-4 py-2 rounded-full text-sm font-medium shadow-lg" style={{
                                                    background: 'linear-gradient(135deg, #b8860b 0%, #d4a418 100%)',
                                                    color: 'white'
                                                }}>
                                                    ⏱️ {selectedPace} min dziennie
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Motivational quote */}
                                    <p className="text-sm text-gray-500 italic max-w-sm mx-auto">
                                        "Droga do sukcesu zaczyna się od pierwszego kroku. Zacznij już dziś!"
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center mt-12">
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || saving}
                            className="px-8 py-4 text-lg flex items-center gap-2"
                            style={{ background: '#1a365d' }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Zapisywanie...
                                </>
                            ) : step.id === 'ready' ? (
                                <>
                                    Rozpocznij naukę
                                    <Sparkles size={20} />
                                </>
                            ) : (
                                <>
                                    Dalej
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
