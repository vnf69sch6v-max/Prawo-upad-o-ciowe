// Szybki szacunek CPI (GUS, ostatni dzień roboczy miesiąca) — CZYSTE funkcje, bez I/O i bez React.
// Spec: docs/specs/2026-11-02-cpi-szybki-szacunek.md. DBW dostaje tylko pełny odczyt (~15 dni później), więc
// jedynym źródłem jest komunikat na stat.gov.pl (HTML + tablica XLSX). Parser waliduje tytuł, miesiąc i zakres
// liczb i RZUCA zamiast zgadywać — `withCache` zostawia wtedy poprzedni dobry wpis.
import { cpiFlashDate, cpiPreliminaryDate } from '@/lib/calendar-schedules';

export const CPI_FLASH_SOURCE = 'GUS, szybki szacunek';
export const GUS_PRICES_INDEX_URL = 'https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/';
const TITLE = 'Szybki szacunek wskaźnika cen towarów i usług konsumpcyjnych';

export interface CpiFlashGroup { name: string; yoy: number; mom: number }

export interface CpiFlash {
    /** Miesiąc danych, YYYY-MM. */
    period: string;
    yoy: number;
    mom: number;
    /** Wskaźniki cen z komunikatu (analogiczny miesiąc = 100 / poprzedni miesiąc = 100). */
    indexYoy: number;
    indexMom: number;
    /** Dzień komunikatu (YYYY-MM-DD, z daty na stronie). */
    publishedOn: string;
    /** Planowany pełny odczyt (kalendarz GUS) — powrót do DBW i tak decydują dane, nie ta data. */
    fullReleaseOn: string;
    url: string;
    /** Podgrupy z tablicy XLSX (żywność, energia, paliwa); puste, gdy tablica nie zgadza się z HTML. */
    groups: CpiFlashGroup[];
    source: string;
}

// Miejscownik (w październiku, we wrześniu) → numer miesiąca. Klucz bez ogonków, jak w adresach GUS.
const LOCATIVE: Record<string, number> = {
    styczniu: 1, lutym: 2, marcu: 3, kwietniu: 4, maju: 5, czerwcu: 6,
    lipcu: 7, sierpniu: 8, wrzesniu: 9, pazdzierniku: 10, listopadzie: 11, grudniu: 12,
};

function fold(s: string): string {
    return s.toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l').replace(/ń/g, 'n')
        .replace(/ó/g, 'o').replace(/ś/g, 's').replace(/[źż]/g, 'z');
}

