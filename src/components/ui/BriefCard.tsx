'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CalendarDays, ChevronDown } from 'lucide-react';
import { useDailyDigest, useNewsBrief } from '@/lib/hooks';
import type { DailyDigest } from '@/lib/news/daily';
import { KpiTiles } from '@/components/ui/KpiTiles';
import { DailySummaryCard } from '@/components/ui/DigestSummaryCard';
import type { BriefDoc } from '@/lib/news/brief';
import { formatTime } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { prevCalendarDate, warsawDateKey } from '@/lib/news/warsaw-date';
import { cleanBriefBody, ddmm, normalizeBriefBody } from '@/lib/news/brief-text';

/** Tygodniowy brief (niedziela) pokazujemy do następnej soboty, potem znika. */
const WEEK_MS = 7 * 24 * 3600 * 1000;

function Points({ title, items, cols = false }: { title: string; items: string[]; cols?: boolean }) {
    if (!items.length) return null;
    return (
        <div className="min-w-0">
            <h3 className="mk-section-label">{title}</h3>
            <ul className={`mt-1.5 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-mk-text marker:text-mk-faint ${cols ? 'lg:grid lg:grid-cols-2 lg:gap-x-8 lg:space-y-0 lg:gap-y-1.5' : ''}`}>
                {items.map((t) => <li key={t}>{t}</li>)}
            </ul>
        </div>
    );
}

/** Data digestu, z którego wzięto liczby. Briefy sprzed 31.10 jej nie mają — dzienny bierze wczorajszy digest. */
function weekStart(sunday: string): string {
    let d = sunday;
    for (let i = 0; i < 6; i++) d = prevCalendarDate(d);
    return d;
}

function dataDateOf(doc: BriefDoc): string | null {
    return doc.dataDate ?? (doc.kind === 'daily' ? prevCalendarDate(doc.date) : null);
}

