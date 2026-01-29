'use client';

/**
 * Coach Intervention Toast
 * Animated toast for showing coaching interventions (breaks, mode switches, etc.)
 */

import { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import type { Intervention } from '@/lib/agents';
import { cn } from '@/lib/utils/cn';

interface CoachInterventionToastProps {
    intervention: Intervention;
    onAccept: () => void;
    onDismiss: () => void;
    autoHideSeconds?: number;
}

export function CoachInterventionToast({
    intervention,
    onAccept,
    onDismiss,
    autoHideSeconds = 15,
}: CoachInterventionToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Animate in
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Auto-hide for low priority
    useEffect(() => {
        if (intervention.priority === 'low' && autoHideSeconds > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, autoHideSeconds * 1000);
            return () => clearTimeout(timer);
        }
    }, [intervention.priority, autoHideSeconds]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss();
        }, 300);
    };

    const handleAccept = () => {
        setIsExiting(true);
        setTimeout(() => {
            onAccept();
        }, 300);
    };

    const priorityStyles = {
        low: 'border-blue-200 bg-blue-50',
        medium: 'border-amber-200 bg-amber-50',
        high: 'border-red-200 bg-red-50',
    };

    const typeIcons = {
        break: '☕',
        mode_switch: '🔄',
        encouragement: '🌟',
        warning: '⚠️',
    };

    return (
        <div
            className={cn(
                'fixed bottom-24 right-4 z-50 w-80 rounded-2xl shadow-2xl border-2 overflow-hidden',
                'transition-all duration-300 transform',
                isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
                priorityStyles[intervention.priority]
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeIcons[intervention.type] || intervention.icon}</span>
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                            {intervention.title}
                        </h4>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Message */}
            <div className="px-4 pb-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                    {intervention.message}
                </p>
            </div>

            {/* Actions */}
            {intervention.action && (
                <div className="px-4 pb-4 flex gap-2">
                    <button
                        onClick={handleAccept}
                        className={cn(
                            'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium',
                            'flex items-center justify-center gap-2',
                            'transition-all hover:scale-[1.02]',
                            intervention.type === 'break'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : intervention.type === 'mode_switch'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                        )}
                    >
                        {intervention.type === 'break' ? (
                            <>
                                <Check className="w-4 h-4" />
                                {intervention.action.label}
                            </>
                        ) : (
                            <>
                                <ArrowRight className="w-4 h-4" />
                                {intervention.action.label}
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="py-2.5 px-4 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 transition-all"
                    >
                        Później
                    </button>
                </div>
            )}

            {/* Encouragement has no actions, just close */}
            {intervention.type === 'encouragement' && (
                <div className="px-4 pb-4">
                    <button
                        onClick={handleDismiss}
                        className="w-full py-2 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 transition-all"
                    >
                        Dzięki! 💪
                    </button>
                </div>
            )}

            {/* Progress bar for auto-hide */}
            {intervention.priority === 'low' && (
                <div className="h-1 bg-gray-200">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                            animation: `shrink ${autoHideSeconds}s linear forwards`,
                        }}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
