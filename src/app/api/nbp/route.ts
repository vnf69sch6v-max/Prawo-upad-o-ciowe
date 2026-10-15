// NBP API Proxy — tables, single-currency history, gold. Firestore cache.
//
// UWAGA — dwie pułapki, przez które produkcja serwowała tabelę A z 24.09 jeszcze 02.10:
// 1. `exchangerates/tables/a/today` to RUCHOMY cel pod STAŁYM URL-em. Każda warstwa cache'u
//    kluczowana URL-em trzyma „dzisiejszą" tabelę z dnia, w którym ją zapisała. Pytamy więc
//    o `tables/{t}/` — NBP zwraca wtedy ostatnią opublikowaną tabelę (dziś albo poprzednią).
// 2. `fetch(..., { next: { revalidate } })` to Data Cache Next.js w trybie stale-while-revalidate:
//    pierwsze żądanie po wygaśnięciu dostaje STARĄ odpowiedź. Fetcher `withCache` zapisywał ją
//    do Firestore ze świeżym `updatedAt`, więc stare dane udawały świeże — także w cronie
//    z `?refresh=1`. Cache'em jest Firestore (TTL z `nbpCacheTtlMs`), upstream zawsze `no-store`.
// 3. Wpis zapisany rano jest ważny 6 h, więc po publikacji (12:15) dalej oddawał wczorajszą tabelę,
//    dopóki ktoś nie trafił w okno 12:15–14:00 albo nie przyszedł cron nbp. Dlatego po 12:15 wpis
//    z datą sprzed dziś jest sprawdzany u źródła (`nbpBehindToday`), najwyżej co 10 min.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { nbpBehindToday, nbpCacheTtlMs } from '@/lib/market-hours';

const NBP_BASE = 'https://api.nbp.pl/api';
/** Ponowne sprawdzenie u źródła, gdy NBP się spóźnia albo jest święto (tabeli dziś nie będzie). */
const NBP_RECHECK_MS = 10 * 60 * 1000;

type Mode = 'gold' | 'history' | 'table' | 'raw';

/** Najnowsza data notowania w odpowiedzi (tabela: `effectiveDate`; złoto: `data`). */
function latestNbpDate(data: unknown, mode: Mode): string | null {
    if (!Array.isArray(data) || !data.length) return null;
    if (mode === 'table') return (data[0] as { effectiveDate?: string })?.effectiveDate ?? null;
    const last = data[data.length - 1] as { effectiveDate?: string; data?: string } | null;
    if (mode === 'gold') return last?.data ?? null;
    if (mode === 'history') return last?.effectiveDate ?? null;
    return null;
}

async function fetchNBP(endpoint: string, fallback?: string): Promise<unknown> {
    const res = await fetch(`${NBP_BASE}/${endpoint}/?format=json`, { cache: 'no-store' });
    if (res.ok) return res.json();

    if (res.status === 404 && fallback) {
        const fb = await fetch(`${NBP_BASE}/${fallback}/?format=json`, { cache: 'no-store' });
        if (fb.ok) return fb.json();
    }
    throw new Error(`NBP API error: ${res.status}`);
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const table = sp.get('table');
    const code = sp.get('code');
    const last = sp.get('last');
    const gold = sp.get('gold');
    const force = sp.get('refresh') === '1'; // cron warm → wymuś refetch (pomiń cache)

    let endpoint: string;
    let fallback: string | undefined;
    let cacheKey: string;
    let mode: Mode;

    if (gold === 'true') {
        const n = last || '30';
        endpoint = `cenyzlota/last/${n}`;
        cacheKey = `gold_${n}`;
        mode = 'gold';
    } else if (code) {
        // Single-currency history: /exchangerates/rates/{table}/{code}/last/{n}
        const t = (table || 'a').toLowerCase();
        const n = last || '30';
        endpoint = `exchangerates/rates/${t}/${code.toLowerCase()}/last/${n}`;
        cacheKey = `hist_${t}_${code.toLowerCase()}_${n}`;
        mode = 'history';
    } else if (table) {
        // Ostatnia opublikowana tabela — NIE `/today` (patrz komentarz na górze pliku).
        endpoint = `exchangerates/tables/${table}`;
        cacheKey = `table_${table}`;
        mode = 'table';
    } else {
        // Backward-compatible endpoint/fallback form
        endpoint = sp.get('endpoint') || 'exchangerates/tables/a';
        fallback = sp.get('fallback') || 'exchangerates/tables/a/last/1';
        cacheKey = endpoint.replace(/\//g, '_');
        mode = 'raw';
    }

    const fetcher = async () => {
        const raw = await fetchNBP(endpoint, fallback);
        // Normalise currency history to a flat [{ no, effectiveDate, mid }] array
        if (mode === 'history') {
            const rates = (raw as { rates?: unknown[] })?.rates;
            return Array.isArray(rates) ? rates : [];
        }
        return raw; // table → [{ rates, ... }]; gold → [{ data, cena }]; raw → as-is
    };

    try {
        let data = await withCache('exchange_rates', cacheKey, fetcher, 'NBP API', force ? -1 : nbpCacheTtlMs());
        if (!force && nbpBehindToday(latestNbpDate(data, mode))) {
            data = await withCache('exchange_rates', cacheKey, fetcher, 'NBP API', NBP_RECHECK_MS);
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('NBP API error:', error);
        return NextResponse.json({ error: 'Failed to fetch NBP data' }, { status: 500 });
    }
}
