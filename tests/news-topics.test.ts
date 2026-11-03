import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dailySeriesKey, matchesTopic, matchNews, matchNewsLabelled, type NewsTopic } from '@/lib/news/match';
import { newsTopics } from '@/lib/news/topic-links';

// Prawdziwe paczki /api/news z ręcznymi etykietami (spec docs/specs/2026-11-03-newsy-przy-wskaznikach.md).
// `expected` = musi pasować, `ok` = dopuszczalne, brak tematu = zakazane. Nowe chybienie z produkcji →
// dopisz pozycję do fixture (albo nowy plik news-topics-RRRR-MM-DD.json) z etykietą, potem popraw reguły.
interface Labelled {
    title: string;
    description: string;
    lang: 'pl' | 'en';
    importance?: number;
    clusterId?: number;
    isOpinion?: boolean;
    expected: NewsTopic[];
    ok: NewsTopic[];
}

const DIR = join(__dirname, 'fixtures');
type Raw = Omit<Labelled, 'importance' | 'clusterId'> & { importance?: number | null; clusterId?: number | null };
const items: Labelled[] = readdirSync(DIR)
    .filter((f) => /^news-topics-.*\.json$/.test(f))
    .flatMap((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')).items as Raw[])
    .map((it) => ({ ...it, importance: it.importance ?? undefined, clusterId: it.clusterId ?? undefined }));
const pl = items.filter((it) => it.lang === 'pl');
const TOPICS: NewsTopic[] = ['ceny', 'rynki', 'praca', 'gospodarka'];
const byTitle = (start: string) => {
    const it = items.find((x) => x.title.startsWith(start));
    if (!it) throw new Error(`brak w fixture: ${start}`);
    return it;
};

describe('dopasowanie newsów do tematów — fixture z prawdziwego feedu', () => {
    for (const topic of TOPICS) {
        it(`${topic}: precyzja ≥95% i recall ≥90%`, () => {
            const hits = pl.filter((it) => matchesTopic(it, topic));
            const wrong = hits.filter((it) => !it.expected.includes(topic) && !it.ok.includes(topic));
            const expected = pl.filter((it) => it.expected.includes(topic));
            const missed = expected.filter((it) => !matchesTopic(it, topic));
            expect(wrong.map((w) => w.title), 'fałszywe trafienia').toEqual([]);
            expect((hits.length - wrong.length) / hits.length).toBeGreaterThanOrEqual(0.95);
            expect(missed.map((m) => m.title), 'chybione').toEqual([]);
            expect((expected.length - missed.length) / expected.length).toBeGreaterThanOrEqual(0.9);
        });
    }

    it('lista kontrolna: 0 fałszywych dopasowań', () => {
        const never: [NewsTopic, string][] = [
            ['ceny', 'Rodziny mogą stracić na zmianach w 800 plus'],
            ['ceny', 'Kiepas, Tickmill: Pomimo globalnych napięć'],
            ['rynki', 'Firmy znów ruszyły po kredyty'],
            ['rynki', 'Wybory połówkowe w USA'],
            ['rynki', 'Wybory midterms w USA'],
            ['praca', 'Droższe paliwo zmienia plany Ryanaira'],
            ['praca', 'Transport drogowy w Polsce'],
            ['praca', 'Kiepas, Tickmill: Ceny ropy'],
            ['praca', 'Były prezes JSW ma nową pracę'],
            ['gospodarka', 'Polska spółka z branży stalowej'],
            ['gospodarka', 'Trzy razy więcej zakupów w sześć lat'],
        ];
        for (const [topic, title] of never) expect(matchesTopic(byTitle(title), topic), `${topic}: ${title}`).toBe(false);
    });

    it('lista kontrolna: trafienia', () => {
        const must: [NewsTopic, string][] = [
            ['ceny', 'Nowe ceny paliw na wtorek'],
            ['ceny', 'Zmiana na stacjach od wtorku'],
            ['ceny', 'Czekają nas potężne rachunki za gaz'],
            ['ceny', 'Kto płaci najwięcej za prąd'],
            ['ceny', 'Polska w czołówce UE pod względem kosztów prądu'],
            ['ceny', 'Szybki szacunek wskaźnika cen'],
            ['praca', 'Darmowe nadgodziny nadal są problemem'],
            ['praca', 'Pracujący w gospodarce narodowej'],
            ['praca', 'Norwegia szuka rąk do pracy'],
            ['gospodarka', 'Obwieszczenie w sprawie szacunków wartości produktu krajowego'],
            ['rynki', 'Rynki nie spanikowały'],
        ];
        for (const [topic, title] of must) expect(matchesTopic(byTitle(title), topic), `${topic}: ${title}`).toBe(true);
    });

    it('serie dzienne zwinięte do jednej pozycji', () => {
        const rynki = matchNews(items, 'rynki', 5);
        expect(rynki.filter((it) => dailySeriesKey(it.title) === 'kurs-walut-dnia')).toHaveLength(1);
        const ceny = matchNews(items, 'ceny', 5);
        expect(ceny.filter((it) => dailySeriesKey(it.title) === 'ceny-paliw-dnia').length).toBeLessThanOrEqual(1);
        const praca = matchNews(items, 'praca', 10);
        expect(praca.filter((it) => it.title.startsWith('Darmowe nadgodziny'))).toHaveLength(1);
        expect(ceny.filter((it) => /nowe ceny paliw/i.test(it.title))).toHaveLength(1);
        expect(dailySeriesKey('Ile kosztuje dolar? Kurs dolara do złotego PLN/USD 03.11.2026')).toBe('kurs-walut-dnia');
    });

    it('ranking: tytuł przed opisem; każda pozycja ma podtemat; tylko PL', () => {
        for (const topic of TOPICS) {
            const out = matchNewsLabelled(items, topic, 50);
            for (const m of out) {
                expect(m.label.length).toBeGreaterThan(0);
                expect(m.item.lang).toBe('pl');
            }
        }
        // /ceny: rdzeń (inflacja) na górze, ale paliwa i energia mieszczą się w pięciu.
        const ceny = matchNewsLabelled(items, 'ceny', 5);
        expect(ceny[0].label).toBe('Inflacja');
        expect(ceny.map((m) => m.label)).toEqual(expect.arrayContaining(['Inflacja', 'Energia', 'Paliwa']));
        expect(ceny.filter((m) => m.label === 'Inflacja').length).toBeLessThanOrEqual(2);
        // Tytuł przed opisem: „Warszawa nie zawsze płaci najlepiej” (tylko opis) stoi za tytułowymi „Płace”.
        const place = matchNewsLabelled(items, 'praca', 50).filter((m) => m.label === 'Płace');
        expect(place.at(-1)?.score).toBe(1);
        expect(matchNewsLabelled([{ title: 'US CPI rises 0.3%', description: '', lang: 'en' }], 'ceny')).toEqual([]);
    });

    it('podtematy: paliwa, energia, inflacja, stopy, złoty', () => {
        const label = (topic: NewsTopic, t: string) =>
            matchNewsLabelled([byTitle(t)], topic, 1)[0]?.label;
        expect(label('ceny', 'Nowe ceny paliw na wtorek')).toBe('Paliwa');
        expect(label('ceny', 'Czekają nas potężne rachunki za gaz')).toBe('Energia');
        expect(label('ceny', 'Szybki szacunek wskaźnika cen')).toBe('Inflacja');
        expect(label('rynki', 'Stopy procentowe bez zmian')).toBe('Stopy');
        expect(label('rynki', 'Rogalski, DM BOŚ: Euro-złoty')).toBe('Złoty');
        expect(label('rynki', 'Indeks WIG20 spadł')).toBe('GPW');
    });

    it('chipy Przeglądu = tematy kart', () => {
        for (const it of items) {
            const chips = newsTopics(it).map((t) => t.topic).sort();
            const cards = it.lang === 'pl' ? TOPICS.filter((t) => matchesTopic(it, t)).sort() : [];
            expect(chips).toEqual(cards);
        }
    });
});
