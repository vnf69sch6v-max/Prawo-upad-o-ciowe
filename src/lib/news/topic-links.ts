import { matchesTopic, type NewsTopic } from './match';
import type { NewsItem } from './types';

/** Strony wskaźników dla chipów „Powiązane wskaźniki” na Przeglądzie (te same reguły co karty newsów). */
export const TOPIC_LINKS: { topic: NewsTopic; label: string; href: string }[] = [
    { topic: 'ceny', label: 'Inflacja CPI', href: '/ceny?tab=inflacja' },
    { topic: 'gospodarka', label: 'PKB / aktywność', href: '/gospodarka?tab=aktywnosc' },
    { topic: 'praca', label: 'Rynek pracy', href: '/praca' },
    { topic: 'rynki', label: 'Rynki finansowe', href: '/rynki' },
];

/** Tematy, przy których karta pokazałaby ten news — polskie pozycje tylko. */
export function newsTopics(item: Pick<NewsItem, 'title' | 'description'> & { lang?: string }) {
    if ((item.lang ?? 'pl') !== 'pl') return [];
    return TOPIC_LINKS.filter((t) => matchesTopic(item, t.topic));
}
