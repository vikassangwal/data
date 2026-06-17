'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Eye, EyeOff,
  Monitor, Smartphone, Globe, MapPin, Clock, Trash2, Download,
  AlertTriangle, Check, X, RefreshCcw, ChevronRight, Fingerprint,
  Activity, Bell, ToggleLeft, ToggleRight, FileText
} from 'lucide-react';
import {
  getSecurityOverview,
  revokeSession,
  updatePrivacySettings,
  exportSecurityReport,
} from '@/app/actions/security-center';

type TabType = 'overview' | 'logins' | 'sessions' | 'privacy';

export default function SecurityClient() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [privacy, setPrivacy] = useState({ shareData: false, telemetry: true, visibility: 'private', marketing: false });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  async function loadData() {
    setLoading(true);
    const res = await getSecurityOverview();
    if (res.success) {
      setData(res);
      if (res.privacySettings) setPrivacy(res.privacySettings);
    }
    setLoading(false);
  }

  async function handleRevokeSession(sessionId: string) {
    setActionLoading(sessionId);
    const res = await revokeSession(sessionId);
    if (res.success) {
      setToast({ message: res.message || 'Revoked.', type: 'success' });
      await loadData();
    } else {
      setToast({ message: res.error || 'Failed.', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleSavePrivacy() {
    setActionLoading('privacy');
    const res = await updatePrivacySettings(privacy);
    if (res.success) setToast({ message: res.message || 'Saved.', type: 'success' });
    else setToast({ message: res.error || 'Failed.', type: 'error' });
    setActionLoading(null);
  }

  async function handleExportReport() {
    setActionLoading('export');
    const res = await exportSecurityReport();
    if (res.success && res.report) {
      const blob = new Blob([res.report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: 'Report downloaded.', type: 'success' });
    } else {
      setToast({ message: res.error || 'Failed.', type: 'error' });
    }
    setActionLoading(null);
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500', ring: 'ring-amber-500/30' };
    return { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500/30' };
  };

  const getThreatBadge = (level: string) => {
    const styles: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[level] || styles.low;
  };

  const getSeverityDot = (severity: string) => {
    const colors: Record<string, string> = { info: 'bg-blue-400', warning: 'bg-amber-400', critical: 'bg-red-400' };
    return colors[severity] || colors.info;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading security data...</p>
        </div>
      </div>
    );
  }

  const overview = data?.overview;
  const scoreColors = getScoreColor(overview?.securityScore || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 overflow-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield size={20} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Security Center</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">Monitor threats, manage sessions, and protect your account.</p>
        </div>
        <button onClick={handleExportReport} disabled={actionLoading === 'export'}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <Download size={12} /> Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'overview' as TabType, label: 'Overview', icon: <ShieldCheck size={15} /> },
          { id: 'logins' as TabType, label: 'Login History', icon: <Fingerprint size={15} /> },
          { id: 'sessions' as TabType, label: 'Active Sessions', icon: <Monitor size={15} /> },
          { id: 'privacy' as TabType, label: 'Privacy', icon: <Eye size={15} /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Security Score + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Big Score Card */}
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center">
              <div className={`w-24 h-24 rounded-full ring-4 ${scoreColors.ring} flex items-center justify-center mb-3 relative`}>
                <span className={`text-3xl font-black ${scoreColors.text}`}>{overview?.securityScore}</span>
                <svg className="absolute inset-0 w-24 h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColors.bg.replace('bg-', '')}
                    strokeWidth="6" strokeDasharray={`${(overview?.securityScore || 0) * 2.83} 283`}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                    className={scoreColors.text.replace('text-', 'stroke-')} />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-300">Security Score</div>
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border mt-2 ${getThreatBadge(overview?.threatLevel)}`}>
                {overview?.threatLevel} threat
              </div>
            </motion.div>

            {/* Stat Cards */}
            {[
              { label: 'Total Logins', value: overview?.totalLogins, icon: <Fingerprint size={16} />, color: 'text-blue-400', gradient: 'from-blue-600 to-indigo-600' },
              { label: 'Failed Attempts', value: overview?.failedLogins, icon: <ShieldAlert size={16} />, color: 'text-amber-400', gradient: 'from-amber-600 to-orange-600' },
              { label: 'Active Sessions', value: overview?.activeSessions, icon: <Monitor size={16} />, color: 'text-violet-400', gradient: 'from-violet-600 to-purple-600' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} w-fit mb-3 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Security Events */}
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-5"><Activity size={18} className="text-emerald-400" /> Recent Security Events</h2>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
              {(data?.securityLogs || []).map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 py-3 px-4 bg-slate-950/50 rounded-xl border border-slate-800/30">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getSeverityDot(log.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{log.description}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{log.event}</span>
                      <span>·</span>
                      <span>{log.ip}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleString()}</div>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    log.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>{log.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ LOGIN HISTORY TAB ═══ */}
      {activeTab === 'logins' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-5"><Fingerprint size={18} className="text-blue-400" /> Login History</h2>
            <div className="space-y-2">
              {(data?.loginHistory || []).map((login: any) => (
                <div key={login.id} className={`flex items-center gap-4 py-3 px-4 rounded-xl border ${
                  login.status === 'FAILED' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950/50 border-slate-800/30'
                }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    login.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {login.status === 'FAILED' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{login.device || `${login.browser} on ${login.os}`}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Globe size={9} /> {login.ip}</span>
                      {login.location && <span className="flex items-center gap-1"><MapPin size={9} /> {login.location}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      login.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>{login.status}</span>
                    <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1 justify-end">
                      <Clock size={9} /> {new Date(login.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ ACTIVE SESSIONS TAB ═══ */}
      {activeTab === 'sessions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-5"><Monitor size={18} className="text-violet-400" /> Active Sessions</h2>
            <div className="space-y-3">
              {(data?.activeSessions || []).map((sess: any) => (
                <div key={sess.id} className={`flex items-center justify-between py-4 px-5 rounded-2xl border ${
                  sess.isCurrent ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/50 border-slate-800/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      sess.device?.includes('Android') || sess.device?.includes('iOS')
                        ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {sess.device?.includes('Android') || sess.device?.includes('iOS') ? <Smartphone size={18} /> : <Monitor size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        {sess.device}
                        {sess.isCurrent && (
                          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Globe size={9} /> {sess.ip}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock size={9} /> {new Date(sess.lastActive).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!sess.isCurrent && (
                    <button onClick={() => handleRevokeSession(sess.id)} disabled={actionLoading === sess.id}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                      <Trash2 size={12} /> Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ PRIVACY TAB ═══ */}
      {activeTab === 'privacy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><Eye size={18} className="text-cyan-400" /> Privacy Settings</h2>
            <div className="space-y-5 max-w-xl">
              {/* Toggle Items */}
              {[
                { key: 'shareData' as const, label: 'Share data with partners', desc: 'Allow anonymized data to be shared with third-party analytics partners.', icon: <Globe size={16} /> },
                { key: 'telemetry' as const, label: 'Usage telemetry', desc: 'Send anonymous usage statistics to help improve the platform.', icon: <Activity size={16} /> },
                { key: 'marketing' as const, label: 'Marketing emails', desc: 'Receive product updates, tips, and promotional emails.', icon: <Bell size={16} /> },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-800/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500">{item.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })} className="cursor-pointer">
                    {privacy[item.key]
                      ? <ToggleRight size={28} className="text-emerald-400" />
                      : <ToggleLeft size={28} className="text-slate-600" />
                    }
                  </button>
                </div>
              ))}

              {/* Profile Visibility */}
              <div className="py-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Profile Visibility</label>
                <select value={privacy.visibility} onChange={(e) => setPrivacy({ ...privacy, visibility: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                  <option value="private">🔒 Private — Only you can see your profile</option>
                  <option value="organization">🏢 Organization — Visible to workspace members</option>
                  <option value="public">🌐 Public — Visible to everyone</option>
                </select>
              </div>

              <button onClick={handleSavePrivacy} disabled={actionLoading === 'privacy'}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                {actionLoading === 'privacy'
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Check size={14} /> Save Settings</>
                }
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
