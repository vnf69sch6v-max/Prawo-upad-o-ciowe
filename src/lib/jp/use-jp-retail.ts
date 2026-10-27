'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpRetailPayload } from './retail';

async function fetchRetail(): Promise<JpRetailPayload> {
    const res = await fetch('/api/jp/retail');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/retail`);
    return res.json();
}

export function useJpRetail(initial: JpRetailPayload | null) {
    return useQuery<JpRetailPayload>({
        queryKey: ['jp-retail'],
        queryFn: fetchRetail,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
