// Cron job: Fetch & cache GUS BDL data (macro indicators)
// Schedule: Monday 11:00 CET
import { NextResponse } from 'next/server';

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

export async function GET() {
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
