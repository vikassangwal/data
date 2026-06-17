'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Plus, Search, Filter,
  Edit3, Trash2, CheckCircle2, XCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { deleteService, createService, toggleServiceStatus } from '@/app/actions/services';

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState(initialServices);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    setIsDeleting(id);
    const res = await deleteService(id);
    if (res.success) {
      setServices(prev => prev.filter(s => s.id !== id));
    } else {
      alert('Failed to delete service: ' + res.error);
    }
    setIsDeleting(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleServiceStatus(id, !currentStatus);
    if (res.success) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createService(formData);
    
    if (res.success && res.data) {
      setServices([res.data, ...services]);
      setShowModal(false);
      (e.target as HTMLFormElement).reset();
    } else {
      alert('Failed to create service: ' + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Services Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your service offerings, pricing, and availability.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      <GlassCard className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Service Name</th>
                <th className="px-6 py-4 font-medium">Base Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Bookings</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No services found. Add your first service!
                  </td>
                </tr>
              )}
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">
                    {service.title}
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-mono">
                    {service.pricing?.basePrice ? `$${service.pricing.basePrice}` : 'Custom'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(service.id, service.isActive)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {service.isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={service.isActive ? 'text-emerald-500' : 'text-red-500'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    0
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/10 rounded-md text-white transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        disabled={isDeleting === service.id}
                        className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors disabled:opacity-50" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Add New Service</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Title</label>
                <input required name="title" type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required name="description" rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon Name (Lucide)</label>
                <input name="icon" type="text" placeholder="e.g. Briefcase, Code, Database" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
