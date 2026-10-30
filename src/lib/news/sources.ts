// Lista feedów RSS — WYŁĄCZNIE źródła zweryfikowane realnym żądaniem (curl).
// Pierwsza weryfikacja: 2026-07-16. Retuning wag + ISBnews/GUS/300G: 2026-08-23.
// Zasada projektu: żadnych mocków i niesprawdzonych adresów. Każdy wpis poniżej zwrócił
// HTTP 200 + poprawny XML z niepustą listą <item> i świeżymi datami.
//
// ŹRÓDŁA ODRZUCONE (sprawdzone i NIE działają — nie przywracać bez ponownej weryfikacji):
//   • Parkiet      — /rss, /feed, /rss/wiadomosci.xml → HTTP 404 (brak publicznego RSS).
//   • Forsal       — /rss.xml, /rss, /atom.xml, /gospodarka.rss → HTTP 404.
//   • PAP Biznes   — biznes.pap.pl/rss.xml → 404; /pl/rss → HTTP 200, ale text/html bez <item>.
//   • Rzeczpospolita — rp.pl/rss/{1017..1021} → HTTP 200, ale KAŻDE id zwraca ten sam ogólny
//     feed redakcyjny (Polityka/Film/Akty prawne/Wojsko). Brak kanału ekonomicznego → dla
//     platformy makro/rynkowej byłby to czysty szum, więc świadomie pominięty.
//   • Bankier Gospodarka — /rss/gospodarka.xml → HTTP 200, ale 0 pozycji (kanał nie istnieje).
//   • Puls Biznesu /rss → zwraca stronę HTML, NIE XML. Działa dopiero /rss/najnowsze.xml.
//   • zero.pl — brak publicznego RSS (/feed, /rss, /rss.xml → 404). Odłożone do czasu pojawienia
//     się kanału; NIE dodawać scrapingu HTML.
//   • NBP — brak feedu treściowego z <item>ami. Endpointy typu /feed, /rss, aktualnosci → 403/HTML;
//     działają tylko tabele kursów (LastA.xml, api.nbp.pl) — to NIE są newsy, nie dodawać.
//     Owner `official` + waga zarejestrowane poniżej pod przyszły content feed.
//   • MF (gov.pl/finanse) — /rss, /rss.xml, atom → HTML bez <item>. Owner `official` gotowy.
//   • GUS Infografiki (rss/pl/5866/45.xml) — działa, ale pozycje stare i nie-newsowe → pominięte.
//   • GUS BDL RSS (bdl.stat.gov.pl/bdl/rss/PL) → HTML, nie XML.
//   (2026-10-30) • Nikkei Asia (asia.nikkei.com/rss/feed/nar) — RDF bez żadnej daty → pominięte.
//   • CNBC (/id/…/device/rss/rss.html) → 403. • IMF News RSS → 403. • NHK cat5 → daty z sierpnia.
//   • WSJ (feeds.a.dj.com) → daty z 2025. • Investing.com news_14 → daty bez strefy (nie Warszawa).
//   • NBP (/feed), PAP (/rss.xml), Obserwator Finansowy, KNF, gov.pl/finanse, tvn24 biznes → HTML/404.

/**
 * Grupa właścicielska. KLUCZOWE dla rankingu: „ten sam temat w dwóch serwisach" jest sygnałem
 * ważności tylko wtedy, gdy serwisy są NIEZALEŻNE. Bankier.pl i Puls Biznesu należą do tej samej
 * spółki (Bonnier Business Polska — Bonnier przejął grupę Bankier.pl w 2015), więc liczone osobno
 * zawyżałyby ważność tematu. Klaster liczymy po właścicielach — patrz `lib/news/cluster.ts`.
 */
export type NewsOwner =
    | 'bonnier' | 'wp' | 'rasp' | 'polsat' | 'ptwp' | 'isbnews' | 'official' | 'g300' | 'strefa' | 'inwestycje'
    // zagraniczne (2026-10-30) — każdy bank centralny i każda redakcja to osobny, niezależny właściciel
    | 'ecb' | 'fed' | 'boj' | 'bbc' | 'dowjones' | 'guardian' | 'nikkei' | 'japantimes';

