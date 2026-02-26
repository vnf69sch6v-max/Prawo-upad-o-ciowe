// lib/formatters.ts — Polish financial data formatting

/**
 * Format as PLN currency (4 282,15 PLN)
 */
export const formatPLN = (n: number): string =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

/**
 * Format exchange rate (4 decimals)
 */
export const formatRate = (n: number, decimals = 4): string =>
    n.toFixed(decimals);

/**
 * Format percentage with sign (+0.12%)
 */
export const formatPercent = (n: number, decimals = 2): string =>
    `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;

/**
 * Format large numbers Polish style (1 234 567)
 */
export const formatNumber = (n: number, decimals = 0): string =>
    new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(n);

/**
 * Format date Polish style (25.02.2026)
 */
export const formatDate = (d: string | Date): string =>
    new Date(d).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

/**
 * Format time Polish style (12:30)
 */
export const formatTime = (d: string | Date): string =>
    new Date(d).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Warsaw',
    });

/**
 * Get Tailwind color class based on change direction
 */
export const getChangeColor = (n: number): string =>
    n > 0 ? 'text-bb-green' : n < 0 ? 'text-bb-red' : 'text-bb-muted';

/**
 * Get change arrow
 */
export const getChangeArrow = (n: number): string =>
    n > 0 ? '▲' : n < 0 ? '▼' : '–';

/**
 * Calculate percent change between two values
 */
export const percentChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};
