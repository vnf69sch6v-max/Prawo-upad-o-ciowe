// GUS BDL Regional Data — Labor Market Heat Map
// Fetches unemployment rate + wages for all 16 województw via by-unit queries

import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// 16 województw with their BDL unit IDs
const REGIONS = [
    { id: '011200000000', name: 'Małopolskie', slug: 'malopolskie' },
    { id: '012400000000', name: 'Śląskie', slug: 'slaskie' },
    { id: '020800000000', name: 'Lubuskie', slug: 'lubuskie' },
    { id: '023000000000', name: 'Wielkopolskie', slug: 'wielkopolskie' },
    { id: '023200000000', name: 'Zachodniopomorskie', slug: 'zachodniopomorskie' },
    { id: '030200000000', name: 'Dolnośląskie', slug: 'dolnoslaskie' },
    { id: '031600000000', name: 'Opolskie', slug: 'opolskie' },
    { id: '040400000000', name: 'Kujawsko-pomorskie', slug: 'kujawsko-pomorskie' },
    { id: '042200000000', name: 'Pomorskie', slug: 'pomorskie' },
    { id: '042800000000', name: 'Warmińsko-mazurskie', slug: 'warminskomazurskie' },
    { id: '051000000000', name: 'Łódzkie', slug: 'lodzkie' },
    { id: '052600000000', name: 'Świętokrzyskie', slug: 'swietokrzyskie' },
    { id: '060600000000', name: 'Lubelskie', slug: 'lubelskie' },
    { id: '061800000000', name: 'Podkarpackie', slug: 'podkarpackie' },
    { id: '062000000000', name: 'Podlaskie', slug: 'podlaskie' },
    { id: '071400000000', name: 'Mazowieckie', slug: 'mazowieckie' },
];

// Monthly unemployment IDs (P3559): 461680 (Jan) → 461691 (Dec)
const UNEMPLOYMENT_IDS = Array.from({ length: 12 }, (_, i) => 461680 + i);
// Wages: var 64428 (ogółem, annual, PLN)
const WAGES_VAR = 64428;

// PKD sector wages (P2797) — national level
const PKD_SECTORS: Array<{ id: number; code: string; name: string }> = [
    { id: 151739, code: 'Ogółem', name: 'Ogółem' },
    { id: 151742, code: 'A', name: 'Rolnictwo' },
    { id: 151749, code: 'C', name: 'Przetwórstwo przemysłowe' },
    { id: 151752, code: 'F', name: 'Budownictwo' },
    { id: 151753, code: 'G', name: 'Handel' },
    { id: 151746, code: 'H', name: 'Transport' },
    { id: 151750, code: 'I', name: 'Gastronomia' },
    { id: 151735, code: 'J', name: 'IT i komunikacja' },
    { id: 151740, code: 'K', name: 'Finanse i ubezpieczenia' },
    { id: 151741, code: 'M', name: 'Działalność naukowa' },
    { id: 151754, code: 'O', name: 'Administracja publiczna' },
    { id: 151747, code: 'P', name: 'Edukacja' },
    { id: 151745, code: 'Q', name: 'Opieka zdrowotna' },
];

interface RegionData {
    id: string;
    name: string;
    slug: string;
    unemployment: number | null;     // Latest month %
    unemploymentMonth: string | null; // e.g. "grudzień"
    unemploymentPrev: number | null;  // Same month previous year
    wages: number | null;            // Annual PLN
    wagesPrev: number | null;        // Previous year PLN
    wagesYoY: number | null;         // YoY % change
}

const MONTH_NAMES = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

async function fetchBDL(endpoint: string, apiKey?: string): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;

    const res = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
    if (res.status === 429) {
        await new Promise(r => setTimeout(r, 5000));
        const retry = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
        if (!retry.ok) throw new Error(`GUS rate limited`);
        return retry.json();
    }
    if (!res.ok) throw new Error(`GUS API ${res.status}`);
    return res.json();
}

async function fetchRegionData(region: typeof REGIONS[0], apiKey?: string): Promise<{
    regionData: RegionData;
    monthly: Record<string, number>; // "YYYY-MM" → rate
}> {
    const currentYear = new Date().getFullYear();
    const years = `year=${currentYear}&year=${currentYear - 1}&year=${currentYear - 2}`;
    const varIds = [...UNEMPLOYMENT_IDS, WAGES_VAR].join('&var-id=');
    const monthly: Record<string, number> = {};

    try {
        const data = await fetchBDL(
            `data/by-unit/${region.id}?var-id=${varIds}&format=json&${years}`,
            apiKey
        ) as { results?: Array<{ id: number; values: Array<{ year: number; val: number | null }> }> };

        const results = data?.results || [];

        // Extract ALL monthly unemployment data
        let unemployment: number | null = null;
        let unemploymentMonth: string | null = null;
        let unemploymentPrev: number | null = null;

        for (let m = 11; m >= 0; m--) {
            const varId = UNEMPLOYMENT_IDS[m];
            const entry = results.find(r => r.id === varId);
            if (!entry) continue;

            for (const v of (entry.values || [])) {
                if (v.val !== null) {
                    const key = `${v.year}-${String(m + 1).padStart(2, '0')}`;
                    monthly[key] = v.val;
                }
            }

            // Latest unemployment (first non-null from latest year, scanning Dec→Jan)
            if (unemployment === null) {
                const sorted = [...(entry.values || [])].sort((a, b) => b.year - a.year);
                const latest = sorted.find(v => v.val !== null);
                if (latest) {
                    unemployment = latest.val;
                    unemploymentMonth = MONTH_NAMES[m];
                    const prev = sorted.find(v => v.val !== null && v.year < latest.year);
                    unemploymentPrev = prev?.val ?? null;
                }
            }
        }

        // Wages
        const wageEntry = results.find(r => r.id === WAGES_VAR);
        const wageSorted = [...(wageEntry?.values || [])].sort((a, b) => b.year - a.year);
        const latestWage = wageSorted.find(v => v.val !== null);
        const prevWage = wageSorted.find(v => v.val !== null && v.year < (latestWage?.year ?? 9999));
        const wages = latestWage?.val ?? null;
        const wagesPrev = prevWage?.val ?? null;
        const wagesYoY = wages && wagesPrev ? +((wages / wagesPrev - 1) * 100).toFixed(1) : null;

        return {
            regionData: {
                id: region.id, name: region.name, slug: region.slug,
                unemployment, unemploymentMonth, unemploymentPrev,
                wages, wagesPrev, wagesYoY,
            },
            monthly,
        };
    } catch (err) {
        console.error(`GUS regional ${region.name}:`, err);
        return {
            regionData: {
                id: region.id, name: region.name, slug: region.slug,
                unemployment: null, unemploymentMonth: null, unemploymentPrev: null,
                wages: null, wagesPrev: null, wagesYoY: null,
            },
            monthly: {},
        };
    }
}

