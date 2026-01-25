'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Sparkles } from 'lucide-react';

interface StartFlowButtonProps {
    sessionType?: string;
    estimatedMinutes?: number;
    flashcardCount?: number;
    className?: string;
}

export function StartFlowButton({
    sessionType = "Sesja adaptacyjna",
    estimatedMinutes = 5,
    flashcardCount = 3,
    className
}: StartFlowButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push('/immersive-study');
    };

    return (
        <div className={cn("text-center", className)}>
            <button
                onClick={handleClick}
                className={cn(
                    "relative group w-full max-w-md mx-auto",
                    "px-12 py-6 rounded-2xl",
                    "bg-gradient-to-r from-[#2962FF] to-[#448AFF]",
                    "text-white font-bold text-xl",
                    "transition-all duration-300 hover:scale-105",
                    "shadow-lg hover:shadow-2xl",
                    "animate-breathing-glow"
                )}
                style={{
                    boxShadow: '0 0 40px rgba(41, 98, 255, 0.5), 0 0 80px rgba(41, 98, 255, 0.3)'
                }}
            >
                {/* Pulsing ring effect */}
                <div
                    className="absolute inset-0 rounded-2xl opacity-50 animate-ping"
                    style={{
                        background: 'linear-gradient(to right, #2962FF, #448AFF)',
                        animationDuration: '2s'
                    }}
                />

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-3">
                    <Sparkles size={28} className="animate-pulse" />
                    <span>WZMOCNIJ WIEDZĘ</span>
                    <Sparkles size={28} className="animate-pulse" />
                </div>
            </button>

            {/* Subtext */}
            <p className="text-sm text-[var(--text-muted)] mt-4">
                {flashcardCount} fiszki + 1 kazus • ~{estimatedMinutes} min
            </p>

            {/* Session type badge */}
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[var(--bg-hover)] text-xs text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                <span>{sessionType}</span>
            </div>
        </div>
    );
}
