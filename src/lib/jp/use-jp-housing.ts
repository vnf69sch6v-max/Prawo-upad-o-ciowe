'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpHousingPayload } from './housing';

async function fetchHousing(): Promise<JpHousingPayload> {
    const res = await fetch('/api/jp/housing');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/housing`);
    return res.json();
}

export function useJpHousing(initial: JpHousingPayload | null) {
    return useQuery<JpHousingPayload>({
        queryKey: ['jp-housing'],
        queryFn: fetchHousing,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
