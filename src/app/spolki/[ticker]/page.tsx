'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useWig20, useStooq, useNews } from '@/lib/hooks';
import { WIG20 } from '@/lib/wig20';
import { matchCompanyNews } from '@/lib/news/match';
import { formatDecimalPL, formatRelativeTime, formatTime } from '@/lib/formatters';
import { monthTick } from '@/lib/series';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { WatchStar } from '@/components/ui/WatchStar';

export default function SpolkaPage() {
    const params = useParams<{ ticker: string }>();
    const ticker = (params?.ticker ?? '').toUpperCase();
    const company = WIG20.find((c) => c.ticker === ticker) ?? null;

    const quotes = useWig20();
    // Pojedyncze spółki GPW mają na Yahoo pełną historię dzienną (inaczej niż same indeksy) —
    // route obsługuje sufiks `.WA` i idzie prosto do Yahoo.
    const hist = useStooq(company ? `${ticker}.WA` : '', 120);
    const news = useNews();

    const quote = quotes.data?.items.find((q) => q.ticker === ticker) ?? null;
    const chart = useMemo(
        () => (hist.data?.data ?? []).map((b) => ({ date: b.date, value: b.close })),
        [hist.data],
    );
    const companyNews = useMemo(
        () => (company ? matchCompanyNews(news.data?.items ?? [], company.aliases, 8) : []),
        [news.data, company],
    );

    if (!company) {
        return (
            <div className="mk-fade-in space-y-4">
                <Link href="/rynki" className="inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-mk-primary hover:underline">
                    <ArrowLeft size={15} /> Wróć do spółek
                </Link>
                <SectionCard title="Nie znamy tej spółki">
                    <p className="text-sm text-mk-muted">
                        Ticker „{ticker}" nie należy do składu WIG20, który obsługujemy. Lista spółek jest
                        w zakładce Rynki → Spółki.
                    </p>
                </SectionCard>
            </div>
        );
    }

    return (
        <div className="mk-fade-in space-y-6">
            <div>
                <Link href="/rynki" className="inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-mk-primary hover:underline">
                    <ArrowLeft size={15} /> Spółki WIG20
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">{company.name}</h1>
                    <span className="rounded-full bg-mk-surface-alt px-2.5 py-0.5 text-xs font-medium text-mk-muted">{company.sector}</span>
                    <WatchStar kind="spolka" id={ticker} label={company.name} variant="inline" size={18} />
                </div>
                <p className="mt-1 text-sm text-mk-muted">{ticker} · GPW · notowania i wiadomości</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mk-text-soft">{company.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KpiCard label="Kurs" value={quote?.price != null ? formatDecimalPL(quote.price, 2) : '—'} unit="zł"
                    delta={quote?.changePct != null ? { value: quote.changePct, unit: 'pct' } : undefined}
                    footnote={quote?.date ? `Yahoo · ${quote.date}` : 'Yahoo Finance (GPW)'} loading={quotes.isLoading} />
                <KpiCard label="Zakres 120 sesji" value={chart.length ? `${formatDecimalPL(Math.min(...chart.map((c) => c.value)), 2)}–${formatDecimalPL(Math.max(...chart.map((c) => c.value)), 2)}` : '—'} unit="zł"
                    footnote="min–max z historii" loading={hist.isLoading} />
                <KpiCard label="Wiadomości o spółce" value={String(companyNews.length)} unit={companyNews.length === 1 ? 'news' : 'newsy'}
                    footnote="z naszego agregatora RSS" loading={news.isLoading} />
            </div>

            <SectionCard title={`${company.name} — kurs (120 sesji)`} subtitle="zamknięcie dzienne · Yahoo Finance (GPW)">
                {hist.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : chart.length < 2 ? (
                    <p className="py-8 text-center text-sm text-mk-muted">Brak historii notowań dla tego tickera.</p>
                ) : (
                    <InteractiveChart data={chart} xKey="date" height={300} unit=" zł" showRange initialRange="ALL"
                        valueFormatter={(v) => formatDecimalPL(v, 2)} xTickFormatter={monthTick}
                        series={[{ key: 'value', name: company.name, color: '#2563EB', type: 'area', strokeWidth: 2.5 }]} />
                )}
            </SectionCard>

            <SectionCard title="Wiadomości o spółce" subtitle="dopasowane po nazwie spółki — tytuł liczy się zawsze, opis tylko dla jednoznacznych nazw">
                {companyNews.length === 0 ? (
                    <p className="py-6 text-center text-sm text-mk-muted">
                        Brak newsów o tej spółce w bieżącej paczce. To normalne — agregator trzyma ~150
                        najnowszych pozycji, a nie każda spółka pojawia się codziennie.
                    </p>
                ) : (
                    <ul className="divide-y divide-mk-border">
                        {companyNews.map((n) => (
                            <li key={n.link}>
                                <a href={n.link} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 py-3 first:pt-0">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-primary">{n.title}</div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-mk-muted">
                                            <span>{n.source}</span>
                                            <span className="text-mk-faint">·</span>
                                            <time dateTime={n.publishedAt}>{formatRelativeTime(n.publishedAt) || formatTime(n.publishedAt)}</time>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
        </div>
    );
}
