/**
 * Cron: backup archiwum newsów dnia (Europe/Warsaw).
 *
 * Vercel Hobby: maksymalnie JEDEN cron dziennie na ścieżkę — harmonogram co 2h ODRZUCA deploy.
 * Dlatego:
 *  1. Główna ścieżka zapisu = merge w `/api/news?refresh=1` (każdy warm cron/refresh buduje archiwum).
 *  2. Ten cron = raz dziennie backup (22:00 czasu Warszawy latem ≈ 20:00 UTC).
 * Na Pro można dodać osobny wpis co 2h — Hobby tego nie przeżyje.
 */
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // `?refresh=1` OBOWIĄZKOWO (ROADMAP) — inaczej trafiamy w TTL 15 min i nic nie mergujemy.
    return warmEndpoints(request, ['/api/news?refresh=1'], 'news-archive', 0);
}
