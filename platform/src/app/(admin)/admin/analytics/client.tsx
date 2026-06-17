'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Eye, Clock, 
  ArrowUpRight, ArrowDownRight, Activity, DollarSign
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const STATS_TEMPLATE = [
  { label: 'Page Views', key: 'totalViews', isPositive: true, icon: Eye },
  { label: 'Unique Visitors', key: 'uniqueVisitors', isPositive: true, icon: Users },
  { label: 'Bounce Rate', value: '34.2%', change: '-2.1%', isPositive: true, icon: Activity },
  { label: 'Revenue (MRR)', value: '$0', change: '+0%', isPositive: true, icon: DollarSign },
];

export default function AnalyticsClient({ initialData }: { initialData: any }) {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights and performance metrics for your platform.
          </p>
        </div>
        
        <div className="flex bg-background border border-border rounded-lg p-1">
          {['24h', '7d', '30d', '1y', 'All'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_TEMPLATE.map((stat, i) => {
          const Icon = stat.icon;
          const value = stat.key ? initialData[stat.key]?.toLocaleString() || '0' : stat.value;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change || '+0%'}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">{value}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big Chart Placeholder */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Traffic Analysis</h3>
              <p className="text-sm text-muted-foreground">Visitors vs Page Views over time</p>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-black/20 rounded-xl border border-white/5 relative flex items-end justify-between px-4 pt-12 pb-4 gap-2">
            {/* CSS Mock Chart */}
            {[40, 70, 45, 90, 65, 85, 100, 75, 50, 80, 60, 95].map((h, idx) => (
              <div key={idx} className="w-full flex justify-center group relative">
                <div 
                  className="w-full max-w-[2rem] bg-gradient-to-t from-primary/80 to-accent/80 rounded-t-sm transition-all duration-500 group-hover:opacity-100 opacity-70"
                  style={{ height: `${h}%` }}
                />
                <div className="absolute -bottom-8 text-[10px] text-muted-foreground">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Traffic Sources */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Traffic Sources</h3>
          <div className="space-y-6">
            {[
              { name: 'Direct Traffic', percent: 45, color: 'bg-primary' },
              { name: 'Organic Search', percent: 30, color: 'bg-accent' },
              { name: 'Social Media', percent: 15, color: 'bg-emerald-500' },
              { name: 'Referral', percent: 10, color: 'bg-amber-500' },
            ].map(source => (
              <div key={source.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{source.name}</span>
                  <span className="text-muted-foreground">{source.percent}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${source.color} rounded-full`}
                    style={{ width: `${source.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Top Pages</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground pb-2 border-b border-white/5">
                <span>Path</span>
                <span>Views</span>
              </div>
              {initialData.topPages.length > 0 ? (
                initialData.topPages.map((page: any) => (
                  <div key={page.path} className="flex justify-between items-center">
                    <span className="font-medium text-white truncate max-w-[200px]" title={page.path}>{page.path}</span>
                    <span className="text-emerald-400">{page.views.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">No data yet</div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
