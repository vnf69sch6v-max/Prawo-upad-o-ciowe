'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronDown, Link2, RotateCcw } from 'lucide-react';
import { useCpiFull } from '@/lib/hooks';
import { useIsClient } from '@/lib/use-is-client';
import { useHideOnScroll } from '@/lib/use-hide-on-scroll';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
import { QueryError } from '@/components/ui/QueryState';
import { CPI_DIVISION_FULL_NAMES, CPI_WEIGHTS_2026, CPI_WEIGHTS_SOURCE } from '@/lib/cpi-weights';
import {
    BASKET_PARAM, RESIDUAL_WARN_PP, computePersonalInflation, encodeBasket, gusShares, isGusBasket,
    latestCompleteMonth, parseBasket, parseShareInput, type MonthSnapshot,
} from '@/lib/twoja-inflacja';

const SLIDER_MAX = 100;
const SLIDER_STEP = 0.5;
const URL_DEBOUNCE_MS = 300;
const TOP_ON_PHONE = 5;

const pct = (v: number, d = 1) => `${formatDecimalPL(v, d)}%`;
const signed = (v: number, d = 1) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, d)}`;
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Zapis udziałów w adresie bez nawigacji routera i bez wpisu w historii. */
function writeUrl(shares: readonly number[]) {
    const url = new URL(window.location.href);
    const w = encodeBasket(shares);
    if (w == null) url.searchParams.delete(BASKET_PARAM);
    else url.searchParams.set(BASKET_PARAM, w);
    // Przecinki zostają czytelne w linku (URLSearchParams koduje je jako %2C).
    const search = url.searchParams.toString().replace(/%2C/gi, ',');
    window.history.replaceState(window.history.state, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
}

interface Props {
    /** Miesiąc z cache serwera (ISR). Null w demo/przy pustym cache — wtedy dane dociąga `useCpiFull()`. */
    initial: MonthSnapshot | null;
}

export function TwojaInflacja({ initial }: Props) {
    const isClient = useIsClient();
    const query = useCpiFull(initial == null);
    const snap = useMemo(() => initial ?? latestCompleteMonth(query.data), [initial, query.data]);

    // `?w=` czytamy dopiero po hydratacji: HTML z serwera ma zawsze wagi GUS (bez #418).
    const fromUrl = useMemo(() => (isClient ? parseBasket(window.location.search) : { status: 'none' as const }), [isClient]);
    const [override, setOverride] = useState<number[] | null>(null);
    const shares = override ?? (fromUrl.status === 'ok' ? fromUrl.shares : gusShares());
    const brokenLink = override == null && fromUrl.status === 'invalid';

    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const [copy, setCopy] = useState<'idle' | 'ok' | 'fallback'>('idle');
    const [showAll, setShowAll] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const update = useCallback((next: number[]) => {
        setOverride(next);
        setCopy('idle');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => writeUrl(next), URL_DEBOUNCE_MS);
    }, []);
    const setOne = (i: number, v: number) => update(shares.map((s, j) => (j === i ? v : s)));

    // Przyklejony pasek wyniku na telefonie, gdy karta wyniku wyjedzie poza ekran.
    // Nagłówek (56 px) chowa się przy przewijaniu w dół — pasek jedzie razem z nim, żeby go nie przykrywał.
    const headerHidden = useHideOnScroll();
    const resultRef = useRef<HTMLElement | null>(null);
    const [resultHidden, setResultHidden] = useState(false);
    useEffect(() => {
        const el = resultRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(([e]) => setResultHidden(!e.isIntersecting && e.boundingClientRect.top < 0));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const res = useMemo(() => computePersonalInflation(shares, snap), [shares, snap]);
    const total = shares.reduce((a, b) => a + b, 0);
    const gus = isGusBasket(shares);
    const period = snap ? formatDataPeriod(snap.date) : '';
    const nameOf = (code: string) => CPI_WEIGHTS_2026.find((d) => d.code === code)?.name ?? code;
    const fullName = (code: string) => CPI_DIVISION_FULL_NAMES[code] ?? nameOf(code);

    const copyLink = async () => {
        if (timer.current) { clearTimeout(timer.current); writeUrl(shares); }
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopy('ok');
        } catch {
            setCopy('fallback');
        }
    };

    const loading = !snap && query.isLoading;
    if (!snap && query.isError) return <QueryError onRetry={() => { void query.refetch(); }} />;

    let sentence: string;
    if (!snap) sentence = loading ? 'Wczytywanie danych GUS…' : 'Brak pełnych danych działów za ostatni miesiąc — wynik pojawi się po publikacji GUS.';
    else if (!res) sentence = 'Ustaw co najmniej jeden udział.';
    else if (gus) sentence = 'To wagi koszyka GUS — wynik równy CPI. Zmień udziały poniżej.';
    else if (Math.abs(res.diff) < 0.05) sentence = 'Tyle samo co CPI.';
    else {
        const d = res.driver;
        const w = CPI_WEIGHTS_2026.find((x) => x.code === d.code)!.weight;
        sentence = `O ${formatDecimalPL(Math.abs(res.diff), 1)} p.p. ${res.diff > 0 ? 'wyżej' : 'niżej'} niż CPI — głównie przez ${lower(nameOf(d.code))} (${signed(d.yoy)}% r/r): ${d.share > w ? 'większy' : 'mniejszy'} udział niż w koszyku GUS daje ${signed(d.vsCpi, 1)} p.p.`;
    }

    const contributions = res?.contributions ?? [];
    const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.pp)), Math.abs(res?.residual ?? 0), 0.01);
    const visible = showAll ? contributions : contributions.slice(0, TOP_ON_PHONE);
    const rateText = res ? pct(res.rate) : '—';
    const cpiText = snap ? pct(snap.cpi) : '—';

    const contribCard = (
        <SectionCard editorial titleVariant="label" title="Co napędza Twoją inflację" subtitle={`wkład działów (p.p., przybliżenie)${period ? ` · ${period}` : ''}`}>
            {!res ? (
                <p className="text-sm text-mk-muted">{loading ? 'Wczytywanie…' : '—'}</p>
            ) : (
                <>
                    <ul className="space-y-1" data-testid="contributions">
                        {contributions.map((c, idx) => (
                            <li key={c.code} className={`flex min-h-8 items-center gap-2 ${idx >= TOP_ON_PHONE && !showAll ? 'max-lg:hidden' : ''}`}>
                                <span className="w-[42%] max-w-[11rem] shrink-0 truncate text-[13px] text-mk-text" title={fullName(c.code)}>
                                    <span className="mr-1 text-mk-faint">{c.code}</span>{nameOf(c.code)}
                                </span>
                                <span className="h-2.5 min-w-0 flex-1 rounded-full bg-mk-surface-alt">
                                    <span className="block h-2.5 rounded-full" style={{ width: `${(Math.abs(c.pp) / maxAbs) * 100}%`, background: c.pp >= 0 ? '#D97706' : '#16A34A' }} />
                                </span>
                                <span className="w-16 shrink-0 text-right text-[13px] font-semibold tnum text-mk-text">{signed(c.pp, 2)}</span>
                            </li>
                        ))}
                        <li className="flex min-h-8 items-center gap-2 border-t border-mk-border pt-1">
                            <a href="#jak-liczymy" className="flex-1 text-[13px] text-mk-muted underline-offset-2 hover:underline">Reszta metody</a>
                            <span className="w-16 shrink-0 text-right text-[13px] tnum text-mk-muted" data-testid="residual">{signed(res.residual, 2)}</span>
                        </li>
                    </ul>
                    {visible.length < contributions.length && (
                        <button type="button" className="mk-btn mt-2 w-full touch:min-h-11 !py-1.5 text-[13px] lg:hidden" onClick={() => setShowAll(true)}>
                            Pokaż wszystkie {contributions.length}
                        </button>
                    )}
                </>
            )}
        </SectionCard>
    );

    return (
        <div className="space-y-4">
            <div className="-mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link href="/ceny?tab=inflacja" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-mk-muted hover:text-mk-text lg:min-h-0">
                    <ArrowLeft size={16} aria-hidden /> Ceny
                </Link>
                <span className="text-sm text-mk-muted" data-testid="period-line">{period ? `Dane za ${period} · GUS` : 'GUS'}</span>
            </div>

            {resultHidden && res && (
                <div className={`fixed inset-x-0 z-30 border-b border-mk-border bg-mk-surface/95 px-4 py-2 shadow-sm backdrop-blur-sm transition-[top] duration-200 ease-out motion-reduce:transition-none lg:hidden ${headerHidden ? 'top-[env(safe-area-inset-top)]' : 'top-[calc(env(safe-area-inset-top)+3.5rem)]'}`}
                    data-testid="sticky-result" aria-hidden>
                    <p className="text-sm font-semibold tnum text-mk-text">Twoja {rateText} <span className="font-normal text-mk-muted">· CPI {cpiText}</span></p>
                </div>
            )}

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
                {/* Wynik i wkłady: na telefonie najpierw, na desktopie prawa kolumna przyklejona. */}
                <div className="space-y-4 lg:sticky lg:top-[var(--mk-sticky-top)] lg:order-2 lg:col-span-5">
                    <section ref={resultRef} aria-label="Twoja inflacja wobec CPI" className="mk-card mk-card-pad">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-mk-text-soft">Twoja inflacja</p>
                                <p className="text-4xl font-extrabold tnum text-mk-text" data-testid="personal-rate">{rateText}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-mk-text-soft">CPI GUS</p>
                                <p className="text-2xl font-bold tnum text-mk-muted sm:text-3xl" data-testid="official-rate">{cpiText}</p>
                                <p className="text-xs text-mk-muted">r/r{period ? ` · ${period}` : ''}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-mk-text" data-testid="result-sentence">{sentence}</p>
                        {brokenLink && <p className="mt-2 text-sm font-medium text-amber-700" role="status">Link był niepełny — pokazujemy wagi GUS.</p>}
                        {res && Math.abs(res.residual) > RESIDUAL_WARN_PP && (
                            <p className="mt-2 text-xs text-amber-700">W tym miesiącu przybliżenie jest mniej dokładne (reszta {signed(res.residual, 2)} p.p.).</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" className="mk-btn touch:min-h-11 !px-3 !py-1.5 text-[13px]" disabled={gus} onClick={() => update(gusShares())}>
                                <RotateCcw size={14} aria-hidden /> Wagi GUS
                            </button>
                            <button type="button" className="mk-btn touch:min-h-11 !px-3 !py-1.5 text-[13px]" onClick={() => { void copyLink(); }}>
                                {copy === 'ok' ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />} Kopiuj link
                            </button>
                            <span className="sr-only" aria-live="polite">{copy === 'ok' ? 'Skopiowano link' : ''}</span>
                            {copy === 'ok' && <span className="self-center text-[13px] font-medium text-mk-green" aria-hidden>Skopiowano link</span>}
                        </div>
                        {copy === 'fallback' && isClient && (
                            <input readOnly aria-label="Link do Twojego koszyka" className="mk-input mt-2 text-[13px]" value={window.location.href}
                                onFocus={(e) => e.currentTarget.select()} autoFocus />
                        )}
                        <p className="mt-3 text-[11px] leading-snug text-mk-muted" data-testid="source-line">
                            Źródło: GUS — wskaźniki cen towarów i usług konsumpcyjnych (DBW), dane za {period || '—'}; wagi: {CPI_WEIGHTS_SOURCE.label}. Obliczenia: Savori.
                        </p>
                    </section>

                    <div className="max-lg:hidden">{contribCard}</div>
                </div>

                <div className="min-w-0 lg:order-1 lg:col-span-7">
                    <SectionCard editorial titleVariant="label" title="Twoje wydatki" subtitle={`udział w miesięcznych wydatkach (%) · start = wagi GUS ${CPI_WEIGHTS_SOURCE.year}`}>
                        <p className="mb-2 text-[13px] leading-snug text-mk-text-soft">
                            Udział = część Twoich miesięcznych wydatków na konsumpcję (bez oszczędności, rat kapitału i podatków).
                        </p>
                        <p className={`mb-3 text-sm font-semibold tnum ${Math.abs(total - 100) < 0.005 ? 'text-mk-text' : 'text-amber-700'}`} data-testid="basket-total">
                            {total <= 0
                                ? 'Suma: 0% — ustaw co najmniej jeden udział'
                                : Math.abs(total - 100) < 0.005
                                    ? 'Suma: 100%'
                                    : `Suma: ${pct(total, total % 1 === 0 ? 0 : 2)} — przeliczamy proporcjonalnie do 100%`}
                        </p>
                        <ul className="divide-y divide-mk-border">
                            {CPI_WEIGHTS_2026.map((d, i) => {
                                const v = shares[i] ?? 0;
                                const yoy = snap?.yoy[d.code];
                                const id = `basket-${d.code}`;
                                const draft = drafts[i];
                                return (
                                    <li key={d.code} className="py-2.5 lg:grid lg:grid-cols-[minmax(0,13rem)_4.5rem_minmax(0,1fr)_5rem] lg:items-center lg:gap-3 lg:py-1.5">
                                        <div className="flex items-baseline justify-between gap-2 lg:contents">
                                            <label htmlFor={id} className="min-w-0 truncate text-sm font-medium text-mk-text" title={fullName(d.code)}>
                                                <span className="mr-1 text-mk-faint">{d.code}</span>{d.name}
                                            </label>
                                            <span className={`shrink-0 text-[13px] font-semibold tnum lg:text-right ${yoy == null ? 'text-mk-muted' : yoy > 0 ? 'text-amber-700' : 'text-mk-green'}`}>
                                                {yoy == null ? '—' : `${signed(yoy)}% r/r`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 lg:contents">
                                            <input id={id} type="range" min={0} max={SLIDER_MAX} step={SLIDER_STEP} value={v}
                                                onChange={(e) => setOne(i, Number(e.target.value))}
                                                aria-label={`${fullName(d.code)} — udział w wydatkach`}
                                                aria-valuetext={`${formatDecimalPL(v, 2)} procent wydatków`}
                                                className="mk-range min-w-0 flex-1" style={{ ['--pct' as string]: `${(v / SLIDER_MAX) * 100}%` }} />
                                            <span className="relative w-[5rem] shrink-0">
                                                <input type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done"
                                                    aria-label={`${fullName(d.code)} — udział w procentach`}
                                                    className="mk-input touch:min-h-11 !py-1.5 !pl-2 !pr-6 text-right tnum"
                                                    value={draft ?? formatDecimalPL(v, v % 1 === 0 ? 0 : 2)}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        setDrafts((m) => ({ ...m, [i]: raw }));
                                                        const n = parseShareInput(raw);
                                                        if (n != null) setOne(i, n);
                                                    }}
                                                    onBlur={() => setDrafts((m) => { const next = { ...m }; delete next[i]; return next; })} />
                                                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-mk-muted" aria-hidden>%</span>
                                            </span>
                                        </div>
                                        {Math.abs(v - d.weight) >= 0.005 && (
                                            <p className="mt-0.5 text-xs text-mk-muted tnum lg:col-span-4 lg:mt-0">waga GUS {formatDecimalPL(d.weight, 2)}%</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </SectionCard>
                </div>
                <div className="lg:hidden">{contribCard}</div>
            </div>

            <details id="jak-liczymy" className="mk-card mk-card-pad group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-mk-text">
                    Jak to liczymy <ChevronDown size={16} aria-hidden className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-mk-text-soft">
                    <p>
                        Twoja inflacja to <strong>przybliżenie: ważona średnia r/r działów</strong>. Mnożymy roczną zmianę cen każdego z 13 działów
                        koszyka (GUS, COICOP 2018) przez Twój udział wydatków (przeliczony do 100%) i sumujemy. Wkład działu = udział × zmiana cen.
                    </p>
                    {res && snap && (
                        <p>
                            GUS liczy indeks łańcuchowo (wagi {CPI_WEIGHTS_SOURCE.year} względem grudnia {CPI_WEIGHTS_SOURCE.year - 1}), więc ten sam wzór na wagach GUS
                            daje {formatDecimalPL(res.gusSum, 2)}%, a GUS podaje {formatDecimalPL(snap.cpi, 1)}% za {period}. Różnicę {signed(res.residual, 2)} p.p. („reszta metody”)
                            dodajemy do każdego koszyka — dzięki temu przy wagach GUS wynik jest równy CPI.
                        </p>
                    )}
                    <p>
                        Ograniczenie: w środku działu struktura jest GUS-owska. „Transport” to średni koszyk paliwa, aut i biletów — kto jeździ tylko
                        pociągiem, ma inną inflację niż średnia działu.
                    </p>
                    <p>
                        Koszyk zapisujemy tylko w adresie strony (do udostępnienia) — nic nie trafia na serwer.{' '}
                        <a href={CPI_WEIGHTS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-medium text-mk-text underline underline-offset-2">
                            Komunikat GUS z tabelą wag
                        </a>.
                    </p>
                </div>
            </details>
        </div>
    );
}
