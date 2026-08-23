import { readNewsArchive } from '@/lib/news/archive';
import { buildDailyDigest, type MacroChange } from '@/lib/news/daily';
import { saveDailyDigest } from '@/lib/news/digest-store';
import type { NewsItem } from '@/lib/news/types';

/**
 * Zbuduj digest z archiwum dnia i zapisz w Firestore.
 * Wymaga wcześniejszego merge (np. `refreshAndMergeTodayArchive` w cronie digest) —
 * samo odczytanie pustego archiwum daje `punkty: []` / points:0.
 */
export async function buildAndSaveDigest(date: string, macro: MacroChange[] = []) {
    const archive = await readNewsArchive(date);
    const items = (archive?.items ?? []) as NewsItem[];
    const digest = buildDailyDigest(items, date, macro);
    await saveDailyDigest(digest);
    return digest;
}
