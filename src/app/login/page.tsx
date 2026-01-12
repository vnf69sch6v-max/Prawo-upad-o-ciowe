'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff, Loader2, Scale, CheckCircle } from 'lucide-react';

// Prevent static generation - requires Firebase which needs runtime env vars
export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signInWithGoogle, error, user, loading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Get redirect URL from query params
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push(redirectTo);
        }
    }, [user, authLoading, router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            router.push(redirectTo);
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
            router.push(redirectTo);
        } catch {
            // Error handled by hook
        } finally {
            setGoogleLoading(false);
        }
    };

    // Don't show while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 size={32} className="animate-spin text-[#1a365d]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#FAFAFA]">
            {/* Left Side - Info Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a365d] p-12 flex-col justify-between relative">
                {/* Logo */}
                <div>
                    <Link href="/" className="flex items-center gap-3">
                        <Scale size={28} className="text-white" />
                        <span className="text-2xl font-serif font-bold text-white">Savori Legal</span>
                    </Link>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white mb-4 leading-tight">
                            Opanuj egzaminy prawnicze.
                            <br />
                            <span className="text-[#b8860b]">Zdaj za pierwszym razem.</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Kompleksowa platforma do przygotowania się do egzaminu radcowskiego i adwokackiego.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <CheckCircle size={20} className="text-[#b8860b]" />
                            <span className="text-white">959+ pytań egzaminacyjnych</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <CheckCircle size={20} className="text-[#b8860b]" />
                            <span className="text-white">AI Asystent prawny dostępny 24/7</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <CheckCircle size={20} className="text-[#b8860b]" />
                            <span className="text-white">Inteligentny system powtórek</span>
                        </div>
                    </div>

                    {/* Pricing Badge */}
                    <div className="inline-block p-4 bg-white/10 rounded-xl">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-serif font-bold text-white">149 zł</span>
                            <span className="text-gray-300">/ rok</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">Pełny dostęp do wszystkiego</p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-400">
                    © 2026 Savori Legal. Wszystkie prawa zastrzeżone.
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <Scale size={28} className="text-[#1a365d]" />
                            <span className="text-2xl font-serif font-bold text-[#1a365d]">Savori Legal</span>
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-serif font-bold text-[#1a365d]">Witaj z powrotem</h2>
                        <p className="text-gray-500 mt-2">Zaloguj się do swojego konta</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#1a365d] focus:outline-none transition-colors"
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
                                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#1a365d] focus:outline-none transition-colors pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm text-[#1a365d] hover:underline">
                                    Zapomniałeś hasła?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    'w-full py-3 bg-[#1a365d] text-white font-medium rounded-lg transition-all',
                                    'hover:bg-[#2c5282]',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'flex items-center justify-center gap-2'
                                )}
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? 'Logowanie...' : 'Zaloguj się'}
                            </button>
                        </form>

                        <div className="relative my-6">
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
                                'hover:bg-gray-50 hover:border-gray-300',
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

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Nie masz konta?{' '}
                            <Link href="/signup" className="text-[#1a365d] hover:underline font-medium">
                                Zarejestruj się
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
