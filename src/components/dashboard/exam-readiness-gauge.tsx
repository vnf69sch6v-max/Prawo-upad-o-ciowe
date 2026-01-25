'use client';

import { cn } from '@/lib/utils/cn';

interface ExamReadinessGaugeProps {
    readiness: number; // 0-100
    retentionLoss?: number; // daily loss %
    className?: string;
}

export function ExamReadinessGauge({
    readiness,
    retentionLoss = 2,
    className
}: ExamReadinessGaugeProps) {
    const isCritical = readiness < 50;
    const isWarning = readiness >= 50 && readiness < 70;
    const isPassing = readiness >= 70;

    // SVG radial gauge calculations
    const radius = 90;
    const strokeWidth = 12;
    const circumference = Math.PI * radius; // Semi-circle
    const progress = (readiness / 100) * circumference;

    const statusColor = isCritical
        ? '#FF1744' // Neon Red
        : isWarning
            ? '#FF9100' // Warning Orange
            : '#00E676'; // Matrix Green

    const estimatedResult = isCritical
        ? 'FAIL'
        : isWarning
            ? 'AT RISK'
            : 'PASS';

    return (
        <div className={cn(
            "relative p-6 rounded-2xl border text-center",
            isCritical && "animate-alarm-pulse border-[#FF1744]/50 bg-[#FF1744]/5",
            isWarning && "border-orange-500/50 bg-orange-500/5",
            isPassing && "border-[#00E676]/30 bg-[#00E676]/5",
            className
        )}>
            {/* Semi-circular Radial Gauge */}
            <div className="relative mx-auto" style={{ width: 200, height: 110 }}>
                <svg
                    width="200"
                    height="110"
                    viewBox="0 0 200 110"
                    className="overflow-visible"
                >
                    {/* Background arc */}
                    <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${progress} ${circumference}`}
                        style={{
                            filter: isCritical
                                ? 'drop-shadow(0 0 15px rgba(255, 23, 68, 0.8))'
                                : isPassing
                                    ? 'drop-shadow(0 0 10px rgba(0, 230, 118, 0.6))'
                                    : 'drop-shadow(0 0 10px rgba(255, 145, 0, 0.6))',
                            transition: 'stroke-dasharray 0.5s ease'
                        }}
                    />
                </svg>

                {/* Large Percentage in Center */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-end pb-0"
                >
                    <span
                        className={cn(
                            "text-6xl font-black tabular-nums",
                            isCritical && "animate-glitch"
                        )}
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: statusColor,
                            textShadow: isCritical
                                ? '0 0 30px rgba(255, 23, 68, 0.7)'
                                : isPassing
                                    ? '0 0 20px rgba(0, 230, 118, 0.5)'
                                    : undefined
                        }}
                    >
                        {readiness}%
                    </span>
                </div>
            </div>

            {/* Status Label */}
            <div
                className={cn(
                    "mt-4 text-xs font-mono uppercase tracking-[0.3em]",
                    isCritical && "animate-pulse"
                )}
                style={{ color: statusColor }}
            >
                EXAM READINESS
            </div>

            {/* Prediction Text - Monospace Data Style */}
            <div
                className="mt-3 text-sm font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
                {isCritical ? (
                    <span className="text-[#FF1744]">
                        Estimated Result: <span className="font-bold">{estimatedResult}</span>
                    </span>
                ) : isWarning ? (
                    <span className="text-orange-400">
                        Passing threshold at risk
                    </span>
                ) : (
                    <span className="text-[#00E676]">
                        On track to pass
                    </span>
                )}
            </div>

            {/* Decay Warning - Data Terminal Style */}
            {isCritical && (
                <div
                    className="mt-2 text-xs text-[var(--text-muted)] font-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                    Knowledge decay rate: <span className="text-[#FF1744]">-{retentionLoss}%</span>/day
                </div>
            )}
        </div>
    );
}
