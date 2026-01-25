'use client';

import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DopamineButtonProps {
    className?: string;
    recoveryReady?: boolean;
}

export function DopamineButton({ className, recoveryReady = true }: DopamineButtonProps) {
    const router = useRouter();

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <button
                onClick={() => router.push('/immersive-study')}
                className={cn(
                    "group relative px-12 py-6 rounded-3xl text-white font-bold text-xl lg:text-2xl",
                    "dopamine-btn",
                    "transition-all duration-300 cursor-pointer",
                    "focus:outline-none focus:ring-4 focus:ring-[var(--vapor-violet)]/40"
                )}
            >
                {/* Liquid energy effect overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Button content */}
                <div className="relative flex items-center gap-4">
                    <Zap
                        size={28}
                        className="text-white drop-shadow-lg"
                        fill="currentColor"
                    />
                    <span className="tracking-wide">NEURAL OVERRIDE</span>
                </div>
            </button>

            {/* Subtext - reward focused, not work focused */}
            <p className="mt-4 text-sm text-[var(--text-muted)] text-center">
                {recoveryReady ? (
                    <>
                        <span className="text-[var(--accent-success)]">●</span> Recovery Session Ready • <span className="text-[var(--vapor-violet)]">High Reward</span>
                    </>
                ) : (
                    <>
                        <span className="text-orange-400">●</span> Daily boost available
                    </>
                )}
            </p>
        </div>
    );
}
