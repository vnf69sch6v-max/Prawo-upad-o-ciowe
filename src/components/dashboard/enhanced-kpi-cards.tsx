'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface EnhancedKPICardProps {
    title: string;
    value: number;
    previousValue: number;
    format: 'currency' | 'percentage' | 'number' | 'days';
    icon: React.ReactNode;
    sparklineData: number[];
    trend: 'up' | 'down' | 'stable';
    target?: number;
    accentColor?: string;
    onClick?: () => void;
}

// ============================================
// ANIMATED COUNTER HOOK
// ============================================

function useAnimatedCounter(end: number, duration: number = 1500): number {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        countRef.current = 0;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function (easeOutExpo)
            const eased = 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(eased * end);

            setCount(currentValue);
            countRef.current = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
}

// ============================================
// SPARKLINE COMPONENT
// ============================================

function Sparkline({ data, color = '#8b5cf6', height = 32 }: { data: number[]; color?: string; height?: number }) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} 100,${height}`;

    return (
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
            <defs>
                <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={areaPoints}
                fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
            />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

// ============================================
// PROGRESS RING COMPONENT
// ============================================

function ProgressRing({ progress, size = 48, strokeWidth = 4, color = '#8b5cf6', children }: {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    children: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="absolute transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

// ============================================
// FORMAT VALUE HELPER
// ============================================

function formatValue(value: number, format: EnhancedKPICardProps['format']): string {
    switch (format) {
        case 'currency':
            if (value >= 1000) {
                return `{(value / 1000).toFixed(1)}k`;
            }
            return `{value.toLocaleString()}`;
        case 'percentage':
            return `${value}%`;
        case 'days':
            return `${value} dni`;
        case 'number':
        default:
            return value.toLocaleString();
    }
}

// ============================================
// ENHANCED KPI CARD COMPONENT
// ============================================

export function EnhancedKPICard({
    title,
    value,
    previousValue,
    format,
    icon,
    sparklineData,
    trend,
    target,
    accentColor = '#8b5cf6',
    onClick,
}: EnhancedKPICardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const animatedValue = useAnimatedCounter(value);
    const changePercent = previousValue > 0
        ? ((value - previousValue) / previousValue * 100).toFixed(1)
        : '0';
    const isPositive = parseFloat(changePercent) >= 0;

    // Calculate progress to target
    const progressToTarget = target ? Math.min((value / target) * 100, 100) : 0;

    // Pulse animation when value changes
    useEffect(() => {
        setIsPulsing(true);
        const timer = setTimeout(() => setIsPulsing(false), 1000);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 overflow-hidden',
                'bg-[var(--bg-card)] border-[var(--border-color)]',
                isHovered && 'transform -translate-y-1',
                isPulsing && 'animate-pulse',
                onClick && 'cursor-pointer'
            )}
            style={{
                boxShadow: isHovered ? `0 0 30px -10px ${accentColor}` : 'none',
                borderColor: isHovered ? `${accentColor}50` : undefined,
            }}
        >
            {/* Background gradient on hover */}
            <div
                className={cn(
                    'absolute inset-0 opacity-0 transition-opacity duration-300',
                    isHovered && 'opacity-100'
                )}
                style={{
                    background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 50%)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Header: Icon + Trend */}
                <div className="flex items-start justify-between mb-4">
                    {/* Icon with progress ring if target exists */}
                    {target ? (
                        <ProgressRing progress={progressToTarget} color={accentColor}>
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${accentColor}20` }}
                            >
                                {icon}
                            </div>
                        </ProgressRing>
                    ) : (
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${accentColor}20` }}
                        >
                            {icon}
                        </div>
                    )}

                    {/* Trend badge */}
                    <div
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                            trend === 'up' && 'bg-green-500/20 text-green-400',
                            trend === 'down' && 'bg-red-500/20 text-red-400',
                            trend === 'stable' && 'bg-gray-500/20 text-gray-400'
                        )}
                    >
                        {trend === 'up' && <TrendingUp size={12} />}
                        {trend === 'down' && <TrendingDown size={12} />}
                        {trend === 'stable' && <Minus size={12} />}
                        <span>{isPositive ? '+' : ''}{changePercent}%</span>
                    </div>
                </div>

                {/* Title */}
                <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>

                {/* Value with animated counter */}
                <p className="text-3xl font-bold mb-4">
                    {formatValue(animatedValue, format)}
                </p>

                {/* Sparkline */}
                <div className="h-8">
                    <Sparkline data={sparklineData} color={accentColor} height={32} />
                </div>

                {/* Target indicator */}
                {target && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                            <span>Cel: {formatValue(target, format)}</span>
                            <span>{progressToTarget.toFixed(0)}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// KPI CARDS GRID COMPONENT
// ============================================

export interface KPIData {
    knowledgeEquity: { value: number; previous: number; sparkline: number[]; target?: number };
    retentionIndex: { value: number; previous: number; sparkline: number[] };
    studyStreak: { value: number; previous: number; sparkline: number[] };
    accuracy: { value: number; previous: number; sparkline: number[] };
}

interface EnhancedKPICardsGridProps {
    data: KPIData;
    onCardClick?: (cardType: string) => void;
}

export function EnhancedKPICardsGrid({ data, onCardClick }: EnhancedKPICardsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedKPICard
                title="Knowledge Equity"
                value={data.knowledgeEquity.value}
                previousValue={data.knowledgeEquity.previous}
                format="currency"
                icon={<TrendingUp size={20} className="text-emerald-400" />}
                sparklineData={data.knowledgeEquity.sparkline}
                trend={data.knowledgeEquity.value > data.knowledgeEquity.previous ? 'up' : 'down'}
                target={data.knowledgeEquity.target}
                accentColor="#10b981"
                onClick={() => onCardClick?.('knowledgeEquity')}
            />

            <EnhancedKPICard
                title="Retention Index"
                value={data.retentionIndex.value}
                previousValue={data.retentionIndex.previous}
                format="percentage"
                icon={<span className="text-xl">🧠</span>}
                sparklineData={data.retentionIndex.sparkline}
                trend={data.retentionIndex.value > data.retentionIndex.previous ? 'up' : 'down'}
                accentColor="#3b82f6"
                onClick={() => onCardClick?.('retentionIndex')}
            />

            <EnhancedKPICard
                title="Study Streak"
                value={data.studyStreak.value}
                previousValue={data.studyStreak.previous}
                format="days"
                icon={<span className="text-xl">🔥</span>}
                sparklineData={data.studyStreak.sparkline}
                trend={data.studyStreak.value > data.studyStreak.previous ? 'up' : 'stable'}
                accentColor="#f97316"
                onClick={() => onCardClick?.('studyStreak')}
            />

            <EnhancedKPICard
                title="Accuracy"
                value={data.accuracy.value}
                previousValue={data.accuracy.previous}
                format="percentage"
                icon={<span className="text-xl">🎯</span>}
                sparklineData={data.accuracy.sparkline}
                trend={data.accuracy.value > data.accuracy.previous ? 'up' : 'down'}
                accentColor="#8b5cf6"
                onClick={() => onCardClick?.('accuracy')}
            />
        </div>
    );
}
