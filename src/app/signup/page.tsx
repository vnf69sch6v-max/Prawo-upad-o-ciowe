'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff, Loader2, Check, X, Scale, CheckCircle, Crown } from 'lucide-react';

// Signup form component - separated to use Suspense for useSearchParams
function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signUp, signInWithGoogle, error, user, loading: authLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Check if user wants Pro plan
    const wantsPro = searchParams.get('plan') === 'pro';

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid) return;

        setLoading(true);
        try {
            await signUp(email, password, name);
            router.push('/dashboard');
        } catch {
            // Error handled by hook
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch {
            // Error handled by hook
        } finally {
            setGoogleLoading(false);
        }
    };

    // Don't show while checking auth
    if (authLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <Loader2 size={32} className="animate-spin text-[#1a365d]" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-6 sm:mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <Scale size={28} className="text-[#1a365d]" />
                        <span className="text-xl sm:text-2xl font-serif font-bold text-[#1a365d]">Savori Legal</span>
                    </Link>
                </div>

                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a365d]">Utwórz konto</h2>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">Rozpocznij przygotowania do egzaminu</p>
                </div>

                {/* Mobile Plan Badge */}
                <div className="lg:hidden mb-4">
                    <div className={cn(
                        "p-4 rounded-xl border-2 text-center",
                        wantsPro ? "bg-[#1a365d] border-[#b8860b]" : "bg-gray-50 border-gray-200"
                    )}>
                        <div className="flex items-center justify-center gap-2">
                            {wantsPro && <Crown size={16} className="text-[#b8860b]" />}
                            <span className={cn("font-semibold", wantsPro ? "text-white" : "text-gray-700")}>
                                {wantsPro ? 'Plan Pro - 149 zł/rok' : 'Plan Free'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imię i nazwisko</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#1a365d] focus:outline-none transition-colors text-base"
                                placeholder="Jan Kowalski"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#1a365d] focus:outline-none transition-colors text-base"
                                placeholder="twoj@email.pl"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hasło</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#1a365d] focus:outline-none transition-colors pr-12 text-base"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password requirements */}
                            {password && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {[
                                        { key: 'length', label: '8+ znaków' },
                                        { key: 'uppercase', label: 'Wielka litera' },
                                        { key: 'number', label: 'Cyfra' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className={cn(
                                            "flex items-center gap-1.5 text-xs px-2 py-1 rounded",
                                            passwordChecks[key as keyof typeof passwordChecks]
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        )}>
                                            {passwordChecks[key as keyof typeof passwordChecks] ? (
                                                <Check size={12} />
                                            ) : (
                                                <X size={12} />
                                            )}
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className={cn(
                                'w-full py-3 bg-[#1a365d] text-white font-medium rounded-lg transition-all',
                                'hover:bg-[#2c5282] active:scale-[0.98]',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'flex items-center justify-center gap-2'
                            )}
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                        </button>
                    </form>

                    <div className="relative my-5 sm:my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400">lub</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className={cn(
                            'w-full py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 transition-all',
                            'hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-3'
                        )}
                    >
                        {googleLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Kontynuuj z Google
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-5 sm:mt-6">
                        Masz już konto?{' '}
                        <Link href="/login" className="text-[#1a365d] hover:underline font-medium">
                            Zaloguj się
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6 px-4">
                    Rejestrując się, akceptujesz{' '}
                    <a href="#" className="underline hover:text-gray-600">Regulamin</a> i{' '}
                    <a href="#" className="underline hover:text-gray-600">Politykę prywatności</a>
                </p>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function SignupFormFallback() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <Loader2 size={32} className="animate-spin text-[#1a365d]" />
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA]">
            {/* Left Side - Pricing Info (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a365d] p-12 flex-col justify-between relative">
                {/* Logo */}
                <div>
                    <Link href="/" className="flex items-center gap-3">
                        <Scale size={28} className="text-white" />
                        <span className="text-2xl font-serif font-bold text-white">Savori Legal</span>
                    </Link>
                </div>

                {/* Pricing Cards */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white mb-2">
                            Wybierz swój plan
                        </h1>
                        <p className="text-gray-300">
                            Możesz zmienić plan w dowolnym momencie
                        </p>
                    </div>

                    {/* Free Plan */}
                    <div className="p-6 rounded-xl border-2 bg-white/5 border-white/20 hover:border-white/40 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Free</h3>
                                <p className="text-2xl font-serif font-bold text-white">0 zł</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-gray-400" />
                                3 egzaminy / miesiąc
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-gray-400" />
                                50 pytań KSH
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-6 rounded-xl border-2 relative bg-white/10 border-[#b8860b] transition-all cursor-pointer">
                        <div className="absolute -top-2 right-4 px-3 py-1 bg-[#b8860b] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <Crown size={12} />
                            POLECANY
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Pro</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-serif font-bold text-white">149 zł</p>
                                    <span className="text-gray-300">/ rok</span>
                                </div>
                            </div>
                            <div className="w-6 h-6 bg-[#b8860b] rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-[#b8860b]" />
                                <strong>Nieograniczone</strong> egzaminy
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-[#b8860b]" />
                                <strong>959+</strong> pytań
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-[#b8860b]" />
                                AI Asystent bez limitu
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-[#b8860b]" />
                                Pełna analityka
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-400">
                        * Płatność po rejestracji. 7 dni gwarancji zwrotu.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-400">
                    © 2026 Savori Legal. Wszystkie prawa zastrzeżone.
                </p>
            </div>

            {/* Right Side - Signup Form (wrapped in Suspense) */}
            <Suspense fallback={<SignupFormFallback />}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
