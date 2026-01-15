'use client';

import { useState } from 'react';
import { Calendar, Calculator, Clock, Download, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================
// TYPES
// ============================================

interface DeadlinePreset {
    name: string;
    days?: number;
    weeks?: number;
    months?: number;
    years?: number;
    basis: string;
}

// ============================================
// PRESET DEADLINES
// ============================================

const LEGAL_DEADLINES: DeadlinePreset[] = [
    { name: 'Wniosek o uzasadnienie', days: 7, basis: 'Art. 328 § 1 k.p.c.' },
    { name: 'Apelacja', days: 14, basis: 'Art. 369 § 1 k.p.c.' },
    { name: 'Zażalenie', days: 7, basis: 'Art. 394 § 2 k.p.c.' },
    { name: 'Sprzeciw od nakazu zapłaty', days: 14, basis: 'Art. 502 § 1 k.p.c.' },
    { name: 'Skarga kasacyjna', days: 60, basis: 'Art. 398⁵ § 1 k.p.c.' },
    { name: 'Skarga na orzeczenie referendarza', days: 7, basis: 'Art. 398²² § 1 k.p.c.' },
    { name: 'Oświadczenie o spadku', months: 6, basis: 'Art. 1015 § 1 k.c.' },
    { name: 'Przedawnienie - ogólne', years: 6, basis: 'Art. 118 k.c.' },
    { name: 'Przedawnienie - działalność gosp.', years: 3, basis: 'Art. 118 k.c.' },
    { name: 'Odwołanie do KIO', days: 10, basis: 'Art. 515 ust. 1 PZP' },
];

// ============================================
// HELPERS
// ============================================

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getNextBusinessDay(date: Date): Date {
    const result = new Date(date);
    while (isWeekend(result)) {
        result.setDate(result.getDate() + 1);
    }
    return result;
}

function calculateDeadline(
    startDate: Date,
    preset: DeadlinePreset,
    adjustForWeekends: boolean = true
): { date: Date; warnings: string[] } {
    let result = new Date(startDate);
    const warnings: string[] = [];

    if (preset.days) {
        result = addDays(result, preset.days);
    } else if (preset.weeks) {
        result = addDays(result, preset.weeks * 7);
    } else if (preset.months) {
        result = addMonths(result, preset.months);
    } else if (preset.years) {
        result = addYears(result, preset.years);
    }

    // Check if falls on weekend
    if (adjustForWeekends && isWeekend(result)) {
        const dayName = result.getDay() === 0 ? 'niedzielę' : 'sobotę';
        warnings.push(`Termin wypada w ${dayName} - przesunięty na poniedziałek`);
        result = getNextBusinessDay(result);
    }

    return { date: result, warnings };
}

function getDaysRemaining(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// DEADLINE CALCULATOR
// ============================================

export function DeadlineCalculator() {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedPreset, setSelectedPreset] = useState<DeadlinePreset | null>(null);
    const [customDays, setCustomDays] = useState<number>(0);
    const [adjustWeekends, setAdjustWeekends] = useState(true);

    const activePreset = selectedPreset || (customDays > 0 ? { name: 'Niestandardowy', days: customDays, basis: '' } : null);

    const result = activePreset
        ? calculateDeadline(new Date(startDate), activePreset, adjustWeekends)
        : null;

    const daysRemaining = result ? getDaysRemaining(result.date) : 0;

    return (
        <div className="lex-card">
            <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-[#1a365d]" />
                <h3 className="text-lg font-semibold">Kalkulator terminów</h3>
            </div>

            {/* Start Date */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Data początkowa</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                />
            </div>

            {/* Preset Buttons */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Wybierz termin</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {LEGAL_DEADLINES.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedPreset(preset);
                                setCustomDays(0);
                            }}
                            className={cn(
                                'p-3 text-left rounded-xl border transition-all text-sm',
                                selectedPreset === preset
                                    ? 'border-[#1a365d] bg-[#1a365d]/10'
                                    : 'border-[var(--border-color)] hover:border-[#1a365d]/30'
                            )}
                        >
                            <p className="font-medium truncate">{preset.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{preset.basis}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Days */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Lub podaj liczbę dni</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={customDays || ''}
                        onChange={(e) => {
                            setCustomDays(parseInt(e.target.value) || 0);
                            setSelectedPreset(null);
                        }}
                        placeholder="0"
                        min="0"
                        className="flex-1 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                    />
                    <span className="flex items-center px-4 text-[var(--text-muted)]">dni</span>
                </div>
            </div>

            {/* Adjust for weekends */}
            <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input
                    type="checkbox"
                    checked={adjustWeekends}
                    onChange={(e) => setAdjustWeekends(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-hover)] text-[#1a365d] focus:ring-[#1a365d]"
                />
                <span className="text-sm">Przesuń weekendy na poniedziałek</span>
            </label>

            {/* Result */}
            {result && (
                <div className="p-4 bg-[var(--bg-hover)] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Termin upływa:</span>
                        <span className="text-xl font-bold text-[#1a365d]">
                            {result.date.toLocaleDateString('pl-PL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Pozostało:</span>
                        <span className={cn(
                            'font-semibold',
                            daysRemaining <= 3 && 'text-red-400',
                            daysRemaining > 3 && daysRemaining <= 7 && 'text-yellow-400',
                            daysRemaining > 7 && 'text-green-400'
                        )}>
                            {daysRemaining} dni
                        </span>
                    </div>

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                            <div className="text-sm text-yellow-400">
                                {result.warnings.map((w, i) => (
                                    <p key={i}>{w}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legal basis */}
                    {activePreset?.basis && (
                        <p className="text-xs text-[var(--text-muted)]">
                            Podstawa prawna: <span className="text-[#1a365d]">{activePreset.basis}</span>
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button className="flex-1 btn btn-secondary text-sm">
                            <Download size={16} />
                            Dodaj do kalendarza
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// COURT FEE CALCULATOR
// ============================================

const CASE_TYPES = [
    { name: 'Pozew o zapłatę (stosunkowa)', feeType: 'proportional' as const, rate: 0.05, min: 30, max: 200000 },
    { name: 'Pozew w sprawach niemajątkowych', feeType: 'fixed' as const, amount: 600 },
    { name: 'Wniosek o stwierdzenie nabycia spadku', feeType: 'fixed' as const, amount: 100 },
    { name: 'Wniosek o dział spadku', feeType: 'proportional' as const, rate: 0.05, min: 300, max: 100000 },
    { name: 'Pozew o rozwód', feeType: 'fixed' as const, amount: 600 },
    { name: 'Wniosek o ogłoszenie upadłości', feeType: 'fixed' as const, amount: 1000 },
    { name: 'Apelacja', feeType: 'proportional' as const, rate: 0.05, min: 30, max: 200000 },
    { name: 'Zażalenie', feeType: 'fixed' as const, amount: 100 },
    { name: 'Skarga kasacyjna', feeType: 'proportional' as const, rate: 0.05, min: 100, max: 200000 },
];

export function CourtFeeCalculator() {
    const [selectedCase, setSelectedCase] = useState(CASE_TYPES[0]);
    const [amount, setAmount] = useState<number>(10000);

    let fee = 0;
    if (selectedCase.feeType === 'fixed') {
        fee = selectedCase.amount || 0;
    } else if (selectedCase.feeType === 'proportional') {
        const calculated = amount * (selectedCase.rate || 0.05);
        fee = Math.max(selectedCase.min || 0, Math.min(calculated, selectedCase.max || 200000));
    }

    return (
        <div className="lex-card">
            <div className="flex items-center gap-2 mb-6">
                <Calculator className="text-emerald-400" />
                <h3 className="text-lg font-semibold">Kalkulator opłat sądowych</h3>
            </div>

            {/* Case Type */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Rodzaj sprawy</label>
                <select
                    value={selectedCase.name}
                    onChange={(e) => setSelectedCase(CASE_TYPES.find(c => c.name === e.target.value) || CASE_TYPES[0])}
                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                >
                    {CASE_TYPES.map((c, i) => (
                        <option key={i} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Amount input (for proportional fees) */}
            {selectedCase.feeType === 'proportional' && (
                <div className="mb-4">
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Wartość przedmiotu sporu (PLN)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                    />
                </div>
            )}

            {/* Result */}
            <div className="p-4 bg-[var(--bg-hover)] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--text-muted)]">Opłata sądowa:</span>
                    <span className="text-2xl font-bold text-emerald-400">
                        {fee.toLocaleString('pl-PL')} PLN
                    </span>
                </div>

                {selectedCase.feeType === 'proportional' && (
                    <>
                        <div className="text-sm text-[var(--text-muted)] space-y-1">
                            <p>Stawka: {(selectedCase.rate || 0.05) * 100}%</p>
                            <p>Min: {selectedCase.min?.toLocaleString()} PLN / Max: {selectedCase.max?.toLocaleString()} PLN</p>
                        </div>
                    </>
                )}

                <p className="text-xs text-[var(--text-muted)] mt-3">
                    Podstawa: Ustawa o kosztach sądowych w sprawach cywilnych
                </p>
            </div>
        </div>
    );
}

// ============================================
// INTEREST CALCULATOR
// ============================================

const INTEREST_RATES = {
    statutory: { name: 'Ustawowe', rate: 0.1125, basis: 'Art. 359 § 2 k.c.' }, // Example rate
    delayed: { name: 'Za opóźnienie', rate: 0.1225, basis: 'Art. 481 § 2 k.c.' },
    delayed_commercial: { name: 'Za opóźnienie (transakcje handlowe)', rate: 0.145, basis: 'Art. 4 pkt 3 ustawy' },
    tax: { name: 'Podatkowe', rate: 0.115, basis: 'Art. 56 § 1 Ordynacji podatkowej' },
};

export function InterestCalculator() {
    const [principal, setPrincipal] = useState<number>(10000);
    const [interestType, setInterestType] = useState<keyof typeof INTEREST_RATES>('delayed');
    const [startDate, setStartDate] = useState<string>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const rate = INTEREST_RATES[interestType];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = rate.rate / 365;
    const interest = principal * dailyRate * days;
    const total = principal + interest;

    return (
        <div className="lex-card">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="text-blue-400" />
                <h3 className="text-lg font-semibold">Kalkulator odsetek</h3>
            </div>

            {/* Principal */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Kwota główna (PLN)</label>
                <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                />
            </div>

            {/* Interest Type */}
            <div className="mb-4">
                <label className="block text-sm text-[var(--text-muted)] mb-2">Rodzaj odsetek</label>
                <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value as keyof typeof INTEREST_RATES)}
                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                >
                    {Object.entries(INTEREST_RATES).map(([key, val]) => (
                        <option key={key} value={key}>{val.name} ({(val.rate * 100).toFixed(2)}%)</option>
                    ))}
                </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Od dnia</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-[var(--text-muted)] mb-2">Do dnia</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                    />
                </div>
            </div>

            {/* Result */}
            <div className="p-4 bg-[var(--bg-hover)] rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-[var(--text-muted)]">Liczba dni:</span>
                        <span className="ml-2 font-semibold">{days}</span>
                    </div>
                    <div>
                        <span className="text-[var(--text-muted)]">Stawka roczna:</span>
                        <span className="ml-2 font-semibold">{(rate.rate * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                        <span className="text-[var(--text-muted)]">Stawka dzienna:</span>
                        <span className="ml-2 font-semibold">{(dailyRate * 100).toFixed(4)}%</span>
                    </div>
                    <div>
                        <span className="text-[var(--text-muted)]">Dziennie:</span>
                        <span className="ml-2 font-semibold">{(principal * dailyRate).toFixed(2)} PLN</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                    <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Odsetki:</span>
                        <span className="font-bold text-blue-400">{interest.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Razem z kapitałem:</span>
                        <span className="font-bold text-lg">{total.toFixed(2)} PLN</span>
                    </div>
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                    Podstawa: <span className="text-[#1a365d]">{rate.basis}</span>
                </p>
            </div>
        </div>
    );
}
