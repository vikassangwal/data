'use client';

import { useState, useEffect } from 'react';
import { getAboutSettings, updateAboutSettings } from '@/app/actions/cms-editors';
import { Save, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ImageUploader from '@/components/ui/ImageUploader';

export default function AboutEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getAboutSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await updateAboutSettings(settings.id, {
      title: settings.title,
      subtitle: settings.subtitle,
      content: settings.content,
      mission: settings.mission,
      vision: settings.vision,
      imageUrl: settings.imageUrl
    });
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-white">Loading Editor...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-primary" />
            About Page Editor
          </h1>
          <p className="text-muted-foreground mt-1">Manage the content and media of your About section.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Main Content</h3>
            
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
              <label className="text-sm font-medium text-white/70">Subtitle</label>
              <input
                type="text"
                value={settings.subtitle || ''}
                onChange={e => setSettings({...settings, subtitle: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Body Content (Markdown Supported)</label>
              <textarea
                value={settings.content}
                onChange={e => setSettings({...settings, content: e.target.value})}
                rows={8}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none resize-none font-mono text-sm"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6 border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Mission & Vision</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Our Mission</label>
                <textarea
                  value={settings.mission || ''}
                  onChange={e => setSettings({...settings, mission: e.target.value})}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Our Vision</label>
                <textarea
                  value={settings.vision || ''}
                  onChange={e => setSettings({...settings, vision: e.target.value})}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-all outline-none resize-none"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Featured Media</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Hero Image URL</label>
                <div className="relative">
                  <ImageUploader 
                    value={settings.imageUrl || ''} 
                    onChange={(url) => setSettings({...settings, imageUrl: url})} 
                    label="Upload Hero Image" 
                  />
                </div>
              
              {settings.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                  <img src={settings.imageUrl} alt="About Featured" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
