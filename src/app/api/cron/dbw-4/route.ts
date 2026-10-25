// Cron DBW grupa 4 (harmonogram 11:40 UTC — wskaźniki krótkookresowe Przeglądu i Gospodarki). Lista endpointów: src/lib/cron-endpoints.ts.
// `maxDuration` ≥ suma limitów wywoływanych tras + odstępy + 10 s (3 × 60 + 3 × 1,5 + 10 = 194,5) — inaczej Vercel ucina
// crona, zanim zapisze przebieg w dzienniku (test: tests/function-limits.test.ts).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';

export const maxDuration = 200;

export async function GET(request: NextRequest) {
    return warmEndpoints(request, [...CRON_ENDPOINTS['dbw-4']], 'dbw-4');
}
