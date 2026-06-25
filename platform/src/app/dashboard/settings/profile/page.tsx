'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, ShieldAlert, CheckCircle2, User as UserIcon, Mail } from 'lucide-react';
import Image from 'next/image';

export default function SecurityProfile() {
  const { data: session, update } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setIs2FAEnabled((session.user as any).twoFactorEnabled === true);
    }
  }, [session]);

  const handleGenerate2FA = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
      const data = await res.json();
      if (data.qrCodeDataUrl) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setTwoFactorSecret(data.secret);
      } else {
        setFeedback('Failed to generate 2FA setup.');
      }
    } catch (error) {
      setFeedback('An error occurred.');
    }
    setLoading(false);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode, secret: twoFactorSecret })
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(true);
        setQrCodeUrl('');
        setTwoFactorSecret('');
        setVerifyCode('');
        setFeedback('2FA has been successfully enabled!');
        await update({ twoFactorEnabled: true });
      } else {
        setFeedback(data.error || 'Invalid verification code.');
      }
    } catch (error) {
      setFeedback('An error occurred.');
    }
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(false);
        setFeedback('2FA has been disabled.');
        await update({ twoFactorEnabled: false });
      }
    } catch (error) {
      setFeedback('An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6 md:p-10 text-slate-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile & Security</h1>
          <p className="text-slate-400">Manage your account settings and secure your profile.</p>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserIcon className="text-primary" /> Personal Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 mt-1">
                  <Mail size={16} className="text-slate-500" />
                  {session?.user?.email || 'Loading...'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                <div className="text-white font-medium bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 mt-1">
                  {(session?.user as any)?.role || 'USER'}
                </div>
              </div>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* 2FA Security Module */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Shield className="text-emerald-400" /> Two-Factor Authentication
            </h2>
            
            <div className="relative z-10 space-y-6">
              {is2FAEnabled ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-emerald-400 font-bold text-lg">2FA is Active</h3>
                    <p className="text-slate-400 text-sm mt-1">Your account is highly secure.</p>
                  </div>
                  <button 
                    onClick={handleDisable2FA}
                    disabled={loading}
                    className="px-6 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold rounded-lg transition-colors mt-4 text-sm"
                  >
                    Disable 2FA
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400/90 text-sm">
                    <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                    <p>Your account is vulnerable. Enable 2FA to require an authenticator code when logging in.</p>
                  </div>

                  {!qrCodeUrl ? (
                    <button 
                      onClick={handleGenerate2FA}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-colors"
                    >
                      {loading ? 'Generating...' : 'Setup Authenticator App'}
                    </button>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <p className="text-sm text-slate-300">1. Scan this QR Code with Google Authenticator or Authy:</p>
                      <div className="bg-white p-4 rounded-xl inline-block mx-auto border-4 border-slate-800">
                        <Image src={qrCodeUrl} alt="2FA QR Code" width={150} height={150} />
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-slate-300 mb-2">2. Enter the 6-digit code to verify:</p>
                        <form onSubmit={handleVerify2FA} className="flex gap-2">
                          <input 
                            type="text" 
                            maxLength={6}
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            required
                            placeholder="123456"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-center tracking-widest font-mono focus:border-emerald-500 focus:outline-none"
                          />
                          <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors"
                          >
                            Verify
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Password Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Key className="text-primary" /> Password Management
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await fetch('/api/auth/password', {
                  method: 'POST',
                  body: JSON.stringify({
                    currentPassword: (e.target as any).current.value,
                    newPassword: (e.target as any).newPass.value
                  })
                });
                const data = await res.json();
                setFeedback(data.success ? 'Password changed successfully!' : data.error);
                if (data.success) {
                  (e.target as HTMLFormElement).reset();
                }
              } catch {
                setFeedback('Failed to update password');
              }
              setLoading(false);
            }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Current Password</label>
                <input type="password" name="current" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">New Password</label>
                <input type="password" name="newPass" minLength={8} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white mt-1" />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors">
                Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-rose-500 mb-6 flex items-center gap-2">
              <AlertTriangle /> Danger Zone
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button 
              onClick={async () => {
                const conf = confirm('Are you absolutely sure you want to permanently delete your account?');
                if (conf) {
                  setLoading(true);
                  const res = await fetch('/api/auth/delete', { method: 'POST' });
                  if (res.ok) {
                    window.location.href = '/login';
                  } else {
                    setFeedback('Failed to delete account');
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors w-full"
            >
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
