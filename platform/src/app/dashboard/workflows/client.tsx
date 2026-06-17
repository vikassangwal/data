'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow, Play, Pause, Plus, Settings, ChevronRight,
  MoreVertical, Clock, Activity, Zap, Database, Mail,
  MessageSquare, Check, X, Search, GitMerge, FileText,
  AlertCircle
} from 'lucide-react';
import { getWorkflows, toggleWorkflowStatus, getWorkflowExecutionLogs } from '@/app/actions/workflows';

type ViewMode = 'list' | 'builder';

interface Node {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}

export default function WorkflowsClient() {
  const [view, setView] = useState<ViewMode>('list');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Builder State
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await getWorkflows();
    if (res.success && res.workflows) setWorkflows(res.workflows);
    setLoading(false);
  }

  async function handleToggleStatus(e: React.MouseEvent, wf: any) {
    e.stopPropagation();
    setActionLoading(`toggle-${wf.id}`);
    const res = await toggleWorkflowStatus(wf.id, wf.status);
    if (res.success) {
      setWorkflows(workflows.map(w => w.id === wf.id ? { ...w, status: res.newStatus } : w));
    }
    setActionLoading(null);
  }

  async function openBuilder(wf: any) {
    setActiveWorkflow(wf);
    setView('builder');
    
    // Load logs for the sidebar
    const logRes = await getWorkflowExecutionLogs(wf.id);
    if (logRes.success && logRes.logs) setLogs(logRes.logs);

    // Mock nodes based on the workflow
    if (wf.id === 'wf-1') {
      setNodes([
        { id: 'n1', type: 'trigger', title: 'Salesforce', subtitle: 'New Lead Created', icon: <Database size={16} />, color: 'blue' },
        { id: 'n2', type: 'condition', title: 'Filter', subtitle: 'Lead Score > 50', icon: <GitMerge size={16} />, color: 'violet' },
        { id: 'n3', type: 'action', title: 'Email', subtitle: 'Send Welcome Series', icon: <Mail size={16} />, color: 'emerald' },
        { id: 'n4', type: 'action', title: 'Slack', subtitle: 'Notify Sales Team', icon: <MessageSquare size={16} />, color: 'amber' },
      ]);
    } else {
      setNodes([
        { id: 'n1', type: 'trigger', title: 'Schedule', subtitle: 'Every Day at 9AM', icon: <Clock size={16} />, color: 'blue' },
        { id: 'n2', type: 'action', title: 'Postgres', subtitle: 'Fetch Daily Metrics', icon: <Database size={16} />, color: 'emerald' },
        { id: 'n3', type: 'action', title: 'Email', subtitle: 'Send Daily Report', icon: <FileText size={16} />, color: 'violet' },
      ]);
    }
  }

  const getNodeColor = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
    return map[color] || map.blue;
  };

  const getIconBg = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-600',
      violet: 'bg-violet-600',
      amber: 'bg-amber-600',
    };
    return map[color] || map.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* ═══ TOP NAVIGATION ═══ */}
      <div className="h-20 border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 bg-slate-900/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Workflow size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Automation Studio</h1>
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
              {view === 'builder' ? (
                <>
                  <button onClick={() => setView('list')} className="hover:text-white transition-colors cursor-pointer">Workflows</button>
                  <ChevronRight size={10} />
                  <span className="text-violet-400">{activeWorkflow?.name}</span>
                </>
              ) : (
                'Manage and build enterprise workflows'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {view === 'builder' && (
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700">
              Save Changes
            </button>
          )}
          {view === 'list' && (
            <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-2 cursor-pointer">
              <Plus size={14} /> New Workflow
            </button>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 p-6 md:p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="relative w-full sm:w-96">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-400 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {workflows.filter(w => w.status === 'active').length} Active
                    </div>
                    <div className="w-px h-4 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      {workflows.filter(w => w.status === 'paused').length} Paused
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredWorkflows.map((wf) => (
                    <motion.div
                      key={wf.id}
                      layoutId={`wf-${wf.id}`}
                      onClick={() => openBuilder(wf)}
                      className="group bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                      {/* Gradient glow on hover */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                      
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className={`p-2.5 rounded-xl border ${wf.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                          <Zap size={20} className={wf.status === 'active' ? 'animate-pulse' : ''} />
                        </div>
                        <button
                          onClick={(e) => handleToggleStatus(e, wf)}
                          disabled={actionLoading === `toggle-${wf.id}`}
                          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          {actionLoading === `toggle-${wf.id}` ? (
                            <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                          ) : wf.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                      </div>

                      <h3 className="font-bold text-lg mb-1 relative z-10">{wf.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-6 flex-1 relative z-10">{wf.description}</p>

                      <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-800/50 relative z-10">
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Trigger</div>
                          <div className="text-xs font-semibold text-slate-200 truncate">{wf.trigger}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Success Rate</div>
                          <div className="text-xs font-bold text-emerald-400">{wf.successRate}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Runs Today</div>
                          <div className="text-xs font-semibold text-slate-200">{wf.runsToday}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Steps</div>
                          <div className="text-xs font-semibold text-slate-200">{wf.nodes} nodes</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* BUILDER VIEW */}
          {view === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 flex"
            >
              {/* Canvas Area (Mock drag & drop visual) */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden custom-scrollbar">
                {/* Dotted Grid Background */}
                <div 
                  className="absolute inset-0 opacity-[0.15]" 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
                />

                <div className="absolute inset-0 p-10 overflow-auto flex flex-col items-center">
                  <div className="max-w-2xl w-full flex flex-col items-center py-10">
                    {nodes.map((node, i) => (
                      <div key={node.id} className="relative flex flex-col items-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-80 bg-slate-900 border rounded-xl p-4 shadow-xl z-10 hover:border-white/50 transition-colors cursor-pointer group ${getNodeColor(node.color)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${getIconBg(node.color)} text-white`}>
                              {node.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-0.5">{node.type}</div>
                              <div className="text-sm font-bold text-white truncate">{node.title}</div>
                              <div className="text-xs opacity-70 truncate mt-0.5">{node.subtitle}</div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all"><MoreVertical size={16} /></button>
                          </div>
                        </motion.div>

                        {/* Connector Line */}
                        {i < nodes.length - 1 && (
                          <motion.div 
                            initial={{ height: 0 }} animate={{ height: 40 }} transition={{ delay: i * 0.1 + 0.1 }}
                            className="w-0.5 bg-slate-700 my-1 relative z-0"
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-600 hover:border-violet-500 transition-colors hover:scale-125 z-20">
                              <Plus size={10} className="text-white" />
                            </div>
                          </motion.div>
                        )}
                        
                        {/* End of flow add button */}
                        {i === nodes.length - 1 && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.3 }}
                            className="mt-6"
                          >
                            <button className="w-12 h-12 bg-slate-800 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500 hover:bg-violet-500/10 transition-all cursor-pointer">
                              <Plus size={20} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 left-6 z-20">
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 shadow-lg ${
                    activeWorkflow?.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${activeWorkflow?.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    {activeWorkflow?.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Sidebar (Details & Logs) */}
              <div className="w-80 bg-slate-900 border-l border-slate-800/50 flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                <div className="p-5 border-b border-slate-800/50">
                  <h3 className="font-bold text-sm mb-1">Properties</h3>
                  <p className="text-xs text-slate-400">Configure workflow settings.</p>
                </div>
                
                <div className="p-5 border-b border-slate-800/50 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Workflow Name</label>
                    <input 
                      type="text" 
                      value={activeWorkflow?.name || ''} 
                      readOnly 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Description</label>
                    <textarea 
                      value={activeWorkflow?.description || ''} 
                      readOnly 
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-violet-400" /> Execution History
                  </h3>
                  
                  {logs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">No logs yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                              log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {log.status === 'success' ? <Check size={10} /> : <AlertCircle size={10} />}
                              {log.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{log.duration}ms</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.error && (
                            <div className="mt-2 text-[10px] text-red-400 bg-red-500/5 p-2 rounded-lg border border-red-500/10 font-mono">
                              Error: {log.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
