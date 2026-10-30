// Tekst briefu: porządki w odpowiedzi modelu i polski zapis liczb. Bez zależności serwerowych,
// bo te same funkcje stosuje UI do briefów i digestów zapisanych przed 31.10.2026.
import type { BriefBody } from '@/lib/news/brief';

// ─── Porządki w odpowiedzi ──────────────────────────────────

/**
 * Dopiski o pochodzeniu, które model dokleja mimo zasady 2 („…, źródło: serwis Savori”,
 * „; to liczba z nagłówka, nie z danych serwisu”). Wycinamy je, bo pochodzenie mówi stopka karty.
 */
const META_SUFFIX = /\s*(?:,\s*źródło:\s*serwis Savori|[;,]\s*(?:—\s*)?to (?:liczba|cytat) z nagłówka, nie [^.;]*)/gi;

/** Punkt, który komentuje wejście zamiast treści — taki wypada w całości. */
export const META_POINT = /\bw wejściu\b|\bw materiale\b|serwis(?:u|ie)? Savori|danych serwisu|prognoz[ay] serwisu|danych wejściowych|brak nagłówków|nie podano/i;

function stripMeta(t: string): string {
    return t.replace(META_SUFFIX, '').replace(/\s+([.;,])/g, '$1').trim();
}

/**
 * Wycina dopiski o pochodzeniu i punkty-komentarze do wejścia. Tylko USUWA tekst, więc walidator
 * liczb może działać na wyniku. Teza z meta-komentarzem → `null` (brief odrzucony).
 */
export function cleanBriefBody(b: BriefBody): BriefBody | null {
    const list = (xs: string[]) => xs.map(stripMeta).filter((x) => x !== '' && !META_POINT.test(x));
    const teza = stripMeta(b.teza);
    if (!teza || META_POINT.test(teza)) return null;
    return { teza, dane: list(b.dane), polska: list(b.polska), swiat: list(b.swiat), kalendarz: list(b.kalendarz) };
}

/**
 * Zapis liczb po polsku: „-0.32%” → „−0,32%”, „+0.4 pp” → „+0,4 pp”, „2026-10-29” → „29.10”.
 * Wywoływane PRZED walidacją: daty we wejściu też mają postać „29.10” (`ddmm`), więc walidator widzi
 * w obu tekstach te same liczby. Idempotentne, więc UI stosuje je też do briefów sprzed tej zmiany
 * i do starych digestów z kropkami.
 */
export function normalizeBriefText(t: string): string {
    return t
        .replace(/(\d)\.(\d+)(?=\s?(?:%|pp\b|p\.p\.))/g, '$1,$2')
        .replace(/(^|[\s(])-(?=\d)/g, '$1\u2212')
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ddmm);
}

/** „2026-10-29” → „29.10”. */
export function ddmm(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return m ? `${m[3]}.${m[2]}` : iso;
}

export function normalizeBriefBody(b: BriefBody): BriefBody {
    const f = (xs: string[]) => xs.map(normalizeBriefText);
    return { teza: normalizeBriefText(b.teza), dane: f(b.dane), polska: f(b.polska), swiat: f(b.swiat), kalendarz: f(b.kalendarz) };
}

