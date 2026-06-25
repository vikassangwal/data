'use client';

import { useState } from 'react';
import { toggleProviderActive, deleteProvider, addAiProvider } from '@/app/actions/ai-providers';
import GlassCard from '@/components/ui/GlassCard';
import { Cpu, Plus, Trash2, CheckCircle, XCircle, Settings, Play, Sparkles, Server, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderClientPage({ initialProviders }: { initialProviders: any[] }) {
  const [providers, setProviders] = useState(initialProviders);
  const [isAdding, setIsAdding] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai_compatible',
    apiKey: '',
    baseUrl: '',
    models: ''
  });

  const triggerAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 4500);
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleProviderActive(id, !current);
      setProviders(providers.map(p => {
        if (p.id === id) return { ...p, isActive: !current };
        if (!current) return { ...p, isActive: false }; // Single active route rule
        return p;
      }));
      triggerAlert(`Provider route state updated successfully.`);
    } catch (err) {
      triggerAlert('Failed to update provider status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProvider(id);
      setProviders(providers.filter(p => p.id !== id));
      triggerAlert('AI Provider permanently removed from endpoint vault.');
    } catch (err) {
      triggerAlert('Failed to delete provider.', 'error');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.apiKey) {
        triggerAlert('Please fill out all required fields.', 'error');
        return;
      }

      const modelsArray = formData.models
        ? formData.models.split(',').map(s => s.trim()).filter(Boolean)
        : ['default-model'];

      const newProv = await addAiProvider({
        ...formData,
        models: modelsArray,
        isActive: providers.length === 0 // default active if first
      });

      setProviders([newProv, ...providers]);
      setIsAdding(false);
      setFormData({ name: '', type: 'openai_compatible', apiKey: '', baseUrl: '', models: '' });
      triggerAlert(`Provider "${formData.name}" successfully registered and synchronized.`);
    } catch (err) {
      triggerAlert('Failed to register AI Provider.', 'error');
    }
  };

  // Preset Configurations for Local / Custom APIs
  const applyPreset = (preset: 'ollama' | 'lmstudio' | 'huggingface' | 'together' | 'openrouter') => {
    switch (preset) {
      case 'ollama':
        setFormData({
          name: 'Ollama (Local)',
          type: 'openai_compatible',
          apiKey: 'ollama-no-key-required',
          baseUrl: 'http://localhost:11434/v1',
          models: 'llama3, mistral, codellama, phi3'
        });
        triggerAlert('Ollama local host template loaded.');
        break;
      case 'lmstudio':
        setFormData({
          name: 'LM Studio (Local)',
          type: 'openai_compatible',
          apiKey: 'lm-studio-key',
          baseUrl: 'http://localhost:1234/v1',
          models: 'meta-llama-3-8b-instruct, mistral-7b-instruct'
        });
        triggerAlert('LM Studio local host template loaded.');
        break;
      case 'huggingface':
        setFormData({
          name: 'Hugging Face Inference',
          type: 'openai_compatible',
          apiKey: 'hf_your_inference_token_here',
          baseUrl: 'https://api-inference.huggingface.co/v1',
          models: 'meta-llama/Meta-Llama-3-8B-Instruct, mistralai/Mistral-7B-Instruct-v0.2'
        });
        triggerAlert('Hugging Face hub endpoint template loaded.');
        break;
      case 'together':
        setFormData({
          name: 'Together AI',
          type: 'openai_compatible',
          apiKey: '',
          baseUrl: 'https://api.together.xyz/v1',
          models: 'meta-llama/Llama-3-70b-chat-hf, mistralai/Mixtral-8x7B-Instruct-v0.1'
        });
        triggerAlert('Together AI endpoint template loaded.');
        break;
      case 'openrouter':
        setFormData({
          name: 'OpenRouter AI',
          type: 'openai_compatible',
          apiKey: '',
          baseUrl: 'https://openrouter.ai/api/v1',
          models: 'meta-llama/llama-3-8b-instruct:free, google/gemma-7b-it:free'
        });
        triggerAlert('OpenRouter AI endpoint template loaded.');
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {alertMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
            <span className="font-medium text-sm">{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-white/80">Active Routing Gateways: <strong className="text-white">{providers.filter(p => p.isActive).length} Active</strong></span>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all active:scale-95"
        >
          {isAdding ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Close Configuration' : 'Add Model / Endpoint'}
        </button>
      </div>

      {/* Expandable Add Provider Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6 border border-primary/30 relative bg-black/40">
              <div className="absolute top-4 right-4 flex gap-1">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                Configure Custom Gateway
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill the fields below or click a fast template preset to auto-configure local inferences.
              </p>

              {/* Template Presets Bar */}
              <div className="mb-6">
                <span className="text-xs font-bold text-white/50 block mb-2 uppercase tracking-wider">Fast Presets Templates</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <button 
                    type="button" 
                    onClick={() => applyPreset('ollama')} 
                    className="p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-left rounded-xl transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-sm text-white">Ollama</span>
                    <span className="text-xs text-muted-foreground mt-1">Local Host (11434)</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('lmstudio')} 
                    className="p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-left rounded-xl transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-sm text-white">LM Studio</span>
                    <span className="text-xs text-muted-foreground mt-1">Local Host (1234)</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('huggingface')} 
                    className="p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-left rounded-xl transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-sm text-white">Hugging Face</span>
                    <span className="text-xs text-muted-foreground mt-1">Inference API Hub</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('together')} 
                    className="p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-left rounded-xl transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-sm text-white">Together AI</span>
                    <span className="text-xs text-muted-foreground mt-1">Cloud API Endpoint</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('openrouter')} 
                    className="p-3 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/50 text-left rounded-xl transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-sm text-white">OpenRouter</span>
                    <span className="text-xs text-muted-foreground mt-1">Free/Paid Models</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase">Provider Name</label>
                    <input 
                      required 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-primary transition-all outline-none" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. My Local Ollama" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase">Gateway Type</label>
                    <select 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-primary transition-all outline-none" 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="openai_compatible">OpenAI Compatible (Ollama, LMStudio, Groq)</option>
                      <option value="gemini">Google Gemini Client</option>
                      <option value="claude">Anthropic Claude Client</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase">API Access Key</label>
                    <input 
                      required 
                      type="password" 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-primary transition-all outline-none font-mono" 
                      value={formData.apiKey} 
                      onChange={e => setFormData({...formData, apiKey: e.target.value})} 
                      placeholder="Enter API credential key or token..." 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase">Target Endpoint Base URL (Optional)</label>
                    <input 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-primary transition-all outline-none font-mono" 
                      value={formData.baseUrl} 
                      onChange={e => setFormData({...formData, baseUrl: e.target.value})} 
                      placeholder="e.g. http://localhost:11434/v1" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase">Detected Models (Comma separated listing)</label>
                    <input 
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-primary transition-all outline-none font-mono" 
                      value={formData.models} 
                      onChange={e => setFormData({...formData, models: e.target.value})} 
                      placeholder="llama3, mixtral-8x7b, custom-model" 
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-white rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    <ShieldCheck className="w-5 h-5" /> Save Provider
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of existing providers */}
      {providers.length === 0 ? (
        <GlassCard className="p-12 text-center border border-white/10 flex flex-col items-center justify-center">
          <Cpu className="w-16 h-16 text-white/20 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white">No Active AI Gateways</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            You haven't configured any custom or local models yet. Click the "Add Model / Endpoint" button to initialize Ollama or other LLMs.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {providers.map(provider => {
            const detectedModels = typeof provider.models === 'string'
              ? JSON.parse(provider.models || '[]')
              : (Array.isArray(provider.models) ? provider.models : []);

            return (
              <GlassCard 
                key={provider.id} 
                className={`p-6 border-2 transition-all duration-300 relative overflow-hidden ${
                  provider.isActive 
                    ? 'border-primary/60 bg-primary/5 shadow-[0_0_25px_rgba(59,130,246,0.15)]' 
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                }`}
              >
                {provider.isActive && (
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${provider.isActive ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}>
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-1.5">
                        {provider.name}
                        {provider.isActive && <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />}
                      </h3>
                      <span className="text-xs text-primary/80 font-mono uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block mt-0.5">
                        {provider.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(provider.id)} 
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-xl transition-all"
                    title="Delete Provider"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-6 text-sm bg-black/30 p-4 rounded-xl border border-white/5">
                  {provider.baseUrl && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Base Endpoint URL</span>
                      <span className="font-mono text-xs text-white/90 truncate">{provider.baseUrl}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-xs font-medium">Supported Models</span>
                    <span className="font-mono text-xs text-white bg-white/10 px-2 py-0.5 rounded-full">{detectedModels.length} Listed</span>
                  </div>
                  {detectedModels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
                      {detectedModels.slice(0, 3).map((m: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/5 text-white/70 px-2 py-0.5 rounded-md">
                          {m}
                        </span>
                      ))}
                      {detectedModels.length > 3 && (
                        <span className="text-[10px] font-mono text-primary px-1.5 py-0.5">
                          +{detectedModels.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button 
                    onClick={() => handleToggle(provider.id, provider.isActive)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      provider.isActive 
                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    {provider.isActive ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4 text-primary animate-pulse" />}
                    {provider.isActive ? 'Active Gateway' : 'Set Active Router'}
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({
                        name: provider.name,
                        type: provider.type,
                        apiKey: '••••••••',
                        baseUrl: provider.baseUrl || '',
                        models: detectedModels.join(', ')
                      });
                      setIsAdding(true);
                      triggerAlert(`Loaded ${provider.name} settings for edit.`);
                    }} 
                    className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/10 text-white/80 transition-all"
                    title="Edit Settings"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
