// Minimalny parser RSS 2.0 na regexach — zgodnie z konwencją projektu (patrz api/wibor, api/nbp),
// bez dokładania zależności. Obsługuje warianty formatów wykryte podczas realnej weryfikacji feedów:
//   • tytuły w CDATA (Bankier, Interia, wnp) oraz jako encje HTML — "&#34;" (Money.pl),
//   • <link> owinięty białymi znakami/newline (Puls Biznesu) → trim,
//   • daty: RFC822 z offsetem, RFC822 BEZ offsetu (wnp) i "YYYY-MM-DD HH:mm:ss" (pb.pl).

const NAMED_ENTITIES: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    oacute: 'ó', Oacute: 'Ó', eacute: 'é', hellip: '…', mdash: '—', ndash: '–',
    laquo: '«', raquo: '»', bdquo: '„', rdquo: '”', ldquo: '“', lsquo: '‘', rsquo: '’',
};

/** Dekoduje encje numeryczne (&#34; &#x27;) i najczęstsze nazwane. */
export function decodeEntities(input: string): string {
    return input
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
        .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

/** Zdejmuje CDATA, tagi HTML z opisów i normalizuje białe znaki. */
function clean(raw: string | null): string {
    if (!raw) return '';
    const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    return decodeEntities(unwrapped.replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
}

/** Wyciąga zawartość pierwszego wystąpienia <tag> w bloku. */
function tag(block: string, name: string): string | null {
    const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
    return m ? m[1] : null;
}

/**
 * Przesunięcie strefy Europe/Warsaw (w minutach) dla danego momentu — liczone przez Intl,
 * więc CET/CEST wychodzi automatycznie, bez hardkodowania dat zmiany czasu.
 */
function warsawOffsetMinutes(utcMs: number): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Warsaw', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(utcMs));
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;
    const asIfUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return (asIfUtc - utcMs) / 60000;
}

/** Zamienia ścianę zegara w Warszawie na znacznik UTC (dwukrotne przybliżenie domyka DST). */
function fromWarsawWallClock(y: number, mo: number, d: number, h: number, mi: number, s: number): number {
    const naive = Date.UTC(y, mo - 1, d, h, mi, s);
    let ts = naive - warsawOffsetMinutes(naive) * 60000;
    ts = naive - warsawOffsetMinutes(ts) * 60000;
    return ts;
}

const MONTHS: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * Parsuje datę z feedu → ISO string, albo null gdy nie da się jej wiarygodnie odczytać.
 *
 * `warsawWallClock` = feed podaje czas ścienny w Polsce, ale albo NIE deklaruje strefy (wnp, pb.pl),
 * albo deklaruje ją BŁĘDNIE (Bankier — patrz sources.ts). Wtedy zadeklarowaną strefę odrzucamy
 * i liczymy offset Europe/Warsaw dla właściwej daty (poprawnie w CET i w CEST).
 */
export function parseFeedDate(raw: string | null, warsawWallClock = false): string | null {
    if (!raw) return null;
    let s = clean(raw);
    if (!s) return null;

    // Odetnij zadeklarowaną strefę ("+0100", "-05:00", "GMT", "UTC", "Z") — nie ufamy jej.
    if (warsawWallClock) {
        s = s.replace(/\s*(?:[+-]\d{2}:?\d{2}|GMT|UTC|Z)\s*$/i, '').trim();
    }

    // "2026-07-16 20:53:12" / "2026-07-16T20:53:12" bez strefy (Puls Biznesu)
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (iso) {
        const ts = fromWarsawWallClock(+iso[1], +iso[2], +iso[3], +iso[4], +iso[5], +(iso[6] ?? 0));
        return new Date(ts).toISOString();
    }

    // RFC822 BEZ offsetu: "Thu, 16 Jul 2026 21:04:00" (wnp.pl)
    const rfcNaive = s.match(/^(?:\w{3},\s*)?(\d{1,2})\s+(\w{3})\w*\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (rfcNaive) {
        const mo = MONTHS[rfcNaive[2].toLowerCase()];
        if (mo) {
            const ts = fromWarsawWallClock(+rfcNaive[3], mo, +rfcNaive[1], +rfcNaive[4], +rfcNaive[5], +(rfcNaive[6] ?? 0));
            return new Date(ts).toISOString();
        }
    }

    // Standardowy RFC822/ISO z offsetem — honorujemy strefę zadeklarowaną przez wydawcę.
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

    return null;
}

export interface ParsedItem {
    title: string;
    link: string;
    publishedAt: string;
    description: string;
}

/** Rozbija XML feedu na pozycje; wpisy bez tytułu, linku lub czytelnej daty są pomijane. */
export function parseRss(xml: string, opts: { warsawWallClock?: boolean } = {}): ParsedItem[] {
    const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
    const items: ParsedItem[] = [];

    for (const block of blocks) {
        const title = clean(tag(block, 'title'));
        // <link> bywa owinięty spacjami/newline (pb.pl) — clean() już trimuje.
        let link = clean(tag(block, 'link'));
        if (!link) {
            const guid = tag(block, 'guid');
            const guidVal = clean(guid);
            if (/^https?:\/\//i.test(guidVal)) link = guidVal;
        }
        const publishedAt = parseFeedDate(tag(block, 'pubDate') ?? tag(block, 'dc:date'), opts.warsawWallClock);

        if (!title || !/^https?:\/\//i.test(link) || !publishedAt) continue;

        items.push({
            title,
            link,
            publishedAt,
            description: clean(tag(block, 'description')).slice(0, 400),
        });
    }

    return items;
}

/**
 * Klucz deduplikacji z URL: bez protokołu, "www.", parametrów śledzących i końcowego "/".
 * Ten sam artykuł bywa w kilku feedach (np. Bankier Wiadomości + Giełda).
 */
export function urlKey(link: string): string {
    try {
        const u = new URL(link);
        const host = u.hostname.replace(/^www\./, '').toLowerCase();
        const path = u.pathname.replace(/\/+$/, '').toLowerCase();
        return `${host}${path}`;
    } catch {
        return link.toLowerCase();
    }
}

/** Klucz zapasowy — ten sam tytuł przedrukowany pod różnymi adresami. */
export function titleKey(title: string): string {
    return title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
