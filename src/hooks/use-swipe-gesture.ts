'use client';

import { useCallback, useRef, useEffect, useState, RefObject } from 'react';
import { useHaptics } from './use-haptics';

export interface SwipeConfig {
    // Minimum distance in pixels to trigger a swipe
    threshold?: number;
    // Maximum time in ms for a swipe gesture
    maxSwipeTime?: number;
    // Add resistance effect for left swipe (increases difficulty feel)
    resistanceOnLeft?: boolean;
    // Resistance factor (0-1, higher = more resistance)
    resistanceFactor?: number;
    // Long press duration in ms
    longPressDuration?: number;
    // Double tap max interval in ms
    doubleTapInterval?: number;
    // Enable haptic feedback
    enableHaptics?: boolean;
    // Callbacks
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onLongPress?: () => void;
    onLongPressEnd?: () => void;
    onDoubleTap?: () => void;
    // Visual feedback callbacks
    onSwipeProgress?: (direction: 'left' | 'right', progress: number) => void;
    onSwipeCancel?: () => void;
}

interface SwipeState {
    startX: number;
    startY: number;
    startTime: number;
    currentX: number;
    isSwiping: boolean;
    direction: 'left' | 'right' | null;
}

interface GestureHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
}

interface UseSwipeGestureReturn {
    handlers: GestureHandlers;
    swipeProgress: number;
    swipeDirection: 'left' | 'right' | null;
    isLongPressing: boolean;
    transform: string;
}

export function useSwipeGesture(config: SwipeConfig = {}): UseSwipeGestureReturn {
    const {
        threshold = 80,
        maxSwipeTime = 500,
        resistanceOnLeft = true,
        resistanceFactor = 0.5,
        longPressDuration = 500,
        doubleTapInterval = 300,
        enableHaptics = true,
        onSwipeLeft,
        onSwipeRight,
        onLongPress,
        onLongPressEnd,
        onDoubleTap,
        onSwipeProgress,
        onSwipeCancel,
    } = config;

    const { trigger, triggerTaptic } = useHaptics();

    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [transform, setTransform] = useState('');

    const stateRef = useRef<SwipeState>({
        startX: 0,
        startY: 0,
        startTime: 0,
        currentX: 0,
        isSwiping: false,
        direction: null,
    });

    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTapRef = useRef<number>(0);
    const isMouseDownRef = useRef(false);

    // Clear long press timer
    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    // Calculate resistance for left swipe
    const applyResistance = useCallback((deltaX: number): number => {
        if (!resistanceOnLeft || deltaX >= 0) return deltaX;

        // Apply exponential resistance for left swipe
        const resistance = Math.pow(Math.abs(deltaX), resistanceFactor);
        return -resistance;
    }, [resistanceOnLeft, resistanceFactor]);

    // Handle start of touch/mouse
    const handleStart = useCallback((clientX: number, clientY: number) => {
        const now = Date.now();

        // Check for double tap
        if (now - lastTapRef.current < doubleTapInterval) {
            if (enableHaptics) trigger('selection');
            onDoubleTap?.();
            lastTapRef.current = 0;
            return;
        }
        lastTapRef.current = now;

        // Initialize swipe state
        stateRef.current = {
            startX: clientX,
            startY: clientY,
            startTime: now,
            currentX: clientX,
            isSwiping: true,
            direction: null,
        };

        setSwipeProgress(0);
        setSwipeDirection(null);
        setTransform('');

        // Start long press timer
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            if (stateRef.current.isSwiping) {
                setIsLongPressing(true);
                if (enableHaptics) trigger('impact-medium');
                onLongPress?.();
            }
        }, longPressDuration);
    }, [clearLongPressTimer, doubleTapInterval, enableHaptics, longPressDuration, onDoubleTap, onLongPress, trigger]);

    // Handle move
    const handleMove = useCallback((clientX: number) => {
        if (!stateRef.current.isSwiping) return;

        const deltaX = clientX - stateRef.current.startX;
        const absDeltaX = Math.abs(deltaX);

        // Cancel long press if moved too much
        if (absDeltaX > 10) {
            clearLongPressTimer();
            if (isLongPressing) {
                setIsLongPressing(false);
                onLongPressEnd?.();
            }
        }

        // Determine direction
        const direction = deltaX > 0 ? 'right' : 'left';
        stateRef.current.direction = direction;
        stateRef.current.currentX = clientX;

        // Calculate progress (0-1)
        const progress = Math.min(absDeltaX / threshold, 1);
        setSwipeProgress(progress);
        setSwipeDirection(direction);

        // Apply resistance for visual feedback
        const visualDelta = direction === 'left'
            ? applyResistance(deltaX)
            : deltaX;

        // Limit max visual displacement
        const maxDisplacement = 150;
        const clampedDelta = Math.max(-maxDisplacement, Math.min(maxDisplacement, visualDelta));

        setTransform(`translateX(${clampedDelta}px) rotate(${clampedDelta * 0.05}deg)`);

        // Haptic feedback at threshold
        if (progress >= 1 && enableHaptics) {
            triggerTaptic('light');
        }

        onSwipeProgress?.(direction, progress);
    }, [applyResistance, clearLongPressTimer, enableHaptics, isLongPressing, onLongPressEnd, onSwipeProgress, threshold, triggerTaptic]);

    // Handle end
    const handleEnd = useCallback(() => {
        clearLongPressTimer();

        if (isLongPressing) {
            setIsLongPressing(false);
            onLongPressEnd?.();
        }

        const state = stateRef.current;
        if (!state.isSwiping) return;

        const deltaX = state.currentX - state.startX;
        const absDeltaX = Math.abs(deltaX);
        const elapsedTime = Date.now() - state.startTime;

        // Check if swipe is valid
        const isValidSwipe = absDeltaX >= threshold && elapsedTime <= maxSwipeTime;

        if (isValidSwipe) {
            if (state.direction === 'right') {
                if (enableHaptics) trigger('success');
                onSwipeRight?.();
            } else if (state.direction === 'left') {
                if (enableHaptics) trigger('error');
                onSwipeLeft?.();
            }
        } else {
            // Swipe cancelled - snap back
            onSwipeCancel?.();
        }

        // Reset state
        stateRef.current = {
            startX: 0,
            startY: 0,
            startTime: 0,
            currentX: 0,
            isSwiping: false,
            direction: null,
        };

        // Animate back to center
        setTransform('translateX(0) rotate(0deg)');
        setSwipeProgress(0);
        setSwipeDirection(null);
    }, [clearLongPressTimer, enableHaptics, isLongPressing, maxSwipeTime, onLongPressEnd, onSwipeCancel, onSwipeLeft, onSwipeRight, threshold, trigger]);

    // Touch handlers
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    }, [handleStart]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX);
    }, [handleMove]);

    const onTouchEnd = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    // Mouse handlers (for desktop testing)
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        isMouseDownRef.current = true;
        handleStart(e.clientX, e.clientY);
    }, [handleStart]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isMouseDownRef.current) return;
        handleMove(e.clientX);
    }, [handleMove]);

    const onMouseUp = useCallback(() => {
        isMouseDownRef.current = false;
        handleEnd();
    }, [handleEnd]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearLongPressTimer();
        };
    }, [clearLongPressTimer]);

    return {
        handlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onMouseDown,
            onMouseMove,
            onMouseUp,
        },
        swipeProgress,
        swipeDirection,
        isLongPressing,
        transform,
    };
}

export default useSwipeGesture;
