// Dopasowanie newsów do tematów dashboardu — news postawiony przy wskaźniku, którego dotyczy.
// Świadomie stawiamy na PRECYZJĘ, nie zasięg: lepiej pokazać 3 trafne newsy niż 10 z przypadkowymi.
//
// ─── Dlaczego to wygląda tak, a nie prościej (wnioski z audytu na żywym /api/news) ───
//
// 1. Tytuł mówi, o czym artykuł JEST; opis często tylko coś WSPOMINA. Dopasowanie tego samego
//    słowa w opisie daje śmieci — realne przykłady:
//      • „Szpitalny parking…" — w opisie cytat „oddałem niemal połowę pensji" → to nie jest news o płacach;
//      • „Eko-Okna ze stratą…" — w opisie „restrukturyzował zadłużenie i zatrudnienie" → to news o wynikach.
//    Stąd DWA poziomy pewności: `strong` (dopasowujemy też w opisie) i `titleOnly` (tylko w tytule).
//    Samo dopasowanie po tytule odpadło — Gospodarka schodziła wtedy do 0 trafień na 150 newsów.
//
// 2. Dwa tryby granicy słowa, bo polski wymusza jedno i drugie:
//      • prefiks — odmiana przez końcówki (inflacja/inflacji/inflacyjny) → granica OD LEWEJ;
//      • całe słowo — gdy końcówka zmienia znaczenie → granica z OBU stron. Bez tego prefiks
//        „zloty" łapie „setki milionów złotych" (kwota, nie waluta), a „wig" łapie „wigilię".

import type { NewsItem } from './types';

/**
 * Normalizacja: bez diakrytyków i wielkości liter.
 * NFD rozkłada ą/ć/ę/ń/ó/ś/ź/ż na literę + znak łączący (U+0300–U+036F), ale „ł" (U+0142)
 * NIE ma rozkładu → podmieniamy ręcznie, inaczej „zloty" nie znajdzie „złoty".
 */
export const norm = (s: string): string =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0142/gi, 'l').toLowerCase();

export type NewsTopic = 'ceny' | 'gospodarka' | 'praca' | 'rynki';

interface Group {
    /** Dopasowanie od początku słowa — łapie całą rodzinę odmian. */
    prefixes?: string[];
    /** Dopasowanie całego słowa — gdy prefiks łapałby co innego. */
    words?: string[];
}

interface TopicPatterns {
    /** Jednoznaczne — sprawdzane w tytule ORAZ w opisie. */
    strong: Group;
    /** Wieloznaczne lub podatne na wzmianki mimochodem — sprawdzane WYŁĄCZNIE w tytule. */
    titleOnly: Group;
}

/**
 * Wzorce per temat — wpisywane BEZ diakrytyków (porównanie leci na tekście po `norm()`).
 * Każdy wzorzec przeszedł audyt na żywych danych. Przenosząc coś z `titleOnly` do `strong`,
 * sprawdź najpierw, czy nie wraca fałszywe trafienie opisane w komentarzu.
 */
