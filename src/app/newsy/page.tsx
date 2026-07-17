'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, AlertTriangle, Newspaper, X, Layers, Flame, Clock, Megaphone, Copy } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { formatRelativeTime, formatTime, formatDate } from '@/lib/formatters';
// Ta sama normalizacja (bez diakrytyków, „ł" → „l"), której używa dopasowanie newsów do tematów.
import { norm, collapseClusters } from '@/lib/news/match';
import { AXIS_INK } from '@/lib/chart-theme';

type Sort = 'waznosc' | 'data';

/** Pasek ważności — 4 stopnie zamiast surowej liczby; liczba 0–100 nic by użytkownikowi nie mówiła. */
function ImportanceMark({ value }: { value: number }) {
    const level = value >= 70 ? 3 : value >= 45 ? 2 : value >= 22 ? 1 : 0;
    const label = ['niska', 'średnia', 'wysoka', 'najwyższa'][level];
    const color = ['#CBD2DD', AXIS_INK, '#2563EB', '#DC2626'][level];
    return (
        <span className="flex shrink-0 items-end gap-[2px]" title={`Ważność: ${label}`} aria-label={`Ważność: ${label}`}>
            {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-[3px] rounded-sm" style={{ height: 4 + i * 3, background: i <= level ? color : '#EDF0F5' }} />
            ))}
        </span>
    );
}

/**
 * Znacznik potwierdzenia — jedyny obiektywny sygnał jakości, jaki mamy, więc nie wolno mu kłamać.
 *
 * Dwa poziomy odsiewania pozornego potwierdzenia (patrz lib/news/cluster.ts):
 *  1. właściciel — Bankier i Puls Biznesu to jedna grupa (Bonnier), nie potwierdzają się nawzajem;
 *  2. przedruk — pomiar na żywych danych pokazał, że 4 z 10 tematów wielo-redakcyjnych to były
 *     PRZEDRUKI tej samej depeszy (opisy identyczne w 78–100%). Badge mówił o nich „2 niezależne
 *     redakcje", czyli zawyżał potwierdzenie na 40% trafień. Teraz przedruk dostaje inny,
 *     neutralny komunikat — bo powtórzenie tego samego tekstu nie jest dowodem na nic.
 */
