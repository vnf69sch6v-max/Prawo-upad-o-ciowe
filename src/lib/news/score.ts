// Ważność newsa + detektory jakości. Wszystko liczone z (tytuł, opis, data, źródło, link) —
// bez ML i bez zewnętrznych API.
//
// ─── Uczciwa rama (research 2026-07-16) ───
// Z tych pól NIE DA SIĘ zmierzyć wiarygodności redakcji. Z 9 kryteriów NewsGuard policzalne są
// dwa: „unika mylących nagłówków" i „wyraźnie oznacza reklamy" — reszta wymaga audytu redakcji.
// Dlatego w UI mówimy o „ważności" i „potwierdzeniu przez niezależne redakcje", a NIE o
// „wiarygodności" — inaczej obiecywalibyśmy coś, czego nie dostarczamy.
// Jedyny obiektywny sygnał, jaki mamy, to korroboracja: ilu NIEZALEŻNYCH właścicieli opisuje temat.

import { norm } from './match';
import type { NewsItem } from './types';

/**
 * Zanik świeżości — wykładniczy, z jawnym półokresem.
 *
 * Świadomie NIE kopiujemy wzoru Hacker News (`score/(t+2)^1.8`): HN operuje na głosach 1–1000
 * (~250× dynamiki), a u nas „głosem" jest liczba niezależnych właścicieli w klastrze (1–5, ~5×).
 * Przy grawitacji 1.8 news sprzed 24h musiałby mieć ~370× więcej źródeł, żeby dogonić świeży —
 * czyli czas zmiażdżyłby sygnał ważności i wyszłoby zwykłe sortowanie po dacie.
 *
 * H = po ilu godzinach news traci połowę wartości. To jedna z dwóch liczb, które się tu stroi.
 */
export const HALF_LIFE_HOURS = 10;

export function freshness(publishedAt: string, now = Date.now()): number {
    const ageH = Math.max(0, (now - new Date(publishedAt).getTime()) / 3_600_000);
    return Math.exp((-Math.LN2 * ageH) / HALF_LIFE_HOURS);
}

// ─── Detektor reklamy ────────────────────────────────────
// Podstawa prawna oznaczania: Prawo prasowe art. 36 ust. 3 + ustawa o zwalczaniu nieuczciwej
// konkurencji art. 16 (zakaz kryptoreklamy).
//
// UWAGA: „materiał partnera" / „we współpracy z" NIE są łagodniejszą wersją „artykułu
// sponsorowanego" — to formuły, które UOKiK i Komisja Etyki uznały za NIEWYSTARCZAJĄCE
// oznaczenie reklamy. Czyli reklama, którą próbowano zamaskować → karzemy tak samo ostro.
// UWAGA — „we współpracy z" NIE może tu stać samo. To zwykła polszczyzna biznesowa i łapało
// prawdziwe newsy: „Honda… we współpracy z General Motors" i „GPW we współpracy z rynkiem"
// zostały błędnie oznaczone jako reklama. Reklamę zdradza dopiero formuła UJAWNIENIA
// („artykuł powstał we współpracy z…"), nie sam fakt współpracy firm.
const AD_PATTERNS = [
    'artykul sponsorowany', 'tekst sponsorowany', 'material sponsorowany', 'wpis sponsorowany',
    'artykul promocyjny', 'material promocyjny', 'tresc promocyjna',
    'advertorial', 'lokowanie produktu', 'material partnera', 'artykul partnera',
    'partnerem tresci jest', 'partnerem materialu jest', 'partnerem artykulu jest',
    'powstal we wspolpracy z', 'powstal przy wspolpracy z', 'we wspolpracy z partnerem',
];

const AD_URL_PATTERNS = ['/reklama', '/promocja', '/sponsorowane', '/partner', 'utm_medium=paid', 'utm_medium=sponsor'];

/** Autopromocja serwisu (subskrypcje, webinary, konkursy) — to nie jest news. */
const SELF_PROMO = ['subskrypcj', 'prenumerat', 'webinar', 'zapisz sie na', 'wygrywaj z', 'zaloz konto', 'ranking kont', 'ranking lokat', 'kup bilet'];

export function isAd(item: Pick<NewsItem, 'title' | 'description' | 'link'>): boolean {
    const t = norm(`${item.title} ${item.description}`);
    if (AD_PATTERNS.some((p) => t.includes(p))) return true;
    const url = item.link.toLowerCase();
    return AD_URL_PATTERNS.some((p) => url.includes(p));
}

export function isSelfPromo(item: Pick<NewsItem, 'title' | 'description'>): boolean {
    const t = norm(`${item.title} ${item.description}`);
    return SELF_PROMO.some((p) => t.includes(p));
}

