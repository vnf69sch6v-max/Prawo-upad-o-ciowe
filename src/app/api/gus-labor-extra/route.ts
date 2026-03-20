// GUS BDL — Extended Labor Market Data
// STRUKTURA (BAEL education + age + activity rate)
// DYNAMIKA (vacancies + job creation/destruction)
// BRANŻE (employment + wages by PKD sector)
// WYNAGRODZENIA (quarterly wages by region)

import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// 16 województw
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

// ═══════════ VARIABLE IDs ═══════════

// BAEL: unemployment by education level (P4099, annual, "wartość liczbowa")
const BAEL_EDUCATION = [
    { id: 1632595, name: 'Wyższe' },
    { id: 1632597, name: 'Policealne i średnie zawodowe' },
    { id: 1632599, name: 'Średnie ogólnokształcące' },
    { id: 1632601, name: 'Zasadnicze zawodowe' },
    { id: 1632603, name: 'Gimnazjalne i niższe' },
];

// BAEL: unemployment by age group (P4100, annual, "wartość liczbowa")
const BAEL_AGE = [
    { id: 1632605, name: 'Ogółem' },
    { id: 1726362, name: '15-24 lat' },
    { id: 1632609, name: '15-29 lat' },
    { id: 1632611, name: '30-39 lat' },
    { id: 1632613, name: '40-49 lat' },
    { id: 1632615, name: '50-89 lat' },
];

// BAEL quarterly (P3981 activity rate + P3982 unemployment rate)
// For each Q the IDs are offset by 12 (Q1→Q2→Q3→Q4)
const BAEL_QUARTERLY = {
    activityRate:     { q1: 1615065, q2: 1615077, q3: 1615089, q4: 1615101 },  // P3981 ogółem
    unemploymentRate: { q1: 1615673, q2: 1615679, q3: 1615685, q4: 1615691 },  // P3982 ogółem
};

// Vacancies (P4294)
const VACANCIES = { count: 1653025, rate: 1653026 };

// Job creation/destruction (P3441)
const JOBS_FLOW = { created: 452355, destroyed: 452356 };

// Employment by PKD sector (P2836 — przeciętne zatrudnienie wg sekcji)
const EMPLOYMENT_PKD = [
    { id: 154173, code: 'Ogółem', name: 'Ogółem' },
    { id: 154174, code: 'A', name: 'Rolnictwo' },
    { id: 154177, code: 'C', name: 'Przetwórstwo przemysłowe' },
    { id: 154180, code: 'F', name: 'Budownictwo' },
    { id: 154181, code: 'G', name: 'Handel' },
    { id: 154182, code: 'H', name: 'Transport' },
    { id: 154183, code: 'I', name: 'Gastronomia' },
    { id: 154184, code: 'J', name: 'IT i komunikacja' },
    { id: 154185, code: 'K', name: 'Finanse i ubezpieczenia' },
    { id: 154186, code: 'L', name: 'Nieruchomości' },
    { id: 154187, code: 'M', name: 'Działalność naukowa' },
    { id: 154188, code: 'N', name: 'Administracja usługowa' },
    { id: 154189, code: 'O', name: 'Administracja publiczna' },
    { id: 154190, code: 'P', name: 'Edukacja' },
    { id: 154191, code: 'Q', name: 'Opieka zdrowotna' },
    { id: 154192, code: 'R', name: 'Kultura i rozrywka' },
    { id: 154193, code: 'S', name: 'Pozostała usługowa' },
];

// Quarterly wages by region (P2504) — only ogółem (not "bez nagród")
const QUARTERLY_WAGES = {
    q1: 64535, q2: 64536, q3: 64538, q4: 64540,
};

// ═══════════ HELPERS ═══════════

