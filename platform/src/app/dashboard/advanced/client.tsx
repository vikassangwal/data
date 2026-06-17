'use client';

import { useState, useEffect } from 'react';
import { Sliders, Key, Webhook, Trash2, ShieldAlert, Check, Copy, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedClient() {
  const [apiKey, setApiKey] = useState('sk_live_9a8b7c6d5e4f3g2h1i0j_xYz123');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // Danger Zone states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      setApiKey(`sk_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`);
      setIsRotating(false);
      setToast({ message: 'API Key rotated successfully. Old key is now invalid.', type: 'success' });
    }, 1500);
  };

  const handleDeleteWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      setToast({ message: 'Please type DELETE exactly to confirm.', type: 'error' });
      return;
    }
    
    setIsDeleting(true);
    // Simulate API call for deletion
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setDeleteConfirmText('');
    setToast({ message: 'Workspace deletion initiated. This may take a few minutes.', type: 'success' });
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6 md:p-10 text-white relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? <Check size={16} /> : <ShieldAlert size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Sliders size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Advanced Settings</h1>
            <p className="text-slate-400 text-sm">Developer APIs, Webhooks, and Danger Zone configurations.</p>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Key size={18} /></div>
            <h2 className="text-lg font-bold">API Access Keys</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Use this API key to authenticate your backend server with our platform.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <input 
                  type="text" 
                  value={apiKey} 
                  readOnly 
                  className="w-full bg-transparent p-3 text-sm font-mono text-slate-300 focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="p-3 text-slate-400 hover:text-white transition-colors border-l border-slate-800 bg-slate-900"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              <button 
                onClick={handleRotateKey}
                disabled={isRotating}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRotating ? 'animate-spin' : ''} />
                Rotate Key
              </button>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Webhook size={18} /></div>
            <h2 className="text-lg font-bold">Webhooks</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Receive real-time HTTP POST requests when events happen on your account.</p>
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm mb-1">Production Webhook</h3>
                <p className="text-xs text-slate-500 font-mono">https://api.yourdomain.com/webhook</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase rounded">Active</span>
                <button className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors">Edit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ShieldAlert size={18} /></div>
            <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-red-400/80">Irreversible and destructive actions. Proceed with extreme caution.</p>
            
            <div className="bg-slate-950 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm mb-1 text-white">Delete Workspace</h3>
                <p className="text-xs text-slate-500">Permanently delete this workspace and all its data.</p>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.1)] relative">
              <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                  <ShieldAlert size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Workspace?</h3>
                  <p className="text-xs text-red-400">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
                <p className="text-sm text-slate-300 mb-2">
                  You are about to permanently delete your workspace. All datasets, workflows, emails, and configurations will be completely erased.
                </p>
              </div>

              <form onSubmit={handleDeleteWorkspace}>
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                    Type <span className="text-white font-mono bg-slate-800 px-1 rounded">DELETE</span> to confirm
                  </label>
                  <input 
                    type="text" 
                    value={deleteConfirmText} 
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'} 
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={16} /> Confirm Delete</>}
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
