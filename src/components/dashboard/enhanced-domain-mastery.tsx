'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, ChevronRight, Play, HelpCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

// ============================================
// TYPES
// ============================================

export interface DomainData {
    id: string;
    name: string;
    nameShort: string;
    icon: string;
    score: number;
    questionsAnswered: number;
    questionsTotal: number;
    streak: number;
    lastPracticed: Date;
    subdomains: {
        name: string;
        score: number;
    }[];
    trend: number;
    weakAreas: string[];
    strongAreas: string[];
}

interface EnhancedDomainMasteryProps {
    domains: DomainData[];
    viewMode: 'bar' | 'radar';
    onViewModeChange: (mode: 'bar' | 'radar') => void;
    onPractice: (domainId: string) => void;
    onQuiz: (domainId: string) => void;
}

// ============================================
// COLOR HELPERS
// ============================================

function getScoreColor(score: number): string {
    if (score >= 85) return '#10b981'; // Emerald - mastered
    if (score >= 70) return '#f59e0b'; // Amber - proficient
    if (score >= 50) return '#f97316'; // Orange - learning
    return '#ef4444'; // Red - needs work
}

function getScoreLabel(score: number): string {
    if (score >= 85) return 'Opanowane';
    if (score >= 70) return 'Biegły';
    if (score >= 50) return 'W trakcie nauki';
    return 'Wymaga pracy';
}

// ============================================
// RADAR CHART COMPONENT
// ============================================

