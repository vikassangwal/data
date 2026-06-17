'use client';

import { useState, useEffect } from 'react';
import { getApiIntegrations, saveApiIntegration, deleteApiIntegration } from '@/app/actions/integrations';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Key, Link2 } from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ providerName: '', apiKey: '', baseUrl: '' });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    const res = await getApiIntegrations();
    if (res.success) {
      setIntegrations(res.integrations);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.providerName || !formData.apiKey) return;
    
    const res = await saveApiIntegration(formData);
    if (res.success) {
      setIsAdding(false);
      setFormData({ providerName: '', apiKey: '', baseUrl: '' });
      fetchIntegrations();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;
    const res = await deleteApiIntegration(id);
    if (res.success) {
      fetchIntegrations();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dynamic API Integration Hub</h1>
          <p className="text-muted-foreground mt-1">
            Connect external tools securely without coding.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} icon={<Plus className="w-4 h-4" />}>
          Add Integration
        </Button>
      </div>

      {isAdding && (
        <GlassCard className="p-6 border-primary/50">
          <h3 className="text-lg font-bold mb-4">Add New API Integration</h3>
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Provider Name (e.g., openai, stripe)</label>
              <input 
                type="text" 
                value={formData.providerName}
                onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="openai"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">API Key / Secret</label>
              <input 
                type="password" 
                value={formData.apiKey}
                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="sk-..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Base URL (Optional)</label>
              <input 
                type="url" 
                value={formData.baseUrl}
                onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </GlassCard>
      )}

      {loading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
          <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No API integrations configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((int) => (
            <GlassCard key={int.id} className="p-6 relative group">
              <button 
                onClick={() => handleDelete(int.id)}
                className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl uppercase tracking-wider mb-1">{int.providerName}</h3>
              <p className="text-sm text-muted-foreground truncate mb-4">
                {int.baseUrl || 'Default Base URL'}
              </p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${int.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {int.status}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {int.apiKey.substring(0, 5)}...{int.apiKey.substring(int.apiKey.length - 4)}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
