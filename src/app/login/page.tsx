'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Prevent static generation - requires Firebase which needs runtime env vars
export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/');
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
            router.push('/');
        } catch {
            // Error handled by hook
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4">
                        <span className="text-3xl font-bold">L</span>
                    </div>
                    <h1 className="text-2xl font-bold">Witaj z powrotem!</h1>
                    <p className="text-[var(--text-muted)] mt-2">Zaloguj się do LexCapital Pro</p>
                </div>

                {/* Form */}
                <div className="lex-card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                placeholder="twoj@email.pl"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Hasło</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none transition-colors pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-purple-400 hover:underline">
                                Zapomniałeś hasła?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                'w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl transition-all',
                                'hover:from-purple-500 hover:to-purple-600',
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
                            <div className="w-full border-t border-[var(--border-color)]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[var(--bg-card)] text-[var(--text-muted)]">lub</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className={cn(
                            'w-full py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl font-medium transition-all',
                            'hover:bg-[var(--bg-elevated)] hover:border-[var(--border-active)]',
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

                    <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                        Nie masz konta?{' '}
                        <Link href="/signup" className="text-purple-400 hover:underline font-medium">
                            Zarejestruj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
