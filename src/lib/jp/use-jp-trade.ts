'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpTradePayload } from './trade';

async function fetchTrade(): Promise<JpTradePayload> {
    const res = await fetch('/api/jp/trade');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/trade`);
    return res.json();
}

export function useJpTrade(initial: JpTradePayload | null) {
    return useQuery<JpTradePayload>({
        queryKey: ['jp-trade'],
        queryFn: fetchTrade,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
