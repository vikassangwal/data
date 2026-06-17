'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ParticleCanvas from '@/components/vfx/ParticleCanvas';
import { 
  User, Shield, Mail, Key, Globe, LogOut, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert, Link as LinkIcon, Unlink, Save, Edit3, AtSign, Calendar, MapPin
} from 'lucide-react';
import { getLinkedStatus, linkGoogleAccount, unlinkGoogleAccount, updatePersonalDetails } from '@/app/actions/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Local state
  const [profileData, setProfileData] = useState<{
    hasGoogle: boolean;
    hasPassword: boolean;
    email?: string;
    name?: string;
    role?: string;
    username?: string;
    mobile?: string;
    dateOfBirth?: string;
    gender?: string;
    country?: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  
  // Simulated Google inputs
  const [simGoogleEmail, setSimGoogleEmail] = useState('');
  const [simGoogleId, setSimGoogleId] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    country: ''
  });

  // Fetch status on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchLinkedStatus();
    }
  }, [status]);

  const fetchLinkedStatus = async () => {
    setLoading(true);
    const res = await getLinkedStatus();
    if (res.success) {
      setProfileData({
        hasGoogle: res.hasGoogle || false,
        hasPassword: res.hasPassword || false,
        email: res.email || undefined,
        name: res.name || undefined,
        role: res.role || undefined,
        username: res.username || undefined,
        mobile: res.mobile || undefined,
        dateOfBirth: res.dateOfBirth || undefined,
        gender: res.gender || undefined,
        country: res.country || undefined
      });

      setProfileForm({
        name: res.name || '',
        username: res.username || '',
        mobile: res.mobile || '',
        dateOfBirth: res.dateOfBirth ? new Date(res.dateOfBirth).toISOString().split('T')[0] : '',
        gender: res.gender || '',
        country: res.country || ''
      });

      // pre-fill simulation inputs
      if (res.email) {
        setSimGoogleEmail(res.email.replace('@', '_google@'));
      }
      setSimGoogleId(`google_${Math.floor(100000000 + Math.random() * 900000000)}`);
    } else {
      setMessage({ text: res.error || 'Failed to retrieve profile details.', type: 'error' });
    }
    setLoading(false);
  };

  const handleLinkGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simGoogleId || !simGoogleEmail) {
      setMessage({ text: 'Simulated Google ID and Email are required.', type: 'error' });
      return;
    }
    
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await linkGoogleAccount(simGoogleId, simGoogleEmail);
      if (res.success) {
        setMessage({ text: res.message || 'Successfully linked Google Account!', type: 'success' });
        setShowSimModal(false);
        await fetchLinkedStatus();
      } else {
        setMessage({ text: res.error || 'Link operation failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google Account?')) return;
    
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await unlinkGoogleAccount();
      if (res.success) {
        setMessage({ text: res.message || 'Successfully unlinked Google Account!', type: 'success' });
        await fetchLinkedStatus();
      } else {
        setMessage({ text: res.error || 'Unlink operation failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updatePersonalDetails(formData);
      if (res.success) {
        setMessage({ text: res.message || 'Personal details updated!', type: 'success' });
        setIsEditingProfile(false);
        await fetchLinkedStatus();
        update(); // Force session update
      } else {
        setMessage({ text: res.error || 'Failed to update personal details.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-[var(--bg-primary)]">
        <ParticleCanvas />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm font-medium">Loading security workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 relative bg-[var(--bg-primary)]">
      <ParticleCanvas />
      
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      
      <Container className="relative z-10 pt-28">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-[var(--glass-border)]">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse-glow blur-sm" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {session?.user?.name || 'User Profile'}
                </h1>
                <Badge variant={session?.user?.role === 'SUPER-ADMIN' ? 'success' : 'primary'}>
                  {session?.user?.role || 'USER'}
                </Badge>
              </div>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-2 justify-center md:justify-start">
                <AtSign className="w-4 h-4" />
                {profileData?.username || 'No username set'}
              </p>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                {session?.user?.email}
              </p>
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl flex items-start gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Column 1: Personal Details & Security */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Personal Details Panel */}
              <GlassCard glow>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-[var(--text-primary)]">
                    <User className="w-5 h-5 text-primary" />
                    Personal Details
                  </h2>
                  {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Full Name</label>
                        <input 
                          type="text"
                          name="name"
                          required
                          value={profileForm.name}
                          onChange={handleProfileFormChange}
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Username</label>
                        <input 
                          type="text"
                          name="username"
                          required
                          value={profileForm.username}
                          onChange={handleProfileFormChange}
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Mobile Number</label>
                        <input 
                          type="tel"
                          name="mobile"
                          value={profileForm.mobile}
                          onChange={handleProfileFormChange}
                          placeholder="+1234567890"
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Date of Birth</label>
                        <input 
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileFormChange}
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Gender</label>
                        <select 
                          name="gender"
                          value={profileForm.gender}
                          onChange={handleProfileFormChange}
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-muted)] font-semibold block">Country</label>
                        <input 
                          type="text"
                          name="country"
                          value={profileForm.country}
                          onChange={handleProfileFormChange}
                          placeholder="United States"
                          className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)] mt-4">
                      <Button variant="outline" size="sm" type="button" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Full Name</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{profileData?.name || '-'}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Username</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{profileData?.username || '-'}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Mobile</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{profileData?.mobile || '-'}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Date of Birth</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Gender</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{profileData?.gender || '-'}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                      <span className="text-xs text-[var(--text-muted)] block mb-1">Country</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {profileData?.country || '-'}
                      </span>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Account Linking Panel */}
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-[var(--text-primary)]">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    Account Integration
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">OAuth Linking v2.0</span>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-[var(--text-muted)]">
                    Link your credentials account with external Identity Providers. Linked accounts allow seamless sign-in with Google OAuth.
                  </p>

                  <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.24.6 4.45 1.64l2.455-2.455C17.34 1.59 14.97 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.24-4.11 10.24-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">Google Identity Link</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {profileData?.hasGoogle ? 'Linked and verified' : 'Not linked'}
                        </div>
                      </div>
                    </div>

                    {profileData?.hasGoogle ? (
                      <button
                        onClick={handleUnlinkGoogle}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSimModal(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-primary to-[#2563EB] text-white hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Link Google
                      </button>
                    )}
                  </div>

                  {!profileData?.hasPassword && (
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-amber-400">Security Requirement</div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          Your profile is exclusively managed via Google OAuth. To unlink Google, you must set an account password first.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

            </div>

            {/* Column 2: Subscription Limits & Features */}
            <div className="space-y-6">
              <GlassCard glow className="gradient-border border-primary/20">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="primary" className="mb-2">Subscription Tier</Badge>
                      <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">
                        {session?.user?.planId || 'Trial Plan'}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">Active</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Monthly Data Rows limit</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {session?.user?.planId === 'enterprise' ? 'Unlimited' : session?.user?.planId === 'pro' ? '100,000' : '10,000'}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--muted)] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: session?.user?.planId === 'enterprise' ? '100%' : session?.user?.planId === 'pro' ? '45%' : '12%' }} 
                      />
                    </div>

                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>RAG Chatbot Inquiries</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {session?.user?.planId === 'enterprise' ? 'Unlimited' : session?.user?.planId === 'pro' ? '500 / mo' : '50 / mo'}
                      </span>
                    </div>
                  </div>

                  {session?.user?.planId === 'trial' && (
                    <Button 
                      variant="primary" 
                      className="w-full flex items-center justify-center gap-2 mt-4"
                      onClick={() => router.push('/pricing')}
                    >
                      Upgrade Plan
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </GlassCard>

              {/* Additional Account Information */}
              <GlassCard>
                <h2 className="text-lg font-bold flex items-center gap-2.5 text-[var(--text-primary)] mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  Account Security
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                    <span className="text-xs text-[var(--text-muted)]">Assigned Role</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {profileData?.role || 'USER'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/30">
                    <span className="text-xs text-[var(--text-muted)]">Account Email</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {profileData?.email || session?.user?.email}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Container>

      {/* Simulated OAuth linking modal */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSimModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[var(--card)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.24.6 4.45 1.64l2.455-2.455C17.34 1.59 14.97 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.24-4.11 10.24-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Simulate Google OAuth</h3>
                  <p className="text-xs text-[var(--text-muted)]">OAuth connection verification layer</p>
                </div>
              </div>

              <form onSubmit={handleLinkGoogle} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)] font-semibold block">Google Account ID (Simulated)</label>
                  <input 
                    type="text"
                    required
                    value={simGoogleId}
                    onChange={(e) => setSimGoogleId(e.target.value)}
                    className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)] font-semibold block">Google Account Email (Simulated)</label>
                  <input 
                    type="email"
                    required
                    value={simGoogleEmail}
                    onChange={(e) => setSimGoogleEmail(e.target.value)}
                    className="w-full bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50"
                  />
                </div>

                <div className="p-3 bg-[var(--muted)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--text-muted)] leading-relaxed">
                  In a production environment, this triggers a redirect to Google accounts server. To test locally, click below to link the simulated credentials dynamically.
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowSimModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Connecting...' : 'Link Credentials'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
