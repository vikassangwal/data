'use client';
 
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, GitBranch, Shield, Phone, Sparkles } from 'lucide-react';
import { loginUser } from '@/app/actions/auth';
 
export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot-password' | 'verify-otp' | 'reset-password' | 'forgot-id'>('login');
  
  // Recovery form states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMobile, setRecoveryMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
 
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
 
    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);
 
    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin'); // Redirect to Admin Portal after login
      router.refresh();
    }
  }
 
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSimulatedOtp('123456');
      setSuccess('OTP sent successfully.');
      setMode('verify-otp');
      setLoading(false);
    }, 1000);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (otpCode === '123456' || otpCode === simulatedOtp) {
        setResetToken('tok_' + Math.random().toString(36).substr(2, 9));
        setSuccess('OTP verified successfully.');
        setMode('reset-password');
      } else {
        setError('Invalid OTP code.');
      }
      setLoading(false);
    }, 1000);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess('Password reset successfully.');
      setMode('login');
      setLoading(false);
    }, 1000);
  }

  async function handleRecoverId(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess('Login ID recovery instructions sent.');
      setMode('login');
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden bg-[#03060f]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-2xl tracking-tighter">DF</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-amber-500">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Restricted Access. Authorized personnel only.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
          
          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center leading-relaxed">
              <strong>{success}</strong>
              {simulatedOtp && (
                <div className="mt-2 p-2 bg-slate-950/50 border border-white/5 rounded text-xs select-all break-all font-mono font-bold text-yellow-400">
                  OTP Code: {simulatedOtp}
                </div>
              )}
              {resetToken && (
                <div className="mt-2 p-2 bg-slate-950/50 border border-white/5 rounded text-[10px] select-all break-all font-mono text-slate-400">
                  Verification Token: {resetToken}
                </div>
              )}
            </div>
          )}
 
          {/* Error Banner */}
          {error && !success && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
 
          <AnimatePresence mode="wait">
            
            {/* 1. SIGN IN CORE VIEW */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
 
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-medium text-foreground">Admin Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="password" 
                        name="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 mt-6 group disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : (
                      <>
                        Secure Log In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
 
            {/* 2. FORGOT PASSWORD VIEW */}
            {mode === 'forgot-password' && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="email" 
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Send OTP Code'}
                  </button>
 
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="w-full bg-transparent border border-dashed border-border text-muted-foreground hover:text-white py-2.5 rounded-xl text-xs transition-all font-semibold cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              </motion.div>
            )}
 
            {/* 2.5 OTP VERIFICATION VIEW */}
            {mode === 'verify-otp' && (
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Enter 6-Digit Verification Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        placeholder="123456"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all tracking-widest text-center font-bold text-lg"
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP Code'}
                  </button>
 
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); setOtpCode(''); }}
                    className="w-full bg-transparent border border-dashed border-border text-muted-foreground hover:text-white py-2.5 rounded-xl text-xs transition-all font-semibold cursor-pointer"
                  >
                    Resend Code
                  </button>
                </form>
              </motion.div>
            )}
 
            {/* 2.6 NEW PASSWORD RESET VIEW */}
            {mode === 'reset-password' && (
              <motion.div
                key="reset-password"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Enter New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password & Login'}
                  </button>
                </form>
              </motion.div>
            )}
 
            {/* 3. FORGOT LOGIN ID (MOBILE MATCH) VIEW */}
            {mode === 'forgot-id' && (
              <motion.div
                key="forgot-id"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleRecoverId} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Registered Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="tel" 
                        value={recoveryMobile}
                        onChange={(e) => setRecoveryMobile(e.target.value)}
                        required
                        placeholder="+1234567890"
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                  >
                    {loading ? 'Searching record...' : 'Recover Login ID'}
                  </button>
 
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="w-full bg-transparent border border-dashed border-border text-muted-foreground hover:text-white py-2.5 rounded-xl text-xs transition-all font-semibold cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline font-medium">Return to Homepage</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
