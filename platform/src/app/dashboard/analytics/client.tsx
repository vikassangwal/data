'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Eye, Clock,
  BarChart3, PieChart as PieChartIcon, Activity, Globe, Database,
  ArrowUpRight, ArrowDownRight, Zap, RefreshCcw, Target,
  AreaChart as AreaChartIcon, LineChart as LineChartIcon
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  getDashboardKPIs,
  getRevenueTimeSeries,
  getTrafficSources,
  getUserGrowthData,
  getTopPages,
  getConversionFunnel,
  getGeographicData,
  getLiveActivityFeed,
} from '@/app/actions/analytics-dashboard';

// ─── Custom Tooltip ───
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-xs font-bold text-slate-300 mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-bold text-white">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsClient() {
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [kRes, rRes, tRes, uRes, pRes, fRes, gRes, aRes] = await Promise.all([
      getDashboardKPIs(),
      getRevenueTimeSeries(),
      getTrafficSources(),
      getUserGrowthData(),
      getTopPages(),
      getConversionFunnel(),
      getGeographicData(),
      getLiveActivityFeed(),
    ]);
    if (kRes.success) setKpis(kRes.kpis);
    if (rRes.success) setRevenueData(rRes.data);
    if (tRes.success) setTrafficSources(tRes.sources);
    if (uRes.success) setUserGrowth(uRes.data);
    if (pRes.success) setTopPages(pRes.pages);
    if (fRes.success) setFunnel(fRes.funnel);
    if (gRes.success) setGeoData(gRes.countries);
    if (aRes.success && aRes.activities) setActivityFeed(aRes.activities);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Datasets',
      value: (kpis?.datasets || 0).toLocaleString(),
      change: '+12.5%',
      positive: true,
      icon: <Database size={18} />,
      gradient: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Active Integrations',
      value: (kpis?.integrations || 0).toLocaleString(),
      change: '+8.3%',
      positive: true,
      icon: <Globe size={18} />,
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Files Processed',
      value: (kpis?.files || 0).toLocaleString(),
      change: '+14.2%',
      positive: true,
      icon: <Target size={18} />,
      gradient: 'from-violet-600 to-purple-600',
      shadow: 'shadow-violet-500/20',
    },
    {
      label: 'Avg Processing Time',
      value: `${kpis?.processingTime || '0s'}`,
      change: '-2.4%',
      positive: true,
      icon: <Zap size={18} />,
      gradient: 'from-amber-600 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Database size={20} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Data Intelligence</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">Real-time dataset metrics, API usage, and pipeline health.</p>
        </div>
        <button
          onClick={loadAll}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 overflow-hidden group hover:border-slate-700 transition-all"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.gradient} opacity-5 rounded-bl-[60px] group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-lg`}>
                {kpi.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            <div className="text-2xl font-extrabold tracking-tight mb-0.5">{kpi.value}</div>
            <div className="text-xs text-slate-500 font-medium">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══ REVENUE CHART + TRAFFIC SOURCES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Activity size={18} className="text-emerald-400" /> Processing Volume</h2>
              <p className="text-xs text-slate-500 mt-0.5">Files processed, vectorized chunks, and failures over time</p>
            </div>
            <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {[
                { type: 'area' as const, icon: <AreaChartIcon size={13} /> },
                { type: 'line' as const, icon: <LineChartIcon size={13} /> },
                { type: 'bar' as const, icon: <BarChart3 size={13} /> },
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-1.5 rounded text-xs cursor-pointer transition-all ${
                    chartType === type ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="revenue" name="Files Processed" stroke="#10b981" fill="url(#gradRevenue)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="profit" name="Vectorized Chunks" stroke="#6366f1" fill="url(#gradProfit)" strokeWidth={2} />
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="revenue" name="Files Processed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="expenses" name="Failures" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="profit" name="Vectorized Chunks" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                </LineChart>
              ) : (
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="revenue" name="Files Processed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Failures" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Traffic Sources (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><PieChartIcon size={18} className="text-amber-400" /> Data Sources</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {trafficSources.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: any) => [`${value}%`, '']) as any}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 11 }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {trafficSources.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-400">{s.icon} {s.name}</span>
                </div>
                <span className="font-bold text-slate-200">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ USER GROWTH + CONVERSION FUNNEL ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-1"><Target size={18} className="text-blue-400" /> API Queries</h2>
          <p className="text-xs text-slate-500 mb-5">Weekly read queries vs write operations</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="newUsers" name="Read Queries" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="returningUsers" name="Write Ops" stackId="a" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-1"><Target size={18} className="text-violet-400" /> Pipeline Status</h2>
          <p className="text-xs text-slate-500 mb-5">Dataset processing from ingestion to ready state</p>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const widthPercent = Math.max(15, stage.percentage * 1.0);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{stage.value.toLocaleString()}</span>
                      <span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-7 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: stage.color }}
                    >
                      <span className="text-[10px] font-bold text-white/80">{stage.percentage}%</span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══ TOP PAGES + GEO + LIVE FEED ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 overflow-hidden"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-5"><Database size={18} className="text-cyan-400" /> Top Datasets</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {topPages.map((page, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-200">{page.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{page.path}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{page.views.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">files · status: {page.bounceRate === 100 ? 'ready' : 'pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 overflow-hidden"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-5"><PieChartIcon size={18} className="text-emerald-400" /> Data Categories</h2>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {geoData.map((country, i) => {
              const maxUsers = geoData[0]?.users || 1;
              const barWidth = (country.users / maxUsers) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-slate-300">{country.country}</span>
                    </span>
                    <span className="font-bold text-slate-200">{country.users.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 overflow-hidden"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
            <Activity size={18} className="text-rose-400" />
            Live Feed
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live
            </span>
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {activityFeed.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.06 }}
                className="flex items-start gap-3 py-2 border-b border-slate-800/20 last:border-0"
              >
                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={12} className="text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-200">
                    <span className="font-bold">{event.user}</span>{' '}
                    <span className="text-slate-400">{event.action}</span>
                  </div>
                  {event.resource && (
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{event.module} · {event.resource}</div>
                  )}
                  <div className="text-[9px] text-slate-600 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
