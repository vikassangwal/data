'use client';

import { useState, useEffect } from 'react';
import { saveIntegration, getConnectedIntegrations } from '@/app/actions/integrations';
import { Plug, Plus, Save, Server, Calendar, CreditCard, Video, Table, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PREDEFINED_TOOLS = [
  { id: 'stripe', name: 'Stripe Payment', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'razorpay', name: 'Razorpay', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'google_sheets', name: 'Google Sheets', icon: Table, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'youtube', name: 'YouTube API', icon: Video, color: 'text-red-400', bg: 'bg-red-500/10' },
];

export default function IntegrationsClient() {
  const [connectedTools, setConnectedTools] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ apiKey: '', baseUrl: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [customToolName, setCustomToolName] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const res = await getConnectedIntegrations();
    if (res.keys) setConnectedTools(res.keys);
  };

  const handleSave = async (toolId: string) => {
    if (!formData.apiKey) return toast.error('API Key is required');
    
    setIsSaving(true);
    const finalToolId = toolId === 'custom' ? customToolName.replace(/\s+/g, '_').toLowerCase() : toolId;
    
    const res = await saveIntegration(finalToolId, formData.apiKey, formData.baseUrl);
    
    if (res.success) {
      toast.success(`${finalToolId.toUpperCase()} Integration Saved!`);
      setActiveForm(null);
      setFormData({ apiKey: '', baseUrl: '' });
      setCustomToolName('');
      loadConnections();
    } else {
      toast.error(res.error || 'Failed to save');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Universal API Integrations</h1>
        <p className="text-slate-400">Connect external tools instantly without writing code.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREDEFINED_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isConnected = connectedTools.includes(tool.id);
          const isEditing = activeForm === tool.id;

          return (
            <div key={tool.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${tool.bg} ${tool.color}`}>
                  <Icon size={24} />
                </div>
                {isConnected && !isEditing && (
                  <span className="text-xs font-bold uppercase px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                    Connected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3>
              <p className="text-sm text-slate-400 mb-6">Standard built-in integration.</p>

              {isEditing ? (
                <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                  <input
                    type="password"
                    placeholder="Enter API Key / Secret"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(tool.id)}
                      disabled={isSaving}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
                    </button>
                    <button
                      onClick={() => setActiveForm(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveForm(tool.id); setFormData({ apiKey: '', baseUrl: '' }); }}
                  className={`w-full py-2 rounded-lg text-sm font-bold border transition-colors ${
                    isConnected 
                      ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isConnected ? 'Update Key' : 'Connect'}
                </button>
              )}
            </div>
          );
        })}

        {/* Custom Integration Card */}
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          {activeForm === 'custom' ? (
            <div className="w-full space-y-3 animate-in fade-in zoom-in duration-200 text-left">
              <h3 className="text-white font-bold mb-2">Add Custom Tool</h3>
              <input
                type="text"
                placeholder="Tool Name (e.g. My Custom API)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                value={customToolName}
                onChange={(e) => setCustomToolName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Base URL (Optional)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              />
              <input
                type="password"
                placeholder="API Key / Token"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSave('custom')}
                  disabled={isSaving || !customToolName}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Tool'}
                </button>
                <button
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-slate-800 text-slate-400 mb-4">
                <Settings size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Integration</h3>
              <p className="text-sm text-slate-400 mb-6">Connect any third-party API dynamically.</p>
              <button
                onClick={() => { setActiveForm('custom'); setFormData({ apiKey: '', baseUrl: '' }); setCustomToolName(''); }}
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                <Plus size={16} /> Add Custom Tool
              </button>
            </>
          )}
        </div>

      </div>

      {/* Connected Custom Tools List */}
      {connectedTools.filter(t => !PREDEFINED_TOOLS.find(pt => pt.id === t)).length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Active Custom Integrations</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {connectedTools.filter(t => !PREDEFINED_TOOLS.find(pt => pt.id === t)).map(tool => (
              <div key={tool} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="text-slate-500" size={20} />
                  <span className="text-white font-medium capitalize">{tool.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-bold uppercase px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
