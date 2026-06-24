'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ParticleCanvas from '@/components/vfx/ParticleCanvas';
import RadarPulse from '@/components/vfx/RadarPulse';
import { 
  Play, Check, AlertTriangle, Cpu, Database, Sparkles, Copy, 
  ArrowRight, Search, FileSpreadsheet, Code2, Terminal, ShieldCheck, RefreshCw, X
} from 'lucide-react';

// ==========================================
// 📊 PRELOADED AUTO-REPAIR SAMPLES
// ==========================================
interface ExampleItem {
  name: string;
  desc: string;
  input: string;
  repaired: string;
  originalMarkup: string;
  repairedMarkup: string;
  explanation: string;
  stats: {
    healthBefore: string;
    healthAfter: string;
    warningsResolved: number;
    speedup: string;
  };
}

const FORMULA_EXAMPLES: ExampleItem[] = [
  {
    name: 'Incorrect VLOOKUP index',
    desc: 'VLOOKUP index exceeds array columns boundary, causing lookup error.',
    input: '=IF(A1>10, VLOOKUP("Product A", B2:E20, 5, FALSE))',
    repaired: '=IF(A1>10, VLOOKUP("Product A", B2:E20, 4, FALSE), "")',
    originalMarkup: '=IF(A1>10, VLOOKUP("Product A", B2:E20, <span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">5</span>, FALSE))',
    repairedMarkup: '=IF(A1>10, VLOOKUP("Product A", B2:E20, <span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">4</span>, FALSE)<span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">, ""</span>)',
    explanation: 'Index column changed from 5 to 4 because array B2:E20 contains only 4 columns (B, C, D, E). Added a fallback default empty string value for the outer IF block to avoid FALSE rendering.',
    stats: { healthBefore: '40%', healthAfter: '100%', warningsResolved: 2, speedup: '1.2x' }
  },
  {
    name: 'Double commas in aggregation',
    desc: 'Mismatched list delimiters causing syntactic compilation failure.',
    input: '=SUM(A1:A10,, B1:B10)',
    repaired: '=SUM(A1:A10, B1:B10)',
    originalMarkup: '=SUM(A1:A10<span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">,,</span> B1:B10)',
    repairedMarkup: '=SUM(A1:A10<span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">,</span> B1:B10)',
    explanation: 'Removed consecutive commas inside arguments array to restore valid formula syntax parser.',
    stats: { healthBefore: '30%', healthAfter: '100%', warningsResolved: 1, speedup: '1.5x' }
  },
  {
    name: 'Incomplete IF logic parameters',
    desc: 'IF block lacks fallback argument parameters, producing logic flaws.',
    input: '=AVERAGE(A1:A10) + IF(B1="", 0)',
    repaired: '=AVERAGE(A1:A10) + IF(B1="", 0, B1)',
    originalMarkup: '=AVERAGE(A1:A10) + <span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">IF(B1="", 0)</span>',
    repairedMarkup: '=AVERAGE(A1:A10) + <span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">IF(B1="", 0, B1)</span>',
    explanation: 'Added B1 value fallback return when B1 is not empty, avoiding calculation crashes and restoring logic consistency.',
    stats: { healthBefore: '60%', healthAfter: '100%', warningsResolved: 1, speedup: '1.1x' }
  }
];

