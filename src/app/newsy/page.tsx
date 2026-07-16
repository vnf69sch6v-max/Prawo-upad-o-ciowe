'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, AlertTriangle, Newspaper, X } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { formatRelativeTime, formatTime, formatDate } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
// Ta sama normalizacja (bez diakrytyków, „ł" → „l"), której używa dopasowanie newsów do tematów.
import { norm } from '@/lib/news/match';

function SourceFilter({
    sources, value, onChange,
}: {
    sources: { id: string; name: string; count: number }[];
    value: string;
    onChange: (v: string) => void;
}) {
    const total = sources.reduce((sum, s) => sum + s.count, 0);
    const opts = [{ id: 'all', name: 'Wszystkie', count: total }, ...sources];

    return (
        <div className="mk-seg w-full overflow-x-auto" role="tablist" aria-label="Filtruj po źródle">
            {opts.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    role="tab"
                    aria-selected={value === o.id}
                    onClick={() => onChange(o.id)}
                    className={`mk-seg-btn shrink-0 ${value === o.id ? 'mk-seg-btn-active' : ''}`}
                >
                    {o.name}
                    <span className="ml-1.5 text-[11px] text-mk-faint">{o.count}</span>
                </button>
            ))}
        </div>
    );
}

function NewsRow({ item, mounted }: { item: NewsItem; mounted: boolean }) {
    return (
        <article className="group py-4 first:pt-0 last:pb-0">
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/50 rounded-lg"
            >
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-primary">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mk-muted">{item.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className="font-medium text-mk-text">{item.source}</span>
                            <span className="text-mk-faint">·</span>
                            {/* Czas względny dopiero po zamontowaniu — inaczej hydration mismatch. */}
                            <time
                                dateTime={item.publishedAt}
                                title={mounted ? `${formatDate(item.publishedAt)}, ${formatTime(item.publishedAt)}` : undefined}
                                className="text-mk-muted"
                            >
                                {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                            </time>
                        </div>
                    </div>
                    <ExternalLink
                        size={15}
                        className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary"
                        aria-hidden
                    />
                </div>
            </a>
        </article>
    );
}

export default function NewsyPage() {
    const { data, isLoading, isError, error } = useNews();
    const [source, setSource] = useState('all');
    const [q, setQ] = useState('');
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Liczniki z faktycznie zwróconych pozycji (po deduplikacji), nie z surowych statusów źródeł.
    const sources = useMemo(() => {
        const items = data?.items ?? [];
        const counts = new Map<string, { id: string; name: string; count: number }>();
        for (const it of items) {
            const cur = counts.get(it.sourceId);
            if (cur) cur.count++;
            else counts.set(it.sourceId, { id: it.sourceId, name: it.source, count: 1 });
        }
        return [...counts.values()].sort((a, b) => b.count - a.count);
    }, [data]);

    const filtered = useMemo(() => {
        const items = data?.items ?? [];
        const needle = norm(q.trim());
        return items.filter((it) => {
            if (source !== 'all' && it.sourceId !== source) return false;
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        });
    }, [data, source, q]);

    const failed = (data?.sources ?? []).filter((s) => !s.ok);

    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Newsy</h1>
                    <p className="mt-1 text-sm text-mk-muted">
                        Wiadomości gospodarcze i rynkowe z polskich serwisów, scalone i odduplikowane
                    </p>
                </div>
                {data && mounted && (
                    <p className="text-xs text-mk-faint">
                        {data.count} pozycji z {data.sourcesOk}/{data.sourcesTotal} źródeł ·
                        odświeżono {formatRelativeTime(data.timestamp)}
                    </p>
                )}
            </div>

            <SectionCard padded={false}>
                <div className="space-y-3 border-b border-mk-border p-4">
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mk-faint" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Szukaj w newsach…"
                            aria-label="Szukaj w newsach"
                            className="mk-input w-full"
                            // `.mk-input` ustawia padding skrótem, który bije utility Tailwinda
                            // (pl-9/pr-9 nie działa) — stąd nadpisanie inline, jak w Segmented.tsx.
                            style={{ paddingLeft: 36, paddingRight: 36 }}
                        />
                        {q && (
                            <button
                                type="button"
                                onClick={() => setQ('')}
                                aria-label="Wyczyść wyszukiwanie"
                                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-mk-faint transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {sources.length > 0 && <SourceFilter sources={sources} value={source} onChange={setSource} />}
                </div>

                <div className="p-4">
                    {isLoading && (
                        <div className="space-y-4">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="mk-skeleton h-4 w-3/4 rounded" />
                                    <div className="mk-skeleton h-3 w-full rounded" />
                                    <div className="mk-skeleton h-3 w-24 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="flex items-start gap-2.5 py-8 text-sm text-mk-negative">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Nie udało się pobrać newsów.</p>
                                <p className="mt-0.5 text-mk-muted">{String(error)}</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="py-12 text-center">
                            <Newspaper size={28} className="mx-auto text-mk-faint" />
                            <p className="mt-3 text-sm font-medium text-mk-text">Brak newsów dla tych filtrów</p>
                            <p className="mt-1 text-sm text-mk-muted">
                                {q ? <>Nic nie pasuje do „{q}”.</> : 'Spróbuj innego źródła.'}
                            </p>
                            {(q || source !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => { setQ(''); setSource('all'); }}
                                    className="mk-btn mt-4"
                                >
                                    Wyczyść filtry
                                </button>
                            )}
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <>
                            <div className="divide-y divide-mk-border">
                                {filtered.map((it) => (
                                    <NewsRow key={it.link} item={it} mounted={mounted} />
                                ))}
                            </div>
                            <p className="mt-4 border-t border-mk-border pt-3 text-xs text-mk-faint">
                                Pokazano {filtered.length} z {data?.count ?? 0} pozycji. Kliknięcie otwiera artykuł
                                w serwisie źródłowym.
                            </p>
                        </>
                    )}
                </div>
            </SectionCard>

            {/* Jawnie mówimy, gdy któreś źródło nie odpowiedziało — zamiast po cichu pokazywać niepełną listę. */}
            {failed.length > 0 && (
                <p className="flex items-center gap-2 text-xs text-mk-muted">
                    <AlertTriangle size={13} className="shrink-0 text-mk-negative" />
                    Chwilowo bez odpowiedzi: {failed.map((s) => s.name).join(', ')}.
                </p>
            )}
        </div>
    );
}
