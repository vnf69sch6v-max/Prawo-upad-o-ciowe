'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));

        setIsLoading(false);
        setIsSuccess(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-#1a365d to-#1a365d rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            L
                        </div>
                        <span className="text-2xl font-bold">LexCapital</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Zresetuj hasło</h1>
                    <p className="text-[var(--text-muted)]">
                        Wyślemy Ci link do resetowania hasła
                    </p>
                </div>

                {/* Card */}
                <div className="lex-card">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Sprawdź email</h2>
                            <p className="text-[var(--text-muted)] mb-6">
                                Wysłaliśmy link do resetowania hasła na adres <strong>{email}</strong>
                            </p>
                            <Link href="/login">
                                <Button variant="secondary" className="w-full">
                                    Wróć do logowania
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jan@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-#1a365d focus:outline-none"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Wyślij link resetujący
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-#1a365d hover:text-purple-300"
                        >
                            <ArrowLeft size={16} />
                            Wróć do logowania
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
