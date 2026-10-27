'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpSppiPayload } from './sppi';

async function fetchSppi(): Promise<JpSppiPayload> {
    const res = await fetch('/api/jp/sppi');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/sppi`);
    return res.json();
}

export function useJpSppi(initial: JpSppiPayload | null) {
    return useQuery<JpSppiPayload>({
        queryKey: ['jp-sppi'],
        queryFn: fetchSppi,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
