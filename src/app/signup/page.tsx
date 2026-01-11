'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff, Loader2, Check, X, Scale, CheckCircle, Sparkles, Crown } from 'lucide-react';

// Prevent static generation - requires Firebase which needs runtime env vars
export const dynamic = 'force-dynamic';

export default function SignupPage() {
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
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Left Side - Pricing Info */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900/40 to-pink-900/20 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-60 h-60 bg-pink-600/20 rounded-full blur-[100px]" />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <Scale size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">LexCapital</span>
                    </Link>
                </div>

                {/* Pricing Cards */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Wybierz swój plan
                        </h1>
                        <p className="text-gray-400">
                            Możesz zmienić plan w dowolnym momencie
                        </p>
                    </div>

                    {/* Free Plan */}
                    <div className={cn(
                        "p-6 rounded-2xl border transition-all cursor-pointer",
                        !wantsPro
                            ? "bg-white/10 border-purple-500"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                    )}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Free</h3>
                                <p className="text-2xl font-bold text-white">0 zł</p>
                            </div>
                            {!wantsPro && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-gray-500" />
                                3 egzaminy / miesiąc
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-gray-500" />
                                50 pytań KSH
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className={cn(
                        "p-6 rounded-2xl border relative transition-all cursor-pointer",
                        wantsPro
                            ? "bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500"
                            : "bg-white/5 border-white/10 hover:border-purple-500/50"
                    )}>
                        <div className="absolute -top-2 right-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <Crown size={12} />
                            POLECANY
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Pro</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-white">149 zł</p>
                                    <span className="text-gray-400">/ rok</span>
                                </div>
                            </div>
                            {wantsPro && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-purple-400" />
                                <strong>Nieograniczone</strong> egzaminy
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-purple-400" />
                                <strong>959+</strong> pytań
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-purple-400" />
                                AI Asystent
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <CheckCircle size={14} className="text-purple-400" />
                                Pełna analityka
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-500">
                        * Płatność po rejestracji. 7 dni gwarancji zwrotu.
                    </p>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-sm text-gray-500">
                    © 2026 LexCapital. Wszystkie prawa zastrzeżone.
                </p>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Scale size={24} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">LexCapital</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300 mb-4">
                            <Sparkles size={14} />
                            Darmowe konto
                        </div>
                        <h2 className="text-2xl font-bold text-white">Utwórz konto</h2>
                        <p className="text-gray-400 mt-2">Rozpocznij przygotowania do egzaminu</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Imię i nazwisko</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="Jan Kowalski"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="twoj@email.pl"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Hasło</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password requirements */}
                                {password && (
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        {[
                                            { key: 'length', label: '8+ znaków' },
                                            { key: 'uppercase', label: 'Wielka litera' },
                                            { key: 'number', label: 'Cyfra' },
                                        ].map(({ key, label }) => (
                                            <div key={key} className={cn(
                                                "flex items-center gap-1.5 text-xs px-2 py-1 rounded",
                                                passwordChecks[key as keyof typeof passwordChecks]
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-white/5 text-gray-500'
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
                                    'w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all',
                                    'hover:opacity-90',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'flex items-center justify-center gap-2'
                                )}
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0d0d12] text-gray-500">lub</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className={cn(
                                'w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white transition-all',
                                'hover:bg-white/10',
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

                        <p className="text-center text-sm text-gray-400 mt-6">
                            Masz już konto?{' '}
                            <Link href="/login" className="text-purple-400 hover:underline font-medium">
                                Zaloguj się
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        Rejestrując się, akceptujesz{' '}
                        <a href="#" className="underline hover:text-gray-400">Regulamin</a> i{' '}
                        <a href="#" className="underline hover:text-gray-400">Politykę prywatności</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
