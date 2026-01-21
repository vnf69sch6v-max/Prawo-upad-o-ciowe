/**
 * Utility helper functions for the application
 */

// Format percentage
export function formatPercent(value: number, decimals = 0): string {
    return `${(value || 0).toFixed(decimals)}%`;
}

// Format time (seconds to mm:ss)
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format time in minutes
export function formatTimeMinutes(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

// Format date
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
    const d = new Date(date);

    if (format === 'relative') {
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Dziś';
        if (diffDays === 1) return 'Wczoraj';
        if (diffDays < 7) return `${diffDays} dni temu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`;
    }

    return d.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: format === 'long' ? 'long' : 'short',
        year: format === 'long' ? 'numeric' : undefined
    });
}

// Shuffle array (for randomizing questions)
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate streak status
export function calculateStreak(lastActivityDate: string | Date | null): {
    isActive: boolean;
    daysMissed: number | null
} {
    if (!lastActivityDate) return { isActive: false, daysMissed: null };

    const last = new Date(lastActivityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    return {
        isActive: diffDays <= 1,
        daysMissed: diffDays > 1 ? diffDays - 1 : 0
    };
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function  
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Generate random ID
export function generateId(length = 8): string {
    return Math.random().toString(36).substring(2, 2 + length);
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// Calculate accuracy percentage
export function calculateAccuracy(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

// Get greeting based on time of day
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Cześć';
    return 'Dobry wieczór';
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

// Pluralize Polish words
export function pluralizePL(
    count: number,
    singular: string,
    plural2to4: string,
    plural5plus: string
): string {
    if (count === 1) return singular;
    if (count >= 2 && count <= 4) return plural2to4;
    if (count >= 5 && count <= 21) return plural5plus;

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return plural5plus;
    if (lastDigit >= 2 && lastDigit <= 4) return plural2to4;
    return plural5plus;
}

// Example: pluralizePL(5, 'pytanie', 'pytania', 'pytań') => 'pytań'