/** HTML → tekst: bez tagów, `&nbsp;` i dzielenia wyrazów „ana-logicznym”, jedna spacja. */
export function htmlText(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|&#160;| /g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

/** „w październiku 2026” / „we wrześniu 2026” → { year, month }. */
function monthIn(text: string): { year: number; month: number } | null {
    const m = /\bwe? ([a-ząćęłńóśźż]+) (\d{4})\b/i.exec(text);
    if (!m) return null;
    const month = LOCATIVE[fold(m[1])];
    return month ? { year: Number(m[2]), month } : null;
}

const pad = (n: number) => String(n).padStart(2, '0');
const num = (s: string) => Number(s.replace(',', '.'));
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Pełny odczyt CPI za `period` (komunikat w połowie M+1). */
export function fullReleaseFor(period: string): string {
    const [y, m] = period.split('-').map(Number);
    return m === 12 ? cpiPreliminaryDate(y + 1, 1) : cpiPreliminaryDate(y, m + 1);
}

export interface ParseOptions { url: string; now?: Date }

/**
 * Strona komunikatu → odczyt. Rzuca, gdy: brak tytułu „Szybki szacunek wskaźnika cen towarów i usług
 * konsumpcyjnych”, miesiąc w tytule ≠ miesiąc w akapicie, brak dwóch „wskaźnik cen X”, r/r spoza [−5, 30],
 * m/m spoza [−5, 5], „o N%” niezgodne ze wskaźnikiem, okres spoza (bieżący miesiąc, poprzedni).
 */
export function parseCpiFlashHtml(html: string, opts: ParseOptions): Omit<CpiFlash, 'groups'> {
    const h2 = /<h2 class="title">([\s\S]*?)<\/h2>/i.exec(html);
    const title = h2 ? htmlText(h2[1]) : '';
    if (!title.startsWith(TITLE)) throw new Error(`[cpi-flash] obcy tytuł komunikatu: „${title.slice(0, 80)}”`);
    const titleMonth = monthIn(title);
    if (!titleMonth) throw new Error(`[cpi-flash] brak miesiąca w tytule: „${title}”`);

    const pm = /<p>\s*Ceny towarów i usług konsumpcyjnych według szybkiego szacunku([\s\S]*?)<\/p>/i.exec(html);
    if (!pm) throw new Error('[cpi-flash] brak akapitu „według szybkiego szacunku”');
    const para = htmlText(pm[1]);
    const paraMonth = monthIn(para);
    if (!paraMonth || paraMonth.year !== titleMonth.year || paraMonth.month !== titleMonth.month) {
        throw new Error(`[cpi-flash] miesiąc w akapicie ≠ w tytule (${title} / ${para.slice(0, 60)})`);
    }

    const idx = [...para.matchAll(/wskaźnik cen (\d{2,3},\d)/g)].map((x) => num(x[1]));
    if (idx.length !== 2) throw new Error(`[cpi-flash] oczekiwano 2 wskaźników cen, jest ${idx.length}`);
    const [indexYoy, indexMom] = idx;
    const yoy = round1(indexYoy - 100);
    const mom = round1(indexMom - 100);
    if (!(yoy >= -5 && yoy <= 30)) throw new Error(`[cpi-flash] r/r poza zakresem: ${yoy}`);
    if (!(mom >= -5 && mom <= 5)) throw new Error(`[cpi-flash] m/m poza zakresem: ${mom}`);
    // Kontrola: „wzrosły o 3,5% (wskaźnik cen 103,5)” — liczba słowna musi pasować do wskaźnika.
    const pcts = [...para.matchAll(/o (\d{1,2},\d)% \(wskaźnik cen (\d{2,3},\d)\)/g)];
    for (const p of pcts) {
        if (Math.abs(num(p[1]) - Math.abs(num(p[2]) - 100)) >= 0.05) throw new Error(`[cpi-flash] „o ${p[1]}%” ≠ wskaźnik ${p[2]}`);
    }

    const period = `${titleMonth.year}-${pad(titleMonth.month)}`;
    const now = opts.now ?? new Date();
    const cur = warsawYearMonth(now);
    const prev = cur.month === 1 ? `${cur.year - 1}-12` : `${cur.year}-${pad(cur.month - 1)}`;
    const curKey = `${cur.year}-${pad(cur.month)}`;
    // Dolna granica: poprzedni miesiąc albo oczekiwany flash — w lutym i marcu najnowszy jest grudniowy (brak za I i II).
    const expected = expectedCpiFlashPeriod(now);
    const lower = expected < prev ? expected : prev;
    if (period < lower || period > curKey) throw new Error(`[cpi-flash] okres ${period} spoza ${lower}…${curKey}`);

    const dm = /<div class="date right">\s*(\d{2})\.(\d{2})\.(\d{4})\s*<\/div>/.exec(html);
    const publishedOn = dm ? `${dm[3]}-${dm[2]}-${dm[1]}` : cpiFlashDate(titleMonth.year, titleMonth.month) ?? '';
    if (!publishedOn) throw new Error('[cpi-flash] brak daty komunikatu');

    return {
        period, yoy, mom, indexYoy, indexMom, publishedOn,
        fullReleaseOn: fullReleaseFor(period),
        url: opts.url, source: CPI_FLASH_SOURCE,
    };
}

function warsawYearMonth(now: Date): { year: number; month: number } {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: 'numeric' }).formatToParts(now);
    return { year: Number(parts.find((p) => p.type === 'year')?.value), month: Number(parts.find((p) => p.type === 'month')?.value) };
}

/** Link do tablicy XLSX („Tablice w formacie XLSX”, nie „Dane do wykresów”). */
export function findXlsxHref(html: string): string | null {
    const re = /href="([^"]+\.xlsx)"[^>]*>\s*([^<]*)</g;
    for (const m of html.matchAll(re)) {
        if (/Tablice w formacie XLSX/i.test(m[2])) return absolute(m[1]);
    }
    return null;
}

function absolute(href: string): string {
    return href.startsWith('http') ? href : `https://stat.gov.pl${href.startsWith('/') ? '' : '/'}${href}`;
}

/**
 * Strona działu „Wskaźniki cen” → link do NAJNOWSZEGO szybkiego szacunku (maksimum rok·miesiąc z adresu),
 * nie pierwszy z brzegu: strona linkuje też czerwiec 2022.
 */
export function pickLatestFlashLink(html: string): { url: string; period: string } | null {
    const re = /href="([^"#]*szybki-szacunek-wskaznika-cen-towarow-i-uslug-konsumpcyjnych-we?-([a-z]+)-(\d{4})[^"#]*\.html)"/g;
    let best: { url: string; period: string } | null = null;
    for (const m of html.matchAll(re)) {
        const month = LOCATIVE[m[2]];
        if (!month) continue;
        const period = `${m[3]}-${pad(month)}`;
        if (!best || period > best.period) best = { url: absolute(m[1]), period };
    }
    return best;
}

const GROUPS: { match: RegExp; name: string }[] = [
    { match: /^Żywność i napoje bezalkoholowe$/i, name: 'Żywność i napoje bezalkoholowe' },
    { match: /^Energia elektryczna, gaz i inne paliwa$/i, name: 'Energia elektryczna, gaz i inne paliwa' },
    { match: /^Paliwa i smary do prywatnych środków transportu$/i, name: 'Paliwa do prywatnych środków transportu' },
];

/**
 * Siatka tablicy 1 (XLSX) → podgrupy. Pusta lista, gdy tablica dotyczy innego miesiąca albo jej OGÓŁEM
 * ≠ wskaźniki z HTML — wtedy pokazujemy sam headline, nie cudze podgrupy.
 */