function RadarChart({ domains }: { domains: DomainData[] }) {
    const size = 300;
    const center = size / 2;
    const maxRadius = 120;
    const levels = 4;

    // Calculate points for each domain
    const angleStep = (2 * Math.PI) / domains.length;

    const dataPoints = domains.map((domain, i) => {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        const radius = (domain.score / 100) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            domain,
        };
    });

    const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="flex justify-center items-center py-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Grid circles */}
                {Array.from({ length: levels }).map((_, i) => {
                    const r = ((i + 1) / levels) * maxRadius;
                    return (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={r}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axis lines */}
                {domains.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x2 = center + maxRadius * Math.cos(angle);
                    const y2 = center + maxRadius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data polygon fill */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(139, 92, 246, 0.2)"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                />

                {/* Data points */}
                {dataPoints.map((point, i) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill={getScoreColor(point.domain.score)}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-8 transition-all"
                    />
                ))}

                {/* Labels */}
                {domains.map((domain, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const labelRadius = maxRadius + 30;
                    const x = center + labelRadius * Math.cos(angle);
                    const y = center + labelRadius * Math.sin(angle);
                    return (
                        <g key={i}>
                            <text
                                x={x}
                                y={y - 8}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="600"
                            >
                                {domain.icon}
                            </text>
                            <text
                                x={x}
                                y={y + 8}
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.7)"
                                fontSize="10"
                            >
                                {domain.nameShort}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ============================================
// DOMAIN ROW COMPONENT
// ============================================

function DomainRow({ domain, onPractice, onQuiz }: {
    domain: DomainData;
    onPractice: () => void;
    onQuiz: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const scoreColor = getScoreColor(domain.score);
    const needsWork = domain.score < 70;

    return (
        <div
            className={cn(
                'rounded-xl border transition-all',
                needsWork ? 'border-red-500/20' : 'border-[var(--border-color)]',
                isHovered && 'border-[#1a365d]/30'
            )}
            style={{
                boxShadow: needsWork ? '0 0 20px -10px rgba(239, 68, 68, 0.3)' : undefined,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Row */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Expand icon */}
                <div className="w-5 flex-shrink-0">
                    {isExpanded ? (
                        <ChevronDown size={16} className="text-[var(--text-muted)]" />
                    ) : (
                        <ChevronRight size={16} className="text-[var(--text-muted)]" />
                    )}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center text-xl">
                    {domain.icon}
                </div>

                {/* Name & Last practiced */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{domain.name}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(domain.lastPracticed, { addSuffix: true, locale: pl })}
                    </p>
                </div>

                {/* Trend */}
                <div className={cn(
                    'flex items-center gap-1 text-sm',
                    domain.trend > 0 && 'text-green-400',
                    domain.trend < 0 && 'text-red-400',
                    domain.trend === 0 && 'text-gray-400'
                )}>
                    {domain.trend > 0 && <TrendingUp size={14} />}
                    {domain.trend < 0 && <TrendingDown size={14} />}
                    <span>{domain.trend > 0 ? '+' : ''}{domain.trend}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-32 flex-shrink-0">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">{domain.questionsAnswered}/{domain.questionsTotal}</span>
                        <span style={{ color: scoreColor }}>{domain.score}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${domain.score}%`,
                                background: `linear-gradient(90deg, ${scoreColor}aa, ${scoreColor})`,
                            }}
                        />
                    </div>
                </div>

                {/* Actions (show on hover) */}
                <div className={cn(
                    'flex gap-2 transition-opacity',
                    isHovered ? 'opacity-100' : 'opacity-0'
                )}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPractice(); }}
                        className="p-2 rounded-lg bg-[#1a365d]/20 hover:bg-[#1a365d]/40 text-[#1a365d] transition-colors"
                        title="Ćwicz fiszki"
                    >
                        <Play size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuiz(); }}
                        className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
                        title="Quiz"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)] animate-fade-in">
                    {/* Subdomains */}
                    <p className="text-sm font-medium mb-3">Poddziedziny</p>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {domain.subdomains.map((sub, i) => (
                            <div key={i} className="p-3 bg-[var(--bg-hover)] rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm truncate">{sub.name}</span>
                                    <span
                                        className="text-xs font-semibold"
                                        style={{ color: getScoreColor(sub.score) }}
                                    >
                                        {sub.score}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${sub.score}%`,
                                            background: getScoreColor(sub.score),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Weak & Strong areas */}
                    <div className="grid grid-cols-2 gap-4">
                        {domain.weakAreas.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-red-400 mb-2">📉 Słabe punkty</p>
                                <ul className="space-y-1">
                                    {domain.weakAreas.map((area, i) => (
                                        <li key={i} className="text-sm text-[var(--text-muted)]">• {area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {domain.strongAreas.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-green-400 mb-2">📈 Mocne punkty</p>
                                <ul className="space-y-1">
                                    {domain.strongAreas.map((area, i) => (
                                        <li key={i} className="text-sm text-[var(--text-muted)]">• {area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedDomainMastery({
    domains,
    viewMode,
    onViewModeChange,
    onPractice,
    onQuiz,
}: EnhancedDomainMasteryProps) {
    return (
        <div className="lex-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Opanowanie dziedzin</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        {domains.filter(d => d.score >= 85).length}/{domains.length} opanowane
                    </p>
                </div>

                {/* View toggle */}
                <div className="flex gap-1 p-1 bg-[var(--bg-hover)] rounded-xl">
                    <button
                        onClick={() => onViewModeChange('bar')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                            viewMode === 'bar'
                                ? 'bg-[#1a365d] text-white'
                                : 'text-[var(--text-muted)] hover:text-white'
                        )}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => onViewModeChange('radar')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                            viewMode === 'radar'
                                ? 'bg-[#1a365d] text-white'
                                : 'text-[var(--text-muted)] hover:text-white'
                        )}
                    >
                        Radar
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-#1a365d to-pink-600 rounded text-[10px]">PRO</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'radar' ? (
                <RadarChart domains={domains} />
            ) : (
                <div className="space-y-3">
                    {domains.map(domain => (
                        <DomainRow
                            key={domain.id}
                            domain={domain}
                            onPractice={() => onPractice(domain.id)}
                            onQuiz={() => onQuiz(domain.id)}
                        />
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-[var(--border-color)] text-xs">
                {[
                    { color: '#10b981', label: 'Opanowane (85%+)' },
                    { color: '#f59e0b', label: 'Biegły (70-84%)' },
                    { color: '#f97316', label: 'W trakcie (50-69%)' },
                    { color: '#ef4444', label: 'Wymaga pracy (<50%)' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: item.color }}
                        />
                        <span className="text-[var(--text-muted)]">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// DEFAULT DATA
// ============================================

export const DEFAULT_DOMAINS: DomainData[] = [
    {
        id: 'civil',
        name: 'Prawo Cywilne',
        nameShort: 'Cywilne',
        icon: '⚖️',
        score: 78,
        questionsAnswered: 245,
        questionsTotal: 320,
        streak: 5,
        lastPracticed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        trend: 3,
        subdomains: [
            { name: 'Część ogólna', score: 85 },
            { name: 'Zobowiązania', score: 72 },
            { name: 'Prawo rzeczowe', score: 78 },
            { name: 'Spadki', score: 68 },
        ],
        weakAreas: ['Umowa zastawu', 'Użyczenie'],
        strongAreas: ['Przedawnienie', 'Zdolność prawna'],
    },
    {
        id: 'criminal',
        name: 'Prawo Karne',
        nameShort: 'Karne',
        icon: '⚔️',
        score: 92,
        questionsAnswered: 189,
        questionsTotal: 200,
        streak: 12,
        lastPracticed: new Date(Date.now() - 5 * 60 * 60 * 1000),
        trend: 2,
        subdomains: [
            { name: 'Część ogólna', score: 95 },
            { name: 'Część szczególna', score: 88 },
            { name: 'Wykroczenia', score: 90 },
        ],
        weakAreas: [],
        strongAreas: ['Kontratypy', 'Formy stadialne'],
    },
    {
        id: 'commercial',
        name: 'Prawo Handlowe',
        nameShort: 'Handlowe',
        icon: '💼',
        score: 65,
        questionsAnswered: 98,
        questionsTotal: 180,
        streak: 0,
        lastPracticed: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        trend: -5,
        subdomains: [
            { name: 'Spółki osobowe', score: 72 },
            { name: 'Spółka z o.o.', score: 58 },
            { name: 'Spółka akcyjna', score: 62 },
        ],
        weakAreas: ['Przekształcenia spółek', 'Kapitał zakładowy'],
        strongAreas: ['Spółka jawna'],
    },
    {
        id: 'civil_proc',
        name: 'Procedura Cywilna',
        nameShort: 'Proc. cyw.',
        icon: '📋',
        score: 81,
        questionsAnswered: 156,
        questionsTotal: 200,
        streak: 8,
        lastPracticed: new Date(Date.now() - 12 * 60 * 60 * 1000),
        trend: 4,
        subdomains: [
            { name: 'Właściwość sądu', score: 88 },
            { name: 'Postępowanie', score: 78 },
            { name: 'Środki odwoławcze', score: 80 },
        ],
        weakAreas: ['Postępowanie zabezpieczające'],
        strongAreas: ['Apelacja', 'Koszty procesu'],
    },
    {
        id: 'criminal_proc',
        name: 'Procedura Karna',
        nameShort: 'Proc. kar.',
        icon: '🔍',
        score: 73,
        questionsAnswered: 112,
        questionsTotal: 160,
        streak: 3,
        lastPracticed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        trend: 1,
        subdomains: [
            { name: 'Postępowanie przygotowawcze', score: 70 },
            { name: 'Postępowanie sądowe', score: 75 },
            { name: 'Środki przymusu', score: 72 },
        ],
        weakAreas: ['Tymczasowe aresztowanie'],
        strongAreas: ['Akt oskarżenia'],
    },
    {
        id: 'admin',
        name: 'Prawo Administracyjne',
        nameShort: 'Admin.',
        icon: '🏛️',
        score: 68,
        questionsAnswered: 89,
        questionsTotal: 140,
        streak: 1,
        lastPracticed: new Date(Date.now() - 36 * 60 * 60 * 1000),
        trend: -2,
        subdomains: [
            { name: 'Materialne', score: 65 },
            { name: 'Procedura', score: 72 },
            { name: 'Sądowe', score: 68 },
        ],
        weakAreas: ['Decyzja administracyjna', 'Odwołania'],
        strongAreas: ['Właściwość organów'],
    },
    {
        id: 'constitutional',
        name: 'Prawo Konstytucyjne',
        nameShort: 'Konstyt.',
        icon: '👑',
        score: 85,
        questionsAnswered: 76,
        questionsTotal: 90,
        streak: 7,
        lastPracticed: new Date(Date.now() - 8 * 60 * 60 * 1000),
        trend: 5,
        subdomains: [
            { name: 'Prawa i wolności', score: 90 },
            { name: 'Organy państwa', score: 82 },
            { name: 'Źródła prawa', score: 84 },
        ],
        weakAreas: [],
        strongAreas: ['Wolności obywatelskie', 'Trybunał Konstytucyjny'],
    },
    {
        id: 'labor',
        name: 'Prawo Pracy',
        nameShort: 'Praca',
        icon: '👷',
        score: 71,
        questionsAnswered: 67,
        questionsTotal: 100,
        streak: 2,
        lastPracticed: new Date(Date.now() - 20 * 60 * 60 * 1000),
        trend: 0,
        subdomains: [
            { name: 'Umowa o pracę', score: 78 },
            { name: 'Rozwiązanie stosunku', score: 68 },
            { name: 'Czas pracy', score: 65 },
        ],
        weakAreas: ['Urlopy', 'Odpowiedzialność materialna'],
        strongAreas: ['Wypowiedzenie umowy'],
    },
];
