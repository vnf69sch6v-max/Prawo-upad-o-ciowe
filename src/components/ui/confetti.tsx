'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ConfettiProps {
    active: boolean;
    duration?: number;
    particleCount?: number;
}

export function Confetti({ active, duration = 3000, particleCount = 50 }: ConfettiProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    if (!isVisible) return null;

    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        color: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
        rotation: Math.random() * 360,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${particle.left}%`,
                        top: '-20px',
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${duration / 1000}s`,
                    }}
                />
            ))}
        </div>
    );
}
