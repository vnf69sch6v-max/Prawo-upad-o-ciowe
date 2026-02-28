'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const PAGE_NAMES: Record<string, string> = {
    '/': 'DASHBOARD',
    '/fx': 'FX RATES',
    '/market': 'GPW MARKET',
    '/macro': 'MACRO DATA',
    '/rates': 'INTEREST RATES',
    '/trade': 'TRADE & BOP',
};

function getMarketStatus(): { label: string; open: boolean } {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    // GPW: Mon-Fri, 9:00-17:00 CET
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
        return { label: 'OPEN', open: true };
    }
    return { label: 'CLOSED', open: false };
}

export function HeaderBar() {
    const pathname = usePathname();
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [market, setMarket] = useState(getMarketStatus());

    useEffect(() => {
        function tick() {
            const now = new Date();
            setTime(now.toLocaleTimeString('pl-PL', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                timeZone: 'Europe/Warsaw',
            }));
            setDate(now.toLocaleDateString('pl-PL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                timeZone: 'Europe/Warsaw',
            }));
            setMarket(getMarketStatus());
        }
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const pageName = PAGE_NAMES[pathname] || 'DASHBOARD';

    return (
        <header className="h-7 bg-bb-surface border-b border-bb-border flex items-center px-3 gap-4 text-[11px] font-mono select-none shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-1.5">
                <span className="bg-bb-accent text-black font-bold px-1.5 py-0.5 text-[10px] rounded-sm">PL</span>
                <span className="text-bb-text font-semibold tracking-wider">{pageName}</span>
            </div>

            <span className="text-bb-border">│</span>

            {/* Market status */}
            <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${market.open ? 'bg-bb-green' : 'bg-bb-red'}`} />
                <span className="text-bb-muted">GPW:</span>
                <span className={market.open ? 'text-bb-green' : 'text-bb-red'}>{market.label}</span>
            </div>

            <span className="text-bb-border">│</span>

            {/* Date & Time */}
            <div className="flex items-center gap-2">
                <span className="text-bb-muted">{date}</span>
                <span className="text-bb-amber font-semibold">{time}</span>
                <span className="text-bb-muted">CET</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="text-bb-muted text-[10px]">LIVE</span>
            </div>
        </header>
    );
}
