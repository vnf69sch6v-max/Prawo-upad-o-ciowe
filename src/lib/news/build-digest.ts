import { readNewsArchive } from '@/lib/news/archive';
import { buildDailyDigest, type MacroChange } from '@/lib/news/daily';
import { saveDailyDigest } from '@/lib/news/digest-store';
import type { NewsItem } from '@/lib/news/types';

/** Zbuduj digest z archiwum dnia i zapisz w Firestore. */
export async function buildAndSaveDigest(date: string, macro: MacroChange[] = []) {
    const archive = await readNewsArchive(date);
    const items = (archive?.items ?? []) as NewsItem[];
    const digest = buildDailyDigest(items, date, macro);
    await saveDailyDigest(digest);
    return digest;
}
