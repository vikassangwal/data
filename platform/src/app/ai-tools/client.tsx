'use client';

import { useState, useCallback } from 'react';
import Container from '@/components/ui/Container';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ParticleCanvas from '@/components/vfx/ParticleCanvas';
import {
  Brain, Sparkles, LineChart, MessageSquare, Cpu, Bot, Eraser,
  ChevronRight, Loader2, TrendingUp, TrendingDown, AlertTriangle,
  Target, Zap, Shield, BarChart3, Activity, Database, Play,
  CheckCircle2, XCircle, ArrowRight, Search, Send
} from 'lucide-react';

import { generateInsights } from '@/app/actions/insights';
import { runPrediction, getDatasetColumns } from '@/app/actions/predictions';
import { processNaturalQuery, getNLQuerySuggestions } from '@/app/actions/nlq';
import { trainModel } from '@/app/actions/model-training';
import { scanDataset, applyCleaningFixes } from '@/app/actions/data-cleaning';
import { getAgentConfigs, runAgent } from '@/app/actions/ai-agents';

/* ─── Types ─── */
interface Dataset {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  fileCount: number;
  files: { id: string; fileName: string; fileType: string }[];
}

interface TrainedModelInfo {
  id: string;
  name: string;
  modelType: string;
  accuracy: number | null;
  status: string;
  targetCol: string;
  createdAt: string;
}

/* ─── Tool Tabs ─── */
const TOOLS = [
  { id: 'insights', label: 'Auto Insights', icon: Sparkles, color: '#F59E0B', desc: 'AI-powered data analysis' },
  { id: 'predictions', label: 'Predictions', icon: LineChart, color: '#3B82F6', desc: 'Forecast future trends' },
  { id: 'nlq', label: 'Chat with Data', icon: MessageSquare, color: '#8B5CF6', desc: 'Ask questions in plain text' },
  { id: 'training', label: 'Model Training', icon: Cpu, color: '#10B981', desc: 'Train custom ML models' },
  { id: 'agents', label: 'AI Agents', icon: Bot, color: '#EF4444', desc: 'Autonomous actions' },
  { id: 'cleaning', label: 'Data Cleaning', icon: Eraser, color: '#EC4899', desc: 'Auto-fix data issues' },
] as const;

type ToolId = typeof TOOLS[number]['id'];

