import { Activity, CalendarClock, ClipboardList, Search, Settings, type LucideIcon } from 'lucide-react';
import { NAV_ITEMS, isActive, type NavItem } from './TopNav';

/**
 * Dolny pasek zakładek (< lg): 4 sekcje + „Więcej”. Wybór wg częstotliwości zmian danych i drogi
 * „≤2 tapnięcia do liczby”:
 *  - Przegląd — start, najważniejsze odczyty i newsy;
 *  - Rynki — dane dzienne/śróddzienne (WIG20, kursy, stopy) — najczęściej sprawdzane z telefonu;
 *  - Ceny — inflacja CPI, główny wskaźnik makro (miesięczny, „headline”);
 *  - Gospodarka — PKB, koniunktura, finanse publiczne (miesięczne/kwartalne).
 * Rynek pracy (miesięczny), Newsy (najświeższe są też na Przeglądzie i w Rynkach), Regiony
 * (roczne/kwartalne) i Parser (narzędzie, nie dane) trafiają do arkusza „Więcej”.
 */
export const TAB_HREFS = ['/', '/rynki', '/ceny', '/gospodarka'] as const;

export const TAB_ITEMS: NavItem[] = TAB_HREFS.map((href) => NAV_ITEMS.find((it) => it.href === href)!);

export type MoreLink = { kind: 'link'; label: string; href: string; icon: LucideIcon; hint?: string };
export type MoreAction = { kind: 'search'; label: string; icon: LucideIcon; hint?: string };
export type MoreEntry = MoreLink | MoreAction;
export interface MoreGroup { title: string; items: MoreEntry[] }

export const MORE_GROUPS: MoreGroup[] = [
    {
        title: 'Sekcje',
        items: NAV_ITEMS.filter((it) => !(TAB_HREFS as readonly string[]).includes(it.href)).map((it) => ({ kind: 'link', ...it })),
    },
    {
        title: 'Narzędzia',
        items: [
            { kind: 'search', label: 'Szukaj', icon: Search, hint: 'Wskaźniki, sekcje, działy' },
            { kind: 'link', label: 'Kalendarz publikacji', href: '/publikacje', icon: CalendarClock, hint: 'Terminy danych GUS i NBP' },
            { kind: 'link', label: 'Podsumowanie dnia', href: '/podsumowanie', icon: ClipboardList, hint: 'Dane i newsy z jednego dnia' },
            { kind: 'link', label: 'Stan danych', href: '/status', icon: Activity, hint: 'Świeżość źródeł danych' },
        ],
    },
    {
        title: 'Aplikacja',
        items: [
            { kind: 'link', label: 'Ustawienia', href: '/ustawienia', icon: Settings, hint: 'Konto, motyw, źródła' },
        ],
    },
];

const MORE_HREFS = MORE_GROUPS.flatMap((g) => g.items.flatMap((it) => (it.kind === 'link' ? [it.href] : [])));

/** Bieżąca strona jest w arkuszu „Więcej” → zakładka „Więcej” jest aktywna (jak „More” w iOS). */
export function isMoreActive(pathname: string): boolean {
    return MORE_HREFS.some((href) => isActive(pathname, href));
}
