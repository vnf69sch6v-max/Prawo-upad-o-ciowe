// Dopasowanie newsów do tematów dashboardu — news postawiony przy wskaźniku, którego dotyczy.
// Świadomie stawiamy na PRECYZJĘ, nie zasięg: lepiej pokazać 2 trafne newsy niż 5 przypadkowych.
// Spec: `docs/specs/2026-11-03-newsy-przy-wskaznikach.md` (ROADMAP N4). Test na prawdziwej paczce
// z ręcznymi etykietami: `tests/news-match.test.ts` + `tests/fixtures/news-topics-2026-11-03.json`.
//
// ─── Dlaczego to wygląda tak, a nie prościej (wnioski z audytów na żywym /api/news) ───
//
// 1. Tytuł mówi, o czym artykuł JEST; opis często tylko coś WSPOMINA. Realne śmieci z opisów:
//      • „Droższe paliwo zmienia plany Ryanaira" — w opisie „zamrożenie wynagrodzeń" → to nie news o płacach;
//      • „Rodziny mogą stracić na zmianach w 800 plus" — w opisie „siła nabywcza świadczenia" → nie o inflacji;
//      • „Firmy znów ruszyły po kredyty" — w opisie „spadek stóp procentowych" → nie o RPP.
//    Dlatego opis liczy się dopiero przy DWÓCH różnych frazach jednoznacznych tematu (jedna = wzmianka),
//    a frazy wieloznaczne (`titleOnly`) sprawdzamy wyłącznie w tytule.
//
// 2. Dwa tryby granicy słowa, bo polski wymusza jedno i drugie:
//      • prefiks — odmiana przez końcówki (inflacja/inflacji/inflacyjny) → granica OD LEWEJ;
//      • całe słowo — gdy końcówka zmienia znaczenie → granica z OBU stron. Bez tego prefiks
//        „zloty" łapie „setki milionów złotych" (kwota, nie waluta), a „wig" łapie „wigilię".
//    W prefiksie `*` = dowolna końcówka w ŚRODKU frazy: „podwyzk* cen" łapie „podwyżki cen" i „podwyżka cen".
//
// 3. Każda grupa ma etykietę podtematu (PALIWA, STOPY, PŁACE…) — UI pokazuje ją jako neutralny tag,
//    żeby było widać, dlaczego news stoi przy tym wskaźniku.

import type { NewsItem } from './types';

/**
 * Normalizacja: bez diakrytyków i wielkości liter.
 * NFD rozkłada ą/ć/ę/ń/ó/ś/ź/ż na literę + znak łączący (U+0300–U+036F), ale „ł" (U+0142)
 * NIE ma rozkładu → podmieniamy ręcznie, inaczej „zloty" nie znajdzie „złoty".
 */
export const norm = (s: string): string =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/gi, 'l').toLowerCase();

export type NewsTopic = 'ceny' | 'gospodarka' | 'praca' | 'rynki';

/**
 * Poziom pewności dopasowania (bez zmiany słowników):
 *  - `all` — domyślnie: tytuł = strong+titleOnly, opis = strong (≥2 frazy);
 *  - `strong` — tylko frazy jednoznaczne. UI tematów wrażliwych (np. Rynek pracy) może zawęzić pas.
 */
export type MatchTier = 'all' | 'strong';

export interface MatchNewsOptions {
    matchTier?: MatchTier;
    /** Odfiltruj pozycje oznaczone jako opinia/felieton (`isOpinion` z /api/news). */
    excludeOpinion?: boolean;
}

interface Phrases {
    /** Dopasowanie od początku słowa — łapie całą rodzinę odmian; `*` = końcówka w środku frazy. */
    prefixes?: string[];
    /** Dopasowanie całego słowa — gdy prefiks łapałby co innego. */
    words?: string[];
}

interface PhraseGroup {
    /** Podtemat pokazywany jako tag przy newsie (wersaliki, po polsku). */
    label: string;
    /**
     * Rdzeń strony — przy równej sile dopasowania idzie przed resztą. Na /ceny szybki szacunek CPI ma stać
     * nad cenami paliw, a nie pod „Więcej” na telefonie (pomiar 03.11.2026).
     */
    core?: boolean;
    /** Jednoznaczne — tytuł zawsze, opis przy ≥2 różnych frazach tematu. */
    strong?: Phrases;
    /** Wieloznaczne lub podatne na wzmianki mimochodem — WYŁĄCZNIE w tytule. */
    titleOnly?: Phrases;
}

