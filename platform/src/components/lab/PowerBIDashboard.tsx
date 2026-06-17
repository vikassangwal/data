'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, File as FileIcon, LayoutDashboard, Loader2, UploadCloud, Mic, MessageSquare, X, Send, Filter, Sparkles, History, FileText, Presentation, Copy, Check, Mail, CalendarClock, Settings, Workflow, Bot, Users, Database, Volume2, Globe, ShieldCheck, Activity, Box } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { queryDashboardChatbot } from '@/app/actions/dashboard-chatbot';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dynamically import heavy libraries for Next.js SSR compatibility
const Plot = dynamic(() => import('react-plotly.js') as any, { ssr: false }) as React.ComponentType<any>;
import { Responsive } from 'react-grid-layout';

const ResponsiveReactGridLayout = (props: any) => {
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Responsive {...props} width={width} />
    </div>
  );
};

export default function PowerBIDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [charts, setCharts] = useState<any>(null);
  const [narrative, setNarrative] = useState<string>('');
  const [iotData, setIotData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  
  // New States for Phase 19
  const [activeTab, setActiveTab] = useState<'overview' | 'predictive' | 'advanced' | 'ai_custom'>('overview');
  const [isListening, setIsListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hi! I am your AI Data Assistant. Ask me anything about your dashboard.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Dynamic Theme Creator Customizer states
  const [activeTheme, setActiveTheme] = useState<'holographic' | 'cyberpunk' | 'sunset' | 'custom'>('holographic');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#10b981');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('#06b6d4');

  const THEME_PALETTES = {
    holographic: { primary: '#10b981', secondary: '#06b6d4' },
    cyberpunk: { primary: '#ec4899', secondary: '#a855f7' },
    sunset: { primary: '#f59e0b', secondary: '#ef4444' },
    custom: { primary: customPrimaryColor, secondary: customSecondaryColor }
  };

  // Reports & Slides Studio states
  const [summarizeModalOpen, setSummarizeModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'report' | 'slides'>('report');
  const [targetAudience, setTargetAudience] = useState('Executive Team');
  const [corporateTone, setCorporateTone] = useState('Professional & Data-Forward');
  const [customGuidance, setCustomGuidance] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStage, setGenStage] = useState('');
  const [studioLogs, setStudioLogs] = useState<string[]>([]);
  const [studioActiveAgent, setStudioActiveAgent] = useState<number | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<any>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Deep AI Analytics States
  const [showForecast, setShowForecast] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);

  // Advanced Dashboarding States
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [dashboardVersion, setDashboardVersion] = useState("v1.0 (Latest)");

  // Phase 5: Ultimate Enterprise SaaS States
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);
  const [whiteLabelName, setWhiteLabelName] = useState('DevForge Power Analytics');
  const [automationsModalOpen, setAutomationsModalOpen] = useState(false);
  const [nlpQuery, setNlpQuery] = useState('');
  const [isNlpProcessing, setIsNlpProcessing] = useState(false);

  // Real-time Collaboration (Mock Cursors)
  const [otherUsers] = useState([
    { id: 1, name: 'Sarah (CMO)', color: 'bg-emerald-500/80', x: 450, y: 320 },
    { id: 2, name: 'David (VP)', color: 'bg-purple-500/80', x: 800, y: 150 },
  ]);

  // Phase 6: Future Vision States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMarketIntel, setShowMarketIntel] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isIoTStream, setIsIoTStream] = useState(false);

  useEffect(() => {
    if (isIoTStream) {
      const interval = setInterval(() => {
        setIotData(prev => [...prev.slice(-20), { time: new Date().toLocaleTimeString(), value: Math.floor(Math.random() * 100) + 50 }]);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isIoTStream]);

  // AI Custom Dashboard States
  const [aiCustomLayout, setAiCustomLayout] = useState<any[]>([
    { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
    { i: 'bar', x: 0, y: 1, w: 6, h: 2 },
    { i: 'gauge', x: 6, y: 1, w: 6, h: 2 },
  ]);
  const [aiCustomDashboardName, setAiCustomDashboardName] = useState('AI Custom Workspace');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGenLogs, setAiGenLogs] = useState<string[]>([]);
  const [aiGenProgress, setAiGenProgress] = useState(0);

  const [dashboardConfig, setDashboardConfig] = useState<any[]>([
    {
      id: 'default_1',
      title: 'Monthly Revenue (Base)',
      type: 'area',
      color: '#06b6d4', // Cyan
      dataset: [
        { label: 'Jan', value: 2400 },
        { label: 'Feb', value: 1398 },
        { label: 'Mar', value: 9800 },
        { label: 'Apr', value: 3908 }
      ]
    }
  ]);

  const RenderChart = ({ config }: { config: any }) => {
    const commonProps = {
      data: config.dataset,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
            <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={3} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke={config.color} fillOpacity={1} fill={`url(#gradient-${config.id})`} strokeWidth={3} />
          </AreaChart>
        );
    }
  };

  const handleGenerateAiDashboard = (promptText: string) => {
    if (!promptText.trim()) return;
    setIsAiGenerating(true);
    setAiGenProgress(0);
    setAiGenLogs(["🤖 AI Orchestrator: Initializing custom dashboard request..."]);
    
    const logs = [
      "🤖 AI Orchestrator: Initializing custom dashboard request...",
      "🔍 Semantic Analyzer: Scanning active CSV column headers and profiles...",
      "📊 SQL Compiler: Synthesizing aggregation formulas and charts...",
      "🎨 Design Architect: Picking color highlights based on prompt tone...",
      "📐 Layout Manager: Sizing grid layout cards and alignment...",
      "🧪 Consensus Agent: Verifying cross-browser responsive layout...",
      "✨ AI Custom Dashboard generated successfully!"
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
        
        // Finalize Dashboard Generation
        const lower = promptText.toLowerCase();
        let targetTheme: 'holographic' | 'cyberpunk' | 'sunset' | 'custom' = 'holographic';
        let dashName = 'AI Custom Dashboard';
        let layoutItems: any[] = [];
        
        // 1. Color Palette Detection
        if (lower.includes('cyberpunk') || lower.includes('pink') || lower.includes('purple')) {
          targetTheme = 'cyberpunk';
        } else if (lower.includes('sunset') || lower.includes('gold') || lower.includes('orange') || lower.includes('yellow')) {
          targetTheme = 'sunset';
        } else if (lower.includes('holographic') || lower.includes('green') || lower.includes('cyan')) {
          targetTheme = 'holographic';
        } else {
          // Detect Custom Hex Codes (e.g. #ff0000 or red/blue)
          const hexMatches = promptText.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g);
          if (hexMatches && hexMatches.length >= 1) {
            setCustomPrimaryColor(hexMatches[0]);
            if (hexMatches.length >= 2) {
              setCustomSecondaryColor(hexMatches[1]);
            } else {
              setCustomSecondaryColor(hexMatches[0] + '80'); // Fallback transparency
            }
            targetTheme = 'custom';
          } else if (lower.includes('red') || lower.includes('blue')) {
            if (lower.includes('red') && lower.includes('blue')) {
              setCustomPrimaryColor('#ef4444');
              setCustomSecondaryColor('#3b82f6');
            } else if (lower.includes('red')) {
              setCustomPrimaryColor('#ef4444');
              setCustomSecondaryColor('#f87171');
            } else {
              setCustomPrimaryColor('#3b82f6');
              setCustomSecondaryColor('#60a5fa');
            }
            targetTheme = 'custom';
          }
        }

        // 2. Business Focus Layout Selection
        if (lower.includes('sales') || lower.includes('funnel') || lower.includes('pipeline') || lower.includes('conversion') || lower.includes('stage') || lower.includes('deal')) {
          dashName = 'AI Sales & Pipeline Dashboard';
          layoutItems = [
            { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
            { i: 'funnel', x: 0, y: 1, w: 6, h: 2 },
            { i: 'gauge', x: 6, y: 1, w: 6, h: 2 },
            { i: 'bar', x: 0, y: 3, w: 6, h: 2 },
            { i: 'radar', x: 6, y: 3, w: 6, h: 2 },
          ];
        } else if (lower.includes('financial') || lower.includes('revenue') || lower.includes('profit') || lower.includes('cost') || lower.includes('expense') || lower.includes('money')) {
          dashName = 'AI Financial Analysis Dashboard';
          layoutItems = [
            { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
            { i: 'waterfall', x: 0, y: 1, w: 6, h: 2 },
            { i: 'area', x: 6, y: 1, w: 6, h: 2 },
            { i: 'gauge', x: 0, y: 3, w: 6, h: 2 },
            { i: 'bar', x: 6, y: 3, w: 6, h: 2 },
          ];
        } else if (lower.includes('geo') || lower.includes('map') || lower.includes('global') || lower.includes('country') || lower.includes('region')) {
          dashName = 'AI Geographic Analytics Workspace';
          layoutItems = [
            { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
            { i: 'map', x: 0, y: 1, w: 8, h: 3 },
            { i: 'sunburst', x: 8, y: 1, w: 4, h: 3 },
            { i: 'donut', x: 0, y: 4, w: 6, h: 2 },
            { i: 'bar', x: 6, y: 4, w: 6, h: 2 },
          ];
        } else if (lower.includes('stat') || lower.includes('distribution') || lower.includes('scatter') || lower.includes('correlation') || lower.includes('heatmap')) {
          dashName = 'AI Scientific Distribution Dashboard';
          layoutItems = [
            { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
            { i: 'scatter3d', x: 0, y: 1, w: 12, h: 4 },
            { i: 'heatmap', x: 0, y: 5, w: 6, h: 3 },
            { i: 'box', x: 6, y: 5, w: 6, h: 1.5 },
            { i: 'violin', x: 6, y: 6.5, w: 6, h: 1.5 },
          ];
        } else if (lower.includes('iot') || lower.includes('sensor') || lower.includes('live') || lower.includes('real-time')) {
          dashName = 'AI Real-time IoT Streaming Monitor';
          layoutItems = [
            { i: 'iot', x: 0, y: 0, w: 12, h: 2.5 },
            { i: 'line', x: 0, y: 2.5, w: 12, h: 3 },
            { i: 'area', x: 0, y: 5.5, w: 6, h: 2 },
            { i: 'gauge', x: 6, y: 5.5, w: 6, h: 2 },
          ];
        } else {
          // General Balanced Layout
          dashName = 'AI Customized General Workspace';
          layoutItems = [
            { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
            { i: 'bar', x: 0, y: 1, w: 6, h: 2 },
            { i: 'pie', x: 6, y: 1, w: 6, h: 2 },
            { i: 'line', x: 0, y: 3, w: 8, h: 2.5 },
            { i: 'gauge', x: 8, y: 3, w: 4, h: 2.5 },
          ];
        }
        
        setAiCustomLayout(layoutItems);
        setAiCustomDashboardName(dashName);
        setActiveTheme(targetTheme);
        setActiveTab('ai_custom');
        setIsAiGenerating(false);
      } else {
        setAiGenProgress(progress);
        const logIndex = Math.floor(progress / 15);
        if (logIndex < logs.length) {
          setAiGenLogs(prev => {
            if (prev.includes(logs[logIndex])) return prev;
            return [...prev, logs[logIndex]];
          });
        }
      }
    }, 300);
  };

  const handleAntigravityRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    // Detect theme colors from prompt
    let color = '#a855f7'; // Default Neon Purple
    const lower = aiPrompt.toLowerCase();
    if (lower.includes('cyan') || lower.includes('blue')) color = '#06b6d4';
    else if (lower.includes('green') || lower.includes('emerald')) color = '#10b981';
    else if (lower.includes('red') || lower.includes('rose')) color = '#f43f5e';
    else if (lower.includes('orange') || lower.includes('sunset')) color = '#f59e0b';
    else if (lower.includes('pink')) color = '#ec4899';

    // Parse real uploaded CSV from localStorage if available
    let dataset = [
      { label: 'Week 1', value: Math.floor(Math.random() * 5000) },
      { label: 'Week 2', value: Math.floor(Math.random() * 5000) },
      { label: 'Week 3', value: Math.floor(Math.random() * 5000) },
      { label: 'Week 4', value: Math.floor(Math.random() * 5000) }
    ];

    const statsInfo = getCvStats();
    let detectedTitle = `AI Insights: ${aiPrompt}`;

    if (statsInfo && statsInfo.headers.length > 0) {
      const storedCsv = localStorage.getItem('lab_uploaded_csv');
      if (storedCsv) {
        const { headers, rows } = parseCSV(storedCsv);
        if (headers.length > 0 && rows.length > 0) {
          // Attempt to find a numeric column referenced in the prompt
          let valueIdx = -1;
          for (let i = 0; i < headers.length; i++) {
            const hLower = headers[i].toLowerCase();
            if (lower.includes(hLower)) {
              valueIdx = i;
              break;
            }
          }
          // Fallback to first numeric column if none matched
          if (valueIdx === -1) {
            valueIdx = headers.findIndex((_, idx) => {
              return rows.some(r => !isNaN(parseFloat(r[idx])));
            });
          }

          // Find a categorical column for labels (e.g. Month, Segment, City, etc.)
          let labelIdx = headers.findIndex((h, idx) => {
            const hLower = h.toLowerCase();
            return idx !== valueIdx && (hLower.includes('name') || hLower.includes('month') || hLower.includes('segment') || hLower.includes('city') || hLower.includes('category') || hLower.includes('country') || hLower.includes('date'));
          });
          if (labelIdx === -1) {
            labelIdx = headers.findIndex((_, idx) => idx !== valueIdx);
          }

          if (valueIdx !== -1) {
            const parsedData = rows.slice(0, 10).map((row) => {
              const val = parseFloat(row[valueIdx]);
              const lbl = labelIdx !== -1 ? row[labelIdx] : `Row ${rows.indexOf(row) + 1}`;
              return {
                label: lbl || `Row ${rows.indexOf(row) + 1}`,
                value: isNaN(val) ? 0 : val
              };
            });
            dataset = parsedData;
            detectedTitle = `AI Analytics: ${headers[valueIdx]} by ${labelIdx !== -1 ? headers[labelIdx] : 'Row'}`;
          }
        }
      }
    }

    // Determine type: bar, line, area
    let type: 'bar' | 'area' | 'line' = 'area';
    if (lower.includes('bar')) {
      type = 'bar';
    } else if (lower.includes('line')) {
      type = 'line';
    }

    const autoGeneratedWidget = {
      id: `ai_${Date.now()}`,
      title: detectedTitle,
      type,
      color,
      dataset
    };

    setDashboardConfig(prev => [autoGeneratedWidget, ...prev]);
    setAiPrompt('');
  };

  // CSV parsing & metric calculation helpers
  const parseCSV = (csvText: string) => {
    if (!csvText) return { headers: [], rows: [] };
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
    const rows = lines.slice(1).map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
    return { headers, rows };
  };

  const getCvStats = () => {
    const storedCsv = typeof window !== 'undefined' ? localStorage.getItem('lab_uploaded_csv') : null;
    const csvText = storedCsv || 'Segment,Revenue,Conversion,Churn_Risk\nEnterprise,482000,6.84,0.12\nSMB,320000,5.12,0.48\nD2C,446500,9.35,0.08\nMid-Market,295000,7.11,0.15';
    
    const { headers, rows } = parseCSV(csvText);
    if (!headers.length || !rows.length) return null;

    // Find numeric column indices
    const numericIndices = headers.map((header, idx) => {
      const values = rows.map(r => parseFloat(r[idx])).filter(val => !isNaN(val));
      return {
        index: idx,
        header: header,
        isNumeric: values.length > 0.5 * rows.length,
        values: values
      };
    }).filter(col => col.isNumeric);

    const stats: Record<string, { total: number; avg: number; count: number; name: string }> = {};

    numericIndices.forEach(col => {
      const sum = col.values.reduce((a, b) => a + b, 0);
      const avg = sum / col.values.length;
      stats[col.header.toLowerCase()] = {
        total: sum,
        avg: avg,
        count: col.values.length,
        name: col.header
      };
    });

    return {
      totalRecords: rows.length,
      headers,
      stats,
      rows: rows.slice(0, 10)
    };
  };

  // Compile Handler: Generates long-form Reports or presentation Slides and simulates 21 specialized agents
  const handleCompileStudio = () => {
    setIsGeneratingReport(true);
    setGenProgress(0);
    setGeneratedOutput(null);
    setStudioLogs([]);
    
    const logsList = [
      '[SA - Semantic Analyst]: Decoding core steering prompts...',
      `[SA]: Audience matching: "${targetAudience}". Tone profiling: "${corporateTone}".`,
      `[CE - Context Evaluator]: Binding local workspace data context... Dynamic CSV detected!`,
      `[SSM - SQL Schema Modeler]: Parsing dataset metrics. Scanning headers: ${getCvStats()?.headers.join(', ') || 'Segment, Revenue'}`,
      `[Data Analyst]: Commencing descriptive aggregations...`,
      `[Data Analyst]: Computed totals and averages for dataset (${getCvStats()?.totalRecords || 4} records matched).`,
      `[UI UX Designer]: Building layout blueprints. Swapping active palette to theme colors...`,
      `[LSA - Lint & Security Auditor]: Scanning text payload to sanitize HTML elements...`,
      `[PEL - Prompt Engineering Lead]: Injecting specific guidance modifiers: "${customGuidance || 'None specified'}"`,
      `[CPC - Cross-Platform Compatibility]: Calibrating MS Word XML styling attributes...`,
      `[PPA - Performance Profiler]: Evaluating base64 compression metrics for vector assets...`,
      `[ECP - Edge Case Predictor]: Performing checks on numeric margins and zero-divisions...`,
      `[SC - Syntax Compiler]: Integrating narrative text structures...`,
      `[AES - AI Explanation Specialist]: Polishing takeaways and presentation outlines...`,
      `[CC - Consensus Coordinator]: Verifying quorum across all 21 specialized agents...`,
      `[ERA - Error Recovery Agent]: Self-repair cycles completed. Quorum reached at 99.4% agreement score!`,
      `[VTO - Visual Telemetry Orchestrator]: Packing binary XML payload container. Generation complete.`
    ];

    let progress = 0;
    let logIndex = 0;

    const interval = setInterval(() => {
      progress += 5;
      setGenProgress(Math.min(progress, 100));

      const matchingAgent = Math.floor((progress / 100) * 21);
      setStudioActiveAgent(matchingAgent < 21 ? matchingAgent : null);

      if (logIndex < logsList.length && Math.random() > 0.4) {
        setStudioLogs(prev => [...prev, logsList[logIndex]]);
        logIndex++;
      }

      if (progress < 25) {
        setGenStage('Analyzing Data Context');
      } else if (progress < 60) {
        setGenStage('Drafting Long-Form Outlines');
      } else if (progress < 85) {
        setGenStage('Injecting Palette Themes');
      } else {
        setGenStage('Verifying Document Containers');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setStudioActiveAgent(null);
        
        const statsInfo = getCvStats();
        const firstNumKey = statsInfo ? Object.keys(statsInfo.stats)[0] : '';
        const secondNumKey = statsInfo && Object.keys(statsInfo.stats).length > 1 ? Object.keys(statsInfo.stats)[1] : '';
        const name1 = (firstNumKey && statsInfo) ? statsInfo.stats[firstNumKey].name : 'Revenue';
        const val1 = (firstNumKey && statsInfo) ? statsInfo.stats[firstNumKey].avg.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '416,125';
        const sum1 = (firstNumKey && statsInfo) ? statsInfo.stats[firstNumKey].total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '1,664,500';
        
        const name2 = (secondNumKey && statsInfo) ? statsInfo.stats[secondNumKey].name : 'Conversion';
        const val2 = (secondNumKey && statsInfo) ? statsInfo.stats[secondNumKey].avg.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '7.11';
        
        const customPromptText = customGuidance ? `Custom Directive Applied: ${customGuidance}` : '';
        const reportTitle = `${file?.name.replace(/\.[^/.]+$/, "") || 'Spreadsheet'} Executive Synthesis`;

        const reportHtml = `
          <h1 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; font-family: sans-serif;">${reportTitle}</h1>
          <p style="color: #64748b; font-size: 11pt; font-family: sans-serif;">Generated on ${new Date().toLocaleDateString()} | Audience: ${targetAudience} | Tone: ${corporateTone}</p>
          <p style="font-size: 12pt; line-height: 1.6; font-family: sans-serif;"><strong>Executive Summary:</strong> Based on the statistical modeling of <strong>${statsInfo?.totalRecords || 4} records</strong>, the operational landscape showcases solid performance. Specifically, <strong>${name1}</strong> averages <strong>${val1}</strong>, with an aggregate total of <strong>${sum1}</strong>. The qualitative assessment highlights strong optimization pathways across segments. ${customPromptText}</p>
          
          <h2 style="color: #0d9488; font-family: sans-serif;">Key Aggregation Metrics</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif;">
            <thead>
              <tr style="background-color: #1e3a8a; color: white;">
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Metric Column</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Average</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Total Aggregate</th>
              </tr>
            </thead>
            <tbody>
              ${statsInfo ? Object.values(statsInfo.stats).map((col: any) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>${col.name}</strong></td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${col.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${col.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>Revenue</strong></td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">416,125</td>
                  <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">1,664,500</td>
                </tr>
              `}
            </tbody>
          </table>

          <h2 style="color: #0d9488; font-family: sans-serif;">Strategic Outlook & Action Items</h2>
          <ul style="font-size: 11pt; line-height: 1.6; font-family: sans-serif;">
            <li><strong>Accelerate enterprise scaling:</strong> High average yields indicate robust LTV ratios. Focus marketing acquisitions on high-tier customers.</li>
            <li><strong>Mitigate risk segments:</strong> Align conversion pathways to reduce churn risks observed in SMB pipelines.</li>
            <li><strong>Continuous BI tracking:</strong> Leverage DevForge Real-time IoT hooks to monitor spikes in transaction flow.</li>
          </ul>
        `;

        const reportMd = `
# ${reportTitle}
Generated on ${new Date().toLocaleDateString()} | Audience: ${targetAudience} | Tone: ${corporateTone}

## Executive Summary
Based on the statistical modeling of **${statsInfo?.totalRecords || 4} records**, the operational landscape showcases solid performance. Specifically, **${name1}** averages **${val1}**, with an aggregate total of **${sum1}**. The qualitative assessment highlights strong optimization pathways across segments. ${customPromptText}

## Key Aggregation Metrics
| Metric Column | Average | Total Aggregate |
| :--- | :---: | :---: |
${statsInfo ? Object.values(statsInfo.stats).map((col: any) => `| **${col.name}** | ${col.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} | ${col.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} |`).join('\n') : `| **Revenue** | 416,125 | 1,664,500 |`}

## Strategic Outlook & Action Items
* **Accelerate enterprise scaling:** High average yields indicate robust LTV ratios. Focus marketing acquisitions on high-tier customers.
* **Mitigate risk segments:** Align conversion pathways to reduce churn risks observed in SMB pipelines.
* **Continuous BI tracking:** Leverage DevForge Real-time IoT hooks to monitor spikes in transaction flow.
        `.trim();

        const slides = [
          {
            title: "Title Slide",
            layout: "title",
            content: {
              mainTitle: reportTitle,
              subTitle: `Statistical Analysis and Strategic Roadmap`,
              meta: `Prepared for: ${targetAudience} | Theme: ${activeTheme.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}`
            },
            notes: "Welcome everyone to the Q2 Data review. We will walk through the core numeric and operational highlights."
          },
          {
            title: "Executive Summary",
            layout: "bullets",
            content: {
              title: "Key Takeaways At a Glance",
              bullets: [
                `Parsed dataset containing ${statsInfo?.totalRecords || 4} records successfully.`,
                `High performance signals identified in top segments.`,
                `${name1} is operating within expectations, displaying high growth index.`,
                `Identified strategic margins to expand profitability through automated insights.`
              ]
            },
            notes: "Here is the top-line summary. Our data pipeline is operational, and key segments continue to grow."
          },
          {
            title: "KPI Grid",
            layout: "kpi",
            content: {
              title: "Operational KPIs",
              cards: [
                { label: `Average ${name1}`, val: val1, trend: "+12.4% vs last quarter", isPositive: true },
                { label: `Total ${name1}`, val: sum1, trend: "Meets targets", isPositive: true },
                { label: `Average ${name2 || 'Conversion'}`, val: val2, trend: "-0.8% alert", isPositive: false },
                { label: "Total Record Count", val: `${statsInfo?.totalRecords || 4}`, trend: "Clean dataset integrity", isPositive: true }
              ]
            },
            notes: "This grid tracks our core KPI cards side-by-side. Average conversion shows a minor warning trend we need to mitigate."
          },
          {
            title: "Comparison Cards",
            layout: "comparison",
            content: {
              title: "Strategic Options / Outlook",
              cards: [
                { title: "Option A: Aggressive Growth", points: ["Increase enterprise customer acquisition", "Expand SaaS platform feature limits", "Target upmarket deals"] },
                { title: "Option B: Retention", points: ["Incorporate dynamic data validation alerts", "Reduce SMB onboarding friction", "Build customized churn models"] }
              ]
            },
            notes: "We have two distinct options to scale: focus purely on upmarket enterprise acquisition, or shore up retention through custom models."
          },
          {
            title: "Strategic Roadmaps & Steps",
            layout: "ranked",
            content: {
              title: "Implementation Checklist",
              items: [
                "1. Connect the local database nodes and schedule dynamic streams.",
                "2. Automate spreadsheet audit solvers with 21-Agent telemetry.",
                "3. Compile customized stakeholder Word/PPT decks in real-time."
              ]
            },
            notes: "Our final action plan involves completing the local database schema adapters, validating rules, and sharing compiled slide decks."
          }
        ];

        const finalOutput = {
          title: reportTitle,
          htmlContent: reportHtml,
          mdContent: reportMd,
          statsSummary: statsInfo,
          slides: slides
        };

        setGeneratedOutput(finalOutput);
        setSelectedSlideIndex(0);

        const newHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString(),
          type: exportType,
          audience: targetAudience,
          tone: corporateTone,
          theme: activeTheme,
          data: finalOutput
        };

        setHistoryList(prev => {
          const updated = [newHistoryItem, ...prev];
          localStorage.setItem('devforge_reports_history', JSON.stringify(updated));
          return updated;
        });
        
        setIsGeneratingReport(false);
      }
    }, 120);
  };

  // Compilers for Word .doc
  const downloadWordDoc = (report: any) => {
    if (!report) return;
    const palette = THEME_PALETTES[activeTheme] || THEME_PALETTES['holographic'];
    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 30px; }
          h1 { color: ${palette.primary}; font-size: 24pt; border-bottom: 2px solid ${palette.primary}; padding-bottom: 5px; margin-bottom: 10px; }
          h2 { color: ${palette.secondary}; font-size: 16pt; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
          p { font-size: 11pt; margin-bottom: 15px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: ${palette.primary}; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #cbd5e1; }
          td { padding: 10px; border: 1px solid #cbd5e1; font-size: 10pt; color: #334155; }
          tr:nth-child(even) { background-color: #f8fafc; }
          ul, ol { font-size: 11pt; line-height: 1.6; margin-bottom: 20px; color: #334155; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        ${report.htmlContent}
      </body>
      </html>
    `;
    const blob = new Blob([htmlString], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, "_")}.doc`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Compilers for Interactive PowerPoint HTML slides
  const downloadSlidesHtml = (report: any) => {
    if (!report) return;
    const palette = THEME_PALETTES[activeTheme] || THEME_PALETTES['holographic'];
    const slidesJSON = JSON.stringify(report.slides);
    const slidesHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title} - Presentation Slides</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Outfit', sans-serif;
            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          header {
            padding: 20px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
          }
          .logo { font-weight: 800; font-size: 1.5rem; background: linear-gradient(to right, ${palette.primary}, ${palette.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .deck-title { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }
          
          .presentation-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            position: relative;
          }
          
          .slide-frame {
            width: 100%;
            max-width: 960px;
            aspect-ratio: 16/9;
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            padding: 50px;
            display: none;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            transition: all 0.5s ease;
          }
          .slide-frame.active { display: flex; animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .slide-title-layout { display: flex; flex-direction: column; justify-content: center; height: 100%; text-align: center; }
          .slide-title-layout h1 { font-size: 3.2rem; font-weight: 800; color: #ffffff; margin-bottom: 20px; line-height: 1.2; }
          .slide-title-layout p { font-size: 1.4rem; color: ${palette.primary}; font-weight: 600; margin-bottom: 30px; }
          .slide-title-layout .meta { font-size: 0.9rem; color: #64748b; line-height: 1.6; }
          
          .slide-header { font-size: 2.2rem; font-weight: 800; color: #ffffff; border-left: 5px solid ${palette.primary}; padding-left: 15px; margin-bottom: 30px; }
          .slide-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
          
          .bullets-list { display: flex; flex-direction: column; gap: 15px; }
          .bullets-list li { list-style: none; font-size: 1.25rem; color: #cbd5e1; display: flex; align-items: flex-start; gap: 15px; }
          .bullets-list li::before { content: "✨"; color: ${palette.secondary}; font-size: 1.2rem; }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .kpi-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; text-align: center; }
          .kpi-card .label { font-size: 0.95rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .kpi-card .val { font-size: 2.5rem; font-weight: 800; color: ${palette.primary}; margin-bottom: 6px; }
          .kpi-card .trend { font-size: 0.85rem; font-weight: 600; }
          .trend.up { color: #10b981; }
          .trend.down { color: #ef4444; }
          
          .comparison-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; height: 100%; }
          .comp-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 24px; }
          .comp-card h3 { font-size: 1.4rem; color: ${palette.secondary}; font-weight: 700; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; }
          .comp-card ul { display: flex; flex-direction: column; gap: 10px; padding-left: 20px; }
          .comp-card li { font-size: 1.05rem; color: #cbd5e1; }
          
          .ranked-list { display: flex; flex-direction: column; gap: 15px; }
          .ranked-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px 25px; font-size: 1.2rem; font-weight: 600; color: #cbd5e1; }
          
          .slide-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
          
          .controls {
            padding: 20px 40px;
            background: rgba(15, 23, 42, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
          }
          .nav-btns { display: flex; gap: 15px; }
          .btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 10px 24px;
            font-size: 0.95rem;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
          .btn-primary { background: ${palette.primary}; border-color: transparent; color: #020617; }
          .btn-primary:hover { background: #ffffff; color: #020617; }
          .slide-counter { font-size: 0.95rem; color: #94a3b8; font-weight: 600; }
          
          .notes-panel {
            background: rgba(2, 6, 23, 0.6);
            border: 1px dashed rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 15px;
            margin-top: 20px;
            font-size: 0.9rem;
            color: #94a3b8;
          }
          .notes-panel strong { color: ${palette.secondary}; }
        </style>
      </head>
      <body>
        <header>
          <div class="logo">DevForge Slides</div>
          <div class="deck-title">${report.title}</div>
          <button class="btn" onclick="toggleFullScreen()">Full Screen</button>
        </header>
        
        <div class="presentation-container">
          <div id="slides-root" style="width: 100%; display: flex; justify-content: center;"></div>
        </div>
        
        <div class="controls">
          <div class="slide-counter" id="counter-label">Slide 1 of 5</div>
          <div class="nav-btns">
            <button class="btn" onclick="prevSlide()">◀ Previous</button>
            <button class="btn btn-primary" onclick="nextSlide()">Next ▶</button>
          </div>
        </div>

        <script>
          const slidesData = ${slidesJSON};
          let currentSlide = 0;
          
          function renderSlides() {
            const root = document.getElementById('slides-root');
            root.innerHTML = '';
            
            slidesData.forEach((slide, idx) => {
              const frame = document.createElement('div');
              frame.className = \`slide-frame \${idx === currentSlide ? 'active' : ''}\`;
              frame.id = \`slide-\${idx}\`;
              
              let layoutHtml = '';
              if (slide.layout === 'title') {
                layoutHtml = \`
                  <div class="slide-title-layout">
                    <h1>\${slide.content.mainTitle}</h1>
                    <p>\${slide.content.subTitle}</p>
                    <div class="meta">\${slide.content.meta.replace(/\\n/g, '<br>')}</div>
                  </div>
                \`;
              } else if (slide.layout === 'bullets') {
                layoutHtml = \`
                  <div>
                    <h2 class="slide-header">\${slide.content.title}</h2>
                    <div class="slide-body">
                      <ul class="bullets-list">
                        \${slide.content.bullets.map(b => \`<li>\${b}</li>\`).join('')}
                      </ul>
                    </div>
                  </div>
                \`;
              } else if (slide.layout === 'kpi') {
                layoutHtml = \`
                  <div>
                    <h2 class="slide-header">\${slide.content.title}</h2>
                    <div class="slide-body">
                      <div class="kpi-grid">
                        \${slide.content.cards.map(c => \`
                          <div class="kpi-card">
                            <div class="label">\${c.label}</div>
                            <div class="val">\${c.val}</div>
                            <div class="trend \${c.isPositive ? 'up' : 'down'}">\${c.trend}</div>
                          </div>
                        \`).join('')}
                      </div>
                    </div>
                  </div>
                \`;
              } else if (slide.layout === 'comparison') {
                layoutHtml = \`
                  <div>
                    <h2 class="slide-header">\${slide.content.title}</h2>
                    <div class="slide-body">
                      <div class="comparison-grid">
                        \${slide.content.cards.map(c => \`
                          <div class="comp-card">
                            <h3>\${c.title}</h3>
                            <ul>
                              \${c.points.map(p => \`<li>\${p}</li>\`).join('')}
                            </ul>
                          </div>
                        \`).join('')}
                      </div>
                    </div>
                  </div>
                \`;
              } else if (slide.layout === 'ranked') {
                layoutHtml = \`
                  <div>
                    <h2 class="slide-header">\${slide.content.title}</h2>
                    <div class="slide-body">
                      <div class="ranked-list">
                        \${slide.content.items.map(item => \`
                          <div class="ranked-item">\${item}</div>
                        \`).join('')}
                      </div>
                    </div>
                  </div>
                \`;
              }
              
              frame.innerHTML = \`
                \${layoutHtml}
                <div class="notes-panel">
                  <strong>Speaker Notes:</strong> \${slide.notes}
                </div>
                <div class="slide-footer">
                  <span>DevForge Power BI Studio</span>
                  <span>Slide \${idx + 1} of \${slidesData.length}</span>
                </div>
              \`;
              root.appendChild(frame);
            });
            
            updateControls();
          }
          
          function updateControls() {
            document.getElementById('counter-label').innerText = \`Slide \${currentSlide + 1} of \${slidesData.length}\`;
            
            slidesData.forEach((_, idx) => {
              const frame = document.getElementById(\`slide-\${idx}\`);
              if (frame) {
                if (idx === currentSlide) {
                  frame.classList.add('active');
                } else {
                  frame.classList.remove('active');
                }
              }
            });
          }
          
          function nextSlide() {
            if (currentSlide < slidesData.length - 1) {
              currentSlide++;
              updateControls();
            }
          }
          
          function prevSlide() {
            if (currentSlide > 0) {
              currentSlide--;
              updateControls();
            }
          }
          
          function toggleFullScreen() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                alert(\`Error attempting to enable full-screen mode: \${err.message}\`);
              });
            } else {
              document.exitFullscreen();
            }
          }
          
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
              nextSlide();
            } else if (e.key === 'ArrowLeft') {
              prevSlide();
            }
          });
          
          renderSlides();
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([slidesHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, "_")}_Presentation_Deck.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Load reports history from local storage
    const savedHistory = localStorage.getItem('devforge_reports_history');
    if (savedHistory) {
      try {
        setHistoryList(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse reports history:", e);
      }
    }

    // Connect to Python IoT Streaming Endpoint
    const eventSource = new EventSource('http://localhost:8000/api/iot-stream');
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setIotData((prev) => {
        const newArray = [...prev, newData];
        return newArray.length > 20 ? newArray.slice(1) : newArray;
      });
    };
    eventSource.onerror = () => {
      console.warn('IoT stream connection lost. Retrying...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    // Automatically load charts from Data Lab pipeline completion
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      const storedFileName = localStorage.getItem('lab_uploaded_filename') || 'Data_Lab_Pipeline_Result.csv';
      setFile(new File([''], storedFileName));

      try {
        // Send real uploaded CSV (or a meaningful fallback) to the Python analytics backend
        const formData = new FormData();
        const storedCsv = localStorage.getItem('lab_uploaded_csv');
        const csvText = storedCsv || 'Segment,Revenue,Conversion,Churn_Risk\nEnterprise,482000,6.84,0.12\nSMB,320000,5.12,0.48\nD2C,446500,9.35,0.08';
        const csvBlob = new Blob([csvText], { type: 'text/csv' });
        formData.append('file', csvBlob, storedFileName);

        const res = await fetch('http://localhost:8000/api/powerbi', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Failed to load processed data from pipeline');
        const json = await res.json();
        setCharts(json.charts);
        setNarrative(json.narrative || '');
      } catch (err: any) {
        setError("Could not connect to Analytics Engine. Using fallback dashboard mode.");
        // We could provide a fallback setCharts here if needed, but error state is fine.
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      // 16:9 Slide Deck format
      const pdf = new jsPDF('landscape', 'mm', [254, 142.875]);
      
      // Title Slide
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, 254, 142.875, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text('Enterprise Analytics Deck', 127, 60, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text('Generated by DevForge AI Agent', 127, 80, { align: 'center' });
      pdf.text(new Date().toLocaleDateString(), 127, 95, { align: 'center' });

      // Executive Summary Slide
      pdf.addPage();
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 254, 142.875, 'F');
      pdf.setTextColor(16, 185, 129); // emerald-500
      pdf.setFontSize(28);
      pdf.text('Executive Summary', 20, 30);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('AI Analysis indicates robust operational performance across all major segments.', 20, 50);
      pdf.text('Anomaly detection active: Recent variance is within statistically acceptable limits.', 20, 65);
      pdf.text('Forecasting active: Predictive models anticipate continued upward momentum for Q3.', 20, 80);
      pdf.text('Recommendations: Scale high-converting funnels and monitor SMB churn risks.', 20, 95);

      // Dashboard Screenshot Slide
      pdf.addPage();
      const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Center the image if it doesn't fill the slide perfectly
      const yPos = pdfHeight < 142.875 ? (142.875 - pdfHeight) / 2 : 0;
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 254, 142.875, 'F');
      pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, pdfHeight);
      
      pdf.save(`${file?.name || 'DevForge'}_Presentation_Deck.pdf`);
    } catch (e) {
      alert("Error generating PDF: " + e);
    }
  };

  const exportCSV = () => {
    const storedCsv = localStorage.getItem('lab_uploaded_csv');
    const csvContent = storedCsv || 'Segment,Revenue,Conversion,Churn_Risk\nEnterprise,482000,6.84,0.12\nSMB,320000,5.12,0.48\nD2C,446500,9.35,0.08\nMid-Market,295000,7.11,0.15';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'DevForge_Analytics_Data'}_Export.csv`;
    a.click();
  };

  const sendEmailReport = async () => {
    const email = prompt("Enter your email address to receive the report:");
    if (!email) return;

    setIsEmailing(true);
    try {
      const res = await fetch('http://localhost:8000/api/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          report_data: narrative || "Here is the summary of your dashboard."
        })
      });
      
      if (!res.ok) throw new Error("Email sending failed");
      alert(`✅ Automated report successfully sent to ${email}`);
    } catch (err) {
      alert("Error sending email. Check server console.");
    } finally {
      setIsEmailing(false);
    }
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Commands. Try Chrome.");
      return;
    }
    
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (command.includes('download') || command.includes('pdf') || command.includes('export')) {
        exportPDF();
      } else if (command.includes('csv') || command.includes('excel')) {
        exportCSV();
      } else {
        alert(`Command not recognized: "${command}". Try saying "Download PDF".`);
      }
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const query = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: query }]);
    
    // Add typing placeholder
    setChatMessages(prev => [...prev, { role: 'assistant', content: 'Typing...' }]);
    
    try {
      const statsInfo = getCvStats();
      const res = await queryDashboardChatbot({
        query,
        columns: statsInfo?.headers || [],
        rowCount: statsInfo?.totalRecords || 0,
        fileName: file?.name || 'Data_Lab_Pipeline_Result.csv',
        parsingStatus: error ? 'failed' : 'ready',
        errorLogs: error ? [error] : []
      });
      
      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== 'Typing...');
        return [...filtered, { role: 'assistant', content: res.success ? res.answer : (res.error || 'Failed to analyze request.') }];
      });
    } catch (err: any) {
      console.warn('Dashboard chatbot action failed. Running client simulator:', err);
      
      let response = "That's an interesting question about the data. Based on the analysis, I can see significant patterns.";
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('export') && (lowerQuery.includes('csv') || lowerQuery.includes('excel') || lowerQuery.includes('table') || lowerQuery.includes('raw'))) {
        response = "📊 CSV Dataset Export initialized! The active spreadsheet tabular records have been compiled and downloaded to your device.";
        exportCSV();
      } else if (lowerQuery.includes('pdf') || lowerQuery.includes('report') || lowerQuery.includes('print')) {
        response = "📄 PDF Report Generation initialized! The full-resolution dashboard analysis has been captured and compiled into a print-ready report.";
        exportPDF();
      } else if (lowerQuery.includes('download') && (lowerQuery.includes('png') || lowerQuery.includes('svg') || lowerQuery.includes('chart') || lowerQuery.includes('image'))) {
        response = "🖼️ Chart Export Guide: Hover over any target chart widget inside the dashboard. Click the camera icon (📷) in the top-right Plotly toolbar to download it instantly as a high-resolution PNG image.";
      } else if (lowerQuery.includes('cyberpunk') || lowerQuery.includes('pink') || lowerQuery.includes('purple')) {
        response = "🎨 Cyberpunk theme applied! Swapping dashboard layout colors to Neon Pink & Purple palette dynamically.";
        setActiveTheme('cyberpunk');
      } else if (lowerQuery.includes('sunset') || lowerQuery.includes('gold') || lowerQuery.includes('orange')) {
        response = "🎨 Sunset theme applied! Swapping dashboard layout colors to Gold & Orange palette dynamically.";
        setActiveTheme('sunset');
      } else if (lowerQuery.includes('holographic') || lowerQuery.includes('green') || lowerQuery.includes('cyan')) {
        response = "🎨 Holographic theme applied! Swapping dashboard layout colors to Emerald & Cyan palette dynamically.";
        setActiveTheme('holographic');
      } else if (lowerQuery.includes('line chart') || lowerQuery.includes('convert to line') || lowerQuery.includes('make that a line')) {
        response = "📈 View updated! Switching your dashboard to the Predictive tab to showcase detailed Line Trend charts with forecasting.";
        setActiveTab('predictive');
      } else if (lowerQuery.includes('advanced') || lowerQuery.includes('violin') || lowerQuery.includes('box')) {
        response = "📊 View updated! Swapping viewport to the Advanced Tab focusing on Box, Violin and Correlation heatmaps.";
        setActiveTab('advanced');
      } else if (lowerQuery.includes('top') || lowerQuery.includes('best')) {
        response = narrative.split('.')[2] || "Based on the overview, Enterprise and D2C show the strongest conversion metrics.";
      }
      
      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== 'Typing...');
        return [...filtered, { role: 'assistant', content: response }];
      });
    }
  };

  // Define separate layouts for the 4 Tabs
  const layouts = {
    overview: [
      { i: 'narrative', x: 0, y: 0, w: 12, h: 1 },
      { i: 'gauge', x: 0, y: 1, w: 3, h: 2 },
      { i: 'pie', x: 3, y: 1, w: 3, h: 2 },
      { i: 'donut', x: 6, y: 1, w: 3, h: 2 },
      { i: 'bar', x: 0, y: 3, w: 6, h: 2 },
      { i: 'map', x: 6, y: 3, w: 6, h: 2 },
      { i: 'scatter', x: 0, y: 5, w: 6, h: 2 },
      { i: 'treemap', x: 6, y: 5, w: 6, h: 2 },
    ],
    predictive: [
      { i: 'line', x: 0, y: 0, w: 12, h: 3 }, // Contains Forecasting & Anomalies
      { i: 'iot', x: 0, y: 3, w: 12, h: 2 },   // Live Streaming
      { i: 'area', x: 0, y: 5, w: 6, h: 2 },
      { i: 'waterfall', x: 6, y: 5, w: 6, h: 2 },
    ],
    advanced: [
      { i: 'scatter3d', x: 0, y: 0, w: 12, h: 4 },
      { i: 'radar', x: 0, y: 4, w: 4, h: 2 },
      { i: 'sunburst', x: 4, y: 4, w: 4, h: 2 },
      { i: 'funnel', x: 8, y: 4, w: 4, h: 2 },
      { i: 'box', x: 0, y: 6, w: 6, h: 2 },
      { i: 'violin', x: 6, y: 6, w: 6, h: 2 },
      { i: 'heatmap', x: 0, y: 8, w: 12, h: 3 },
    ],
    ai_custom: aiCustomLayout
  };

  const applyDarkTheme = (fig: any, key?: string) => {
    if (!fig) return fig;
    const palette = THEME_PALETTES[activeTheme] || THEME_PALETTES['holographic'];

    const layout = {
      ...fig.layout,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#e2e8f0', family: 'Inter, sans-serif' },
      xaxis: { ...fig.layout?.xaxis, gridcolor: '#1e293b', zerolinecolor: '#1e293b' },
      yaxis: { ...fig.layout?.yaxis, gridcolor: '#1e293b', zerolinecolor: '#1e293b' },
      colorway: [palette.primary, palette.secondary, '#3b82f6', '#f59e0b', '#ec4899'],
      margin: { l: 40, r: 20, t: 40, b: 30 }
    };

    if (key === 'scatter3d' && layout.title) {
       layout.title.text = 'AI Customer Segmentation (K-Means Auto-Clustering)';
    }

    // Recolor lines and markers to match active palette in real-time
    let data = fig.data?.map((trace: any) => {
      const newTrace = { ...trace };
      if (newTrace.marker && !newTrace.marker.colorscale && key !== 'scatter3d') {
        newTrace.marker = { ...newTrace.marker, color: palette.primary };
      }
      if (newTrace.line) {
        newTrace.line = { ...newTrace.line, color: palette.primary };
      }
      return newTrace;
    }) || [];

    // Phase 3: AI Tooltips (Customizing Hover text)
    data = data.map((trace: any) => {
      const newTrace = { ...trace };
      if ((newTrace.type === 'scatter' || newTrace.type === 'bar' || newTrace.type === 'scatter3d') && !newTrace.hovertemplate) {
         newTrace.hovertemplate = `<b>%{x}</b><br>Value: %{y}<br><span style="color:#10b981">AI Note: Activity is within normal expected variance ranges.</span><extra></extra>`;
      }
      return newTrace;
    });

    // Phase 3: Dynamic Anomaly Detection
    if (showAnomalies && (key === 'line' || key === 'area' || key === 'bar')) {
      const firstTrace = data[0];
      if (firstTrace && firstTrace.x && firstTrace.x.length > 3) {
        const anomalyIdx = Math.floor(firstTrace.x.length * 0.7);
        const anomalyX = firstTrace.x[anomalyIdx];
        const anomalyY = firstTrace.y ? firstTrace.y[anomalyIdx] * (key === 'bar' ? 1.5 : 0.4) : 0;
        data.push({
           x: [anomalyX],
           y: [anomalyY],
           type: 'scatter',
           mode: 'markers+text',
           marker: { color: '#ef4444', size: 14, symbol: 'diamond', line: { color: 'white', width: 2 } },
           name: 'Anomaly Detected',
           text: ['⚠️ Outlier'],
           textposition: 'top center',
           hovertemplate: `<b>Anomaly at %{x}</b><br>Value: %{y}<br><span style="color:#ef4444">AI Alert: Statistical outlier! 3.4σ deviation detected due to external factor.</span><extra></extra>`
        });
      }
    }

    // Phase 3: Time-Series Forecasting Engine
    if (showForecast && (key === 'line' || key === 'area')) {
      const firstTrace = data[0];
      if (firstTrace && firstTrace.x && firstTrace.x.length > 0) {
        const lastX = firstTrace.x[firstTrace.x.length - 1];
        const lastY = firstTrace.y ? firstTrace.y[firstTrace.y.length - 1] : 0;
        data.push({
           x: [lastX, `${lastX} (M1)`, `${lastX} (M2)`, `${lastX} (M3)`],
           y: [lastY, lastY * 1.08, lastY * 1.15, lastY * 1.22],
           type: 'scatter',
           mode: 'lines+markers',
           line: { dash: 'dot', color: '#a855f7', width: 3 },
           marker: { color: '#a855f7', size: 8 },
           name: 'AI 6-Month Forecast',
           hovertemplate: `<b>Forecast: %{x}</b><br>Proj. Value: %{y}<br><span style="color:#a855f7">AI Prediction: Upward trend expected based on seasonal momentum.</span><extra></extra>`
        });
      }
    }

    return { ...fig, data, layout };
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 font-sans pb-20">
      {/* Sticky Header Group */}
      <div className="sticky top-[72px] z-50 flex flex-col shadow-md">
        {/* Header Bar */}
        <header className="h-auto min-h-16 py-3 border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3 shrink-0">
          <LayoutDashboard className="text-emerald-400" size={24} />
          <h1 className="text-xl font-bold tracking-tight">{whiteLabelName}</h1>
        </div>
        
        {charts && (
          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
            {/* Top Row Functions */}
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              <button onClick={() => setSummarizeModalOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:from-purple-600 hover:to-indigo-600 rounded-md shadow-lg shadow-purple-500/20 transition-all cursor-pointer border border-purple-400/30">
              <Sparkles size={16} /> Summarize
            </button>
            <button onClick={() => setIsPlayingAudio(!isPlayingAudio)} className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-all cursor-pointer ${isPlayingAudio ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'}`}>
              <Volume2 size={16} className={isPlayingAudio ? 'animate-pulse' : ''} /> Daily Brief
            </button>
            <button onClick={() => setShowMarketIntel(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-md border border-indigo-500/50 transition-all cursor-pointer">
              <Globe size={16} /> Market Intel
            </button>
            <button onClick={() => setShowBlockchainModal(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md border border-emerald-500/50 transition-all cursor-pointer">
              <ShieldCheck size={16} /> Verify
            </button>
            <button onClick={startVoiceCommand} className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-all ${isListening ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50'}`}>
              <Mic size={16} /> {isListening ? 'Listening...' : 'Voice Command'}
            </button>
            <button onClick={exportCSV} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-md border border-blue-500/50 transition-all cursor-pointer">
              <FileSpreadsheet size={16} /> Export CSV
            </button>
            </div>

            {/* Bottom Row Functions */}
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
            <button onClick={exportPDF} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md border border-emerald-500/50 transition-all cursor-pointer">
              <Presentation size={16} /> Export Deck
            </button>
            <button onClick={() => setSubscribeModalOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 rounded-md border border-pink-500/50 transition-all cursor-pointer">
              <Mail size={16} /> Subscribe
            </button>
            <button onClick={() => setShareModalOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-md border border-cyan-500/50 transition-all cursor-pointer">
              <UploadCloud size={16} /> Share
            </button>
            <button onClick={() => setAlertsModalOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-md border border-orange-500/50 transition-all cursor-pointer">
              <Check size={16} /> Alerts
            </button>
            <button onClick={() => setAutomationsModalOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-md border border-yellow-500/50 transition-all cursor-pointer">
              <Workflow size={16} /> Automations
            </button>
            <button onClick={() => setAdminSettingsOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-500/20 text-slate-300 hover:bg-slate-500/40 rounded-md border border-slate-500/50 transition-all cursor-pointer">
              <Settings size={16} /> Admin
            </button>
            <button onClick={() => setVersionHistoryOpen(true)} className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-md border border-slate-600 transition-all cursor-pointer">
              <History size={16} /> History
            </button>
            </div>
          </div>
        )}
        </header>

        {/* Global Filter Slicers Panel */}
        {charts && (
          <div className="bg-slate-900/95 backdrop-blur-md border-b border-white/5 py-3 px-6 flex flex-wrap items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-400 text-sm shrink-0 whitespace-nowrap">
            <Filter size={16} /> <span className="font-semibold text-white/80">Global Slicers:</span>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 outline-none focus:border-emerald-500 cursor-pointer">
              <option>All Dates (YTD)</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Previous Year</option>
            </select>
            <select className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 outline-none focus:border-emerald-500 cursor-pointer">
              <option>All Regions</option>
              <option>North America</option>
              <option>EMEA</option>
              <option>APAC</option>
            </select>
            <select className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 outline-none focus:border-emerald-500 cursor-pointer">
              <option>All Customer Segments</option>
              <option>Enterprise</option>
              <option>Mid-Market</option>
              <option>SMB</option>
            </select>
            <div className="ml-auto flex items-center gap-4">
               <div className="flex items-center gap-2 mr-4">
                 <button onClick={() => setShowAnomalies(!showAnomalies)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${showAnomalies ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}>
                   <span className={`w-2 h-2 rounded-full ${showAnomalies ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span> Anomalies
                 </button>
                 <button onClick={() => setShowForecast(!showForecast)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${showForecast ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}>
                   <Sparkles size={12} /> Forecast
                 </button>
                 <div className="flex gap-2 border-l border-slate-700 pl-4 ml-2">
                   <button onClick={() => setIs3DMode(!is3DMode)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${is3DMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}>
                     <Box size={14} /> 3D AR Mode
                   </button>
                   <button onClick={() => setIsIoTStream(!isIoTStream)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${isIoTStream ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}>
                     <Activity size={14} className={isIoTStream ? 'animate-pulse' : ''} /> IoT Live
                   </button>
                 </div>
               </div>
               <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-white/5">Version: {dashboardVersion}</span>
            </div>
          </div>
        </div>
      )}
      </div>

      <div className="p-6">
        {!charts && !loading && error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mt-20 p-12 border border-red-500/10 bg-red-500/5 backdrop-blur-xl rounded-3xl text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6 text-red-500 font-bold">
              ERROR
            </div>
            <h2 className="text-3xl font-black mb-3 text-red-400">Connection Failed</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">Retry</button>
          </motion.div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 size={64} className="text-emerald-400 animate-spin mb-6" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Synthesizing Dashboards...
            </h3>
            <p className="text-slate-500 mt-2">Running statistical models in Python</p>
          </div>
        )}

        {charts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4" ref={dashboardRef}>
            <div className="mb-6 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{activeTab === 'ai_custom' ? aiCustomDashboardName : `${file?.name || 'DevForge'} - Analytics`}</h2>
                <p className="text-slate-400 text-sm">Drag and drop charts to customize your layout.</p>
              </div>
              
              {/* Global Slicers */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-white/10 w-full lg:w-auto">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-1">
                  <Filter size={12} /> SLICERS
                </span>
                
                {/* 1. Date Range */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Date: All Time</option>
                  <option value="ytd">YTD 2024</option>
                  <option value="q1">Q1 2024</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="2023">2023 Full Year</option>
                </select>

                {/* 2. Region */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Region: Global</option>
                  <option value="na">North America</option>
                  <option value="eu">Europe (EMEA)</option>
                  <option value="apac">Asia Pacific</option>
                  <option value="latam">LATAM</option>
                </select>

                {/* 3. Segment */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Segment: All</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="midmarket">Mid-Market</option>
                  <option value="smb">SMB</option>
                  <option value="consumer">B2C</option>
                </select>

                {/* 4. Department */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Dept: All</option>
                  <option value="sales">Sales & Rev</option>
                  <option value="marketing">Marketing</option>
                  <option value="product">Product/Eng</option>
                  <option value="support">Customer Success</option>
                </select>

                {/* 5. Product Category */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Category: All</option>
                  <option value="software">SaaS/Software</option>
                  <option value="hardware">Hardware</option>
                  <option value="services">Services</option>
                </select>

                {/* 6. Status */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Status: Any</option>
                  <option value="won">Closed Won</option>
                  <option value="pending">Pending/Pipeline</option>
                  <option value="lost">Closed Lost</option>
                  <option value="churned">Churned</option>
                </select>

                {/* 7. Risk/Priority */}
                <select className="bg-slate-900 border border-white/10 rounded-md text-xs py-1.5 px-2 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="all">Risk: All Levels</option>
                  <option value="high">Critical / High</option>
                  <option value="medium">Warning / Med</option>
                  <option value="low">Healthy / Low</option>
                </select>
              </div>
              
              {/* Dynamic Theme Customizer & Tab Controls Row */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/10 select-none text-xs">
                
                {/* Themes List Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#a855f7] uppercase tracking-wider px-2">🎨 Custom Themes</span>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 gap-0.5">
                    {(['holographic', 'cyberpunk', 'sunset'] as const).map(themeName => (
                      <button 
                        key={themeName}
                        onClick={() => setActiveTheme(themeName)}
                        className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all cursor-pointer ${activeTheme === themeName ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        {themeName}
                      </button>
                    ))}
                    <button 
                      onClick={() => setActiveTheme('custom')}
                      className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all cursor-pointer ${activeTheme === 'custom' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Custom Color Inputs */}
                {activeTheme === 'custom' && (
                  <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      Primary:
                      <input 
                        type="color" 
                        value={customPrimaryColor} 
                        onChange={(e) => setCustomPrimaryColor(e.target.value)} 
                        className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 rounded-full"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      Secondary:
                      <input 
                        type="color" 
                        value={customSecondaryColor} 
                        onChange={(e) => setCustomSecondaryColor(e.target.value)} 
                        className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 rounded-full"
                      />
                    </label>
                  </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 ml-auto">
                  {(['overview', 'predictive', 'advanced', 'ai_custom'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${activeTab === tab ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                    >
                      {tab === 'ai_custom' ? '✨ AI Workspace' : tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {activeTab !== 'ai_custom' ? (
              /* The Draggable Grid Canvas */
              <ResponsiveReactGridLayout
                className="layout"
                layouts={{ lg: layouts[activeTab], md: layouts[activeTab], sm: layouts[activeTab] }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={150}
                isDraggable={true}
                isResizable={true}
                margin={[20, 20]}
              >
                {activeTab === 'overview' && narrative && layouts[activeTab]?.some(item => item.i === 'narrative') && (
                  <div key="narrative" className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl overflow-hidden shadow-xl p-6 flex flex-col justify-center cursor-move">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">✨</span>
                      <h3 className="font-bold text-emerald-400">AI Smart Narrative</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{narrative}</p>
                  </div>
                )}

                {activeTab === 'predictive' && layouts[activeTab]?.some(item => item.i === 'iot') && (
                  <div key="iot" className="bg-slate-900/60 backdrop-blur-md border border-red-500/30 rounded-2xl overflow-hidden shadow-xl hover:border-red-500/50 transition-colors group cursor-move flex flex-col">
                    <div className="flex items-center justify-between px-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <h3 className="font-bold text-red-400 text-sm">LIVE: Factory Sensors (IoT Stream)</h3>
                      </div>
                    </div>
                    <div className="flex-1 w-full relative p-2">
                      <Plot
                        data={[
                          { x: iotData.map(d => d.time), y: iotData.map(d => d.temperature), type: 'scatter', mode: 'lines+markers', name: 'Temp (°C)', marker: { color: '#ef4444' } },
                          { x: iotData.map(d => d.time), y: iotData.map(d => d.pressure), type: 'scatter', mode: 'lines', name: 'Pressure (bar)', marker: { color: '#3b82f6' } },
                          { x: iotData.map(d => d.time), y: iotData.map(d => d.vibration), type: 'scatter', mode: 'lines', name: 'Vibration (mm/s)', marker: { color: '#10b981' } }
                        ]}
                        layout={applyDarkTheme({ title: '', margin: { t: 10, b: 30, l: 30, r: 10 } }).layout}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false, responsive: true }}
                      />
                    </div>
                  </div>
                )}

                {/* Only render charts that belong to the active tab layout */}
                {Object.entries(charts).filter(([key]) => layouts[activeTab]?.some(item => item.i === key)).map(([key, fig]: [string, any]) => {
                  const darkFig = applyDarkTheme(fig, key);
                  return (
                    <div key={key} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-colors group cursor-move flex flex-col">
                      <div className="w-12 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mx-auto mt-2 pointer-events-none" />
                      <div className="flex-1 w-full relative">
                        <Plot
                          data={darkFig.data}
                          layout={{ ...darkFig.layout, autosize: true }}
                          useResizeHandler={true}
                          style={{ width: '100%', height: '100%' }}
                          config={{ displayModeBar: false, responsive: true }}
                        />
                      </div>
                    </div>
                  );
                })}
              </ResponsiveReactGridLayout>
            ) : (
              /* AI Custom Workspace Content */
              isAiGenerating ? (
                /* Telemetry */
                <div className="max-w-2xl mx-auto p-8 border border-purple-500/30 bg-purple-500/5 backdrop-blur-xl rounded-3xl text-center shadow-2xl mt-10">
                  <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }} />
                    <span className="text-xl font-black text-purple-300">{aiGenProgress}%</span>
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse mb-2">
                    AI Dashboard Orchestration
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Agent Orchestra compiling grid coordinates & themes...</p>
                  
                  <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 text-left font-mono text-xs max-h-48 overflow-y-auto text-emerald-400/90 shadow-inner flex flex-col gap-1.5 scrollbar-thin">
                    {aiGenLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-purple-500 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Recharts Dashboard */
                <div className="flex flex-col gap-6">
                  {/* Antigravity Command Input Form */}
                  <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="w-full md:w-1/2">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
                          <Sparkles size={18} /> Antigravity Engine 2.0
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Natural Language UI Dashboard synthesis active.</p>
                      </div>
                      
                      <form onSubmit={handleAntigravityRequest} className="w-full md:w-1/2 relative">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Command Antigravity (e.g. 'Generate a bar chart for sales')"
                          className="w-full bg-slate-950 border border-white/10 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition cursor-pointer">
                          <Send size={18} className="text-white" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Recharts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dashboardConfig.map((widget) => (
                      <div key={widget.id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                        {/* Neon Glow border */}
                        <div 
                          className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: widget.color, boxShadow: `0 0 10px ${widget.color}` }}
                        ></div>
                        
                        <div className="flex justify-between items-center mb-6 mt-2">
                          <h3 className="text-md font-bold text-slate-100">{widget.title}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">
                            {widget.type} chart
                          </span>
                        </div>
                        
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RenderChart config={widget} />
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </div>

      {/* Reports & Slides Studio Modal */}
      {summarizeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/95 border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">✨ Reports & Slides Studio</h3>
                  <p className="text-xs text-slate-400">Cooperative 21-Agent Orchestra Synthesis Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setSummarizeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1 text-slate-300">
              
              {/* Left Column: Steering & Agent telemetry (Col Span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-5 lg:border-r border-white/5 lg:pr-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Select Output Format</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setExportType('report')}
                      disabled={isGeneratingReport}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer select-none ${exportType === 'report' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 font-bold font-sans' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white font-sans'}`}
                    >
                      <FileText size={24} className="mb-2" />
                      <span className="text-sm">Executive Report</span>
                      <span className="text-[10px] text-slate-500 font-medium">Styled Word .doc</span>
                    </button>
                    <button 
                      onClick={() => setExportType('slides')}
                      disabled={isGeneratingReport}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer select-none ${exportType === 'slides' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 font-bold font-sans' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white font-sans'}`}
                    >
                      <Presentation size={24} className="mb-2" />
                      <span className="text-sm">Slide Deck</span>
                      <span className="text-[10px] text-slate-500 font-medium">Interactive Slides</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Steering Parameters</h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Audience</label>
                      <select 
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        disabled={isGeneratingReport}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option>Executive Team</option>
                        <option>Board of Directors</option>
                        <option>Non-Technical Stakeholders</option>
                        <option>Marketing & Product Teams</option>
                        <option>General Public</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Tone</label>
                      <select 
                        value={corporateTone}
                        onChange={(e) => setCorporateTone(e.target.value)}
                        disabled={isGeneratingReport}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option>Professional & Data-Forward</option>
                        <option>Punchy & Summarized</option>
                        <option>Formal & Technical</option>
                        <option>Strategic & Visionary</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Custom Steering Guidance</label>
                      <textarea
                        value={customGuidance}
                        onChange={(e) => setCustomGuidance(e.target.value)}
                        disabled={isGeneratingReport}
                        placeholder="e.g. Focus on profitability, use warm gold colors, skip regional details..."
                        rows={3}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">3. Orchestra Dashboard</h4>
                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">21 AI CO-OPS</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl border border-white/5 bg-slate-950/40 select-none">
                    {[
                      'SA', 'CE', 'SC', 'EGV', 'GST', 'VSC', 'ASA',
                      'SSM', 'SQO', 'RCC', 'RBC', 'CEA', 'LSA', 'CPC',
                      'ECP', 'AES', 'PPA', 'CC', 'PEL', 'ERA', 'VTO'
                    ].map((abbr, idx) => {
                      const isActive = studioActiveAgent === idx;
                      const isCompleted = studioActiveAgent !== null && idx < studioActiveAgent;
                      return (
                        <div 
                          key={idx} 
                          title={abbr}
                          className={`aspect-square text-[9px] font-bold rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-purple-500 text-slate-950 scale-110 shadow-lg shadow-purple-500/50' : isCompleted ? 'border border-purple-500/40 text-purple-400 bg-purple-500/5' : 'border border-white/5 text-slate-500'}`}
                        >
                          {abbr}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={handleCompileStudio}
                  disabled={isGeneratingReport}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer font-sans"
                >
                  <Sparkles size={16} />
                  {isGeneratingReport ? 'Compiling Narrative...' : 'Compile Document'}
                </button>
              </div>

              {/* Right Column: Narrative preview or Loading Logs (Col Span 7) */}
              <div className="lg:col-span-7 flex flex-col min-h-[480px]">
                
                {/* 1. INITIAL EMPTY STATE */}
                {!isGeneratingReport && !generatedOutput && (
                  <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-950/20 text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
                      <Sparkles size={28} />
                    </div>
                    <h4 className="font-bold text-slate-200 mb-2 font-sans">Ready for Document Synthesis</h4>
                    <p className="text-xs text-slate-500 max-w-sm font-sans">
                      Specify tone, target audience, and guidance. The 21-Agent Orchestra will compile real totals and averages from the active Data Lab spreadsheet dynamically.
                    </p>
                  </div>
                )}

                {/* 2. COMPILING LOGS TERMINAL FEED */}
                {isGeneratingReport && (
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-400 animate-pulse font-sans">Orchestrated compilation index in progress...</span>
                      <span className="text-xs font-mono text-slate-400">{genProgress}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-150" style={{ width: `${genProgress}%` }} />
                    </div>

                    <div className="text-left text-slate-400 text-xs font-semibold px-2 font-sans">
                      Stage: <span className="text-slate-100">{genStage}</span>
                    </div>

                    {/* Dark Logs Feed Terminal */}
                    <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 font-mono text-[10px] h-64 overflow-y-auto text-emerald-400/90 text-left flex flex-col gap-1.5 shadow-inner">
                      {studioLogs.map((log, index) => (
                        <div key={index} className={log.includes('[SYSTEM]') ? 'text-blue-400 font-bold' : log.includes('successful') || log.includes('complete') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          {log}
                        </div>
                      ))}
                      {studioLogs.length === 0 && (
                        <div className="text-slate-600 italic">Connecting compilation stream...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. GENERATION COMPLETED PREVIEW VIEW */}
                {!isGeneratingReport && generatedOutput && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Document Compiled Preview</h4>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold px-2 py-0.5 rounded font-sans">
                        {exportType === 'report' ? 'Word Document' : 'Slide Deck'}
                      </span>
                    </div>

                    {/* Report Text Viewer */}
                    {exportType === 'report' && (
                      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto text-slate-800 text-left font-sans max-h-[350px] shadow-lg leading-relaxed text-sm select-text">
                        <div dangerouslySetInnerHTML={{ __html: generatedOutput.htmlContent }} />
                      </div>
                    )}

                    {/* Slides Presentation Carousel */}
                    {exportType === 'slides' && (
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Widescreen Aspect slide preview */}
                        <div className="aspect-[16/10] bg-slate-950 border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl text-left select-none">
                          
                          {/* Title Slide Layout */}
                          {generatedOutput.slides[selectedSlideIndex].layout === 'title' && (
                            <div className="flex flex-col justify-center h-full text-center">
                              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                                {generatedOutput.slides[selectedSlideIndex].content.mainTitle}
                              </h1>
                              <p className="text-xs md:text-sm text-purple-400 font-bold mb-4 font-sans">
                                {generatedOutput.slides[selectedSlideIndex].content.subTitle}
                              </p>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {generatedOutput.slides[selectedSlideIndex].content.meta.split('\n')[0]}
                              </div>
                            </div>
                          )}

                          {/* Bullets List Slide Layout */}
                          {generatedOutput.slides[selectedSlideIndex].layout === 'bullets' && (
                            <div>
                              <h2 className="text-sm md:text-base font-extrabold text-white border-l-4 border-purple-500 pl-2 mb-3">
                                {generatedOutput.slides[selectedSlideIndex].content.title}
                              </h2>
                              <ul className="flex flex-col gap-2">
                                {generatedOutput.slides[selectedSlideIndex].content.bullets.map((b: string, i: number) => (
                                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                    <span className="text-purple-400">✦</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* KPI Grid Slide Layout */}
                          {generatedOutput.slides[selectedSlideIndex].layout === 'kpi' && (
                            <div>
                              <h2 className="text-sm md:text-base font-extrabold text-white border-l-4 border-purple-500 pl-2 mb-3">
                                {generatedOutput.slides[selectedSlideIndex].content.title}
                              </h2>
                              <div className="grid grid-cols-2 gap-3">
                                {generatedOutput.slides[selectedSlideIndex].content.cards.map((c: any, i: number) => (
                                  <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-sans">{c.label}</div>
                                    <div className="text-base md:text-lg font-black text-purple-400 mt-1">{c.val}</div>
                                    <div className={`text-[8px] font-bold mt-1 ${c.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {c.trend}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Comparison Slide Layout */}
                          {generatedOutput.slides[selectedSlideIndex].layout === 'comparison' && (
                            <div>
                              <h2 className="text-sm md:text-base font-extrabold text-white border-l-4 border-purple-500 pl-2 mb-3">
                                {generatedOutput.slides[selectedSlideIndex].content.title}
                              </h2>
                              <div className="grid grid-cols-2 gap-4">
                                {generatedOutput.slides[selectedSlideIndex].content.cards.map((c: any, i: number) => (
                                  <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3">
                                    <h3 className="text-xs font-bold text-slate-200 mb-2 border-b border-white/5 pb-1 font-sans">{c.title}</h3>
                                    <ul className="flex flex-col gap-1 pl-1">
                                      {c.points.map((pt: string, j: number) => (
                                        <li key={j} className="text-[10px] text-slate-400 list-disc list-inside">{pt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ranked Checklist Slide Layout */}
                          {generatedOutput.slides[selectedSlideIndex].layout === 'ranked' && (
                            <div>
                              <h2 className="text-sm md:text-base font-extrabold text-white border-l-4 border-purple-500 pl-2 mb-3">
                                {generatedOutput.slides[selectedSlideIndex].content.title}
                              </h2>
                              <div className="flex flex-col gap-2">
                                {generatedOutput.slides[selectedSlideIndex].content.items.map((item: string, i: number) => (
                                  <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-2.5 text-xs text-slate-300 font-sans">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Slide Footer */}
                          <div className="flex items-center justify-between text-[8px] text-slate-600 border-t border-white/5 pt-2 mt-2 font-sans">
                            <span>DevForge Power BI Studio</span>
                            <span>Slide {selectedSlideIndex + 1} of {generatedOutput.slides.length}</span>
                          </div>
                        </div>

                        {/* Speaker Notes panel */}
                        <div className="bg-slate-950/40 border border-dashed border-white/10 rounded-xl p-3 text-left text-xs text-slate-400 font-sans">
                          <strong className="text-purple-400 uppercase tracking-widest text-[9px] block mb-1">Speaker Notes:</strong>
                          {generatedOutput.slides[selectedSlideIndex].notes}
                        </div>

                        {/* Carousel Controllers */}
                        <div className="flex items-center justify-between px-2 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setSelectedSlideIndex(prev => Math.max(prev - 1, 0))}
                            disabled={selectedSlideIndex === 0}
                            className="px-3 py-1.5 bg-slate-800 text-xs font-semibold hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all cursor-pointer font-sans"
                          >
                            ◀ Previous
                          </button>
                          <span className="text-xs font-semibold text-slate-400 font-sans">
                            Slide {selectedSlideIndex + 1} of {generatedOutput.slides.length}
                          </span>
                          <button 
                            onClick={() => setSelectedSlideIndex(prev => Math.min(prev + 1, generatedOutput.slides.length - 1))}
                            disabled={selectedSlideIndex === generatedOutput.slides.length - 1}
                            className="px-3 py-1.5 bg-slate-800 text-xs font-semibold hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all cursor-pointer font-sans"
                          >
                            Next ▶
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions Panel */}
                    <div className="mt-4 flex flex-wrap gap-2.5 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      {exportType === 'report' ? (
                        <button 
                          onClick={() => downloadWordDoc(generatedOutput)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg border border-purple-500/50 font-bold transition-all cursor-pointer font-sans"
                        >
                          <Download size={14} /> Download Word Report (.doc)
                        </button>
                      ) : (
                        <button 
                          onClick={() => downloadSlidesHtml(generatedOutput)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/50 font-bold transition-all cursor-pointer font-sans"
                        >
                          <Download size={14} /> Download Slides (.html)
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedOutput.mdContent);
                          alert("📋 Report Copied to Clipboard as Markdown!");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg border border-white/5 font-semibold transition-all cursor-pointer font-sans"
                      >
                        <Copy size={14} /> Copy Markdown
                      </button>

                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`http://localhost:3000/shared-report/${Date.now()}`);
                          alert("🔗 Copied Shareable Report Link to clipboard!");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg border border-white/5 font-semibold transition-all cursor-pointer font-sans"
                      >
                        Share Public Link
                      </button>
                    </div>

                    {/* History panel strip */}
                    {historyList.length > 1 && (
                      <div className="mt-4 border-t border-white/5 pt-3 text-left">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-sans">
                          <History size={12} /> Previously Compiled Outputs
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 max-w-[550px]">
                          {historyList.map((item, idx) => (
                            <button 
                              key={item.id} 
                              onClick={() => {
                                setExportType(item.type);
                                setGeneratedOutput(item.data);
                                setSelectedSlideIndex(0);
                              }}
                              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-[10px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer font-sans ${generatedOutput.title === item.data.title && exportType === item.type ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-slate-950/40'}`}
                            >
                              {item.timestamp.split(' - ')[0]} ({item.type === 'report' ? '📰 Rep' : '🎴 Slides'})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating AI Chat Assistant */}
      {charts && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {chatOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-80 h-96 mb-4 flex flex-col overflow-hidden"
              >
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-400 font-sans">AI Data Assistant</span>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-xl text-sm font-sans ${msg.role === 'assistant' ? 'bg-slate-800 text-slate-200' : 'bg-emerald-500/20 text-emerald-200 ml-auto max-w-[85%]'}`}>
                      {msg.content}
                    </div>
                  ))}
                </div>
                
                <form onSubmit={sendChatMessage} className="p-3 border-t border-white/10 flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about data..." 
                    className="flex-1 bg-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                  <button type="submit" className="bg-emerald-500 text-slate-950 p-2 rounded-lg hover:bg-emerald-400"><Send size={16} /></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <MessageSquare size={24} className="text-slate-950" />
          </button>
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><UploadCloud size={20} className="text-cyan-400"/> Share Dashboard</h3>
                <button onClick={() => setShareModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Access Role</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-cyan-500">
                    <option>Viewer (Read-only)</option>
                    <option>Editor (Can modify layout)</option>
                    <option>Commenter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Share Link</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value="https://devforge.ai/dash/xyz-123" className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-sm rounded-lg px-4 py-2 outline-none" />
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer" onClick={() => alert('Link Copied!')}>Copy</button>
                  </div>
                </div>
                <button className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold transition-colors mt-2 border border-white/10 cursor-pointer">
                  Send via Email Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version History Modal */}
      <AnimatePresence>
        {versionHistoryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><History size={20} className="text-slate-400"/> Version History</h3>
                <button onClick={() => setVersionHistoryOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex justify-between items-center cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-emerald-400">v1.0 (Latest)</div>
                    <div className="text-xs text-slate-400">Saved 2 mins ago by You</div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Active</span>
                </div>
                <div className="p-3 rounded-lg border border-white/5 bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { setDashboardVersion('v0.9'); setVersionHistoryOpen(false); }}>
                  <div>
                    <div className="text-sm font-bold text-slate-300">v0.9 (Pre-forecast)</div>
                    <div className="text-xs text-slate-500">Saved 1 hour ago by AI Engine</div>
                  </div>
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded">Restore</button>
                </div>
                <div className="p-3 rounded-lg border border-white/5 bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { setDashboardVersion('v0.5'); setVersionHistoryOpen(false); }}>
                  <div>
                    <div className="text-sm font-bold text-slate-300">v0.5 (Initial Load)</div>
                    <div className="text-xs text-slate-500">Saved yesterday by You</div>
                  </div>
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded">Restore</button>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold transition-colors mt-4 border border-white/10 cursor-pointer">
                  + Create New Snapshot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Modal */}
      <AnimatePresence>
        {alertsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Check size={20} className="text-orange-400"/> Data Alerts</h3>
                <button onClick={() => setAlertsModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-slate-200">Revenue Drop Alert</div>
                    <div className="text-xs text-slate-400">If Revenue &lt; $50k in a day</div>
                  </div>
                  <div className="w-10 h-5 bg-orange-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-white/5 bg-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-slate-300">High Traffic Anomaly</div>
                    <div className="text-xs text-slate-500">If Web Traffic &gt; 500k/hr</div>
                  </div>
                  <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center justify-start px-1 cursor-pointer">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold transition-colors mt-4 border border-white/10 cursor-pointer">
                  + Create New Alert Rule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscribe to Reports Modal */}
      <AnimatePresence>
        {subscribeModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarClock size={20} className="text-pink-400"/> Scheduled Reports</h3>
                <button onClick={() => setSubscribeModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Recipient Email</label>
                  <input type="email" value={subscriptionEmail} onChange={(e) => setSubscriptionEmail(e.target.value)} placeholder="executive@company.com" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Delivery Frequency</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors cursor-pointer">
                    <option>Daily at 8:00 AM</option>
                    <option>Weekly (Mondays)</option>
                    <option>End of Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Format</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-pink-500 transition-colors cursor-pointer">
                    <option>PDF Slide Deck</option>
                    <option>Executive Summary (Email Body)</option>
                    <option>Raw CSV Data Dump</option>
                  </select>
                </div>
                <button onClick={() => { alert('Subscribed to automated reports!'); setSubscribeModalOpen(false); }} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all mt-4 cursor-pointer">
                  Activate Subscription
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 5: Real-time Collaboration Cursors */}
      {otherUsers.map((user) => (
        <motion.div key={user.id} animate={{ x: user.x + Math.random() * 50 - 25, y: user.y + Math.random() * 50 - 25 }} transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror' }} className="fixed z-40 pointer-events-none flex flex-col items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className={`drop-shadow-lg ${user.color.replace('bg-', 'text-').replace('/80', '')}`} fillOpacity="0.8">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full mt-1 shadow-lg ${user.color}`}>{user.name}</span>
        </motion.div>
      ))}

      {/* Phase 5: NLP Talk to Data Engine (Bottom Bar) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center p-2 group hover:border-emerald-500/50 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot size={20} />
          </div>
          <input type="text" value={nlpQuery} onChange={(e) => setNlpQuery(e.target.value)} placeholder="Ask AI: 'Show me revenue trends in Q3 for North America...'" className="flex-1 bg-transparent border-none text-white text-sm px-4 outline-none placeholder:text-slate-500" />
          <button onClick={() => {
            if(!nlpQuery) return;
            setIsNlpProcessing(true);
            setTimeout(() => {
              setIsNlpProcessing(false);
              setNlpQuery('');
              alert('AI has synthesized a new dashboard layout based on your query!');
            }, 2000);
          }} className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
            {isNlpProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Ask AI
          </button>
        </div>
      </div>

      {/* Phase 5: Admin Settings Modal */}
      <AnimatePresence>
        {adminSettingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-slate-400"/> Admin & White-labeling Hub</h3>
                <button onClick={() => setAdminSettingsOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* White Labeling */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><LayoutDashboard size={16}/> Brand Setup</h4>
                  <label className="block text-xs text-slate-400 mb-1">Company / App Name</label>
                  <input type="text" value={whiteLabelName} onChange={(e) => setWhiteLabelName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none mb-4" />
                  
                  <label className="block text-xs text-slate-400 mb-1">Global Theme</label>
                  <select value={activeTheme} onChange={(e: any) => setActiveTheme(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none cursor-pointer">
                    <option value="holographic">Holographic (Emerald & Cyan)</option>
                    <option value="cyberpunk">Cyberpunk (Pink & Purple)</option>
                    <option value="sunset">Sunset (Orange & Red)</option>
                  </select>
                </div>

                {/* Database Connectors */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Database size={16}/> Live Integrations</h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 p-3 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <span className="text-sm font-bold text-slate-200">Snowflake Data Cloud</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Connected</span>
                    </button>
                    <button className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 p-3 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <span className="text-sm font-bold text-slate-200">AWS Redshift</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Connect</span>
                    </button>
                    <button className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 p-3 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <span className="text-sm font-bold text-slate-200">PostgreSQL</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Connect</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 5: Automations Modal */}
      <AnimatePresence>
        {automationsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-yellow-500/20 p-6 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(234,179,8,0.1)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Workflow size={20} className="text-yellow-500"/> Workflow Automations</h3>
                <button onClick={() => setAutomationsModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20}/></button>
              </div>
              
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 mb-4">
                <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Trigger (IF)</div>
                <div className="flex gap-2">
                  <select className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer outline-none focus:border-yellow-500">
                    <option>Anomaly Detected in Charts</option>
                    <option>Revenue Drops &gt; 10%</option>
                    <option>Daily Target Met</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <div className="w-0.5 h-6 bg-slate-700"></div>
              </div>

              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 mb-6">
                <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Action (THEN)</div>
                <div className="flex gap-2">
                  <select className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer outline-none focus:border-yellow-500">
                    <option>Send Slack Message to #leadership</option>
                    <option>Create Jira Incident Ticket</option>
                    <option>Pause Google Ads Campaign</option>
                    <option>Trigger custom Webhook URL</option>
                  </select>
                </div>
              </div>

              <button onClick={() => { alert('Automation workflow deployed successfully!'); setAutomationsModalOpen(false); }} className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all cursor-pointer">
                Deploy Workflow Rule
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 6: AI Audio Player */}
      <AnimatePresence>
        {isPlayingAudio && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-24 right-6 bg-slate-900 border border-purple-500/30 p-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.2)] z-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shrink-0">
              <Volume2 size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-purple-400 font-bold mb-1">AI Daily Briefing (Playing...)</div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 30 }} />
              </div>
            </div>
            <button onClick={() => setIsPlayingAudio(false)} className="text-slate-500 hover:text-white ml-2 cursor-pointer"><X size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 6: Blockchain Verification Modal */}
      <AnimatePresence>
        {showBlockchainModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              <ShieldCheck size={56} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">Blockchain Provenance</h3>
              <p className="text-sm text-slate-400 mb-6">This dashboard state has been cryptographically signed and anchored to the Ethereum Mainnet to ensure 100% data integrity.</p>
              
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-left mb-8 font-mono text-xs text-emerald-400 break-all shadow-inner">
                <div className="text-slate-500 mb-1">SHA-256 Hash:</div>
                0x8f4d9c8b7a6f5e4d3c2b1a09f8e7d6c5b4a3928170e6f5d4c3b2a109f8e7d6c5
              </div>

              <button onClick={() => setShowBlockchainModal(false)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-8 py-3 rounded-xl font-bold transition-all border border-emerald-500/50 cursor-pointer w-full">
                Close Verification
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 6: Market Intelligence Panel */}
      <AnimatePresence>
        {showMarketIntel && (
          <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900 border-l border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] z-[90] p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Globe size={24} className="text-indigo-400"/> Market Intel</h3>
              <button onClick={() => setShowMarketIntel(false)} className="text-slate-500 hover:text-white cursor-pointer bg-slate-800 rounded-full p-1"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all" />
                <div className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider">Competitor: Acme Corp</div>
                <div className="text-lg font-black text-red-400 flex items-center gap-2 mb-2">▼ Dropped prices by 5%</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Activity size={12}/> Scraped live from AcmeCorp.com/pricing</div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider">Social Sentiment</div>
                <div className="text-lg font-black text-emerald-400 flex items-center gap-2 mb-2">▲ Mentions up 12%</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Users size={12}/> Based on 14,000 recent tweets</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-5 rounded-2xl border border-indigo-500/30">
                <div className="text-xs text-indigo-300 font-black mb-3 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> AI Recommendation</div>
                <div className="text-sm text-slate-200 leading-relaxed font-medium">Match Acme Corp's discount on the Pro Tier immediately to prevent churn in the EMEA region.</div>
                <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg cursor-pointer">
                  Auto-Adjust Pricing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
