'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface ExamReadinessProps {
    correctAnswers: number;
    totalQuestions: number;
    targetPercentage?: number;
    examName?: string;
    className?: string;
}

export function ExamReadiness({
    correctAnswers,
    totalQuestions,
    targetPercentage = 70,
    examName = "egzamin radcowski",
    className
}: ExamReadinessProps) {
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const isPassing = percentage >= targetPercentage;
    const gap = targetPercentage - percentage;

    // Color based on readiness
    const getColor = () => {
        if (percentage >= 80) return 'var(--accent-success)';
        if (percentage >= 70) return 'var(--accent-warning)';
        return 'var(--accent-danger)';
    };

    const color = getColor();

    // Message based on status
    const getMessage = () => {
        if (percentage >= 80) return { text: 'ZALICZONY', emoji: '✅', subtext: 'Jesteś gotowy!' };
        if (percentage >= 70) return { text: 'NA GRANICY', emoji: '⚠️', subtext: 'Jeszcze trochę!' };
        return { text: 'NIEZALICZONY', emoji: '❌', subtext: `Brakuje ${gap}%` };
    };

    const message = getMessage();

    // SVG Circle properties
    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    return (
        <div className={cn("glass-card text-center", className)}>
            {/* Header */}
            <p className="text-sm text-[var(--text-muted)] mb-4">
                Gdyby {examName} był dzisiaj...
            </p>

            {/* Circular Progress */}
            <div className="relative inline-block mb-4">
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        className="transition-all duration-1000"
                        style={{
                            filter: `drop-shadow(0 0 10px ${color})`
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color }}>
                        {percentage}%
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                        gotowość
                    </span>
                </div>
            </div>

            {/* Status Message */}
            <div
                className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg",
                    !isPassing && "animate-pulse"
                )}
                style={{
                    background: `color-mix(in srgb, ${color} 20%, transparent)`,
                    color: color
                }}
            >
                <span>{message.emoji}</span>
                <span>{message.text}</span>
            </div>

            {/* Subtext */}
            <p className="text-sm text-[var(--text-muted)] mt-3">
                {message.subtext}
            </p>

            {/* Progress breakdown */}
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                <div>
                    <span className="font-bold text-[var(--text-primary)]">{correctAnswers}</span>
                    <span> poprawnych</span>
                </div>
                <div>
                    <span className="font-bold text-[var(--text-primary)]">{totalQuestions}</span>
                    <span> wszystkich</span>
                </div>
                <div>
                    <span className="font-bold text-[var(--text-primary)]">{targetPercentage}%</span>
                    <span> wymagane</span>
                </div>
            </div>
        </div>
    );
}
