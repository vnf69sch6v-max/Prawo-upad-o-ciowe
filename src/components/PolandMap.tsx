'use client';

import { useState } from 'react';
import { VOIVODESHIP_PATHS, LABEL_POS, SLUG_TO_PATH } from '@/lib/poland-geo';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RegionData {
    id: string;
    name: string;
    slug: string;
    unemployment: number | null;
    unemploymentMonth: string | null;
    unemploymentPrev: number | null;
    wages: number | null;
    wagesPrev: number | null;
    wagesYoY: number | null;
}

export interface MonthlyUnemployment {
    month: string; // e.g. "2025-09"
    label: string; // e.g. "wrzesień 2025"
    regions: Record<string, number>; // slug → rate
}

interface PolandMapProps {
    regions: RegionData[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    selectedRegion: string | null;
    onRegionSelect: (slug: string | null) => void;
    overrideRates?: Record<string, number>; // from period switcher
}

// ═══════════════════════════════════════════════════════════════
// COLOR LOGIC
// ═══════════════════════════════════════════════════════════════

function getUnemploymentColor(rate: number | null): string {
    if (rate === null) return '#1E293B';
    if (rate < 4) return '#059669';
    if (rate < 5) return '#10B981';
    if (rate < 6) return '#84CC16';
    if (rate < 7) return '#EAB308';
    if (rate < 8) return '#F97316';
    if (rate < 10) return '#EF4444';
    return '#DC2626';
}

function getHoverColor(rate: number | null): string {
    if (rate === null) return '#334155';
    if (rate < 4) return '#047857';
    if (rate < 5) return '#059669';
    if (rate < 6) return '#65A30D';
    if (rate < 7) return '#CA8A04';
    if (rate < 8) return '#EA580C';
    if (rate < 10) return '#DC2626';
    return '#B91C1C';
}

// Geo-ścieżki, etykiety i mapowanie slug→ścieżka: w src/lib/poland-geo.ts

// ═══════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════

function Tooltip({ region, avgWages, x, y }: {
    region: RegionData; avgWages: number | null; x: number; y: number
}) {
    const wageVsAvg = region.wages && avgWages
        ? +((region.wages / avgWages - 1) * 100).toFixed(1) : null;
    const unempChange = region.unemployment !== null && region.unemploymentPrev !== null
        ? +(region.unemployment - region.unemploymentPrev).toFixed(1) : null;

    return (
        <div className="absolute z-50 pointer-events-none"
            style={{ left: x, top: y, transform: 'translate(-50%, -110%)' }}>
            <div className="min-w-[210px] rounded-lg border border-mk-border bg-mk-surface px-3 py-2 shadow-xl">
                <div className="mb-1.5 text-sm font-semibold text-mk-text">{region.name}</div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-mk-muted">Bezrobocie:</span>
                        <span className="tabular-nums font-bold" style={{ color: getUnemploymentColor(region.unemployment) }}>
                            {region.unemployment !== null ? `${region.unemployment}%` : 'N/A'}
                            {unempChange !== null && (
                                <span className={`ml-1 text-[10px] ${unempChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ({unempChange > 0 ? '+' : ''}{unempChange}pp)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-mk-muted">Wynagrodzenie:</span>
                        <span className="tabular-nums text-mk-text">
                            {region.wages ? `${Math.round(region.wages).toLocaleString()} PLN` : 'N/A'}
                        </span>
                    </div>
                    {wageVsAvg !== null && (
                        <div className="flex justify-between gap-4">
                            <span className="text-mk-muted">vs średnia:</span>
                            <span className={`tabular-nums ${wageVsAvg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {wageVsAvg >= 0 ? '+' : ''}{wageVsAvg}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════

export default function PolandMap({ regions, national, selectedRegion, onRegionSelect, overrideRates }: PolandMapProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const getRegion = (slug: string) => regions.find(r => r.slug === slug);
    const getRate = (slug: string): number | null => {
        if (overrideRates && overrideRates[slug] !== undefined) return overrideRates[slug];
        return getRegion(slug)?.unemployment ?? null;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const hoveredData = hovered ? getRegion(hovered) : null;

    return (
        <div className="relative" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 580 550" className="w-full h-auto" style={{ maxHeight: '65vh' }}>
                {Object.entries(SLUG_TO_PATH).map(([slug, pathKey]) => {
                    const path = VOIVODESHIP_PATHS[pathKey];
                    if (!path) return null;
                    const rate = getRate(slug);
                    const isHovered = hovered === slug;
                    const isSelected = selectedRegion === slug;

                    return (
                        <g key={slug}>
                            <path
                                d={path}
                                fill={isHovered ? getHoverColor(rate) : getUnemploymentColor(rate)}
                                stroke={isSelected ? '#FF6B00' : '#0F172A'}
                                strokeWidth={isSelected ? 2.5 : 1}
                                className="cursor-pointer transition-all duration-150"
                                onMouseEnter={() => setHovered(slug)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onRegionSelect(selectedRegion === slug ? null : slug)}
                                opacity={isHovered || isSelected ? 1 : 0.88}
                            />
                            {LABEL_POS[pathKey] && (
                                <text
                                    x={LABEL_POS[pathKey][0]}
                                    y={LABEL_POS[pathKey][1]}
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                                >
                                    {rate !== null ? `${rate}%` : ''}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {hoveredData && (
                <Tooltip region={hoveredData} avgWages={national.avgWages} x={tooltipPos.x} y={tooltipPos.y} />
            )}
        </div>
    );
}
