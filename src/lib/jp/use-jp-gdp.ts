'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpGdpPayload } from './gdp';

async function fetchGdp(): Promise<JpGdpPayload> {
    const res = await fetch('/api/jp/gdp');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/gdp`);
    return res.json();
}

export function useJpGdp(initial: JpGdpPayload | null) {
    return useQuery<JpGdpPayload>({
        queryKey: ['jp-gdp'],
        queryFn: fetchGdp,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
