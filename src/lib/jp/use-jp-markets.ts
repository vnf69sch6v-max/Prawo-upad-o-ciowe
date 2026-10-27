'use client';

import { useQuery } from '@tanstack/react-query';
import type { BojPayload } from './boj';

async function fetchMarkets(): Promise<BojPayload> {
    const res = await fetch('/api/jp/markets');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/markets`);
    return res.json();
}

export function useJpMarkets(initial: BojPayload | null) {
    return useQuery<BojPayload>({
        queryKey: ['jp-markets'],
        queryFn: fetchMarkets,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
