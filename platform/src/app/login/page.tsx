'use client';
 
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, GitBranch, Shield, Phone, Sparkles } from 'lucide-react';
import { loginUser, forgotPassword, recoverLoginId, verifyOtp, resetPassword } from '@/app/actions/auth';
 
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot-password' | 'forgot-id' | 'verify-otp' | 'reset-password'>('login');
  
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
      router.push('/lab'); // Redirect to Data Lab after login
      router.refresh();
    }
  }
 
  // Handle forgot password request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return setError('Email is required.');
    
    setLoading(true);
    setError('');
    setSuccess('');
 
    const result = await forgotPassword(recoveryEmail);
    setLoading(false);
 
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('A secure 6-digit verification code has been generated.');
      if (result.success) {
        setMode('verify-otp');
      } else { };
    }
  };
 
  // Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return setError('Verification code is required.');
    
    setLoading(true);
    setError('');
    setSuccess('');
 
    const result = await verifyOtp(recoveryEmail, otpCode);
    setLoading(false);
 
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Verification successful! Enter your new password below.');
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setMode('reset-password');
      }
    }
  };
 
  // Handle password reset execution
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return setError('New password is required.');
    
    setLoading(true);
    setError('');
    setSuccess('');
 
    const result = await resetPassword(resetToken, newPassword);
    setLoading(false);
 
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        setMode('login');
        setError('');
        setSuccess('');
        setRecoveryEmail('');
        setOtpCode('');
        setNewPassword('');
        setResetToken('');
      }, 2000);
    }
  };
 
  // Handle mobile login ID recovery request
  const handleRecoverId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryMobile) return setError('Mobile number is required.');
 
    setLoading(true);
    setError('');
    setSuccess('');
 
    const result = await recoverLoginId(recoveryMobile);
    setLoading(false);
 
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Account located successfully. Registered credentials:`);
      setError(result.maskedEmail || ''); // Display masked in warning/sub, or in success body
    }
  };
 
  // Mock social OAuth redirect callback
  const triggerMockOAuth = (provider: string) => {
    alert(`⚡ Mocking OAuth 2.0 "${provider}" redirect exchange callback...`);
    // Create random OAuth token and log in
    localStorage.setItem('saas_oauth_provider', provider);
    router.push('/lab');
  };

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
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'forgot-password' && 'Password Recovery'}
            {mode === 'forgot-id' && 'Retrieve Login ID'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' && 'Sign in to DevForge to continue'}
            {mode === 'forgot-password' && 'Enter your email to compile a secure reset token'}
            {mode === 'forgot-id' && 'Enter your registered mobile number to fetch your ID'}
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
          
          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center leading-relaxed">
              {success}
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
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <button 
                        onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); }} 
                        type="button" 
                        className="text-sm text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Forgot password?
                      </button>
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
                    className="w-full bg-gradient-to-r from-primary to-[#2563EB] hover:from-primary/90 hover:to-[#2563EB]/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 group disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : (
                      <>
                        Log In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
 
                <div className="mt-4 flex justify-center text-xs">
                  <button 
                    onClick={() => { setMode('forgot-id'); setError(''); setSuccess(''); }} 
                    type="button" 
                    className="text-muted-foreground hover:text-primary font-semibold transition-colors cursor-pointer bg-transparent border-0 p-0"
                  >
                    Forgot registered Email / Login ID?
                  </button>
                </div>
 
                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border select-none">
                  or
                </div>
 
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => triggerMockOAuth('Google')}
                    className="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground py-2.5 px-4 rounded-xl transition-all font-medium text-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Google
                  </button>
                  <button 
                    onClick={() => triggerMockOAuth('GitHub')}
                    className="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground py-2.5 px-4 rounded-xl transition-all font-medium text-xs cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4" />
                    GitHub
                  </button>
                </div>
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
            Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
