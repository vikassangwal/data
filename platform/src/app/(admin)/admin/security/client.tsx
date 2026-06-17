'use client';

import { useState } from 'react';
import { Shield, Key, Mail, UserPlus } from 'lucide-react';

export default function SecurityClient() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Simulate server action
    setTimeout(() => {
      setLoading(false);
      setMessage(`${type} updated successfully!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security & Administrators</h1>
          <p className="text-sm text-muted-foreground">Manage your credentials and platform access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Change Email */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Change Email Address</h2>
          </div>
          <form onSubmit={(e) => handleAction(e, 'Email')} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Email</label>
              <input type="email" placeholder="admin@devforge.com" className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1" disabled />
            </div>
            <div>
              <label className="text-sm font-medium">New Email</label>
              <input type="email" required placeholder="newadmin@devforge.com" className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Update Email
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <form onSubmit={(e) => handleAction(e, 'Password')} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <input type="password" required className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input type="password" required className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
              Update Password
            </button>
          </form>
        </div>

        {/* Add New Admin */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">Add New Administrator</h2>
          </div>
          <form onSubmit={(e) => handleAction(e, 'New Admin')} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input type="text" required placeholder="John Doe" className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required placeholder="admin2@devforge.com" className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Temporary Password</label>
                <input type="password" required className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Role Level</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER-ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
      
      {message && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