interface TopicRules {
    groups: PhraseGroup[];
    /**
     * Weto dla dopasowań `titleOnly`: tytuł z tymi frazami bez żadnej frazy `strong` nie pasuje.
     * Rynki: „Wybory w USA, a giełda. Prognoza dla S&P 500" to nie news o GPW.
     */
    titleVeto?: Phrases;
}

/**
 * Wzorce per temat — wpisywane BEZ diakrytyków (porównanie leci na tekście po `norm()`).
 * Kolejność grup ma znaczenie: tag dostaje PIERWSZA grupa trafiona w tytule, więc
 * bardziej konkretne grupy idą wyżej. Przenosząc frazę z `titleOnly` do `strong`, przepuść
 * `tests/news-match.test.ts` — tam są tytuły, które już raz wpadły jako fałszywe.
 */
const TOPIC_RULES: Record<NewsTopic, TopicRules> = {
    ceny: {
        groups: [
            {
                label: 'Paliwa',
                strong: { prefixes: ['cen* paliw', 'cen* benzyn', 'cen* oleju napedow', 'program* cpn'], words: ['cpn'] },
                titleOnly: { prefixes: ['na stacjach', 'benzyn', 'olej* napedow'] },
            },
            {
                label: 'Energia',
                strong: {
                    prefixes: [
                        'cen* pradu', 'cen* gazu', 'cen* energii', 'cen* ciepla',
                        'taryf* za gaz', 'taryf* za prad', 'taryf* na gaz', 'taryf* na prad', 'taryf* gazow',
                        'rachunk* za gaz', 'rachunk* za prad', 'rachunk* za energi', 'rachunk* za ciepl', 'rachunk* za wegiel',
                        'koszt* pradu', 'koszt* energii elektrycznej',
                    ],
                },
                titleOnly: { prefixes: ['za prad', 'za gaz'] },
            },
            {
                label: 'Inflacja',
                core: true,
                strong: {
                    prefixes: [
                        'inflacj', 'deflacj', 'dezinflacj', 'hicp',
                        'wskaznik* cen', 'cen* towarow i uslug',
                    ],
                    words: ['cpi'],
                },
            },
            {
                label: 'Ceny',
                strong: {
                    prefixes: [
                        'drozyzn', 'podwyzk* cen', 'wzrost* cen', 'spad* cen', 'cen* zywnosci',
                        'koszyk* zakupow', 'cen* producent',
                    ],
                    words: ['ppi'],
                },
                // „drożeje" bywa użyte o czymkolwiek — w tytule to teza, w opisie dygresja.
                // „siła nabywcza" w opisie to zwykle świadczenie albo pensja („800 plus"), nie inflacja.
                titleOnly: { prefixes: ['drozej', 'tanie', 'sil* nabywcz'] },
            },
        ],
    },
    rynki: {
        groups: [
            {
                label: 'Stopy',
                core: true,
                // Stopy — WYŁĄCZNIE w kontekście polityki pieniężnej. Samo „stopa" łapie
                // „stopę bezrobocia", czyli temat Praca.
                strong: {
                    prefixes: [
                        'stop* procentow', 'stop* referencyjn', 'ciec* stop', 'obnizk* stop', 'podwyzk* stop',
                        'rad* polityki pienieznej', 'polityk* pieniezn',
                    ],
                    words: ['rpp', 'wibor', 'wiron'],
                },
            },
            {
                label: 'Złoty',
                core: true,
                strong: {
                    prefixes: [
                        'kurs* euro', 'kurs* dolar', 'kurs* frank', 'kurs* funt', 'kurs* zlotego', 'kurs* walut',
                        'notowan* zlotego', 'oslabien* zlotego', 'umocnien* zlotego', 'euro-zlot', 'rynk* walutow',
                    ],
                    words: ['eurpln', 'usdpln', 'chfpln'],
                },
                titleOnly: { words: ['zloty', 'zlotego', 'zlotowka', 'zlotowki', 'zlotowce'] },
            },
            {
                label: 'GPW',
                core: true,
                strong: { words: ['wig20', 'mwig40', 'swig80', 'wig30', 'newconnect'] },
                // „giełda"/„obligacje" w opisie łapały newsy o czymkolwiek, co wspomina rynek → tylko tytuł.
                titleOnly: { prefixes: ['gield', 'akcj* spolki', 'notowan', 'dywidend'], words: ['gpw', 'wig'] },
            },
            {
                label: 'NBP',
                strong: { prefixes: ['glapinsk', 'prezes* nbp'], words: ['nbp'] },
            },
            {
                label: 'Rynki',
                strong: { prefixes: ['rynk* finansow', 'polskich aktyw', 'polskie aktyw', 'rentownosc* obligacji'] },
                titleOnly: { prefixes: ['obligacj', 'rentownosc'], words: ['rynki'] },
            },
        ],
        titleVeto: {
            prefixes: ['wall street', 'amerykansk', 'midterms'],
            words: ['usa', 'us', 's&p', 'nasdaq', 'dow', 'fed'],
        },
    },
    praca: {
        groups: [
            {
                label: 'Bezrobocie',
                core: true,
                strong: { prefixes: ['bezroboc', 'bezrobotn', 'urzed* pracy'] },
            },
            {
                label: 'Płace',
                core: true,
                strong: {
                    prefixes: [
                        'wynagrodz', 'plac* minimaln', 'pensj* minimaln', 'podwyzk* plac', 'plac* realn', 'plac* nominaln',
                        'roznic* plac', 'luk* placow', 'zarobk',
                    ],
                },
                // „pensj" musi być całym słowem: prefiks łapie „pensjonariusza".
                titleOnly: { words: ['pensja', 'pensje', 'pensji', 'pensjach', 'pensjami'] },
            },
            {
                label: 'Rynek pracy',
                strong: {
                    prefixes: [
                        'rynek pracy', 'rynku pracy', 'rynk* pracy', 'wakat', 'sil* robocz', 'rak do pracy', 'rece do pracy',
                        'nadgodzin', 'luk* kadrow', 'zwolnien* grupow', 'przecietne zatrudnien', 'przecietnego zatrudnien',
                    ],
                },
                // „zatrudnienie" w OPISIE to zwykle wzmianka mimochodem (wyniki spółki, raport GUS o transporcie)
                // — w tytule jest tezą artykułu.
                titleOnly: { prefixes: ['zatrudni', 'zwolnien', 'pracujac*'], words: ['etat', 'etaty', 'etatow', 'etatach'] },
            },
            {
                label: 'Strajki',
                titleOnly: { prefixes: ['strajk'] },
            },
        ],
    },
    gospodarka: {
        groups: [
            {
                label: 'PKB',
                core: true,
                strong: {
                    prefixes: ['produkt* krajow* brutto', 'wzrost* gospodarcz', 'recesj', 'spowolnien* gospodarcz'],
                    words: ['pkb'],
                },
            },
            {
                label: 'Aktywność',
                core: true,
                strong: {
                    prefixes: ['produkcj* przemyslow', 'sprzedaz* detaliczn', 'koniunktur', 'sytuacj* gospodarcz', 'kondycj* gospodark'],
                    words: ['pmi'],
                },
                // „polska gospodarka" w opisie pada przy byle wywiadzie — w tytule to temat artykułu.
                titleOnly: { prefixes: ['polsk* gospodar'] },
            },
            {
                label: 'Finanse publiczne',
                strong: {
                    prefixes: ['dlug* publiczn', 'deficyt* budzetow', 'budzet* panstw', 'finans* publiczn', 'sektor* instytucji rzadow'],
                },
            },
            {
                label: 'Podatki',
                titleOnly: { prefixes: ['ministerstw* finansow', 'resort* finansow', 'akcyz', 'podatk'], words: ['vat', 'pit', 'cit'] },
            },
        ],
    },
};

