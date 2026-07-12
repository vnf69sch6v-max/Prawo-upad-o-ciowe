'use client';

// Lekki sparkline (inline SVG, stały rozmiar) — do komórek tabeli. Bez ResponsiveContainer.
// Rysuje linię + opcjonalną linię zera; kolor wg znaku ostatniej wartości lub podany.

interface SparklineProps {
    data: (number | null)[];
    width?: number;
    height?: number;
    color?: string;
    zeroLine?: boolean;
    strokeWidth?: number;
}

export function Sparkline({ data, width = 88, height = 26, color, zeroLine = true, strokeWidth = 1.5 }: SparklineProps) {
    const pts = data.filter((v): v is number => v != null);
    if (pts.length < 2) return <span className="text-[11px] text-mk-faint">—</span>;

    const min = Math.min(...pts), max = Math.max(...pts);
    const span = max - min || 1;
    const pad = 2;
    const w = width - pad * 2, h = height - pad * 2;
    // Zbuduj współrzędne tylko dla nie-nullowych, w oryginalnej pozycji na osi X.
    const n = data.length;
    const x = (i: number) => pad + (n === 1 ? w / 2 : (i / (n - 1)) * w);
    const y = (v: number) => pad + h - ((v - min) / span) * h;

    let d = '';
    let started = false;
    data.forEach((v, i) => { if (v == null) return; d += `${started ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `; started = true; });

    const last = pts[pts.length - 1];
    const first = pts[0];
    const stroke = color ?? (last >= first ? '#DC2626' : '#16A34A'); // inflacja rośnie = czerwony
    const zeroY = min <= 0 && max >= 0 ? y(0) : null;

    return (
        <svg width={width} height={height} className="overflow-visible align-middle" role="img" aria-hidden>
            {zeroLine && zeroY != null && <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="#CBD5E1" strokeWidth={0.75} strokeDasharray="2 2" />}
            <path d={d.trim()} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(n - 1 - [...data].reverse().findIndex((v) => v != null))} cy={y(last)} r={1.8} fill={stroke} />
        </svg>
    );
}
