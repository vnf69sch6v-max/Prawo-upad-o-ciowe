'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

// Define haptic patterns
type HapticPattern =
    | 'success'           // Soft tap - "Wiem"
    | 'error'             // Double rough tap - "Nie wiem"  
    | 'impact-light'      // Card flip, selection
    | 'impact-medium'     // Confirmation
    | 'impact-heavy'      // Achievement, milestone
    | 'selection'         // Scroll through items
    | 'warning'           // Error state
    | 'notification'      // New content
    | 'domain-karne'      // Sharp, aggressive - criminal law
    | 'domain-cywilne'    // Structured, rhythmic - civil law
    | 'domain-handlowe'   // Professional, solid - commercial law
    | 'domain-upadlosciowe' // Warning pattern - bankruptcy law
    | 'domain-aso'        // Tech feel - ASO
    | 'domain-makler'     // Finance feel - broker
    | 'streak-milestone'  // Special pattern for streak achievements
    | 'level-up';         // Level up celebration

// Vibration patterns in milliseconds [vibrate, pause, vibrate, pause, ...]
const VIBRATION_PATTERNS: Record<HapticPattern, number[]> = {
    'success': [10],
    'error': [30, 50, 30],
    'impact-light': [5],
    'impact-medium': [15],
    'impact-heavy': [25],
    'selection': [3],
    'warning': [20, 30, 20, 30, 20],
    'notification': [10, 50, 10],
    'domain-karne': [25, 20, 40],        // Sharp, aggressive
    'domain-cywilne': [10, 30, 10, 30],  // Structured, rhythmic
    'domain-handlowe': [15, 40, 25],     // Solid, professional
    'domain-upadlosciowe': [20, 20, 20, 20, 30], // Warning pattern
    'domain-aso': [5, 15, 5, 15, 5],     // Tech/quick pattern
    'domain-makler': [10, 20, 10, 20, 15], // Finance rhythm
    'streak-milestone': [15, 30, 15, 30, 15, 50, 25], // Celebration
    'level-up': [10, 20, 15, 20, 20, 20, 30], // Achievement fanfare
};

// iOS Taptic Engine patterns (using webkit AudioContext trick as fallback)
type TapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

interface HapticsAPI {
    trigger: (pattern: HapticPattern) => void;
    triggerTaptic: (style: TapticStyle) => void;
    isSupported: boolean;
    isTapticSupported: boolean;
}

export function useHaptics(): HapticsAPI {
    const [isSupported, setIsSupported] = useState(false);
    const [isTapticSupported, setIsTapticSupported] = useState(false);

    useEffect(() => {
        // Check for Vibration API support
        setIsSupported('vibrate' in navigator);

        // Check for iOS Taptic Engine (via webkit)
        // Note: True Taptic Engine access requires native app
        // This is a best-effort detection
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        setIsTapticSupported(isIOS && 'vibrate' in navigator);
    }, []);

    const trigger = useCallback((pattern: HapticPattern) => {
        if (!isSupported) return;

        try {
            const vibrationPattern = VIBRATION_PATTERNS[pattern];
            if (vibrationPattern) {
                navigator.vibrate(vibrationPattern);
            }
        } catch (error) {
            // Silently fail - haptics are enhancement, not critical
            console.debug('Haptic trigger failed:', error);
        }
    }, [isSupported]);

    const triggerTaptic = useCallback((style: TapticStyle) => {
        if (!isSupported) return;

        // Map taptic styles to vibration patterns
        const stylePatterns: Record<TapticStyle, number[]> = {
            'light': [5],
            'medium': [12],
            'heavy': [20],
            'rigid': [8, 8],
            'soft': [3],
        };

        try {
            navigator.vibrate(stylePatterns[style]);
        } catch (error) {
            console.debug('Taptic trigger failed:', error);
        }
    }, [isSupported]);

    return {
        trigger,
        triggerTaptic,
        isSupported,
        isTapticSupported,
    };
}

// Helper hook for domain-specific haptics
export function useDomainHaptics() {
    const { trigger, isSupported } = useHaptics();

    const triggerForDomain = useCallback((domain: string) => {
        if (!isSupported) return;

        const domainPatterns: Record<string, HapticPattern> = {
            'prawo_karne': 'domain-karne',
            'prawo_cywilne': 'domain-cywilne',
            'prawo_handlowe': 'domain-handlowe',
            'ksh': 'domain-handlowe',
            'prawo_upadlosciowe': 'domain-upadlosciowe',
            'aso': 'domain-aso',
            'makler': 'domain-makler',
            'egzamin-maklerski': 'domain-makler',
        };

        const pattern = domainPatterns[domain] || 'impact-light';
        trigger(pattern);
    }, [trigger, isSupported]);

    return { triggerForDomain, isSupported };
}

export default useHaptics;
