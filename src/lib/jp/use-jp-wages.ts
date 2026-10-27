'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpWagesPayload } from './wages';

async function fetchWages(): Promise<JpWagesPayload> {
    const res = await fetch('/api/jp/wages');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/wages`);
    return res.json();
}

export function useJpWages(initial: JpWagesPayload | null) {
    return useQuery<JpWagesPayload>({
        queryKey: ['jp-wages'],
        queryFn: fetchWages,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