/** Ile newsów jednego podtematu stoi w karcie przed newsami innych podtematów. */
const MAX_PER_LABEL_FIRST = 2;

/** Ile różnych fraz jednoznacznych musi paść w opisie, żeby opis się liczył. */
const DESC_MIN_PHRASES = 2;

const esc = (p: string) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
/** `*` w środku frazy = dowolna końcówka fleksyjna. */
const phraseSrc = (p: string) => esc(p).replace(/\*/g, '\\p{L}*');

function phraseRegexes(ph: Phrases | undefined): RegExp[] {
    if (!ph) return [];
    return [
        ...(ph.prefixes ?? []).map((p) => new RegExp(`(?<!\\p{L})${phraseSrc(p)}`, 'u')),
        ...(ph.words ?? []).map((w) => new RegExp(`(?<!\\p{L})${phraseSrc(w)}(?!\\p{L})`, 'u')),
    ];
}

interface CompiledGroup {
    label: string;
    core: boolean;
    strong: RegExp[];
    titleOnly: RegExp[];
}

interface CompiledTopic {
    groups: CompiledGroup[];
    veto: RegExp[];
}

/** Cache skompilowanych regexów — dopasowanie bywa wołane przy każdym renderze sekcji. */
const CACHE = new Map<NewsTopic, CompiledTopic>();