export const OWNER_NAMES: Record<NewsOwner, string> = {
    bonnier: 'Bonnier Business Polska',
    wp: 'Wirtualna Polska Media',
    rasp: 'Ringier Axel Springer Polska',
    polsat: 'Grupa Polsat Plus',
    ptwp: 'PTWP',
    isbnews: 'ISBnews',
    official: 'Źródła oficjalne (NBP / GUS / MF)',
    g300: '300Gospodarka',
    strefa: 'Strefa Inwestorów',
    inwestycje: 'inwestycje.pl',
    ecb: 'Europejski Bank Centralny',
    fed: 'Rezerwa Federalna (Fed)',
    boj: 'Bank Japonii',
    bbc: 'BBC',
    dowjones: 'Dow Jones (MarketWatch)',
    guardian: 'Guardian Media Group',
    nikkei: 'Nikkei (Financial Times)',
    japantimes: 'The Japan Times',
};

export type NewsSection = 'ogolne' | 'gielda' | 'waluty' | 'przemysl' | 'oficjalne' | 'swiat' | 'banki';

/** Język tytułu i leadu. Zagraniczne kanały są po angielsku — nie tłumaczymy ich. */
export type NewsLang = 'pl' | 'en';
/** Czego dotyczy źródło: Polska, strefa euro, USA, Japonia, Wielka Brytania, świat. */
export type NewsRegion = 'PL' | 'EU' | 'US' | 'JP' | 'GB' | 'GLOBAL';

export interface NewsSource {
    /** Stabilny identyfikator używany w filtrach UI i w kluczu cache. */
    id: string;
    /** Nazwa redakcji pokazywana użytkownikowi. */
    name: string;
    /** Grupa właścicielska — niezależność źródeł liczymy po niej, nie po domenie. */
    owner: NewsOwner;
    url: string;
    /** Sekcja tematyczna feedu — pomaga późniejszemu dopasowaniu newsów do wskaźników. */
    section: NewsSection;
    /**
     * Feed podaje czas ścienny Europe/Warsaw, ale strefy albo NIE deklaruje, albo deklaruje BŁĘDNIE.
     * Wtedy zadeklarowaną strefę ignorujemy i liczymy offset Warszawy sami (patrz parse.ts).
     */
    warsawWallClock?: boolean;
    /** Limit pozycji z tego feedu — chroni miks przed zdominowaniem przez jedno źródło. */
    limit: number;
    /** Domyślnie 'pl' / 'PL'. */
    lang?: NewsLang;
    region?: NewsRegion;
    /** Bierzemy tylko pozycje, których tytuł pasuje (np. BOJ: decyzje, nie harmonogramy operacji). */
    include?: RegExp;
    /** Pomijamy pozycje, których tytuł pasuje (np. Fed: zgody na fuzje banków). */
    exclude?: RegExp;
}

