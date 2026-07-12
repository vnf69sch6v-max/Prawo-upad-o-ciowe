// Dane regionalne z Eurostatu (NUTS-2): PKB per mieszkańca + ludność wg województw.
// Mazowieckie = PL91 (Warszawski stołeczny) + PL92 (Mazowiecki regionalny) — łączymy totale.
import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { fetchEurostat } from '../eurostat/route';

const NUTS_TO_SLUG: Record<string, string> = {
    PL21: 'malopolskie', PL22: 'slaskie', PL41: 'wielkopolskie', PL42: 'zachodniopomorskie',
    PL43: 'lubuskie', PL51: 'dolnoslaskie', PL52: 'opolskie', PL61: 'kujawsko-pomorskie',
    PL62: 'warminskomazurskie', PL63: 'pomorskie', PL71: 'lodzkie', PL72: 'swietokrzyskie',
    PL81: 'lubelskie', PL82: 'podkarpackie', PL84: 'podlaskie', PL91: 'mazowieckie', PL92: 'mazowieckie',
};
const NAMES: Record<string, string> = {
    malopolskie: 'Małopolskie', slaskie: 'Śląskie', wielkopolskie: 'Wielkopolskie', zachodniopomorskie: 'Zachodniopomorskie',
    lubuskie: 'Lubuskie', dolnoslaskie: 'Dolnośląskie', opolskie: 'Opolskie', 'kujawsko-pomorskie': 'Kujawsko-pomorskie',
    warminskomazurskie: 'Warmińsko-mazurskie', pomorskie: 'Pomorskie', lodzkie: 'Łódzkie', swietokrzyskie: 'Świętokrzyskie',
    lubelskie: 'Lubelskie', podkarpackie: 'Podkarpackie', podlaskie: 'Podlaskie', mazowieckie: 'Mazowieckie',
};

const last = (arr?: { date: string; value: number | null }[]) => {
    const v = (arr ?? []).filter((x) => x.value != null);
    return v.length ? v[v.length - 1] : null;
};

export interface RegionalEURow { slug: string; name: string; gdpTotal: number | null; population: number | null; gdpPerCapita: number | null }

export async function GET() {
    try {
        const data = await withCache(
            'macro_data',
            'regional_eu_v2',
            async () => {
                const nuts = Object.keys(NUTS_TO_SLUG);
                const [gdpR, popR] = await Promise.all([
                    fetchEurostat('nama_10r_2gdp', { unit: 'MIO_EUR' }, nuts, '2019'),
                    fetchEurostat('tgs00096', { sex: 'T', age: 'TOTAL', unit: 'NR' }, nuts, '2019'),
                ]);

                const acc: Record<string, { gdp: number; pop: number }> = {};
                let gdpYear = '', popYear = '';
                for (const code of nuts) {
                    const slug = NUTS_TO_SLUG[code];
                    if (!acc[slug]) acc[slug] = { gdp: 0, pop: 0 };
                    const g = last(gdpR.data[code]); const p = last(popR.data[code]);
                    if (g) { acc[slug].gdp += g.value as number; gdpYear = g.date; }
                    if (p) { acc[slug].pop += p.value as number; popYear = p.date; }
                }

                const regions: RegionalEURow[] = Object.entries(acc).map(([slug, v]) => ({
                    slug, name: NAMES[slug] ?? slug,
                    gdpTotal: v.gdp ? Math.round(v.gdp) : null,             // mln EUR
                    population: v.pop || null,                             // osoby
                    gdpPerCapita: v.pop ? Math.round((v.gdp * 1e6) / v.pop) : null, // EUR/mieszkańca
                })).sort((a, b) => (b.gdpPerCapita ?? 0) - (a.gdpPerCapita ?? 0));

                const totalPop = regions.reduce((s, r) => s + (r.population ?? 0), 0);
                const totalGdp = regions.reduce((s, r) => s + (r.gdpTotal ?? 0), 0);
                return {
                    regions, gdpYear, popYear,
                    national: { population: totalPop || null, gdpPerCapita: totalPop ? Math.round((totalGdp * 1e6) / totalPop) : null },
                    source: 'Eurostat nama_10r_2gdp + tgs00096',
                };
            },
            'Eurostat regional',
            7 * 24 * 3600 * 1000,
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('regional-eu error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
