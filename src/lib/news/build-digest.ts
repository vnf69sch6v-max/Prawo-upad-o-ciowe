import { readNewsArchive } from '@/lib/news/archive';
import { buildDailyDigest, type MacroChange } from '@/lib/news/daily';
import { saveDailyDigest } from '@/lib/news/digest-store';
import { makeDigestSummary } from '@/lib/news/summary';
import type { NewsItem } from '@/lib/news/types';

/**
 * Zbuduj digest z archiwum dnia i zapisz w Firestore.
 * Wymaga wcześniejszego merge (np. `refreshAndMergeTodayArchive` w cronie digest) —
 * samo odczytanie pustego archiwum daje `punkty: []` / points:0.
 *
 * `itemsOverride` — pozycje z właśnie zmergowanego archiwum (in-memory).
 * Cron przekazuje je wprost, żeby nie zależeć od ponownego odczytu Firestore
 * (`setServerCache` po cichu łyka błąd zapisu).
 */
export async function buildAndSaveDigest(
    date: string,
    macro: MacroChange[] = [],
    itemsOverride?: NewsItem[],
) {
    const items = (itemsOverride ?? (await readNewsArchive(date))?.items ?? []) as NewsItem[];
    const digest = buildDailyDigest(items, date, macro);

    // Warstwa 2 — akapit. `makeDigestSummary` z założenia nie rzuca (każda ścieżka błędu kończy
    // się szablonem), ale łapiemy i tak: digest MA się zapisać nawet gdyby ta obietnica pękła.
    try {
        digest.podsumowanie = await makeDigestSummary(digest);
    } catch (err) {
        console.error('[build-digest] podsumowanie pominięte:', err instanceof Error ? err.message : err);
    }

    await saveDailyDigest(digest);
    return digest;
}
