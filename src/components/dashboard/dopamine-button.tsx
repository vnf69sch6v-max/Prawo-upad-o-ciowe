'use client';

import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DopamineButtonProps {
    className?: string;
    recoveryReady?: boolean;
    xpPotential?: number;
}

export function DopamineButton({
    className,
    recoveryReady = true,
    xpPotential = 15
}: DopamineButtonProps) {
    const router = useRouter();

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <button
                onClick={() => router.push('/immersive-study')}
                className={cn(
                    "group relative px-14 py-7 rounded-[2rem] text-white font-bold text-xl lg:text-2xl",
                    "transition-all duration-300 cursor-pointer",
                    "focus:outline-none focus:ring-4 focus:ring-[#651FFF]/40"
                )}
                style={{
                    // Glassmorphism with Electric Blue to Violet gradient
                    background: 'linear-gradient(135deg, #2962FF 0%, #651FFF 50%, #2962FF 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'vapor-flow 3s ease infinite, heartbeat-scale 3s ease-in-out infinite',
                    boxShadow: `
                        0 0 40px rgba(41, 98, 255, 0.5),
                        0 0 80px rgba(101, 31, 255, 0.4),
                        inset 0 0 30px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Liquid energy effect overlay */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Button content */}
                <div className="relative flex items-center gap-4">
                    <Zap
                        size={32}
                        className="text-white drop-shadow-lg"
                        fill="currentColor"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                    />
                    <span
                        className="tracking-wider"
                        style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                    >
                        NEURAL OVERRIDE
                    </span>
                </div>
            </button>

            {/* Subtext - High Reward Focus */}
            <p
                className="mt-4 text-sm text-center font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
                {recoveryReady ? (
                    <>
                        <span className="text-[#00E676]">●</span>
                        {' '}High Reward Session •
                        <span className="text-[#651FFF] font-semibold"> +{xpPotential}XP</span> Potential
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
