'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Globe, Image as ImageIcon, 
  Settings, Save, LayoutTemplate, Link as LinkIcon, Search
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('global');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Content & Pages
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage global site settings, meta tags, and static content.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'global', label: 'Global Settings', icon: Globe },
            { id: 'seo', label: 'SEO & Meta Tags', icon: Search },
            { id: 'social', label: 'Social Links', icon: LinkIcon },
            { id: 'media', label: 'Media & Logos', icon: ImageIcon },
            { id: 'footer', label: 'Footer Content', icon: LayoutTemplate },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-black/20 text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <GlassCard className="p-8 min-h-[500px]">
            {activeTab === 'global' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Global Site Settings</h2>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Site Name</label>
                      <input 
                        type="text" 
                        defaultValue="DevFort Analytics"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Contact Email</label>
                      <input 
                        type="email" 
                        defaultValue="hello@devforge.dev"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Primary Tagline</label>
                      <textarea 
                        defaultValue="Transforming ideas into digital reality with AI and next-gen web technologies."
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">SEO & Meta Tags</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Default Meta Title</label>
                      <input 
                        type="text" 
                        defaultValue="DevFort Analytics | Enterprise Data Platform"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Default Meta Description</label>
                      <textarea 
                        defaultValue="Advanced AI-powered data analytics and BI platform for modern enterprises."
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Target Keywords (Comma separated)</label>
                      <input 
                        type="text" 
                        defaultValue="data analytics, business intelligence, ai tools, automl, saas"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Social Media Links</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Twitter / X URL</label>
                      <input 
                        type="url" 
                        defaultValue="https://twitter.com/devfort"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">LinkedIn URL</label>
                      <input 
                        type="url" 
                        defaultValue="https://linkedin.com/company/devfort"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">GitHub URL</label>
                      <input 
                        type="url" 
                        defaultValue="https://github.com/devfort"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Media & Logos</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Primary Logo URL</label>
                      <input 
                        type="text" 
                        defaultValue="/logo.png"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Favicon URL</label>
                      <input 
                        type="text" 
                        defaultValue="/favicon.ico"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Default Open Graph Image</label>
                      <input 
                        type="text" 
                        defaultValue="/og-image.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'footer' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Footer Content</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Copyright Text</label>
                      <input 
                        type="text" 
                        defaultValue="© 2026 DevFort Analytics. All rights reserved."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Footer Description</label>
                      <textarea 
                        defaultValue="DevFort provides world-class data analytics and BI dashboards for scaling enterprises."
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
