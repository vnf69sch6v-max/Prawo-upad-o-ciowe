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

    const statusText = isCritical
        ? 'CRITICAL FAILURE RISK'
        : isWarning
            ? 'WARNING: UNSTABLE'
            : 'STATUS: PASSING';

    const statusColor = isCritical
        ? 'var(--alarm-critical)'
        : isWarning
            ? 'var(--accent-warning)'
            : 'var(--accent-success)';

    // Calculate hours until midnight for urgency
    const hoursUntilExam = 420; // Mock: exam in ~17.5 days

    return (
        <div className={cn(
            "relative p-6 rounded-2xl border",
            isCritical && "animate-alarm-pulse border-[var(--alarm-critical)]/50 bg-[var(--alarm-critical)]/5",
            isWarning && "border-orange-500/50 bg-orange-500/5",
            isPassing && "border-[var(--accent-success)]/30 bg-[var(--accent-success)]/5",
            className
        )}>
            {/* Status Header */}
            <div className="text-center mb-4">
                <div
                    className={cn(
                        "text-xs font-mono uppercase tracking-widest mb-2",
                        isCritical && "animate-glitch"
                    )}
                    style={{ color: statusColor }}
                >
                    {statusText}
                </div>

                {/* Large Percentage Display */}
                <div
                    className="text-6xl lg:text-7xl font-black tabular-nums"
                    style={{
                        color: statusColor,
                        textShadow: isCritical
                            ? '0 0 30px rgba(255, 46, 46, 0.5)'
                            : isPassing
                                ? '0 0 20px rgba(0, 230, 118, 0.3)'
                                : undefined
                    }}
                >
                    {readiness}%
                </div>

                {/* Prediction Text */}
                <div className="mt-3 text-sm text-[var(--text-muted)]">
                    {isCritical ? (
                        <span className="text-[var(--alarm-critical)]">
                            Predicted result: <span className="font-bold">FAILED</span>
                        </span>
                    ) : isWarning ? (
                        <span className="text-orange-400">
                            Passing threshold at risk
                        </span>
                    ) : (
                        <span className="text-[var(--accent-success)]">
                            On track to pass
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-[var(--bg-void)] rounded-full overflow-hidden mb-4">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${readiness}%`,
                        background: isCritical
                            ? 'linear-gradient(90deg, #FF2E2E, #FF6B6B)'
                            : isWarning
                                ? 'linear-gradient(90deg, #FF9100, #FFB74D)'
                                : 'linear-gradient(90deg, #00E676, #69F0AE)',
                        boxShadow: `0 0 15px ${statusColor}`
                    }}
                />
            </div>

            {/* Decay Warning */}
            {isCritical && (
                <div className="text-center text-xs text-[var(--text-muted)] font-mono">
                    <span className="text-[var(--alarm-critical)]">▼ -{retentionLoss}%</span> retention daily •
                    <span className="text-[var(--alarm-critical)]"> {hoursUntilExam}h</span> deficit to recover
                </div>
            )}
        </div>
    );
}
