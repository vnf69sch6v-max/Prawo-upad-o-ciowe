// SMUP proxy — System Monitorowania Usług Publicznych (api.smup.gov.pl).
// Hierarchical: areas-list → indicators-list?id={area} → indicator-date-data?id={indicator}.
// Same X-ClientId auth pattern as GUS BDL.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const SMUP_BASE = 'https://api.smup.gov.pl/api/1.0.0';

const ALLOWED = new Set([
    'areas-list', 'indicators-list', 'indicator-list', 'indicator-date-data',
    'public-services', 'public-services-flashcard', 'variables-list',
    'teryt-dictionary', 'data-dictionary', 'flag-dictionary',
    'area-flashcard', 'indicator-flashcard', 'version',
]);

const PASS_PARAMS = ['id', 'id-daty', 'filters', 'sorts', 'page', 'page-size', 'teryt'];

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const resource = sp.get('resource') || 'areas-list';

    if (!ALLOWED.has(resource)) {
        return NextResponse.json({ error: `Nieznany zasób SMUP: ${resource}`, allowed: [...ALLOWED] }, { status: 400 });
    }

    const key = process.env.SMUP_API_KEY;
    const qs = new URLSearchParams();
    for (const p of PASS_PARAMS) {
        const v = sp.get(p);
        if (v) qs.set(p, v);
    }
    qs.set('lang', sp.get('lang') || 'pl');

    const cacheKey = `smup_${resource}_${qs.toString()}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 120);

    try {
        const data = await withCache(
            'smup',
            cacheKey,
            async () => {
                const res = await fetch(`${SMUP_BASE}/${resource}?${qs}`, {
                    headers: { 'X-ClientId': key ?? '', Accept: 'application/json' },
                    next: { revalidate: 86400 },
                });
                if (res.status === 429) {
                    await new Promise((r) => setTimeout(r, 12000));
                    const retry = await fetch(`${SMUP_BASE}/${resource}?${qs}`, { headers: { 'X-ClientId': key ?? '', Accept: 'application/json' } });
                    if (!retry.ok) throw new Error(`SMUP rate limited: ${retry.status}`);
                    return retry.json();
                }
                if (!res.ok) throw new Error(`SMUP API ${res.status}`);
                return res.json();
            },
            'SMUP API',
            24 * 3600 * 1000,
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('SMUP API error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
