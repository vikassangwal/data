'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Mail, Phone, Calendar, Search, Filter, 
  MoreVertical, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { deleteLead, updateLeadStatus } from '@/app/actions/leads';

const STATUS_COLORS: Record<string, string> = {
  'NEW': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'CONTACTED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'CONVERTED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'DEAD': 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState(initialLeads);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    const res = await updateLeadStatus(id, newStatus);
    if (res.success) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }
    setIsUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setIsUpdating(id);
    const res = await deleteLead(id);
    if (res.success) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Leads & CRM
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your incoming inquiries and sales pipeline.
          </p>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search leads by name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" /> Filter Pipeline
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Lead Details</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Received</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No leads found.
                  </td>
                </tr>
              )}
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-white/[0.02] transition-colors group ${isUpdating === lead.id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" /> {lead.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{lead.company || '-'}</div>
                    {lead.phone && <div className="text-muted-foreground text-xs mt-1">{lead.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      disabled={isUpdating === lead.id}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border outline-none cursor-pointer appearance-none ${STATUS_COLORS[lead.status] || STATUS_COLORS['NEW']}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="DEAD">DEAD</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5" /> {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors">
                         <XCircle className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
