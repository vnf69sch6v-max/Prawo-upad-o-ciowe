// Lista feedów RSS — WYŁĄCZNIE źródła zweryfikowane realnym żądaniem (curl) 2026-07-16.
// Zasada projektu: żadnych mocków i niesprawdzonych adresów. Każdy wpis poniżej zwrócił
// HTTP 200 + poprawny XML z niepustą listą <item> i świeżymi datami (tego samego dnia).
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

/**
 * Grupa właścicielska. KLUCZOWE dla rankingu: „ten sam temat w dwóch serwisach" jest sygnałem
 * ważności tylko wtedy, gdy serwisy są NIEZALEŻNE. Bankier.pl i Puls Biznesu należą do tej samej
 * spółki (Bonnier Business Polska — Bonnier przejął grupę Bankier.pl w 2015), więc liczone osobno
 * zawyżałyby ważność tematu. Klaster liczymy po właścicielach — patrz `lib/news/cluster.ts`.
 */
export type NewsOwner = 'bonnier' | 'wp' | 'rasp' | 'polsat' | 'ptwp';

export const OWNER_NAMES: Record<NewsOwner, string> = {
    bonnier: 'Bonnier Business Polska',
    wp: 'Wirtualna Polska Media',
    rasp: 'Ringier Axel Springer Polska',
    polsat: 'Grupa Polsat Plus',
    ptwp: 'PTWP',
};

export interface NewsSource {
    /** Stabilny identyfikator używany w filtrach UI i w kluczu cache. */
    id: string;
    /** Nazwa redakcji pokazywana użytkownikowi. */
    name: string;
    /** Grupa właścicielska — niezależność źródeł liczymy po niej, nie po domenie. */
    owner: NewsOwner;
    url: string;
    /** Sekcja tematyczna feedu — pomaga późniejszemu dopasowaniu newsów do wskaźników. */
    section: 'ogolne' | 'gielda' | 'waluty' | 'przemysl';
    /**
     * Feed podaje czas ścienny Europe/Warsaw, ale strefy albo NIE deklaruje, albo deklaruje BŁĘDNIE.
     * Wtedy zadeklarowaną strefę ignorujemy i liczymy offset Warszawy sami (patrz parse.ts).
     */
    warsawWallClock?: boolean;
    /** Limit pozycji z tego feedu — chroni miks przed zdominowaniem przez jedno źródło. */
    limit: number;
}

// UWAGA — Bankier deklaruje BŁĘDNĄ strefę czasową (zweryfikowane 2026-07-16, nie zmieniać bez dowodu):
//   • pubDate podpisuje stałym "+0100" przez cały rok, mimo że latem w Polsce obowiązuje CEST (+0200);
//   • <lastBuildDate> to "21:22:46 GMT" w momencie, gdy realny UTC wynosił 19:23 — czyli jest to
//     warszawski czas ścienny (21:23 CEST) etykietowany jako GMT.
// Dowód wprost: przy dosłownym "+0100" najnowszy artykuł wypadał ~5 min W PRZYSZŁOŚCI (niemożliwe),
// a przy interpretacji warszawskiej — 55 min temu. Honorowanie deklaracji przesuwałoby newsy Bankiera
// o +1h i sztucznie wypychało je na górę scalonej listy. Stąd warsawWallClock.
// Money.pl (+0200), Business Insider i Interia (GMT) deklarują strefę POPRAWNIE → bez flagi.
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
];

/**
 * Waga redakcyjna źródła (mnożnik siły „głosu" w klastrze).
 *
 * ⚠️ To jest NASZA OCENA REDAKCYJNA, nie obiektywny rating — i tak trzeba ją opisywać w UI.
 * Sprawdzone (2026-07-16): dla polskich mediów finansowych NIE ISTNIEJE żadna publiczna ocena
 * wiarygodności — NewsGuard nie pokrywa Polski, Media Bias/Fact Check nie ma Bankiera ani
 * Money.pl, Reuters Digital News Report nie wymienia żadnego z naszych źródeł.
 * (Badanie OBI „najważniejsze źródło dla inwestorów" to ankieta popularności, nie rzetelności,
 * i kolportuje ją właściciel dwóch z tych tytułów — nie używać jako proxy wiarygodności.)
 *
 * Niższe wagi dla WP i RASP nie dotyczą rzetelności newsów: UOKiK postawił obu grupom zarzuty
 * dotyczące oznaczania artykułów sponsorowanych, więc spodziewamy się u nich większej domieszki
 * treści komercyjnej w feedzie.
 */
export const OWNER_WEIGHT: Record<NewsOwner, number> = {
    ptwp: 1.2,      // wnp.pl — branżowe, rzeczowe tytuły, znikomy clickbait
    bonnier: 1.15,  // Bankier + PB — profil stricte finansowy
    polsat: 0.9,    // Interia Biznes — portal ogólny z sekcją biznes
    wp: 0.8,        // Money.pl — zarzuty UOKiK o oznaczanie reklam
    rasp: 0.8,      // Business Insider PL — j.w.
};
