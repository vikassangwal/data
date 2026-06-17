'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Shield, 
  Crown, 
  User as UserIcon, 
  MoreVertical, 
  Edit, 
  X,
  CreditCard,
  Mail,
  Calendar,
  Eye,
  Briefcase,
  MapPin,
  Phone,
  Info,
  Check
} from 'lucide-react';
import Image from 'next/image';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  planId: string;
  createdAt: string;
  image: string | null;
  username?: string | null;
  mobile?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  profession?: string | null;
  organization?: string | null;
  role: string;
  bio?: string | null;
}

export default function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ role: '', planId: '' });
  const [isSaving, setIsSaving] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({ role: user.role, planId: user.planId });
    setIsEditModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editForm.role,
          planId: editForm.planId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editForm.role, planId: editForm.planId } : u));
        setIsEditModalOpen(false);
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (err) {
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'SUPER-ADMIN': return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Crown size={12}/> Super Admin</span>;
      case 'ADMIN': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span>;
      default: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><UserIcon size={12}/> User</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch(plan.toLowerCase()) {
      case 'enterprise': return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-xs font-bold w-fit">Enterprise</span>;
      case 'pro': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs font-bold w-fit">Pro Plan</span>;
      default: return <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-xs font-bold w-fit">Trial</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading users...</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-primary" /> Directory</h2>
          <p className="text-sm text-slate-400">Manage all registered accounts, their roles, and subscriptions.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {user.image ? (
                          <Image src={user.image} alt={user.name || ''} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name || 'Unnamed User'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10}/> {user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(user.planId)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12}/>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openViewModal(user)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingUser && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }} 
              className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-white mb-6 pr-8">Edit User Settings</h3>
              
              <div className="flex items-center gap-3 mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {editingUser.image ? (
                      <Image src={editingUser.image} alt={editingUser.name || ''} width={40} height={40} />
                    ) : (
                      <UserIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{editingUser.name}</div>
                    <div className="text-xs text-slate-500">{editingUser.email}</div>
                  </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">System Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="USER">Standard User</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER-ADMIN">Super Admin</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Super Admins have full access to all settings.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Subscription Plan</label>
                  <select 
                    value={editForm.planId}
                    onChange={(e) => setEditForm({...editForm, planId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="trial">Trial (Default)</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-transparent border border-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={16}/> Save Changes</>}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && viewingUser && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }} 
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white cursor-pointer bg-slate-800 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-start gap-6 mb-8 border-b border-slate-800 pb-8">
                 <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {viewingUser.image ? (
                      <Image src={viewingUser.image} alt={viewingUser.name || ''} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={40} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{viewingUser.name || 'Unnamed User'}</h3>
                    <div className="text-slate-400 flex items-center gap-2 mb-3">
                      <Mail size={14}/> {viewingUser.email}
                    </div>
                    <div className="flex gap-2">
                      {getRoleBadge(viewingUser.role)}
                      {getPlanBadge(viewingUser.planId)}
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1 */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><UserIcon size={14}/> Identity</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 space-y-3">
                      <div><span className="text-slate-500 text-xs">Username:</span> <p className="text-slate-200 font-medium">{viewingUser.username || 'Not set'}</p></div>
                      <div><span className="text-slate-500 text-xs">Gender:</span> <p className="text-slate-200 font-medium">{viewingUser.gender || 'Not set'}</p></div>
                      <div><span className="text-slate-500 text-xs">Date of Birth:</span> <p className="text-slate-200 font-medium">{viewingUser.dateOfBirth ? new Date(viewingUser.dateOfBirth).toLocaleDateString() : 'Not set'}</p></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={14}/> Professional</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 space-y-3">
                      <div><span className="text-slate-500 text-xs">Profession:</span> <p className="text-slate-200 font-medium">{viewingUser.profession || 'Not set'}</p></div>
                      <div><span className="text-slate-500 text-xs">Organization:</span> <p className="text-slate-200 font-medium">{viewingUser.organization || 'Not set'}</p></div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> Contact & Location</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 space-y-3">
                      <div><span className="text-slate-500 text-xs">Phone:</span> <p className="text-slate-200 font-medium">{viewingUser.mobile || 'Not set'}</p></div>
                      <div><span className="text-slate-500 text-xs">Country:</span> <p className="text-slate-200 font-medium">{viewingUser.country || 'Not set'}</p></div>
                      <div><span className="text-slate-500 text-xs">Location:</span> <p className="text-slate-200 font-medium">{viewingUser.city ? `${viewingUser.city}, ${viewingUser.state}` : (viewingUser.state || 'Not set')}</p></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={14}/> About</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                      <p className="text-slate-300 text-sm leading-relaxed">{viewingUser.bio || 'No biography provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
