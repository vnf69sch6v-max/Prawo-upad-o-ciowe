// Kanały zagraniczne (EBC, Fed, BOJ, BBC…) są po angielsku. Na /newsy mają własny filtr „Świat”
// i „Banki centralne”; widżety Przeglądu i „Najnowsze” zostają polskie.
export function isPolishNews(it: { lang?: string }): boolean {
    return (it.lang ?? 'pl') === 'pl';
}

const REGION_LABELS: Record<string, string> = {
    EU: 'Strefa euro',
    US: 'USA',
    JP: 'Japonia',
    GB: 'Wlk. Brytania',
    GLOBAL: 'Świat',
};

/** Podpis „EN · USA” dla pozycji obcojęzycznej; null dla polskiej. */
export function foreignLabel(it: { lang?: string; region?: string }): string | null {
    if (isPolishNews(it)) return null;
    const region = it.region ? REGION_LABELS[it.region] : undefined;
    return region ? `EN · ${region}` : 'EN';
}
