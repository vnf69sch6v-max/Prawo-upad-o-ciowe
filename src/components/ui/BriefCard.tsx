'use client';

import { useState } from 'react';
import { Bot, CalendarDays, ChevronDown } from 'lucide-react';
import { useNewsBrief } from '@/lib/hooks';
import type { BriefDoc } from '@/lib/news/brief';
import { formatTime } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { prevCalendarDate, warsawDateKey } from '@/lib/news/warsaw-date';
import { cleanBriefBody, ddmm, normalizeBriefBody } from '@/lib/news/brief-text';

/** Tygodniowy brief pokazujemy przez 7 dni od poniedziałku, potem znika. */
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
function dataDateOf(doc: BriefDoc): string | null {
    return doc.dataDate ?? (doc.kind === 'daily' ? prevCalendarDate(doc.date) : null);
}

function BriefBodyView({ doc }: { doc: BriefDoc }) {
    const [open, setOpen] = useState(false);
    // Porządki jak w cronie (`brief-server`) — łatają też briefy zapisane przed tą zmianą.
    const b = cleanBriefBody(normalizeBriefBody(doc.body)) ?? normalizeBriefBody(doc.body);
    const dataDate = dataDateOf(doc);
    const kalendarz = b.kalendarz;
    return (
        <>
            <p className="max-w-[70ch] text-[17px] font-medium leading-snug text-mk-text">{b.teza}</p>
            <div className="mt-4 space-y-4">
                <Points title={dataDate ? `Dane z ${ddmm(dataDate)}` : 'Dane'} items={b.dane} cols />
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
                                    <CalendarDays size={12} aria-hidden /> {doc.kind === 'daily' ? 'Dziś' : 'W tym tygodniu'}
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
export function BriefCard() {
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
    const label = doc.kind === 'weekly'
        ? `Brief tygodnia · od ${ddmm(doc.date)}`
        : `Brief na ${ddmm(doc.date)}${dataDate ? ` · dane z ${ddmm(dataDate)}` : ''}`;

    return (
        <section className="mk-card mk-card-editorial mk-card-pad-compact" aria-label="Brief">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="mk-section-label">{label}</h2>
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
            </div>
            <BriefBodyView key={doc.kind} doc={doc} />
        </section>
    );
}
