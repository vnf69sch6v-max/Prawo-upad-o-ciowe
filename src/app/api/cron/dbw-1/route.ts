// Cron DBW grupa 1 (harmonogram 09:40 UTC — po komunikatach GUS o 10:00 czasu PL). Lista endpointów: src/lib/cron-endpoints.ts.
// `maxDuration` ≥ suma limitów wywoływanych tras + odstępy + 10 s (120 + 60 + 2 × 1,5 + 10 = 193) — inaczej Vercel ucina
// crona, zanim zapisze przebieg w dzienniku (test: tests/function-limits.test.ts).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';

export const maxDuration = 200;

export async function GET(request: NextRequest) {
    return warmEndpoints(request, [...CRON_ENDPOINTS['dbw-1']], 'dbw-1');
}
