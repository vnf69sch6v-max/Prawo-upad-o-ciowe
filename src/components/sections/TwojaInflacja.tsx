'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Link2, RotateCcw, Scale } from 'lucide-react';
import { useCpiFull } from '@/lib/hooks';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
import { QueryError } from '@/components/ui/QueryState';
import { CPI_WEIGHTS_2026, CPI_WEIGHTS_SOURCE } from '@/lib/cpi-weights';
import {
    BASKET_PARAM, computePersonalInflation, encodeBasket, gusShares, isGusBasket, methodGap, normalizeTo100, parseBasket,
} from '@/lib/twoja-inflacja';

const SLIDER_MAX = 60; // %: największa waga GUS to ~27%; 60% mieści skrajne koszyki (np. czynsz + żywność)
const SLIDER_STEP = 0.5;

const signed = (v: number, d = 1) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, d)}`;

/** Zapis udziałów w adresie bez nawigacji (Next synchronizuje `useSearchParams` z `history.replaceState`). */
function writeUrl(shares: number[] | null) {
    const url = new URL(window.location.href);
    if (shares == null || isGusBasket(shares)) url.searchParams.delete(BASKET_PARAM);
    else url.searchParams.set(BASKET_PARAM, encodeBasket(shares));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function TwojaInflacja() {
    const params = useSearchParams();
    // Stan startowy z adresu (link od znajomego) albo wagi GUS. Dalej źródłem prawdy jest stan, adres go odbija.
    const [shares, setShares] = useState<number[]>(() => parseBasket(params.get(BASKET_PARAM)) ?? gusShares());
    const [copied, setCopied] = useState(false);
    const { data, isLoading, isError, refetch } = useCpiFull();

    const update = useCallback((next: number[]) => { setShares(next); writeUrl(next); setCopied(false); }, []);
    const setOne = (i: number, v: number) => update(shares.map((s, j) => (j === i ? v : s)));

    const dataDate = data?.dataDate ?? '';
    const readings = useMemo(() => (data?.divisions ?? []).map((d) => ({ code: d.code, yoy: d.yoy })), [data]);
    const official = useMemo(() => {
        const h = data?.headline.find((p) => p.date === dataDate);
        return h?.yoy ?? null;
    }, [data, dataDate]);
    const result = useMemo(() => computePersonalInflation(shares, readings), [shares, readings]);
    const gap = useMemo(() => methodGap(readings, official), [readings, official]);
    const nameOf = useMemo(() => new Map(CPI_WEIGHTS_2026.map((d) => [d.code, d.name])), []);
    const yoyOf = useMemo(() => new Map(readings.map((r) => [r.code, r.yoy])), [readings]);

    const total = shares.reduce((a, b) => a + b, 0);
    const gus = isGusBasket(shares);
    const diff = result.rate != null && official != null ? result.rate - official : null;
    const sorted = [...result.contributions].filter((c) => c.pp != null).sort((a, b) => (b.pp ?? 0) - (a.pp ?? 0));
    const maxAbs = Math.max(...sorted.map((c) => Math.abs(c.pp ?? 0)), 0.01);
    const period = dataDate ? formatDataPeriod(dataDate) : '';

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    if (isError && !data) {
        return <QueryError onRetry={() => { void refetch(); }} />;
    }

    return (
        <div className="space-y-4">
            <Link href="/ceny?tab=inflacja" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-mk-muted hover:text-mk-text lg:min-h-0">
                <ArrowLeft size={16} aria-hidden /> Inflacja CPI
            </Link>

            {/* Wynik: Twoja inflacja obok oficjalnego CPI, ten sam miesiąc. */}
            <section aria-label="Twoja inflacja wobec CPI" className="mk-card mk-card-pad">
                <p className="text-xs font-semibold uppercase tracking-wide text-mk-muted">
                    {period ? `${period} · r/r` : 'r/r'} · GUS DBW
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-mk-text-soft">Twoja inflacja</p>
                        <p className="text-4xl font-extrabold tnum text-mk-text sm:text-5xl" data-testid="personal-rate">
                            {isLoading || result.rate == null ? '—' : `${formatDecimalPL(result.rate, 1)}%`}
                        </p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-mk-text-soft">CPI (GUS)</p>
                        <p className="text-4xl font-extrabold tnum text-mk-muted sm:text-5xl" data-testid="official-rate">
                            {official == null ? '—' : `${formatDecimalPL(official, 1)}%`}
                        </p>
                    </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mk-text-soft">
                    {diff == null
                        ? 'Ustaw udziały wydatków poniżej — wynik liczymy z dynamik cen 13 działów koszyka GUS.'
                        : Math.abs(diff) < 0.05
                            ? `Twój koszyk drożeje w tym samym tempie co koszyk GUS.`
                            : `Twój koszyk drożeje o ${formatDecimalPL(Math.abs(diff), 1)} p.p. ${diff > 0 ? 'szybciej' : 'wolniej'} niż przeciętny koszyk GUS.`}
                    {sorted[0]?.pp != null && ` Najwięcej dokłada ${(nameOf.get(sorted[0].code) ?? '').toLowerCase()} (${signed(sorted[0].pp, 2)} p.p.).`}
                </p>
                {result.missingShare > 0.05 && (
                    <p className="mt-2 text-xs text-mk-muted">
                        Działy bez odczytu za {period || 'ten miesiąc'} ({formatDecimalPL(result.missingShare, 1)}% Twojego koszyka) pominięto.
                    </p>
                )}
            </section>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <SectionCard editorial titleVariant="label" title="Twoje wydatki"
                    subtitle={`udział w miesięcznych wydatkach (%) · start = wagi GUS ${CPI_WEIGHTS_SOURCE.year}`}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold tnum ${Math.abs(total - 100) < 0.05 ? 'text-mk-text' : 'text-amber-700'}`} data-testid="basket-total">
                            Suma: {formatDecimalPL(total, 1)}%
                        </span>
                        {Math.abs(total - 100) >= 0.05 && (
                            <button type="button" className="mk-btn touch:min-h-11 !px-3 !py-1.5 text-[13px]" onClick={() => update(normalizeTo100(shares))}>
                                <Scale size={14} aria-hidden /> Wyrównaj do 100%
                            </button>
                        )}
                        <span className="ml-auto flex flex-wrap gap-2">
                            <button type="button" className="mk-btn touch:min-h-11 !px-3 !py-1.5 text-[13px]" disabled={gus}
                                onClick={() => update(gusShares())}>
                                <RotateCcw size={14} aria-hidden /> Wagi GUS
                            </button>
                            <button type="button" className="mk-btn touch:min-h-11 !px-3 !py-1.5 text-[13px]" onClick={() => { void copyLink(); }}>
                                {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />} {copied ? 'Skopiowano' : 'Kopiuj link'}
                            </button>
                        </span>
                    </div>
                    {Math.abs(total - 100) >= 0.05 && (
                        <p className="mb-3 text-xs text-mk-muted">Suma nie musi wynosić 100% — liczymy proporcje między działami.</p>
                    )}
                    <ul className="space-y-3">
                        {CPI_WEIGHTS_2026.map((d, i) => {
                            const v = shares[i] ?? 0;
                            const pct = (Math.min(v, SLIDER_MAX) / SLIDER_MAX) * 100;
                            const yoy = yoyOf.get(d.code);
                            const id = `basket-${d.code}`;
                            return (
                                <li key={d.code}>
                                    <div className="flex items-baseline justify-between gap-3">
                                        <label htmlFor={id} className="min-w-0 truncate text-sm font-medium text-mk-text" title={d.name}>
                                            <span className="mr-1 text-mk-faint">{d.code}</span>{d.name}
                                        </label>
                                        <span className="shrink-0 text-base font-bold tnum text-mk-text">{formatDecimalPL(v, 1)}%</span>
                                    </div>
                                    <input id={id} type="range" min={0} max={SLIDER_MAX} step={SLIDER_STEP} value={Math.min(v, SLIDER_MAX)}
                                        onChange={(e) => setOne(i, Number(e.target.value))}
                                        aria-valuetext={`${formatDecimalPL(v, 1)} procent wydatków`}
                                        className="mk-range" style={{ ['--pct' as string]: `${pct}%` }} />
                                    <p className="text-xs text-mk-muted tnum">
                                        GUS {formatDecimalPL(d.weight, 1)}% · ceny {yoy == null ? '—' : `${signed(yoy)}% r/r`}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </SectionCard>

                <div className="space-y-4 lg:sticky lg:top-[var(--mk-sticky-top)]">
                    <SectionCard editorial titleVariant="label" title="Wkład działów"
                        subtitle={`p.p. Twojej inflacji${period ? ` · ${period}` : ''}`}>
                        {sorted.length === 0 ? (
                            <p className="text-sm text-mk-muted">{isLoading ? 'Wczytywanie danych GUS…' : 'Brak odczytów działów.'}</p>
                        ) : (
                            <ul className="space-y-1" data-testid="contributions">
                                {sorted.map((c) => {
                                    const pp = c.pp ?? 0;
                                    return (
                                        <li key={c.code} className="flex min-h-9 items-center gap-2">
                                            <span className="w-[42%] max-w-[11rem] shrink-0 truncate text-[13px] text-mk-text" title={nameOf.get(c.code)}>
                                                <span className="mr-1 text-mk-faint">{c.code}</span>{nameOf.get(c.code)}
                                            </span>
                                            <span className="h-2.5 min-w-0 flex-1 rounded-full bg-mk-surface-alt">
                                                <span className="block h-2.5 rounded-full" style={{ width: `${(Math.abs(pp) / maxAbs) * 100}%`, background: pp >= 0 ? '#D97706' : '#16A34A' }} />
                                            </span>
                                            <span className="w-14 shrink-0 text-right text-[13px] font-semibold tnum text-mk-text">{signed(pp, 2)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </SectionCard>

                    <SectionCard editorial titleVariant="label" title="Jak liczymy">
                        <div className="space-y-2 text-[13px] leading-relaxed text-mk-text-soft">
                            <p>
                                Twoja inflacja to średnia dynamik cen r/r 13 działów koszyka (GUS, COICOP 2018) ważona Twoimi udziałami wydatków.
                                Wkład działu = jego udział × dynamika cen.
                            </p>
                            <p>
                                To przybliżenie: GUS liczy indeks łańcuchowo, z wagami tego roku wobec grudnia poprzedniego.
                                {gap != null && ` Ten sam wzór na wagach GUS daje ${formatDecimalPL(official! + gap, 1)}% wobec oficjalnych ${formatDecimalPL(official!, 1)}% (różnica ${signed(gap, 2)} p.p.).`}
                            </p>
                            <p className="text-xs text-mk-muted">
                                Wagi: {CPI_WEIGHTS_SOURCE.label}. Dynamiki działów: GUS, Dziedzinowa Baza Wiedzy (przekrój 1698){period ? `, ${period}` : ''}.
                                Koszyk zapisujemy tylko w adresie strony — nic nie trafia na serwer.
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
