'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, type IChartApi, type CandlestickData, type Time } from 'lightweight-charts';

interface OHLCData {
    date: string;   // YYYY-MM-DD
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface CandlestickChartProps {
    data: OHLCData[];
    height?: number;
    title?: string;
    upColor?: string;
    downColor?: string;
    showVolume?: boolean;
}

export function CandlestickChart({
    data,
    height = 300,
    title,
    upColor = '#22C55E',
    downColor = '#EF4444',
    showVolume = true,
}: CandlestickChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!containerRef.current || data.length === 0) return;

        // Clean up previous chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#64748B',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 10,
            },
            grid: {
                vertLines: { color: '#1E293B' },
                horzLines: { color: '#1E293B' },
            },
            width: containerRef.current.clientWidth,
            height,
            crosshair: {
                mode: 0,
                vertLine: { color: '#FF6B00', width: 1, style: 2 },
                horzLine: { color: '#FF6B00', width: 1, style: 2 },
            },
            timeScale: {
                borderColor: '#1E293B',
                timeVisible: false,
            },
            rightPriceScale: {
                borderColor: '#1E293B',
            },
        });

        chartRef.current = chart;

        // Candlestick series (v5 API)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor,
            downColor,
            borderDownColor: downColor,
            borderUpColor: upColor,
            wickDownColor: downColor,
            wickUpColor: upColor,
        });

        const candleData: CandlestickData<Time>[] = data.map(d => ({
            time: d.date as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        candlestickSeries.setData(candleData);

        // Volume series (histogram below) — v5 API
        if (showVolume && data.some(d => (d.volume ?? 0) > 0)) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#3B82F6',
                priceFormat: { type: 'volume' },
                priceScaleId: 'volume',
            });

            chart.priceScale('volume').applyOptions({
                scaleMargins: { top: 0.8, bottom: 0 },
            });

            volumeSeries.setData(
                data.map(d => ({
                    time: d.date as Time,
                    value: d.volume ?? 0,
                    color: d.close >= d.open ? upColor + '40' : downColor + '40',
                }))
            );
        }

        chart.timeScale().fitContent();

        // Responsive resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, height, upColor, downColor, showVolume]);

    return (
        <div className="data-card">
            {title && (
                <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                    {title}
                </h3>
            )}
            <div ref={containerRef} style={{ width: '100%', height }} />
        </div>
    );
}