function compiled(topic: NewsTopic): CompiledTopic {
    const hit = CACHE.get(topic);
    if (hit) return hit;
    const rules = TOPIC_RULES[topic];
    const built: CompiledTopic = {
        groups: rules.groups.map((g) => ({
            label: g.label,
            core: g.core ?? false,
            strong: phraseRegexes(g.strong),
            titleOnly: phraseRegexes(g.titleOnly),
        })),
        veto: phraseRegexes(rules.titleVeto),
    };
    CACHE.set(topic, built);
    return built;
}

export interface TopicMatch {
    /** Siła dopasowania: 3 = fraza jednoznaczna w tytule, 2 = fraza wieloznaczna w tytule, 1 = opis. */
    score: 1 | 2 | 3;
    /** Podtemat (etykieta grupy), np. „Paliwa”, „Stopy”. */
    label: string;
    /** Czy podtemat to rdzeń strony (patrz `PhraseGroup.core`). */
    core: boolean;
}

/**
 * Jak (i czy) news dotyczy tematu. `null` = nie dotyczy.
 * Tytuł: fraza `strong` → 3; fraza `titleOnly` (bez weta) → 2. Opis: ≥2 różne frazy `strong` → 1.
 * Przy `tier = 'strong'` frazy `titleOnly` nie liczą się wcale.
 */
export function topicMatch(
    item: Pick<NewsItem, 'title' | 'description'>,
    topic: NewsTopic,
    tier: MatchTier = 'all',
): TopicMatch | null {
    const { groups, veto } = compiled(topic);
    const t = norm(item.title);

    const strongInTitle = groups.find((g) => g.strong.some((re) => re.test(t)));
    if (strongInTitle) return { score: 3, label: strongInTitle.label, core: strongInTitle.core };

    if (tier === 'all' && !veto.some((re) => re.test(t))) {
        const weakInTitle = groups.find((g) => g.titleOnly.some((re) => re.test(t)));
        if (weakInTitle) return { score: 2, label: weakInTitle.label, core: weakInTitle.core };
    }

    if (!item.description) return null;
    const d = norm(item.description);
    let total = 0;
    let best: { g: CompiledGroup; n: number } | null = null;
    for (const g of groups) {
        const n = g.strong.filter((re) => re.test(d)).length;
        total += n;
        if (n > 0 && (!best || n > best.n)) best = { g, n };
    }
    return total >= DESC_MIN_PHRASES && best ? { score: 1, label: best.g.label, core: best.g.core } : null;
}

/** Czy news dotyczy tematu? (skrót do `topicMatch`). */
export function matchesTopic(
    item: Pick<NewsItem, 'title' | 'description'>,
    topic: NewsTopic,
    tier: MatchTier = 'all',
): boolean {
    return topicMatch(item, topic, tier) !== null;
}

