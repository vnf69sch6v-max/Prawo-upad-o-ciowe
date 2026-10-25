// Cron DBW grupa 3 (harmonogram 15:40 UTC). Lista endpointów: src/lib/cron-endpoints.ts.
// `maxDuration` ≥ suma limitów wywoływanych tras + odstępy + 10 s (60 + 60 + 2 × 1,5 + 10 = 133) — inaczej Vercel ucina
// crona, zanim zapisze przebieg w dzienniku (test: tests/function-limits.test.ts).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';

export const maxDuration = 140;

export async function GET(request: NextRequest) {
    return warmEndpoints(request, [...CRON_ENDPOINTS['dbw-3']], 'dbw-3');
}
