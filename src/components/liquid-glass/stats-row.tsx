'use client';

/**
 * Stats Row
 * 4 glass stat cards with iridescent borders
 */

import { cn } from '@/lib/utils/cn';
import { CheckSquare, TrendingUp, Clock, Star } from 'lucide-react';

interface StatCardProps {
    value: string | number;
    label: string;
    icon: React.ReactNode;
    iconColor: string;
    borderGradient: string;
    className?: string;
}

function StatCard({ value, label, icon, iconColor, borderGradient, className }: StatCardProps) {
    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-transform hover:scale-[1.02]',
                className
            )}
            style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `
                    0 4px 24px rgba(0, 0, 0, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
            }}
        >
            {/* Iridescent border */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    background: borderGradient,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1.5px'
                }}
            />

            <div className={cn('mb-2', iconColor)}>{icon}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 text-center mt-1 leading-tight">
                {label}
            </div>
        </div>
    );
}

interface StatsRowProps {
    tasksToday: number;
    courseProgress: number;
    studyTime: string;
    avgScore: number;
    className?: string;
}

export function StatsRow({
    tasksToday,
    courseProgress,
    studyTime,
    avgScore,
    className,
}: StatsRowProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-4 gap-4 mt-6',
                className
            )}
        >
            <StatCard
                value={tasksToday}
                label="Zadania na dziś"
                icon={<CheckSquare className="w-5 h-5" />}
                iconColor="text-purple-500"
                borderGradient="linear-gradient(180deg, rgba(167, 139, 250, 0.5), rgba(249, 168, 212, 0.3))"
            />
            <StatCard
                value={`${courseProgress}%`}
                label="Postęp kursu"
                icon={<TrendingUp className="w-5 h-5" />}
                iconColor="text-pink-400"
                borderGradient="linear-gradient(180deg, rgba(249, 168, 212, 0.5), rgba(253, 186, 116, 0.3))"
            />
            <StatCard
                value={studyTime}
                label="Czas nauki w tym tygodniu"
                icon={<Clock className="w-5 h-5" />}
                iconColor="text-blue-400"
                borderGradient="linear-gradient(180deg, rgba(147, 197, 253, 0.5), rgba(167, 139, 250, 0.3))"
            />
            <StatCard
                value={avgScore.toFixed(1)}
                label="Średnia ocen"
                icon={<Star className="w-5 h-5" />}
                iconColor="text-amber-400"
                borderGradient="linear-gradient(180deg, rgba(253, 186, 116, 0.5), rgba(249, 168, 212, 0.3))"
            />
        </div>
    );
}