export function parseCpiFlashGrid(grid: string[][], flash: Pick<CpiFlash, 'period' | 'indexYoy' | 'indexMom'>): CpiFlashGroup[] {
    const rows = grid.map((r) => (r ?? []).map((c) => (c ?? '').trim()).filter((c) => c !== ''));
    const head = rows.find((r) => r.some((c) => c.startsWith('Tablica 1.')))?.find((c) => c.startsWith('Tablica 1.')) ?? '';
    const hm = monthIn(head);
    if (!head.includes(TITLE) || !hm || `${hm.year}-${pad(hm.month)}` !== flash.period) return [];
    const values = (r: string[]) => r.slice(1).map(Number).filter((v) => Number.isFinite(v));
    const total = rows.find((r) => /^OGÓŁEM$/i.test(r[0] ?? ''));
    if (!total) return [];
    const [ty, tm] = values(total);
    if (Math.abs(ty - flash.indexYoy) > 0.05 || Math.abs(tm - flash.indexMom) > 0.05) return [];
    const out: CpiFlashGroup[] = [];
    for (const g of GROUPS) {
        const r = rows.find((row) => g.match.test(row[0] ?? ''));
        if (!r) continue;
        const [y, m] = values(r);
        if (!Number.isFinite(y) || !Number.isFinite(m)) continue;
        out.push({ name: g.name, yoy: round1(y - 100), mom: round1(m - 100) });
    }
    return out;
}

// ─── Scalanie z DBW ─────────────────────────────────────

export interface HeadlinePoint { date: string; yoy: number | null; mom: number | null; provisional?: boolean }

/**
 * Jedna reguła dla `/ceny`, hero, digestu: jeśli szybki szacunek dotyczy miesiąca, którego DBW jeszcze nie ma,
 * dokładamy go jako ostatni punkt `provisional`. Gdy DBW ma ten miesiąc (pełny odczyt) — DBW bez zmian.
 */
export function mergeCpiHeadline(dbw: HeadlinePoint[], flash: CpiFlash | null | undefined): HeadlinePoint[] {
    if (!flash) return dbw;
    const lastMonth = latestDbwMonth(dbw);
    if (lastMonth != null && flash.period <= lastMonth) return dbw;
    return [...dbw, { date: flash.period, yoy: flash.yoy, mom: flash.mom, provisional: true }];
}

export function latestDbwMonth(dbw: HeadlinePoint[]): string | null {
    let best: string | null = null;
    for (const h of dbw) if (h.yoy != null && /^\d{4}-\d{2}$/.test(h.date) && (best == null || h.date > best)) best = h.date;
    return best;
}

/** Flash, który właśnie zastąpił DBW, a pełna liczba różni się od wstępnej — podpis „Szybki szacunek: X%” przez 7 dni. */
export function flashRevision(dbw: HeadlinePoint[], flash: CpiFlash | null | undefined, today: string | null): number | null {
    if (!flash || !today) return null;
    const hit = dbw.find((h) => h.date === flash.period && h.yoy != null);
    if (!hit || hit.yoy === flash.yoy) return null;
    const [y1, m1, d1] = flash.fullReleaseOn.split('-').map(Number);
    const [y2, m2, d2] = today.split('-').map(Number);
    const days = (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000;
    return days >= 0 && days <= 7 ? flash.yoy : null;
}

/** „DD.MM” z ISO. */
export function ddmm(iso: string): string {
    return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

// ─── Kalendarz: który szybki szacunek powinien już być ───

const GUS_FLASH_RELEASE_MINUTES = 10 * 60;

function warsawNow(now: Date): { date: string; year: number; month: number; minutes: number } {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
    return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        year: Number(get('year')), month: Number(get('month')),
        minutes: Number(get('hour')) * 60 + Number(get('minute')),
    };
}

/**
 * Miesiąc ostatniego szybkiego szacunku, który wg kalendarza już wyszedł (od 10:00 Warszawy w dniu publikacji).
 * W styczniu i lutym (brak flasha) — grudzień.
 */
export function expectedCpiFlashPeriod(now: Date, releaseMinutes = GUS_FLASH_RELEASE_MINUTES): string {
    const c = warsawNow(now);
    let y = c.year, m = c.month;
    for (let i = 0; i < 14; i++) {
        const d = cpiFlashDate(y, m);
        if (d && (c.date > d || (c.date === d && c.minutes >= releaseMinutes))) return `${y}-${pad(m)}`;
        m -= 1;
        if (m === 0) { m = 12; y -= 1; }
    }
    return `${c.year - 1}-12`;
}

/** Dzień szybkiego szacunku po 10:00, a wpis jeszcze ma starszy miesiąc → warto zapytać GUS (najwyżej co 10 min). */
export function cpiFlashBehind(period: string | null | undefined, now: Date = new Date()): boolean {
    const c = warsawNow(now);
    const d = cpiFlashDate(c.year, c.month);
    if (d !== c.date || c.minutes < GUS_FLASH_RELEASE_MINUTES) return false;
    return !period || period < `${c.year}-${pad(c.month)}`;
}
