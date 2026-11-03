import type { NewsItem } from '@/lib/news/types';

/**
 * Tłumaczenie maszynowe zagranicznego newsa (ROADMAP N3, spec `docs/specs/2026-11-03-newsy-tlumaczenie.md`).
 * Polski tytuł idzie w nagłówek, oryginał zostaje pod nim — mniejszy i szary, z jawnym „tłum. maszynowe”,
 * bo czytelnik musi wiedzieć, że to nie słowa redakcji. Bez `titlePl` wszystko jak przed N3: sam oryginał.
 */
type Translatable = Pick<NewsItem, 'title' | 'lang' | 'titlePl' | 'leadPl' | 'description'>;

export const displayTitle = (it: Translatable) => it.titlePl || it.title;
export const displayLang = (it: Translatable) => (it.titlePl ? 'pl' : it.lang ?? 'pl');
export const displayLead = (it: Translatable) => (it.titlePl && it.leadPl) || it.description;

/** Linia pod polskim tytułem: „tłum. maszynowe · <oryginał>”. Na telefonie jeden wiersz z ucięciem, od `sm` całość. */
export function OriginalTitle({ item }: { item: Translatable }) {
    if (!item.titlePl) return null;
    return (
        <p data-news-original className="mt-0.5 truncate text-xs leading-snug text-mk-faint sm:whitespace-normal" title={item.title}>
            <span className="text-mk-muted">tłum. maszynowe</span>
            <span aria-hidden> · </span>
            <span lang={item.lang ?? 'en'}>{item.title}</span>
        </p>
    );
}
