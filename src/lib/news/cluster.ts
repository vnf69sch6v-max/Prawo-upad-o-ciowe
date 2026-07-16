// Grupowanie newsów opisujących TEN SAM temat — podstawa sygnału ważności.
//
// ─── Decyzje projektowe (research 2026-07-16) ───
// • Liczymy po WŁAŚCICIELACH, nie po domenach. Bankier.pl i Puls Biznesu to jedna spółka
//   (Bonnier), więc ten sam temat u obu = JEDEN niezależny głos. Bez tego ważność byłaby
//   systematycznie zawyżona — patrz OWNER_WEIGHT w sources.ts.
// • Bez MinHash/LSH: przy 150 newsach to 11 175 par, czyli milisekundy na brute-force.
//   MinHash to optymalizacja dla milionów dokumentów — dokładałaby przybliżenie bez zysku.
// • Bez stemmera morfologicznego: polski jest fleksyjny, więc tniemy tokeny do 6 znaków
//   („inflacja/inflacji/inflację" → „inflac"). Prymitywne, ale wystarcza i nie ciągnie zależności.
// • Sam Jaccard na tytułach jest za słaby: dwa newsy o inflacji z różnych redakcji mają często
//   J≈0.25. Próg 0.8 z literatury dotyczy near-duplicates (przedruk depeszy), nie „tego samego
//   tematu". Stąd podobieństwo ważone: tokeny + encje + LICZBY — w makro „CPI 4,9%" rozróżnia
//   temat znacznie lepiej niż samo słowo „inflacja".

import { norm } from './match';
import { OWNER_WEIGHT, type NewsOwner } from './sources';
import type { NewsItem } from './types';

/** Częste słowa, które nic nie wnoszą do rozróżniania tematów. */
const STOP = new Set([
    'the', 'and', 'dla', 'jest', 'sie', 'nie', 'oraz', 'ale', 'czy', 'jak', 'kto', 'gdzie', 'kiedy',
    'tego', 'tej', 'ten', 'ta', 'to', 'te', 'ci', 'co', 'juz', 'tez', 'byl', 'byla', 'bylo', 'beda',
    'jego', 'jej', 'ich', 'nasz', 'wasz', 'przez', 'przed', 'pod', 'nad', 'przy', 'bez', 'wedlug',
    'roku', 'rok', 'proc', 'mln', 'mld', 'zl', 'polsce', 'polski', 'polska', 'polskiej',
    // Częste w nagłówkach, a nic nie mówią o temacie — bez nich „dobra wiadomość" łączyło newsy
    // niezwiązane tematycznie.
    'dobra', 'dobre', 'dobry', 'jeden', 'dwa', 'nowy', 'nowa', 'nowe',
]);

/**
 * Długość rdzenia. 4 znaki, a nie 6 — polski odmienia także rdzeń bliżej początku
 * („dobra"/„dobre" rozjeżdżają się dopiero na 5. znaku). Dobrane empirycznie: przy 6 trzy newsy
 * o tych samych danych inflacyjnych z trzech redakcji NIE łączyły się w klaster.
 */
const STEM_LEN = 4;

function tokens(text: string): Set<string> {
    const out = new Set<string>();
    for (const w of norm(text).split(/[^a-z0-9%]+/)) {
        if (w.length <= 2 || STOP.has(w)) continue;
        out.add(w.slice(0, STEM_LEN));
    }
    return out;
}

/** Encje: słowa pisane wielką literą wewnątrz tytułu + skrótowce (nazwy własne, spółki, instytucje). */
function entities(title: string): Set<string> {
    const out = new Set<string>();
    for (const m of title.match(/\b[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż-]{2,}\b/g) ?? []) {
        const n = norm(m);
        if (!STOP.has(n)) out.add(n.slice(0, STEM_LEN));
    }
    return out;
}

/** Liczby z jednostką — bardzo dyskryminujące w makro („4,9%", „1,5 mld"). */
function numbers(text: string): Set<string> {
    const out = new Set<string>();
    for (const m of text.match(/\d+[,.]?\d*\s*(?:%|proc\.|mld|mln|pkt)/gi) ?? []) {
        out.add(m.replace(/\s+/g, '').toLowerCase());
    }
    return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter);
}

/**
 * Próg łączenia — druga z dwóch liczb, które się tu stroi (obok półokresu w score.ts).
 *
 * Dobrany empirycznie na 150 żywych newsach (2026-07-16). Przy 0.25 powstały 4 klastry
 * wielo-właścicielskie i WSZYSTKIE były trafne (Rafako/PGZ, wynagrodzenia lekarzy, dane
 * inflacyjne NBP, wypowiedź członka RPP o stopach); największy klaster miał 4 pozycje,
 * więc bez łańcuchowania. Zaostrzanie do 0.38 gubiło połowę z nich.
 *
 * Przy zmianie: sprawdź największy klaster. Jeśli urośnie powyżej ~15 pozycji, to znak
 * łańcuchowania single-linkage (A~B, B~C ⇒ A~C) — wtedy podnieś próg.
 */
export const SIM_THRESHOLD = 0.25;
const MAX_GAP_MS = 24 * 3600 * 1000;

interface Feat { tok: Set<string>; ent: Set<string>; num: Set<string>; ts: number }

function similarity(a: Feat, b: Feat): number {
    return 0.5 * jaccard(a.tok, b.tok) + 0.3 * jaccard(a.ent, b.ent) + 0.2 * jaccard(a.num, b.num);
}

export interface Cluster {
    /** Indeksy pozycji należących do tematu. */
    members: number[];
    /** Niezależni właściciele opisujący temat (Bankier+PB liczą się raz). */
    owners: NewsOwner[];
    /** Suma wag właścicieli — „siła głosu" tematu. */
    weight: number;
    /** Indeks najstarszej pozycji — proxy „kto zgłosił temat pierwszy". */
    firstIndex: number;
}

/**
 * Single-linkage przez union-find, O(n²).
 *
 * Ryzyko single-linkage: łańcuchowanie (A~B, B~C ⇒ A~C, choć A i C są niepodobne). Przy 150
 * newsach objawia się jednym gigantycznym klastrem „makro" — jeśli to wystąpi, podnieść próg.
 * Ograniczenie czasowe (24h) dodatkowo tnie łańcuchy między niezwiązanymi falami newsów.
 */
export function clusterNews(items: (NewsItem & { owner: NewsOwner })[]): Cluster[] {
    const n = items.length;
    const feats: Feat[] = items.map((it) => ({
        tok: tokens(`${it.title} ${it.description}`),
        ent: entities(it.title),
        num: numbers(`${it.title} ${it.description}`),
        ts: new Date(it.publishedAt).getTime(),
    }));

    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a: number, b: number) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(feats[i].ts - feats[j].ts) > MAX_GAP_MS) continue;
            if (similarity(feats[i], feats[j]) >= SIM_THRESHOLD) union(i, j);
        }
    }

    const groups = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
        const r = find(i);
        const g = groups.get(r);
        if (g) g.push(i); else groups.set(r, [i]);
    }

    return [...groups.values()].map((members) => {
        // Unikalni właściciele — tu odbywa się cała robota z niezależnością źródeł.
        const owners = [...new Set(members.map((i) => items[i].owner))];
        const weight = owners.reduce((sum, o) => sum + (OWNER_WEIGHT[o] ?? 1), 0);
        const firstIndex = members.reduce((best, i) => (feats[i].ts < feats[best].ts ? i : best), members[0]);
        return { members, owners, weight, firstIndex };
    });
}
