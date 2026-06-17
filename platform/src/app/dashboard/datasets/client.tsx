'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import { Database, FileText, Settings, Play, BrainCircuit, Activity, X, Trash2, Save, Tag, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function DatasetsClientPage({ initialDatasets }: { initialDatasets: any[] }) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [settingsDataset, setSettingsDataset] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '', visibility: 'private' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeletingDataset, setIsDeletingDataset] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const router = useRouter();

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      const { processDataset } = await import('@/app/actions/data-management');
      await processDataset(id);
      setDatasets(prev => prev.map(d => d.id === id ? { ...d, status: 'ready' } : d));
    } catch (error) {
      console.error('Failed to process', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAnalyze = (id: string) => {
    router.push('/lab');
  };

  const openSettings = (dataset: any) => {
    setSettingsDataset(dataset);
    setEditForm({
      name: dataset.name || '',
      description: dataset.description || '',
      category: dataset.category || '',
      visibility: dataset.visibility || 'private'
    });
    setDeleteConfirmText('');
    setIsDeletingDataset(false);
  };

  const handleSaveSettings = async () => {
    if (!settingsDataset) return;
    setIsSavingSettings(true);
    try {
      const { updateDataset } = await import('@/app/actions/data-management');
      await updateDataset(settingsDataset.id, editForm);
      setDatasets(prev => prev.map(d => d.id === settingsDataset.id ? { ...d, ...editForm } : d));
      setSettingsDataset(null);
    } catch (error) {
      console.error('Failed to save', error);
      alert('Failed to save changes.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteDataset = async () => {
    if (!settingsDataset || deleteConfirmText !== 'DELETE') return;
    setIsSavingSettings(true);
    try {
      const { deleteDataset } = await import('@/app/actions/data-management');
      await deleteDataset(settingsDataset.id);
      setDatasets(prev => prev.filter(d => d.id !== settingsDataset.id));
      setSettingsDataset(null);
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete dataset.');
    } finally {
      setIsSavingSettings(false);
    }
  };
  
  if (initialDatasets.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
        <Database className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">No Datasets Found</h3>
        <p className="text-slate-400 mt-2 mb-6">Upload a file or connect a URL to get started.</p>
        <button onClick={() => router.push('/dashboard/datasets/upload')} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer">
          Upload Dataset
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map(dataset => (
          <GlassCard key={dataset.id} className="p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all border border-slate-800/50">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    {dataset.sourceType === 'link' ? <Activity className="w-6 h-6 text-indigo-400" /> : <FileText className="w-6 h-6 text-indigo-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg truncate w-[180px] text-white" title={dataset.name}>{dataset.name}</h3>
                    <span className="text-xs text-slate-500 uppercase">{dataset.category || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                {dataset.description || 'No description provided.'}
              </p>

              <div className="space-y-2 mb-6 text-sm bg-slate-950/50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="font-mono text-xs text-slate-300">{dataset.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={
                    dataset.status === 'ready' ? 'text-emerald-400 font-bold' : 
                    dataset.status === 'processing' ? 'text-amber-400 font-bold' : 
                    'text-slate-400'
                  }>
                    {dataset.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Files</span>
                  <span className="font-mono text-xs text-slate-300">{dataset.files?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleAnalyze(dataset.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4" /> Analyze
              </button>
              <button 
                onClick={() => handleProcess(dataset.id)}
                disabled={processingId === dataset.id || dataset.status === 'ready'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dataset.status === 'ready' 
                    ? 'bg-emerald-500/10 text-emerald-400 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
                }`}
              >
                <Play className="w-4 h-4" /> 
                {processingId === dataset.id ? 'Processing...' : dataset.status === 'ready' ? 'Processed' : 'Process'}
              </button>
              <button 
                onClick={() => openSettings(dataset)}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors text-slate-400 hover:text-white"
                title="Dataset Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ━━━ DATASET SETTINGS MODAL ━━━ */}
      {settingsDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSettingsDataset(null)}>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dataset Settings</h3>
                  <p className="text-xs text-slate-500">Manage metadata and configuration</p>
                </div>
              </div>
              <button onClick={() => setSettingsDataset(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Dataset Name</label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Describe what this dataset contains..."
                />
              </div>

              {/* Category & Visibility */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Uncategorized</option>
                    <option value="finance">Finance</option>
                    <option value="hr">Human Resources</option>
                    <option value="tech">Technical Docs</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Visibility</label>
                  <select 
                    value={editForm.visibility} 
                    onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="private">Private (Admin Only)</option>
                    <option value="workspace">Workspace Shared</option>
                    <option value="public">Publicly Available</option>
                  </select>
                </div>
              </div>

              {/* Dataset Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID</span>
                  <span className="font-mono text-xs text-slate-400">{settingsDataset.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={settingsDataset.status === 'ready' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {settingsDataset.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="text-slate-300">{settingsDataset.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-300 text-xs">{new Date(settingsDataset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <Trash2 size={14} /> Danger Zone
                </h4>
                {!isDeletingDataset ? (
                  <button 
                    onClick={() => setIsDeletingDataset(true)}
                    className="text-red-400 text-sm hover:text-red-300 transition-colors underline"
                  >
                    Delete this dataset permanently...
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-red-300">Type <strong>DELETE</strong> to confirm permanent removal of this dataset and all its files.</p>
                    <input 
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full bg-slate-950 border border-red-500/30 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setIsDeletingDataset(false); setDeleteConfirmText(''); }}
                        className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeleteDataset}
                        disabled={deleteConfirmText !== 'DELETE' || isSavingSettings}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSavingSettings && <Loader2 size={14} className="animate-spin" />}
                        Delete Forever
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
              <button 
                onClick={() => setSettingsDataset(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingSettings && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
