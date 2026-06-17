'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import RadarPulse from '@/components/vfx/RadarPulse';
import { createLead } from '@/app/actions/leads';

const services = [
  'Data Analytics', 'Dashboard Development', 'Business Intelligence',
  'AI Agent Services', 'AI Chatbots', 'WhatsApp Automation',
  'Web Automation', 'Custom Software', 'Other'
];

const budgets = ['< $500', '$500 - $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'];

const faqs = [
  { q: 'How quickly can you start a project?', a: 'Most projects can begin within 1-2 business days after the initial consultation and agreement.' },
  { q: 'Do you offer ongoing support?', a: 'Yes, all projects include 30 days of free support. Extended support packages are available.' },
  { q: 'What is the typical turnaround time?', a: 'Depending on the project scope, typical delivery ranges from 1-6 weeks. Complex enterprise solutions may take longer.' },
];

/* World map connection dots */
const mapDots = [
  { x: '18%', y: '30%', label: 'New York' },
  { x: '45%', y: '25%', label: 'London' },
  { x: '52%', y: '35%', label: 'Dubai' },
  { x: '68%', y: '28%', label: 'Mumbai' },
  { x: '78%', y: '38%', label: 'Singapore' },
  { x: '85%', y: '55%', label: 'Sydney' },
];

interface ContactClientProps {
  settings: any;
}

export default function ContactClient({ settings }: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', service: '', budget: '', message: ''
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, label: 'Email', value: settings?.email || 'hello@example.com', color: '#3B82F6' },
    { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>, label: 'WhatsApp / Phone', value: settings?.phone || '+1 (555) 123-4567', color: '#10B981' },
    { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label: 'Location', value: settings?.address || 'Available Worldwide', color: '#8B5CF6' },
  ];

  return (
    <>
      {/* Radar VFX */}
      <div className="fixed top-1/2 right-[-100px] -translate-y-1/2 opacity-20 pointer-events-none z-0">
        <RadarPulse size={400} color="#3B82F6" rings={4} />
      </div>

      <main className="min-h-screen pb-20 relative z-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-28 pb-16">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <Container className="relative z-10 text-center">
            <ScrollReveal>
              <Badge variant="primary" className="mb-4">Mission Control</Badge>
              <SectionHeading
                title={settings?.title || "Get In Touch"}
                subtitle={settings?.description || "Multiple communication channels from our central operations console"}
                as="h1"
              />
            </ScrollReveal>
          </Container>
        </section>

        {/* ─── Contact Grid ─── */}
        <section className="pb-20">
          <Container>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form - 2 columns */}
              <ScrollReveal className="lg:col-span-2">
                <GlassCard padding="p-8">
                  <h2 className="text-xl font-bold mb-6">Send a Message</h2>
                  <form className="space-y-5" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    
                    const fd = new FormData();
                    fd.append('name', formData.name);
                    fd.append('email', formData.email);
                    fd.append('phone', formData.phone);
                    fd.append('company', formData.subject); // Using subject as company for now or just generic message
                    fd.append('message', `Service: ${formData.service}\nBudget: ${formData.budget}\nSubject: ${formData.subject}\n\n${formData.message}`);
                    
                    const res = await createLead(fd);
                    if (res.success) {
                      setSubmitSuccess(true);
                      setFormData({ name: '', email: '', phone: '', subject: '', service: '', budget: '', message: '' });
                    } else {
                      alert('Failed to send message: ' + res.error);
                    }
                    setIsSubmitting(false);
                  }}>
                    {submitSuccess ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center">
                        <p className="font-bold">Message Sent Successfully!</p>
                        <p className="text-sm mt-1">We will get back to you shortly.</p>
                        <button type="button" onClick={() => setSubmitSuccess(false)} className="mt-4 px-4 py-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors">Send Another</button>
                      </div>
                    ) : (
                      <>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Full Name *</label>
                        <input required name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email Address *</label>
                        <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Subject / Company</label>
                        <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Project inquiry"
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Service Needed</label>
                        <select name="service" value={formData.service} onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                          <option value="">Select a service...</option>
                          {services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Budget Range</label>
                        <select name="budget" value={formData.budget} onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                          <option value="">Select budget...</option>
                          {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Tell me about your project..."
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
                    </div>

                    <Button variant="primary" size="lg" fullWidth type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Message →'}
                    </Button>
                      </>
                    )}
                  </form>
                </GlassCard>
              </ScrollReveal>

              {/* Contact Info Cards */}
              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <ScrollReveal key={info.label} delay={i * 0.15}>
                    <GlassCard className="hover-glow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${info.color}15`, border: `1px solid ${info.color}30` }}>
                          <span style={{ color: info.color }}>{info.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-muted)] font-medium">{info.label}</p>
                          <p className="font-semibold text-[var(--text-primary)]">{info.value}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}

                {/* Availability Card */}
                <ScrollReveal delay={0.5}>
                  <GlassCard className="text-center">
                    <div className="w-3 h-3 rounded-full bg-success mx-auto mb-3 animate-pulse-glow" />
                    <p className="font-semibold text-success mb-1">Available Now</p>
                    <p className="text-sm text-[var(--text-muted)]">Accepting new projects</p>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </div>
          </Container>
        </section>

        {/* ─── World Map / Embed ─── */}
        <section className="py-16">
          <Container>
            <ScrollReveal>
              <GlassCard padding="p-8" className="relative overflow-hidden">
                <h3 className="text-xl font-bold mb-8 text-center">Global Reach</h3>
                <div className="relative w-full h-[250px] md:h-[300px]">
                  {settings?.mapUrl ? (
                    <iframe 
                      src={settings.mapUrl} 
                      className="absolute inset-0 w-full h-full border-0 rounded-lg opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade" 
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <svg viewBox="0 0 1000 500" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.5">
                          <ellipse cx="500" cy="250" rx="450" ry="220" className="text-primary" />
                          <line x1="50" y1="250" x2="950" y2="250" className="text-primary" />
                          <line x1="500" y1="30" x2="500" y2="470" className="text-primary" />
                          <ellipse cx="500" cy="250" rx="300" ry="220" className="text-primary" />
                          <ellipse cx="500" cy="250" rx="150" ry="220" className="text-primary" />
                        </svg>
                      </div>

                      {mapDots.map((dot, i) => (
                        <div key={dot.label} className="absolute group" style={{ left: dot.x, top: dot.y }}>
                          <div className="w-3 h-3 rounded-full bg-primary animate-node-pulse cursor-pointer" />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--glass-border)] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {dot.label}
                          </div>
                          {i < mapDots.length - 1 && (
                            <div className="absolute top-1.5 left-1.5 w-16 h-[1px] bg-gradient-to-r from-primary/30 to-transparent origin-left"
                              style={{ transform: `rotate(${Math.random() * 60 - 30}deg)`, width: '80px' }} />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>

        {/* ─── FAQ Preview ─── */}
        <section className="py-16">
          <Container>
            <ScrollReveal>
              <SectionHeading title="Common Questions" subtitle="Quick answers to frequently asked questions" />
            </ScrollReveal>
            <div className="max-w-3xl space-y-4 mt-8">
              {faqs.map((faq, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <GlassCard padding="p-0" className={openFaq === i ? 'border-primary/30' : ''}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    >
                      <span className="font-semibold">{faq.q}</span>
                      <span className="text-primary text-xl ml-4 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--glass-border)] pt-4">
                        {faq.a}
                      </div>
                    )}
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
