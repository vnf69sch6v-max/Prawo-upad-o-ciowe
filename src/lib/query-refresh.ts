// Polityki odświeżania React Query dopasowane do częstotliwości publikacji u źródła.
import { isGpwSession, isNbpPublishWindow } from '@/lib/market-hours';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export type RefreshPolicy =
    | 'news'
    | 'nbpDaily'
    | 'nbpInterest'
    | 'wibor'
    | 'market'
    | 'commodity'
    | 'eurostat'
    | 'gusMonthly'
    | 'gusDbw'
    | 'smupCatalog'
    | 'smupData'
    | 'regionalGus';

/** Plain shape — bez UseQueryOptions / Query, żeby spread nie psuł inferencji generyków. */
export type RefreshPartial = {
    staleTime: number;
    refetchInterval?: number | false | (() => number | false | undefined);
    refetchOnWindowFocus?: boolean;
};

function nbpInterval(): number {
    return isNbpPublishWindow() ? 10 * MIN : HOUR;
}

function marketInterval(): number {
    return isGpwSession() ? 5 * MIN : 30 * MIN;
}

const POLICIES: Record<RefreshPolicy, RefreshPartial> = {
    news: {
        staleTime: 15 * MIN,
        refetchInterval: 15 * MIN,
        refetchOnWindowFocus: true,
    },
    nbpDaily: {
        staleTime: 30 * MIN,
        refetchInterval: nbpInterval,
        refetchOnWindowFocus: true,
    },
    nbpInterest: {
        staleTime: DAY,
        refetchInterval: DAY,
    },
    wibor: {
        staleTime: HOUR,
        refetchInterval: HOUR,
        refetchOnWindowFocus: true,
    },
    market: {
        staleTime: 5 * MIN,
        refetchInterval: marketInterval,
        refetchOnWindowFocus: true,
    },
    commodity: {
        staleTime: 15 * MIN,
        refetchInterval: 15 * MIN,
        refetchOnWindowFocus: true,
    },
    eurostat: {
        staleTime: 12 * HOUR,
        refetchInterval: 12 * HOUR,
    },
    gusMonthly: {
        staleTime: DAY,
        refetchInterval: DAY,
    },
    gusDbw: {
        staleTime: DAY,
        refetchInterval: DAY,
    },
    smupCatalog: {
        staleTime: 7 * DAY,
        refetchInterval: 7 * DAY,
    },
    smupData: {
        staleTime: DAY,
        refetchInterval: DAY,
    },
    regionalGus: {
        staleTime: 7 * DAY,
        refetchInterval: 7 * DAY,
    },
};

/** Opcje useQuery dopasowane do źródła danych. */
export function refreshOptions(policy: RefreshPolicy): RefreshPartial {
    return POLICIES[policy];
}
