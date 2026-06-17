'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, HardDrive, Activity, Database, Network, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js') as any, { ssr: false }) as React.ComponentType<any>;

export default function ServerMonitoring() {
  const [cpuData, setCpuData] = useState<number[]>(Array(20).fill(10));
  const [ramData, setRamData] = useState<number[]>(Array(20).fill(40));
  const [timeData, setTimeData] = useState<string[]>(Array(20).fill('00:00'));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Simulate live server metrics
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      const newCpu = Math.max(5, Math.min(100, cpuData[cpuData.length - 1] + (Math.random() - 0.5) * 20));
      const newRam = Math.max(20, Math.min(100, ramData[ramData.length - 1] + (Math.random() - 0.5) * 5));
      
      setCpuData(prev => [...prev.slice(1), newCpu]);
      setRamData(prev => [...prev.slice(1), newRam]);
      setTimeData(prev => [...prev.slice(1), time]);
    }, 2000);

    return () => clearInterval(interval);
  }, [cpuData, ramData]);

  if (!isClient) return null;

  const currentCpu = cpuData[cpuData.length - 1].toFixed(1);
  const currentRam = ramData[ramData.length - 1].toFixed(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Server className="text-emerald-400" size={32} />
              Enterprise Server Metrics
            </h1>
            <p className="text-slate-400 mt-2">Live monitoring for Next.js, FastAPI, Redis, and PostgreSQL containers.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm">All Systems Operational</span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl"><Cpu className="text-blue-400" /></div>
              <span className={`text-xl font-bold ${Number(currentCpu) > 80 ? 'text-red-400' : 'text-blue-400'}`}>{currentCpu}%</span>
            </div>
            <h3 className="text-slate-400 font-medium">CPU Utilization</h3>
            <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${currentCpu}%` }} />
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl"><HardDrive className="text-purple-400" /></div>
              <span className="text-xl font-bold text-purple-400">{currentRam}%</span>
            </div>
            <h3 className="text-slate-400 font-medium">Memory (RAM)</h3>
            <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full transition-all duration-500" style={{ width: `${currentRam}%` }} />
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl"><Database className="text-emerald-400" /></div>
              <span className="text-xl font-bold text-emerald-400">12ms</span>
            </div>
            <h3 className="text-slate-400 font-medium">PostgreSQL Latency</h3>
            <p className="text-xs text-emerald-500 mt-2">Active Connections: 42</p>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl"><Network className="text-cyan-400" /></div>
              <span className="text-xl font-bold text-cyan-400">850 req/s</span>
            </div>
            <h3 className="text-slate-400 font-medium">FastAPI Throughput</h3>
            <p className="text-xs text-cyan-500 mt-2">0% Error Rate</p>
          </motion.div>
        </div>

        {/* Live Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-400"/> CPU & Memory Load</h2>
            <div className="h-64">
              <Plot
                data={[
                  { x: timeData, y: cpuData, type: 'scatter', mode: 'lines', name: 'CPU %', line: { color: '#60a5fa', shape: 'spline' }, fill: 'tozeroy', fillcolor: 'rgba(96, 165, 250, 0.1)' },
                  { x: timeData, y: ramData, type: 'scatter', mode: 'lines', name: 'RAM %', line: { color: '#c084fc', shape: 'spline' } }
                ]}
                layout={{
                  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#94a3b8' },
                  margin: { t: 10, b: 30, l: 30, r: 10 },
                  xaxis: { gridcolor: '#1e293b', zeroline: false },
                  yaxis: { gridcolor: '#1e293b', range: [0, 100] },
                  legend: { orientation: 'h', y: 1.1 }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400"/> Docker Containers</h2>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="pb-3 font-medium">Container</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Port</th>
                    <th className="pb-3 font-medium">Uptime</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-mono text-blue-400">devforge-frontend-1</td>
                    <td className="py-4"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">Up</span></td>
                    <td className="py-4 font-mono text-slate-400">3000</td>
                    <td className="py-4 text-slate-400">2d 4h</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-mono text-cyan-400">devforge-backend-1</td>
                    <td className="py-4"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">Up</span></td>
                    <td className="py-4 font-mono text-slate-400">8000</td>
                    <td className="py-4 text-slate-400">2d 4h</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-mono text-emerald-400">devforge-db-1</td>
                    <td className="py-4"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">Up</span></td>
                    <td className="py-4 font-mono text-slate-400">5432</td>
                    <td className="py-4 text-slate-400">14d 12h</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-mono text-red-400">devforge-redis-1</td>
                    <td className="py-4"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">Up</span></td>
                    <td className="py-4 font-mono text-slate-400">6379</td>
                    <td className="py-4 text-slate-400">2d 4h</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
