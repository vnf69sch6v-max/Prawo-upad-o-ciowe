// GUS BDL Monthly Indicators — for GDP Nowcasting
// Retail sales dynamics per month from P3860 (prev year = 100)
// Also fetches annual industrial production + construction for YoY calc

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// P3860: Retail sales dynamics (prev year = 100), ogółem
// Pattern: first ogółem ID = 1542339 (nominal), 1542340 (dynamics)
// Stride: +20 per month (10 categories × 2 types)
const RETAIL_DYNAMICS_IDS: Record<string, number> = {
    '01': 1542340, // styczeń
    '02': 1542360, // luty
    '03': 1542380, // marzec
    '04': 1542400, // kwiecień
    '05': 1542420, // maj
    '06': 1542440, // czerwiec
    '07': 1542460, // lipiec
    '08': 1542480, // sierpień
    '09': 1542500, // wrzesień
    '10': 1542520, // październik
    '11': 1542540, // listopad
    '12': 1542560, // grudzień
};

interface MonthlyDataPoint {
    date: string;      // YYYY-MM
    value: number;     // YoY % change (dynamics - 100)
    raw: number;       // raw GUS value (prev year = 100)
}

interface GUSMonthlyResult {
    retail: MonthlyDataPoint[];
    source: string;
    timestamp: string;
}

async function fetchBDL(endpoint: string, apiKey?: string): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;

    const res = await fetch(`${GUS_BASE}/${endpoint}`, {
        headers,
        next: { revalidate: 86400 },
    });

    if (res.status === 429) {
        await new Promise(r => setTimeout(r, 10000));
        const retry = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
        if (!retry.ok) throw new Error(`GUS rate limited: ${retry.status}`);
        return retry.json();
    }
    if (!res.ok) throw new Error(`GUS API ${res.status}`);
    return res.json();
}

async function fetchRetailMonthly(apiKey?: string, years: number = 4): Promise<MonthlyDataPoint[]> {
    const currentYear = new Date().getFullYear();
    const yearParams = Array.from({ length: years }, (_, i) => `year=${currentYear - years + 1 + i}`).join('&');

    const results: MonthlyDataPoint[] = [];

    // Fetch all 12 months in parallel
    const entries = Object.entries(RETAIL_DYNAMICS_IDS);
    await Promise.all(
        entries.map(async ([month, varId]) => {
            try {
                const data = await fetchBDL(
                    `data/by-variable/${varId}?unit-level=0&format=json&${yearParams}`,
                    apiKey
                ) as { results?: Array<{ values: Array<{ year: number; val: number | null }> }> };

                const vals = data?.results?.[0]?.values ?? [];
                for (const v of vals) {
                    if (v.val !== null) {
                        results.push({
                            date: `${v.year}-${month}`,
                            value: +(v.val - 100).toFixed(1), // 106.1 → +6.1
                            raw: v.val,
                        });
                    }
                }
            } catch (err) {
                console.error(`GUS retail ${month} error:`, err);
            }
        })
    );

    // Sort chronologically
    results.sort((a, b) => a.date.localeCompare(b.date));
    return results;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '4');
    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;

    try {
        const data = await withCache<GUSMonthlyResult>(
            'macro_data',
            `gus_monthly_retail_${years}`,
            async () => {
                const retail = await fetchRetailMonthly(apiKey, years);
                return {
                    retail,
                    source: 'GUS BDL P3860',
                    timestamp: new Date().toISOString(),
                };
            },
            'GUS BDL Monthly',
            24 * 3600 * 1000
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS Monthly error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