/**
 * Serie dzienne — ta sama redakcja codziennie publikuje kilka niemal identycznych pozycji
 * („Ile kosztuje euro? Kurs euro…", „… dolar…", „… frank…", „… funt…"). Na /rynki zajmowały
 * 4 z 5 miejsc (pomiar 03.11.2026). Zostaje jedna pozycja na serię — pierwsza w kolejności rankingu.
 */
const DAILY_SERIES: { key: string; re: RegExp }[] = [
    { key: 'kurs-walut-dnia', re: /^ile kosztuje\b.*\bkurs\b/u },
    // „Nowe ceny paliw na wtorek" (Interia) i „Minister ogłosił nowe ceny paliw" (Money.pl) — ten sam komunikat.
    { key: 'ceny-paliw-dnia', re: /(?<!\p{L})nowe ceny paliw(?!\p{L})/u },
];

export function dailySeriesKey(title: string): string | null {
    const t = norm(title);
    return DAILY_SERIES.find((s) => s.re.test(t))?.key ?? null;
}

/**
 * Ta sama historia z dwóch redakcji, której klasteryzacja nie skleiła („Darmowe nadgodziny nadal są
 * problemem" / „Darmowe nadgodziny wciąż powszechne", pomiar 03.11.2026): dwa pierwsze słowa tytułu,
 * oba ≥5 liter. W pasie tematu precyzja ważniejsza niż zasięg, więc druga pozycja odpada.
 */
export function leadWordsKey(title: string): string | null {
    const words = norm(title).split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 2);
    return words.length === 2 && words.every((w) => w.length >= 5) ? words.join(' ') : null;
}

/**
 * Dopasowanie newsów do KONKRETNEJ SPÓŁKI (aliasy z `lib/wig20.ts`).
 *
 * Ta sama zasada co przy tematach: tytuł mówi, o czym news JEST; opis często tylko coś wspomina.
 * Dlatego trafienie w TYTULE liczy się zawsze, a w OPISIE — tylko dla aliasów dostatecznie
 * odróżniających (≥6 znaków). Bez tego „kruk" (ptak), „dino", „żabka" (też: pływanie żabką)
 * czy „orange" (kolor) wciągałyby przypadkowe newsy z samych opisów.
 *
 * Aliasy wpisujemy jako RDZENIE bez diakrytyków (porównanie po `norm()`), bo polski odmienia:
 * „orlen" łapie „Orlenu/Orlenem", „zabk" łapie „Żabka/Żabki/Żabkę".
 */
// Próg 7 (nie 6) celowo: „orange" ma dokładnie 6 znaków i jako jedyny alias-zwykłe-słowo
// przeszedłby niżej ustawiony próg. W audycie 2026-07-17 (16 trafień/150 newsów) ryzykowne
// aliasy — kruk, dino, orange, kety — nie dały ANI JEDNEGO trafienia, więc pozostają
// NIESPRAWDZONE: przy zmianie progu powtórzyć audyt na świeżej paczce.
const DESC_MIN_ALIAS = 7;

function aliasRegex(aliases: string[]): RegExp {
    const alts = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(`(?<!\\p{L})(?:${alts})`, 'u');
}

export function matchesCompany(
    item: Pick<NewsItem, 'title' | 'description'>,
    aliases: string[],
): boolean {
    if (aliases.length === 0) return false;
    if (aliasRegex(aliases).test(norm(item.title))) return true;

    const distinctive = aliases.filter((a) => a.length >= DESC_MIN_ALIAS);
    if (distinctive.length === 0 || !item.description) return false;
    return aliasRegex(distinctive).test(norm(item.description));
}

/** Newsy o danej spółce — po jednym na temat, najważniejsze pierwsze. */
export function matchCompanyNews<T extends Pick<NewsItem, 'title' | 'description' | 'importance' | 'clusterId'>>(
    items: T[],
    aliases: string[],
    limit = 5,
): T[] {
    const hits = collapseClusters(items.filter((it) => matchesCompany(it, aliases)));
    hits.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    return hits.slice(0, limit);
}