function CorroborationBadge({ n, wire, alsoIn }: { n: number; wire?: boolean; alsoIn?: string[] }) {
    const tytul = alsoIn?.length ? `Ten sam temat: ${alsoIn.join(', ')}` : undefined;

    // Znacznik przedruku pokazujemy TYLKO wtedy, gdy przedruk zjadł całe potwierdzenie (n===1).
    // Gdy w klastrze są i przedruk, i niezależna relacja (n≥2), ważniejsza jest ta druga —
    // inaczej ukrywalibyśmy realne potwierdzenie i myliliby w drugą stronę.
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

/** Największa pozycja — pierwsza przy sortowaniu wg ważności. */
function LeadStory({ item, mounted }: { item: NewsItem; mounted: boolean }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-2xl border border-mk-border bg-mk-surface p-5 transition-all hover:border-mk-primary/40 hover:shadow-lg sm:p-6"
        >
            <span className="absolute inset-x-0 top-0 h-1 bg-mk-primary" />
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-mk-primary">
                    <Flame size={11} /> Najważniejsze
                </span>
                <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} />
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight tracking-tight text-mk-text transition-colors group-hover:text-mk-primary sm:text-2xl">
                {item.title}
            </h2>
            {item.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mk-muted sm:text-[15px]">{item.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold text-mk-text">{item.source}</span>
                <span className="text-mk-faint">·</span>
                <time dateTime={item.publishedAt} className="text-mk-muted">
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                {item.alsoIn && item.alsoIn.length > 0 && (
                    <>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">także w: {item.alsoIn.join(', ')}</span>
                    </>
                )}
                <ExternalLink size={13} className="ml-auto text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
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
                className="flex items-start gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-mk-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/50"
            >
                <span className="mt-1.5">
                    <ImportanceMark value={item.importance ?? 0} />
                </span>
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
                        <CorroborationBadge n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} />
                        <Flags item={item} />
                    </div>
                </div>
                <ExternalLink size={15} className="mt-1 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
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

    // Liczniki z faktycznie zwróconych pozycji (po deduplikacji), nie z surowych statusów źródeł.
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
        // Jedna historia z kilku redakcji = jeden wiersz (pozostałe widać w podpisie „także w…").
        // Przy filtrze po źródle zwijanie nie ma sensu — użytkownik chce wtedy wszystko z tej redakcji.
        const base = source === 'all' ? collapseClusters(out) : out;
        return sort === 'data'
            ? [...base].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            : [...base].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    }, [data, source, q, sort]);

    /** Ile pozycji schowaliśmy przez zwijanie — mówimy o tym wprost, nic nie znika po cichu. */
    const zwinietych = useMemo(() => {
        if (source !== 'all') return 0;
        const needle = norm(q.trim());
        const przedZwinieciem = (data?.items ?? []).filter((it) => {
            if (!needle) return true;
            return norm(it.title).includes(needle) || norm(it.description).includes(needle);
        }).length;
        return przedZwinieciem - filtered.length;
    }, [data, q, source, filtered.length]);

    // Lead tylko przy sortowaniu wg ważności i bez zawężeń — inaczej „najważniejsze teraz"
    // kłamałoby (byłoby najważniejsze *w ramach filtra*).
    const showLead = sort === 'waznosc' && source === 'all' && !q.trim() && filtered.length > 3;
    const lead = showLead ? filtered[0] : null;
    const rest = showLead ? filtered.slice(1) : filtered;

    const failed = (data?.sources ?? []).filter((s) => !s.ok);
    const clusters = useMemo(() => filtered.filter((i) => (i.corroboration ?? 1) >= 2).length, [filtered]);

    return (
        <div className="mk-fade-in space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Newsy</h1>
                    <p className="mt-1 text-sm text-mk-muted">
                        Wiadomości gospodarcze i rynkowe z polskich redakcji — scalone, odduplikowane i uszeregowane wg ważności
                    </p>
                </div>
                {data && mounted && (
                    <p className="text-xs text-mk-faint">
                        {data.count} pozycji z {data.sourcesOk}/{data.sourcesTotal} źródeł · odświeżono {formatRelativeTime(data.timestamp)}
                    </p>
                )}
            </div>

            {/* Pasek narzędzi */}
            <div className="rounded-2xl border border-mk-border bg-mk-surface p-3 sm:p-4">
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
                <div className="space-y-4 rounded-2xl border border-mk-border bg-mk-surface p-4">
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
                <div className="flex items-start gap-2.5 rounded-2xl border border-mk-border bg-mk-surface p-6 text-sm text-mk-negative">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Nie udało się pobrać newsów.</p>
                        <p className="mt-0.5 text-mk-muted">{String(error)}</p>
                    </div>
                </div>
            )}

            {lead && <LeadStory item={lead} mounted={mounted} />}

            {!isLoading && !isError && filtered.length === 0 && (
                <div className="rounded-2xl border border-mk-border bg-mk-surface py-14 text-center">
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
                <div className="rounded-2xl border border-mk-border bg-mk-surface p-1.5 sm:p-2">
                    <div className="divide-y divide-mk-border">
                        {rest.map((it) => (
                            <NewsRow key={it.link} item={it} mounted={mounted} />
                        ))}
                    </div>
                </div>
            )}

            {/* Jawnie tłumaczymy, skąd bierze się kolejność — inaczej ranking jest czarną skrzynką. */}
            {filtered.length > 0 && (
                <div className="space-y-1.5 px-1 text-xs text-mk-faint">
                    <p>
                        Pokazano {filtered.length} z {data?.count ?? 0} pozycji
                        {zwinietych > 0 && ` (${zwinietych} zwinięto — ten sam temat z kilku redakcji zajmuje jeden wiersz)`}.{' '}
                        {sort === 'waznosc'
                            ? `Ważność łączy liczbę niezależnych redakcji opisujących temat (${clusters} tematów potwierdzonych), świeżość i konkretność — materiały promocyjne i clickbait są obniżane.`
                            : 'Sortowanie od najnowszych.'}
                    </p>
                    <p>
                        Redakcje z jednej grupy właścicielskiej (np. Bankier.pl i Puls Biznesu) liczymy jako jedno źródło —
                        nie potwierdzają się nawzajem.
                    </p>
                </div>
            )}

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