const SCRIPT_EXAMPLES: ExampleItem[] = [
  {
    name: 'Invalid Pandas mean parameters',
    desc: 'Newer pandas versions raise syntax crashes when column names are not lists inside aggregations.',
    input: 'df = pd.read_csv("data.csv")\ndf.groupby("Category").mean(["Sales"])',
    repaired: 'df = pd.read_csv("data.csv")\ndf.groupby("Category")["Sales"].mean()',
    originalMarkup: 'df = pd.read_csv("data.csv")\ndf.groupby("Category")<span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">.mean(["Sales"])</span>',
    repairedMarkup: 'df = pd.read_csv("data.csv")\ndf.groupby("Category")<span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">["Sales"].mean()</span>',
    explanation: 'Reordered operations to select columns before computing mean. This eliminates deprecation errors and provides 1.8x faster execution.',
    stats: { healthBefore: '45%', healthAfter: '100%', warningsResolved: 2, speedup: '1.8x' }
  },
  {
    name: 'SQL aggregation selector error',
    desc: 'GROUP BY must include non-aggregate columns, causing engine aborts.',
    input: 'SELECT department, status, SUM(sales) FROM transactions GROUP BY status',
    repaired: 'SELECT department, status, SUM(sales) FROM transactions GROUP BY department, status',
    originalMarkup: 'SELECT department, status, SUM(sales) FROM transactions <span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">GROUP BY status</span>',
    repairedMarkup: 'SELECT department, status, SUM(sales) FROM transactions <span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">GROUP BY department, status</span>',
    explanation: 'Appended "department" column to GROUP BY query sequence to avoid semantic parsing crashes.',
    stats: { healthBefore: '50%', healthAfter: '100%', warningsResolved: 1, speedup: '1.3x' }
  },
  {
    name: 'Python ZeroDivisionError hazard',
    desc: 'Function crashes when dividing values by zero rates during analytics calculation.',
    input: 'def calculate_pct(value, total):\n    return (value / total) * 100',
    repaired: 'def calculate_pct(value, total):\n    if total == 0:\n        return 0.0\n    return (value / total) * 100',
    originalMarkup: 'def calculate_pct(value, total):\n    <span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">return (value / total) * 100</span>',
    repairedMarkup: 'def calculate_pct(value, total):\n    <span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">if total == 0:\n        return 0.0</span>\n    return (value / total) * 100',
    explanation: 'Injected zero-rate check conditions to safe-guard operation pipeline and ensure zero-division integrity.',
    stats: { healthBefore: '55%', healthAfter: '100%', warningsResolved: 3, speedup: '1.05x' }
  }
];

const DATASET_EXAMPLES: ExampleItem[] = [
  {
    name: 'CSV column schema mismatch',
    desc: 'String text symbols nested in numeric pricing column, causing database integrity breaks.',
    input: 'Product A,150,2.5,active\nProduct B,120,,inactive\nProduct C,twelve,1.8,active',
    repaired: 'Product A,150.0,2.5,"active"\nProduct B,120.0,0.0,"inactive"\nProduct C,0.0,1.8,"active"',
    originalMarkup: 'Product A,150,2.5,active\nProduct B,120,<span class="bg-red-500/20 text-red-400 font-bold px-1 rounded"></span>,inactive\nProduct C,<span class="bg-red-500/20 text-red-400 font-bold px-1 rounded">twelve</span>,1.8,active',
    repairedMarkup: 'Product A,150.0,2.5,"active"\nProduct B,120.0,<span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">0.0</span>,"inactive"\nProduct C,<span class="bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">0.0</span>,1.8,"active"',
    explanation: 'Coerced text string "twelve" to 0.0, filled empty numerical cells with 0.0, and standardized categoricals with string quotes.',
    stats: { healthBefore: '35%', healthAfter: '100%', warningsResolved: 3, speedup: '2.4x' }
  }
];

// ==========================================
// ⚙️ DIAGNOSTIC PROCESS LOG FEEDS
// ==========================================
const DIAGNOSTIC_STEPS = [
  { phase: 'Phase 1: Syntactic AST Tree Parsing', text: 'Initializing structural Linter and scanning logic blocks...' },
  { phase: 'Phase 2: Semantic Analysis', text: 'Identifying logic vulnerabilities, mismatched scopes, and parameter threats...' },
  { phase: 'Phase 3: Deep NLP Healing Model', text: 'Applying neural model patches and reconstructive AST sub-trees...' },
  { phase: 'Phase 4: AST Integrity Verification', text: 'Testing compiled source logic. Structural integrity established at 100%!' }
];

