'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search, ExternalLink, AlertTriangle, Newspaper, X, Layers, Flame, Megaphone, Copy, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { formatRelativeTime, formatTime, formatDate } from '@/lib/formatters';
import { norm, collapseClusters } from '@/lib/news/match';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
import { DailySummaryCard } from '@/components/ui/DigestSummaryCard';
import { Drawer } from '@/components/ui/Drawer';
import { scrollChildInline } from '@/lib/tab-scroll';
import { useIsClient } from '@/lib/use-is-client';
import { useScrollFade } from '@/lib/use-scroll-fade';

type Sort = 'waznosc' | 'data';

const SECTION_LABELS: Record<string, string> = {
    ogolne: 'MAKRO',
    gielda: 'GIEŁDA',
    waluty: 'WALUTY',
    przemysl: 'PRZEMYSŁ',
    oficjalne: 'OFICJALNE',
};

function sectionLabel(section: string): string {
    const key = section.trim().toLowerCase();
    if (SECTION_LABELS[key]) return SECTION_LABELS[key];
    const trimmed = section.trim();
    return trimmed ? trimmed.toUpperCase() : 'MAKRO';
}

/** Klucz kategorii do filtra — pusta sekcja liczy się jako „ogólne" (tak jak etykieta MAKRO). */
function sectionKey(section: string): string {
    return section.trim().toLowerCase() || 'ogolne';
}

/** Etykieta chipa kategorii: „Makro", „Giełda" — zdaniowo, nie wersalikami jak tag na liście. */
function categoryName(key: string): string {
    const label = SECTION_LABELS[key] ?? key.toUpperCase();
    return label.charAt(0) + label.slice(1).toLowerCase();
}

/** Ile pozycji listy pokazujemy naraz — 140 newsów jednym ciągiem to ~15 000 px przewijania na telefonie. */
const PAGE = 30;

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
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted"
                title={tytul ? `${tytul} — opisy niemal identyczne, to ta sama depesza w kilku serwisach` : undefined}
            >
                <Copy size={10} />
                {compact ? 'depesza' : 'ta sama depesza'}
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
            {compact ? n : n === 2 ? '2 niezależne relacje' : `${n} niezależne relacje`}
        </span>
    );
}

