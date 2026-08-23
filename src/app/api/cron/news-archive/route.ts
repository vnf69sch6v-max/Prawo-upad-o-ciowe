/**
 * Cron: backup archiwum newsów dnia (Europe/Warsaw).
 *
 * Vercel Hobby: maksymalnie JEDEN cron dziennie na ścieżkę — harmonogram co 2h ODRZUCA deploy.
 * Dlatego:
 *  1. Digest (16:05 UTC) sam robi refresh+merge PRZED buildem — to główna ścieżka na dzień D.
 *  2. Merge w `/api/news?refresh=1` (await!) — warm cron/refresh też buduje archiwum.
 *  3. Ten cron = backup wieczorny (22:00 Warszawy latem ≈ 20:00 UTC), po digescie.
 * Na Pro można dodać osobny wpis co 2h — Hobby tego nie przeżyje.
 */
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // `?refresh=1` OBOWIĄZKOWO (ROADMAP) — inaczej trafiamy w TTL 15 min i nic nie mergujemy.
    return warmEndpoints(request, ['/api/news?refresh=1'], 'news-archive', 0);
}
