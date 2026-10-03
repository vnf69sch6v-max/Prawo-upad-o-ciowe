'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';

export default function LoginPage() {
    const { signIn, enabled } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    // `?from=` czytamy w chwili przejścia (bez stanu i efektu); tylko ścieżki wewnętrzne.
    const target = () => {
        const q = new URLSearchParams(window.location.search).get('from');
        return q && q.startsWith('/') && !q.startsWith('//') ? q : '/';
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await signIn(email, password);
            router.push(target());
        } catch {
            setError('Nieprawidłowy e-mail lub hasło.');
            setBusy(false);
        }
    };

    const enterDemo = () => router.push(target());

    return (
        <div className="flex min-h-dvh items-center justify-center bg-mk-bg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            style={{ backgroundImage: 'radial-gradient(60% 50% at 50% 0%, #EEF3FF 0%, transparent 70%)' }}>
            <div className="w-full max-w-[400px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mk-primary text-white shadow-md">
                        <BarChart3 size={26} strokeWidth={2.4} />
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-mk-text">Savori</h1>
                    <p className="mt-1 text-sm text-mk-muted">Zaloguj się, aby przejść do platformy</p>
                </div>

                {/* Pola 16 px na telefonie (mniejsze iOS Safari powiększa przy fokusie), właściwa klawiatura
                    i podpowiedzi menedżera haseł; przyciski na całą szerokość, min. 48 px. */}
                <form onSubmit={onSubmit} className="mk-card mk-card-pad space-y-4">
                    <div>
                        <label className="mk-label mb-1.5 block" htmlFor="email">E-mail</label>
                        <input id="email" name="email" type="email" inputMode="email" autoComplete="username email" autoCapitalize="none"
                            autoCorrect="off" spellCheck={false} enterKeyHint="next" required className="mk-input min-h-12 max-lg:text-base!"
                            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan.kowalski@firma.pl" />
                    </div>
                    <div>
                        <label className="mk-label mb-1.5 block" htmlFor="password">Hasło</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" autoCapitalize="none"
                            autoCorrect="off" spellCheck={false} enterKeyHint="go" required className="mk-input min-h-12 max-lg:text-base!"
                            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>

                    {error && <p role="alert" className="text-sm font-medium text-mk-negative">{error}</p>}

                    <button type="submit" className="mk-btn mk-btn-primary min-h-12 w-full text-base sm:text-sm" disabled={busy}>
                        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                        Zaloguj się
                    </button>

                    {!enabled && (
                        <div className="rounded-xl border border-mk-border bg-mk-surface-alt p-3 text-center">
                            <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mk-warn">
                                <ShieldCheck size={14} /> Tryb demo
                            </div>
                            <p className="mb-3 text-sm text-mk-muted sm:text-xs">
                                Logowanie nieaktywne — brak konfiguracji Firebase. Możesz wejść bez logowania.
                            </p>
                            <button type="button" onClick={enterDemo} className="mk-btn min-h-12 w-full text-base active:bg-mk-surface-alt sm:text-sm">Wejdź do platformy</button>
                        </div>
                    )}
                </form>

                <p className="mt-5 text-center text-xs text-mk-faint">
                    Dostęp przyznaje administrator. © 2026 Savori
                </p>
            </div>
        </div>
    );
}
