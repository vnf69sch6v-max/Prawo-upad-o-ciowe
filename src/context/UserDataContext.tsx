'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserData, UseUserDataReturn } from '@/hooks/use-user-data';

const UserDataContext = createContext<UseUserDataReturn | null>(null);

interface UserDataProviderProps {
    children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
    const userData = useUserData();

    return (
        <UserDataContext.Provider value={userData}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserDataContext(): UseUserDataReturn {
    const context = useContext(UserDataContext);

    if (!context) {
        throw new Error('useUserDataContext must be used within a UserDataProvider');
    }

    return context;
}

// Re-export types
export type { UseUserDataReturn };
