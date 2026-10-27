'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpIndustryPayload } from './industry';

async function fetchIndustry(): Promise<JpIndustryPayload> {
    const res = await fetch('/api/jp/industry');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/industry`);
    return res.json();
}

export function useJpIndustry(initial: JpIndustryPayload | null) {
    return useQuery<JpIndustryPayload>({
        queryKey: ['jp-industry'],
        queryFn: fetchIndustry,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