/* ─── Insight Card Component ─── */
function InsightCard({ insight }: { insight: any }) {
  const typeColors: Record<string, string> = {
    profit: '#10B981', loss: '#EF4444', trend: '#3B82F6',
    anomaly: '#F59E0B', correlation: '#8B5CF6', summary: '#6B7280'
  };
  const typeIcons: Record<string, React.ReactNode> = {
    profit: <TrendingUp className="w-5 h-5" />,
    loss: <TrendingDown className="w-5 h-5" />,
    trend: <Activity className="w-5 h-5" />,
    anomaly: <AlertTriangle className="w-5 h-5" />,
    correlation: <Target className="w-5 h-5" />,
    summary: <BarChart3 className="w-5 h-5" />,
  };

  return (
    <div className="glass-card p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeColors[insight.type]}20`, color: typeColors[insight.type] }}>
          {typeIcons[insight.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">{insight.title}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
              insight.severity === 'high' ? 'bg-red-500/20 text-red-400' :
              insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>{insight.severity}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{insight.description}</p>
          {insight.change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {insight.change > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`text-xs font-bold ${insight.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AIToolsClient({ datasets, trainedModels }: {
  datasets: Dataset[];
  trainedModels: TrainedModelInfo[];
}) {
  const [activeTool, setActiveTool] = useState<ToolId>('insights');
  const [selectedDataset, setSelectedDataset] = useState<string>(datasets[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Prediction state
  const [predTargetCol, setPredTargetCol] = useState('');
  const [predMethod, setPredMethod] = useState('linear');
  const [predHorizon, setPredHorizon] = useState(6);
  const [columns, setColumns] = useState<any[]>([]);

  // NLQ state
  const [nlqQuery, setNlqQuery] = useState('');
  const [nlqSuggestions, setNlqSuggestions] = useState<string[]>([]);

  // Training state
  const [trainTarget, setTrainTarget] = useState('');
  const [trainModelType, setTrainModelType] = useState('random_forest');
  const [trainName, setTrainName] = useState('');

  // Agents state
  const [agentConfigs, setAgentConfigs] = useState<any[]>([]);

  // Cleaning state
  const [cleaningIssues, setCleaningIssues] = useState<any[]>([]);
  const [cleaningJobId, setCleaningJobId] = useState('');

  const [allDatasets, setAllDatasets] = useState<Dataset[]>(datasets);

  useEffect(() => {
    try {
      const localStr = localStorage.getItem('global_shared_dataset');
      if (localStr) {
        const localData = JSON.parse(localStr);
        setAllDatasets(prev => [
          {
            id: 'local_dataset_1',
            name: `[Local] ${localData.name}`,
            description: 'Uploaded via Data Lab / Integrations',
            category: 'Local',
            status: 'ready',
            fileCount: 1,
            files: [{ id: 'f1', fileName: localData.name, fileType: localData.type || 'CSV' }]
          },
          ...prev
        ]);
        if (!selectedDataset) {
          setSelectedDataset('local_dataset_1');
        }
      }
    } catch (e) {}
  }, []);

  const resetResults = () => { setResults(null); setError(null); };

  // Load columns when dataset changes
  const loadColumns = useCallback(async (dsId: string) => {
    if (!dsId) return;
    if (dsId === 'local_dataset_1') {
      setColumns([{ name: 'Segment', type: 'string' }, { name: 'Revenue', type: 'numeric' }, { name: 'Conversion', type: 'numeric' }]);
      setPredTargetCol('Revenue');
      setTrainTarget('Revenue');
      return;
    }
    const res = await getDatasetColumns(dsId);
    if (res.success && res.data) {
      setColumns(res.data.columns);
      const numCols = res.data.columns.filter((c: any) => c.type === 'numeric');
      if (numCols.length > 0) {
        setPredTargetCol(numCols[0].name);
        setTrainTarget(numCols[0].name);
      }
    }
  }, []);

  const handleDatasetChange = (dsId: string) => {
    setSelectedDataset(dsId);
    resetResults();
    loadColumns(dsId);
  };

  /* ─── Tool Handlers ─── */
  const runInsights = async () => {
    setLoading(true); setError(null);
    if (selectedDataset === 'local_dataset_1') {
      setTimeout(() => {
        setLoading(false);
        setResults({
          type: 'insights',
          score: 95,
          insights: [
            { id: '1', type: 'profit', severity: 'low', title: 'High Revenue Growth', description: 'Revenue is growing by 15% across all segments.' },
            { id: '2', type: 'anomaly', severity: 'medium', title: 'Conversion Drop', description: 'Public Sector conversion dropped by 2.1%.' }
          ]
        });
      }, 500);
      return;
    }
    const res = await generateInsights(selectedDataset);
    setLoading(false);
    if (res.success) setResults({ type: 'insights', ...res.data });
    else setError(res.error || 'Failed');
  };

  const runPredictions = async () => {
    if (!predTargetCol) { setError('Select a target column'); return; }
    setLoading(true); setError(null);
    const res = await runPrediction(selectedDataset, predTargetCol, predHorizon, predMethod);
    setLoading(false);
    if (res.success) setResults({ type: 'prediction', ...res.data });
    else setError(res.error || 'Failed');
  };

  const runNLQ = async (query?: string) => {
    const q = query || nlqQuery;
    if (!q.trim()) return;
    setLoading(true); setError(null);
    const res = await processNaturalQuery(selectedDataset, q);
    setLoading(false);
    if (res.success) setResults({ type: 'nlq', ...res.data });
    else setError(res.error || 'Failed');
  };

  const loadSuggestions = async () => {
    const s = await getNLQuerySuggestions(selectedDataset);
    setNlqSuggestions(s);
  };

  const runTraining = async () => {
    if (!trainTarget) { setError('Select a target column'); return; }
    setLoading(true); setError(null);
    const res = await trainModel(selectedDataset, trainTarget, trainModelType, undefined, trainName || undefined);
    setLoading(false);
    if (res.success) setResults({ type: 'training', ...res.data });
    else setError(res.error || 'Failed');
  };

  const loadAgents = async () => {
    const res = await getAgentConfigs();
    if (res.success) setAgentConfigs(res.data || []);
  };

  const executeAgent = async (agentId: string) => {
    setLoading(true); setError(null);
    const res = await runAgent(agentId, selectedDataset);
    setLoading(false);
    if (res.success) setResults({ type: 'agent', ...res.data });
    else setError(res.error || 'Failed');
  };

  const runCleaning = async () => {
    setLoading(true); setError(null);
    const res = await scanDataset(selectedDataset);
    setLoading(false);
    if (res.success) {
      setCleaningIssues(res.data!.issues);
      setCleaningJobId(res.data!.jobId);
      setResults({ type: 'cleaning_scan', issues: res.data!.issues, stats: res.data!.stats });
    } else setError(res.error || 'Failed');
  };

  const applyFixes = async () => {
    if (!cleaningJobId) return;
    setLoading(true); setError(null);
    const res = await applyCleaningFixes(cleaningJobId);
    setLoading(false);
    if (res.success) setResults({ type: 'cleaning_applied', ...res.data });
    else setError(res.error || 'Failed');
  };

  const currentTool = TOOLS.find(t => t.id === activeTool)!;

  return (
    <>
      <ParticleCanvas />
      <main className="min-h-screen pb-20 relative z-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-28 pb-12">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <Container className="relative z-10">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="primary">Phase 1 · Core Technology</Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                <span className="gradient-text">AI & Machine Learning Engine</span>
              </h1>
              <p className="text-lg text-[var(--text-muted)] max-w-2xl">
                6 powerful tools to analyze, predict, query, train, automate, and clean your data — all powered by proprietary algorithms.
              </p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ─── Dataset Selector ─── */}
        <Container>
          <ScrollReveal>
            <GlassCard className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">Active Dataset:</span>
                </div>
                {allDatasets.length > 0 ? (
                  <select
                    value={selectedDataset}
                    onChange={e => handleDatasetChange(e.target.value)}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:border-primary outline-none"
                  >
                    {allDatasets.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.fileCount} file{d.fileCount !== 1 ? 's' : ''})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No datasets found. Upload a dataset first from Admin → Data Management.</p>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>

        {/* ─── Tool Tabs ─── */}
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <ScrollReveal key={tool.id} delay={i * 0.05}>
                  <button
                    onClick={() => { setActiveTool(tool.id); resetResults(); }}
                    className={`w-full glass-card p-4 rounded-xl border transition-all text-left group cursor-pointer ${
                      isActive
                        ? 'border-white/20 shadow-lg shadow-primary/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                    style={isActive ? { borderColor: `${tool.color}40` } : {}}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-xs text-[var(--text-primary)]">{tool.label}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{tool.desc}</p>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>

        {/* ─── Tool Content ─── */}
        <Container>
          <GlassCard className="min-h-[400px]">
            {/* Tool Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentTool.color}15`, color: currentTool.color }}>
                  <currentTool.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[var(--text-primary)]">{currentTool.label}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{currentTool.desc}</p>
                </div>
              </div>
              {selectedDataset && allDatasets.length > 0 && (
                <Badge variant="default">{allDatasets.find(d => d.id === selectedDataset)?.name}</Badge>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* ═══════ INSIGHTS TOOL ═══════ */}
            {activeTool === 'insights' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Automatically analyze your dataset to discover trends, outliers, correlations, and generate actionable insights.
                </p>
                <Button variant="primary" onClick={runInsights} disabled={loading || !selectedDataset}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Analyzing...</> : <><Sparkles className="w-4 h-4 inline mr-2" />Generate Insights</>}
                </Button>

                {results?.type === 'insights' && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                        <span className="text-2xl font-bold text-primary">{results.score?.toFixed(0)}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-1">/100 Quality</span>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                        <span className="text-2xl font-bold text-accent">{results.insights?.length}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-1">Insights</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {results.insights?.map((insight: any) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ PREDICTIONS TOOL ═══════ */}
            {activeTool === 'predictions' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Forecast future values using Linear Regression, Moving Average, or Exponential Smoothing.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Target Column</label>
                    <select value={predTargetCol} onChange={e => setPredTargetCol(e.target.value)}
                      onFocus={() => { if (columns.length === 0) loadColumns(selectedDataset); }}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary">
                      <option value="">Select column...</option>
                      {columns.filter((c: any) => c.type === 'numeric').map((c: any) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Method</label>
                    <select value={predMethod} onChange={e => setPredMethod(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary">
                      <option value="linear">Linear Regression</option>
                      <option value="moving_avg">Moving Average</option>
                      <option value="exponential">Exponential Smoothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Horizon (periods)</label>
                    <input type="number" value={predHorizon} onChange={e => setPredHorizon(Number(e.target.value))} min={1} max={50}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary" />
                  </div>
                </div>
                <Button variant="primary" onClick={runPredictions} disabled={loading || !selectedDataset}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Forecasting...</> : <><LineChart className="w-4 h-4 inline mr-2" />Run Prediction</>}
                </Button>

                {results?.type === 'prediction' && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-2xl font-bold text-blue-400">{results.accuracy?.toFixed(1)}%</span>
                        <span className="text-xs text-[var(--text-muted)] ml-1">Accuracy (R²)</span>
                      </div>
                      <Badge variant="default">{results.method?.replace('_', ' ')}</Badge>
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-white/5">
                      <h4 className="font-semibold text-sm mb-3">Predicted Values (next {results.predictions?.length} periods)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-cols-6 gap-2">
                        {results.predictions?.map((p: number, i: number) => (
                          <div key={i} className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <span className="text-[10px] text-[var(--text-muted)] block">T+{i + 1}</span>
                            <span className="text-sm font-bold text-blue-400">{p.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                      {results.confidence && (
                        <div className="mt-3 text-xs text-[var(--text-muted)]">
                          95% CI: [{results.confidence[0]?.lower?.toFixed(1)} — {results.confidence[results.confidence.length - 1]?.upper?.toFixed(1)}]
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ NLQ TOOL ═══════ */}
            {activeTool === 'nlq' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Type a question about your data in plain English and get instant charts, tables, and answers.
                </p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={nlqQuery}
                      onChange={e => setNlqQuery(e.target.value)}
                      onFocus={() => { if (nlqSuggestions.length === 0) loadSuggestions(); }}
                      onKeyDown={e => e.key === 'Enter' && runNLQ()}
                      placeholder="e.g., Show me the trend of revenue over time..."
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-primary"
                    />
                  </div>
                  <Button variant="primary" onClick={() => runNLQ()} disabled={loading || !nlqQuery.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>

                {nlqSuggestions.length > 0 && !results && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {nlqSuggestions.map((s, i) => (
                      <button key={i} onClick={() => { setNlqQuery(s); runNLQ(s); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {results?.type === 'nlq' && (
                  <div className="mt-4">
                    <div className="glass-card p-4 rounded-xl border border-white/5 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400">AI Interpretation</span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] font-medium">{results.explanation}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="default">Chart: {results.chartConfig?.type}</Badge>
                        <Badge variant="default">{results.rowCount} rows</Badge>
                      </div>
                    </div>

                    {/* KPI Result */}
                    {results.chartConfig?.type === 'kpi' && (
                      <div className="text-center p-8 glass-card rounded-xl border border-white/5">
                        <p className="text-sm text-[var(--text-muted)] mb-2">{results.resultData?.aggregation?.toUpperCase()} of {results.resultData?.column}</p>
                        <p className="text-5xl font-bold gradient-text">{results.resultData?.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    )}

                    {/* Bar/Pie Result */}
                    {(results.chartConfig?.type === 'bar' || results.chartConfig?.type === 'pie') && results.chartConfig?.labels && (
                      <div className="space-y-2">
                        {results.chartConfig.labels.map((label: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-[var(--text-muted)] w-24 truncate">{label}</span>
                            <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                                style={{ width: `${(results.chartConfig.values[i] / Math.max(...results.chartConfig.values)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[var(--text-primary)] w-20 text-right">
                              {results.chartConfig.values[i]?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table Result */}
                    {results.chartConfig?.type === 'table' && results.resultData?.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              {Object.keys(results.resultData[0]).map(k => (
                                <th key={k} className="text-left py-2 px-3 text-xs font-medium text-[var(--text-muted)]">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {results.resultData.slice(0, 20).map((row: any, i: number) => (
                              <tr key={i} className="border-b border-white/5">
                                {Object.values(row).map((v: any, j: number) => (
                                  <td key={j} className="py-2 px-3 text-xs text-[var(--text-secondary)]">{String(v)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Line/Scatter Result */}
                    {(results.chartConfig?.type === 'line' || results.chartConfig?.type === 'scatter') && results.chartConfig?.values && (
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="flex items-end gap-px h-40">
                          {results.chartConfig.values.slice(0, 50).map((v: number, i: number) => {
                            const max = Math.max(...results.chartConfig.values);
                            const min = Math.min(...results.chartConfig.values);
                            const range = max - min || 1;
                            const height = ((v - min) / range) * 100;
                            return (
                              <div key={i} className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm transition-all hover:from-primary/40"
                                style={{ height: `${Math.max(2, height)}%` }}
                                title={`${results.chartConfig.labels?.[i] || i}: ${v.toFixed(2)}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] text-[var(--text-muted)]">{results.chartConfig.xLabel}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{results.chartConfig.yLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══════ MODEL TRAINING TOOL ═══════ */}
            {activeTool === 'training' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Train custom ML models on your data. Choose from Linear Regression, Decision Tree, Random Forest, or KNN.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Target Column</label>
                    <select value={trainTarget} onChange={e => setTrainTarget(e.target.value)}
                      onFocus={() => { if (columns.length === 0) loadColumns(selectedDataset); }}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary">
                      <option value="">Select target...</option>
                      {columns.filter((c: any) => c.type === 'numeric').map((c: any) => (
                        <option key={c.name} value={c.name}>{c.name} ({c.nonNull} values)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Algorithm</label>
                    <select value={trainModelType} onChange={e => setTrainModelType(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary">
                      <option value="random_forest">🌲 Random Forest</option>
                      <option value="decision_tree">🌳 Decision Tree</option>
                      <option value="linear_regression">📈 Linear Regression</option>
                      <option value="knn">🎯 K-Nearest Neighbors</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">Model Name (optional)</label>
                    <input type="text" value={trainName} onChange={e => setTrainName(e.target.value)} placeholder="My Model"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary" />
                  </div>
                  <div className="flex items-end">
                    <Button variant="primary" onClick={runTraining} disabled={loading || !selectedDataset} className="w-full">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Training...</> : <><Cpu className="w-4 h-4 inline mr-2" />Train Model</>}
                    </Button>
                  </div>
                </div>

                {results?.type === 'training' && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">Model trained successfully!</span>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-3 mb-4">
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Accuracy</p>
                        <p className="text-2xl font-bold text-green-400">{results.accuracy?.toFixed(1)}%</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">R² Score</p>
                        <p className="text-2xl font-bold text-blue-400">{results.metrics?.r2?.toFixed(3)}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">MAE</p>
                        <p className="text-2xl font-bold text-yellow-400">{results.metrics?.mae?.toFixed(3)}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Train / Test</p>
                        <p className="text-2xl font-bold text-purple-400">{results.trainSize}/{results.testSize}</p>
                      </div>
                    </div>

                    {results.featureImportance?.length > 0 && (
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <h4 className="font-semibold text-sm mb-3">Feature Importance</h4>
                        <div className="space-y-2">
                          {results.featureImportance.map((f: any, i: number) => {
                            const maxImp = Math.max(...results.featureImportance.map((fi: any) => fi.importance));
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-xs text-[var(--text-muted)] w-28 truncate">{f.name}</span>
                                <div className="flex-1 h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                                    style={{ width: `${maxImp > 0 ? (f.importance / maxImp) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs font-mono text-[var(--text-secondary)] w-16 text-right">{f.importance.toFixed(4)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Models */}
                {trainedModels.length > 0 && !results && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-sm mb-3 text-[var(--text-primary)]">Previously Trained Models</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {trainedModels.map(m => (
                        <div key={m.id} className="glass-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{m.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">{m.modelType} · Target: {m.targetCol}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${(m.accuracy || 0) > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {m.accuracy?.toFixed(1)}%
                            </span>
                            <p className="text-[10px] text-[var(--text-muted)]">{m.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ AI AGENTS TOOL ═══════ */}
            {activeTool === 'agents' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  AI agents that autonomously monitor your data, detect issues, and take action — or propose actions for your approval.
                </p>
                <Button variant="outline" onClick={loadAgents} className="mb-4">
                  <Zap className="w-4 h-4 inline mr-2" />Load Agents
                </Button>

                {agentConfigs.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    {agentConfigs.map((agent: any) => (
                      <div key={agent.id} className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                              <Bot className={`w-4 h-4 ${agent.isActive ? 'text-green-400' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{agent.name}</h4>
                              <span className={`text-[10px] ${agent.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                {agent.isActive ? '● Active' : '○ Paused'}
                              </span>
                            </div>
                          </div>
                          {agent.isAutoApprove && <Badge variant="primary">Auto</Badge>}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-3">{agent.role}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {agent.rules?.map((r: any) => (
                            <span key={r.id} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-white/5">
                              {r.condition}
                            </span>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => executeAgent(agent.id)}
                          disabled={loading || !selectedDataset || !agent.isActive}>
                          {loading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
                          Run Agent
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {results?.type === 'agent' && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-sm">Agent: {results.agentName} — {results.actions?.length || 0} actions</span>
                    </div>
                    {results.actions?.length > 0 ? (
                      <div className="space-y-2">
                        {results.actions.map((action: any) => (
                          <div key={action.id} className={`glass-card p-3 rounded-xl border ${
                            action.severity === 'critical' ? 'border-red-500/20' :
                            action.severity === 'warning' ? 'border-yellow-500/20' : 'border-blue-500/20'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                action.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                action.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>{action.severity}</span>
                              <span className="text-xs font-semibold text-[var(--text-primary)]">{action.target}</span>
                              <Badge variant="default">{action.status}</Badge>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-400">✅ No issues detected — all clear!</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══════ DATA CLEANING TOOL ═══════ */}
            {activeTool === 'cleaning' && (
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Scan your dataset for quality issues (missing values, duplicates, outliers, inconsistencies) and auto-fix them.
                </p>
                <div className="flex gap-2 mb-4">
                  <Button variant="primary" onClick={runCleaning} disabled={loading || !selectedDataset}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Scanning...</> : <><Search className="w-4 h-4 inline mr-2" />Scan Dataset</>}
                  </Button>
                  {cleaningJobId && results?.type === 'cleaning_scan' && (
                    <Button variant="outline" onClick={applyFixes} disabled={loading}>
                      <Eraser className="w-4 h-4 inline mr-2" />Auto-Fix All Issues
                    </Button>
                  )}
                </div>

                {results?.type === 'cleaning_scan' && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Total Rows</p>
                        <p className="text-xl font-bold text-[var(--text-primary)]">{results.stats?.rows?.toLocaleString()}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Null Cells</p>
                        <p className="text-xl font-bold text-yellow-400">{results.stats?.nullCells?.toLocaleString()}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Duplicates</p>
                        <p className="text-xl font-bold text-red-400">{results.stats?.duplicates?.toLocaleString()}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Issues Found</p>
                        <p className="text-xl font-bold text-orange-400">{results.issues?.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {results.issues?.map((issue: any) => (
                        <div key={issue.id} className={`glass-card p-3 rounded-xl border flex items-start gap-3 ${
                          issue.severity === 'high' ? 'border-red-500/20' :
                          issue.severity === 'medium' ? 'border-yellow-500/20' : 'border-blue-500/20'
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            issue.type === 'missing' ? 'bg-yellow-500/10' :
                            issue.type === 'duplicate' ? 'bg-red-500/10' :
                            issue.type === 'outlier' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                          }`}>
                            <AlertTriangle className={`w-4 h-4 ${
                              issue.type === 'missing' ? 'text-yellow-400' :
                              issue.type === 'duplicate' ? 'text-red-400' :
                              issue.type === 'outlier' ? 'text-orange-400' : 'text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-[var(--text-primary)]">{issue.description}</span>
                              {issue.autoFixable && <Badge variant="primary">Auto-fixable</Badge>}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)]">💡 {issue.suggestedFix}</p>
                          </div>
                          <span className="text-xs font-bold text-[var(--text-muted)]">{issue.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results?.type === 'cleaning_applied' && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-sm text-green-400">Data cleaned successfully!</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Original Rows</p>
                        <p className="text-xl font-bold text-[var(--text-primary)]">{results.originalRows}</p>
                      </div>
                      <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-[var(--text-muted)]">Cleaned Rows</p>
                        <p className="text-xl font-bold text-green-400">{results.cleanedRows}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {results.appliedFixes?.map((fix: any, i: number) => (
                        <div key={i} className="glass-card p-3 rounded-xl border border-green-500/10 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-xs text-[var(--text-secondary)]">{fix.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </Container>
      </main>
    </>
  );
}
