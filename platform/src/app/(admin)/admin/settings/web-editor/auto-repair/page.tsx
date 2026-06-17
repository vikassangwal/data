'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { 
  Activity, AlertTriangle, ShieldCheck, Play, 
  Cpu, Database, Wifi, Wrench, TerminalSquare, 
  CheckCircle2, ServerCrash, RefreshCw, LayoutDashboard,
  Bug, Code, Sparkles, Trash2, ArrowRight, Check, ShieldAlert, FileCode
} from 'lucide-react';
import { 
  getErrorLogs, 
  triggerDiagnosticHealer, 
  applyTheoreticalFix, 
  deleteErrorLog, 
  simulateErrorCrash 
} from '@/app/actions/self-healing';

const DIAGNOSTIC_STEPS = [
  { id: 'db', label: 'Database Cluster Integrity', icon: Database },
  { id: 'api', label: 'API Endpoints & Routing', icon: Wifi },
  { id: 'frontend', label: 'Client UI Components', icon: LayoutDashboard },
  { id: 'ai', label: 'AI Models & Vector DB', icon: Cpu },
  { id: 'cache', label: 'Edge Cache Synchronization', icon: Activity },
];

export default function AutoRepairPage() {
  // Simulator States
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'repairing' | 'healthy'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [issuesFound, setIssuesFound] = useState(0);

  // Live Error Ledger States
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ text: '', type: 'success' });
  const [simulating, setSimulating] = useState<string | null>(null);
  const [healingLogId, setHealingLogId] = useState<string | null>(null);
  const [patchingLogId, setPatchingLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getErrorLogs();
    if (res.logs) {
      setErrorLogs(res.logs);
      if (res.logs.length > 0 && !selectedLog) {
        setSelectedLog(res.logs[0]);
      } else if (res.logs.length > 0 && selectedLog) {
        const updatedSelected = res.logs.find(l => l.id === selectedLog.id);
        if (updatedSelected) setSelectedLog(updatedSelected);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert({ text: '', type: 'success' }), 5000);
  };

  // Simulate server exception
  const handleSimulateCrash = async (type: 'db_timeout' | 'null_ref' | 'api_unauthorized') => {
    setSimulating(type);
    triggerAlert(`Simulating crash: ${type.replace('_', ' ').toUpperCase()}...`);
    
    const res = await simulateErrorCrash(type);
    setSimulating(null);
    
    if (res.error) {
      triggerAlert(res.error, 'error');
    } else {
      triggerAlert('Crash logged! Auto-triggering Gemini diagnostic scan...', 'success');
      await fetchLogs();
      
      // Auto trigger AI healer for the newly created log entry
      if (res.logId) {
        setHealingLogId(res.logId);
        const healRes = await triggerDiagnosticHealer(res.logId);
        setHealingLogId(null);
        if (healRes.error) {
          triggerAlert(`AI Scan Failed: ${healRes.error}`, 'error');
        } else {
          triggerAlert('Gemini diagnostics synchronized successfully!', 'success');
        }
        await fetchLogs();
      }
    }
  };

  // Call Gemini to scan manually
  const handleTriggerHealer = async (logId: string) => {
    setHealingLogId(logId);
    triggerAlert('Invoking Gemini API to parse exception trace...');
    
    const res = await triggerDiagnosticHealer(logId);
    setHealingLogId(null);
    
    if (res.error) {
      triggerAlert(res.error, 'error');
    } else {
      triggerAlert('AI repair details loaded successfully!', 'success');
      await fetchLogs();
    }
  };

  // Apply Theoretical Hotfix
  const handleApplyFix = async (logId: string) => {
    setPatchingLogId(logId);
    triggerAlert('Compiling hotfix validation layers...');
    
    // Slight artificial lag to show visual step sequence
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const res = await applyTheoreticalFix(logId);
    setPatchingLogId(null);
    
    if (res.error) {
      triggerAlert(res.error, 'error');
    } else {
      triggerAlert(res.message || 'Heuristics hotfix applied successfully!', 'success');
      await fetchLogs();
    }
  };

  // Delete Error Log
  const handleDeleteLog = async (id: string) => {
    const res = await deleteErrorLog(id);
    if (res.success) {
      triggerAlert('Log entry purged.');
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
      fetchLogs();
    }
  };

  // Diagnostic Simulator functions
  const startDiagnosis = () => {
    setScanStatus('scanning');
    setLogs(['Initiating System Core Diagnostics...']);
    setProgress(0);
    setCurrentStep(0);
    setIssuesFound(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= DIAGNOSTIC_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          const liveIssues = errorLogs.filter(l => l.status === 'UNRESOLVED').length;
          setLogs(prev => [
            ...prev, 
            `Scan Complete. ${liveIssues > 0 ? `${liveIssues} unresolved server exceptions logged!` : 'Zero runtime exceptions found!'}`
          ]);
          if (liveIssues > 0) {
            setScanStatus('repairing');
            setIssuesFound(liveIssues);
            startRepair();
          } else {
            setScanStatus('healthy');
            setProgress(100);
          }
        }, 1000);
        return;
      }

      const currentLabel = DIAGNOSTIC_STEPS[step].label;
      setLogs(prev => [...prev, `Analyzing [${currentLabel}]...`]);
      setProgress(((step + 1) / DIAGNOSTIC_STEPS.length) * 50); // 50% for scan
      setCurrentStep(step);
      step++;
    }, 1000);
  };

  const startRepair = () => {
    let step = 0;
    const unresolvedLogs = errorLogs.filter(l => l.status === 'UNRESOLVED');
    
    const repairLogs = unresolvedLogs.map(l => `Auto-generating AI hotfixes for exception: "${l.message.substring(0, 45)}..."`)
      .concat([
        'Re-syncing database connection threads...',
        'Purging corrupted edge cache layers...',
        'Checking validation checks...'
      ]);

    const interval = setInterval(() => {
      if (step >= repairLogs.length) {
        clearInterval(interval);
        setLogs(prev => [...prev, 'System Auto-Repair completes. Heuristics stable.']);
        setProgress(100);
        setScanStatus('healthy');
        setIssuesFound(0);
        fetchLogs();
        return;
      }

      const currentRepairLog = repairLogs[step];
      setLogs(prev => [...prev, currentRepairLog]);
      setProgress(50 + ((step + 1) / repairLogs.length) * 50); // Next 50%
      setIssuesFound(prev => Math.max(0, prev - 1));
      step++;
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      {/* Alert Notification */}
      <AnimatePresence>
        {alert.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              alert.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="font-mono text-xs">{alert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Wrench className="w-8 h-8 text-primary animate-pulse" />
            AI Self-Healing & Auto-Debugging Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 font-sans">
            Global unhandled exception catcher coupled with Google Gemini API heuristics diagnostics to repair system bugs in 1-Click.
          </p>
        </div>
      </div>

      {/* SECTION 1: AUTO DIAGNOSTICS & SYSTEM SWEEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
              <Activity className="w-5 h-5 text-primary" />
              Heuristics Status Panel
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-white/60 uppercase font-bold font-mono">Platform Integrity</span>
                {scanStatus === 'idle' ? (
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5 font-mono"><AlertTriangle className="w-4 h-4"/> AWAITING SCAN</span>
                ) : scanStatus === 'healthy' ? (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 font-mono"><ShieldCheck className="w-4 h-4"/> 100% HEALTHY</span>
                ) : (
                  <span className="text-rose-400 font-bold text-xs flex items-center gap-1.5 font-mono animate-pulse"><ServerCrash className="w-4 h-4"/> EXCEPTION ACTIVE</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-white/60 uppercase font-bold font-mono">Unresolved Exceptions</span>
                <span className={`font-bold font-mono text-sm ${errorLogs.filter(l => l.status === 'UNRESOLVED').length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {errorLogs.filter(l => l.status === 'UNRESOLVED').length} Logs
                </span>
              </div>
            </div>

            {/* Test Bug simulator keys */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-white/40 block uppercase tracking-widest mb-1">Trigger Heuristics Crash Simulator</span>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={!!simulating}
                  onClick={() => handleSimulateCrash('db_timeout')}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-mono font-medium transition-all"
                >
                  {simulating === 'db_timeout' ? 'Crashing...' : 'DB Pool Timeout'}
                </button>
                <button
                  disabled={!!simulating}
                  onClick={() => handleSimulateCrash('null_ref')}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-mono font-medium transition-all"
                >
                  {simulating === 'null_ref' ? 'Crashing...' : 'Null Reference'}
                </button>
                <button
                  disabled={!!simulating}
                  onClick={() => handleSimulateCrash('api_unauthorized')}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-mono font-medium transition-all"
                >
                  {simulating === 'api_unauthorized' ? 'Crashing...' : 'JWT Malformed'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={startDiagnosis}
            disabled={scanStatus === 'scanning' || scanStatus === 'repairing'}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 font-mono text-sm"
          >
            {scanStatus === 'scanning' ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> RUNNING CORE ANALYSIS...</>
            ) : scanStatus === 'repairing' ? (
              <><Wrench className="w-4 h-4 animate-bounce" /> RESTORING HEURISTICS...</>
            ) : (
              <><Play className="w-4 h-4" /> SCAN & REPAIR SYSTEM</>
            )}
          </button>
        </GlassCard>

        {/* Right Output Console Log */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full flex flex-col overflow-hidden border-white/10 bg-[#09090b]">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <TerminalSquare className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase">Diagnostic Output Engine</span>
              </div>
              <div className="text-xs font-mono text-white/50">{progress.toFixed(0)}%</div>
            </div>
            <div className="h-1 w-full bg-white/5">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="p-4 flex-1 min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 italic">
                  Awaiting diagnostic scan command...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i}
                    className={`flex gap-3 ${log.includes('Critical') || log.includes('unresolved') ? 'text-rose-400' : log.includes('restored') || log.includes('Complete') || log.includes('stable') ? 'text-emerald-400' : 'text-white/70'}`}
                  >
                    <span className="text-white/20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* SECTION 2: AI AUTO-DEBUGGER SYSTEM LEDGER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-4">
        {/* Left column: Error log entries list */}
        <div className="xl:col-span-4 space-y-4">
          <GlassCard className="p-4 border-white/10 bg-black/40 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-primary" /> Active Exceptions ({errorLogs.length})
              </span>
              <button 
                onClick={fetchLogs} 
                className="text-xs font-mono hover:text-primary transition-colors text-white/60"
              >
                Refresh List
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin flex-1 pr-1">
              {loading && errorLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/40 italic font-mono">Fetching ledger logs...</div>
              ) : errorLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-white/30 italic font-mono bg-white/5 border border-dashed border-white/10 rounded-xl">
                  No server exceptions registered yet. Use the simulators above to generate one!
                </div>
              ) : (
                errorLogs.map(log => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer font-mono text-left ${
                      selectedLog?.id === log.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        log.status === 'APPLIED' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                          : log.status === 'RESOLVED' 
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30' 
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-white truncate max-w-[250px]">{log.message}</h4>
                    {log.filePath && (
                      <span className="text-[10px] text-primary/80 mt-1 block truncate">
                        File: {log.filePath}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column: Debugger Comparison & Diagnostics panel */}
        <div className="xl:col-span-8">
          {selectedLog ? (
            <GlassCard className="p-6 border-white/10 h-full bg-black/35 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bug className="w-5 h-5 text-rose-500" />
                      Exception Trace Overview
                    </h3>
                    {selectedLog.filePath && (
                      <p className="text-xs text-primary font-mono flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" /> Relative File: {selectedLog.filePath}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerHealer(selectedLog.id)}
                      disabled={healingLogId === selectedLog.id}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      {healingLogId === selectedLog.id ? 'Gemini Scanning...' : 'AI Re-Scan'}
                    </button>
                    <button
                      onClick={() => handleDeleteLog(selectedLog.id)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Purge Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Error Summary Banner */}
                <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl mb-6">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block font-mono mb-1">Crash Trace Message</span>
                  <p className="text-sm font-mono text-rose-200">{selectedLog.message}</p>
                </div>

                {/* Gemini Diagnostics Blocks */}
                {selectedLog.rootCause && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-black/60 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono mb-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Root Cause Heuristics
                      </span>
                      <p className="text-xs text-white/80 font-sans leading-relaxed">{selectedLog.rootCause}</p>
                    </div>
                    <div className="p-4 bg-black/60 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-mono mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-accent" /> AI Fix Explanation
                      </span>
                      <p className="text-xs text-white/80 font-sans leading-relaxed">{selectedLog.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Side-by-Side Comparison Window */}
                {selectedLog.codeSnippet && selectedLog.fixedCode ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-mono">Side-by-Side Diagnostic Comparison</span>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Original Crashed Code */}
                      <div className="rounded-xl overflow-hidden border border-rose-500/20 flex flex-col">
                        <div className="px-3 py-2 bg-rose-950/20 border-b border-rose-500/20 flex justify-between items-center text-[10px] font-mono font-bold text-rose-300">
                          <span>⚠️ ORIGINAL CRASHED SNIPPET</span>
                          <span className="text-rose-400">UNSTABLE</span>
                        </div>
                        <pre className="p-3 bg-black/60 text-[10px] text-white/70 overflow-x-auto font-mono min-h-[180px] max-h-[220px] text-left scrollbar-thin">
                          <code>{selectedLog.codeSnippet}</code>
                        </pre>
                      </div>

                      {/* Gemini Fixed Code */}
                      <div className="rounded-xl overflow-hidden border border-emerald-500/20 flex flex-col">
                        <div className="px-3 py-2 bg-emerald-950/20 border-b border-emerald-500/20 flex justify-between items-center text-[10px] font-mono font-bold text-emerald-300">
                          <span>✨ GEMINI PROPOSED AUTO-PATCH</span>
                          <span className="text-emerald-400">STABLE</span>
                        </div>
                        <pre className="p-3 bg-black/60 text-[10px] text-white/90 overflow-x-auto font-mono min-h-[180px] max-h-[220px] text-left scrollbar-thin">
                          <code>{selectedLog.fixedCode}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border border-white/5 bg-white/5 rounded-xl font-mono text-xs text-white/40 italic">
                    {healingLogId === selectedLog.id 
                      ? 'Waiting for Gemini API generation...' 
                      : 'AI Analysis not triggered yet. Click "AI Re-Scan" above to analyze the trace!'}
                  </div>
                )}
              </div>

              {/* Action Button: Apply Patch */}
              {selectedLog.fixedCode && (
                <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center gap-4">
                  <div className="text-xs text-white/40 font-mono text-left">
                    {selectedLog.status === 'APPLIED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Patch successfully applied inside database register.
                      </span>
                    ) : (
                      'Manual approval required. Platform patches require Super-Admin credentials.'
                    )}
                  </div>
                  <button
                    onClick={() => handleApplyFix(selectedLog.id)}
                    disabled={patchingLogId === selectedLog.id || selectedLog.status === 'APPLIED'}
                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs font-mono transition-all active:scale-95 ${
                      selectedLog.status === 'APPLIED'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    {patchingLogId === selectedLog.id ? (
                      <><RefreshCw className="w-4 h-4 animate-spin text-black" /> Deploying Hotfix...</>
                    ) : selectedLog.status === 'APPLIED' ? (
                      <><Check className="w-4 h-4 text-emerald-400" /> Hotfix Applied</>
                    ) : (
                      <><Wrench className="w-4 h-4 text-black animate-pulse" /> Apply Fix & Restore</>
                    )}
                  </button>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center border border-white/10 flex flex-col items-center justify-center h-full">
              <Bug className="w-16 h-16 text-white/20 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-white font-mono">AI Debugger Terminal</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                No exceptions selected from the active ledger listing. Crash a simulator, or select a log entry to load Gemini's proposed fixes.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
