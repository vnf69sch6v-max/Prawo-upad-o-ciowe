'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpContributions } from './contributions';

async function fetchContributions(): Promise<JpContributions> {
    const res = await fetch('/api/jp/cpi-contributions');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/cpi-contributions`);
    return res.json();
}

/** Wkłady z komunikatu. `initial` jest z ISR (cache), klient dociąga, gdy wpis ma ponad 15 min. */
export function useJpContributions(initial: JpContributions | null) {
    return useQuery<JpContributions>({
        queryKey: ['jp-cpi-contributions'],
        queryFn: fetchContributions,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
