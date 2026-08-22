'use client';

import { useEffect, useMemo, useState } from 'react';
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

function CorroborationBadge({ n, wire, alsoIn }: { n: number; wire?: boolean; alsoIn?: string[] }) {
    const tytul = alsoIn?.length ? `Ten sam temat: ${alsoIn.join(', ')}` : undefined;

    if (wire && n < 2) {
        return (
            <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted"
                title={tytul ? `${tytul} — opisy niemal identyczne, to ta sama depesza w kilku serwisach` : undefined}
            >
                <Copy size={10} />
                ta sama depesza
            </span>
        );
    }
    if (n < 2) return null;
    return (
        <span
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[11px] font-medium text-mk-positive"
            title={tytul}
        >
            <Layers size={10} />
            {n === 2 ? '2 niezależne relacje' : `${n} niezależne relacje`}
        </span>
    );
}

function Flags({ item }: { item: NewsItem }) {
    return (
        <>
            {item.isAd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted">
                    <Megaphone size={10} /> materiał promocyjny
                </span>
            )}
            {item.isOpinion && (
                <span className="rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted">opinia</span>
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
            className="group mk-card mk-card-editorial mk-card-pad block transition-colors hover:border-mk-brand/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className="mk-tag-brand-fill inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                    <Flame size={11} /> Najważniejsze
                </span>
                <CategoryTag section={item.section} />
                {(item.corroboration ?? 1) >= 2 && (
                    <span className="mk-tag-brand-fill opacity-90">POTWIERDZONE · {item.corroboration}</span>
                )}
                <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} />
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight tracking-tight text-mk-text transition-colors group-hover:text-mk-brand sm:text-2xl">
                {item.title}
            </h2>
            {item.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mk-muted sm:text-[15px]">{item.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <time dateTime={item.publishedAt} className="font-semibold text-mk-brand">
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                <span className="text-mk-faint">·</span>
                <span className="text-mk-muted">{item.source}</span>
                {item.alsoIn && item.alsoIn.length > 0 && (
                    <>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">także w: {item.alsoIn.join(', ')}</span>
                    </>
                )}
                <Flags item={item} />
                <ExternalLink size={13} className="ml-auto text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
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
                className="flex items-start gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-mk-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40"
            >
                <time
                    dateTime={item.publishedAt}
                    title={mounted ? `${formatDate(item.publishedAt)}, ${formatTime(item.publishedAt)}` : undefined}
                    className="mt-0.5 w-14 shrink-0 text-xs font-semibold tabular-nums text-mk-brand"
                >
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mk-muted">{item.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CategoryTag section={item.section} />
                        <span className="text-xs text-mk-faint">{item.source}</span>
                        <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} />
                        <Flags item={item} />
                    </div>
                </div>
                <ExternalLink size={15} className="mt-1 shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
            </a>
        </article>
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
        <div className="mk-fade-in space-y-6">
            <PageHeader
                eyebrow={<PageEyebrow section="Newsy" />}
                title="Newsy"
                subtitle="Wiadomości gospodarcze i rynkowe z polskich redakcji — scalone, odduplikowane i uszeregowane wg ważności"
                actions={
                    data && mounted ? (
                        <p className="text-xs text-mk-faint">
                            {data.count} pozycji z {data.sourcesOk}/{data.sourcesTotal} źródeł · odświeżono {formatRelativeTime(data.timestamp)}
                        </p>
                    ) : undefined
                }
            />

            <div className="mk-card mk-card-editorial mk-card-pad">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mk-faint" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Szukaj w newsach…"
                            aria-label="Szukaj w newsach"
                            className="mk-input w-full"
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
                    <div className="mk-seg shrink-0" role="tablist" aria-label="Sortowanie">
                        {([['waznosc', 'Ważne', Flame], ['data', 'Najnowsze', Clock]] as const).map(([v, label, Icon]) => (
                            <button
                                key={v}
                                type="button"
                                role="tab"
                                aria-selected={sort === v}
                                onClick={() => setSort(v)}
                                className={`mk-seg-btn flex items-center gap-1.5 ${sort === v ? 'mk-seg-btn-active' : ''}`}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                </div>

                {sources.length > 0 && (
                    <div className="mk-seg mt-3 w-full overflow-x-auto" role="tablist" aria-label="Filtruj po źródle">
                        {[{ id: 'all', name: 'Wszystkie', count: data?.count ?? 0 }, ...sources].map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                role="tab"
                                aria-selected={source === o.id}
                                onClick={() => setSource(o.id)}
                                className={`mk-seg-btn shrink-0 ${source === o.id ? 'mk-seg-btn-active' : ''}`}
                            >
                                {o.name}
                                <span className="ml-1.5 text-[11px] text-mk-faint">{o.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="mk-card mk-card-editorial mk-card-pad space-y-4">
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
                <div className="mk-card mk-card-editorial mk-card-pad flex items-start gap-2.5 text-sm text-mk-negative">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Nie udało się pobrać newsów.</p>
                        <p className="mt-0.5 text-mk-muted">{String(error)}</p>
                    </div>
                </div>
            )}

            {lead && <LeadStory item={lead} mounted={mounted} />}

            {!isLoading && !isError && filtered.length === 0 && (
                <div className="mk-card mk-card-editorial mk-card-pad py-14 text-center">
                    <Newspaper size={28} className="mx-auto text-mk-faint" />
                    <p className="mt-3 text-sm font-medium text-mk-text">Brak newsów dla tych filtrów</p>
                    <p className="mt-1 text-sm text-mk-muted">{q ? <>Nic nie pasuje do „{q}”.</> : 'Spróbuj innego źródła.'}</p>
                    {(q || source !== 'all') && (
                        <button type="button" onClick={() => { setQ(''); setSource('all'); }} className="mk-btn mt-4">
                            Wyczyść filtry
                        </button>
                    )}
                </div>
            )}

            {rest.length > 0 && (
                <div className="mk-card mk-card-editorial mk-card-pad">
                    <h2 className="mk-section-label mb-2">Wszystkie pozycje</h2>
                    <div className="divide-y divide-mk-border border-t border-mk-border pt-1">
                        {rest.map((it) => (
                            <NewsRow key={it.link} item={it} mounted={mounted} />
                        ))}
                    </div>
                </div>
            )}

            {filtered.length > 0 && (
                <div className="space-y-1.5 px-1 text-xs text-mk-faint">
                    <p>
                        Pokazano {filtered.length} z {data?.count ?? 0} pozycji
                        {zwinietych > 0 && ` (${zwinietych} zwinięto — ten sam temat z kilku redakcji zajmuje jeden wiersz)`}.{' '}
                        {sort === 'waznosc'
                            ? `Ważność łączy liczbę niezależnych relacji o temacie (${clusters} opisanych niezależnie przez ≥2 grupy redakcyjne), świeżość i konkretność — materiały promocyjne i clickbait są obniżane.`
                            : 'Sortowanie od najnowszych.'}
                    </p>
                    <p>
                        Redakcje z jednej grupy właścicielskiej (np. Bankier.pl i Puls Biznesu) liczymy jako jedno źródło,
                        a przedruk tej samej depeszy — jako jedną relację, nie kilka.
                    </p>
                    <p>
                        Oznaczenia „materiał promocyjny" i „opinia" nadaje automat po słowach kluczowych — wyłapuje
                        typowe przypadki, nie wszystkie. Brak etykiety nie oznacza, że treść została zweryfikowana.
                    </p>
                </div>
            )}

            {failed.length > 0 && (
                <p className="flex items-center gap-2 text-xs text-mk-muted">
                    <AlertTriangle size={13} className="shrink-0 text-mk-negative" />
                    Chwilowo bez odpowiedzi: {failed.map((s) => s.name).join(', ')}.
                </p>
            )}
        </div>
    );
}
