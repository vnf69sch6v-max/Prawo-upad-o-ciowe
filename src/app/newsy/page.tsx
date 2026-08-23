'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Search, ExternalLink, AlertTriangle, Newspaper, X, Layers, Flame, Clock, Megaphone, Copy } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { formatRelativeTime, formatTime, formatDate } from '@/lib/formatters';
import { norm, collapseClusters } from '@/lib/news/match';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

type Sort = 'waznosc' | 'data';

const SECTION_LABELS: Record<string, string> = {
    ogolne: 'MAKRO',
    gielda: 'GIEŁDA',
    waluty: 'WALUTY',
    przemysl: 'PRZEMYSŁ',
};

function sectionLabel(section: string): string {
    const key = section.trim().toLowerCase();
    if (SECTION_LABELS[key]) return SECTION_LABELS[key];
    const trimmed = section.trim();
    return trimmed ? trimmed.toUpperCase() : 'MAKRO';
}

function CategoryTag({ section, filled = false }: { section: string; filled?: boolean }) {
    const label = sectionLabel(section);
    if (filled) return <span className="mk-tag-brand-fill">{label}</span>;
    return <span className="mk-tag-brand">{label}</span>;
}

function CorroborationBadge({ n, wire, alsoIn, compact = false }: { n: number; wire?: boolean; alsoIn?: string[]; compact?: boolean }) {
    const tytul = alsoIn?.length ? `Ten sam temat: ${alsoIn.join(', ')}` : undefined;

    if (wire && n < 2) {
        return (
            <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-mk-muted"
                title={tytul ? `${tytul} — opisy niemal identyczne, to ta sama depesza w kilku serwisach` : undefined}
            >
                <Copy size={9} />
                {compact ? 'depesza' : 'ta sama depesza'}
            </span>
        );
    }
    if (n < 2) return null;
    return (
        <span
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[10px] font-medium text-mk-positive"
            title={tytul}
        >
            <Layers size={9} />
            {compact ? n : n === 2 ? '2 niezależne relacje' : `${n} niezależne relacje`}
        </span>
    );
}

function Flags({ item }: { item: NewsItem }) {
    return (
        <>
            {item.isAd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-mk-muted">
                    <Megaphone size={9} /> promocja
                </span>
            )}
            {item.isOpinion && (
                <span className="rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-mk-muted">opinia</span>
            )}
        </>
    );
}

function LeadStory({ item, mounted }: { item: NewsItem; mounted: boolean }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40"
        >
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="mk-tag-brand-fill inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                    <Flame size={10} /> Najważniejsze
                </span>
                <CategoryTag section={item.section} />
                {(item.corroboration ?? 1) >= 2 && (
                    <span className="mk-tag-brand-fill opacity-90">POTWIERDZONE · {item.corroboration}</span>
                )}
                <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} />
            </div>
            <h2 className="mt-2 text-lg font-bold leading-tight tracking-tight text-mk-text transition-colors group-hover:text-mk-brand sm:text-xl">
                {item.title}
            </h2>
            {item.description && <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-mk-muted">{item.description}</p>}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <time dateTime={item.publishedAt} className="font-semibold text-mk-brand">
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                <span className="text-mk-faint">·</span>
                <span className="text-mk-muted">{item.source}</span>
                {item.alsoIn && item.alsoIn.length > 0 && (
                    <>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">także: {item.alsoIn.join(', ')}</span>
                    </>
                )}
                <Flags item={item} />
                <ExternalLink size={12} className="ml-auto text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
            </div>
        </a>
    );
}

function NewsRow({ item, mounted }: { item: NewsItem; mounted: boolean }) {
    return (
        <article className="group">
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 rounded-md px-1 py-2 transition-colors hover:bg-mk-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40"
            >
                <time
                    dateTime={item.publishedAt}
                    title={mounted ? `${formatDate(item.publishedAt)}, ${formatTime(item.publishedAt)}` : undefined}
                    className="mt-0.5 w-12 shrink-0 text-[11px] font-semibold tabular-nums text-mk-brand"
                >
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                        {item.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <CategoryTag section={item.section} />
                        <span className="text-[11px] text-mk-faint">{item.source}</span>
                        <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} compact />
                        <Flags item={item} />
                    </div>
                </div>
                <ExternalLink size={13} className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
            </a>
        </article>
    );
}

