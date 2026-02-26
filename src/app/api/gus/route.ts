// GUS BDL API proxy — fetches macroeconomic data with correct variable IDs
// Variable IDs confirmed from BDL API:
//   CPI: 217230 (subject P2955) — annual, prev year = 100
//   Unemployment: 60270 (subject P2392) — annual %
//   GDP growth: 458272 (subject P3498) — annual, prev year = 100

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// Key variable IDs from GUS BDL
const VARIABLE_IDS = {
    cpi: '217230',           // Wskaźniki cen towarów i usług konsumpcyjnych - ogółem
    cpi_food: '217231',      // CPI - żywność
    cpi_housing: '217234',   // CPI - mieszkanie  
    cpi_transport: '217236', // CPI - transport
    unemployment: '60270',   // Stopa bezrobocia rejestrowanego - ogółem
    gdp_total: '458271',     // PKB ogółem (mln zł)
    gdp_growth: '458272',    // Dynamika PKB (prev year = 100)
};

async function fetchBDL(endpoint: string, apiKey?: string): Promise<unknown> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (apiKey) headers['X-ClientId'] = apiKey;

    const res = await fetch(`${GUS_BASE}/${endpoint}`, {
        headers,
        next: { revalidate: 86400 }, // Cache 24h
    });

    if (!res.ok) {
        throw new Error(`GUS API ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get('indicator'); // cpi, unemployment, gdp_growth, etc.
    const varId = searchParams.get('var-id');        // direct variable ID
    const years = searchParams.get('years') || '10'; // how many years of data

    const apiKey = process.env.GUS_API_KEY;

    try {
        // If direct variable ID is provided, use it
        const targetVarId = varId || (indicator ? VARIABLE_IDS[indicator as keyof typeof VARIABLE_IDS] : null);

        if (!targetVarId && !indicator) {
            // Return available indicators
            return NextResponse.json({
                available_indicators: Object.keys(VARIABLE_IDS),
                usage: '/api/gus?indicator=cpi or /api/gus?var-id=217230',
            });
        }

        if (indicator === 'all') {
            // Fetch all key indicators at once — with cache
            const allData = await withCache(
                'macro_data',
                `gus_all_${years}`,
                async () => {
                    const results: Record<string, unknown> = {};
                    const entries = Object.entries(VARIABLE_IDS);
                    await Promise.all(
                        entries.map(async ([key, vid]) => {
                            try {
                                results[key] = await fetchBDL(
                                    `data/by-variable/${vid}?unit-level=0&format=json&page-size=${years}`,
                                    apiKey
                                );
                            } catch (err) {
                                results[key] = { error: String(err) };
                            }
                        })
                    );
                    return { timestamp: new Date().toISOString(), indicators: results };
                },
                'GUS BDL API',
                24 * 3600 * 1000
            );
            return NextResponse.json(allData);
        }

        if (!targetVarId) {
            return NextResponse.json({ error: `Unknown indicator: ${indicator}` }, { status: 400 });
        }

        // Fetch single indicator — with cache
        const data = await withCache(
            'macro_data',
            `gus_${targetVarId}_${years}`,
            () => fetchBDL(
                `data/by-variable/${targetVarId}?unit-level=0&format=json&page-size=${years}`,
                apiKey
            ),
            'GUS BDL API',
            24 * 3600 * 1000
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS API error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
