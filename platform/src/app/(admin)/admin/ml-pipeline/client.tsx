'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Cpu, Play, CheckCircle, AlertTriangle, TrendingUp, 
  Activity, FileText, Sparkles, RefreshCw, Settings, Database, 
  ShieldAlert, Check, ChevronRight, X, Eye, ShieldCheck, BarChart4
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { runMlPipeline, getAdminAlerts, resolveAdminAlert } from '@/app/actions/ml-pipeline';
import dynamic from 'next/dynamic';

// Dynamically import Plot to prevent Next.js SSR crashes
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-black/20 rounded-lg border border-white/5 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <span className="text-muted-foreground text-sm font-medium">Initializing Visualization Engine...</span>
      </div>
    </div>
  )
});

const PIPELINE_STEPS = [
  { id: 'ingestion', label: 'Ingesting & Profiling Dataset', description: 'Reading CSV/JSON structure and data types.' },
  { id: 'cleaning', label: 'Executing Feature Engineering & Imputation', description: 'Handling missing values and outliers.' },
  { id: 'training', label: 'Selecting & Fitting Machine Learning Models', description: 'Evaluating regressions, classifications, or cluster segments.' },
  { id: 'anomalies', label: 'Scanning for Anomalies & Structural Shifts', description: 'Running statistical Z-score fraud check.' },
  { id: 'gemini', label: 'Consulting Gemini Enterprise AI Agent', description: 'Synthesizing strategic business recommendations.' }
];

