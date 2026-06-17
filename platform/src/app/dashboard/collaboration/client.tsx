'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, X, Check, Trash2, Crown, Edit3, UserPlus,
  FolderOpen, Database, LayoutDashboard, Clock, Shield,
  Eye, Pencil, AlertTriangle, RefreshCcw, Search, ChevronDown,
  Activity, Mail
} from 'lucide-react';
import {
  getUserWorkspaces,
  createWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  deleteWorkspace,
  renameWorkspace,
  getTeamActivity,
} from '@/app/actions/collaboration';

interface WorkspaceMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  datasetCount: number;
  dashboardCount: number;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

interface TeamEvent {
  id: string;
  user: string;
  userImage: string | null;
  action: string;
  module: string;
  resource: string | null;
  timestamp: string;
}

export default function CollaborationClient() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Selected workspace
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);
  const [teamActivity, setTeamActivity] = useState<TeamEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [renameName, setRenameName] = useState('');

  useEffect(() => { loadWorkspaces(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadWorkspaces() {
    setLoading(true);
    const res = await getUserWorkspaces();
    if (res.success && res.workspaces) setWorkspaces(res.workspaces);
    setLoading(false);
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading('create');
    const res = await createWorkspace(newWsName);
    if (res.success) {
      setToast({ message: res.message || 'Created!', type: 'success' });
      setIsCreateOpen(false);
      setNewWsName('');
      await loadWorkspaces();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWs) return;
    setActionLoading('invite');
    const res = await inviteMember(selectedWs.id, inviteEmail, inviteRole);
    if (res.success) {
      setToast({ message: res.message || 'Invited!', type: 'success' });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      await loadWorkspaces();
      // Refresh selected workspace
      const updated = (await getUserWorkspaces());
      if (updated.success && updated.workspaces) {
        const ws = updated.workspaces.find((w: Workspace) => w.id === selectedWs.id);
        if (ws) setSelectedWs(ws);
      }
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleRemoveMember(userId: string) {
    if (!selectedWs) return;
    setActionLoading(`remove-${userId}`);
    const res = await removeMember(selectedWs.id, userId);
    if (res.success) {
      setToast({ message: res.message || 'Removed.', type: 'success' });
      await loadWorkspaces();
      const updated = (await getUserWorkspaces());
      if (updated.success && updated.workspaces) {
        const ws = updated.workspaces.find((w: Workspace) => w.id === selectedWs.id);
        if (ws) setSelectedWs(ws);
      }
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!selectedWs) return;
    setActionLoading(`role-${userId}`);
    const res = await updateMemberRole(selectedWs.id, userId, newRole);
    if (res.success) {
      setToast({ message: res.message || 'Updated.', type: 'success' });
      await loadWorkspaces();
      const updated = (await getUserWorkspaces());
      if (updated.success && updated.workspaces) {
        const ws = updated.workspaces.find((w: Workspace) => w.id === selectedWs.id);
        if (ws) setSelectedWs(ws);
      }
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleDeleteWorkspace() {
    if (!selectedWs) return;
    setActionLoading('delete');
    const res = await deleteWorkspace(selectedWs.id);
    if (res.success) {
      setToast({ message: res.message || 'Deleted.', type: 'success' });
      setSelectedWs(null);
      await loadWorkspaces();
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWs) return;
    setActionLoading('rename');
    const res = await renameWorkspace(selectedWs.id, renameName);
    if (res.success) {
      setToast({ message: res.message || 'Renamed.', type: 'success' });
      setIsRenameOpen(false);
      await loadWorkspaces();
      setSelectedWs({ ...selectedWs, name: renameName.trim() });
    } else {
      setToast({ message: res.error || 'Failed', type: 'error' });
    }
    setActionLoading(null);
  }

  async function loadTeamActivity(wsId: string) {
    setActivityLoading(true);
    const res = await getTeamActivity(wsId);
    if (res.success && res.activities) setTeamActivity(res.activities as TeamEvent[]);
    setActivityLoading(false);
  }

  function selectWorkspace(ws: Workspace) {
    setSelectedWs(ws);
    loadTeamActivity(ws.id);
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={12} className="text-amber-400" />;
      case 'editor': return <Pencil size={12} className="text-blue-400" />;
      default: return <Eye size={12} className="text-slate-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      editor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      viewer: 'bg-slate-800 text-slate-400 border-slate-700',
    };
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${styles[role] || styles.viewer}`}>
        {getRoleIcon(role)} {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 overflow-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users size={20} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Team Collaboration</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">Manage workspaces, invite members, and track team activity.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus size={14} /> New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Workspace List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FolderOpen size={14} /> Your Workspaces ({workspaces.length})
          </h2>

          {workspaces.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
              <FolderOpen size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">No workspaces yet.</p>
              <p className="text-slate-600 text-xs mt-1">Create one to start collaborating.</p>
            </div>
          ) : (
            workspaces.map((ws) => (
              <motion.button
                key={ws.id}
                layout
                onClick={() => selectWorkspace(ws)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedWs?.id === ws.id
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm truncate">{ws.name}</h3>
                  {getRoleBadge(ws.role)}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Users size={10} /> {ws.memberCount} members</span>
                  <span className="flex items-center gap-1"><Database size={10} /> {ws.datasetCount} datasets</span>
                  <span className="flex items-center gap-1"><LayoutDashboard size={10} /> {ws.dashboardCount}</span>
                </div>
                {/* Member Avatars */}
                <div className="flex -space-x-2 mt-3">
                  {ws.members.slice(0, 5).map((m, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-400"
                      title={m.name || m.email || ''}
                    >
                      {(m.name || m.email || '?')[0].toUpperCase()}
                    </div>
                  ))}
                  {ws.memberCount > 5 && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-400">
                      +{ws.memberCount - 5}
                    </div>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* RIGHT: Workspace Detail (2 cols) */}
        <div className="lg:col-span-2">
          {!selectedWs ? (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-2xl">
              <div className="text-center">
                <Users size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">Select a workspace</p>
                <p className="text-slate-600 text-xs mt-1">Click on a workspace to view details and manage members.</p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Workspace Header */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {selectedWs.name}
                      {getRoleBadge(selectedWs.role)}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={10} /> Created {new Date(selectedWs.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedWs.role !== 'viewer' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsRenameOpen(true); setRenameName(selectedWs.name); }}
                        className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit3 size={12} /> Rename
                      </button>
                      <button
                        onClick={() => setIsInviteOpen(true)}
                        className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus size={12} /> Invite
                      </button>
                      {selectedWs.role === 'owner' && (
                        <button
                          onClick={handleDeleteWorkspace}
                          disabled={actionLoading === 'delete'}
                          className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Members', value: selectedWs.memberCount, icon: <Users size={14} />, color: 'text-blue-400' },
                    { label: 'Datasets', value: selectedWs.datasetCount, icon: <Database size={14} />, color: 'text-emerald-400' },
                    { label: 'Dashboards', value: selectedWs.dashboardCount, icon: <LayoutDashboard size={14} />, color: 'text-violet-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-950 rounded-xl p-3 flex items-center gap-3 border border-slate-800/50">
                      <div className={`${s.color} bg-slate-800 p-2 rounded-lg`}>{s.icon}</div>
                      <div>
                        <div className="text-lg font-bold">{s.value}</div>
                        <div className="text-[10px] text-slate-500">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members List */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-blue-400" /> Team Members
                </h3>
                <div className="space-y-2">
                  {selectedWs.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-3 px-4 bg-slate-950/50 rounded-xl border border-slate-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">
                          {(member.name || member.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{member.name || 'Unnamed'}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1"><Mail size={9} /> {member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedWs.role === 'owner' && member.role !== 'owner' ? (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              disabled={actionLoading === `role-${member.id}`}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Owner</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={actionLoading === `remove-${member.id}`}
                              className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          getRoleBadge(member.role)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Activity */}
              <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" /> Team Activity
                  </h3>
                  <button
                    onClick={() => loadTeamActivity(selectedWs.id)}
                    className="text-xs text-slate-500 hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCcw size={10} /> Refresh
                  </button>
                </div>

                {activityLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  </div>
                ) : teamActivity.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs">
                    No recent team activity found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {teamActivity.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 py-2 border-b border-slate-800/20 last:border-0">
                        <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400">
                          {event.user[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs">
                            <span className="font-bold text-slate-200">{event.user}</span>{' '}
                            <span className="text-slate-400">{event.action}</span>
                          </div>
                          {event.resource && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{event.module} · {event.resource}</div>
                          )}
                          <div className="text-[9px] text-slate-600 mt-0.5">{new Date(event.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ CREATE WORKSPACE MODAL ═══ */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><FolderOpen size={20} className="text-blue-400" /> New Workspace</h3>
              <p className="text-xs text-slate-500 mb-5">Create a collaborative workspace for your team.</p>
              <form onSubmit={handleCreateWorkspace}>
                <input
                  type="text" value={newWsName} onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Marketing Analytics Q3"
                  required minLength={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 mb-4"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={actionLoading === 'create'} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === 'create' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Create</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ INVITE MEMBER MODAL ═══ */}
      <AnimatePresence>
        {isInviteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsInviteOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><UserPlus size={20} className="text-blue-400" /> Invite Member</h3>
              <p className="text-xs text-slate-500 mb-5">Add a team member to &ldquo;{selectedWs?.name}&rdquo;</p>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <input
                    type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Role</label>
                  <select
                    value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="viewer">Viewer — Can view data only</option>
                    <option value="editor">Editor — Can edit and create</option>
                    <option value="owner">Owner — Full access</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={actionLoading === 'invite'} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === 'invite' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={14} /> Invite</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RENAME MODAL ═══ */}
      <AnimatePresence>
        {isRenameOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsRenameOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Edit3 size={20} className="text-blue-400" /> Rename Workspace</h3>
              <form onSubmit={handleRename}>
                <input
                  type="text" value={renameName} onChange={(e) => setRenameName(e.target.value)}
                  required minLength={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 mb-4"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsRenameOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={actionLoading === 'rename'} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === 'rename' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Save</>}
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
