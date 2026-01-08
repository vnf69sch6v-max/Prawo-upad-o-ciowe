// App Store (Global State with Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserTier } from '@/types';

interface AppState {
    // User
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // UI
    sidebarCollapsed: boolean;
    showUpgradeModal: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    toggleSidebar: () => void;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;

    // Helpers
    isPro: () => boolean;
    isEnterprise: () => boolean;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: true,
            sidebarCollapsed: false,
            showUpgradeModal: false,

            // Actions
            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isLoading: false,
            }),

            setLoading: (isLoading) => set({ isLoading }),

            toggleSidebar: () => set((state) => ({
                sidebarCollapsed: !state.sidebarCollapsed
            })),

            openUpgradeModal: () => set({ showUpgradeModal: true }),
            closeUpgradeModal: () => set({ showUpgradeModal: false }),

            // Helpers
            isPro: () => {
                const tier = get().user?.tier;
                return tier === 'pro' || tier === 'enterprise';
            },

            isEnterprise: () => {
                return get().user?.tier === 'enterprise';
            },
        }),
        {
            name: 'lexcapital-app',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);
