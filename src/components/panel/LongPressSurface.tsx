'use client';

import { useRef, type ReactNode } from 'react';

export function LongPressSurface({
    onLongPress, disabled, children, ms = 520,
}: {
    onLongPress: () => void;
    disabled?: boolean;
    children: ReactNode;
    ms?: number;
}) {
    const timer = useRef<number>(0);
    const start = useRef<{ x: number; y: number } | null>(null);
    const fired = useRef(false);

    const clear = () => {
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = 0;
        start.current = null;
    };

    if (disabled) return <>{children}</>;

    return (
        <div
            onPointerDown={(e) => {
                if (e.button !== 0) return;
                fired.current = false;
                start.current = { x: e.clientX, y: e.clientY };
                timer.current = window.setTimeout(() => {
                    fired.current = true;
                    onLongPress();
                }, ms);
            }}
            onPointerMove={(e) => {
                if (!start.current) return;
                const dx = e.clientX - start.current.x;
                const dy = e.clientY - start.current.y;
                if (dx * dx + dy * dy > 100) clear();
            }}
            onPointerUp={clear}
            onPointerCancel={clear}
            onClickCapture={(e) => {
                if (fired.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    fired.current = false;
                }
            }}
        >
            {children}
        </div>
    );
}