// ─── Detektor clickbaitu ─────────────────────────────────
// Whitelist skrótowców jest KONIECZNA: bez niej reguła „słowo ALL-CAPS" ukarałaby najtwardsze
// newsy makro („NBP”, „GUS”, „RPP”, „KGHM”) — to najczęstszy błąd tej heurystyki.
const CAPS_WHITELIST = new Set([
    'NBP', 'GUS', 'RPP', 'CPI', 'PPI', 'PKB', 'EBC', 'FED', 'MFW', 'UE', 'USA', 'UOKIK', 'KNF', 'ZUS', 'PIT', 'CIT', 'VAT',
    'GPW', 'WIG', 'WIG20', 'MWIG40', 'SWIG80', 'PLN', 'EUR', 'USD', 'CHF', 'GBP', 'PMI', 'HICP', 'WIBOR', 'ESPI', 'IPO',
    'PKN', 'KGHM', 'PKO', 'PZU', 'JSW', 'PGE', 'CDR', 'LPP', 'PGZ', 'PIP', 'MF', 'AI', 'IT', 'ES', 'PB', 'BI',
    // Tickery WIG20 — bez tego reguła ALL-CAPS karałaby newsy o spółkach jako „krzyczące".
    'ALE', 'ALR', 'BDX', 'CPS', 'DNP', 'KGH', 'KRU', 'KTY', 'MBK', 'OPL', 'PCO', 'PEO', 'ZAB', 'TPE',
]);

const CLICKBAIT_STRONG_WORDS = [
    'nie uwierzysz', 'szok', 'szokujac', 'wstrzasajac', 'hit ', 'musisz ', 'to juz pewne',
    'sprawdz, czy', 'uwaga na', 'oto dlaczego', 'oto co', 'zdradza sekret', 'tego nie wiedziales',
];

/** Zwraca 'strong' | 'weak' | null. */
export function clickbaitLevel(title: string): 'strong' | 'weak' | null {
    const n = norm(title);
    if (CLICKBAIT_STRONG_WORDS.some((w) => n.includes(w))) return 'strong';

    let signals = 0;
    if (title.includes('!')) signals++;
    if (/\.{3}|…/.test(title)) signals++;
    // ALL-CAPS z pominięciem skrótowców i tickerów
    const caps = title.match(/\b[A-ZĄĆĘŁŃÓŚŹŻ]{3,}\b/g) ?? [];
    if (caps.some((c) => !CAPS_WHITELIST.has(c))) signals++;
    if (signals >= 2) return 'strong';

    if (title.trimStart().startsWith('"') || title.trimStart().startsWith('„')) return 'weak';
    if (title.trimEnd().endsWith('?')) return 'weak';
    if (title.split(/\s+/).length > 13) return 'weak';
    return signals >= 1 ? 'weak' : null;
}

/** Rozdział newsa od opinii — to jedno z kryteriów NewsGuard, które da się policzyć z tytułu. */
const OPINION_WORDS = ['komentarz', 'opinia', 'felieton', 'zdaniem', 'okiem ', 'podsumowanie tygodnia', 'prognoza tygodnia'];
export function isOpinion(title: string): boolean {
    const n = norm(title);
    return OPINION_WORDS.some((w) => n.includes(w));
}

// ─── Sygnały „twardego" newsa makro ──────────────────────
const HARD_ENTITIES = ['nbp', 'rpp', 'gus', 'ebc', 'fed', 'eurostat', 'knf', 'uokik', 'ministerstwo finansow', 'cpi', 'ppi', 'pkb', 'inflacj', 'stopy procentow', 'wibor', 'gpw', 'wig'];

export function hasHardEntity(item: Pick<NewsItem, 'title' | 'description'>): boolean {
    const t = norm(`${item.title} ${item.description}`);
    return HARD_ENTITIES.some((e) => t.includes(e));
}

/** Konkretna liczba (procent / mld / mln / pkt bazowe) — sygnał newsa z danymi, nie z opinią. */
export function hasHardNumber(item: Pick<NewsItem, 'title' | 'description'>): boolean {
    return /\d+[,.]?\d*\s*(%|proc\.|mld|mln|pkt)/i.test(`${item.title} ${item.description}`);
}

export interface ScoreInput {
    item: NewsItem;
    /** Suma wag NIEZALEŻNYCH właścicieli w klastrze (nie liczba domen!). */
    clusterWeight: number;
    /** Czy to najstarszy news w klastrze — proxy „oryginalnego zgłoszenia tematu". */
    isFirst: boolean;
    now?: number;
}

export interface ScoreResult {
    /** Surowa ważność (przed normalizacją do 0–100). */
    raw: number;
    ad: boolean;
    clickbait: 'strong' | 'weak' | null;
    opinion: boolean;
}

/**
 * Ważność = (siła klastra ^ 0.8) × bonusy treściowe × świeżość × kary.
 *
 * • `^0.8` — malejące zwroty: druga redakcja opisująca temat wnosi więcej niż piąta.
 * • kary multiplikatywne (jak `penalties` w HN) — reklama praktycznie zeruje pozycję.
 */
export function scoreItem({ item, clusterWeight, isFirst, now = Date.now() }: ScoreInput): ScoreResult {
    const ad = isAd(item);
    const selfPromo = isSelfPromo(item);
    const clickbait = clickbaitLevel(item.title);
    const opinion = isOpinion(item.title);

    let bonus = 1;
    if (hasHardEntity(item)) bonus += 0.2;
    if (hasHardNumber(item)) bonus += 0.1;
    if (isFirst) bonus += 0.1;

    let penalty = 1;
    if (ad) penalty *= 0.02;
    if (selfPromo) penalty *= 0.35;
    if (clickbait === 'strong') penalty *= 0.6;
    else if (clickbait === 'weak') penalty *= 0.8;
    if (opinion) penalty *= 0.7;

    const raw = Math.pow(Math.max(clusterWeight, 0.1), 0.8) * bonus * freshness(item.publishedAt, now) * penalty;
    return { raw, ad, clickbait, opinion };
}
