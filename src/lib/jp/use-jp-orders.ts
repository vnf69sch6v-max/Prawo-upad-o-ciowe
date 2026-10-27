'use client';

import { useQuery } from '@tanstack/react-query';
import type { JpOrdersPayload } from './orders';

async function fetchOrders(): Promise<JpOrdersPayload> {
    const res = await fetch('/api/jp/orders');
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} /api/jp/orders`);
    return res.json();
}

export function useJpOrders(initial: JpOrdersPayload | null) {
    return useQuery<JpOrdersPayload>({
        queryKey: ['jp-orders'],
        queryFn: fetchOrders,
        initialData: initial ?? undefined,
        initialDataUpdatedAt: initial ? Date.parse(initial.fetchedAt) || 0 : undefined,
        staleTime: 15 * 60_000,
        refetchInterval: 60 * 60_000,
    });
}
