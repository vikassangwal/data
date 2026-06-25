'use client';

import { useState, useEffect } from 'react';
import { getSiteSettings, togglePublicReviews } from '@/app/actions/settings';
import { Settings, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggle = async () => {
    setLoading(true);
    await togglePublicReviews(settings?.showPublicReviews || false);
    await loadSettings();
  };

  if (loading) {
    return <div className="text-white p-8">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Settings className="text-primary" /> Site Settings
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">SEO & Metadata</h2>
        
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-lg">Public 5-Star Reviews (JSON-LD Schema)</h3>
            <p className="text-slate-400 text-sm mt-1">
              Toggle whether the 5-star aggregate rating schema is visible to Google Search. 
              Keep this ON if you want the star rating to show up in search results.
            </p>
          </div>
          
          <button 
            onClick={handleToggle}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all \${
              settings?.showPublicReviews 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50' 
                : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50'
            }\`}
          >
            {settings?.showPublicReviews ? <Eye size={20} /> : <EyeOff size={20} />}
            {settings?.showPublicReviews ? 'Public (Visible)' : 'Hidden'}
          </button>
        </div>
      </div>
    </div>
  );
}
