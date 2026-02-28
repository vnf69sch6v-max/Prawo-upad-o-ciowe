// Eurostat API proxy — fetches macroeconomic data with JSON-stat v2 parsing
// https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const EUROSTAT_BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

// Pre-configured dataset definitions with correct parameters
const DATASETS: Record<string, { params: Record<string, string>; label: string; since?: string }> = {
    // CPI HICP — monthly annual rate of change (%)
    cpi: {
        params: { coicop: 'CP00' },
        label: 'HICP Inflation YoY',
        since: '2024-01',
    },
    // Unemployment — seasonally adjusted, % of active population
    unemployment: {
        params: { sex: 'T', age: 'TOTAL', s_adj: 'SA', unit: 'PC_ACT' },
        label: 'Unemployment Rate (SA)',
        since: '2024-01',
    },
    // GDP — quarterly, chain-linked volumes, % change vs previous quarter
    gdp_qoq: {
        params: { na_item: 'B1GQ', s_adj: 'SCA', unit: 'CLV_PCH_PRE' },
        label: 'GDP QoQ Growth',
        since: '2023-Q1',
    },
    // GDP — quarterly, YoY growth (same quarter previous year)
    gdp_yoy: {
        params: { na_item: 'B1GQ', s_adj: 'NSA', unit: 'CLV_PCH_SM' },
        label: 'GDP YoY Growth',
        since: '2023-Q1',
    },
    // Industrial production — monthly, YoY change
    industrial: {
        params: { nace_r2: 'B-D', s_adj: 'SCA', unit: 'PCH_SM' },
        label: 'Industrial Production YoY',
        since: '2024-01',
    },
    // Retail sales — monthly, YoY change
    retail: {
        params: { nace_r2: 'G47', s_adj: 'SCA', unit: 'PCH_SM' },
        label: 'Retail Sales YoY',
        since: '2024-01',
    },
    // Trade — goods exports (monthly, mln EUR) via Balance of Payments
    exports: {
        params: { bop_item: 'G', stk_flow: 'CRE', currency: 'MIO_EUR', partner: 'WRL_REST', sectpart: 'S1', sector10: 'S1' },
        label: 'Goods Exports (mln EUR)',
        since: '2024-01',
    },
    // Trade — goods imports
    imports: {
        params: { bop_item: 'G', stk_flow: 'DEB', currency: 'MIO_EUR', partner: 'WRL_REST', sectpart: 'S1', sector10: 'S1' },
        label: 'Goods Imports (mln EUR)',
        since: '2024-01',
    },
    // Current account — monthly, mln EUR
    current_account: {
        params: { bop_item: 'CA', currency: 'MIO_EUR', partner: 'WRL_REST', stk_flow: 'BAL', sectpart: 'S1', sector10: 'S1' },
        label: 'Current Account Balance (mln EUR)',
        since: '2024-01',
    },
};

// Eurostat dataset code mapping
const DATASET_CODES: Record<string, string> = {
    cpi: 'prc_hicp_manr',
    unemployment: 'une_rt_m',
    gdp_qoq: 'namq_10_gdp',
    gdp_yoy: 'namq_10_gdp',
    industrial: 'sts_inpr_m',
    retail: 'sts_trtu_m',
    exports: 'bop_c6_m',
    imports: 'bop_c6_m',
    current_account: 'bop_c6_m',
};

interface EurostatTimeSeries {
    date: string;
    value: number | null;
}

interface EurostatResponse {
    dataset: string;
    label: string;
    geo: string[];
    updated: string;
    data: Record<string, EurostatTimeSeries[]>; // keyed by geo code
    source: string;
}

