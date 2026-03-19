'use client';

import { useState } from 'react';

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

interface PolandMapProps {
    regions: RegionData[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    selectedRegion: string | null;
    onRegionSelect: (slug: string | null) => void;
}

// ═══════════════════════════════════════════════════════════════
// COLOR LOGIC
// ═══════════════════════════════════════════════════════════════

function getUnemploymentColor(rate: number | null): string {
    if (rate === null) return '#1E293B';
    if (rate < 4) return '#059669';   // emerald — very low
    if (rate < 5) return '#10B981';   // green
    if (rate < 6) return '#84CC16';   // lime
    if (rate < 7) return '#EAB308';   // yellow
    if (rate < 8) return '#F97316';   // orange
    if (rate < 10) return '#EF4444';  // red
    return '#DC2626';                  // dark red — very high
}

function getUnemploymentColorHover(rate: number | null): string {
    if (rate === null) return '#334155';
    if (rate < 4) return '#047857';
    if (rate < 5) return '#059669';
    if (rate < 6) return '#65A30D';
    if (rate < 7) return '#CA8A04';
    if (rate < 8) return '#EA580C';
    if (rate < 10) return '#DC2626';
    return '#B91C1C';
}

// ═══════════════════════════════════════════════════════════════
// SVG PATHS — Simplified voivodeship boundaries
// Each path approximates the real shape in a 600×580 viewBox
// ═══════════════════════════════════════════════════════════════

const VOIVODESHIP_PATHS: Record<string, string> = {
    zachodniopomorskie: 'M 60,30 L 120,20 L 150,50 L 155,100 L 140,130 L 110,140 L 80,160 L 50,150 L 20,130 L 10,80 L 30,50 Z',
    pomorskie: 'M 180,20 L 260,10 L 290,30 L 300,70 L 290,110 L 250,130 L 210,140 L 180,130 L 155,100 L 150,50 L 160,30 Z',
    'warminskomazurskie': 'M 300,20 L 370,15 L 430,30 L 460,60 L 450,110 L 420,140 L 380,150 L 340,140 L 300,130 L 290,110 L 300,70 L 295,40 Z',
    podlaskie: 'M 450,110 L 480,70 L 520,60 L 550,90 L 560,140 L 550,200 L 520,240 L 480,230 L 440,200 L 420,170 L 420,140 Z',
    lubuskie: 'M 20,160 L 80,160 L 110,140 L 140,170 L 130,220 L 120,260 L 80,270 L 40,260 L 10,230 L 5,190 Z',
    wielkopolskie: 'M 110,140 L 180,130 L 210,140 L 240,170 L 260,210 L 250,260 L 220,290 L 180,300 L 140,280 L 120,260 L 130,220 L 140,170 Z',
    kujawsko_pomorskie: 'M 210,140 L 250,130 L 290,110 L 300,130 L 310,170 L 300,200 L 270,210 L 260,210 L 240,170 Z',
    mazowieckie: 'M 300,130 L 340,140 L 380,150 L 420,170 L 440,200 L 450,240 L 430,280 L 400,310 L 360,320 L 320,300 L 290,270 L 280,240 L 300,200 L 310,170 Z',
    lodzkie: 'M 220,290 L 250,260 L 260,210 L 270,210 L 300,200 L 290,270 L 280,300 L 260,330 L 230,340 L 200,320 Z',
    dolnoslaskie: 'M 40,280 L 80,270 L 120,260 L 140,280 L 150,320 L 140,360 L 110,380 L 70,380 L 30,360 L 20,320 Z',
    opolskie: 'M 140,280 L 180,300 L 190,340 L 180,370 L 150,380 L 110,380 L 140,360 L 150,320 Z',
    slaskie: 'M 180,300 L 220,290 L 230,340 L 220,380 L 200,400 L 170,400 L 150,380 L 180,370 L 190,340 Z',
    swietokrzyskie: 'M 290,270 L 320,300 L 340,330 L 330,360 L 300,370 L 270,360 L 260,330 L 280,300 Z',
    lubelskie: 'M 320,300 L 360,320 L 400,310 L 430,280 L 460,290 L 480,330 L 470,380 L 440,410 L 400,400 L 370,370 L 340,330 Z',
    podkarpackie: 'M 260,380 L 300,370 L 330,360 L 370,370 L 400,400 L 380,430 L 340,450 L 300,440 L 260,420 L 240,400 Z',
    malopolskie: 'M 200,400 L 220,380 L 260,380 L 260,420 L 240,440 L 210,450 L 180,440 L 170,420 Z',
};

// Map slug to path key
const SLUG_TO_PATH: Record<string, string> = {
    'zachodniopomorskie': 'zachodniopomorskie',
    'pomorskie': 'pomorskie',
    'warminskomazurskie': 'warminskomazurskie',
    'podlaskie': 'podlaskie',
    'lubuskie': 'lubuskie',
    'wielkopolskie': 'wielkopolskie',
    'kujawsko-pomorskie': 'kujawsko_pomorskie',
    'mazowieckie': 'mazowieckie',
    'lodzkie': 'lodzkie',
    'dolnoslaskie': 'dolnoslaskie',
    'opolskie': 'opolskie',
    'slaskie': 'slaskie',
    'swietokrzyskie': 'swietokrzyskie',
    'lubelskie': 'lubelskie',
    'podkarpackie': 'podkarpackie',
    'malopolskie': 'malopolskie',
};

// Label positions (approximate center of each region)
const LABEL_POS: Record<string, [number, number]> = {
    zachodniopomorskie: [85, 90],
    pomorskie: [225, 75],
    warminskomazurskie: [380, 80],
    podlaskie: [490, 150],
    lubuskie: [65, 210],
    wielkopolskie: [185, 210],
    kujawsko_pomorskie: [270, 165],
    mazowieckie: [370, 220],
    lodzkie: [260, 290],
    dolnoslaskie: [85, 325],
    opolskie: [160, 340],
    slaskie: [200, 360],
    swietokrzyskie: [300, 330],
    lubelskie: [410, 350],
    podkarpackie: [320, 410],
    malopolskie: [220, 420],
};

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
        <div
            className="absolute z-50 pointer-events-none"
            style={{ left: x, top: y, transform: 'translate(-50%, -110%)' }}
        >
            <div className="bg-gray-900 border border-bb-border rounded-lg px-3 py-2 shadow-xl min-w-[200px]">
                <div className="font-semibold text-bb-accent text-sm mb-1">{region.name}</div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-bb-muted">Bezrobocie:</span>
                        <span className="font-mono font-bold" style={{ color: getUnemploymentColor(region.unemployment) }}>
                            {region.unemployment !== null ? `${region.unemployment}%` : 'N/A'}
                            {unempChange !== null && (
                                <span className={`ml-1 text-[10px] ${unempChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    ({unempChange > 0 ? '+' : ''}{unempChange}pp YoY)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-bb-muted">Wynagrodzenie:</span>
                        <span className="font-mono text-bb-text">
                            {region.wages !== null ? `${Math.round(region.wages).toLocaleString()} PLN` : 'N/A'}
                        </span>
                    </div>
                    {wageVsAvg !== null && (
                        <div className="flex justify-between gap-4">
                            <span className="text-bb-muted">vs średnia:</span>
                            <span className={`font-mono ${wageVsAvg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {wageVsAvg >= 0 ? '+' : ''}{wageVsAvg}%
                            </span>
                        </div>
                    )}
                    {region.wagesYoY !== null && (
                        <div className="flex justify-between gap-4">
                            <span className="text-bb-muted">Płace YoY:</span>
                            <span className={`font-mono ${region.wagesYoY >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {region.wagesYoY >= 0 ? '+' : ''}{region.wagesYoY}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PolandMap({ regions, national, selectedRegion, onRegionSelect }: PolandMapProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const getRegion = (slug: string) => regions.find(r => r.slug === slug);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const hoveredData = hoveredRegion ? getRegion(hoveredRegion) : null;

    return (
        <div className="relative" onMouseMove={handleMouseMove}>
            <svg viewBox="-10 0 580 470" className="w-full h-auto">
                {/* Background */}
                <rect x="-10" y="0" width="580" height="470" fill="transparent" />

                {Object.entries(SLUG_TO_PATH).map(([slug, pathKey]) => {
                    const path = VOIVODESHIP_PATHS[pathKey];
                    if (!path) return null;
                    const region = getRegion(slug);
                    const isHovered = hoveredRegion === slug;
                    const isSelected = selectedRegion === slug;
                    const rate = region?.unemployment ?? null;

                    return (
                        <g key={slug}>
                            <path
                                d={path}
                                fill={isHovered ? getUnemploymentColorHover(rate) : getUnemploymentColor(rate)}
                                stroke={isSelected ? '#FF6B00' : isHovered ? '#E2E8F0' : '#0F172A'}
                                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                                className="cursor-pointer transition-all duration-200"
                                onMouseEnter={() => setHoveredRegion(slug)}
                                onMouseLeave={() => setHoveredRegion(null)}
                                onClick={() => onRegionSelect(selectedRegion === slug ? null : slug)}
                                opacity={isHovered || isSelected ? 1 : 0.85}
                            />
                            {/* Region label */}
                            {LABEL_POS[pathKey] && (
                                <text
                                    x={LABEL_POS[pathKey][0]}
                                    y={LABEL_POS[pathKey][1]}
                                    fill="white"
                                    fontSize="9"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    opacity={0.9}
                                >
                                    {rate !== null ? `${rate}%` : ''}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredData && (
                <Tooltip
                    region={hoveredData}
                    avgWages={national.avgWages}
                    x={tooltipPos.x}
                    y={tooltipPos.y}
                />
            )}
        </div>
    );
}
