'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpTankanPayload } from './tankan';

async function fetchTankan(): Promise<JpTankanPayload> {
    const res = await fetch('/api/jp/tankan');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/tankan`);
    return res.json();
}

export function useJpTankan(initial: JpTankanPayload | null) {
    return useQuery<JpTankanPayload>({
        queryKey: ['jp-tankan'],
        queryFn: fetchTankan,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
