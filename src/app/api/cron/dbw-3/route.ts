// Cron DBW grupa 3 (harmonogram 15:40 UTC). Lista endpointów: src/lib/cron-endpoints.ts.
// `maxDuration` ≥ suma limitów wywoływanych tras + odstępy + 10 s (3 × 60 + 3 × 1,5 + 10 = 194,5; od P4 trzecia trasa: bezrobocie rejestrowane) — inaczej Vercel ucina
// crona, zanim zapisze przebieg w dzienniku (test: tests/function-limits.test.ts).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';

export const maxDuration = 200;

export async function GET(request: NextRequest) {
    return warmEndpoints(request, [...CRON_ENDPOINTS['dbw-3']], 'dbw-3');
}
