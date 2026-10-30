import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRss } from '@/lib/news/parse';
import { NEWS_SOURCES, OWNER_WEIGHT, passesSourceFilter } from '@/lib/news/sources';
import { capForeign, MAX_FOREIGN_ITEMS } from '@/lib/news/feed';
import { foreignLabel, isPolishNews } from '@/lib/news/lang';

const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures', 'news', name), 'utf8');
const src = (id: string) => NEWS_SOURCES.find((s) => s.id === id)!;

describe('parser RSS — kanały zagraniczne', () => {
    it('Fed: pubDate w CDATA → ISO UTC', () => {
        const items = parseRss(fixture('fed-press.xml'));
        expect(items).toHaveLength(2);
        expect(items[0].publishedAt).toBe('2026-10-28T18:00:00.000Z');
        expect(items[0].link).toBe('https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm');
    });

    it('RDF bez dat (Nikkei Asia) → zero pozycji, nie zgadujemy daty', () => {
        expect(parseRss(fixture('nikkei-rdf.xml'))).toEqual([]);
    });

    it('lead jest przycięty do 400 znaków — nigdy pełna treść', () => {
        const long = 'x'.repeat(5000);
        const xml = `<rss><channel><item><title>T</title><link>https://a.pl/1</link><pubDate>Fri, 30 Oct 2026 10:00:00 GMT</pubDate><description>${long}</description></item></channel></rss>`;
        expect(parseRss(xml)[0].description.length).toBe(400);
    });
});

describe('filtry źródeł', () => {
    it('Fed: zgody na fuzje odfiltrowane, FOMC zostaje', () => {
        const titles = parseRss(fixture('fed-press.xml')).map((i) => i.title).filter((t) => passesSourceFilter(src('fed'), t));
        expect(titles).toEqual(['Federal Reserve issues FOMC statement']);
    });

    it('BOJ: polityka tak, harmonogramy operacji nie', () => {
        const boj = src('boj');
        expect(passesSourceFilter(boj, 'Statement on Monetary Policy')).toBe(true);
        expect(passesSourceFilter(boj, 'Outlook for Economic Activity and Prices (October 2026)')).toBe(true);
        expect(passesSourceFilter(boj, 'Timetable and Schedule of U.S. Dollar Funds-Supplying Operations')).toBe(false);
        expect(passesSourceFilter(boj, 'Bank of Japan Accounts (October 20)')).toBe(false);
    });

    it('MarketWatch: listy do „Moneyist” odpadają, rynki zostają', () => {
        const mw = src('marketwatch');
        expect(passesSourceFilter(mw, 'My father has Alzheimer’s and his caregiver is using his debit card')).toBe(false);
        expect(passesSourceFilter(mw, '‘He was heartbroken’: My husband’s kids abandoned him')).toBe(false);
        expect(passesSourceFilter(mw, 'Microsoft is winning the cloud wars and becoming Wall Street’s favorite')).toBe(true);
    });

    it('każde źródło: https, unikalne id, limit ≤ 40, waga właściciela, zagraniczne oznaczone', () => {
        const ids = new Set<string>();
        for (const s of NEWS_SOURCES) {
            expect(s.url).toMatch(/^https:\/\//);
            expect(ids.has(s.id)).toBe(false);
            ids.add(s.id);
            expect(s.limit).toBeGreaterThan(0);
            expect(s.limit).toBeLessThanOrEqual(40);
            expect(OWNER_WEIGHT[s.owner]).toBeGreaterThan(0);
            if (s.lang === 'en') expect(s.region).toBeDefined();
            if (s.section === 'swiat' || s.section === 'banki') expect(s.lang).toBe('en');
        }
        // Suma limitów zagranicznych może przekraczać twardy limit — capForeign go pilnuje.
        expect(NEWS_SOURCES.filter((s) => s.lang === 'en').length).toBeGreaterThanOrEqual(6);
    });
});

describe('capForeign — zagraniczne nie zalewają feedu', () => {
    const mk = (n: number, lang: 'pl' | 'en') => Array.from({ length: n }, (_, i) => ({ id: `${lang}${i}`, lang }));

    it('najwyżej MAX_FOREIGN_ITEMS zagranicznych, polskie nie są wypierane', () => {
        const sorted = [...mk(100, 'en'), ...mk(200, 'pl')];
        const out = capForeign(sorted);
        expect(out).toHaveLength(150);
        expect(out.filter((i) => i.lang === 'en')).toHaveLength(MAX_FOREIGN_ITEMS);
        expect(out.filter((i) => i.lang === 'pl')).toHaveLength(150 - MAX_FOREIGN_ITEMS);
    });

    it('pozycje bez lang (stare archiwum) liczą się jako polskie', () => {
        expect(capForeign([{ id: 'a' }, { id: 'b', lang: 'en' }], 10, 0)).toEqual([{ id: 'a' }]);
    });
});

describe('etykiety języka', () => {
    it('EN · region dla zagranicznych, null dla polskich', () => {
        expect(foreignLabel({ lang: 'en', region: 'US' })).toBe('EN · USA');
        expect(foreignLabel({ lang: 'en', region: 'JP' })).toBe('EN · Japonia');
        expect(foreignLabel({})).toBeNull();
        expect(isPolishNews({ lang: 'en' })).toBe(false);
    });
});
