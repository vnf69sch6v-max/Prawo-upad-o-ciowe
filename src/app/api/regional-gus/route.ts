// Dane regionalne z GUS BDL: PKB (NUTS-2, rachunki regionalne) + ludność (województwa).
// Mazowieckie: łączymy Warszawski stołeczny + Mazowiecki regionalny (jak w Eurostat PL91+PL92).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

const GDP_TOTAL = 458271;       // PKB ogółem, mln zł (P3498, NUTS-2)
const GDP_PER_CAPITA = 458421;  // PKB na 1 mieszkańca, zł (P3499, NUTS-2)
const POPULATION = 72305;       // Ludność ogółem (województwa)

const NAMES: Record<string, string> = {
    malopolskie: 'Małopolskie', slaskie: 'Śląskie', wielkopolskie: 'Wielkopolskie', zachodniopomorskie: 'Zachodniopomorskie',
    lubuskie: 'Lubuskie', dolnoslaskie: 'Dolnośląskie', opolskie: 'Opolskie', 'kujawsko-pomorskie': 'Kujawsko-pomorskie',
    warminskomazurskie: 'Warmińsko-mazurskie', pomorskie: 'Pomorskie', lodzkie: 'Łódzkie', swietokrzyskie: 'Świętokrzyskie',
    lubelskie: 'Lubelskie', podkarpackie: 'Podkarpackie', podlaskie: 'Podlaskie', mazowieckie: 'Mazowieckie',
};

// BDL unit id (NUTS-2) → slug województwa
const NUTS2_TO_SLUG: Record<string, string> = {
    '011210000000': 'malopolskie', '012410000000': 'slaskie', '020810000000': 'lubuskie',
    '023010000000': 'wielkopolskie', '023210000000': 'zachodniopomorskie', '030210000000': 'dolnoslaskie',
    '031610000000': 'opolskie', '040410000000': 'kujawsko-pomorskie', '042210000000': 'pomorskie',
    '042810000000': 'warminskomazurskie', '051010000000': 'lodzkie', '052610000000': 'swietokrzyskie',
    '060610000000': 'lubelskie', '061810000000': 'podkarpackie', '062010000000': 'podlaskie',
    '071410000000': 'mazowieckie', '071420000000': 'mazowieckie',
};

// BDL unit id (województwo) → slug
const VOIV_TO_SLUG: Record<string, string> = {
    '011200000000': 'malopolskie', '012400000000': 'slaskie', '020800000000': 'lubuskie',
    '023000000000': 'wielkopolskie', '023200000000': 'zachodniopomorskie', '030200000000': 'dolnoslaskie',
    '031600000000': 'opolskie', '040400000000': 'kujawsko-pomorskie', '042200000000': 'pomorskie',
    '042800000000': 'warminskomazurskie', '051000000000': 'lodzkie', '052600000000': 'swietokrzyskie',
    '060600000000': 'lubelskie', '061800000000': 'podkarpackie', '062000000000': 'podlaskie',
    '071400000000': 'mazowieckie',
};

export interface RegionalGusRow {
    slug: string;
    name: string;
    gdpTotal: number | null;      // mln zł
    population: number | null;    // osoby
    gdpPerCapita: number | null;  // zł
}

interface BdlUnitRow {
    id: string;
    values: Array<{ year: string; val: number | null }>;
}

async function fetchBDL(endpoint: string, apiKey?: string): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;
    const res = await fetch(`${GUS_BASE}/${endpoint}`, { headers, next: { revalidate: 86400 } });
    if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 5000));
        const retry = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
        if (!retry.ok) throw new Error(`GUS rate limited`);
        return retry.json();
    }
    if (!res.ok) throw new Error(`GUS API ${res.status}`);
    return res.json();
}

function latestVal(row: BdlUnitRow): { year: string; val: number } | null {
    const sorted = [...(row.values ?? [])].filter((v) => v.val != null).sort((a, b) => b.year.localeCompare(a.year));
    const top = sorted[0];
    return top ? { year: top.year, val: top.val as number } : null;
}

async function fetchByVariable(varId: number, unitLevel: number, years: number[], apiKey?: string): Promise<BdlUnitRow[]> {
    const yq = years.map((y) => `year=${y}`).join('&');
    const data = await fetchBDL(`data/by-variable/${varId}?unit-level=${unitLevel}&format=json&page-size=100&${yq}`, apiKey) as { results?: BdlUnitRow[] };
    return data?.results ?? [];
}

export async function GET(request: NextRequest) {
    const force = new URL(request.url).searchParams.get('refresh') === '1';
    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;

    try {
        const data = await withCache(
            'macro_data',
            'regional_gus_v1',
            async () => {
                const currentYear = new Date().getFullYear();
                const years = [currentYear, currentYear - 1, currentYear - 2];

                const [gdpRows, popRows] = await Promise.all([
                    fetchByVariable(GDP_TOTAL, 3, years, apiKey),
                    fetchByVariable(POPULATION, 2, years, apiKey),
                ]);

                // PKB wg województw (agregacja NUTS-2 → slug)
                const gdpBySlug: Record<string, { total: number; year: string }> = {};
                let gdpYear = '';
                for (const row of gdpRows) {
                    const slug = NUTS2_TO_SLUG[row.id];
                    if (!slug) continue;
                    const lv = latestVal(row);
                    if (!lv) continue;
                    if (!gdpBySlug[slug]) gdpBySlug[slug] = { total: 0, year: lv.year };
                    gdpBySlug[slug].total += lv.val;
                    gdpBySlug[slug].year = lv.year;
                    gdpYear = lv.year;
                }

                // Ludność wg województw
                const popBySlug: Record<string, { pop: number; year: string }> = {};
                let popYear = '';
                for (const row of popRows) {
                    const slug = VOIV_TO_SLUG[row.id];
                    if (!slug) continue;
                    const lv = latestVal(row);
                    if (!lv) continue;
                    popBySlug[slug] = { pop: lv.val, year: lv.year };
                    popYear = lv.year;
                }

                const slugs = [...new Set([...Object.keys(gdpBySlug), ...Object.keys(popBySlug)])];
                const regions: RegionalGusRow[] = slugs.map((slug) => {
                    const gdp = gdpBySlug[slug];
                    const pop = popBySlug[slug];
                    const gdpTotal = gdp?.total ?? null;
                    const population = pop?.pop ?? null;
                    const gdpPerCapita = gdpTotal != null && population
                        ? Math.round((gdpTotal * 1e6) / population)
                        : null;
                    return {
                        slug,
                        name: NAMES[slug] ?? slug,
                        gdpTotal,
                        population,
                        gdpPerCapita,
                    };
                }).sort((a, b) => (b.gdpPerCapita ?? 0) - (a.gdpPerCapita ?? 0));

                const totalPop = regions.reduce((s, r) => s + (r.population ?? 0), 0);
                const totalGdp = regions.reduce((s, r) => s + (r.gdpTotal ?? 0), 0);

                return {
                    regions,
                    gdpYear,
                    popYear,
                    national: {
                        population: totalPop || null,
                        gdpPerCapita: totalPop ? Math.round((totalGdp * 1e6) / totalPop) : null,
                        gdpTotal: totalGdp || null,
                    },
                    source: 'GUS BDL P3498+P1385 (var:458271,72305)',
                };
            },
            'GUS BDL Regional',
            force ? -1 : 7 * 24 * 3600 * 1000,
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('regional-gus error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
