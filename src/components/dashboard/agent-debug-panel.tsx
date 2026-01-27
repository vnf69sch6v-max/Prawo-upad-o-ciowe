'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    Bug,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Database,
    Cpu,
    Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';
import type { BehaviorAnalysis } from '@/lib/agents';

interface AgentLog {
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error' | 'action';
    message: string;
    details?: string;
}

interface AgentDebugPanelProps {
    defaultOpen?: boolean;
    position?: 'bottom-right' | 'bottom-left';
}

export function AgentDebugPanel({
    defaultOpen = false,
    position = 'bottom-right'
}: AgentDebugPanelProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isMinimized, setIsMinimized] = useState(false);
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [analysis, setAnalysis] = useState<BehaviorAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [dataSource, setDataSource] = useState<'unknown' | 'real' | 'empty'>('unknown');

    const addLog = (type: AgentLog['type'], message: string, details?: string) => {
        const log: AgentLog = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type,
            message,
            details
        };
        setLogs(prev => [log, ...prev].slice(0, 50));

        // Also log to console with prefix
        const prefix = '[BehaviorAgent]';
        const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : type === 'action' ? '🔄' : 'ℹ️';
        console.log(`${prefix} ${emoji} ${message}`, details || '');
    };

    const fetchAnalysis = async () => {
        if (!user) {
            addLog('warning', 'Brak użytkownika - nie można pobrać analizy');
            return;
        }

        setLoading(true);
        addLog('action', 'Pobieranie analizy zachowania...');

        try {
            const token = await user.getIdToken();
            const startTime = Date.now();

            const response = await fetch('/api/behavior?type=full', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const elapsed = Date.now() - startTime;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setAnalysis(data.data);
            setLastFetch(new Date());

            // Check data source
            const hasRealData = data.data?.sessionAnalysis?.totalSessions > 0 ||
                Object.keys(data.data?.performanceAnalysis?.weakestTopics || {}).length > 0;

            setDataSource(hasRealData ? 'real' : 'empty');

            addLog('success', `Analiza pobrana w ${elapsed}ms`, JSON.stringify({
                insights: data.data?.insights?.length || 0,
                recommendations: data.data?.recommendations?.length || 0,
                anomalies: data.data?.anomalies?.length || 0,
                dataSource: hasRealData ? 'real' : 'empty'
            }, null, 2));

            // Log specific findings
            if (data.data?.anomalies?.length > 0) {
                addLog('warning', `Wykryto ${data.data.anomalies.length} anomalii`,
                    data.data.anomalies.map((a: { description: string }) => a.description).join(', '));
            }

            if (data.data?.insights?.length > 0) {
                const highPriority = data.data.insights.filter((i: { priority: number }) => i.priority >= 7);
                if (highPriority.length > 0) {
                    addLog('warning', `${highPriority.length} pilnych insights`,
                        highPriority.map((i: { title: string }) => i.title).join(', '));
                }
            }

        } catch (error) {
            addLog('error', 'Błąd pobierania analizy', String(error));
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (user && isOpen) {
            fetchAnalysis();
        }
    }, [user, isOpen]);

    // Log mount
    useEffect(() => {
        addLog('info', 'Agent Debug Panel zamontowany');
        return () => {
            console.log('[BehaviorAgent] Debug Panel odmontowany');
        };
    }, []);

    const positionClasses = position === 'bottom-right'
        ? 'right-4 bottom-4'
        : 'left-4 bottom-4';

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed z-50 p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all",
                    "hover:scale-110 active:scale-95",
                    positionClasses
                )}
                title="Otwórz Agent Debug Panel"
            >
                <Bug size={20} />
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 overflow-hidden",
            "transition-all duration-200",
            positionClasses,
            isMinimized ? "w-64" : "w-96"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-purple-600/20 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-purple-400" />
                    <span className="font-mono text-sm font-medium">BehaviorAgent</span>
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        dataSource === 'real' ? 'bg-green-500/20 text-green-400' :
                        dataSource === 'empty' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                    )}>
                        {dataSource === 'real' ? 'REAL DATA' : dataSource === 'empty' ? 'NO DATA' : 'UNKNOWN'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={fetchAnalysis}
                        disabled={loading}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Odśwież"
                    >
                        <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <XCircle size={14} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Stats */}
                    <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700 grid grid-cols-4 gap-2 text-center">
                        <div>
                            <p className="text-[10px] text-gray-400">Insights</p>
                            <p className="text-lg font-bold text-purple-400">
                                {analysis?.insights?.length || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Recs</p>
                            <p className="text-lg font-bold text-blue-400">
                                {analysis?.recommendations?.length || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Anomalie</p>
                            <p className="text-lg font-bold text-amber-400">
                                {analysis?.anomalies?.length || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Churn</p>
                            <p className="text-lg font-bold text-red-400">
                                {analysis?.engagementAnalysis?.churnRisk
                                    ? `${Math.round(analysis.engagementAnalysis.churnRisk * 100)}%`
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    {analysis && (
                        <div className="px-3 py-2 bg-gray-800/30 border-b border-gray-700 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Engagement Score:</span>
                                <span className={cn(
                                    "font-mono",
                                    (analysis.engagementAnalysis?.engagementScore || 0) > 60 ? 'text-green-400' : 'text-amber-400'
                                )}>
                                    {analysis.engagementAnalysis?.engagementScore || 0}/100
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Accuracy:</span>
                                <span className="font-mono">
                                    {Math.round((analysis.performanceAnalysis?.overallAccuracy || 0) * 100)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Sessions (30d):</span>
                                <span className="font-mono">
                                    {analysis.sessionAnalysis?.totalSessions || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pass Probability:</span>
                                <span className={cn(
                                    "font-mono",
                                    (analysis.predictions?.examPassProbability || 0) > 0.6 ? 'text-green-400' : 'text-red-400'
                                )}>
                                    {Math.round((analysis.predictions?.examPassProbability || 0) * 100)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    <div className="max-h-48 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                Brak logów
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {logs.map(log => (
                                    <div key={log.id} className="px-3 py-2 hover:bg-gray-800/50">
                                        <div className="flex items-start gap-2">
                                            {log.type === 'success' && <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />}
                                            {log.type === 'error' && <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />}
                                            {log.type === 'warning' && <Zap size={12} className="text-amber-400 mt-0.5 shrink-0" />}
                                            {log.type === 'info' && <Database size={12} className="text-blue-400 mt-0.5 shrink-0" />}
                                            {log.type === 'action' && <Cpu size={12} className="text-purple-400 mt-0.5 shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-200">{log.message}</p>
                                                {log.details && (
                                                    <pre className="text-[10px] text-gray-500 mt-1 overflow-x-auto whitespace-pre-wrap">
                                                        {log.details}
                                                    </pre>
                                                )}
                                                <p className="text-[10px] text-gray-600 mt-0.5">
                                                    {log.timestamp.toLocaleTimeString('pl-PL')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-1.5 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {lastFetch ? `Ostatnia aktualizacja: ${lastFetch.toLocaleTimeString('pl-PL')}` : 'Nie pobrano'}
                        </span>
                        <span className="font-mono">v1.0</span>
                    </div>
                </>
            )}
        </div>
    );
}
