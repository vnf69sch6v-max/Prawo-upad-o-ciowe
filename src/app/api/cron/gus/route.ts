// Cron job: Fetch & cache GUS BDL data (macro indicators)
// Schedule: Monday 11:00 CET
import { NextRequest, NextResponse } from 'next/server';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

async function fetchGUS(endpoint: string): Promise<unknown | null> {
    try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (process.env.GUS_API_KEY) headers['X-ClientId'] = process.env.GUS_API_KEY;

        const res = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
        if (res.ok) return res.json();
    } catch { /* skip */ }
    return null;
}

export async function GET(request: NextRequest) {
    // Jak w cron-warm: z CRON_SECRET tylko Vercel Cron (Authorization: Bearer …) — inaczej każdy mógłby w pętli
    // zużywać przez nasz serwer limit GUS BDL i GUS_API_KEY.
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const results: Record<string, string> = {};

    // Fetch subjects list (for reference)
    const subjects = await fetchGUS('subjects');
    results.subjects = subjects ? 'ok' : 'failed';

    return NextResponse.json({
        status: 'success',
        timestamp: new Date().toISOString(),
        results,
        note: 'GUS BDL requires specific variable IDs. Configure IDs in Firestore metadata for automated updates.',
    });
}
