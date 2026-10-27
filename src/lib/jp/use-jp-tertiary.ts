'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpTertiaryPayload } from './tertiary';

async function fetchTertiary(): Promise<JpTertiaryPayload> {
    const res = await fetch('/api/jp/tertiary');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/tertiary`);
    return res.json();
}

export function useJpTertiary(initial: JpTertiaryPayload | null) {
    return useQuery<JpTertiaryPayload>({
        queryKey: ['jp-tertiary'],
        queryFn: fetchTertiary,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