// Parse Eurostat JSON-stat v2 response
function parseJsonStat(
    raw: Record<string, unknown>,
    since?: string
): Record<string, EurostatTimeSeries[]> {
    const dimensions = raw.dimension as Record<string, {
        category: { index: Record<string, number>; label?: Record<string, string> };
    }>;
    const values = raw.value as Record<string, number>;
    const dimensionIds = raw.id as string[];
    const dimensionSizes = raw.size as number[];

    // Find time and geo dimension indices
    const timeIdx = dimensionIds.indexOf('time');
    const geoIdx = dimensionIds.indexOf('geo');

    if (timeIdx === -1) throw new Error('No time dimension found');

    const timeCats = dimensions.time.category.index;
    const sortedTimes = Object.entries(timeCats).sort((a, b) => a[1] - b[1]);

    // Get geo categories
    const geoCats = geoIdx !== -1
        ? Object.entries(dimensions.geo.category.index).sort((a, b) => a[1] - b[1])
        : [['PL', 0] as [string, number]];

    const result: Record<string, EurostatTimeSeries[]> = {};

    for (const [geoCode, geoPosition] of geoCats) {
        const series: EurostatTimeSeries[] = [];

        for (const [timeLabel, timePosition] of sortedTimes) {
            // Filter by since parameter
            if (since && timeLabel < since) continue;

            // Calculate flat index from multi-dimensional position
            // Index = sum of (position_i * product_of_subsequent_sizes)
            let flatIndex = 0;
            for (let d = 0; d < dimensionIds.length; d++) {
                let position: number;
                if (d === timeIdx) {
                    position = timePosition;
                } else if (d === geoIdx) {
                    position = geoPosition as number;
                } else {
                    // For filtered dimensions (single value), position = 0
                    position = 0;
                }

                let multiplier = 1;
                for (let j = d + 1; j < dimensionSizes.length; j++) {
                    multiplier *= dimensionSizes[j];
                }
                flatIndex += position * multiplier;
            }

            const val = values[String(flatIndex)];
            series.push({
                date: timeLabel,
                value: val !== undefined ? val : null,
            });
        }

        result[geoCode] = series.filter(s => s.value !== null);
    }

    return result;
}

async function fetchEurostat(
    datasetCode: string,
    params: Record<string, string>,
    geo: string[],
    since?: string
): Promise<EurostatResponse> {
    const searchParams = new URLSearchParams({
        format: 'JSON',
        lang: 'en',
        ...params,
        geo: geo.join(','),
    });

    const url = `${EUROSTAT_BASE}/${datasetCode}?${searchParams}`;
    const res = await fetch(url, { next: { revalidate: 43200 } }); // 12h revalidation

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Eurostat API error ${res.status}: ${text.slice(0, 200)}`);
    }

    const raw = await res.json();

    if (raw.error) {
        throw new Error(`Eurostat error: ${JSON.stringify(raw.error)}`);
    }

    const data = parseJsonStat(raw, since);

    return {
        dataset: datasetCode,
        label: (raw.label as string) || datasetCode,
        geo,
        updated: (raw.updated as string) || new Date().toISOString(),
        data,
        source: 'Eurostat',
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get('indicator'); // predefined: cpi, unemployment, gdp_qoq, etc.
    const dataset = searchParams.get('dataset');     // raw dataset code
    const geo = searchParams.get('geo') || 'PL';
    const since = searchParams.get('since');

    try {
        // If predefined indicator
        if (indicator && DATASETS[indicator]) {
            const config = DATASETS[indicator];
            const datasetCode = DATASET_CODES[indicator];
            const geoList = geo.split(',');
            const sinceFilter = since || config.since;

            const result = await withCache<EurostatResponse>(
                'eurostat',
                `${indicator}_${geo}_${sinceFilter}`,
                () => fetchEurostat(datasetCode, config.params, geoList, sinceFilter),
                'Eurostat API',
                12 * 3600 * 1000 // 12h cache
            );

            return NextResponse.json({
                ...result,
                indicator,
                indicatorLabel: config.label,
            });
        }

        // If raw dataset code
        if (dataset) {
            const rawParams: Record<string, string> = {};
            searchParams.forEach((val, key) => {
                if (!['dataset', 'format', 'geo', 'since'].includes(key)) {
                    rawParams[key] = val;
                }
            });

            const geoList = geo.split(',');
            const cacheKey = `raw_${dataset}_${geo}_${JSON.stringify(rawParams)}`;

            const result = await withCache<EurostatResponse>(
                'eurostat',
                cacheKey.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 100),
                () => fetchEurostat(dataset, rawParams, geoList, since || undefined),
                'Eurostat API',
                12 * 3600 * 1000
            );

            return NextResponse.json(result);
        }

        // No params — return available indicators
        return NextResponse.json({
            available: Object.entries(DATASETS).map(([key, cfg]) => ({
                indicator: key,
                datasetCode: DATASET_CODES[key],
                label: cfg.label,
                usage: `/api/eurostat?indicator=${key}&geo=PL`,
            })),
        });

    } catch (error) {
        console.error('Eurostat API error:', error);
        return NextResponse.json({
            error: String(error),
            source: 'Eurostat API',
        }, { status: 500 });
    }
}
