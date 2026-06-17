'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, GitBranch, Check, KeyRound, AtSign } from 'lucide-react';
import { registerUser, verifySignupOtp } from '@/app/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [password, setPassword] = useState('');
  
  // New States for OTP Flow
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };
  const strengthScore = Object.values(reqs).filter(Boolean).length;
  const strengthText = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get('email') as string;
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.otpSent) {
      setRegisteredEmail(emailStr);
      setOtpSentMsg('A verification code has been sent to your email.');
      setStep('otp');
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const otpCode = formData.get('otp') as string;
    
    const result = await verifySignupOtp(registeredEmail, otpCode);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/login?registered=true');
    }
  }

  const openTermsPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTerms(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden bg-[#03060f]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

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
            {step === 'details' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'details' ? 'Join DevForge to access premium AI tools' : `We sent a 6-digit code to ${registeredEmail}`}
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl overflow-hidden relative">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          {step === 'otp' && otpSentMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center animate-in fade-in zoom-in duration-200">
              {otpSentMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.form 
                key="details"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleDetailsSubmit} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground ml-1">Unique Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      name="username"
                      required
                      placeholder="johndoe123"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

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
                  <label className="text-sm font-medium text-foreground ml-1">Mobile Number (Optional)</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      name="mobile"
                      placeholder="+1234567890"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-2 p-3 bg-background border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Password Strength:</span>
                        <span className={`${strengthColors[strengthScore].replace('bg-', 'text-')}`}>{strengthText}</span>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} className={`flex-1 rounded-full ${level <= strengthScore ? strengthColors[strengthScore] : 'bg-slate-800'}`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                        <div className={`flex items-center gap-1.5 ${reqs.length ? 'text-emerald-400' : ''}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${reqs.length ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-slate-700'}`}>
                            {reqs.length && <Check size={8} />}
                          </div>
                          8+ characters
                        </div>
                        <div className={`flex items-center gap-1.5 ${reqs.upper ? 'text-emerald-400' : ''}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${reqs.upper ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-slate-700'}`}>
                            {reqs.upper && <Check size={8} />}
                          </div>
                          Uppercase
                        </div>
                        <div className={`flex items-center gap-1.5 ${reqs.lower ? 'text-emerald-400' : ''}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${reqs.lower ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-slate-700'}`}>
                            {reqs.lower && <Check size={8} />}
                          </div>
                          Lowercase
                        </div>
                        <div className={`flex items-center gap-1.5 ${reqs.number ? 'text-emerald-400' : ''}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${reqs.number ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-slate-700'}`}>
                            {reqs.number && <Check size={8} />}
                          </div>
                          Number
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-2 select-none">
                  <input 
                    type="checkbox" 
                    name="termsAccepted"
                    id="termsAccepted"
                    value="true"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="mt-1 w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="termsAccepted" className="text-xs text-muted-foreground cursor-pointer leading-normal">
                    I agree to the <span onClick={openTermsPopup} className="text-primary font-bold hover:underline">Terms & Conditions</span>
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !termsChecked || strengthScore < 4}
                  className="w-full bg-gradient-to-r from-primary to-[#2563EB] hover:from-primary/90 hover:to-[#2563EB]/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 group disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating Account...' : (
                    <>
                      Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                  or
                </div>

                <button type="button" className="mt-6 w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground py-3 px-4 rounded-xl transition-all font-medium cursor-pointer">
                  <GitBranch className="w-5 h-5" />
                  Continue with GitHub
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground ml-1">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      name="otp"
                      required
                      maxLength={6}
                      placeholder="123456"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.5em] text-lg font-bold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify Email & Create Account'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 block"
                >
                  ← Back to Details
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-muted-foreground font-sans">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </motion.div>

      {/* Legal Terms & Conditions Disclaimer Modal Overlay */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md shadow-2xl text-left relative z-[100] animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2 font-sans">Terms & Conditions</h3>
            <div className="max-h-60 overflow-y-auto bg-background/50 p-4 border border-border rounded-xl text-xs text-muted-foreground leading-relaxed mb-4">
              <p className="mb-2"><strong>DevForge High-Security Platform Agreement:</strong></p>
              <p className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold rounded-lg mb-2 leading-normal font-sans">
                High-Security & Technical Glitches: We utilize high-security systems. However, we hold no legal liability for any incorrect data analysis, faulty reports, or business losses caused by server downtime, technical glitches, or software bugs. Users must verify critical outcomes independently.
              </p>
              <p>Please double-check all metrics, averages, totals, and compilations before presenting slides or documents to stakeholders.</p>
            </div>
            <button 
              onClick={() => {
                setShowTerms(false);
                setTermsChecked(true);
              }}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