function BriefBodyView({ doc, numbersTitle }: { doc: BriefDoc; numbersTitle?: string }) {
    const [open, setOpen] = useState(false);
    // Porządki jak w cronie (`brief-server`) — łatają też briefy zapisane przed tą zmianą.
    const b = cleanBriefBody(normalizeBriefBody(doc.body)) ?? normalizeBriefBody(doc.body);
    const dataDate = dataDateOf(doc);
    const kalendarz = b.kalendarz;
    return (
        <>
            <p className="max-w-[70ch] text-[17px] font-medium leading-snug text-mk-text">{b.teza}</p>
            <div className="mt-4 space-y-4">
                <Points title={numbersTitle ?? (dataDate ? `Dane z ${ddmm(dataDate)}` : 'Dane')} items={b.dane} cols />
                {open && (
                    <>
                        {(b.polska.length > 0 || b.swiat.length > 0) && (
                            <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
                                <Points title="Polska" items={b.polska} />
                                <Points title="Świat" items={b.swiat} />
                            </div>
                        )}
                        {kalendarz.length > 0 && (
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-mk-border pt-3 text-sm text-mk-text">
                                <span className="mk-section-label inline-flex items-center gap-1">
                                    <CalendarDays size={12} aria-hidden /> {doc.kind === 'daily' ? 'Najbliższe publikacje' : 'Nadchodzący tydzień'}
                                </span>
                                {kalendarz.map((k, i) => (
                                    <span key={k} className="text-mk-muted">{i > 0 && <span aria-hidden>· </span>}{k}</span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="mk-press mt-3 inline-flex min-h-6 items-center gap-1 text-xs font-medium text-mk-brand hover:underline touch:min-h-11 touch:text-sm"
            >
                {open ? 'Zwiń' : 'Polska, świat i kalendarz'}
                <ChevronDown size={14} className={open ? 'rotate-180' : ''} aria-hidden />
            </button>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-mk-muted">
                <Bot size={13} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                    Wygenerowane automatycznie przez model DeepSeek {formatTime(doc.generatedAt)} z danych GUS, NBP i GPW
                    oraz nagłówków mediów; każda liczba sprawdzona z naszymi danymi. Nagłówki to nie fakty, a brief to nie rekomendacja.
                </span>
            </p>
        </>
    );
}

/** Brief dnia / tygodnia (DeepSeek). Brak briefu albo klucza → nic nie renderujemy. */
/**
 * `day` = digest z tego samego dnia co dane briefu → jedna karta „Dzień w gospodarce”: kafelki KPI
 * nad briefem, link do pełnego podsumowania. Bez `day` — sam brief (dwie karty, różne dni).
 */
export function BriefCard({ day }: { day?: DailyDigest } = {}) {
    const isClient = useIsClient();
    const { data: daily } = useNewsBrief('daily');
    const { data: weekly } = useNewsBrief('weekly');
    const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

    // Data „dziś” i wiek tygodniowego zależą od zegara — dopiero po hydracji (#418).
    if (!isClient) return null;
    const todayKey = warsawDateKey();
    const weeklyFresh = weekly && Date.parse(todayKey) - Date.parse(weekly.date) < WEEK_MS ? weekly : null;
    const doc = tab === 'weekly' && weeklyFresh ? weeklyFresh : daily ?? weeklyFresh;
    if (!doc) return null;

    // „Brief na 30.10 · dane z 29.10” — bez daty dwa różne kursy EUR/PLN na jednym ekranie wyglądały na błąd.
    const dataDate = dataDateOf(doc);
    const label = day && doc.kind === 'daily'
        ? `Dzień w gospodarce · ${ddmm(day.date)}`
        : doc.kind === 'weekly'
            ? `Brief tygodnia · ${ddmm(weekStart(doc.date))}–${ddmm(doc.date)}`
            : `Brief na ${ddmm(doc.date)}${dataDate ? ` · dane z ${ddmm(dataDate)}` : ''}`;

    return (
        <section className="mk-card mk-card-editorial mk-card-pad-compact" aria-label={day ? 'Dzień w gospodarce' : 'Brief'}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="mk-section-label">{label}</h2>
                <div className="flex flex-wrap items-center gap-3">
                {daily && weeklyFresh && (
                    <div className="mk-seg" role="tablist" aria-label="Zakres briefu">
                        {(['daily', 'weekly'] as const).map((k) => (
                            <button
                                key={k}
                                type="button"
                                role="tab"
                                aria-selected={doc.kind === k}
                                onClick={() => setTab(k)}
                                className={`mk-seg-btn ${doc.kind === k ? 'mk-seg-btn-active' : ''}`}
                            >
                                {k === 'daily' ? 'Dzień' : 'Tydzień'}
                            </button>
                        ))}
                    </div>
                )}
                {day && (
                    <Link href={`/podsumowanie?date=${day.date}`} className="mk-press inline-flex min-h-6 items-center gap-1 text-xs font-medium text-mk-brand hover:underline touch:-my-2.5 touch:min-h-11 touch:text-sm">
                        Całe podsumowanie <ArrowRight size={13} aria-hidden />
                    </Link>
                )}
                </div>
            </div>
            {day && <KpiTiles items={day.dane} className="mb-4" />}
            <BriefBodyView key={doc.kind} doc={doc} numbersTitle={day && doc.kind === 'daily' ? 'Co mówią liczby' : undefined} />
        </section>
    );
}

/**
 * /newsy: gdy brief dzienny powstał z digestu, którego kafelki widać (ta sama data), pokazujemy JEDNĄ
 * kartę — akapit-szablon „Najważniejsze dziś: <tytuł>” nic by do briefu nie dodał. Gdy daty się
 * różnią (rano przed digestem, brak briefu, brak klucza), zostają dwie karty, każda z własną datą.
 */
export function NewsDayCard() {
    const isClient = useIsClient();
    const yesterdayKey = useMemo(() => prevCalendarDate(warsawDateKey()), []);
    const { data: today } = useDailyDigest();
    const { data: yesterday } = useDailyDigest(yesterdayKey);
    const { data: daily } = useNewsBrief('daily');

    const hasContent = (d: DailyDigest | null | undefined) => !!d && (d.punkty.length > 0 || d.dane.length > 0);
    const digest = hasContent(today) ? today! : hasContent(yesterday) ? yesterday! : null;
    if (isClient && digest && daily && dataDateOf(daily) === digest.date) return <BriefCard day={digest} />;
    return (
        <>
            <DailySummaryCard compact />
            <BriefCard />
        </>
    );
}
