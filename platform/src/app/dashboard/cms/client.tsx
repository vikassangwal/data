'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Database, Plus, Search, Filter, MoreVertical,
  Check, X, FileEdit, Trash2, Settings, Type, Image,
  Hash, Calendar, ToggleLeft, Activity, LayoutTemplate, Link2
} from 'lucide-react';
import { getContentModels, getContentEntries, createContentModel, toggleEntryStatus } from '@/app/actions/cms';

export default function CMSClient() {
  const [models, setModels] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<any | null>(null);
  
  // Modal states
  const [isNewModelOpen, setIsNewModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelApiId, setNewModelApiId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => { loadModels(); }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadModels() {
    setLoading(true);
    const res = await getContentModels();
    if (res.success && res.models) {
      setModels(res.models);
      if (res.models.length > 0) {
        selectModel(res.models[0]);
      }
    }
    setLoading(false);
  }

  async function selectModel(model: any) {
    setActiveModel(model);
    setLoading(true);
    const res = await getContentEntries(model.id);
    if (res.success) setEntries(res.entries || []);
    setLoading(false);
  }

  async function handleCreateModel(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await createContentModel(newModelName, newModelApiId);
    if (res.success && res.model) {
      setModels([...models, res.model]);
      setToast({ message: res.message || 'Created!', type: 'success' });
      setIsNewModelOpen(false);
      setNewModelName('');
      setNewModelApiId('');
      selectModel(res.model);
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(false);
  }

  async function handleToggleEntry(id: string, currentStatus: string) {
    const res = await toggleEntryStatus(id, currentStatus);
    if (res.success) {
      setEntries(entries.map(e => e.id === id ? { ...e, status: res.newStatus } : e));
    }
  }

  if (loading && !activeModel) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
      <div className="h-20 border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Database size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Content Studio (CMS)</h1>
          </div>
          <p className="text-slate-400 text-xs ml-[52px]">Manage structured content and APIs.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Content Models */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-800/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Models</h2>
            <button onClick={() => setIsNewModelOpen(true)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => selectModel(model)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                  activeModel?.id === model.id ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                <span className="flex items-center gap-2 text-sm truncate">
                  <LayoutTemplate size={14} className={activeModel?.id === model.id ? 'text-blue-400' : 'text-slate-500'} />
                  <span className="truncate">{model.name}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeModel?.id === model.id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                  {model.itemsCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN AREA: Entries / Builder */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          {activeModel ? (
            <>
              {/* Toolbar */}
              <div className="h-16 border-b border-slate-800/50 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold">{activeModel.name} Entries</h2>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    API ID: {activeModel.apiId}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Search entries..." className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-64" />
                  </div>
                  <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <Filter size={12} /> Filter
                  </button>
                  <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    <Plus size={14} /> New Entry
                  </button>
                </div>
              </div>

              {/* Entries Table */}
              <div className="flex-1 overflow-auto custom-scrollbar p-6">
                {loading ? (
                  <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                    <FileText size={40} className="text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-bold mb-1">No entries found</h3>
                    <p className="text-slate-500 text-sm mb-6">Start building your content by creating the first entry.</p>
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700">Create Entry</button>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider">
                          <th className="p-4 font-bold w-1/2">Title</th>
                          <th className="p-4 font-bold">Author</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold">Last Updated</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {entries.map((entry) => (
                          <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                            <td className="p-4 font-semibold text-slate-200">{entry.title}</td>
                            <td className="p-4 text-slate-400">{entry.author}</td>
                            <td className="p-4">
                              <button onClick={() => handleToggleEntry(entry.id, entry.status)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                                entry.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 
                                entry.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 
                                'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}>
                                {entry.status}
                              </button>
                            </td>
                            <td className="p-4 text-slate-400 text-xs">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><FileEdit size={14} /></button>
                                <button className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
</div>
                  </div>
                )}
              </div>

              {/* Schema Builder Sidebar (Collapsible) */}
              <div className="absolute top-0 bottom-0 right-0 w-80 bg-slate-900 border-l border-slate-800/50 flex flex-col shadow-2xl transform translate-x-full lg:translate-x-0 transition-transform">
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">Schema Builder</h3>
                    <p className="text-[10px] text-slate-500">Define fields for {activeModel.name}</p>
                  </div>
                  <button className="text-slate-400 hover:text-white"><Settings size={16} /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {[
                    { name: 'Title', type: 'String', icon: <Type size={12} />, required: true },
                    { name: 'Slug', type: 'UID', icon: <Link2 size={12} />, required: true },
                    { name: 'Cover Image', type: 'Media', icon: <Image size={12} />, required: false },
                    { name: 'Content', type: 'Rich Text', icon: <FileText size={12} />, required: true },
                    { name: 'Publish Date', type: 'Date', icon: <Calendar size={12} />, required: false },
                    { name: 'Is Featured', type: 'Boolean', icon: <ToggleLeft size={12} />, required: false },
                  ].map((field, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between cursor-move hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400">{field.icon}</div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{field.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{field.type}</div>
                        </div>
                      </div>
                      {field.required && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-bold">* Req</span>}
                    </div>
                  ))}
                  
                  <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Field
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">Select a model or create a new one.</div>
            </div>
          )}
        </div>
      </div>

      {/* NEW MODEL MODAL */}
      <AnimatePresence>
        {isNewModelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsNewModelOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Database size={20} className="text-blue-400" /> New Content Model</h3>
              <p className="text-xs text-slate-500 mb-5">Create a new structured data type.</p>
              
              <form onSubmit={handleCreateModel}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Display Name</label>
                    <input 
                      type="text" value={newModelName} 
                      onChange={(e) => {
                        setNewModelName(e.target.value);
                        setNewModelApiId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                      }}
                      placeholder="e.g. Blog Post" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">API ID</label>
                    <input 
                      type="text" value={newModelApiId} onChange={(e) => setNewModelApiId(e.target.value)}
                      placeholder="e.g. blog_post" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsNewModelOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={actionLoading || !newModelName} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Create Model</>}
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
