'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Plus, Search, Filter, MoreVertical, Check, X,
  Edit3, Eye, Send, Trash2, LayoutTemplate, MousePointer2,
  PieChart, Tag
} from 'lucide-react';
import { getEmailTemplates, createEmailTemplate, sendTestEmail } from '@/app/actions/emails';

export default function EmailsClient() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  
  const [newParams, setNewParams] = useState({ name: '', subject: '', category: 'Marketing' });
  const [testEmail, setTestEmail] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadTemplates(); }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadTemplates() {
    setLoading(true);
    const res = await getEmailTemplates();
    if (res.success && res.templates) setTemplates(res.templates);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await createEmailTemplate(newParams.name, newParams.subject, newParams.category);
    if (res.success && res.template) {
      setTemplates([res.template, ...templates]);
      setToast({ message: res.message || 'Created!', type: 'success' });
      setIsNewOpen(false);
      setNewParams({ name: '', subject: '', category: 'Marketing' });
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(false);
  }

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await sendTestEmail(activeTemplate.id, testEmail);
    if (res.success) {
      setToast({ message: res.message || 'Sent!', type: 'success' });
      setIsTestOpen(false);
      setTestEmail('');
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(false);
  }

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
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
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Mail size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Email Library</h1>
          </div>
          <p className="text-slate-400 text-xs ml-[52px]">Design and manage email templates for campaigns and transactional flows.</p>
        </div>
        <button 
          onClick={() => setIsNewOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Template
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
                placeholder="Search templates by name or subject..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" 
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          {/* Grid View */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <LayoutTemplate size={48} className="text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-300 font-bold mb-2 text-lg">No templates found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Create your first email template to start engaging with your audience.</p>
              <button onClick={() => setIsNewOpen(true)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">Create Template</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div 
                  layoutId={`tpl-${template.id}`}
                  key={template.id} 
                  className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all group flex flex-col"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="h-32 bg-slate-800/50 flex items-center justify-center border-b border-slate-800/80 relative overflow-hidden">
                    <Mail size={32} className="text-slate-700 opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800">
                      <Tag size={10} /> {template.category}
                    </div>
                    {template.status === 'Active' && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-base mb-1 text-slate-200 line-clamp-1" title={template.name}>{template.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-4 italic">"{template.subject}"</p>

                    <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5"><Eye size={10} /> Open Rate</div>
                        <div className="text-sm font-bold text-emerald-400">{template.openRate}%</div>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5"><MousePointer2 size={10} /> Click Rate</div>
                        <div className="text-sm font-bold text-blue-400">{template.clickRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-950/50 p-2.5 border-t border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white py-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit3 size={12} /> Edit Design
                    </button>
                    <div className="w-px h-4 bg-slate-800 mx-1" />
                    <button 
                      onClick={() => { setActiveTemplate(template); setIsTestOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Send Test Email"
                    >
                      <Send size={14} />
                    </button>
                    <button className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEW TEMPLATE MODAL */}
      <AnimatePresence>
        {isNewOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsNewOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">New Template</h3>
                  <p className="text-xs text-slate-500">Create a new email design.</p>
                </div>
              </div>
              
              <form onSubmit={handleCreate}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Internal Name</label>
                    <input 
                      type="text" value={newParams.name} onChange={(e) => setNewParams({...newParams, name: e.target.value})}
                      placeholder="e.g. Password Reset v2" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Email Subject</label>
                    <input 
                      type="text" value={newParams.subject} onChange={(e) => setNewParams({...newParams, subject: e.target.value})}
                      placeholder="e.g. Action Required: Security Alert" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Category</label>
                    <select 
                      value={newParams.category} onChange={(e) => setNewParams({...newParams, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="Marketing">Marketing</option>
                      <option value="Transactional">Transactional</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                  <button type="button" onClick={() => setIsNewOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={actionLoading || !newParams.name || !newParams.subject} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Create Template</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEST EMAIL MODAL */}
      <AnimatePresence>
        {isTestOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => setIsTestOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-inner">
                  <Send size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Send Test Email</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{activeTemplate?.name}</p>
                </div>
              </div>
              
              <form onSubmit={handleSendTest}>
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Recipient Email</label>
                  <input 
                    type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                <button type="submit" disabled={actionLoading || !testEmail} className="w-full px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send Test</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
