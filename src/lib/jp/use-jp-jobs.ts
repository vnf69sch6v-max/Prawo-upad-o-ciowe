'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpJobsPayload } from './jobs';

async function fetchJobs(): Promise<JpJobsPayload> {
    const res = await fetch('/api/jp/jobs');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/jobs`);
    return res.json();
}

export function useJpJobs(initial: JpJobsPayload | null) {
    return useQuery<JpJobsPayload>({
        queryKey: ['jp-jobs'],
        queryFn: fetchJobs,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
