'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Briefcase, Building, ChevronRight } from 'lucide-react';

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profession, organization })
      });

      if (res.ok) {
        // Update local session
        await update({ profession });
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete onboarding');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 blur-[128px] rounded-full" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 blur-[128px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to DevFort</h1>
            <p className="text-slate-400 text-sm">Let's customize your experience. Tell us a bit about yourself.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Role / Profession</label>
              <div className="relative mt-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Briefcase size={18} />
                </div>
                <input 
                  type="text" 
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Software Engineer, Founder" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company / Organization</label>
              <div className="relative mt-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Building size={18} />
                </div>
                <input 
                  type="text" 
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Corp, Freelance" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-white transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {loading ? 'Saving...' : 'Enter Dashboard'} 
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