function Flags({ item }: { item: NewsItem }) {
    return (
        <>
            {item.isAd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted">
                    <Megaphone size={10} /> promocja
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
            className="group block rounded-lg transition-colors [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40 active:bg-mk-surface-alt"
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
    const when = mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt);
    return (
        <article className="group">
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-start gap-2.5 rounded-lg px-1 py-3 transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40 active:bg-mk-surface-alt sm:min-h-0 sm:rounded-md sm:py-2"
            >
                {/* Kolumna czasu tylko od `sm` — na telefonie czas idzie do linii ze źródłem. */}
                <time
                    dateTime={item.publishedAt}
                    title={mounted ? `${formatDate(item.publishedAt)}, ${formatTime(item.publishedAt)}` : undefined}
                    className="mt-0.5 hidden w-12 shrink-0 text-[11px] font-semibold tabular-nums text-mk-brand sm:block"
                >
                    {when}
                </time>
                <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand sm:text-sm">
                        {item.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 sm:mt-1">
                        <CategoryTag section={item.section} />
                        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-xs text-mk-muted sm:text-[11px] sm:text-mk-faint">
                            <span className="truncate">{item.source}</span>
                            <span className="text-mk-faint sm:hidden" aria-hidden>·</span>
                            <time dateTime={item.publishedAt} className="shrink-0 font-semibold text-mk-brand sm:hidden">{when}</time>
                        </span>
                        <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} compact />
                        <Flags item={item} />
                    </div>
                </div>
                <ExternalLink size={13} className="mt-1 shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
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
            aria-pressed={active}
            className={`flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] font-medium transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt lg:min-h-6 lg:rounded-md lg:px-2.5 lg:py-1.5 lg:text-xs ${
                active
                    ? 'bg-mk-brand-soft text-mk-brand ring-1 ring-mk-brand/25'
                    : 'text-mk-muted hover:bg-mk-surface-alt hover:text-mk-text'
            } ${className}`}
        >
            {children}
        </button>
    );
}

/**
 * Rząd chipów: poniżej `lg` jeden przewijany wiersz od krawędzi do krawędzi ekranu z wygaszoną
 * krawędzią (jest dalej), od `lg` zawijany w panelu filtrów. Aktywny chip zostaje w kadrze.
 */
function ChipScroller({ label, activeKey, children }: { label: string; activeKey: string; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const fade = useScrollFade(ref);
    useEffect(() => {
        const box = ref.current;
        const active = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
        if (box && active) scrollChildInline(box, active);
    }, [activeKey]);
    return (
        <div
            ref={ref}
            role="group"
            aria-label={label}
            data-fade={fade}
            className="mk-fade-x -mx-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] md:-mx-6 md:px-6 lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
            <div className="flex w-max gap-2 lg:w-auto lg:flex-wrap lg:gap-1.5">{children}</div>
        </div>
    );
}

/** Chip kategorii: na telefonie ≥44 px w przewijanym rzędzie, na desktopie kompaktowy. */
const chipClass = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors [-webkit-tap-highlight-color:transparent] lg:min-h-8 lg:px-3 lg:text-xs ${
        active
            ? 'border-mk-brand bg-mk-brand text-white'
            : 'border-mk-border bg-mk-surface text-mk-muted hover:border-mk-brand/40 hover:text-mk-text active:bg-mk-surface-alt'
    }`;

export default function NewsyPage() {
    const { data, isLoading, isError, error, refetch, isFetching } = useNews();
    const [source, setSource] = useState('all');
    const [cat, setCat] = useState('all');
    const [sort, setSort] = useState<Sort>('waznosc');
    const [q, setQ] = useState('');
    // Czas względny („12 min temu") zależy od „teraz" — liczymy go dopiero po hydratacji.
    const mounted = useIsClient();
    const [sheetOpen, setSheetOpen] = useState(false);

    const sources = useMemo(() => {
        const counts = new Map<string, { id: string; name: string; count: number }>();
        for (const it of data?.items ?? []) {
            const cur = counts.get(it.sourceId);
            if (cur) cur.count++;
            else counts.set(it.sourceId, { id: it.sourceId, name: it.source, count: 1 });
        }
        return [...counts.values()].sort((a, b) => b.count - a.count);
    }, [data]);

    // Kategorie z bieżącej paczki: najpierw znane (kolejność SECTION_LABELS), potem reszta.
    const categories = useMemo(() => {
        const counts = new Map<string, number>();
        for (const it of data?.items ?? []) {
            const k = sectionKey(it.section);
            counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        const order = Object.keys(SECTION_LABELS);
        const rank = (k: string) => (order.includes(k) ? order.indexOf(k) : order.length);
        return [...counts.entries()]
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => rank(a.key) - rank(b.key) || b.count - a.count);
    }, [data]);

    const filtered = useMemo(() => {
        const needle = norm(q.trim());
        const out = (data?.items ?? []).filter((it) => {
            if (source !== 'all' && it.sourceId !== source) return false;
            if (cat !== 'all' && sectionKey(it.section) !== cat) return false;
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        });
        const base = source === 'all' ? collapseClusters(out) : out;
        return sort === 'data'
            ? [...base].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            : [...base].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    }, [data, source, cat, q, sort]);

    const zwinietych = useMemo(() => {
        if (source !== 'all') return 0;
        const needle = norm(q.trim());
        const przedZwinieciem = (data?.items ?? []).filter((it) => {
            if (cat !== 'all' && sectionKey(it.section) !== cat) return false;
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        }).length;
        return przedZwinieciem - filtered.length;
    }, [data, q, source, cat, filtered.length]);

    const showLead = sort === 'waznosc' && source === 'all' && cat === 'all' && !q.trim() && filtered.length > 3;
    const lead = showLead ? filtered[0] : null;
    const rest = showLead ? filtered.slice(1) : filtered;

    // „Pokaż więcej": licznik wraca do PAGE przy każdej zmianie filtrów (klucz), bez efektu.
    const filterKey = `${source}|${cat}|${sort}|${q.trim()}`;
    const [more, setMore] = useState({ key: filterKey, n: PAGE });
    const visibleN = more.key === filterKey ? more.n : PAGE;
    const visible = rest.slice(0, visibleN);
    const hidden = rest.length - visible.length;

    const failed = (data?.sources ?? []).filter((s) => !s.ok);
    const clusters = useMemo(() => filtered.filter((i) => (i.corroboration ?? 1) >= 2).length, [filtered]);
    const sourceName = source === 'all' ? null : sources.find((o) => o.id === source)?.name ?? null;
    const anyFilter = !!q || source !== 'all' || cat !== 'all';
    const clearAll = () => { setQ(''); setSource('all'); setCat('all'); };

    const searchInput = (
        <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mk-faint" aria-hidden />
            <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Szukaj w tytułach i opisach…"
                aria-label="Szukaj w newsach"
                className="mk-input h-11 w-full py-2 max-lg:text-base! lg:h-10 [&::-webkit-search-cancel-button]:hidden"
                style={{ paddingLeft: 36, paddingRight: q ? 44 : 14 }}
            />
            {q && (
                <button
                    type="button"
                    onClick={() => setQ('')}
                    aria-label="Wyczyść wyszukiwanie"
                    className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-mk-faint transition-colors hover:text-mk-text active:bg-mk-surface-alt lg:right-1 lg:h-8 lg:w-8"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );

    const sourceList = (onPick?: () => void) => (
        <>
            <FilterBtn active={source === 'all'} onClick={() => { setSource('all'); onPick?.(); }}>
                <span>Wszystkie źródła</span>
                <span className="tabular-nums text-mk-faint">{data?.count ?? 0}</span>
            </FilterBtn>
            {sources.map((o) => (
                <FilterBtn key={o.id} active={source === o.id} onClick={() => { setSource(o.id); onPick?.(); }}>
                    <span className="truncate pr-2">{o.name}</span>
                    <span className="shrink-0 tabular-nums text-mk-faint">{o.count}</span>
                </FilterBtn>
            ))}
        </>
    );

    const categoryChips = categories.length > 1 && (
        <ChipScroller label="Kategoria" activeKey={cat}>
            <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')} className={chipClass(cat === 'all')}>
                Wszystkie
            </button>
            {categories.map((c) => (
                <button key={c.key} type="button" aria-pressed={cat === c.key} onClick={() => setCat(c.key)} className={chipClass(cat === c.key)}>
                    {categoryName(c.key)}
                    <span className={`tabular-nums text-xs ${cat === c.key ? 'text-white/80' : 'text-mk-faint'}`}>{c.count}</span>
                </button>
            ))}
        </ChipScroller>
    );

    return (
        <div className="mk-fade-in space-y-4">
            <PageHeader
                title="Newsy"
                actions={
                    data && mounted ? (
                        <p className="text-xs text-mk-faint sm:text-[11px]">
                            {data.count} poz. · {data.sourcesOk}/{data.sourcesTotal} źródeł · {formatRelativeTime(data.timestamp)}
                        </p>
                    ) : undefined
                }
            />

            {/* Akapit dnia PRZED leadem — daje kontekst całej doby, zanim czytelnik wejdzie
                w pojedynczą historię. Sam się chowa, gdy digestu jeszcze nie ma. */}
            <DailySummaryCard compact />

            {/* Telefon/tablet: filtry nad listą — szukajka, sortowanie + źródło (arkusz), rząd chipów kategorii. */}
            <div className="space-y-3 lg:hidden">
                {searchInput}
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 [&_.mk-seg]:w-full! [&_.mk-seg-btn]:flex-1">
                        <Segmented
                            value={sort}
                            onChange={setSort}
                            aria-label="Sortowanie newsów"
                            options={[
                                { value: 'waznosc', label: 'Ważne' },
                                { value: 'data', label: 'Najnowsze' },
                            ]}
                        />
                    </div>
                    {sources.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setSheetOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={sheetOpen}
                            className={`inline-flex min-h-11 max-w-[50%] shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt ${
                                sourceName ? 'border-mk-brand/40 bg-mk-brand-soft text-mk-brand' : 'border-mk-border bg-mk-surface text-mk-text-soft'
                            }`}
                        >
                            <SlidersHorizontal size={15} className="shrink-0" aria-hidden />
                            <span className="truncate">{sourceName ?? 'Źródło'}</span>
                            <ChevronDown size={15} className="shrink-0" aria-hidden />
                        </button>
                    )}
                </div>
                {categoryChips}
                {anyFilter && (
                    <button type="button" onClick={clearAll} className="mk-btn min-h-11 w-full active:bg-mk-surface-alt">
                        <X size={15} aria-hidden /> Wyczyść filtry
                    </button>
                )}
            </div>

            <Drawer open={sheetOpen} onClose={() => setSheetOpen(false)} title="Źródło" subtitle={`${sources.length} redakcji w bieżącej paczce`} accent="#DC2626">
                <div className="space-y-1 pb-2">{sourceList(() => setSheetOpen(false))}</div>
            </Drawer>

            {lead && (
                <div className="mk-card mk-card-editorial mk-card-pad-compact border-l-[3px] border-l-mk-brand">
                    <LeadStory item={lead} mounted={mounted} />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
                <aside className="hidden lg:sticky lg:top-[var(--mk-sticky-top)] lg:col-span-3 lg:block">
                    <div className="mk-card mk-card-editorial mk-card-pad-compact space-y-3">
                        <h2 className="mk-section-label">Filtry</h2>

                        {searchInput}

                        <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">Sortowanie</p>
                            <Segmented
                                value={sort}
                                onChange={setSort}
                                aria-label="Sortowanie newsów"
                                options={[
                                    { value: 'waznosc', label: 'Ważne' },
                                    { value: 'data', label: 'Najnowsze' },
                                ]}
                            />
                        </div>

                        {categories.length > 1 && (
                            <div>
                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">Kategoria</p>
                                {categoryChips}
                            </div>
                        )}

                        {sources.length > 0 && (
                            <div>
                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">Źródło</p>
                                <div className="max-h-52 space-y-0.5 overflow-y-auto">{sourceList()}</div>
                            </div>
                        )}

                        {anyFilter && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="w-full rounded-md border border-mk-border px-2.5 py-1.5 text-xs font-medium text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                            >
                                Wyczyść filtry
                            </button>
                        )}
                    </div>
                </aside>

                <section className="min-w-0 space-y-3 lg:col-span-9" aria-label="Lista newsów">
                    {isLoading && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact space-y-3" role="status" aria-busy="true" aria-label="Ładowanie newsów">
                            {Array.from({ length: 8 }, (_, i) => (
                                <div key={i} className="flex gap-3 py-1">
                                    <div className="mk-skeleton hidden h-3 w-10 shrink-0 rounded sm:block" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="mk-skeleton h-4 w-4/5 rounded" />
                                        <div className="mk-skeleton h-3 w-32 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div role="alert" className="mk-card mk-card-editorial mk-card-pad-compact text-sm">
                            <div className="flex items-start gap-2 text-mk-negative">
                                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Nie udało się pobrać newsów.</p>
                                    <p className="mt-0.5 text-mk-muted">{String(error)}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { void refetch(); }} disabled={isFetching} className="mk-btn mt-3 min-h-11 w-full sm:w-auto">
                                {isFetching ? 'Ponawiam…' : 'Spróbuj ponownie'}
                            </button>
                        </div>
                    )}

                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="mk-card mk-card-editorial mk-card-pad-compact py-10 text-center">
                            <Newspaper size={24} className="mx-auto text-mk-faint" />
                            <p className="mt-2 text-sm font-medium text-mk-text">Brak newsów dla tych filtrów</p>
                            <p className="mt-0.5 text-xs text-mk-muted">{q ? <>Nic nie pasuje do „{q}”.</> : 'Spróbuj innego źródła lub kategorii.'}</p>
                            {anyFilter && (
                                <button type="button" onClick={clearAll} className="mk-btn mt-3 min-h-11">Wyczyść filtry</button>
                            )}
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
                                {visible.map((it) => (
                                    <NewsRow key={it.link} item={it} mounted={mounted} />
                                ))}
                            </div>
                            {hidden > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setMore({ key: filterKey, n: visibleN + PAGE })}
                                    className="mk-btn mt-2 min-h-11 w-full active:bg-mk-surface-alt"
                                >
                                    Pokaż kolejne {Math.min(PAGE, hidden)} <span className="font-normal text-mk-muted">· zostało {hidden}</span>
                                    <ChevronDown size={16} aria-hidden />
                                </button>
                            )}
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="space-y-1 px-0.5 text-xs leading-relaxed text-mk-faint sm:text-[11px]">
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
                        <p className="flex items-center gap-1.5 text-xs text-mk-muted sm:text-[11px]">
                            <AlertTriangle size={12} className="shrink-0 text-mk-negative" />
                            Chwilowo bez odpowiedzi: {failed.map((s) => s.name).join(', ')}.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}