const TOPIC_PATTERNS: Record<NewsTopic, TopicPatterns> = {
    ceny: {
        strong: {
            prefixes: [
                'inflacj', 'deflacj', 'dezinflacj', 'hicp',
                'drozyzn', 'podwyzk cen', 'wzrost cen', 'spadek cen', 'ceny zywnosci',
                'koszyk zakupow', 'sila nabywcz', 'ceny producent', 'wskaznik cen',
            ],
            words: ['cpi', 'ppi'],
        },
        // „drożeje" bywa użyte o czymkolwiek („drożeją bilety") — w tytule to teza, w opisie dygresja.
        titleOnly: { prefixes: ['drozej', 'tanie'] },
    },
    gospodarka: {
        strong: {
            prefixes: [
                'produkt krajowy', 'wzrost gospodarcz', 'recesj', 'spowolnienie gospodarcz',
                'sytuacja gospodarcz', 'kondycja gospodark', 'koniunktur',
                'produkcja przemyslow', 'sprzedaz detaliczn',
                'dlug publiczn', 'deficyt budzetow', 'budzet panstw', 'finanse publiczn',
            ],
            words: ['pkb', 'pmi'],
        },
        titleOnly: { prefixes: ['ministerstwo finansow', 'akcyz', 'podatk'] },
    },
    praca: {
        strong: {
            prefixes: [
                'bezroboc', 'bezrobotn', 'rynek pracy', 'rynku pracy',
                'wynagrodz', 'placa minimaln', 'plac minimaln', 'podwyzk plac',
                'zwolnienia grupow', 'zwolnien grupowych', 'wakat', 'sila robocz',
            ],
        },
        // „zatrudnienie" i „pensji" w OPISIE to zwykle wzmianka mimochodem (patrz Eko-Okna, szpitalny
        // parking) — w tytule są tezą artykułu. „pensj" musi być całym słowem: prefiks łapie
        // „pensjonariusza".
        titleOnly: {
            prefixes: ['zatrudni', 'zwolnien', 'strajk'],
            words: ['pensja', 'pensje', 'pensji', 'pensjach', 'etat', 'etaty', 'etatow'],
        },
    },
    rynki: {
        strong: {
            prefixes: [
                // Stopy — WYŁĄCZNIE w kontekście polityki pieniężnej. Samo „stopa" łapie
                // „stopę bezrobocia", czyli temat Praca.
                'stopy procentow', 'stop procentowych', 'stopa referencyjn', 'stopa procentow',
                'ciecia stop', 'obnizk stop', 'podwyzk stop',
                'rada polityki pienieznej', 'polityka pieniezn', 'glapinsk',
                'kurs euro', 'kurs dolar', 'kurs franka', 'kurs funta', 'kurs zlotego',
                'notowania zlotego', 'oslabienie zlotego', 'umocnienie zlotego',
            ],
            words: ['rpp', 'nbp', 'wibor', 'wig20', 'mwig40', 'swig80', 'eurpln', 'usdpln'],
        },
        // „giełda"/„obligacje"/„złoty" w opisie łapały newsy o czymkolwiek, co wspomina rynek
        // (np. „Mundial 2026: ukryta okazja inwestycyjna") → tylko tytuł.
        titleOnly: {
            prefixes: ['gield', 'obligacj', 'akcje spolki', 'indeks'],
            words: ['gpw', 'wig', 'zloty', 'zlotego', 'zlotowka', 'zlotowki'],
        },
    },
};

const esc = (p: string) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Buduje regex dla grupy. `\p{L}` zamiast `\b`, bo `\b` nie rozumie liter spoza ASCII.
 *  • prefiksy:   `(?<!\p{L})(?:…)`
 *  • całe słowa: `(?<!\p{L})(?:…)(?!\p{L})`
 */
function groupRegexes(...groups: Group[]): RegExp[] {
    const prefixes = groups.flatMap((g) => g.prefixes ?? []);
    const words = groups.flatMap((g) => g.words ?? []);
    const res: RegExp[] = [];
    if (prefixes.length) res.push(new RegExp(`(?<!\\p{L})(?:${prefixes.map(esc).join('|')})`, 'u'));
    if (words.length) res.push(new RegExp(`(?<!\\p{L})(?:${words.map(esc).join('|')})(?!\\p{L})`, 'u'));
    return res;
}

/** Cache skompilowanych regexów — `matchNews` bywa wołane przy każdym renderze sekcji. */
const CACHE = new Map<NewsTopic, { title: RegExp[]; desc: RegExp[] }>();

function compiled(topic: NewsTopic) {
    const hit = CACHE.get(topic);
    if (hit) return hit;
    const { strong, titleOnly } = TOPIC_PATTERNS[topic];
    const built = {
        title: groupRegexes(strong, titleOnly), // w tytule ufamy wszystkiemu
        desc: groupRegexes(strong),             // w opisie tylko jednoznacznym frazom
    };
    CACHE.set(topic, built);
    return built;
}

/** Czy news dotyczy tematu? Tytuł — pełny słownik; opis — tylko frazy jednoznaczne. */
export function matchesTopic(item: Pick<NewsItem, 'title' | 'description'>, topic: NewsTopic): boolean {
    const { title, desc } = compiled(topic);
    const t = norm(item.title);
    if (title.some((re) => re.test(t))) return true;
    if (!item.description) return false;
    const d = norm(item.description);
    return desc.some((re) => re.test(d));
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

/**
 * Newsy dotyczące tematu, uszeregowane wg ważności (`importance` liczone w /api/news),
 * po jednej pozycji na temat.
 * Fallback na kolejność wejściową, gdy rankingu nie ma — API oddaje pozycje od najnowszych.
 */
export function matchNews<T extends Pick<NewsItem, 'title' | 'description' | 'importance' | 'clusterId'>>(
    items: T[],
    topic: NewsTopic,
    limit = 5,
): T[] {
    const hits = collapseClusters(items.filter((it) => matchesTopic(it, topic)));
    hits.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
    return hits.slice(0, limit);
}
