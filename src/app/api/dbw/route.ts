// DBW proxy — Dziedzinowe Bazy Wiedzy GUS (api-dbw.stat.gov.pl, no API key).
// Żaden kod serwisu tej trasy nie woła. Było otwartym proxy (każda kombinacja = wywołanie DBW i nowy klucz cache
// przy wspólnym limicie ~100 / 15 min), więc przepuszcza już tylko var/przekrój serii z `DBW_SERIES`, rok wg tej
// samej reguły co reszta tras GUS i jeden znany okres. Usunięcie trasy to decyzja właściciela (ROADMAP).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { badParam, parseDbwProxy } from '@/lib/gus-params';

const DBW_BASE = 'https://api-dbw.stat.gov.pl/api/1.1.0';

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const parsed = parseDbwProxy(sp);
    if (!parsed.ok) return badParam(parsed);
    const { var: varId, przekroj, year, okres } = parsed.value;

    const qs = new URLSearchParams();
    qs.set('id-zmienna', String(varId));
    qs.set('id-przekroj', String(przekroj));
    qs.append('id-rok', String(year.year));
    if (okres != null) qs.append('id-okres', String(okres));
    qs.set('ile-na-stronie', '5000');
    qs.set('numer-strony', '0');
    qs.set('lang', 'pl');

    const cacheKey = `dbw_${varId}_${przekroj}_${year.year}_${okres ?? ''}`;
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
