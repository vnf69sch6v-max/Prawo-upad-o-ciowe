import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Activity, BarChart3, Briefcase, CalendarClock, FileSpreadsheet, Globe2, Landmark, Lock, ShieldCheck, Sparkles, TrendingUp, Zap,
} from 'lucide-react';
import { peekServerCache } from '@/lib/server-cache';
import { trialDays } from '@/lib/access';
import { LoginPanel } from '@/components/auth/LoginPanel';
import { AccessNotice, PaymentReturn, PricingCards, PricingNote, StartCta } from '@/components/landing/LandingClient';
import { SITE_URL } from '@/lib/internal-fetch';
import { paymentsEnabled } from '@/lib/stripe/billing';

// Strona startowa płatnej platformy pod /start: niezalogowanych przekierowuje tu bramka (src/middleware.ts,
// domyślnie włączona — src/lib/auth/flags.ts) z każdej strony platformy, także z `/`. ISR jak /japonia: liczby z cache w Firestore
// (peekServerCache), nigdy ze źródła w renderze strony.
export const revalidate = 1800;

const days = trialDays();
const TRIAL = days > 0 ? `${days} dni za darmo` : 'bez okresu próbnego';

export const metadata: Metadata = {
    title: 'Savori — gospodarka Polski i Japonii w liczbach',
    description: `Inflacja, rynek pracy, produkcja, stopy, kursy i giełda — prosto z GUS, NBP i Eurostatu, w dniu publikacji. Od 5 zł miesięcznie, ${TRIAL}.`,
    alternates: { canonical: `${SITE_URL}/start` },
};

interface Point { date: string; value: number }

const MONTH = /^\d{4}-\d{2}$/;

/** Ostatnie 12 miesięcy CPI r/r w Polsce (cache `/api/gus-cpi-full`: `headline[].yoy`, w %). */
async function plCpi(): Promise<Point[]> {
    const year = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Warsaw', year: 'numeric' }).format(new Date()));
    for (const y of [year, year - 1]) {
        const p = await peekServerCache<{ headline?: { date?: string; yoy?: number }[] }>('dbw', `gus_cpi_full_${y}_v5`);
        const rows = (p?.headline ?? []).filter((r): r is { date: string; yoy: number } => MONTH.test(r.date ?? '') && typeof r.yoy === 'number');
        if (rows.length) return rows.slice(-12).map((r) => ({ date: r.date, value: r.yoy }));
    }
    return [];
}

/** Ostatnie 12 miesięcy CPI r/r w Japonii (cache `/api/jp/cpi`). */
async function jpCpi(): Promise<Point[]> {
    const p = await peekServerCache<{ series?: { headline?: Point[] } }>('jp_data', 'cpi_v2');
    return (p?.series?.headline ?? []).filter((r) => MONTH.test(r.date) && typeof r.value === 'number').slice(-12);
}

const MONTHS_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const monthLabel = (d: string) => `${MONTHS_PL[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`;

