'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { safeRedirectTarget } from '@/lib/auth/redirect';

/** Oficjalne „G” Google (wytyczne marki: kolory bez zmian, na białym tle). */
function GoogleG() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

/** Komunikat po polsku dla błędów okna Google (kody Firebase Auth). */
function googleError(err: unknown): string {
    const code = (err as { code?: string }).code;
    switch (code) {
        case 'auth/popup-blocked':
            return 'Przeglądarka zablokowała okno logowania Google. Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.';
        case 'auth/operation-not-allowed':
            return 'Logowanie przez Google nie jest jeszcze włączone.';
        case 'auth/unauthorized-domain':
            return 'Ta domena nie jest dopuszczona do logowania w Firebase.';
        case 'auth/account-exists-with-different-credential':
            return 'Konto z tym adresem e-mail już istnieje — zaloguj się e-mailem i hasłem.';
        case 'auth/network-request-failed':
            return 'Brak połączenia. Sprawdź internet i spróbuj ponownie.';
        default:
            return !code && err instanceof Error ? err.message : 'Nie udało się zalogować przez Google.';
    }
}

export default function LoginPage() {
    const { signIn, signInWithGoogle, enabled } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    // `?from=` czytamy w chwili przejścia (bez stanu i efektu); tylko ścieżki na tej samej domenie.
    const target = () => safeRedirectTarget(new URLSearchParams(window.location.search).get('from'), window.location.origin);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await signIn(email, password);
            router.push(target());
        } catch (err) {
            // Firebase ma kod `auth/...` (bez zdradzania, czy konto istnieje); nasz błąd sesji ma własny komunikat.
            const code = (err as { code?: string }).code;
            setError(code === 'auth/too-many-requests' ? 'Za dużo prób logowania. Spróbuj ponownie za kilka minut.'
                : code === 'auth/network-request-failed' ? 'Brak połączenia. Sprawdź internet i spróbuj ponownie.'
                    : code || !(err instanceof Error) ? 'Nieprawidłowy e-mail lub hasło.' : err.message);
            setBusy(false);
        }
    };

    const enterDemo = () => router.push(target());

    const onGoogle = async () => {
        setError(null);
        setBusy(true);
        try {
            // Zamknięte okno → `false`, bez błędu — zostajemy na stronie.
            if (await signInWithGoogle()) router.push(target());
        } catch (err) {
            setError(googleError(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-dvh items-center justify-center bg-mk-bg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            style={{ backgroundImage: 'radial-gradient(60% 50% at 50% 0%, #EEF3FF 0%, transparent 70%)' }}>
            <div className="w-full max-w-[400px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mk-primary text-white shadow-md">
                        <BarChart3 size={26} strokeWidth={2.4} />
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-mk-text">Savori</h1>
                    <p className="mt-1 text-sm text-mk-muted">Zaloguj się do platformy</p>
                </div>

                {/* Pola 16 px na telefonie (mniejsze iOS Safari powiększa przy fokusie), właściwa klawiatura
                    i podpowiedzi menedżera haseł; przyciski na całą szerokość, min. 48 px. */}
                <form onSubmit={onSubmit} className="mk-card mk-card-pad space-y-4">
                    {enabled && (
                        <>
                            <button type="button" onClick={onGoogle} disabled={busy}
                                className="mk-btn min-h-12 w-full gap-2.5 bg-white text-base font-semibold text-[#1F1F1F] active:bg-mk-surface-alt sm:text-sm">
                                <GoogleG /> Zaloguj się przez Google
                            </button>
                            <div className="flex items-center gap-3 text-xs text-mk-faint" aria-hidden>
                                <span className="h-px flex-1 bg-mk-border" /> albo e-mailem <span className="h-px flex-1 bg-mk-border" />
                            </div>
                        </>
                    )}
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

                <p className="mt-5 text-center text-xs leading-relaxed text-mk-faint">
                    Konto prowadzi Firebase (Google): e-mail, imię i zdjęcie profilowe. Savori nie zapisuje ich w swojej
                    bazie i nikomu nie udostępnia. © 2026 Savori
                </p>
            </div>
        </div>
    );
}