/**
 * Zwija klastry do jednego reprezentanta na temat.
 *
 * Ten sam news z 3 redakcji ma 3 osobne pozycje — bez zwijania jedna historia zajmowała 3 z 6
 * miejsc na Przeglądzie („Susza zagraża rolnictwu" / „Alarm dla polskiego rolnictwa" /
 * „Susza zabija rolnictwo"). Zostaje najmocniejsza pozycja; pozostałe redakcje widać w `alsoIn`.
 * Pozycje bez `clusterId` (np. gdy API nie policzyło rankingu) przechodzą bez zmian.
 */
export function collapseClusters<T extends Pick<NewsItem, 'clusterId' | 'importance'>>(items: T[]): T[] {
    const best = new Map<number, T>();
    const out: T[] = [];
    for (const it of items) {
        if (it.clusterId == null) { out.push(it); continue; }
        const cur = best.get(it.clusterId);
        if (!cur) { best.set(it.clusterId, it); out.push(it); continue; }
        if ((it.importance ?? 0) > (cur.importance ?? 0)) {
            out[out.indexOf(cur)] = it;
            best.set(it.clusterId, it);
        }
    }
    return out;
}

type MatchableNews = Pick<NewsItem, 'title' | 'description' | 'importance' | 'clusterId'> & {
    isOpinion?: boolean;
    lang?: string;
};

export interface LabelledMatch<T> extends TopicMatch {
    item: T;
}

/**
 * Newsy dotyczące tematu z podtematem: tylko polskie (kanały EN mają własny filtr na /newsy —
 * „CPI" z USA przy polskim CPI byłby fałszywym trafieniem), po jednej pozycji na klaster, serię
 * dzienną i parę tytułów o tych samych dwóch pierwszych słowach, uszeregowane: siła dopasowania (tytuł przed
 * opisem), rdzeń strony (`core`), potem `importance`.
 */
export function matchNewsLabelled<T extends MatchableNews>(
    items: T[],
    topic: NewsTopic,
    limit = 5,
    opts: MatchNewsOptions = {},
): LabelledMatch<T>[] {
    const tier = opts.matchTier ?? 'all';
    const found = new Map<T, TopicMatch>();
    for (const it of items) {
        if ((it.lang ?? 'pl') !== 'pl') continue;
        if (opts.excludeOpinion && it.isOpinion) continue;
        const m = topicMatch(it, topic, tier);
        if (m) found.set(it, m);
    }
    const ranked = collapseClusters([...found.keys()])
        .map((item) => ({ item, ...(found.get(item) as TopicMatch) }))
        .sort((a, b) =>
            b.score - a.score
            || Number(b.core) - Number(a.core)
            || (b.item.importance ?? 0) - (a.item.importance ?? 0));

    const seenSeries = new Set<string>();
    const unique: LabelledMatch<T>[] = [];
    for (const m of ranked) {
        const keys = [dailySeriesKey(m.item.title), leadWordsKey(m.item.title)].filter((k): k is string => k !== null);
        if (keys.some((k) => seenSeries.has(k))) continue;
        keys.forEach((k) => seenSeries.add(k));
        unique.push(m);
    }

    // Różnorodność: trzeci i dalszy news z tego samego podtematu idzie za pozostałymi. Bez tego trzy
    // komunikaty o inflacji wypychały z karty /ceny ceny paliw, o które właściciel prosił wprost.
    const perLabel = new Map<string, number>();
    const first: LabelledMatch<T>[] = [];
    const later: LabelledMatch<T>[] = [];
    for (const m of unique) {
        const n = perLabel.get(m.label) ?? 0;
        perLabel.set(m.label, n + 1);
        (n < MAX_PER_LABEL_FIRST ? first : later).push(m);
    }
    const out = [...first, ...later].slice(0, limit);
    return out;
}

/**
 * Newsy dotyczące tematu (same pozycje, bez podtematu) — patrz `matchNewsLabelled`.
 * Opcje `matchTier` / `excludeOpinion` zawężają wynik na warstwie wyświetlania —
 * nie zmieniają słowników w `TOPIC_RULES`.
 */
export function matchNews<T extends MatchableNews>(
    items: T[],
    topic: NewsTopic,
    limit = 5,
    opts: MatchNewsOptions = {},
): T[] {
    return matchNewsLabelled(items, topic, limit, opts).map((m) => m.item);
}