export async function GET() {
    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;

    try {
        const data = await withCache(
            'macro_data',
            'gus_regional_labor_v2',
            async () => {
                const allResults: Array<{ regionData: RegionData; monthly: Record<string, number> }> = [];
                const batches = [REGIONS.slice(0, 8), REGIONS.slice(8)];

                for (const batch of batches) {
                    const batchResults = await Promise.all(
                        batch.map(r => fetchRegionData(r, apiKey))
                    );
                    allResults.push(...batchResults);
                    if (batches.indexOf(batch) < batches.length - 1) {
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }

                const regions = allResults.map(r => r.regionData);

                // Build timeline: {month: {slug: rate}}
                const timelineMap: Record<string, Record<string, number>> = {};
                for (const { regionData, monthly } of allResults) {
                    for (const [key, val] of Object.entries(monthly)) {
                        if (!timelineMap[key]) timelineMap[key] = {};
                        timelineMap[key][regionData.slug] = val;
                    }
                }

                // Sort timeline by date and build array
                const timeline = Object.entries(timelineMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, rates]) => ({ month, rates }));

                // Compute yearly averages from timeline
                const yearlyMap: Record<string, Record<string, number[]>> = {};
                for (const { month, rates } of timeline) {
                    const year = month.split('-')[0];
                    if (!yearlyMap[year]) yearlyMap[year] = {};
                    for (const [slug, val] of Object.entries(rates)) {
                        if (!yearlyMap[year][slug]) yearlyMap[year][slug] = [];
                        yearlyMap[year][slug].push(val);
                    }
                }
                const yearly = Object.entries(yearlyMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, slugData]) => ({
                        year,
                        rates: Object.fromEntries(
                            Object.entries(slugData).map(([slug, vals]) => [
                                slug,
                                +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1),
                            ])
                        ),
                    }));

                // Fetch PKD sector wages (national)
                let sectorWages: Array<{ code: string; name: string; wage: number | null; wagePrev: number | null; yoy: number | null }> = [];
                try {
                    const pkdVarIds = PKD_SECTORS.map(s => s.id).join('&var-id=');
                    const pkdData = await fetchBDL(
                        `data/by-unit/000000000000?var-id=${pkdVarIds}&format=json&year=${new Date().getFullYear()}&year=${new Date().getFullYear() - 1}&year=${new Date().getFullYear() - 2}`,
                        apiKey
                    ) as { results?: Array<{ id: number; values: Array<{ year: number; val: number | null }> }> };

                    sectorWages = PKD_SECTORS.map(sector => {
                        const entry = pkdData?.results?.find(r => r.id === sector.id);
                        const sorted = [...(entry?.values || [])].sort((a, b) => b.year - a.year);
                        const latest = sorted.find(v => v.val !== null);
                        const prev = sorted.find(v => v.val !== null && v.year < (latest?.year ?? 9999));
                        const wage = latest?.val ?? null;
                        const wagePrev = prev?.val ?? null;
                        const yoy = wage && wagePrev ? +((wage / wagePrev - 1) * 100).toFixed(1) : null;
                        return { code: sector.code, name: sector.name, wage, wagePrev, yoy };
                    });
                } catch (err) {
                    console.error('PKD wages error:', err);
                }

                // National averages
                const validUnemp = regions.filter(r => r.unemployment !== null);
                const validWages = regions.filter(r => r.wages !== null);
                const avgUnemployment = validUnemp.length > 0
                    ? +(validUnemp.reduce((s, r) => s + r.unemployment!, 0) / validUnemp.length).toFixed(1) : null;
                const avgWages = validWages.length > 0
                    ? Math.round(validWages.reduce((s, r) => s + r.wages!, 0) / validWages.length) : null;

                return {
                    regions,
                    timeline,
                    yearly,
                    sectorWages,
                    national: { avgUnemployment, avgWages },
                    source: 'GUS BDL P3559+P2497+P2797',
                    timestamp: new Date().toISOString(),
                };
            },
            'GUS BDL Regional v3',
            24 * 3600 * 1000
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS Regional error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
