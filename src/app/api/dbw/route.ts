// DBW proxy — Dziedzinowe Bazy Wiedzy GUS (api-dbw.stat.gov.pl, no API key).
// Source for monthly CPI/PPI/prices + business-tendency (koniunktura).
// Rate-limited (429) → cache aggressively + back off.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW_BASE = 'https://api-dbw.stat.gov.pl/api/1.1.0';

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const varId = sp.get('var');
    const przekroj = sp.get('przekroj');
    if (!varId || !przekroj) {
        return NextResponse.json({ error: 'Wymagane parametry: var, przekroj' }, { status: 400 });
    }

    const years = sp.getAll('rok');
    const okresy = sp.getAll('okres');
    const pageSize = sp.get('page-size') || '5000';

    const qs = new URLSearchParams();
    qs.set('id-zmienna', varId);
    qs.set('id-przekroj', przekroj);
    years.forEach((y) => qs.append('id-rok', y));
    okresy.forEach((o) => qs.append('id-okres', o));
    qs.set('ile-na-stronie', pageSize);
    qs.set('numer-strony', '0');
    qs.set('lang', 'pl');

    const cacheKey = `dbw_${varId}_${przekroj}_${years.join('-')}_${okresy.join('-')}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const url = `${DBW_BASE}/variable/variable-data-section?${qs}`;

    try {
        const data = await withCache(
            'dbw',
            cacheKey,
            async () => {
                const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
                if (res.status === 429) {
                    await new Promise((r) => setTimeout(r, 3500));
                    const retry = await fetch(url, { headers: { Accept: 'application/json' } });
                    if (!retry.ok) throw new Error(`DBW rate limited: ${retry.status}`);
                    return retry.json();
                }
                if (!res.ok) throw new Error(`DBW API ${res.status}`);
                return res.json();
            },
            'DBW API',
            24 * 3600 * 1000,
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('DBW API error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
