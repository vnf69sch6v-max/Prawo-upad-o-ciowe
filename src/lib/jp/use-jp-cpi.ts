'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpCpiPayload } from './cpi';

async function fetchJpCpiClient(): Promise<JpCpiPayload> {
    const res = await fetch('/api/jp/cpi');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/cpi`);
    return res.json();
}

/**
 * CPI Japonii. `initial` przychodzi z serwera (strona ISR czyta ostatni wpis cache), więc liczby są
 * w HTML od razu — bez szkieletu i widoczne dla wyszukiwarek. Klient dociąga świeższe dane, gdy
 * wpis z serwera jest starszy niż 15 min.
 */
export function useJpCpi(initial: JpCpiPayload | null) {
    return useQuery<JpCpiPayload>({
        queryKey: ['jp-cpi'],
        queryFn: fetchJpCpiClient,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
