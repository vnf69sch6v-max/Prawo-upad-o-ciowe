'use client';

import { useQuery } from '@tanstack/react-query';
import type { JgbPayload } from './jgb';

async function fetchJgb(): Promise<JgbPayload> {
    const res = await fetch('/api/jp/jgb');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/jgb`);
    return res.json();
}

export function useJpJgb(initial: JgbPayload | null) {
    return useQuery<JgbPayload>({
        queryKey: ['jp-jgb'],
        queryFn: fetchJgb,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