function FilterBtn({
    active,
    onClick,
    children,
    className = '',
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                active
                    ? 'bg-mk-brand-soft text-mk-brand ring-1 ring-mk-brand/25'
                    : 'text-mk-muted hover:bg-mk-surface-alt hover:text-mk-text'
            } ${className}`}
        >
            {children}
        </button>
    );
}

export default function NewsyPage() {
    const { data, isLoading, isError, error } = useNews();
    const [source, setSource] = useState('all');
    const [sort, setSort] = useState<Sort>('waznosc');
    const [q, setQ] = useState('');
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const sources = useMemo(() => {
        const counts = new Map<string, { id: string; name: string; count: number }>();
        for (const it of data?.items ?? []) {
            const cur = counts.get(it.sourceId);
            if (cur) cur.count++;
            else counts.set(it.sourceId, { id: it.sourceId, name: it.source, count: 1 });
        }
        return [...counts.values()].sort((a, b) => b.count - a.count);
    }, [data]);

    const filtered = useMemo(() => {
        const needle = norm(q.trim());
        const out = (data?.items ?? []).filter((it) => {
            if (source !== 'all' && it.sourceId !== source) return false;
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        });
        const base = source === 'all' ? collapseClusters(out) : out;
        return sort === 'data'
            ? [...base].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            : [...base].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    }, [data, source, q, sort]);

    const zwinietych = useMemo(() => {
        if (source !== 'all') return 0;
        const needle = norm(q.trim());
        const przedZwinieciem = (data?.items ?? []).filter((it) => {
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        }).length;
        return przedZwinieciem - filtered.length;
    }, [data, q, source, filtered.length]);

    const showLead = sort === 'waznosc' && source === 'all' && !q.trim() && filtered.length > 3;
    const lead = showLead ? filtered[0] : null;
    const rest = showLead ? filtered.slice(1) : filtered;

    const failed = (data?.sources ?? []).filter((s) => !s.ok);
    const clusters = useMemo(() => filtered.filter((i) => (i.corroboration ?? 1) >= 2).length, [filtered]);

    return (
        <div className="mk-fade-in space-y-4">
            <PageHeader
                eyebrow={<PageEyebrow section="Newsy" />}
                title="Newsy"
                subtitle="Wiadomości gospodarcze i rynkowe z polskich redakcji — scalone, odduplikowane i uszeregowane wg ważności"
                actions={
                    data && mounted ? (
                        <p className="text-[11px] text-mk-faint">
                            {data.count} poz. · {data.sourcesOk}/{data.sourcesTotal} źródeł · {formatRelativeTime(data.timestamp)}
                        </p>
                    ) : undefined
                }
            />

            {lead && (
                <div className="mk-card mk-card-editorial mk-card-pad-compact border-l-[3px] border-l-mk-brand">
                    <LeadStory item={lead} mounted={mounted} />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
                <aside className="lg:col-span-3 lg:sticky lg:top-20">
                    <div className="mk-card mk-card-editorial mk-card-pad-compact space-y-3">
                        <h2 className="mk-section-label">Filtry</h2>

                        <div className="relative">
                            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mk-faint" />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Szukaj…"
                                aria-label="Szukaj w newsach"
                                className="mk-input w-full py-2 text-sm"
                                style={{ paddingLeft: 32, paddingRight: q ? 32 : 12 }}
                            />
                            {q && (
                                <button
                                    type="button"
                                    onClick={() => setQ('')}
                                    aria-label="Wyczyść wyszukiwanie"
                                    className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-mk-faint transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-mk-faint">Sortowanie</p>
                            <div className="space-y-0.5">
                                <FilterBtn active={sort === 'waznosc'} onClick={() => setSort('waznosc')}>
                                    <span className="inline-flex items-center gap-1.5"><Flame size={12} /> Ważne</span>
                                </FilterBtn>
                                <FilterBtn active={sort === 'data'} onClick={() => setSort('data')}>
                                    <span className="inline-flex items-center gap-1.5"><Clock size={12} /> Najnowsze</span>
                                </FilterBtn>
                            </div>
                        </div>

                        {sources.length > 0 && (
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-mk-faint">Źródło</p>
                                <div className="max-h-52 space-y-0.5 overflow-y-auto">
                                    <FilterBtn active={source === 'all'} onClick={() => setSource('all')}>
                                        <span>Wszystkie</span>
                                        <span className="tabular-nums text-mk-faint">{data?.count ?? 0}</span>
                                    </FilterBtn>
                                    {sources.map((o) => (
                                        <FilterBtn key={o.id} active={source === o.id} onClick={() => setSource(o.id)}>
                                            <span className="truncate pr-2">{o.name}</span>
                                            <span className="shrink-0 tabular-nums text-mk-faint">{o.count}</span>
                                        </FilterBtn>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(q || source !== 'all') && (
                            <button
                                type="button"
                                onClick={() => { setQ(''); setSource('all'); }}
                                className="w-full rounded-md border border-mk-border px-2.5 py-1.5 text-xs font-medium text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                            >
                                Wyczyść filtry
                            </button>
                        )}
                    </div>
                </aside>

                <main className="lg:col-span-9">
                    {isLoading && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact space-y-3">
                            {Array.from({ length: 8 }, (_, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mk-skeleton h-3 w-10 shrink-0 rounded" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="mk-skeleton h-3.5 w-4/5 rounded" />
                                        <div className="mk-skeleton h-2.5 w-24 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact flex items-start gap-2 text-sm text-mk-negative">
                            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Nie udało się pobrać newsów.</p>
                                <p className="mt-0.5 text-mk-muted">{String(error)}</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact py-10 text-center">
                            <Newspaper size={24} className="mx-auto text-mk-faint" />
                            <p className="mt-2 text-sm font-medium text-mk-text">Brak newsów dla tych filtrów</p>
                            <p className="mt-0.5 text-xs text-mk-muted">{q ? <>Nic nie pasuje do „{q}".</> : 'Spróbuj innego źródła.'}</p>
                        </div>
                    )}

                    {rest.length > 0 && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <h2 className="mk-section-label">
                                    {showLead ? 'Pozostałe' : 'Wszystkie pozycje'}
                                </h2>
                                <span className="text-[11px] tabular-nums text-mk-faint">{rest.length}</span>
                            </div>
                            <div className="divide-y divide-mk-border border-t border-mk-border">
                                {rest.map((it) => (
                                    <NewsRow key={it.link} item={it} mounted={mounted} />
                                ))}
                            </div>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="space-y-1 px-0.5 text-[11px] leading-relaxed text-mk-faint">
                            <p>
                                Pokazano {filtered.length} z {data?.count ?? 0} pozycji
                                {zwinietych > 0 && ` (${zwinietych} zwinięto — ten sam temat z kilku redakcji)`}.{' '}
                                {sort === 'waznosc'
                                    ? `Ważność łączy liczbę niezależnych relacji (${clusters} opisanych przez ≥2 grupy), świeżość i konkretność.`
                                    : 'Sortowanie od najnowszych.'}
                            </p>
                            <p>
                                Redakcje z jednej grupy właścicielskiej liczymy jako jedno źródło; przedruk depeszy — jako jedną relację.
                            </p>
                        </div>
                    )}

                    {failed.length > 0 && (
                        <p className="flex items-center gap-1.5 text-[11px] text-mk-muted">
                            <AlertTriangle size={12} className="shrink-0 text-mk-negative" />
                            Chwilowo bez odpowiedzi: {failed.map((s) => s.name).join(', ')}.
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}
