'use client';

import { useState } from 'react';
import { Bot, ChevronDown } from 'lucide-react';
import { useNewsBrief } from '@/lib/hooks';
import type { BriefDoc } from '@/lib/news/brief';
import { formatDate, formatTime } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { warsawDateKey } from '@/lib/news/warsaw-date';

/** Tygodniowy brief pokazujemy przez 7 dni od poniedziałku, potem znika. */
const WEEK_MS = 7 * 24 * 3600 * 1000;

function Points({ title, items }: { title: string; items: string[] }) {
    if (!items.length) return null;
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-mk-muted">{title}</h3>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-mk-text">
                {items.map((t) => <li key={t}>{t}</li>)}
            </ul>
        </div>
    );
}

function BriefBodyView({ doc }: { doc: BriefDoc }) {
    const [open, setOpen] = useState(false);
    const b = doc.body;
    return (
        <>
            <p className="text-base font-semibold leading-snug text-mk-text">{b.teza}</p>
            <div className="mt-3 max-w-[70ch] space-y-3">
                <Points title="Dane" items={b.dane} />
                {open && (
                    <>
                        <Points title="Polska" items={b.polska} />
                        <Points title="Świat" items={b.swiat} />
                        <Points title={doc.kind === 'daily' ? 'Dziś w kalendarzu' : 'W tym tygodniu'} items={b.kalendarz} />
                    </>
                )}
            </div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="mk-press mt-2 inline-flex min-h-6 items-center gap-1 text-xs font-medium text-mk-brand hover:underline touch:min-h-11 touch:text-sm"
            >
                {open ? 'Zwiń' : 'Cały brief'}
                <ChevronDown size={14} className={open ? 'rotate-180' : ''} aria-hidden />
            </button>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-mk-muted">
                <Bot size={13} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                    Wygenerowane automatycznie przez model DeepSeek z danych GUS, NBP i GPW oraz nagłówków mediów; każda liczba
                    sprawdzona z naszymi danymi. Nagłówki to nie fakty, a brief to nie rekomendacja. {formatTime(doc.generatedAt)}.
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

    const isToday = doc.date === todayKey;
    const label = doc.kind === 'weekly' ? `Brief tygodnia · od ${formatDate(doc.date)}` : isToday ? 'Brief dnia' : `Brief dnia · ${formatDate(doc.date)}`;

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