// UWAGA — Bankier deklaruje BŁĘDNĄ strefę czasową (zweryfikowane 2026-07-16, nie zmieniać bez dowodu):
//   • pubDate podpisuje stałym "+0100" przez cały rok, mimo że latem w Polsce obowiązuje CEST (+0200);
//   • <lastBuildDate> to "21:22:46 GMT" w momencie, gdy realny UTC wynosił 19:23 — czyli jest to
//     warszawski czas ścienny (21:23 CEST) etykietowany jako GMT.
// Dowód wprost: przy dosłownym "+0100" najnowszy artykuł wypadał ~5 min W PRZYSZŁOŚCI (niemożliwe),
// a przy interpretacji warszawskiej — 55 min temu. Honorowanie deklaracji przesuwałoby newsy Bankiera
// o +1h i sztucznie wypychało je na górę scalonej listy. Stąd warsawWallClock.
// Money.pl (+0200), Business Insider i Interia (GMT) deklarują strefę POPRAWNIE → bez flagi.
// ISBnews / 300G / GUS: RFC822 z poprawnym offsetem (+0000 / +0200) → bez flagi.
export const NEWS_SOURCES: NewsSource[] = [
    { id: 'bankier', name: 'Bankier.pl', owner: 'bonnier', url: 'https://www.bankier.pl/rss/wiadomosci.xml', section: 'ogolne', warsawWallClock: true, limit: 40 },
    { id: 'bankier-gielda', name: 'Bankier.pl — Giełda', owner: 'bonnier', url: 'https://www.bankier.pl/rss/gielda.xml', section: 'gielda', warsawWallClock: true, limit: 15 },
    { id: 'bankier-waluty', name: 'Bankier.pl — Waluty', owner: 'bonnier', url: 'https://www.bankier.pl/rss/waluty.xml', section: 'waluty', warsawWallClock: true, limit: 15 },
    { id: 'money', name: 'Money.pl', owner: 'wp', url: 'https://www.money.pl/rss/', section: 'ogolne', limit: 25 },
    { id: 'businessinsider', name: 'Business Insider Polska', owner: 'rasp', url: 'https://businessinsider.com.pl/.feed', section: 'ogolne', limit: 25 },
    { id: 'interia', name: 'Interia Biznes', owner: 'polsat', url: 'https://biznes.interia.pl/feed', section: 'ogolne', limit: 30 },
    // pb.pl: <pubDate>2026-07-16 20:53:12</pubDate> — brak strefy, format niestandardowy.
    { id: 'pb', name: 'Puls Biznesu', owner: 'bonnier', url: 'https://www.pb.pl/rss/najnowsze.xml', section: 'ogolne', warsawWallClock: true, limit: 30 },
    // wnp.pl: RFC822 bez offsetu ("Thu, 16 Jul 2026 21:04:00"); feed zwraca ~300 pozycji → mocny limit.
    { id: 'wnp', name: 'wnp.pl', owner: 'ptwp', url: 'https://www.wnp.pl/rss/serwis_rss.xml', section: 'przemysl', warsawWallClock: true, limit: 25 },
    // ISBnews.TV — agencja/wire; curl 2026-08-23: HTTP 200, ~10 <item>, daty świeże (+0000).
    { id: 'isbnews', name: 'ISBnews.TV', owner: 'isbnews', url: 'https://www.isbnews.tv/feed/', section: 'ogolne', limit: 15 },
    // GUS — realne kanały z listy https://stat.gov.pl/rss (curl 2026-08-23).
    { id: 'gus-aktualnosci', name: 'GUS — Aktualności', owner: 'official', url: 'https://stat.gov.pl/rss/pl/5438/8.xml', section: 'oficjalne', limit: 12 },
    { id: 'gus-komunikaty', name: 'GUS — Komunikaty', owner: 'official', url: 'https://stat.gov.pl/rss/pl/5463/11.xml', section: 'oficjalne', limit: 10 },
    // 300Gospodarka — niezależny portal makro; curl 2026-08-23: HTTP 200, ~12 <item>.
    { id: '300gospodarka', name: '300Gospodarka', owner: 'g300', url: 'https://300gospodarka.pl/feed', section: 'ogolne', limit: 15 },
    // ─── Dodane 2026-10-30 (curl: HTTP 200, <item> z datami z tego samego dnia) ───
    // BI Gospodarka: ~20 poz., GMT; częściowo pokrywa się z głównym feedem BI → dedup po URL.
    { id: 'businessinsider-gospodarka', name: 'Business Insider — Gospodarka', owner: 'rasp', url: 'https://businessinsider.com.pl/gospodarka.feed', section: 'ogolne', limit: 12 },
    { id: 'strefainwestorow', name: 'Strefa Inwestorów', owner: 'strefa', url: 'https://strefainwestorow.pl/rss.xml', section: 'gielda', limit: 10 },
    { id: 'inwestycje', name: 'inwestycje.pl', owner: 'inwestycje', url: 'https://inwestycje.pl/feed/', section: 'gielda', limit: 8 },
    // Banki centralne — komunikaty prasowe. EBC: ~15 poz. (+0100/+0200). Fed: pubDate w CDATA, GMT.
    { id: 'ecb', name: 'EBC — komunikaty', owner: 'ecb', url: 'https://www.ecb.europa.eu/rss/press.html', section: 'banki', limit: 8, lang: 'en', region: 'EU' },
    {
        id: 'fed', name: 'Fed — komunikaty', owner: 'fed', url: 'https://www.federalreserve.gov/feeds/press_all.xml', section: 'banki', limit: 8, lang: 'en', region: 'US',
        // Nadzór nad pojedynczymi bankami (zgody na przejęcia, kary) — szum dla makro.
        exclude: /\b(?:application|enforcement|termination|civil money penalty|approval of)\b/i,
    },
    {
        id: 'boj', name: 'Bank Japonii', owner: 'boj', url: 'https://www.boj.or.jp/en/rss/whatsnew.xml', section: 'banki', limit: 6, lang: 'en', region: 'JP',
        // whatsnew to ~50 pozycji dziennie, głównie harmonogramy operacji i tabele — bierzemy tylko politykę.
        include: /monetary policy|outlook for economic|tankan|financial system report|summary of opinions|minutes of/i,
    },
    // Media zagraniczne — tylko tytuł + lead + link (jak wszędzie).
    { id: 'bbc-business', name: 'BBC Business', owner: 'bbc', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', section: 'swiat', limit: 10, lang: 'en', region: 'GB' },
    {
        id: 'marketwatch', name: 'MarketWatch', owner: 'dowjones', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', section: 'swiat', limit: 8, lang: 'en', region: 'US',
        // Top stories miesza rynki z poradnikiem „Moneyist” (listy czytelników: „My husband’s kids…”) — szum.
        exclude: /^[‘'"]|\b(?:my|our) (?:husband|wife|father|mother|son|daughter|sister|brother|parents|kids|family)\b|\bI[’']m\b|\bshould I\b/i,
    },
    { id: 'guardian-economics', name: 'The Guardian — Economics', owner: 'guardian', url: 'https://www.theguardian.com/business/economics/rss', section: 'swiat', limit: 8, lang: 'en', region: 'GB' },
    { id: 'ft-economy', name: 'Financial Times — Global Economy', owner: 'nikkei', url: 'https://www.ft.com/global-economy?format=rss', section: 'swiat', limit: 8, lang: 'en', region: 'GLOBAL' },
    { id: 'japantimes-business', name: 'The Japan Times — Business', owner: 'japantimes', url: 'https://www.japantimes.co.jp/business/feed/', section: 'swiat', limit: 8, lang: 'en', region: 'JP' },
];

/** Tytuł przechodzi filtry źródła (`include` / `exclude`). */
export function passesSourceFilter(src: Pick<NewsSource, 'include' | 'exclude'>, title: string): boolean {
    if (src.include && !src.include.test(title)) return false;
    if (src.exclude && src.exclude.test(title)) return false;
    return true;
}

/**
 * Waga redakcyjna źródła (mnożnik siły „głosu" w klastrze).
 *
 * ⚠️ To jest NASZA OCENA REDAKCYJNA, nie obiektywny rating — i tak trzeba ją opisywać w UI.
 * Sprawdzone (2026-07-16): dla polskich mediów finansowych NIE ISTNIEJE żadna publiczna ocena
 * WIARYGODNOŚCI — NewsGuard nie pokrywa Polski, Media Bias/Fact Check nie ma Bankiera ani Money.pl,
 * a Reuters Digital News Report nie OCENIA wiarygodności żadnego z naszych źródeł (wymienia rynek
 * i właścicieli, m.in. PTWP — właściciela wnp.pl — ale to nie jest rating rzetelności).
 * (Badanie OBI „najważniejsze źródło dla inwestorów" to ankieta popularności, nie rzetelności,
 * i kolportuje ją właściciel dwóch z tych tytułów — nie używać jako proxy wiarygodności.)
 *
 * Mapa własności zweryfikowana 2026-07-16 / retune 2026-08-23. Gdyby dodać kolejne źródło:
 * Rzeczpospolita i parkiet.com należą do Gremi Media, przejętego przez PTWP (XII 2025)
 * → mapować na `owner: 'ptwp'`, nie osobno.
 *
 * Tiers (półokres świeżości w score.ts):
 *   A official 36h · B isbnews 18h · C specialty (ptwp) 12h · D portale 10h.
 */
export const OWNER_WEIGHT: Record<NewsOwner, number> = {
    official: 1.35, // NBP/GUS/MF — źródło pierwotne danych (gdy feed treściowy istnieje)
    isbnews: 1.25,  // agencja / wire
    ptwp: 1.15,     // wnp.pl — branżowe, rzeczowe tytuły
    bonnier: 1.15,  // Bankier + PB — profil stricte finansowy
    wp: 1.10,       // Money.pl
    polsat: 1.05,   // Interia Biznes
    rasp: 1.00,     // Business Insider PL
    g300: 1.00,     // 300Gospodarka — portal makro, Tier D
    strefa: 0.95,
    inwestycje: 0.90,
    // Zagraniczne: banki centralne to źródło pierwotne; media obce ważą mniej — serwis jest o Polsce.
    ecb: 1.20,
    fed: 1.20,
    boj: 1.15,
    bbc: 0.85,
    dowjones: 0.80,
    guardian: 0.80,
    nikkei: 0.90, // FT należy do Nikkei
    japantimes: 0.80,
};
