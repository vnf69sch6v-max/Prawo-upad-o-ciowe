'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { passwordProblem } from '@/lib/auth/password';
import { safeRedirectTarget } from '@/lib/auth/redirect';

/** Oficjalne „G” Google (wytyczne marki: kolory bez zmian, na białym tle). */
export function GoogleG() {
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

function signUpError(err: unknown): string {
    const code = (err as { code?: string }).code;
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Konto z tym adresem już istnieje. Zaloguj się albo ustaw hasło od nowa.';
        case 'auth/invalid-email':
            return 'Podaj prawidłowy adres e-mail.';
        case 'auth/weak-password':
            return 'Hasło jest za słabe. Użyj co najmniej 8 znaków.';
        case 'auth/operation-not-allowed':
            return 'Rejestracja e-mailem nie jest jeszcze włączona.';
        case 'auth/too-many-requests':
            return 'Za dużo prób. Spróbuj ponownie za kilka minut.';
        case 'auth/network-request-failed':
            return 'Brak połączenia. Sprawdź internet i spróbuj ponownie.';
        case 'auth/unauthorized-continue-uri':
            return 'Nie udało się wysłać linku z tej domeny.';
        case 'verification-not-sent':
            return err instanceof Error ? err.message : 'Konto jest założone, ale link nie wyszedł. Użyj „Nie pamiętam hasła”.';
        default:
            return err instanceof Error && !code ? err.message : 'Nie udało się założyć konta. Spróbuj ponownie.';
    }
}

/**
 * Logowanie (Google + e-mail) — wspólne dla /login i strony startowej. Po sukcesie wraca pod `?from=`
 * (tylko ta sama domena, `safeRedirectTarget`). `googleLabel` — tekst przycisku Google (na stronie startowej
 * „Zacznij za darmo z Google”).
 */
export function LoginPanel({ googleLabel = 'Zaloguj się przez Google' }: { googleLabel?: string }) {
    const { signIn, signUp, signInWithGoogle, resetPassword, enabled, authNotice } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    // `?from=` czytamy w chwili przejścia (bez stanu i efektu); tylko ścieżki na tej samej domenie.
    const target = () => safeRedirectTarget(new URLSearchParams(window.location.search).get('from'), window.location.origin);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        if (mode === 'register') {
            const problem = passwordProblem(password, confirm);
            if (problem) {
                setError(problem);
                return;
            }
        }
        setBusy(true);
        try {
            if (mode === 'register') {
                await signUp(email, password);
                setPassword('');
                setConfirm('');
                setMode('login');
                setInfo(`Wysłaliśmy link na ${email.trim()}. Kliknij go, a potem zaloguj się tym samym hasłem. Okres próbny włączamy po potwierdzeniu adresu.`);
                setBusy(false);
                return;
            }
            await signIn(email, password);
            router.push(target());
        } catch (err) {
            const code = (err as { code?: string }).code;
            if (mode === 'register') setError(signUpError(err));
            else if (code === 'email-not-verified') setError(err instanceof Error ? err.message : 'Potwierdź adres e-mail, a potem zaloguj się ponownie.');
            else setError(code === 'auth/too-many-requests' ? 'Za dużo prób logowania. Spróbuj ponownie za kilka minut.'
                : code === 'auth/network-request-failed' ? 'Brak połączenia. Sprawdź internet i spróbuj ponownie.'
                    : code || !(err instanceof Error) ? 'Nieprawidłowy e-mail lub hasło.' : err.message);
            setBusy(false);
        }
    };

    const switchMode = () => {
        setMode((m) => (m === 'login' ? 'register' : 'login'));
        setError(null);
        setInfo(null);
        setConfirm('');
    };

    const enterDemo = () => router.push(target());

    const onReset = async () => {
        setError(null);
        setInfo(null);
        if (!email.trim()) {
            setError('Wpisz e-mail, na który wyślemy link do zmiany hasła.');
            return;
        }
        setBusy(true);
        try {
            await resetPassword(email);
            setInfo('Jeśli jest konto z tym adresem, wysłaliśmy link do zmiany hasła.');
        } catch (err) {
            const code = (err as { code?: string }).code;
            // Brak konta brzmi tak samo jak sukces — adresu nie da się sprawdzić z formularza.
            if (code === 'auth/user-not-found') setInfo('Jeśli jest konto z tym adresem, wysłaliśmy link do zmiany hasła.');
            else if (code === 'auth/invalid-email') setError('Podaj prawidłowy adres e-mail.');
            else if (code === 'auth/too-many-requests') setError('Za dużo prób. Spróbuj za kilka minut.');
            else if (code === 'auth/unauthorized-continue-uri') setError('Reset hasła nie jest włączony na tej domenie.');
            else setError('Nie udało się wysłać linku. Spróbuj ponownie.');
        } finally {
            setBusy(false);
        }
    };

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

    // Pola 16 px na telefonie (mniejsze iOS Safari powiększa przy fokusie), właściwa klawiatura
    // i podpowiedzi menedżera haseł; przyciski na całą szerokość, min. 48 px.
    return (
        <form onSubmit={onSubmit} className="mk-card mk-card-pad space-y-4">
            {enabled && (
                <>
                    <button type="button" onClick={onGoogle} disabled={busy}
                        className="mk-btn min-h-12 w-full gap-2.5 bg-white text-base font-semibold text-[#1F1F1F] active:bg-mk-surface-alt sm:text-sm">
                        <GoogleG /> {googleLabel}
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
                <input id="password" name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} autoCapitalize="none"
                    autoCorrect="off" spellCheck={false} enterKeyHint={mode === 'register' ? 'next' : 'go'} required minLength={mode === 'register' ? 8 : undefined}
                    className="mk-input min-h-12 max-lg:text-base!"
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                {enabled && mode === 'login' && (
                    <button type="button" onClick={() => void onReset()} disabled={busy}
                        className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-mk-text-soft underline underline-offset-2 hover:text-mk-text">
                        Nie pamiętam hasła
                    </button>
                )}
            </div>
            {mode === 'register' && (
                <div>
                    <label className="mk-label mb-1.5 block" htmlFor="password-confirm">Powtórz hasło</label>
                    <input id="password-confirm" name="password-confirm" type="password" autoComplete="new-password" autoCapitalize="none"
                        autoCorrect="off" spellCheck={false} enterKeyHint="go" required minLength={8} className="mk-input min-h-12 max-lg:text-base!"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                    <p className="mt-2 text-xs leading-relaxed text-mk-muted">Co najmniej 8 znaków. Na ten adres wyślemy link — okres próbny włączy się po jego kliknięciu.</p>
                </div>
            )}

            {(error || authNotice) && <p role="alert" className="text-sm font-medium text-mk-negative">{error ?? authNotice}</p>}
            {info && <p role="status" className="text-sm font-medium text-mk-text">{info}</p>}

            <button type="submit" className="mk-btn mk-btn-primary min-h-12 w-full text-base sm:text-sm" disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                {mode === 'register' ? 'Załóż konto' : 'Zaloguj się'}
            </button>
            {enabled && (
                <button type="button" onClick={switchMode} disabled={busy}
                    className="mx-auto flex min-h-11 items-center text-sm font-medium text-mk-text-soft underline underline-offset-2 hover:text-mk-text">
                    {mode === 'login' ? 'Nie masz konta? Załóż je' : 'Masz już konto? Zaloguj się'}
                </button>
            )}

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
    );
}
