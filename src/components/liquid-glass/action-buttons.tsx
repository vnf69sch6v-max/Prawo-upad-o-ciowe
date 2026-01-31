'use client';

/**
 * Action Buttons
 * 4 circular glass buttons with iridescent borders
 */

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Zap, BookOpen, Layers, Settings } from 'lucide-react';

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    borderGradient: string;
    hoverColor: string;
    className?: string;
}

function ActionButton({ icon, label, onClick, borderGradient, hoverColor, className }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-center gap-2 group',
                className
            )}
        >
            <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: `
                        0 4px 20px rgba(0, 0, 0, 0.06),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9)
                    `
                }}
            >
                {/* Iridescent circular border */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-70"
                    style={{
                        background: borderGradient,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMaskComposite: 'xor',
                        padding: '2px'
                    }}
                />
                <span className={cn(
                    'text-gray-500 transition-colors',
                    `group-hover:${hoverColor}`
                )} style={{ color: undefined }}>
                    <span className="group-hover:hidden">{icon}</span>
                    <span className="hidden group-hover:block" style={{ color: hoverColor.replace('text-', '') }}>{icon}</span>
                </span>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors font-medium">
                {label}
            </span>
        </button>
    );
}

interface ActionButtonsProps {
    className?: string;
}

export function ActionButtons({ className }: ActionButtonsProps) {
    const router = useRouter();

    return (
        <div
            className={cn(
                'flex justify-center gap-10 mt-10 pb-8',
                className
            )}
        >
            <ActionButton
                icon={<Zap className="w-6 h-6" />}
                label="Quick Quiz"
                onClick={() => router.push('/exam')}
                borderGradient="linear-gradient(135deg, rgba(251, 191, 36, 0.6), rgba(249, 115, 22, 0.4))"
                hoverColor="#F59E0B"
            />
            <ActionButton
                icon={<BookOpen className="w-6 h-6" />}
                label="Biblioteka"
                onClick={() => router.push('/search')}
                borderGradient="linear-gradient(135deg, rgba(167, 139, 250, 0.6), rgba(147, 197, 253, 0.4))"
                hoverColor="#818CF8"
            />
            <ActionButton
                icon={<Layers className="w-6 h-6" />}
                label="Fiszki"
                onClick={() => router.push('/flashcards')}
                borderGradient="linear-gradient(135deg, rgba(52, 211, 153, 0.6), rgba(16, 185, 129, 0.4))"
                hoverColor="#10B981"
            />
            <ActionButton
                icon={<Settings className="w-6 h-6" />}
                label="Ustawienia"
                onClick={() => router.push('/settings')}
                borderGradient="linear-gradient(135deg, rgba(253, 186, 116, 0.5), rgba(249, 168, 212, 0.4))"
                hoverColor="#F472B6"
            />
        </div>
    );
}

