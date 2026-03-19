// GUS BDL Monthly Indicators — for GDP Nowcasting
// Retail sales dynamics per month from P3860 (prev year = 100)
// Wage levels per month from P2687 (PLN, compute YoY growth)

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// P3860: Retail sales dynamics (prev year = 100), ogółem
// Pattern: dynamics ogółem IDs, stride +20 per month
const RETAIL_DYNAMICS_IDS: Record<string, number> = {
    '01': 1542340, '02': 1542360, '03': 1542380, '04': 1542400,
    '05': 1542420, '06': 1542440, '07': 1542460, '08': 1542480,
    '09': 1542500, '10': 1542520, '11': 1542540, '12': 1542560,
};

// P2687: Monthly enterprise wages (PLN), ogółem
// IDs sequential: 154487 (Jan) through 154498 (Dec)
const WAGE_IDS: Record<string, number> = {
    '01': 154487, '02': 154488, '03': 154489, '04': 154490,
    '05': 154491, '06': 154492, '07': 154493, '08': 154494,
    '09': 154495, '10': 154496, '11': 154497, '12': 154498,
};

interface MonthlyDataPoint {
    date: string;
    value: number;     // YoY % change
    raw: number;       // raw GUS value
}

interface GUSMonthlyResult {
    retail: MonthlyDataPoint[];
    wages: MonthlyDataPoint[];
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

// Fetch retail dynamics (prev year = 100 → value = raw - 100)
async function fetchRetailMonthly(apiKey?: string, years: number = 4): Promise<MonthlyDataPoint[]> {
    const currentYear = new Date().getFullYear();
    const yearParams = Array.from({ length: years }, (_, i) => `year=${currentYear - years + 1 + i}`).join('&');
    const results: MonthlyDataPoint[] = [];

    await Promise.all(
        Object.entries(RETAIL_DYNAMICS_IDS).map(async ([month, varId]) => {
            try {
                const data = await fetchBDL(
                    `data/by-variable/${varId}?unit-level=0&format=json&${yearParams}`, apiKey
                ) as { results?: Array<{ values: Array<{ year: number; val: number | null }> }> };
                for (const v of (data?.results?.[0]?.values ?? [])) {
                    if (v.val !== null) {
                        results.push({
                            date: `${v.year}-${month}`,
                            value: +(v.val - 100).toFixed(1),
                            raw: v.val,
                        });
                    }
                }
            } catch (err) { console.error(`GUS retail ${month}:`, err); }
        })
    );
    results.sort((a, b) => a.date.localeCompare(b.date));
    return results;
}

// Fetch wages (absolute PLN) then compute YoY % growth
async function fetchWagesMonthly(apiKey?: string, years: number = 4): Promise<MonthlyDataPoint[]> {
    const currentYear = new Date().getFullYear();
    // Need extra year for YoY calculation
    const yearParams = Array.from({ length: years + 1 }, (_, i) => `year=${currentYear - years + i}`).join('&');

    // Collect raw wage data: { "YYYY-MM": PLN }
    const rawMap: Record<string, number> = {};

    await Promise.all(
        Object.entries(WAGE_IDS).map(async ([month, varId]) => {
            try {
                const data = await fetchBDL(
                    `data/by-variable/${varId}?unit-level=0&format=json&${yearParams}`, apiKey
                ) as { results?: Array<{ values: Array<{ year: number; val: number | null }> }> };
                for (const v of (data?.results?.[0]?.values ?? [])) {
                    if (v.val !== null) {
                        rawMap[`${v.year}-${month}`] = v.val;
                    }
                }
            } catch (err) { console.error(`GUS wages ${month}:`, err); }
        })
    );

    // Compute YoY % growth
    const results: MonthlyDataPoint[] = [];
    const sortedDates = Object.keys(rawMap).sort();
    for (const date of sortedDates) {
        const [y, m] = date.split('-');
        const prevYearDate = `${parseInt(y) - 1}-${m}`;
        if (rawMap[prevYearDate]) {
            const yoy = ((rawMap[date] / rawMap[prevYearDate]) - 1) * 100;
            results.push({
                date,
                value: +yoy.toFixed(1),
                raw: rawMap[date],
            });
        }
    }
    return results;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '4');
    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;

    try {
        const data = await withCache<GUSMonthlyResult>(
            'macro_data',
            `gus_monthly_v2_${years}`,
            async () => {
                const [retail, wages] = await Promise.all([
                    fetchRetailMonthly(apiKey, years),
                    fetchWagesMonthly(apiKey, years),
                ]);
                return {
                    retail, wages,
                    source: 'GUS BDL P3860+P2687',
                    timestamp: new Date().toISOString(),
                };
            },
            'GUS BDL Monthly v2',
            24 * 3600 * 1000
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS Monthly error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
