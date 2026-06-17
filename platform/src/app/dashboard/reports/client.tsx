'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, FileSpreadsheet, Plus, Search, Filter,
  MoreVertical, Check, X, Settings, Calendar, Clock, Play, Pause,
  Trash2, Mail, Database, FileDigit, BarChart2
} from 'lucide-react';
import { getReports, generateReport, toggleReportSchedule, deleteReport } from '@/app/actions/reports';

export default function ReportsClient() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isNewReportOpen, setIsNewModelOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('PDF');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadReports(); }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadReports() {
    setLoading(true);
    const res = await getReports();
    if (res.success && res.reports) {
      setReports(res.reports);
    }
    setLoading(false);
  }

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await generateReport(reportName, reportType, ['Analytics', 'Finance']);
    if (res.success && res.report) {
      setReports([res.report, ...reports]);
      setToast({ message: res.message || 'Generated!', type: 'success' });
      setIsNewModelOpen(false);
      setReportName('');
      setReportType('PDF');
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(false);
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const res = await toggleReportSchedule(id, currentStatus);
    if (res.success) {
      setReports(reports.map(r => r.id === id ? { ...r, status: res.newStatus } : r));
      setToast({ message: res.message, type: 'success' });
    }
  }

  async function handleDelete(id: string) {
    if(!confirm('Are you sure you want to delete this report?')) return;
    const res = await deleteReport(id);
    if (res.success) {
      setReports(reports.filter(r => r.id !== id));
      setToast({ message: res.message, type: 'success' });
    }
  }

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="text-red-400" />;
      case 'Excel': return <FileSpreadsheet className="text-emerald-400" />;
      case 'CSV': return <FileDigit className="text-blue-400" />;
      default: return <FileText className="text-slate-400" />;
    }
  };

  const filteredReports = reports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="h-20 border-b border-slate-800/50 flex items-center justify-between px-6 md:px-10 shrink-0 bg-slate-900/30 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <BarChart2 size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Report Studio</h1>
          </div>
          <p className="text-slate-400 text-xs ml-[52px]">Generate, schedule, and export beautiful data reports.</p>
        </div>
        <button 
          onClick={() => setIsNewModelOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Generate Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-colors" 
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                <Filter size={14} /> Filter
              </button>
              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                <Calendar size={14} /> Date Range
              </button>
            </div>
          </div>

          {/* Grid View */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <FileText size={48} className="text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-300 font-bold mb-2 text-lg">No reports generated</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">You haven't generated or scheduled any reports yet. Create your first report to start analyzing data.</p>
              <button onClick={() => setIsNewModelOpen(true)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">Generate Now</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredReports.map((report) => (
                <motion.div 
                  layoutId={`rep-${report.id}`}
                  key={report.id} 
                  className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all group flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 shadow-inner">
                        {getFileIcon(report.type)}
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        report.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        report.status === 'Generated' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {report.status}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-base mb-1 text-slate-200 line-clamp-1" title={report.name}>{report.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Clock size={12} />
                      <span>{report.schedule}</span>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Format:</span>
                        <span className="font-semibold text-slate-300">{report.type}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Generated:</span>
                        <span className="font-semibold text-slate-300">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Downloads:</span>
                        <span className="font-semibold text-slate-300">{report.downloads}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-950/50 p-3 border-t border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white py-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                      <Download size={14} /> Download
                    </button>
                    <div className="w-px h-4 bg-slate-800 mx-2" />
                    <button 
                      onClick={() => handleToggleStatus(report.id, report.status)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title={report.status === 'Active' ? 'Pause Schedule' : 'Activate Schedule'}
                    >
                      {report.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button onClick={() => handleDelete(report.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW REPORT MODAL */}
      <AnimatePresence>
        {isNewReportOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsNewModelOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Generate Report</h3>
                  <p className="text-xs text-slate-500">Configure data sources and output format.</p>
                </div>
              </div>
              
              <form onSubmit={handleGenerateReport} className="mt-6">
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Report Name</label>
                    <input 
                      type="text" value={reportName} onChange={(e) => setReportName(e.target.value)}
                      placeholder="e.g. Q3 Executive Summary" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Format</label>
                      <select 
                        value={reportType} onChange={(e) => setReportType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 appearance-none"
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="Excel">Excel Spreadsheet</option>
                        <option value="CSV">Raw CSV Data</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Schedule</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 appearance-none"
                        defaultValue="none"
                      >
                        <option value="none">Generate Now (One-time)</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Data Sources</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Analytics', 'Finance & Stripe', 'User Management', 'Security Logs'].map((src, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-600 transition-colors">
                          <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-slate-950" />
                          <span className="text-sm font-medium text-slate-300">{src}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                  <button type="button" onClick={() => setIsNewModelOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={actionLoading || !reportName} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Generate & Export</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
