'use client';

import { useState, useEffect } from 'react';
import { Shield, User, Clock, Check, X } from 'lucide-react';
import Image from 'next/image';
import ImageUploader from '@/components/ui/ImageUploader';

export default function ProfileClient() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Email Change State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success) {
        // Format date string for input type="date"
        if (data.user.dateOfBirth) {
          data.user.dateOfBirth = new Date(data.user.dateOfBirth).toISOString().split('T')[0];
        }
        setProfile(data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };



  const handleRequestOtp = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/profile/email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP has been sent to your email!');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      alert('An error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setEmailLoading(true);
    try {
      const res = await fetch('/api/profile/email-change', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Email updated successfully!');
        setProfile({ ...profile, email: newEmail });
        setIsEmailModalOpen(false);
        setOtpSent(false);
        setOtp('');
        setNewEmail('');
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) {
      alert('An error occurred.');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20 text-red-400">Failed to load profile.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Stats & Photo */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4 group flex flex-col items-center gap-2">
            <div className="w-full h-full rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <Image src={profile.image} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-600" />
              )}
            </div>
            
            <div className="mt-2">
              <ImageUploader 
                value={profile.image || ''}
                onChange={(url) => setProfile({ ...profile, image: url })}
                label="Change Photo"
              />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white">{profile.name}</h2>
          <p className="text-sm text-slate-400 mb-4">{profile.email}</p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 uppercase">
              {profile.planId} Plan
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 uppercase">
              {profile.role}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-4 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock size={16} /> Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Shield size={16} /> Active Status: Secure
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Edit Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
          
          {error && <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Username *</label>
              <input required type="text" value={profile.username || ''} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Full Name *</label>
              <input required type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Email Address *</label>
              <div className="flex gap-4">
                <input required disabled type="email" value={profile.email || ''} className="flex-1 bg-slate-950 border border-slate-800/50 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed" />
                <button type="button" onClick={() => setIsEmailModalOpen(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors border border-slate-700">Change Email</button>
              </div>
              <p className="text-xs text-slate-500 mt-2">To change your email address, an OTP verification is required.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Mobile Number</label>
              <input type="tel" value={profile.mobile || ''} onChange={e => setProfile({...profile, mobile: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Date of Birth</label>
              <input type="date" value={profile.dateOfBirth || ''} onChange={e => setProfile({...profile, dateOfBirth: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Gender</label>
              <select value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Profession</label>
              <input type="text" value={profile.profession || ''} onChange={e => setProfile({...profile, profession: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Organization / Company</label>
              <input type="text" value={profile.organization || ''} onChange={e => setProfile({...profile, organization: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Country</label>
              <input type="text" value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">State</label>
              <input type="text" value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">City</label>
              <input type="text" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Bio</label>
            <textarea 
              rows={4} 
              value={profile.bio || ''} 
              onChange={e => setProfile({...profile, bio: e.target.value})} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Tell us a little about yourself..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {saving ? 'Saving...' : <><Check size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Email Change OTP Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => { setIsEmailModalOpen(false); setOtpSent(false); }} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Change Email Address</h3>
            
            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">New Email</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary" placeholder="hello@example.com" />
                </div>
                <button onClick={handleRequestOtp} disabled={emailLoading} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {emailLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                  <p className="text-sm text-slate-400 mb-6 text-center">
                    An OTP has been sent to <strong>{newEmail}</strong>.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Enter 6-digit OTP</label>
                  <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary text-center tracking-[1em] font-mono text-xl" />
                </div>
                <button onClick={handleVerifyOtp} disabled={emailLoading} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {emailLoading ? 'Verifying...' : 'Verify & Change Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