export default function MlPipelineClient({ 
  initialDatasets, 
  initialAlerts 
}: { 
  initialDatasets: any[]; 
  initialAlerts: any[]; 
}) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [selectedDatasetId, setSelectedDatasetId] = useState(initialDatasets[0]?.id || '');
  const [targetColumn, setTargetColumn] = useState('');
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activeTab, setActiveTab] = useState<'insights' | 'model' | 'cleaning' | 'anomalies'>('insights');
  
  // Pipeline State
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  
  // Results State
  const [pipelineResults, setPipelineResults] = useState<any | null>(null);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [alertActionLoading, setAlertActionLoading] = useState<string | null>(null);

  // Poll for pipeline steps during simulation
  useEffect(() => {
    let interval: any;
    if (isRunning && currentStepIdx < PIPELINE_STEPS.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < PIPELINE_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500); // Progress step every 2.5s
    }
    return () => clearInterval(interval);
  }, [isRunning, currentStepIdx]);

  // Escape key handler to close alert drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAlertDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartPipeline = async () => {
    if (!selectedDatasetId) return;
    
    setIsRunning(true);
    setCurrentStepIdx(0);
    setPipelineError(null);
    setPipelineResults(null);

    try {
      // Trigger Next.js server action
      const result = await runMlPipeline(selectedDatasetId, targetColumn.trim() || undefined);
      
      if (!result.success) {
        setPipelineError(result.error || 'Failed to complete the ML pipeline.');
        setIsRunning(false);
      } else {
        // Wait to finish the animations if needed, or jump to end
        setCurrentStepIdx(PIPELINE_STEPS.length - 1);
        setTimeout(() => {
          setPipelineResults(result);
          setIsRunning(false);
          // Auto refresh alerts in background
          refreshAlerts();
        }, 1500);
      }
    } catch (err: any) {
      setPipelineError(err.message || 'An unexpected error occurred during execution.');
      setIsRunning(false);
    }
  };

  const refreshAlerts = async () => {
    const freshAlerts = await getAdminAlerts();
    setAlerts(freshAlerts);
  };

  const handleResolveAlert = async (alertId: string) => {
    setAlertActionLoading(alertId);
    const res = await resolveAdminAlert(alertId);
    if (res.success) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true } : a));
    }
    setAlertActionLoading(null);
  };

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  const activeAlertsCount = alerts.filter(a => !a.isResolved).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            <Brain className="w-8 h-8 text-primary" />
            Centralized AI Data Lab & ML Pipeline
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Auto-clean datasets, engineer predictive features, audit fraud anomalies, and compile boardroom AI insights.
          </p>
        </div>

        {/* Floating Scanner Alerts Badge */}
        <button 
          onClick={() => setIsAlertDrawerOpen(true)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
            activeAlertsCount > 0 
              ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 shadow-lg shadow-red-500/10 hover:shadow-red-500/20' 
              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${activeAlertsCount > 0 ? 'animate-bounce' : ''}`} />
          <span>Scanner Audit Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border border-background">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Controller Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Card */}
        <GlassCard className="p-6 h-fit space-y-6 bg-card border border-white/5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-white">Pipeline Parameters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Select Active Dataset
              </label>
              {datasets.length === 0 ? (
                <div className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  No datasets found in Admin Panel. Please upload datasets first under Datasets tab.
                </div>
              ) : (
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.files?.[0]?.fileType?.toUpperCase() || 'CSV'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Target Variable / Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. churn, revenue, conversion"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                disabled={isRunning}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 transition-all disabled:opacity-50"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Leave empty for automatic detection or unsupervised K-Means segmentation.
              </p>
            </div>

            {selectedDataset && (
              <div className="bg-white/5 rounded-lg p-4 space-y-2.5 border border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original File:</span>
                  <span className="text-white font-medium break-all">{selectedDataset.files?.[0]?.fileName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="text-white font-medium">
                    {selectedDataset.files?.[0] ? `${(selectedDataset.files[0].fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source Type:</span>
                  <span className="text-white font-medium uppercase">{selectedDataset.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose:</span>
                  <span className="text-white font-medium capitalize">{selectedDataset.purpose || 'General'}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleStartPipeline}
              disabled={isRunning || datasets.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-600 disabled:from-muted-foreground/20 disabled:to-muted-foreground/20 disabled:text-muted-foreground text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 transform active:scale-95 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Orchestrate Pipeline</span>
            </button>
          </div>
        </GlassCard>

        {/* Right Running Monitor / Output Area */}
        <div className="lg:col-span-2">
          {isRunning ? (
            /* Pipeline Execution Loader */
            <GlassCard className="p-8 h-full flex flex-col justify-center bg-card border border-white/5 min-h-[400px]">
              <div className="max-w-md mx-auto w-full space-y-8">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Cpu className="w-12 h-12 text-primary animate-spin-slow relative" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">AI ML Engine Processing...</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Spawning Python ML processes, running feature cleaning matrices, auditing outlier arrays, and querying Gemini Enterprise.
                  </p>
                </div>

                <div className="space-y-4">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    
                    return (
                      <div 
                        key={step.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/5 border-primary/20 text-white' 
                            : isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80' 
                              : 'bg-black/10 border-white/5 text-muted-foreground opacity-50'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                          ) : isActive ? (
                            <RefreshCw className="w-4.5 h-4.5 text-primary animate-spin" />
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{step.label}</div>
                          {isActive && <div className="text-[10px] text-muted-foreground mt-0.5">{step.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          ) : pipelineError ? (
            /* Error Card */
            <GlassCard className="p-8 h-full flex flex-col justify-center items-center text-center bg-card border border-red-500/10 min-h-[400px]">
              <div className="max-w-md space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Pipeline Execution Failed</h3>
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 rounded-lg p-4 text-xs font-mono text-left overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {pipelineError}
                </div>
                <button
                  onClick={handleStartPipeline}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Execution
                </button>
              </div>
            </GlassCard>
          ) : pipelineResults ? (
            /* Results Panel */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-white/5 bg-black/20 p-1 rounded-lg">
                {(['insights', 'model', 'cleaning', 'anomalies'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-primary text-white shadow' 
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'insights' && '✨ AI insights'}
                    {tab === 'model' && '📊 Predictive Model'}
                    {tab === 'cleaning' && '🧹 Data Cleaning'}
                    {tab === 'anomalies' && `⚠️ Anomalies (${pipelineResults.anomalies?.length || 0})`}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'insights' && (
                    /* Gemini AI Insights */
                    <GlassCard className="p-6 bg-card border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-white text-base">Gemini Boardroom Briefing</h3>
                      </div>
                      <div className="text-sm text-gray-300 leading-relaxed font-sans prose prose-invert max-w-none prose-sm whitespace-pre-wrap">
                        {pipelineResults.gemini_insights}
                      </div>
                    </GlassCard>
                  )}

                  {activeTab === 'model' && (
                    /* Predictive Models Panel */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="p-4 border border-white/5 bg-black/25">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Column</span>
                          <div className="text-lg font-extrabold text-white mt-1 uppercase break-all">
                            {pipelineResults.model_info.target_column || 'AUTO-SELECT'}
                          </div>
                        </GlassCard>
                        <GlassCard className="p-4 border border-white/5 bg-black/25">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Algorithm Used</span>
                          <div className="text-lg font-extrabold text-white mt-1">
                            {pipelineResults.model_info.algorithm}
                          </div>
                        </GlassCard>
                        <GlassCard className="p-4 border border-white/5 bg-black/25">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {pipelineResults.model_info.type === 'classification' ? 'Accuracy Metric' : 'R² Score Metric'}
                          </span>
                          <div className="text-lg font-extrabold text-emerald-400 mt-1">
                            {pipelineResults.model_info.type === 'classification'
                              ? `${(pipelineResults.model_info.metrics.accuracy * 100).toFixed(2)}%`
                              : pipelineResults.model_info.metrics.r2_score?.toFixed(4) || 'N/A'
                            }
                          </div>
                        </GlassCard>
                      </div>

                      {/* Feature Importances (if classification/regression) */}
                      {pipelineResults.model_info.feature_importances && Object.keys(pipelineResults.model_info.feature_importances).length > 0 && (
                        <GlassCard className="p-6 border border-white/5 bg-black/25">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Feature Importances Weight</h4>
                          <div className="space-y-3">
                            {Object.entries(pipelineResults.model_info.feature_importances).map(([col, imp]: any) => (
                              <div key={col} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-white">
                                  <span>{col}</span>
                                  <span>{(imp * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${imp * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      )}

                      {/* Plotly Chart */}
                      {pipelineResults.visualization && (
                        <GlassCard className="p-6 border border-white/5 overflow-hidden bg-black/25">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Interactive Plotly Telemetry</h4>
                          <div className="w-full overflow-x-auto">
                            <Plot
                              data={pipelineResults.visualization.data}
                              layout={{
                                ...pipelineResults.visualization.layout,
                                autosize: true,
                                margin: { l: 50, r: 20, t: 40, b: 50 },
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { color: '#9CA3AF', size: 11 },
                                xaxis: {
                                  gridcolor: 'rgba(255,255,255,0.05)',
                                  zerolinecolor: 'rgba(255,255,255,0.1)'
                                },
                                yaxis: {
                                  gridcolor: 'rgba(255,255,255,0.05)',
                                  zerolinecolor: 'rgba(255,255,255,0.1)'
                                }
                              }}
                              config={{ responsive: true, displayModeBar: false }}
                              className="w-full min-h-[350px]"
                            />
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  )}

                  {activeTab === 'cleaning' && (
                    /* Cleaning Tab */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="p-4 border border-white/5 bg-black/25 text-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Imputed Null Values</span>
                          <div className="text-2xl font-extrabold text-white mt-1">
                            {pipelineResults.cleaning.imputed_count}
                          </div>
                        </GlassCard>
                        <GlassCard className="p-4 border border-white/5 bg-black/25 text-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outliers Replaced</span>
                          <div className="text-2xl font-extrabold text-white mt-1">
                            {pipelineResults.cleaning.outliers_detected}
                          </div>
                        </GlassCard>
                        <GlassCard className="p-4 border border-white/5 bg-black/25 text-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engineered Features</span>
                          <div className="text-2xl font-extrabold text-white mt-1">
                            {pipelineResults.cleaning.features_added?.length || 0}
                          </div>
                        </GlassCard>
                      </div>

                      {pipelineResults.cleaning.features_added && pipelineResults.cleaning.features_added.length > 0 && (
                        <GlassCard className="p-6 border border-white/5 bg-black/25">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Generated Feature Fields</h4>
                          <div className="flex flex-wrap gap-2">
                            {pipelineResults.cleaning.features_added.map((f: string) => (
                              <span key={f} className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
                                {f}
                              </span>
                            ))}
                          </div>
                        </GlassCard>
                      )}

                      {/* Dataset Schema Profile */}
                      <GlassCard className="border border-white/5 bg-black/25 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-black/20">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cleaned Dataset Schema Profile</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-black/40 border-b border-white/5 text-muted-foreground font-semibold uppercase">
                              <tr>
                                <th className="px-6 py-3">Column Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Unique Values</th>
                                <th className="px-6 py-3">Missing Values</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {pipelineResults.data_profile.map((profile: any) => (
                                <tr key={profile.name} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-3 font-semibold text-white">{profile.name}</td>
                                  <td className="px-6 py-3 text-muted-foreground">{profile.type}</td>
                                  <td className="px-6 py-3 text-white">{profile.unique}</td>
                                  <td className="px-6 py-3 text-white">{profile.nulls}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </GlassCard>
                    </div>
                  )}

                  {activeTab === 'anomalies' && (
                    /* Anomalies Tab */
                    <GlassCard className="border border-white/5 bg-card overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Z-Score Statistical Anomalies (Standard Deviation &gt; 3)</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase">
                          {pipelineResults.anomalies?.length || 0} Flags Found
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-black/40 border-b border-white/5 text-muted-foreground font-semibold uppercase">
                            <tr>
                              <th className="px-6 py-3">Row Index</th>
                              <th className="px-6 py-3">Field Column</th>
                              <th className="px-6 py-3">Value</th>
                              <th className="px-6 py-3">Z-Score</th>
                              <th className="px-6 py-3">Severity</th>
                              <th className="px-6 py-3">Audit Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(!pipelineResults.anomalies || pipelineResults.anomalies.length === 0) ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                  No statistical anomalies found in this dataset.
                                </td>
                              </tr>
                            ) : (
                              pipelineResults.anomalies.map((anom: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-3 text-muted-foreground">{anom.row_index}</td>
                                  <td className="px-6 py-3 font-semibold text-white">{anom.column}</td>
                                  <td className="px-6 py-3 text-white">{anom.value}</td>
                                  <td className="px-6 py-3 text-white font-mono">{anom.score.toFixed(2)}</td>
                                  <td className="px-6 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      anom.severity === 'critical' 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                      {anom.severity.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-muted-foreground">{anom.type}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* Blank State */
            <GlassCard className="p-8 h-full flex flex-col justify-center items-center text-center bg-card border border-white/5 min-h-[400px]">
              <div className="max-w-md space-y-4">
                <BarChart4 className="w-12 h-12 text-primary/40 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Pipeline Run Loaded</h3>
                <p className="text-xs text-muted-foreground">
                  Select a dataset in the controller, specify targets, and click &quot;Orchestrate Pipeline&quot; to begin.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Slide-out Drawer for Admin Audit Alerts */}
      <AnimatePresence>
        {isAlertDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAlertDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-[var(--bg-primary)] border-l border-white/10 p-6 shadow-2xl z-[100] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-white">Active Scanner Alerts</h3>
                </div>
                <button 
                  onClick={() => setIsAlertDrawerOpen(false)}
                  className="p-1.5 text-muted-foreground hover:bg-white/5 rounded-md transition-colors hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    No scanner alerts found. All systems operational.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border text-xs space-y-3 transition-opacity ${
                        alert.isResolved 
                          ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' 
                          : alert.severity === 'critical'
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-amber-500/5 border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white flex items-center gap-1.5">
                            {!alert.isResolved && (
                              <span className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'} animate-ping`} />
                            )}
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                          alert.isResolved
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : alert.severity === 'critical'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {alert.isResolved ? 'RESOLVED' : alert.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed break-words">{alert.description}</p>
                      
                      {!alert.isResolved && (
                        <button
                          disabled={alertActionLoading === alert.id}
                          onClick={() => handleResolveAlert(alert.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
