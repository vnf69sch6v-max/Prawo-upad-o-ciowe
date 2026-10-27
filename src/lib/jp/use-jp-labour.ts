'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpLabourPayload } from './labour';

async function fetchLabour(): Promise<JpLabourPayload> {
    const res = await fetch('/api/jp/labour');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/labour`);
    return res.json();
}

export function useJpLabour(initial: JpLabourPayload | null) {
    return useQuery<JpLabourPayload>({
        queryKey: ['jp-labour'],
        queryFn: fetchLabour,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