async function fetchBDL(path: string, apiKey: string) {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${GUS_BASE}/${path}${sep}page-size=100`;
    const res = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-ClientId': apiKey,
        },
    });
    if (!res.ok) {
        console.error('BDL error:', res.status, await res.text().catch(() => ''));
        return null;
    }
    return res.json();
}

function getLatestVal(values: Array<{ year: number; val: number | null }> | undefined): { val: number | null; year: number | null } {
    if (!values) return { val: null, year: null };
    const sorted = [...values].sort((a, b) => b.year - a.year);
    const found = sorted.find(v => v.val !== null);
    return found ? { val: found.val, year: found.year } : { val: null, year: null };
}

function getPrevVal(values: Array<{ year: number; val: number | null }> | undefined, latestYear: number | null): number | null {
    if (!values || latestYear === null) return null;
    const found = [...values].sort((a, b) => b.year - a.year).find(v => v.val !== null && v.year < latestYear);
    return found?.val ?? null;
}

// ═══════════ MAIN ═══════════

export async function GET() {
    try {
        const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY || '';
        if (!apiKey) {
            return NextResponse.json({ error: 'GUS_BDL_KEY not configured' }, { status: 500 });
        }

        const currentYear = new Date().getFullYear();
        const yearParams = Array.from({ length: 6 }, (_, i) => `year=${currentYear - i}`).join('&');

        const data = await withCache(
            'api_cache',
            'gus_labor_extra_v1',
            async () => {
                // BAEL education (P3435) — national annual
                const eduVarIds = BAEL_EDUCATION.map(e => `var-id=${e.id}`).join('&');
                const eduData = await fetchBDL(
                    `data/by-unit/000000000000?${eduVarIds}&format=json&${yearParams}`, apiKey
                );
                const baelEducation = BAEL_EDUCATION.map(e => {
                    const entry = eduData?.results?.find((r: { id: number }) => r.id === e.id);
                    const latest = getLatestVal(entry?.values);
                    const prev = getPrevVal(entry?.values, latest.year);
                    return { name: e.name, rate: latest.val, year: latest.year, prev };
                });

                // BAEL age (P3754) — national annual
                const ageVarIds = BAEL_AGE.map(e => `var-id=${e.id}`).join('&');
                const ageData = await fetchBDL(
                    `data/by-unit/000000000000?${ageVarIds}&format=json&${yearParams}`, apiKey
                );
                const baelAge = BAEL_AGE.map(e => {
                    const entry = ageData?.results?.find((r: { id: number }) => r.id === e.id);
                    const latest = getLatestVal(entry?.values);
                    const prev = getPrevVal(entry?.values, latest.year);
                    return { name: e.name, rate: latest.val, year: latest.year, prev };
                });

                // BAEL quarterly activity/employment/unemployment rate (P2567) — national
                const baelQVarIds = [
                    ...Object.values(BAEL_QUARTERLY.activityRate),
                    ...Object.values(BAEL_QUARTERLY.unemploymentRate),
                ].map(id => `var-id=${id}`).join('&');
                const baelQData = await fetchBDL(
                    `data/by-unit/000000000000?${baelQVarIds}&format=json&${yearParams}`, apiKey
                );

                type QuarterlyPoint = { quarter: string; value: number | null };
                function extractQuarterly(varIds: { q1: number; q2: number; q3: number; q4: number }): QuarterlyPoint[] {
                    const points: QuarterlyPoint[] = [];
                    const quarters = [
                        { key: 'q1', label: 'Q1', id: varIds.q1 },
                        { key: 'q2', label: 'Q2', id: varIds.q2 },
                        { key: 'q3', label: 'Q3', id: varIds.q3 },
                        { key: 'q4', label: 'Q4', id: varIds.q4 },
                    ];
                    for (const q of quarters) {
                        const entry = baelQData?.results?.find((r: { id: number }) => r.id === q.id);
                        if (entry?.values) {
                            for (const v of entry.values) {
                                if (v.val !== null) {
                                    points.push({ quarter: `${v.year} ${q.label}`, value: v.val });
                                }
                            }
                        }
                    }
                    return points.sort((a, b) => a.quarter.localeCompare(b.quarter));
                }

                const baelQuarterly = {
                    activityRate: extractQuarterly(BAEL_QUARTERLY.activityRate),
                    unemploymentRate: extractQuarterly(BAEL_QUARTERLY.unemploymentRate),
                };

                // ══════════ DYNAMIKA ══════════
                // Job vacancies (P4294) — national quarterly
                const vacVarIds = `var-id=${VACANCIES.count}&var-id=${VACANCIES.rate}`;
                const vacData = await fetchBDL(
                    `data/by-unit/000000000000?${vacVarIds}&format=json&${yearParams}`, apiKey
                );
                const vacancyCount = vacData?.results?.find((r: { id: number }) => r.id === VACANCIES.count);
                const vacancyRate = vacData?.results?.find((r: { id: number }) => r.id === VACANCIES.rate);
                const vacancyLatest = getLatestVal(vacancyCount?.values);
                const vacancyRateLatest = getLatestVal(vacancyRate?.values);

                const vacancies = {
                    count: vacancyLatest.val,
                    rate: vacancyRateLatest.val,
                    year: vacancyLatest.year,
                    history: (vacancyCount?.values || [])
                        .filter((v: { val: number | null }) => v.val !== null)
                        .sort((a: { year: number }, b: { year: number }) => a.year - b.year)
                        .map((v: { year: number; val: number }) => ({ year: v.year, value: v.val })),
                };

                // Job creation/destruction (P3441) — national annual
                const flowVarIds = `var-id=${JOBS_FLOW.created}&var-id=${JOBS_FLOW.destroyed}`;
                const flowData = await fetchBDL(
                    `data/by-unit/000000000000?${flowVarIds}&format=json&${yearParams}`, apiKey
                );
                const createdEntry = flowData?.results?.find((r: { id: number }) => r.id === JOBS_FLOW.created);
                const destroyedEntry = flowData?.results?.find((r: { id: number }) => r.id === JOBS_FLOW.destroyed);

                const jobsFlow = {
                    history: Array.from({ length: 6 }, (_, i) => {
                        const yr = currentYear - 5 + i;
                        const created = createdEntry?.values?.find((v: { year: number }) => v.year === yr)?.val ?? null;
                        const destroyed = destroyedEntry?.values?.find((v: { year: number }) => v.year === yr)?.val ?? null;
                        const net = created !== null && destroyed !== null ? +(created - destroyed).toFixed(1) : null;
                        return { year: yr, created, destroyed, net };
                    }).filter(x => x.created !== null || x.destroyed !== null),
                };

                // ══════════ BRANŻE ══════════
                // Employment by PKD sector (P2836) — national annual (in "etat" = full-time equiv.)
                const empVarIds = EMPLOYMENT_PKD.map(e => `var-id=${e.id}`).join('&');
                const empData = await fetchBDL(
                    `data/by-unit/000000000000?${empVarIds}&format=json&${yearParams}`, apiKey
                );
                const employmentByPKD = EMPLOYMENT_PKD.map(sector => {
                    const entry = empData?.results?.find((r: { id: number }) => r.id === sector.id);
                    const latest = getLatestVal(entry?.values);
                    const prev = getPrevVal(entry?.values, latest.year);
                    const yoy = latest.val && prev ? +((latest.val / prev - 1) * 100).toFixed(1) : null;
                    return { code: sector.code, name: sector.name, count: latest.val, year: latest.year, prev, yoy };
                });

                // ══════════ WYNAGRODZENIA ══════════
                // Quarterly wages for each region (P2504)
                const qWageVarIds = Object.values(QUARTERLY_WAGES).map(id => `var-id=${id}`).join('&');
                const quarterlyWages: Array<{
                    slug: string; name: string;
                    wages: Array<{ quarter: string; value: number | null }>;
                }> = [];

                // Fetch in batches of 4
                const regionBatches = [];
                for (let i = 0; i < REGIONS.length; i += 4) {
                    regionBatches.push(REGIONS.slice(i, i + 4));
                }

                for (const batch of regionBatches) {
                    const results = await Promise.all(
                        batch.map(async region => {
                            const d = await fetchBDL(
                                `data/by-unit/${region.id}?${qWageVarIds}&format=json&${yearParams}`, apiKey
                            );
                            const wages: Array<{ quarter: string; value: number | null }> = [];
                            const qLabels = [
                                { id: QUARTERLY_WAGES.q1, label: 'Q1' },
                                { id: QUARTERLY_WAGES.q2, label: 'Q2' },
                                { id: QUARTERLY_WAGES.q3, label: 'Q3' },
                                { id: QUARTERLY_WAGES.q4, label: 'Q4' },
                            ];
                            for (const q of qLabels) {
                                const entry = d?.results?.find((r: { id: number }) => r.id === q.id);
                                if (entry?.values) {
                                    for (const v of entry.values) {
                                        if (v.val !== null) {
                                            wages.push({ quarter: `${v.year} ${q.label}`, value: v.val });
                                        }
                                    }
                                }
                            }
                            wages.sort((a, b) => a.quarter.localeCompare(b.quarter));
                            return { slug: region.slug, name: region.name, wages };
                        })
                    );
                    quarterlyWages.push(...results);
                    // Rate limiting between batches
                    if (regionBatches.indexOf(batch) < regionBatches.length - 1) {
                        await new Promise(r => setTimeout(r, 800));
                    }
                }

                return {
                    // STRUKTURA
                    baelEducation,
                    baelAge,
                    baelQuarterly,
                    // DYNAMIKA
                    vacancies,
                    jobsFlow,
                    // BRANŻE
                    employmentByPKD,
                    // WYNAGRODZENIA
                    quarterlyWages,
                    // Meta
                    source: 'GUS BDL P3435+P3754+P2567+P4294+P3441+P2836+P2504',
                    timestamp: new Date().toISOString(),
                };
            },
            'GUS BDL Labor Extra v1',
            24 * 3600 * 1000 // 24h cache — auto-updates daily
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS Labor Extra error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
