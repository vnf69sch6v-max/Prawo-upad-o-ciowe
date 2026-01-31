'use client';

/**
 * Hero Greeting Card
 * Liquid Glass style greeting with animated wave
 */

import { cn } from '@/lib/utils/cn';

interface HeroGreetingProps {
    userName: string;
    className?: string;
}

export function HeroGreeting({ userName, className }: HeroGreetingProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Dzień dobry';
        if (hour < 18) return 'Cześć';
        return 'Dobry wieczór';
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden px-8 py-12 text-center rounded-3xl',
                className
            )}
            style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9),
                    0 0 0 1px rgba(167, 139, 250, 0.15),
                    0 0 0 3px rgba(249, 168, 212, 0.1)
                `
            }}
        >
            {/* Iridescent border overlay */}
            <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(249, 168, 212, 0.3) 0%, rgba(167, 139, 250, 0.3) 50%, rgba(147, 197, 253, 0.3) 100%)',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '2px'
                }}
            />

            {/* Animated wave - more visible */}
            <div className="absolute inset-0 overflow-hidden">
                <svg
                    className="absolute bottom-0 w-full h-32"
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F9A8D4" />
                            <stop offset="50%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#93C5FD" />
                        </linearGradient>
                        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#93C5FD" />
                            <stop offset="50%" stopColor="#F9A8D4" />
                            <stop offset="100%" stopColor="#A78BFA" />
                        </linearGradient>
                    </defs>

                    {/* Back wave */}
                    <path
                        fill="url(#wave-gradient-2)"
                        fillOpacity="0.3"
                        d="M0,80 C360,40 540,100 900,60 C1260,20 1380,80 1440,60 L1440,120 L0,120 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="10s"
                            repeatCount="indefinite"
                            values="
                                M0,80 C360,40 540,100 900,60 C1260,20 1380,80 1440,60 L1440,120 L0,120 Z;
                                M0,60 C360,100 540,40 900,80 C1260,120 1380,40 1440,80 L1440,120 L0,120 Z;
                                M0,80 C360,40 540,100 900,60 C1260,20 1380,80 1440,60 L1440,120 L0,120 Z"
                        />
                    </path>

                    {/* Front wave */}
                    <path
                        fill="url(#wave-gradient-1)"
                        fillOpacity="0.5"
                        d="M0,64 C320,120 420,20 720,64 C1020,108 1120,20 1440,64 L1440,120 L0,120 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="6s"
                            repeatCount="indefinite"
                            values="
                                M0,64 C320,120 420,20 720,64 C1020,108 1120,20 1440,64 L1440,120 L0,120 Z;
                                M0,84 C320,40 420,100 720,84 C1020,68 1120,100 1440,84 L1440,120 L0,120 Z;
                                M0,64 C320,120 420,20 720,64 C1020,108 1120,20 1440,64 L1440,120 L0,120 Z"
                        />
                    </path>
                </svg>
            </div>

            <h1 className="relative text-3xl font-bold text-gray-800 mb-2">
                {getGreeting()}, {userName}!
            </h1>
            <p className="relative text-gray-500 text-lg">
                Twoja sesja nauki czeka.
            </p>
        </div>
    );
}