/** Mini-wykres liniowy w czystym SVG (bez biblioteki): 12 punktów, wypełnienie pod linią. */
function Spark({ points, color }: { points: Point[]; color: string }) {
    if (points.length < 2) {
        // Brak danych w cache (np. świeża baza) — spokojna linia zamiast pustego pola.
        return (
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full" aria-hidden>
                <path d="M0,24 L100,24" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    }
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const xy = points.map((p, i) => [(i / (points.length - 1)) * 100, 36 - ((p.value - min) / span) * 30] as const);
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const id = `g${color.replace('#', '')}`;
    return (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full" aria-hidden>
            <defs>
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${line} L100,40 L0,40 Z`} fill={`url(#${id})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
    );
}

function LiveTile({ label, flag, points, color }: { label: string; flag: string; points: Point[]; color: string }) {
    const last = points.at(-1);
    const prev = points.at(-2);
    const delta = last && prev ? Math.round((last.value - prev.value) * 10) / 10 : null;
    return (
        <div className="rounded-2xl border border-mk-border bg-white p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-mk-muted">
                <span>{flag} {label}</span>
                {last && <span>{monthLabel(last.date)}</span>}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-mk-text">{last ? pct(last.value) : '—'}</span>
                {delta !== null && (
                    <span className={`text-xs font-semibold ${delta > 0 ? 'text-mk-negative' : delta < 0 ? 'text-emerald-600' : 'text-mk-muted'}`}>
                        {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta).toFixed(1).replace('.', ',')} p.p.
                    </span>
                )}
            </div>
            <Spark points={points} color={color} />
        </div>
    );
}

const FEATURES = [
    { icon: Sparkles, title: 'Przegląd dnia', text: 'Najważniejsze odczyty ułożone według świeżości i siły zmiany — z wnioskiem w jednym zdaniu.' },
    { icon: TrendingUp, title: 'Inflacja do kości', text: 'CPI, PPI, koszyk COICOP i wkłady grup — co naprawdę pcha ceny w górę.' },
    { icon: Briefcase, title: 'Praca i produkcja', text: 'Bezrobocie, płace, przemysł, budownictwo, sprzedaż detaliczna — w cenach stałych, jak w komunikatach GUS.' },
    { icon: Landmark, title: 'Rynki i stopy', text: 'Kursy NBP, WIBOR, rentowności, WIG20 i spółki, newsy finansowe w jednym strumieniu.' },
    { icon: Globe2, title: 'Japonia', text: 'Inflacja i jej rozbicie na energię i żywność, cel BOJ 2% — źródło: Statistics Bureau of Japan.' },
    { icon: FileSpreadsheet, title: 'Parser sprawozdań', text: 'Wrzuć PDF lub XLSX spółki, dostań wskaźniki i eksport — pliki nie są nigdzie zapisywane.' },
];

const WHY = [
    { icon: Zap, title: 'W dniu publikacji', text: 'Automaty pobierają dane po każdym komunikacie GUS, NBP i Eurostatu, a kontrola świeżości pilnuje, by nic nie utknęło.' },
    { icon: Activity, title: 'Liczby, nie szum', text: 'Każda liczba ze źródłem i datą. Zero clickbaitu, zero reklam, zero „ekspertów”.' },
    { icon: ShieldCheck, title: 'Bezpieczeństwo', text: 'Logowanie Google, szyfrowanie AES-256 w bazie, żadnych narzędzi śledzących. Twoje dane zostają Twoje.' },
];

const faqItems = (payments: boolean) => [
    { q: 'Czy płatność odnawia się automatycznie?', a: 'Nie. Każdy plan to jednorazowa płatność za wybrany okres. Gdy się skończy, sam decydujesz, czy przedłużyć.' },
    ...(payments ? [{ q: 'Jak zapłacę?', a: 'Na stronie Stripe: kartą, a jeśli włączone — BLIK-iem albo szybkim przelewem. Danych karty nie widzimy. Dostęp liczymy w miesiącach kalendarzowych i włączamy po zaksięgowaniu płatności. Pokwitowanie z informacją o 14 dniach na odstąpienie przychodzi na e-mail.' }] : []),
    { q: 'Co dostaję w okresie próbnym?', a: `Pełny dostęp do wszystkich funkcji przez ${days} dni od pierwszego logowania. Bez podawania karty.` },
    { q: 'Skąd są dane?', a: 'Z oficjalnych źródeł: GUS (DBW i BDL), NBP, Eurostat, Statistics Bureau of Japan, notowania giełdowe. Każdy wskaźnik pokazuje źródło i okres.' },
    { q: 'Czy to porada inwestycyjna?', a: 'Nie. Savori pokazuje dane i ich interpretację statystyczną. Decyzje inwestycyjne podejmujesz samodzielnie.' },
    { q: 'Czy działa na telefonie?', a: 'Tak — Savori jest projektowane najpierw pod telefon. Możesz też dodać je do ekranu głównego jak aplikację.' },
    { q: 'Jak odstąpić od umowy lub złożyć reklamację?', a: 'Napisz do nas — zasady są w regulaminie. Odpowiadamy w ciągu 14 dni.' },
];

export default async function StartPage() {
    const [pl, jp] = await Promise.all([plCpi(), jpCpi()]);
    const ctaLabel = days > 0 ? `Zacznij — ${TRIAL}` : 'Zaloguj się';
    const payments = paymentsEnabled();

    return (
        <div className="min-h-dvh overflow-x-clip bg-white text-mk-text">
            {/* Tło: delikatne poświaty w kolorach marki */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
                style={{ background: 'radial-gradient(50% 60% at 15% 0%, rgba(220,38,38,0.10) 0%, transparent 70%), radial-gradient(40% 50% at 90% 10%, rgba(37,99,235,0.10) 0%, transparent 70%)' }} />

            <header className="sticky top-0 z-30 border-b border-transparent bg-white/75 pt-[env(safe-area-inset-top)] backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href="/start" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mk-primary text-white shadow-sm">
                            <BarChart3 size={20} strokeWidth={2.4} aria-hidden />
                        </span>
                        Savori
                    </Link>
                    <nav className="hidden items-center gap-7 text-sm font-medium text-mk-text-soft md:flex">
                        <a href="#funkcje" className="hover:text-mk-text">Funkcje</a>
                        <a href="#cennik" className="hover:text-mk-text">Cennik</a>
                        <a href="#faq" className="hover:text-mk-text">FAQ</a>
                    </nav>
                    <StartCta label="Zaloguj się" className="mk-btn min-h-11 px-4 text-sm font-semibold" />
                </div>
            </header>

            <main className="relative">
                {/* HERO */}
                <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-mk-border bg-white/80 px-3 py-1 text-xs font-semibold text-mk-text-soft shadow-sm">
                            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                            Dane aktualizowane w dniu publikacji
                        </p>
                        <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                            Gospodarka w liczbach.<br />
                            <span className="bg-gradient-to-r from-mk-primary to-rose-500 bg-clip-text text-transparent">Zanim powie o niej rynek.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-mk-text-soft">
                            Inflacja, rynek pracy, produkcja, stopy, kursy i giełda — prosto z GUS, NBP i Eurostatu, plus Japonia.
                            Jedno miejsce, czyste wykresy i wniosek w jednym zdaniu.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <StartCta label={ctaLabel} className="mk-btn mk-btn-primary min-h-13 px-7 text-base font-semibold shadow-[0_10px_30px_-10px_rgba(220,38,38,0.6)]" />
                            <a href="#cennik" className="mk-btn min-h-13 px-7 text-base font-semibold">Zobacz cennik</a>
                        </div>
                        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mk-muted">
                            <span className="inline-flex items-center gap-1.5"><Lock size={14} aria-hidden /> Logowanie Google</span>
                            <span>od 5 zł / mies.</span>
                            <span>bez automatycznego odnawiania</span>
                        </p>
                    </div>

                    {/* Podgląd produktu z prawdziwymi liczbami */}
                    <div className="relative">
                        <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-mk-primary/15 via-transparent to-blue-500/15 blur-2xl" />
                        <div className="relative rounded-[1.75rem] border border-mk-border bg-mk-bg/90 p-4 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5">
                            <div className="mb-4 flex items-center gap-1.5 px-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-3 text-xs font-medium text-mk-faint">savori.space · Przegląd</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <LiveTile label="Inflacja CPI r/r" flag="🇵🇱" points={pl} color="#DC2626" />
                                <LiveTile label="Inflacja CPI r/r" flag="🇯🇵" points={jp} color="#2563EB" />
                            </div>
                            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-mk-border bg-white p-4">
                                <CalendarClock size={20} className="mt-0.5 shrink-0 text-mk-primary" aria-hidden />
                                <p className="text-sm leading-relaxed text-mk-text-soft">
                                    <span className="font-semibold text-mk-text">Wniosek dnia:</span> nowe odczyty pojawiają się w dniu
                                    komunikatu — z porównaniem do poprzedniego miesiąca i celu banku centralnego.
                                </p>
                            </div>
                            <p className="mt-3 px-1 text-[11px] text-mk-faint">Liczby na żywo z cache Savori · źródła: GUS DBW, Statistics Bureau of Japan</p>
                        </div>
                    </div>
                </section>

                {/* ŹRÓDŁA */}
                <section className="border-y border-mk-border bg-mk-bg/60">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm font-semibold tracking-wide text-mk-muted sm:px-6">
                        <span className="text-xs font-medium uppercase text-mk-faint">Dane z</span>
                        <span>GUS</span><span>NBP</span><span>Eurostat</span><span>Statistics Bureau of Japan</span><span>GPW</span>
                    </div>
                </section>

                {/* FUNKCJE */}
                <section id="funkcje" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
                    <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Wszystko, co mówi o gospodarce. W jednym miejscu.</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-mk-muted">Zamiast dziesięciu kart z komunikatami — jedna platforma, która czyta je za Ciebie.</p>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="group rounded-3xl border border-mk-border bg-white p-6 transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)]">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mk-primary-soft text-mk-primary transition-transform group-hover:scale-105">
                                    <Icon size={22} aria-hidden />
                                </span>
                                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                                <p className="mt-1.5 text-[15px] leading-relaxed text-mk-text-soft">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DLACZEGO */}
                <section className="bg-mk-text text-white">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
                        {WHY.map(({ icon: Icon, title, text }) => (
                            <div key={title}>
                                <Icon size={26} className="text-rose-400" aria-hidden />
                                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                                <p className="mt-2 leading-relaxed text-white/75">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CENNIK */}
                <section id="cennik" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
                    <PaymentReturn />
                    <AccessNotice />
                    <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Prosty cennik. Bez pułapek.</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-mk-muted">
                        Płacisz raz za wybrany okres — bez subskrypcji i automatycznego odnawiania. Każdy plan to pełny dostęp.
                    </p>
                    <div className="mt-14"><PricingCards ctaLabel={ctaLabel} payments={payments} /></div>
                    <PricingNote payments={payments} />
                </section>

                {/* LOGOWANIE */}
                <section id="logowanie" className="scroll-mt-20 border-t border-mk-border bg-mk-bg/60">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Zacznij w 10 sekund.</h2>
                            <p className="mt-3 max-w-md text-lg text-mk-text-soft">Jedno kliknięcie z kontem Google. {days > 0 ? `Pierwsze ${days} dni na nasz koszt — bez karty.` : ''}</p>
                            <ul className="mt-6 space-y-3 text-mk-text-soft">
                                <li className="flex gap-3"><ShieldCheck size={20} className="shrink-0 text-mk-primary" aria-hidden />Nie znamy Twojego hasła do Google — logowanie obsługuje Google.</li>
                                <li className="flex gap-3"><Lock size={20} className="shrink-0 text-mk-primary" aria-hidden />Dane konta: e-mail, imię i zdjęcie. Nic więcej.</li>
                            </ul>
                        </div>
                        <div className="mx-auto w-full max-w-[420px]">
                            <LoginPanel googleLabel={days > 0 ? `Zacznij z Google — ${TRIAL}` : 'Zaloguj się przez Google'} />
                            <p className="mt-4 text-center text-xs leading-relaxed text-mk-faint">
                                Logując się, akceptujesz <Link href="/regulamin" className="underline underline-offset-2">regulamin</Link> i
                                zasady <Link href="/prywatnosc" className="underline underline-offset-2">prywatności</Link>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
                    <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Pytania</h2>
                    <div className="mt-10 divide-y divide-mk-border rounded-3xl border border-mk-border bg-white">
                        {faqItems(payments).map(({ q, a }) => (
                            <details key={q} className="group px-5 sm:px-6">
                                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                                    {q}
                                    <span className="text-xl leading-none text-mk-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
                                </summary>
                                <p className="pb-5 leading-relaxed text-mk-text-soft">{a}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-mk-border">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-mk-muted sm:flex-row sm:px-6">
                    <span>© 2026 Savori</span>
                    <nav className="flex gap-6">
                        <Link href="/regulamin" className="min-h-11 py-2.5 hover:text-mk-text">Regulamin</Link>
                        <Link href="/prywatnosc" className="min-h-11 py-2.5 hover:text-mk-text">Prywatność</Link>
                        <Link href="/status" className="min-h-11 py-2.5 hover:text-mk-text">Status danych</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
