'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpCgpiPayload } from './cgpi';

async function fetchCgpi(): Promise<JpCgpiPayload> {
    const res = await fetch('/api/jp/cgpi');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/cgpi`);
    return res.json();
}

export function useJpCgpi(initial: JpCgpiPayload | null) {
    return useQuery<JpCgpiPayload>({
        queryKey: ['jp-cgpi'],
        queryFn: fetchCgpi,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
