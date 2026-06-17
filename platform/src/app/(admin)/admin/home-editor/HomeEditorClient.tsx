'use client';

import { useState } from 'react';
import { updateHeroSetting } from '@/app/actions/homepage-cms';
import GlassCard from '@/components/ui/GlassCard';
import { LayoutDashboard, Save, Type, Image as ImageIcon } from 'lucide-react';

export default function HomeEditorClient({ initialHero }: { initialHero: any }) {
  const [heroForm, setHeroForm] = useState({
    badgeText: initialHero.badgeText,
    titlePrefix: initialHero.titlePrefix,
    typewriter: JSON.parse(initialHero.typewriter).join(', '),
    description: initialHero.description,
    cta1Text: initialHero.cta1Text,
    cta1Link: initialHero.cta1Link,
    cta2Text: initialHero.cta2Text,
    cta2Link: initialHero.cta2Link,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      // Convert comma string back to JSON array
      const twArray = heroForm.typewriter.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      await updateHeroSetting({
        ...heroForm,
        typewriter: JSON.stringify(twArray)
      });
      setMessage('Hero section updated successfully! Changes are live.');
    } catch (error) {
      setMessage('Failed to update. Please check logs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 bg-primary/20 border border-primary text-primary rounded-lg">
          {message}
        </div>
      )}

      {/* Hero Section Editor */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-6">
          <Type className="text-primary w-6 h-6" />
          <h2 className="text-xl font-bold">Hero Section (Top Panel)</h2>
        </div>
        
        <form onSubmit={handleHeroSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Badge Text (Top Pulse)</label>
              <input 
                type="text" 
                value={heroForm.badgeText}
                onChange={e => setHeroForm({...heroForm, badgeText: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Title Prefix (Before animation)</label>
              <input 
                type="text" 
                value={heroForm.titlePrefix}
                onChange={e => setHeroForm({...heroForm, titlePrefix: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Typewriter Words (Comma separated)</label>
              <input 
                type="text" 
                value={heroForm.typewriter}
                onChange={e => setHeroForm({...heroForm, typewriter: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm font-mono text-primary" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea 
                value={heroForm.description}
                onChange={e => setHeroForm({...heroForm, description: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm min-h-[100px]" 
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Primary CTA Button</label>
              <input 
                type="text" 
                value={heroForm.cta1Text}
                onChange={e => setHeroForm({...heroForm, cta1Text: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm mb-2" 
                placeholder="Text"
              />
              <input 
                type="text" 
                value={heroForm.cta1Link}
                onChange={e => setHeroForm({...heroForm, cta1Link: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" 
                placeholder="Link (/contact)"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Secondary CTA Button</label>
              <input 
                type="text" 
                value={heroForm.cta2Text}
                onChange={e => setHeroForm({...heroForm, cta2Text: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm mb-2" 
                placeholder="Text"
              />
              <input 
                type="text" 
                value={heroForm.cta2Link}
                onChange={e => setHeroForm({...heroForm, cta2Link: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" 
                placeholder="Link (/projects)"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        </form>
      </GlassCard>
      
      {/* Note for remaining items */}
      <GlassCard className="p-6 border-dashed border-2">
         <h3 className="text-lg font-bold mb-2 text-muted-foreground">Stats, Testimonials, & Timeline</h3>
         <p className="text-sm text-muted-foreground">
           These sections are synced with the database. Full CRUD UI for these arrays can be added here as needed.
         </p>
      </GlassCard>
    </div>
  );
}