export default function AutoRepairPage() {
  const [activeTab, setActiveTab] = useState<'formula' | 'script' | 'dataset'>('formula');
  const [currentInput, setCurrentInput] = useState(FORMULA_EXAMPLES[0].input);
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number>(0);
  
  // Repair Telemetry State
  const [repairState, setRepairState] = useState<'idle' | 'scanning' | 'repaired'>('idle');
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [customErrorAlert, setCustomErrorAlert] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Copy notification state
  const [copied, setCopied] = useState(false);

  // Reference for scrolling console logs
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Map tabs to examples
  const getTabExamples = () => {
    if (activeTab === 'formula') return FORMULA_EXAMPLES;
    if (activeTab === 'script') return SCRIPT_EXAMPLES;
    return DATASET_EXAMPLES;
  };

  const examples = getTabExamples();
  const currentExample = examples[selectedExampleIdx] || null;

  // Handle Tab Switch
  const handleTabChange = (tab: 'formula' | 'script' | 'dataset') => {
    setActiveTab(tab);
    setRepairState('idle');
    setDiagnosticLogs([]);
    setCurrentStepIdx(-1);
    setCustomErrorAlert(null);
    
    let defaultExamples = FORMULA_EXAMPLES;
    if (tab === 'script') defaultExamples = SCRIPT_EXAMPLES;
    if (tab === 'dataset') defaultExamples = DATASET_EXAMPLES;

    setSelectedExampleIdx(0);
    setCurrentInput(defaultExamples[0].input);
  };

  // Handle Example Selection
  const selectExample = (idx: number) => {
    setSelectedExampleIdx(idx);
    setCurrentInput(examples[idx].input);
    setRepairState('idle');
    setDiagnosticLogs([]);
    setCurrentStepIdx(-1);
    setCustomErrorAlert(null);
  };

  // Run Repair Engine Simulator
  const runAutoRepair = () => {
    if (!currentInput.trim()) {
      setCustomErrorAlert('Input code area cannot be empty!');
      return;
    }
    setCustomErrorAlert(null);
    setRepairState('scanning');
    setDiagnosticLogs([]);
    setCurrentStepIdx(0);

    // Staggered log simulator
    let step = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (step < DIAGNOSTIC_STEPS.length) {
        setDiagnosticLogs(prev => [
          ...prev, 
          `[${DIAGNOSTIC_STEPS[step].phase}] — ${DIAGNOSTIC_STEPS[step].text}`
        ]);
        setCurrentStepIdx(step);
        step++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setRepairState('repaired');
      }
    }, 1100);
  };

  // Copy output utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-scroll logs
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diagnosticLogs]);

  return (
    <main className="min-h-screen pb-20 relative">
      {/* ───────────────────────── Particle Network BG ───────────────────────── */}
      <ParticleCanvas />

      {/* ═══════════════════════ HERO TITLE ═══════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-12">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        
        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="primary" className="mb-4 animate-pulse-glow">
              🛡️ AI data self-healing engine
            </Badge>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 tracking-tight text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            AI Code & Data <span className="gradient-text">Self-Healing</span> Engine
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Scan, diagnose, and auto-repair broken spreadsheet formulas, buggy Python/SQL scripts, and corrupted CSV datasets instantly using advanced lexical parsing models.
          </motion.p>
        </Container>
      </section>

      {/* ═══════════════════════ INTERACTIVE SANDBOX ═══════════════════════ */}
      <section className="relative z-10">
        <Container>
          {/* TAB HEADERS SWITCHER */}
          <div className="flex justify-center mb-8">
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => handleTabChange('formula')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'formula'
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Spreadsheet Formulas
              </button>
              <button
                onClick={() => handleTabChange('script')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'script'
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Scripting & SQL
              </button>
              <button
                onClick={() => handleTabChange('dataset')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dataset'
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-4 h-4" />
                CSV Datasets
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: WORKSPACE INPUT EDITOR */}
            <div className="lg:col-span-6 space-y-6">
              <div className="glass-card p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Diagnostic Input Sandbox</span>
                  </div>
                  
                  {/* Select broken preloads selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40 uppercase font-semibold">Examples:</span>
                    <div className="flex gap-1">
                      {examples.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectExample(idx)}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all border cursor-pointer ${
                            selectedExampleIdx === idx
                              ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Info badge */}
                {currentExample && (
                  <div className="bg-white/5 border border-white/5 p-3 rounded-lg mb-4 text-xs">
                    <span className="font-bold text-white/80 block mb-1">🔍 Problem: {currentExample.name}</span>
                    <span className="text-white/60 leading-relaxed block">{currentExample.desc}</span>
                  </div>
                )}

                {/* Main Input Textarea */}
                <div className="relative font-mono text-sm mb-4">
                  <textarea
                    value={currentInput}
                    onChange={(e) => {
                      setCurrentInput(e.target.value);
                      if (repairState !== 'idle') setRepairState('idle');
                    }}
                    placeholder="Enter custom formula, script, or corrupt CSV logs to start diagnostics..."
                    className="w-full h-44 p-4 rounded-xl bg-black/40 border border-white/10 text-white/90 placeholder-white/20 focus:outline-none focus:border-primary/50 resize-none font-mono tracking-tight leading-relaxed transition-all"
                  />
                  
                  {/* Floating code badge indicators */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 font-semibold uppercase tracking-wider">
                      {activeTab === 'formula' ? 'Spreadsheet' : activeTab === 'script' ? 'Python / SQL' : 'CSV'}
                    </span>
                  </div>
                </div>

                {/* Error toast alert if empty input */}
                <AnimatePresence>
                  {customErrorAlert && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4"
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{customErrorAlert}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trigger Diagnose Action Button */}
                <Button
                  onClick={runAutoRepair}
                  disabled={repairState === 'scanning'}
                  variant="primary"
                  className="w-full justify-center gap-2 cursor-pointer relative overflow-hidden"
                >
                  {repairState === 'scanning' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Performing Code Diagnosis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-accent animate-pulse-glow" />
                      Execute Auto-Repair Scan
                    </>
                  )}
                </Button>
              </div>

              {/* DYNAMIC TELEMETRY DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Health index</div>
                  <div className="text-xl md:text-2xl font-black font-mono transition-all">
                    {repairState === 'repaired' ? (
                      <span className="text-emerald-400">{currentExample ? currentExample.stats.healthAfter : '100%'}</span>
                    ) : (
                      <span className="text-red-400">{currentExample ? currentExample.stats.healthBefore : '40%'}</span>
                    )}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Warnings</div>
                  <div className="text-xl md:text-2xl font-black font-mono transition-all">
                    {repairState === 'repaired' ? (
                      <span className="text-emerald-400">0 Resolved</span>
                    ) : (
                      <span className="text-amber-400">{currentExample ? currentExample.stats.warningsResolved : 1} Hazards</span>
                    )}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Speed boost</div>
                  <div className="text-xl md:text-2xl font-black font-mono text-accent">
                    {currentExample ? currentExample.stats.speedup : '1.2x'}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT AREA: SCANNER TERMINAL & DIFF VIEW */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* IDLE / BLANK STATE */}
              {repairState === 'idle' && (
                <div className="glass-card p-12 border border-white/10 text-center flex flex-col items-center justify-center min-h-[350px]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Cpu className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Diagnostic Scan Idle</h3>
                  <p className="text-xs text-white/50 max-w-sm leading-relaxed">
                    Choose one of the corrupted code preloads or write custom scripts on the left, then click the repair button to run our deep healing model.
                  </p>
                </div>
              )}

              {/* SCANNING ACTIVE STATE */}
              {repairState === 'scanning' && (
                <div className="glass-card p-6 border border-white/10 min-h-[350px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Cpu className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white/60">Live Healer Compilation Console</span>
                    </div>

                    {/* Sweep Radar Animation */}
                    <div className="flex justify-center mb-6">
                      <RadarPulse size={120} color="#8B5CF6" rings={3} />
                    </div>

                    {/* Staggered progress logger output */}
                    <div className="font-mono text-xs p-3 rounded-lg bg-black/50 border border-white/5 space-y-2 max-h-[140px] overflow-y-auto">
                      {diagnosticLogs.map((log, idx) => (
                        <div key={idx} className="text-white/80 leading-relaxed">
                          <span className="text-emerald-400">✓</span> {log}
                        </div>
                      ))}
                      <div ref={consoleBottomRef} />
                    </div>
                  </div>

                  {/* Active logs summary status */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-white/40 uppercase tracking-widest mt-4">
                    <span>Scanner parsing...</span>
                    <span>Step {currentStepIdx + 1} / 4</span>
                  </div>
                </div>
              )}

              {/* REPAIRED AND RESOLVED DIFF OUTPUT */}
              {repairState === 'repaired' && (
                <div className="glass-card p-6 border border-white/10 min-h-[350px] space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Logic Integrity Restored</span>
                    </div>
                    
                    {/* Copy repaired button */}
                    <button
                      onClick={() => copyToClipboard(currentExample ? currentExample.repaired : currentInput)}
                      className="px-3.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Healed Script
                        </>
                      )}
                    </button>
                  </div>

                  {/* SIDE-BY-SIDE DIFF HIGHLIGHT */}
                  <div className="space-y-4 font-mono text-xs">
                    
                    {/* Corrupted Source Code Output */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Original Syntax Code</div>
                      <div 
                        className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/10 text-white/90 leading-relaxed overflow-x-auto whitespace-pre"
                        dangerouslySetInnerHTML={{ __html: currentExample ? currentExample.originalMarkup : currentInput }}
                      />
                    </div>

                    {/* Green Healed Source Code Output */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Repaired Syntax Code</div>
                      <div 
                        className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/10 text-white/90 leading-relaxed overflow-x-auto whitespace-pre animate-shimmer"
                        dangerouslySetInnerHTML={{ __html: currentExample ? currentExample.repairedMarkup : currentInput }}
                      />
                    </div>
                  </div>

                  {/* AST Explanation Box */}
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Refactoring Details:
                    </span>
                    <p className="text-white/70 leading-relaxed">
                      {currentExample ? currentExample.explanation : 'Syntax fully validated and corrected according to standard AST compliance parameters.'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
