'use client';

import { useQuery } from '@tanstack/react-query';
import type { EuHicpPayload } from './hicp';

async function fetchEuHicp(): Promise<EuHicpPayload> {
    const res = await fetch('/api/eu-hicp');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/eu-hicp`);
    return res.json();
}

export function useEuHicp(initial: EuHicpPayload | null) {
    return useQuery<EuHicpPayload>({
        queryKey: ['eu-hicp'],
        queryFn: fetchEuHicp,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 30 * 60_000,
    });
}
