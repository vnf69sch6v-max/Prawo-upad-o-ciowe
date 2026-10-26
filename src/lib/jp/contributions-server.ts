// Wkłady CPI: najnowsza tabela 5 z e-Stat (plik xlsx, bez klucza API) i cache Firestore.
import { peekServerCache, withCache } from '@/lib/server-cache';
import {
    ESTAT_CPI_LIST_URL, contributionFileUrl, contributionsLookEmpty, findContributionFileId,
    parseContributionGrid, type JpContributions,
} from './contributions';
import { workbookToGrid } from './contributions-xlsx';

const CACHE = { collection: 'jp_data', doc: 'cpi_contributions_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;
const SOURCE = 'e-Stat · 消費者物価指数 第5表（品目別価格指数・寄与度）';

async function fetchContributions(): Promise<JpContributions> {
    const list = await fetch(ESTAT_CPI_LIST_URL, { cache: 'no-store', headers: { 'user-agent': 'Savori' } });
    if (!list.ok) throw new Error(`e-stat lista ${list.status}`);
    const fileId = findContributionFileId(await list.text());
    if (!fileId) throw new Error('e-stat: brak tabeli wkładów');
    const file = await fetch(contributionFileUrl(fileId), { cache: 'no-store', headers: { 'user-agent': 'Savori' } });
    if (!file.ok) throw new Error(`e-stat plik ${file.status}`);
    const grid = await workbookToGrid(Buffer.from(await file.arrayBuffer()));
    const parsed = parseContributionGrid(grid);
    return { ...parsed, source: SOURCE, fileId, fetchedAt: new Date().toISOString() };
}

export function getJpContributions({ force = false }: { force?: boolean } = {}): Promise<JpContributions> {
    return withCache(CACHE.collection, CACHE.doc, fetchContributions, 'e-Stat CPI',
        force ? -1 : USER_TTL_MS, { isEmpty: contributionsLookEmpty });
}

/** Ostatni zapis bez wołania e-Stat — strona ISR nie ściąga pliku w renderze. */
export async function peekJpContributions(): Promise<JpContributions | null> {
    const p = await peekServerCache<JpContributions>(CACHE.collection, CACHE.doc);
    return p && !contributionsLookEmpty(p) ? p : null;
}
