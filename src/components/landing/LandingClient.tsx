'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { PLANS, monthlyPrice, savingsPct, type PlanId } from '@/lib/access';
import { safeRedirectTarget } from '@/lib/auth/redirect';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { useAuth } from '@/lib/auth/use-auth';
import { isCheckoutSessionId, isStripeCheckoutUrl } from '@/lib/stripe/ids';
import { useIsClient } from '@/lib/use-is-client';

const scrollToLogin = () => document.getElementById('logowanie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Główne wezwanie: zalogowany → platforma, reszta → sekcja logowania. */
export function StartCta({ label, className }: { label: string; className: string }) {
    const { user, enabled, loading } = useAuth();
    if (enabled && !loading && user) {
        return <Link href="/" className={className}>Przejdź do platformy</Link>;
    }
    return <button type="button" onClick={scrollToLogin} className={className}>{label}</button>;
}

/** Komunikat po przekierowaniu z bramki (`?dostep=wygasl`) — dopiero po hydratacji (strona jest ISR). */
export function AccessNotice() {
    const isClient = useIsClient();
    if (!isClient || new URLSearchParams(window.location.search).get('dostep') !== 'wygasl') return null;
    return (
        <div role="status" className="mx-auto mb-8 max-w-2xl rounded-2xl border border-mk-primary/30 bg-mk-primary-soft px-5 py-4 text-center text-sm font-medium text-mk-primary-strong">
            Twój dostęp wygasł. Wybierz plan poniżej, żeby wrócić do platformy — dane czekają.
        </div>
    );
}

const PLAN_KEY = 'savori.checkoutPlan';
const RETURN_KEY = 'savori.checkoutReturn';
const PLAN_TTL_MS = 15 * 60 * 1000;

interface SavedPlan { plan: PlanId; at: number; from: string | null }

/** Ścieżka powrotu po płatności. `null`, gdy zostajemy na stronie startowej albo w `/`. */
function returnPath(from: string | null): string | null {
    if (!from) return null;
    const safe = safeRedirectTarget(from, window.location.origin);
    if (safe === '/' || safe === '/start' || safe.startsWith('/start?') || safe.startsWith('/start#')) return null;
    return safe;
}

function readSaved(): SavedPlan | null {
    try {
        const raw = sessionStorage.getItem(PLAN_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<SavedPlan>;
        if (!value.plan || !PLANS.some((p) => p.id === value.plan) || typeof value.at !== 'number') return null;
        if (Date.now() - value.at > PLAN_TTL_MS) {
            sessionStorage.removeItem(PLAN_KEY);
            return null;
        }
        return { plan: value.plan, at: value.at, from: typeof value.from === 'string' ? value.from : null };
    } catch {
        return null;
    }
}

function rememberPlan(plan: PlanId) {
    const params = new URLSearchParams(window.location.search);
    const back = returnPath(params.get('from'));
    sessionStorage.setItem(PLAN_KEY, JSON.stringify({ plan, at: Date.now(), from: back } satisfies SavedPlan));
    if (back) sessionStorage.setItem(RETURN_KEY, back);
    params.set('from', '/start');
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}#logowanie`);
    document.getElementById('logowanie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function rememberReturn() {
    const back = returnPath(new URLSearchParams(window.location.search).get('from'));
    if (back) sessionStorage.setItem(RETURN_KEY, back);
}

function consumeReturnPath(): string {
    const from = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    sessionStorage.removeItem(PLAN_KEY);
    return returnPath(from) ?? '/';
}

function checkoutError(code: string | undefined): string {
    switch (code) {
        case 'unauthorized':
            return 'Zaloguj się, żeby zapłacić. Potem wrócimy do płatności.';
        case 'stripe-not-configured':
        case 'auth-not-configured':
            return 'Płatności nie są jeszcze włączone.';
        case 'stripe-unreachable':
        case 'stripe-error':
            return 'Operator płatności nie odpowiada. Spróbuj za chwilę — nic nie zostało pobrane.';
        default:
            return 'Nie udało się przejść do płatności. Spróbuj ponownie.';
    }
}

function PayBanner({ children }: { children: ReactNode }) {
    return (
        <div role="status" className="mx-auto mb-8 max-w-2xl rounded-2xl border border-mk-primary/30 bg-mk-primary-soft px-5 py-4 text-center text-sm font-medium text-mk-primary-strong">
            {children}
        </div>
    );
}

/** Po powrocie ze Stripe: księgowanie i nowe ciasteczko, dopiero potem wejście na platformę. */
export function PaymentReturn() {
    const isClient = useIsClient();
    const { enabled, loading, user } = useAuth();
    const [phase, setPhase] = useState<'ok' | 'pending' | 'error' | null>(null);
    const [detail, setDetail] = useState<string | null>(null);
    const params = isClient ? new URLSearchParams(window.location.search) : null;
    const flag = params?.get('platnosc') ?? null;
    const sessionId = params?.get('session_id') ?? null;
    const badId = flag === 'ok' && !isCheckoutSessionId(sessionId);
    const signedOut = flag === 'ok' && !badId && !loading && (!enabled || !user);

    useEffect(() => {
        if (!isClient || loading || flag !== 'ok' || badId) return;
        if (!enabled || !user) {
            const backParams = new URLSearchParams(window.location.search);
            backParams.delete('from');
            const back = `${window.location.pathname}?${backParams.toString()}`;
            if (new URLSearchParams(window.location.search).get('from') !== back) {
                const next = new URLSearchParams(window.location.search);
                next.set('from', back);
                window.history.replaceState(null, '', `${window.location.pathname}?${next.toString()}${window.location.hash}`);
            }
            return;
        }
        const fb = getFirebaseAuth()?.currentUser;
        if (!fb || !sessionId) return;
        let cancel = false;
        void (async () => {
            for (let i = 0; i < 5 && !cancel; i++) {
                try {
                    const res = await fetch('/api/stripe/confirm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId, idToken: await fb.getIdToken(true) }),
                    });
                    const body = await res.json().catch(() => ({})) as { ok?: boolean; refresh?: boolean; pending?: boolean };
                    if (cancel) return;
                    if (body.pending) { setPhase('pending'); return; }
                    if (body.ok) {
                        setPhase('ok');
                        window.location.assign(consumeReturnPath());
                        return;
                    }
                    if (body.refresh) {
                        await new Promise((r) => setTimeout(r, 700));
                        continue;
                    }
                    setPhase('error');
                    setDetail('Nie udało się włączyć dostępu. Jeśli płatność zeszła, wyloguj się i zaloguj ponownie.');
                    return;
                } catch {
                    if (cancel) return;
                    setPhase('error');
                    setDetail('Brak połączenia. Odśwież stronę — płatność nie przepada.');
                    return;
                }
            }
            if (!cancel) {
                setPhase('error');
                setDetail('Płatność przyjęta. Wyloguj się i zaloguj ponownie, żeby włączyć dostęp.');
            }
        })();
        return () => { cancel = true; };
    }, [isClient, loading, enabled, user, flag, sessionId, badId]);

    if (!isClient || !flag) return null;
    if (flag === 'anulowana') return <PayBanner>Płatność anulowana. Nic nie zostało pobrane — możesz wybrać plan ponownie.</PayBanner>;
    if (flag !== 'ok') return null;
    if (badId) return <PayBanner>Brak identyfikatora płatności.</PayBanner>;
    if (signedOut) return <PayBanner>Zaloguj się tym samym kontem. Płatność jest zapisana — dostęp włączy się po zalogowaniu.</PayBanner>;
    if (phase === 'pending') return <PayBanner>Płatność jest w drodze. Dostęp włączy się po zaksięgowaniu — to zwykle chwila.</PayBanner>;
    if (phase === 'error') return <PayBanner>{detail}</PayBanner>;
    if (phase === 'ok') return <PayBanner>Płatność przyjęta. Wchodzisz na platformę…</PayBanner>;
    return <PayBanner>Sprawdzam płatność…</PayBanner>;
}

const PLAN_FEATURES = [
    'Wszystkie wskaźniki Polski i Japonii',
    'Przegląd dnia z wnioskiem w jednym zdaniu',
    'Rynki, kursy NBP, WIG20, newsy',
    'Parser sprawozdań finansowych',
    'Bez reklam i bez śledzenia',
    'Bez automatycznego odnawiania',
];

const pln = (n: number) => `${n.toFixed(2).replace('.', ',').replace(',00', '')} zł`;
const period = (m: number) => (m === 1 ? 'za miesiąc' : m < 5 ? `za ${m} miesiące` : `za ${m} miesięcy`);

export function PricingNote({ payments }: { payments: boolean }) {
    return (
        <p className="mt-8 text-center text-sm text-mk-muted">
            {payments
                ? 'Ceny brutto. Płatność jednorazowa przez Stripe — karta, a gdy włączone, także BLIK i szybki przelew. Pokwitowanie z informacją o 14 dniach na odstąpienie przychodzi na e-mail. Bez automatycznego odnawiania.'
                : 'Ceny brutto. Płatności BLIK, kartą i szybkim przelewem uruchamiamy wkrótce — dziś zaczynasz od okresu próbnego.'}
        </p>
    );
}

export function PricingCards({ ctaLabel, payments }: { ctaLabel: string; payments: boolean }) {
    const { user, enabled: authOn, loading } = useAuth();
    const isClient = useIsClient();
    const signedIn = authOn && !loading && !!user;
    const [busy, setBusy] = useState<PlanId | null>(null);
    const [error, setError] = useState<string | null>(null);
    const paying = isClient && new URLSearchParams(window.location.search).get('platnosc');
    const pending = isClient && payments && signedIn && !paying ? readSaved() : null;
    const pendingPlan = pending ? PLANS.find((p) => p.id === pending.plan) : undefined;

    useEffect(() => {
        if (!pendingPlan) return;
        document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [pendingPlan]);

    const buy = async (plan: PlanId) => {
        if (!signedIn) {
            rememberPlan(plan);
            setError('Zaloguj się, żeby zapłacić. Potem wrócimy do płatności.');
            return;
        }
        rememberReturn();
        setBusy(plan);
        setError(null);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const body = await res.json().catch(() => ({})) as { url?: unknown; error?: string };
            if (res.status === 401) {
                rememberPlan(plan);
                setError(checkoutError('unauthorized'));
                setBusy(null);
                return;
            }
            if (!res.ok || !isStripeCheckoutUrl(body.url)) {
                setError(checkoutError(body.error));
                setBusy(null);
                return;
            }
            window.location.assign(body.url);
        } catch {
            setError('Brak połączenia. Nic nie zostało pobrane.');
            setBusy(null);
        }
    };

    return (
        <div>
            {pendingPlan && (
                <div role="status" className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-mk-primary/30 bg-mk-primary-soft px-5 py-4 text-center text-sm font-medium text-mk-primary-strong sm:flex-row sm:justify-between sm:text-left">
                    <span>Wybrany plan: {pendingPlan.name}, {pendingPlan.pricePln} zł. Dokończ płatność.</span>
                    <button type="button" onClick={() => void buy(pendingPlan.id)} disabled={busy !== null}
                        className="mk-btn mk-btn-primary min-h-12 shrink-0 px-4 text-sm font-semibold">
                        {busy === pendingPlan.id ? <Loader2 size={16} className="animate-spin" /> : null}
                        Zapłać {pendingPlan.pricePln} zł
                    </button>
                </div>
            )}
            {error && <p role="alert" className="mx-auto mb-6 max-w-2xl text-center text-sm font-medium text-mk-negative">{error}</p>}
            <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
                {PLANS.map((p) => {
                    const featured = p.id === 'm3';
                    const save = savingsPct(p);
                    return (
                        <div key={p.id}
                            className={`relative flex flex-col rounded-3xl border bg-white p-6 sm:p-7 ${featured
                                ? 'border-mk-primary shadow-[0_20px_60px_-20px_rgba(220,38,38,0.45)] ring-1 ring-mk-primary md:-my-3 md:py-9'
                                : 'border-mk-border shadow-sm'}`}>
                            {p.badge && (
                                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${featured ? 'bg-mk-primary text-white' : 'bg-mk-text text-white'}`}>
                                    {p.badge}
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-mk-text">{p.name}</h3>
                            <div className="mt-4 flex items-baseline gap-1.5">
                                <span className="text-5xl font-extrabold tracking-tight text-mk-text">{p.pricePln}</span>
                                <span className="text-lg font-semibold text-mk-text">zł</span>
                                <span className="ml-1 text-sm text-mk-muted">{period(p.months)}</span>
                            </div>
                            <p className="mt-2 h-5 text-sm text-mk-muted">
                                {p.months > 1 ? <>{pln(monthlyPrice(p))} / mies. · <span className="font-semibold text-emerald-600">oszczędzasz {save}%</span></> : 'Sprawdź bez zobowiązań'}
                            </p>
                            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-mk-text-soft">
                                {PLAN_FEATURES.map((f) => (
                                    <li key={f} className="flex gap-2.5"><Check size={18} className="mt-px shrink-0 text-mk-primary" aria-hidden />{f}</li>
                                ))}
                            </ul>
                            {payments ? (
                                <button type="button" onClick={() => void buy(p.id)} disabled={busy !== null || (authOn && loading)} aria-busy={busy === p.id}
                                    className={`mk-btn mt-7 min-h-12 w-full text-base font-semibold ${featured ? 'mk-btn-primary' : ''}`}>
                                    {busy === p.id ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {busy === p.id ? 'Przekierowuję…' : `Zapłać ${p.pricePln} zł`}
                                </button>
                            ) : (
                                <StartCta label={ctaLabel}
                                    className={`mk-btn mt-7 min-h-12 w-full text-base font-semibold ${featured ? 'mk-btn-primary' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
