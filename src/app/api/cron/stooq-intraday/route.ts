// Cron: odświeżenie notowań GPW w trakcie sesji (backup gdy nikt nie ma otwartej zakładki).
// Harmonogram: pn–pt 14:00 UTC ≈ 16:00 CEST — przed zamknięciem i przed Daily Digest (16:05 UTC).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 120;

const ENDPOINTS = [
    '/api/stooq?symbol=wig20&limit=60&refresh=1',
    '/api/stooq?symbol=mwig40&limit=60&refresh=1',
    '/api/stooq?symbol=swig80&limit=60&refresh=1',
    '/api/wig20?refresh=1',
    '/api/stooq?symbol=2ypl.b&limit=30&refresh=1',
    '/api/stooq?symbol=5ypl.b&limit=30&refresh=1',
    '/api/stooq?symbol=10ypl.b&limit=30&refresh=1',
];

export async function GET(request: NextRequest) {
    return warmEndpoints(request, ENDPOINTS, 'rynki-intraday', 400);
}
