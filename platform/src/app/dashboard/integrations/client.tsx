'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, Database, RefreshCcw, Trash2, X, Check, AlertTriangle,
  Zap, Activity, Search, Plus, TestTube, ChevronDown, Wifi, WifiOff,
  Clock, ArrowRight, ExternalLink, Server, Shield, Terminal
} from 'lucide-react';
import {
  getIntegrationProviders,
  getUserDataIntegrations,
  connectDataIntegration,
  disconnectDataIntegration,
  triggerDataSync,
  getUserEnterpriseDbs,
  addEnterpriseDb,
  removeEnterpriseDb,
  testDbConnection,
} from '@/app/actions/data-integrations';

type TabType = 'integrations' | 'databases' | 'sync-logs';

interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
  scopes: string;
  description: string;
  category: string;
}

interface Integration {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: string | null;
  providerAccountId: string | null;
  metadata: string | null;
}

interface EntDb {
  id: string;
  name: string;
  engine: string;
  host: string;
  port: number | null;
  databaseName: string;
  status: string;
  lastSyncAt: string | null;
}

interface SyncLog {
  id: string;
  provider: string;
  providerName: string;
  time: string;
  records: number;
  duration: string;
  status: 'success' | 'error';
  data: Record<string, number | string>;
}

export default function IntegrationsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('integrations');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [databases, setDatabases] = useState<EntDb[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // DB Modal
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbForm, setDbForm] = useState({
    name: '', engine: 'postgresql', host: '', port: 5432,
    databaseName: '', username: '', password: '', sslMode: 'prefer',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadData() {
    setLoading(true);
    const [pRes, iRes, dRes] = await Promise.all([
      getIntegrationProviders(),
      getUserDataIntegrations(),
      getUserEnterpriseDbs(),
    ]);
    
    let loadedProviders = pRes.success ? pRes.providers : [];
    let loadedIntegrations = iRes.success && iRes.integrations ? iRes.integrations as Integration[] : [];

    // Inject Local Data Lab file if it exists
    try {
      const localStr = localStorage.getItem('global_shared_dataset');
      if (localStr) {
        const localData = JSON.parse(localStr);
        loadedProviders = [
          {
            id: 'local_datalab',
            name: 'Data Lab Upload',
            icon: '📁',
            color: '#10b981',
            scopes: 'read',
            description: `Active file: ${localData.name}. Uploaded via Cinematic Data Lab. Ready for cross-platform AI Analysis.`,
            category: 'Local Files'
          },
          ...loadedProviders
        ];
        loadedIntegrations = [
          {
            id: 'local_int_1',
            provider: 'local_datalab',
            status: 'connected',
            lastSyncAt: new Date(localData.timestamp).toISOString(),
            providerAccountId: 'local',
            metadata: null
          },
          ...loadedIntegrations
        ];
      }
    } catch (e) {}

    setProviders(loadedProviders);
    setIntegrations(loadedIntegrations);
    if (dRes.success && dRes.databases) setDatabases(dRes.databases as EntDb[]);
    setLoading(false);
  }

  const connectedProviders = new Set(integrations.map(i => i.provider));

  async function handleConnect(providerId: string) {
    setActionLoading(providerId);
    const res = await connectDataIntegration(providerId);
    if (res.success) {
      setToast({ message: res.message || 'Connected!', type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleDisconnect(providerId: string) {
    setActionLoading(providerId);
    const res = await disconnectDataIntegration(providerId);
    if (res.success) {
      setToast({ message: res.message || 'Disconnected.', type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleSync(providerId: string) {
    setActionLoading(`sync-${providerId}`);
    const res = await triggerDataSync(providerId);
    if (res.success && res.metrics) {
      const providerConfig = providers.find(p => p.id === providerId);
      const newLog: SyncLog = {
        id: Date.now().toString(),
        provider: providerId,
        providerName: providerConfig?.name || providerId,
        time: new Date().toLocaleTimeString(),
        records: res.metrics.recordsProcessed,
        duration: `${res.metrics.durationMs}ms`,
        status: 'success',
        data: res.metrics.data as Record<string, number | string>,
      };
      setSyncLogs(prev => [newLog, ...prev]);
      setToast({ message: res.message || 'Synced!', type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Sync failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleAddDb(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading('add-db');
    const res = await addEnterpriseDb(dbForm);
    if (res.success) {
      setToast({ message: res.message || 'Database added!', type: 'success' });
      setIsDbModalOpen(false);
      setDbForm({ name: '', engine: 'postgresql', host: '', port: 5432, databaseName: '', username: '', password: '', sslMode: 'prefer' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleRemoveDb(dbId: string) {
    setActionLoading(dbId);
    const res = await removeEnterpriseDb(dbId);
    if (res.success) {
      setToast({ message: res.message || 'Removed.', type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleTestDb(dbId: string) {
    setActionLoading(`test-${dbId}`);
    const res = await testDbConnection(dbId);
    if (res.success) {
      setToast({ message: `Connection OK · Latency: ${res.latency}`, type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.message || 'Test failed', type: 'error' });
    }
    setActionLoading(null);
  }

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(providers.map(p => p.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-white p-6 md:p-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-white border border-emerald-400/30'
                : 'bg-red-500/90 text-white border border-red-400/30'
            }`}
          >
            {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Plug size={20} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Data Integrations</h1>
        </div>
        <p className="text-slate-400 text-sm ml-[52px]">
          Connect your apps, services, and databases to unlock powerful cross-platform analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'integrations' as TabType, label: 'One-Click Apps', icon: <Zap size={15} />, count: providers.length },
          { id: 'databases' as TabType, label: 'Enterprise Databases', icon: <Database size={15} />, count: databases.length },
          { id: 'sync-logs' as TabType, label: 'Sync Activity', icon: <Activity size={15} />, count: syncLogs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* TAB 1: ONE-CLICK INTEGRATIONS           */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'integrations' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize cursor-pointer transition-all ${
                    filterCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Available', value: providers.length, icon: <Plug size={16} />, color: 'text-violet-400' },
              { label: 'Connected', value: connectedProviders.size, icon: <Wifi size={16} />, color: 'text-emerald-400' },
              { label: 'Categories', value: categories.length - 1, icon: <Server size={16} />, color: 'text-blue-400' },
              { label: 'Last Sync', value: integrations.length > 0 ? 'Active' : 'N/A', icon: <Clock size={16} />, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                <div className={`${stat.color} bg-slate-800 p-2 rounded-lg`}>{stat.icon}</div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => {
              const isConnected = connectedProviders.has(provider.id);
              const isLoading = actionLoading === provider.id || actionLoading === `sync-${provider.id}`;
              const integration = integrations.find(i => i.provider === provider.id);

              return (
                <motion.div
                  key={provider.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-slate-900/70 rounded-2xl border transition-all overflow-hidden group ${
                    isConnected
                      ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Colored top bar */}
                  <div className="h-1" style={{ backgroundColor: provider.color }} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner"
                          style={{ backgroundColor: `${provider.color}15`, border: `1px solid ${provider.color}30` }}
                        >
                          {provider.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{provider.name}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            {provider.category}
                          </span>
                        </div>
                      </div>

                      {/* Status Dot */}
                      {isConnected && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          Live
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[32px]">
                      {provider.description}
                    </p>

                    {/* Last Sync Info */}
                    {isConnected && integration?.lastSyncAt && (
                      <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
                        <Clock size={10} />
                        Last synced: {new Date(integration.lastSyncAt).toLocaleString()}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleSync(provider.id)}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 bg-violet-600/20 text-violet-300 rounded-lg text-xs font-bold hover:bg-violet-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCcw size={12} className={actionLoading === `sync-${provider.id}` ? 'animate-spin' : ''} />
                            Sync
                          </button>
                          <button
                            onClick={() => handleDisconnect(provider.id)}
                            disabled={isLoading}
                            className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <WifiOff size={12} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider.id)}
                          disabled={isLoading}
                          className="w-full px-3 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plug size={12} /> Connect
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 2: ENTERPRISE DATABASES              */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'databases' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Database size={20} className="text-blue-400" /> Database Connections</h2>
              <p className="text-xs text-slate-500 mt-1">Connect your MySQL, PostgreSQL, MongoDB, or Snowflake databases.</p>
            </div>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Database
            </button>
          </div>

          {databases.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
              <Database size={40} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-semibold">No databases connected yet.</p>
              <p className="text-slate-600 text-xs mt-1">Click "Add Database" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {databases.map((db) => (
                <motion.div
                  key={db.id}
                  layout
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      db.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      db.status === 'syncing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {db.engine === 'postgresql' ? '🐘' : db.engine === 'mysql' ? '🐬' : db.engine === 'mongodb' ? '🍃' : '❄️'}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {db.name}
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                          db.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' :
                          db.status === 'syncing' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {db.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {db.engine.toUpperCase()} · {db.host}:{db.port} · {db.databaseName}
                      </div>
                      {db.lastSyncAt && (
                        <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                          <Clock size={9} /> Last sync: {new Date(db.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTestDb(db.id)}
                      disabled={actionLoading === `test-${db.id}`}
                      className="px-3 py-2 bg-blue-600/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <TestTube size={12} className={actionLoading === `test-${db.id}` ? 'animate-bounce' : ''} />
                      Test
                    </button>
                    <button
                      onClick={() => handleRemoveDb(db.id)}
                      disabled={actionLoading === db.id}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 3: SYNC ACTIVITY LOGS                */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'sync-logs' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Terminal size={20} className="text-emerald-400" /> Sync Activity Feed</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time log of all data synchronization operations.</p>
          </div>

          {syncLogs.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
              <Activity size={40} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-semibold">No sync activity yet.</p>
              <p className="text-slate-600 text-xs mt-1">Connect an integration and trigger a sync to see logs here.</p>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Terminal-style header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] text-slate-500 ml-2 font-mono">sync-activity-monitor</span>
              </div>

              <div className="p-4 font-mono text-xs space-y-3 max-h-[500px] overflow-y-auto">
                {syncLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-2 border-emerald-500/50 pl-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">[SYNC]</span>
                      <span className="text-slate-300">{log.providerName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{log.time}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      → Processed <span className="text-blue-400 font-bold">{log.records.toLocaleString()}</span> records in <span className="text-amber-400">{log.duration}</span>
                    </div>
                    {Object.entries(log.data).length > 0 && (
                      <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(log.data).map(([k, v]) => (
                          <span key={k}>
                            <span className="text-slate-500">{k}:</span>{' '}
                            <span className="text-cyan-400">{typeof v === 'number' ? v.toLocaleString() : v}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ADD DATABASE MODAL                       */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isDbModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Database size={20} className="text-blue-400" /> Add Enterprise Database
              </h3>
              <p className="text-xs text-slate-500 mb-6">Securely connect your database for real-time analysis.</p>

              <form onSubmit={handleAddDb} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Connection Name</label>
                    <input
                      type="text"
                      value={dbForm.name}
                      onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })}
                      placeholder="e.g. Production Analytics"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Engine</label>
                    <select
                      value={dbForm.engine}
                      onChange={(e) => setDbForm({ ...dbForm, engine: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="snowflake">Snowflake</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">SSL Mode</label>
                    <select
                      value={dbForm.sslMode}
                      onChange={(e) => setDbForm({ ...dbForm, sslMode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="prefer">Prefer</option>
                      <option value="require">Require</option>
                      <option value="disable">Disable</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Host</label>
                    <input
                      type="text"
                      value={dbForm.host}
                      onChange={(e) => setDbForm({ ...dbForm, host: e.target.value })}
                      placeholder="db.example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Port</label>
                    <input
                      type="number"
                      value={dbForm.port}
                      onChange={(e) => setDbForm({ ...dbForm, port: parseInt(e.target.value) || 5432 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Database Name</label>
                    <input
                      type="text"
                      value={dbForm.databaseName}
                      onChange={(e) => setDbForm({ ...dbForm, databaseName: e.target.value })}
                      placeholder="analytics_db"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Username</label>
                    <input
                      type="text"
                      value={dbForm.username}
                      onChange={(e) => setDbForm({ ...dbForm, username: e.target.value })}
                      placeholder="admin"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
                    <input
                      type="password"
                      value={dbForm.password}
                      onChange={(e) => setDbForm({ ...dbForm, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                  <Shield size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-blue-300/70 leading-relaxed">
                    Credentials are encrypted at rest using AES-256 and never logged. Connection tests use isolated sandboxed queries.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDbModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-transparent border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'add-db'}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === 'add-db' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Check size={14} /> Connect Database</>
                    )}
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
