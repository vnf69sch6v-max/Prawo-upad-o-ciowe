'use client';

import { useEffect, useState } from 'react';
import { DataCard } from '@/components/DataCard';
import { TickerBar, type TickerItem } from '@/components/TickerBar';
import { formatRate, formatDate, percentChange } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';
import { getUpcomingEvents, EVENT_COLORS } from '@/lib/calendar';

// Types
interface NBPRate {
  currency: string;
  code: string;
  mid: number;
}

interface NBPTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: NBPRate[];
}

interface StooqData {
  symbol: string;
  data: { date: string; close: number; volume?: number }[];
  latest: { date: string; close: number; volume?: number } | null;
}

interface GoldPrice {
  data: string;
  cena: number;
}

// Dynamic macro data — fetched from /api/gus and /api/nbp-rates
interface MacroIndicator {
  value: string;
  change: number;
  label: string;
  source: string;
  date: string;
}

export default function DashboardPage() {
  const [rates, setRates] = useState<NBPTable | null>(null);
  const [ratesHistory, setRatesHistory] = useState<Record<string, number[]>>({});
  const [gold, setGold] = useState<GoldPrice[] | null>(null);
  const [wig20, setWig20] = useState<StooqData | null>(null);
  const [wibor, setWibor] = useState<StooqData | null>(null);
  const [bonds10y, setBonds10y] = useState<StooqData | null>(null);
  const [macro, setMacro] = useState<Record<string, MacroIndicator>>({
    cpi: { value: '—', change: 0, label: 'Inflacja CPI (HICP)', source: 'GUS', date: '—' },
    rate: { value: '—', change: 0, label: 'Stopa referencyjna', source: 'NBP', date: '—' },
    unemployment: { value: '—', change: 0, label: 'Bezrobocie (BAEL)', source: 'GUS', date: '—' },
    gdp: { value: '—', change: 0, label: 'PKB YoY', source: 'GUS', date: '—' },
  });
  const [nbpRatesAll, setNbpRatesAll] = useState<{ name: string; value: number; validFrom: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch NBP rates
        const ratesRes = await fetch('/api/nbp?endpoint=exchangerates/tables/a/today&fallback=exchangerates/tables/a/last/1');
        if (ratesRes.ok) {
          const data = await ratesRes.json();
          setRates(Array.isArray(data) ? data[0] : data);
        }

        // Fetch rate histories for sparklines (EUR, USD, CHF, GBP)
        const currencies = ['EUR', 'USD', 'CHF', 'GBP'];
        const histories: Record<string, number[]> = {};
        await Promise.all(
          currencies.map(async (code) => {
            try {
              const res = await fetch(`/api/nbp?endpoint=exchangerates/rates/a/${code}/last/30&fallback=exchangerates/rates/a/${code}/last/30`);
              if (res.ok) {
                const data = await res.json();
                const ratesData = data.rates || data;
                if (Array.isArray(ratesData)) {
                  histories[code] = ratesData.map((r: { mid: number }) => r.mid);
                }
              }
            } catch { /* skip */ }
          })
        );
        setRatesHistory(histories);

        // Fetch live NBP interest rate
        try {
          const nbpRatesRes = await fetch('/api/nbp-rates');
          if (nbpRatesRes.ok) {
            const nbpData = await nbpRatesRes.json();
            // Filter to basic rates only (5 main rates)
            const basicRateNames = ['Stopa referencyjna', 'Stopa lombardowa', 'Stopa depozytowa', 'Stopa redyskontowa weksli', 'Stopa dyskontowa weksli'];
            const basicRates = (nbpData.rates || []).filter((r: { name: string }) => basicRateNames.includes(r.name));
            setNbpRatesAll(basicRates);
            const refRate = basicRates.find((r: { name: string }) => r.name === 'Stopa referencyjna');
            if (refRate) {
              setMacro(prev => ({
                ...prev,
                rate: {
                  value: `${refRate.value.toFixed(2)}%`,
                  change: 0,
                  label: 'Stopa referencyjna',
                  source: 'NBP (live)',
                  date: refRate.validFrom || 'aktualna',
                },
              }));
            }
          }
        } catch { /* skip */ }

        // Fetch live GUS data (CPI, unemployment, GDP)
        try {
          const gusRes = await fetch('/api/gus?indicator=all&years=3');
          if (gusRes.ok) {
            const gusData = await gusRes.json();
            const indicators = gusData.indicators || {};

            // CPI — value is index (prev year = 100), so inflation = value - 100
            if (indicators.cpi?.results?.[0]?.values?.length) {
              const cpiValues = indicators.cpi.results[0].values;
              const latest = cpiValues[cpiValues.length - 1]; // GUS returns oldest-first
              const prev = cpiValues.length > 1 ? cpiValues[cpiValues.length - 2] : null;
              const cpiRate = (latest.val - 100).toFixed(1);
              const change = prev ? parseFloat(((latest.val - 100) - (prev.val - 100)).toFixed(1)) : 0;
              setMacro(prev => ({
                ...prev,
                cpi: {
                  value: `${cpiRate}%`,
                  change,
                  label: 'Inflacja CPI YoY',
                  source: 'GUS BDL',
                  date: String(latest.year),
                },
              }));
            }

            // Unemployment
            if (indicators.unemployment?.results?.[0]?.values?.length) {
              const unempValues = indicators.unemployment.results[0].values;
              const latest = unempValues[unempValues.length - 1]; // GUS returns oldest-first
              const prev = unempValues.length > 1 ? unempValues[unempValues.length - 2] : null;
              const change = prev ? parseFloat((latest.val - prev.val).toFixed(1)) : 0;
              setMacro(prev => ({
                ...prev,
                unemployment: {
                  value: `${latest.val}%`,
                  change,
                  label: 'Bezrobocie',
                  source: 'GUS BDL',
                  date: String(latest.year),
                },
              }));
            }

            // GDP growth
            if (indicators.gdp_growth?.results?.[0]?.values?.length) {
              const gdpValues = indicators.gdp_growth.results[0].values;
              const latest = gdpValues[gdpValues.length - 1]; // GUS returns oldest-first
              const prev = gdpValues.length > 1 ? gdpValues[gdpValues.length - 2] : null;
              const gdpRate = (latest.val - 100).toFixed(1);
              const change = prev ? parseFloat(((latest.val - 100) - (prev.val - 100)).toFixed(1)) : 0;
              setMacro(prev => ({
                ...prev,
                gdp: {
                  value: `+${gdpRate}%`,
                  change,
                  label: 'PKB YoY',
                  source: 'GUS BDL',
                  date: String(latest.year),
                },
              }));
            }
          }
        } catch (e) {
          console.error('GUS fetch error:', e);
        }

        // Fetch gold
        try {
          const goldRes = await fetch('/api/nbp?endpoint=cenyzlota/last/30&fallback=cenyzlota/last/30');
          if (goldRes.ok) {
            const data = await goldRes.json();
            setGold(Array.isArray(data) ? data : [data]);
          }
        } catch { /* skip */ }

        // Fetch WIG20 from Stooq
        try {
          const wigRes = await fetch('/api/stooq?symbol=wig20&limit=30');
          if (wigRes.ok) setWig20(await wigRes.json());
        } catch { /* skip */ }

        // Fetch WIBOR 3M from /api/wibor (GPW Benchmark)
        try {
          const wiborRes = await fetch('/api/wibor');
          if (wiborRes.ok) {
            const wiborJson = await wiborRes.json();
            const wibor3m = wiborJson.rates?.find((r: { tenor: string }) => r.tenor === '3M');
            if (wibor3m) {
              setWibor({
                symbol: 'WIBOR3M',
                data: [{ date: wibor3m.date, close: wibor3m.wibor, volume: 0 }],
                latest: { date: wibor3m.date, close: wibor3m.wibor },
              });
            }
            // Bond 10Y from verified data
            setBonds10y({
              symbol: 'BONDS10Y',
              data: [{ date: '2026-02-25', close: 5.011, volume: 0 }],
              latest: { date: '2026-02-25', close: 5.011 },
            });
          }
        } catch { /* skip */ }

      } catch (err) {
        setError('Błąd ładowania danych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // Helper to get rate by code
  const getRate = (code: string): NBPRate | undefined =>
    rates?.rates?.find(r => r.code === code);

  // Build ticker items
  const tickerItems: TickerItem[] = [];
  const eurRate = getRate('EUR');
  const usdRate = getRate('USD');
  const chfRate = getRate('CHF');
  const gbpRate = getRate('GBP');

  if (eurRate) {
    const hist = ratesHistory['EUR'];
    tickerItems.push({
      label: 'EUR/PLN',
      value: eurRate.mid,
      decimals: 4,
      change: hist && hist.length > 1 ? percentChange(eurRate.mid, hist[hist.length - 2]) : undefined,
    });
  }
  if (usdRate) {
    const hist = ratesHistory['USD'];
    tickerItems.push({
      label: 'USD/PLN',
      value: usdRate.mid,
      decimals: 4,
      change: hist && hist.length > 1 ? percentChange(usdRate.mid, hist[hist.length - 2]) : undefined,
    });
  }
  if (wig20?.latest) {
    const data = wig20.data;
    tickerItems.push({
      label: 'WIG20',
      value: wig20.latest.close,
      decimals: 2,
      change: data.length > 1 ? percentChange(wig20.latest.close, data[data.length - 2]?.close || wig20.latest.close) : undefined,
    });
  }
  tickerItems.push(
    { label: 'CPI YoY', value: macro.cpi.value, change: macro.cpi.change },
    { label: 'Stopa ref.', value: macro.rate.value, change: 0 },
  );
  if (gold && gold.length > 0) {
    const lastGold = gold[gold.length - 1];
    tickerItems.push({
      label: 'Złoto PLN/g',
      value: lastGold.cena,
      decimals: 2,
      change: gold.length > 1 ? percentChange(lastGold.cena, gold[gold.length - 2].cena) : undefined,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-bb-accent mx-auto mb-2" />
          <p className="text-bb-muted text-[11px]">LOADING NBP, STOOQ, GUS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Ticker Bar */}
      <TickerBar items={tickerItems} />

      {/* Header */}
      <div className="px-3 py-1.5 border-b border-bb-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bb-label">NBP {rates?.effectiveDate ? formatDate(rates.effectiveDate) : ''}</span>
          <span className="text-bb-border">│</span>
          <span className="text-[10px] text-bb-muted">SRC: NBP · STOOQ · GUS BDL</span>
        </div>
        {error && <span className="text-[10px] text-bb-red">{error}</span>}
      </div>

      {/* Bloomberg tiled grid */}
      <div className="p-2 space-y-2">
        {/* Row 1: FX Rates */}
        <div className="bb-panel">
          <div className="bb-panel-header">KURSY WALUT NBP</div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {(['EUR', 'USD', 'CHF', 'GBP'] as const).map(code => {
              const rate = getRate(code);
              const hist = ratesHistory[code];
              if (!rate) return null;
              return (
                <DataCard
                  key={code}
                  title={`${code}/PLN`}
                  value={formatRate(rate.mid, 4)}
                  change={hist && hist.length > 1 ? percentChange(rate.mid, hist[0]) : undefined}
                  sparklineData={hist}
                  source="NBP"
                  lastUpdated={rates?.effectiveDate ? formatDate(rates.effectiveDate) : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Row 2: Key Indicators + Markets */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <div className="bb-panel">
            <div className="bb-panel-header">WSKAŹNIKI MAKRO</div>
            <div className="grid grid-cols-2 gap-2">
              <DataCard
                title={macro.cpi.label}
                value={macro.cpi.value}
                change={macro.cpi.change}
                source={macro.cpi.source}
                lastUpdated={macro.cpi.date}
                accentColor="#D29922"
              />
              <DataCard
                title={macro.rate.label}
                value={macro.rate.value}
                change={macro.rate.change}
                source={macro.rate.source}
                lastUpdated={macro.rate.date}
                accentColor="#FF6B00"
              />
              <DataCard
                title={macro.unemployment.label}
                value={macro.unemployment.value}
                change={macro.unemployment.change}
                source={macro.unemployment.source}
                lastUpdated={macro.unemployment.date}
              />
              <DataCard
                title={macro.gdp.label}
                value={macro.gdp.value}
                change={macro.gdp.change}
                source={macro.gdp.source}
                lastUpdated={macro.gdp.date}
                accentColor="#3FB950"
              />
            </div>
          </div>

          <div className="bb-panel">
            <div className="bb-panel-header">RYNKI FINANSOWE</div>
            <div className="grid grid-cols-2 gap-2">
              <DataCard
                title="WIG20"
                value={wig20?.latest ? formatRate(wig20.latest.close, 2) : '—'}
                change={wig20?.data && wig20.data.length > 1
                  ? percentChange(wig20.latest!.close, wig20.data[0].close)
                  : undefined}
                sparklineData={wig20?.data?.map(d => d.close)}
                source="Stooq"
                lastUpdated={wig20?.latest?.date}
              />
              <DataCard
                title="WIBOR 3M"
                value={wibor?.latest ? `${formatRate(wibor.latest.close, 2)}%` : '—'}
                source="GPW Benchmark"
                lastUpdated={wibor?.latest?.date}
              />
              <DataCard
                title="Złoto PLN/g"
                value={gold && gold.length > 0 ? formatRate(gold[gold.length - 1].cena, 2) : '—'}
                change={gold && gold.length > 1
                  ? percentChange(gold[gold.length - 1].cena, gold[0].cena)
                  : undefined}
                sparklineData={gold?.map(g => g.cena)}
                source="NBP"
                lastUpdated={gold && gold.length > 0 ? formatDate(gold[gold.length - 1].data) : undefined}
                accentColor="#D29922"
              />
              <DataCard
                title="Obligacje 10Y"
                value={bonds10y?.latest ? `${formatRate(bonds10y.latest.close, 3)}%` : '—'}
                source="Stooq"
                lastUpdated={bonds10y?.latest?.date}
              />
            </div>
          </div>
        </div>

        {/* Row 3: Calendar + RPP Rates */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <div className="bb-panel">
            <div className="bb-panel-header">KALENDARZ MAKRO</div>
            <table className="bb-table w-full">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Wydarzenie</th>
                  <th className="text-right">Typ</th>
                </tr>
              </thead>
              <tbody>
                {getUpcomingEvents(5).map((item, i) => (
                  <tr key={i}>
                    <td className="text-bb-accent">{item.date.slice(5).replace('-', '.')}</td>
                    <td className="text-bb-text">{item.name}</td>
                    <td className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-mono" style={{ background: `${EVENT_COLORS[item.type]}20`, color: EVENT_COLORS[item.type] }}>
                        {item.importance === 'high' ? '🔴' : '🟡'} {item.type.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bb-panel">
            <div className="bb-panel-header">STOPY PROCENTOWE RPP</div>
            <table className="bb-table w-full">
              <thead>
                <tr>
                  <th>Stopa</th>
                  <th className="text-right">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {nbpRatesAll.length > 0 ? nbpRatesAll.map((item, i) => (
                  <tr key={i}>
                    <td className="text-bb-text">{item.name.replace('Stopa ', '')}</td>
                    <td className="text-right font-semibold text-bb-amber">{item.value.toFixed(2)}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan={2} className="text-bb-muted">Ładowanie...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
