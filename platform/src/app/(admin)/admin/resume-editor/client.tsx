'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Briefcase, GraduationCap, Award, 
  Trash2, Edit3, Save, Calendar, GripVertical, User, Upload
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  createResumeEntry, 
  deleteResumeEntry, 
  updateResumeEntry, 
  updateResumeProfile 
} from '@/app/actions/resume';
import ImageUploader from '@/components/ui/ImageUploader';

interface ResumeProfile {
  id: string;
  name: string;
  initials: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  cvUrl: string | null;
}

export default function ResumeEditorClient({ 
  initialEntries, 
  initialProfile 
}: { 
  initialEntries: any[];
  initialProfile: ResumeProfile;
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [entries, setEntries] = useState(initialEntries);
  const [profile, setProfile] = useState<ResumeProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleCreate = async () => {
    setIsSaving(true);
    const res = await createResumeEntry({
      type: activeTab,
      title: 'New Entry',
      organization: 'Company/University Name',
      startDate: '2023',
      endDate: 'Present',
      description: 'Description of role or achievements.',
      order: entries.filter(e => e.type === activeTab).length
    });

    if (res.success && res.data) {
      setEntries([...entries, res.data]);
    } else {
      alert('Failed to create entry');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    setIsSaving(true);
    const res = await deleteResumeEntry(id);
    if (res.success) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
    setIsSaving(false);
  };

  // Local state update for smooth typing
  const handleLocalUpdate = (id: string, updates: any) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  // Database update triggered onBlur to prevent lag/spam
  const handleDbUpdate = async (id: string, updates: any) => {
    setIsSaving(true);
    await updateResumeEntry(id, updates);
    setIsSaving(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateResumeProfile({
      name: profile.name,
      initials: profile.initials,
      title: profile.title,
      bio: profile.bio,
      photoUrl: profile.photoUrl,
      cvUrl: profile.cvUrl
    });

    if (res.success) {
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile: ' + res.error);
    }
    setIsSavingProfile(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Resume & CV CMS
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your professional profile, timeline, and academic history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Resume Profile', icon: User },
            { id: 'experience', label: 'Work Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'certification', label: 'Awards & Certs', icon: Award },
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
          {activeTab === 'profile' ? (
            <GlassCard className="p-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white">Resume Profile Settings</h2>
                {isSavingProfile && <span className="text-xs text-muted-foreground animate-pulse">Saving profile...</span>}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Initials (For Placeholder Avatar)</label>
                    <input 
                      type="text" 
                      value={profile.initials} 
                      onChange={(e) => setProfile({...profile, initials: e.target.value})}
                      maxLength={2}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Title</label>
                  <input 
                    type="text" 
                    value={profile.title} 
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Professional Bio</label>
                  <textarea 
                    value={profile.bio} 
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    rows={4}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Profile Photo</label>
                    <ImageUploader 
                      value={profile.photoUrl || ''} 
                      onChange={(url) => setProfile({...profile, photoUrl: url})} 
                      label="Upload Photo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">CV / Resume Document (PDF)</label>
                    <ImageUploader 
                      value={profile.cvUrl || ''} 
                      onChange={(url) => setProfile({...profile, cvUrl: url})} 
                      label="Upload CV Document"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white capitalize">{activeTab} Timeline</h2>
                <button 
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors border border-white/10"
                >
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              </div>

              <div className="space-y-4">
                {entries.filter(item => item.type === activeTab).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex gap-4 p-4 bg-black/40 border border-white/5 hover:border-primary/50 rounded-xl transition-all"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-full space-y-2 mr-4">
                          <input 
                            type="text" 
                            value={item.title} 
                            onChange={(e) => handleLocalUpdate(item.id, { title: e.target.value })}
                            onBlur={(e) => handleDbUpdate(item.id, { title: e.target.value })}
                            placeholder="Title (e.g. Lead Analyst)"
                            className="font-bold text-white text-lg w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none transition-colors"
                          />
                          <input 
                            type="text" 
                            value={item.organization} 
                            onChange={(e) => handleLocalUpdate(item.id, { organization: e.target.value })}
                            onBlur={(e) => handleDbUpdate(item.id, { organization: e.target.value })}
                            placeholder="Organization (e.g. Google / Stanford)"
                            className="text-primary font-medium text-sm w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <input 
                          type="text" 
                          value={item.startDate} 
                          onChange={(e) => handleLocalUpdate(item.id, { startDate: e.target.value })}
                          onBlur={(e) => handleDbUpdate(item.id, { startDate: e.target.value })}
                          placeholder="Start (e.g. 2018)"
                          className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none transition-colors w-24"
                        />
                        <span>-</span>
                        <input 
                          type="text" 
                          value={item.endDate || ''} 
                          onChange={(e) => handleLocalUpdate(item.id, { endDate: e.target.value })}
                          onBlur={(e) => handleDbUpdate(item.id, { endDate: e.target.value })}
                          placeholder="End (e.g. Present)"
                          className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none transition-colors w-32"
                        />
                      </div>
                      
                      <textarea 
                        value={item.description}
                        onChange={(e) => handleLocalUpdate(item.id, { description: e.target.value })}
                        onBlur={(e) => handleDbUpdate(item.id, { description: e.target.value })}
                        placeholder="Describe details, key achievements, or metrics..."
                        className="text-sm text-white/70 mt-2 w-full bg-transparent border border-transparent hover:border-white/20 focus:border-primary outline-none transition-colors rounded resize-y min-h-[60px] p-1"
                      />
                    </div>
                  </motion.div>
                ))}
                
                {entries.filter(item => item.type === activeTab).length === 0 && (
                  <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl text-muted-foreground">
                    No entries found for {activeTab}. Click "Add Entry" to create one.
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
