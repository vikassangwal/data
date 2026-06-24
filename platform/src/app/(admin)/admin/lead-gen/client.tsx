'use client';

import { useState } from 'react';
import { Globe, Search, Mail, Play, CheckCircle2, AlertCircle, Bot, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Provider = { id: string; providerName: string };
type Audit = { id: string; url: string; status: string; seoReport: string | null; createdAt: Date };

export default function LeadGenClient({ 
  providers, 
  recentAudits 
}: { 
  providers: Provider[], 
  recentAudits: any[] 
}) {
  const [url, setUrl] = useState('');
  const [auditModel, setAuditModel] = useState('gpt-4o-mini');
  const [emailModel, setEmailModel] = useState('gpt-4o');
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<any>(null);
  
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string, targetEmail: string} | null>(null);

  const availableModels = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
    { id: 'gpt-4o', name: 'GPT-4o (Smart)' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (OpenRouter)' },
  ];

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return toast.error('Please enter a target URL');
    if (!url.startsWith('http')) return toast.error('URL must start with http:// or https://');

    setIsAuditing(true);
    setCurrentAudit(null);
    setGeneratedEmail(null);

    try {
      const res = await fetch('/api/lead-gen/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, model: auditModel })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to run audit');
      
      toast.success('Audit completed successfully!');
      setCurrentAudit(data.audit);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!currentAudit || !currentAudit.id) return;
    setIsGeneratingEmail(true);

    try {
      const res = await fetch('/api/lead-gen/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          auditId: currentAudit.id, 
          model: emailModel,
          report: currentAudit.seoReport 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate email');
      
      toast.success('Outreach email drafted!');
      setGeneratedEmail({
        subject: data.email.subject,
        body: data.email.body,
        targetEmail: data.email.targetEmail || 'contact@example.com'
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedEmail || !currentAudit) return;
    
    try {
      toast.loading('Sending email...', { id: 'send-email' });
      const res = await fetch('/api/lead-gen/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetEmail: generatedEmail.targetEmail,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          auditId: currentAudit.id
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      
      toast.success('Email sent successfully!', { id: 'send-email' });
    } catch (err: any) {
      toast.error(err.message, { id: 'send-email' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-500" />
            Automated Lead Gen & SEO Audit
          </h1>
          <p className="text-white/60 text-sm mt-1">Crawl sites, find flaws, and send AI-written pitches automatically.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Search className="w-32 h-32" />
            </div>
            
            <form onSubmit={handleRunAudit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Target Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-white/40" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Audit AI Model</label>
                  <select 
                    value={auditModel} 
                    onChange={(e) => setAuditModel(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white/80"
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Copywriter Model</label>
                  <select 
                    value={emailModel} 
                    onChange={(e) => setEmailModel(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white/80"
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isAuditing}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuditing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Crawling & Auditing...</>
                ) : (
                  <><Play className="w-5 h-5 fill-current" /> Start Deep Audit</>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Recent Audits
            </h3>
            {recentAudits.length === 0 ? (
              <p className="text-xs text-white/40 italic">No audits generated yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAudits.map(audit => (
                  <div key={audit.id} className="p-3 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between group hover:bg-black/50 transition-colors cursor-pointer" onClick={() => setCurrentAudit(audit)}>
                    <div className="truncate pr-4">
                      <p className="text-sm text-emerald-400 font-medium truncate">{audit.url}</p>
                      <p className="text-[10px] text-white/40 mt-1">{new Date(audit.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full uppercase">
                        {audit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {!currentAudit && !isAuditing ? (
            <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-black/20">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-white/80">Ready to Audit</h3>
              <p className="text-sm text-white/40 mt-2 max-w-sm">
                Enter a URL on the left to start scraping. The AI will analyze the site for SEO gaps, technical flaws, and generate a pitch.
              </p>
            </div>
          ) : (
            <>
              {/* Audit Report Viewer */}
              {currentAudit && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Audit Complete
                    </h2>
                    <span className="text-xs text-white/50">{currentAudit.url}</span>
                  </div>

                  <div className="prose prose-sm prose-invert max-w-none max-h-[400px] overflow-y-auto custom-scrollbar bg-black/40 p-4 rounded-xl border border-white/5">
                    {currentAudit.seoReport ? (
                      <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap">
                        {typeof currentAudit.seoReport === 'string' 
                          ? (currentAudit.seoReport.startsWith('{') ? JSON.stringify(JSON.parse(currentAudit.seoReport), null, 2) : currentAudit.seoReport)
                          : JSON.stringify(currentAudit.seoReport, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-center text-white/40 py-10">No report data generated yet or parsing failed.</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={handleGenerateEmail}
                      disabled={isGeneratingEmail}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingEmail ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Drafting Email...</>
                      ) : (
                        <><Mail className="w-4 h-4" /> AI Generate Pitch Email</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Email Drafter */}
              {generatedEmail && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  
                  <h3 className="text-md font-semibold text-white/90 flex items-center gap-2 mb-6">
                    <Mail className="w-5 h-5 text-emerald-400" /> Drafted Outreach Email
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-white/40 uppercase mb-1">To</label>
                      <input 
                        type="email" 
                        value={generatedEmail.targetEmail}
                        onChange={(e) => setGeneratedEmail({...generatedEmail, targetEmail: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 text-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-white/40 uppercase mb-1">Subject</label>
                      <input 
                        type="text" 
                        value={generatedEmail.subject}
                        onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 text-white/90 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-white/40 uppercase mb-1">Body</label>
                      <textarea 
                        value={generatedEmail.body}
                        onChange={(e) => setGeneratedEmail({...generatedEmail, body: e.target.value})}
                        rows={8}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-3 text-sm focus:outline-none focus:border-emerald-500 text-white/80 custom-scrollbar resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleSendEmail}
                        className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Send Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
