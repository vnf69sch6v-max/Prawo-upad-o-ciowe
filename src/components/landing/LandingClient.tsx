'use client';

import { useCallback, useEffect, useReducer, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { PLANS, monthlyPrice, savingsPct, type PlanId } from '@/lib/access';
import { safeRedirectTarget } from '@/lib/auth/redirect';
import { formatAccessUntil } from '@/lib/auth/session-info';
import { useAccess, useAuth } from '@/lib/auth/use-auth';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { OWNER } from '@/lib/legal';
import { isStripeCheckoutUrl } from '@/lib/stripe/ids';
import {
    CHECKOUT_PLAN_KEY,
    CHECKOUT_RETURN_KEY,
    readSearch,
    reduce,
    resolveSessionId,
    type Effect,
    type Event,
    type Phase,
    type ReduceDeps,
    type StorageLike,
} from '@/lib/stripe/payment-return';
import { useIsClient } from '@/lib/use-is-client';
import { LoginPanel } from '@/components/auth/LoginPanel';

const scrollToLogin = () => document.getElementById('logowanie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
const scrollToStatus = () => document.getElementById('stan-platnosci')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Faza silnika widziana przez `StartCta`, który siedzi poza `PaymentReturn` (nagłówek i hero). */
const IDLE_PHASE: Phase = { kind: 'idle' };
let paymentPhase: Phase = IDLE_PHASE;
const phaseListeners = new Set<() => void>();

function publishPhase(phase: Phase) {
    if (JSON.stringify(paymentPhase) === JSON.stringify(phase)) return;
    paymentPhase = phase;
    phaseListeners.forEach((listener) => listener());
}

function subscribePhase(onChange: () => void) {
    phaseListeners.add(onChange);
    return () => phaseListeners.delete(onChange);
}

function usePaymentPhase(): Phase {
    return useSyncExternalStore(subscribePhase, () => paymentPhase, () => IDLE_PHASE);
}

/**
 * Query strony. Na serwerze i w hydratacji `''` (jak brak parametrów), potem wartość z `useSearchParams`,
 * więc miękka nawigacja (`/start?platnosc=…` → `/start`) gasi pasek. Sam odczyt `window` w renderze
 * nie widzi tej zmiany.
 */
/** `null` = router jeszcze nie opublikował query. Pusty string to prawdziwy adres bez parametrów. */
let locationSearch: string | null = null;
const searchListeners = new Set<() => void>();

function publishSearch(search: string) {
    if (locationSearch === search) return;
    locationSearch = search;
    searchListeners.forEach((listener) => listener());
}

function subscribeSearch(onChange: () => void) {
    searchListeners.add(onChange);
    return () => searchListeners.delete(onChange);
}

function useLocationSearch(): string | null {
    return useSyncExternalStore(subscribeSearch, () => locationSearch, () => null);
}

/** Mostek pod `<Suspense>`: `useSearchParams` budzi pasek, gdy zmienia się samo query. */
export function SearchBridge() {
    const params = useSearchParams();
    const key = params.toString();
    useEffect(() => {
        publishSearch(key ? `?${key}` : '');
    }, [key]);
    return null;
}

/** Adres po hydratacji: najpierw to, co już jest w oknie, potem aktualizacja z routera. */
function useClientSearch(): string {
    const isClient = useIsClient();
    const tracked = useLocationSearch();
    if (!isClient) return '';
    if (tracked !== null) return tracked;
    return window.location.search;
}

/** `true`, dopóki w adresie jest `platnosc=ok`, a faza nie doszła do `ok` (lepki przycisk nie może uciec na `/`). */
export function usePaymentFlag(): boolean {
    const search = useClientSearch();
    const phase = usePaymentPhase();
    if (!search) return false;
    if (readSearch(search).flag !== 'ok') return false;
    return phase.kind !== 'ok';
}

const PLAN_TTL_MS = 15 * 60 * 1000;

interface SavedPlan { plan: PlanId; at: number; from: string | null }

/** Ścieżka powrotu po płatności. `null`, gdy zostajemy na stronie startowej albo w `/`. */
function landingReturnPath(from: string | null): string | null {
    if (!from) return null;
    const safe = safeRedirectTarget(from, window.location.origin);
    if (safe === '/' || safe === '/start' || safe.startsWith('/start?') || safe.startsWith('/start#')) return null;
    return safe;
}

function browserStorage(): StorageLike | null {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

function browserDeps(): ReduceDeps {
    return { now: Date.now(), storage: browserStorage(), returnPath: landingReturnPath };
}

function readSaved(): SavedPlan | null {
    try {
        const raw = window.sessionStorage.getItem(CHECKOUT_PLAN_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<SavedPlan>;
        if (!value.plan || !PLANS.some((p) => p.id === value.plan) || typeof value.at !== 'number') return null;
        if (Date.now() - value.at > PLAN_TTL_MS) return null;
        return { plan: value.plan, at: value.at, from: typeof value.from === 'string' ? value.from : null };
    } catch {
        return null;
    }
}

function rememberPlan(plan: PlanId) {
    try {
        const params = new URLSearchParams(window.location.search);
        const back = landingReturnPath(params.get('from'));
        window.sessionStorage.setItem(CHECKOUT_PLAN_KEY, JSON.stringify({ plan, at: Date.now(), from: back } satisfies SavedPlan));
        if (back) window.sessionStorage.setItem(CHECKOUT_RETURN_KEY, back);
        params.set('from', '/start');
        const qs = params.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}#logowanie`);
    } catch {
        /* tryb prywatny — i tak schodzimy do logowania */
    }
    document.getElementById('logowanie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function rememberReturn() {
    try {
        const back = landingReturnPath(new URLSearchParams(window.location.search).get('from'));
        if (back) window.sessionStorage.setItem(CHECKOUT_RETURN_KEY, back);
    } catch {
        /* bez zapamiętanej ścieżki wracamy na stronę główną */
    }
}

/** Po zalogowaniu ze strony powrotu wracamy na ten sam adres płatności (stary `from` zdejmujemy, żeby się nie zagnieździł). */
function rewriteReturnUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const backParams = new URLSearchParams(params);
        backParams.delete('from');
        const back = `${window.location.pathname}?${backParams.toString()}`;
        if (params.get('from') === back) return;
        params.set('from', back);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`);
    } catch {
        /* historia niedostępna */
    }
}

function isAbort(err: unknown): boolean {
    return !!err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError';
}

async function runConfirm(forceToken: boolean, signal: AbortSignal): Promise<Event | null> {
    try {
        const fb = getFirebaseAuth()?.currentUser;
        if (!fb) return { type: 'response', status: 401, body: {} };
        const idToken = await fb.getIdToken(forceToken);
        if (signal.aborted) return null;
        const sessionId = resolveSessionId(window.location.search, browserStorage());
        if (!sessionId) return { type: 'response', status: 400, body: { error: 'rejected' } };
        const res = await fetch('/api/stripe/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, idToken }),
            cache: 'no-store',
            signal,
        });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; refresh?: boolean; pending?: boolean; accessUntil?: number; error?: string };
        if (signal.aborted) return null;
        return { type: 'response', status: res.status, body };
    } catch (err) {
        if (signal.aborted || isAbort(err)) return null;
        return { type: 'throw' };
    }
}

const FROM_LABELS: Record<string, string> = {
    '/ceny': 'Ceny',
    '/gospodarka': 'Gospodarka',
    '/praca': 'Rynek pracy',
    '/rynki': 'Rynki',
    '/newsy': 'Newsy',
    '/regiony': 'Regiony',
    '/parser': 'Parser',
    '/japonia': 'Japonia',
    '/ustawienia': 'Ustawienia',
    '/publikacje': 'Publikacje',
    '/podsumowanie': 'Podsumowanie',
    '/status': 'Status',
    '/prognozy': 'Prognozy',
    '/dane': 'Dane',
    '/samorzad': 'Samorząd',
};

function fromLabel(from: string | null): string {
    if (!from) return 'platformy';
    const safe = safeRedirectTarget(from, window.location.origin);
    const path = safe.split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';
    if (path === '/' || path === '/start') return 'platformy';
    if (FROM_LABELS[path]) return FROM_LABELS[path];
    if (path.startsWith('/spolki')) return 'Spółki';
    return 'poprzedniej strony';
}

function safeFrom(search: string): string {
    return safeRedirectTarget(new URLSearchParams(search).get('from'), window.location.origin) || '/';
}

/**
 * Główne wezwanie. W trakcie `platnosc=ok` nie prowadzi na `/` — przewija do paska stanu.
 * Firebase bez ciasteczka (sesja `none`) nie udaje wejścia na platformę.
 */
export function StartCta({ label, className }: { label: string; className: string }) {
    const { user, enabled, loading, session, signInWithGoogle } = useAuth();
    const access = useAccess();
    const paying = usePaymentFlag();
    const router = useRouter();

    if (paying) {
        return <button type="button" onClick={scrollToStatus} className={className}>Dokańczamy płatność…</button>;
    }
    if (enabled && !loading && user && session.status === 'none') {
        const again = () => {
            void (async () => {
                try {
                    const ok = await signInWithGoogle();
                    if (!ok) return;
                    router.push(safeFrom(window.location.search));
                } catch {
                    scrollToLogin();
                }
            })();
        };
        return <button type="button" onClick={again} className={className}>Zaloguj się ponownie</button>;
    }
    if (access.state === 'expired') {
        return <a href="#cennik" className={className}>Wybierz plan</a>;
    }
    if ((!enabled && user) || (enabled && !loading && user && (access.state === 'active' || access.state === 'admin'))) {
        return <Link href="/" className={className}>Przejdź do platformy</Link>;
    }
    return <button type="button" onClick={scrollToLogin} className={className}>{label}</button>;
}

function StatusCard({ children, busy = false }: { children: ReactNode; busy?: boolean }) {
    return (
        <div aria-busy={busy || undefined} className="mx-auto mb-6 mt-4 max-w-2xl break-words rounded-2xl border border-mk-primary/30 bg-mk-primary-soft px-5 py-4 text-center text-sm font-medium leading-relaxed text-mk-primary-strong">
            {children}
        </div>
    );
}

function StatusAction({ children, href, onClick, primary = false }: { children: ReactNode; href?: string; onClick?: () => void; primary?: boolean }) {
    const className = `mk-btn mx-auto mt-3 flex min-h-11 w-fit px-4 text-sm font-semibold ${primary ? 'mk-btn-primary' : ''}`;
    if (href) return <a href={href} className={className}>{children}</a>;
    return <button type="button" onClick={onClick} className={className}>{children}</button>;
}

function SpinnerLine({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            {children}
        </span>
    );
}

function ContactMail() {
    return <a href={`mailto:${OWNER.email}`} className="underline underline-offset-2">{OWNER.email}</a>;
}

/** Komunikat po przekierowaniu z bramki (`?dostep=wygasl`). Po hydratacji odnawia ciasteczko — jeśli dostęp już wrócił, schodzi z cennika. */
export function AccessNotice() {
    const search = useClientSearch();
    const { user, sessionReady, refreshSession } = useAuth();
    const [verdict, setVerdict] = useState<'expired' | null>(null);
    const expiredFlag = new URLSearchParams(search).get('dostep') === 'wygasl';
    const uid = user?.uid ?? null;

    useEffect(() => {
        if (!expiredFlag || !sessionReady || !uid) return;
        let cancel = false;
        void (async () => {
            rememberReturn();
            const info = await refreshSession({ force: true });
            if (cancel) return;
            const nowS = Math.floor(Date.now() / 1000);
            if (info.accessUntil != null && info.accessUntil > nowS) {
                window.location.assign(safeFrom(window.location.search));
                return;
            }
            setVerdict('expired');
        })();
        return () => { cancel = true; };
    }, [expiredFlag, sessionReady, uid, refreshSession]);

    if (!expiredFlag || !sessionReady || !user) return null;
    if (verdict !== 'expired') return <StatusCard busy>Sprawdzam dostęp…</StatusCard>;
    const email = user.email ?? 'to konto';
    const label = fromLabel(new URLSearchParams(search).get('from'));
    return (
        <StatusCard>
            Zalogowano jako {email}. Dostęp się skończył — wybierz plan, a po płatności wrócisz do {label}.
        </StatusCard>
    );
}

interface Model { phase: Phase; effect: Effect; serial: number }

const INITIAL_MODEL: Model = { phase: IDLE_PHASE, effect: { kind: 'none' }, serial: 0 };

function modelReducer(model: Model, action: { event: Event; deps: ReduceDeps }): Model {
    const next = reduce(model.phase, action.event, action.deps);
    return { phase: next.phase, effect: next.effect, serial: model.serial + 1 };
}

function paymentBody(phase: Phase, retry: () => void, leave: () => void): ReactNode {
    switch (phase.kind) {
        case 'idle':
            return null;
        case 'cancelled':
            return (
                <StatusCard>
                    <p>Płatność anulowana. Nic nie zostało pobrane — możesz wybrać plan ponownie.</p>
                    <StatusAction href="#cennik">Wróć do cennika</StatusAction>
                </StatusCard>
            );
        case 'badId':
            return (
                <StatusCard>
                    <p>Nie rozpoznaliśmy tej płatności. Wróć do cennika i wybierz plan ponownie. Jeśli kwota zeszła z konta, napisz na <ContactMail />.</p>
                    <StatusAction href="#cennik">Wróć do cennika</StatusAction>
                </StatusCard>
            );
        case 'signedOut':
            return (
                <StatusCard>
                    <p>Zaloguj się tym samym kontem Google. Po zalogowaniu włączymy dostęp z tej płatności.</p>
                    <StatusAction href="#logowanie">Przejdź do logowania</StatusAction>
                </StatusCard>
            );
        case 'waitingSession':
        case 'confirming':
            return <StatusCard busy><SpinnerLine>Sprawdzam płatność…</SpinnerLine></StatusCard>;
        case 'pending':
            return (
                <StatusCard busy>
                    <SpinnerLine>Czekamy na zaksięgowanie BLIK-a lub przelewu. Zostaw tę kartę otwartą.</SpinnerLine>
                </StatusCard>
            );
        case 'ok':
            return (
                <StatusCard>
                    <p>
                        Płatność przyjęta.
                        {phase.accessUntil != null ? ` Dostęp aktywny do ${formatAccessUntil(phase.accessUntil)}.` : ''}
                    </p>
                </StatusCard>
            );
        case 'error':
            return <ErrorBody code={phase.code} retry={phase.retry ? retry : undefined} leave={leave} />;
        default: {
            const unreachable: never = phase;
            return unreachable;
        }
    }
}

function ErrorBody({ code, retry, leave }: { code: Extract<Phase, { kind: 'error' }>['code']; retry?: () => void; leave: () => void }) {
    switch (code) {
        case 'pendingTimeout':
            return (
                <StatusCard>
                    <p>Płatność jeszcze nie doszła. Sprawdź ponownie za chwilę — nic nie przepada.</p>
                    <p className="mt-2">Jeśli pieniądze zeszły, a dostępu nie ma, napisz na <ContactMail />.</p>
                    {retry && <StatusAction primary onClick={retry}>Sprawdź ponownie</StatusAction>}
                </StatusCard>
            );
        case 'forbidden':
            return (
                <StatusCard>
                    <p>To inne konto niż to, które płaciło. Wyloguj się i zaloguj właściwe.</p>
                    <StatusAction primary onClick={leave}>Wyloguj się</StatusAction>
                </StatusCard>
            );
        case 'server':
            return (
                <StatusCard>
                    <p>Płatność jest przyjęta po stronie Stripe, ale nie udało się jej zaksięgować. Spróbuj ponownie za chwilę.</p>
                    {retry && <StatusAction primary onClick={retry}>Spróbuj ponownie</StatusAction>}
                </StatusCard>
            );
        case 'timeout':
            return (
                <StatusCard>
                    <p>Płatność jest przyjęta, dostęp jeszcze się nie odświeżył. Spróbuj ponownie.</p>
                    {retry && <StatusAction primary onClick={retry}>Spróbuj ponownie</StatusAction>}
                </StatusCard>
            );
        case 'rejected':
            return (
                <StatusCard>
                    <p>Ta sesja płatności wygasła lub nie została opłacona. Nic nie zostało pobrane — wybierz plan ponownie.</p>
                    <StatusAction href="#cennik">Wróć do cennika</StatusAction>
                </StatusCard>
            );
        case 'disabled':
            return <StatusCard><p>Płatności nie są jeszcze włączone.</p></StatusCard>;
        case 'network':
            return (
                <StatusCard>
                    <p>Brak połączenia. Płatność nie przepada.</p>
                    {retry && <StatusAction primary onClick={retry}>Spróbuj ponownie</StatusAction>}
                </StatusCard>
            );
        default: {
            const unreachable: never = code;
            return unreachable;
        }
    }
}

/** Pasek powrotu ze Stripe. Faza żyje w reducerze; jeden efekt wykonuje `confirm` / timery / przekierowanie. */
export function PaymentReturn() {
    const isClient = useIsClient();
    const search = useClientSearch();
    const { user, loading, sessionReady, signOut } = useAuth();
    const signedIn = !!user;
    const [model, dispatch] = useReducer(modelReducer, INITIAL_MODEL);
    const drive = useCallback((event: Event) => {
        dispatch({ event, deps: browserDeps() });
    }, []);

    useEffect(() => {
        publishPhase(model.phase);
    }, [model.phase]);

    useEffect(() => () => publishPhase(IDLE_PHASE), []);

    useEffect(() => {
        if (!isClient || loading) return;
        drive({ type: 'boot', search, signedIn, sessionReady });
    }, [isClient, loading, signedIn, sessionReady, search, drive]);

    useEffect(() => {
        const { effect, phase } = model;
        if (effect.kind === 'none') return;
        let cancel = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (effect.kind === 'rewriteFrom') {
            rewriteReturnUrl();
            return;
        }
        if (effect.kind === 'redirect') {
            timer = setTimeout(() => {
                if (!cancel) window.location.assign(effect.to);
            }, effect.afterMs);
            return () => { cancel = true; clearTimeout(timer); };
        }
        if (effect.kind === 'wait') {
            timer = setTimeout(() => {
                if (cancel) return;
                // Czekamy na ciasteczko, nie na 401 — ponowny boot, żeby nie spalać limitu ponowień.
                if (phase.kind === 'waitingSession' && phase.waits === 0) {
                    drive({ type: 'boot', search, signedIn, sessionReady });
                } else {
                    drive({ type: 'tick' });
                }
            }, effect.ms);
            return () => { cancel = true; clearTimeout(timer); };
        }

        const ctrl = new AbortController();
        void runConfirm(effect.forceToken, ctrl.signal).then((event) => {
            if (!cancel && event) drive(event);
        });
        return () => {
            cancel = true;
            ctrl.abort();
        };
    }, [model, drive, signedIn, sessionReady, search]);

    const retry = useCallback(() => drive({ type: 'retry' }), [drive]);
    const leave = useCallback(() => {
        void signOut().finally(() => scrollToLogin());
    }, [signOut]);

    const body = paymentBody(model.phase, retry, leave);
    if (body) return body;
    if (!search) return null;
    const flag = readSearch(search).flag;
    if (flag === 'anulowana') {
        return (
            <StatusCard>
                <p>Płatność anulowana. Nic nie zostało pobrane — możesz wybrać plan ponownie.</p>
                <StatusAction href="#cennik">Wróć do cennika</StatusAction>
            </StatusCard>
        );
    }
    if (flag === 'ok') return <StatusCard busy><SpinnerLine>Sprawdzam płatność…</SpinnerLine></StatusCard>;
    return null;
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
    if (!payments) {
        return (
            <p className="mt-8 text-center text-sm text-mk-muted">
                Ceny brutto. Płatności BLIK, kartą i szybkim przelewem uruchamiamy wkrótce — dziś zaczynasz od okresu próbnego.
            </p>
        );
    }
    const who = OWNER.address ? `${OWNER.name}, ${OWNER.address}` : OWNER.name;
    return (
        <p className="mt-8 text-center text-sm leading-relaxed text-mk-muted">
            Usługodawca: {who}. Płatność jednorazowa, ceny brutto. Dostęp włączamy od razu po zaksięgowaniu.
            Pokwitowanie wysyła Stripe na e-mail konta (to nie jest faktura VAT). Odstąpienie i reklamacje:{' '}
            <Link href="/regulamin#plany" className="underline underline-offset-2 hover:text-mk-text">regulamin</Link>
            {', '}
            <Link href="/prywatnosc" className="underline underline-offset-2 hover:text-mk-text">prywatność</Link>.
        </p>
    );
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

export function PricingCards({ ctaLabel, payments: paymentsInitial }: { ctaLabel: string; payments: boolean }) {
    const { user, enabled: authOn, loading } = useAuth();
    const access = useAccess();
    const isClient = useIsClient();
    const search = useClientSearch();
    const [paymentsFresh, setPaymentsFresh] = useState<boolean | null>(null);
    const payments = paymentsFresh ?? paymentsInitial;
    const signedIn = authOn && !loading && !!user;
    const [busy, setBusy] = useState<PlanId | null>(null);
    const [error, setError] = useState<string | null>(null);
    const returnFlow = new URLSearchParams(search).get('platnosc') != null;
    const pending = isClient && payments && signedIn && !returnFlow && access.state !== 'admin' ? readSaved() : null;
    const pendingPlan = pending ? PLANS.find((p) => p.id === pending.plan) : undefined;

    useEffect(() => {
        const ctrl = new AbortController();
        void (async () => {
            try {
                const res = await fetch('/api/stripe/checkout', { cache: 'no-store', signal: ctrl.signal });
                if (!res.ok) return;
                const body = (await res.json()) as { enabled?: unknown };
                if (!ctrl.signal.aborted && typeof body.enabled === 'boolean') setPaymentsFresh(body.enabled);
            } catch {
                /* zostawiamy wartość z wyrenderowanej strony */
            }
        })();
        return () => ctrl.abort();
    }, []);

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
                        {busy === pendingPlan.id ? 'Przekierowuję…' : `Dokończ płatność — ${pendingPlan.pricePln} zł`}
                    </button>
                </div>
            )}
            {error && <p role="alert" className="mx-auto mb-6 max-w-2xl text-center text-sm font-medium text-mk-negative">{error}</p>}
            <ul className="mx-auto mb-10 grid max-w-3xl gap-2.5 sm:grid-cols-2">
                {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-mk-text-soft">
                        <Check size={18} className="mt-px shrink-0 text-mk-primary" aria-hidden />{f}
                    </li>
                ))}
            </ul>
            {access.state === 'admin' && (
                <p className="mb-8 text-center text-sm font-medium text-mk-text">Dostęp administratora — płatność nic tu nie zmieni.</p>
            )}
            {access.state === 'active' && access.accessUntil != null && (
                <p className="mb-8 text-center text-sm font-medium text-mk-text">
                    Masz dostęp do {formatAccessUntil(access.accessUntil)}. Płatność przedłuży go od tej daty, nie od dziś.
                </p>
            )}
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
                            {access.state === 'admin' ? null : payments ? (
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

/** Sekcja logowania: zalogowane ciasteczko zostaje na stronie, wygasła sesja Firebase prosi o ponowne wejście. */
export function LoginGate({ googleLabel }: { googleLabel: string }) {
    const { user, enabled, loading, session, signOut } = useAuth();
    const isClient = useIsClient();
    const search = useClientSearch();
    const pending = isClient ? readSaved() : null;
    const pendingPlan = pending ? PLANS.find((p) => p.id === pending.plan) : undefined;
    const target = search ? safeFrom(search) : '/';

    if (enabled && loading) {
        return (
            <div className="mk-card mk-card-pad flex min-h-12 items-center justify-center" aria-busy="true">
                <Loader2 size={18} className="animate-spin text-mk-muted" aria-hidden />
                <span className="sr-only">Sprawdzam sesję…</span>
            </div>
        );
    }

    if (user && session.status === 'ok') {
        const email = user.email ?? 'to konto';
        return (
            <div className="mk-card mk-card-pad space-y-4 text-center">
                <p className="break-words text-sm font-medium text-mk-text">Zalogowano jako {email}</p>
                <div className="flex flex-col gap-3">
                    <Link href={target} className="mk-btn mk-btn-primary min-h-12 w-full text-base font-semibold">Przejdź do platformy</Link>
                    <button type="button" onClick={() => void signOut()} className="mk-btn min-h-12 w-full text-base font-semibold">Wyloguj</button>
                </div>
            </div>
        );
    }

    return (
        <>
            {user && session.status === 'none' && (
                <p role="status" className="mb-4 text-center text-sm font-medium text-mk-primary-strong">
                    Sesja wygasła — zaloguj się ponownie
                </p>
            )}
            {pendingPlan && (
                <p role="status" className="mb-4 text-center text-sm font-medium text-mk-text">
                    Wybrany plan: {pendingPlan.name}, {pendingPlan.pricePln} zł. Zaloguj się, żeby dokończyć.
                </p>
            )}
            <LoginPanel googleLabel={googleLabel} />
            <p className="mt-4 text-center text-xs leading-relaxed text-mk-faint">
                Logując się, akceptujesz <Link href="/regulamin" className="underline underline-offset-2">regulamin</Link> i
                zasady <Link href="/prywatnosc" className="underline underline-offset-2">prywatności</Link>.
            </p>
        </>
    );
}
