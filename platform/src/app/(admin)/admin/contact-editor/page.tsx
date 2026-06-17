'use client';

import { useState, useEffect } from 'react';
import { getContactSettings, updateContactSettings } from '@/app/actions/cms-editors';
import { Save, Mail, Phone, MapPin, Globe } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function ContactEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getContactSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await updateContactSettings(settings.id, {
      title: settings.title,
      description: settings.description,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      mapUrl: settings.mapUrl,
      socialLinks: settings.socialLinks
    });
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-white">Loading Editor...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Contact Page Editor
          </h1>
          <p className="text-muted-foreground mt-1">Manage contact information, map, and social links.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Header Details</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Page Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={e => setSettings({...settings, title: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Description</label>
            <textarea
              value={settings.description || ''}
              onChange={e => setSettings({...settings, description: e.target.value})}
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none resize-none"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Contact Info</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Primary Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({...settings, email: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={settings.phone || ''}
                onChange={e => setSettings({...settings, phone: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <textarea
                value={settings.address || ''}
                onChange={e => setSettings({...settings, address: e.target.value})}
                rows={2}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary transition-all outline-none resize-none"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/10 space-y-4 lg:col-span-2">
          <h3 className="text-lg font-bold text-white">Google Maps Embed URL</h3>
          <div className="space-y-2">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={settings.mapUrl || ''}
                onChange={e => setSettings({...settings, mapUrl: e.target.value})}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary transition-all outline-none"
              />
            </div>
            <p className="text-xs text-white/40">Paste the URL from the `src` attribute of a Google Maps embed code.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
