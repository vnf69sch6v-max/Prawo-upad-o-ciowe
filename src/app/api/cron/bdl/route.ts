// Cron GUS BDL (harmonogram 05:00) — sekwencyjnie, z odstępami (`warmEndpoints`). Lista: src/lib/cron-endpoints.ts.
// BDL bez klucza API wpuszcza ~5 żądań/s i ~100 / 15 min; ta grupa to ~60 zapytań, więc idzie
// w swoim oknie i po kolei. `refresh=1` → pobranie u źródła z `no-store` (src/lib/upstream-fetch.ts);
// pusta albo nieudana odpowiedź nie nadpisuje poprzednich danych (withCache).
import { NextRequest } from 'next/server';
import { warmEndpoints } from '@/lib/cron-warm';
import { CRON_ENDPOINTS } from '@/lib/cron-endpoints';

export const maxDuration = 120;

export async function GET(request: NextRequest) {
    return warmEndpoints(request, [...CRON_ENDPOINTS.bdl], 'bdl');
}
