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
 * Get Tailwind color class based on change direction (legacy dark theme)
 */
export const getChangeColor = (n: number): string =>
    n > 0 ? 'text-bb-green' : n < 0 ? 'text-bb-red' : 'text-bb-muted';

/**
 * Get Tailwind color class based on change direction (light theme)
 */
export const getChangeColorLight = (n: number): string =>
    n > 0 ? 'text-mk-positive' : n < 0 ? 'text-mk-negative' : 'text-mk-muted';

/**
 * Delta chip class (light theme) — colored pill background + text
 */
export const getDeltaChipClass = (n: number): string =>
    n > 0 ? 'mk-chip mk-chip-up' : n < 0 ? 'mk-chip mk-chip-down' : 'mk-chip mk-chip-flat';

/**
 * Get change arrow
 */
export const getChangeArrow = (n: number): string =>
    n > 0 ? '▲' : n < 0 ? '▼' : '–';

/**
 * Format a percentage-point delta (+0,3 p.p.) — Polish decimal comma
 */
export const formatPP = (n: number, decimals = 1): string =>
    `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(decimals).replace('.', ',')} p.p.`;

/**
 * Format a plain number with Polish decimal comma (4,2)
 */
export const formatDecimalPL = (n: number, decimals = 1): string =>
    n.toFixed(decimals).replace('.', ',');

/**
 * Calculate percent change between two values
 */
export const percentChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};
