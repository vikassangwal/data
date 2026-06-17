'use client';

import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';

const certifications = [
  { name: 'AWS Solutions Architect', org: 'Amazon Web Services', year: '2024', color: 'from-amber-500 to-orange-500', desc: 'Professional-level cloud architecture certification.' },
  { name: 'Google Data Analytics', org: 'Google', year: '2023', color: 'from-blue-500 to-cyan-500', desc: 'Advanced data analytics and visualization certification.' },
  { name: 'TensorFlow Developer', org: 'Google', year: '2023', color: 'from-orange-500 to-red-500', desc: 'Machine learning and deep learning with TensorFlow.' },
  { name: 'Microsoft Azure Data Scientist', org: 'Microsoft', year: '2022', color: 'from-blue-600 to-indigo-600', desc: 'Cloud-based data science and ML operations certification.' },
  { name: 'Meta Front-End Developer', org: 'Meta', year: '2022', color: 'from-blue-500 to-violet-500', desc: 'Advanced React, TypeScript, and frontend engineering.' },
  { name: 'IBM Data Science Professional', org: 'IBM', year: '2021', color: 'from-blue-700 to-blue-500', desc: 'End-to-end data science methodology and tools.' },
];

const stats = [
  { value: '6', label: 'Certifications' },
  { value: '500+', label: 'Hours Training' },
  { value: '4', label: 'Cloud Platforms' },
  { value: '100%', label: 'Pass Rate' },
];

export default function CertificationsPage() {
  return (
    <main className="min-h-screen pb-20">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <Container className="relative z-10 text-center">
          <ScrollReveal>
            <Badge variant="primary" className="mb-4">Verified Credentials</Badge>
            <SectionHeading
              title="Certifications"
              subtitle="Industry-recognized credentials validating expertise across cloud, AI, data, and development"
            />
          </ScrollReveal>
        </Container>
      </section>

      {/* ─── Stats ─── */}
      <section className="pb-16">
        <Container>
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(s => (
                <div key={s.label} className="text-center p-6">
                  <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                  <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ─── Certifications Grid ─── */}
      <section className="pb-20">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.name} delay={i * 0.1}>
                <GlassCard className="h-full hover-glow group relative overflow-hidden" padding="p-0">
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  </div>

                  {/* Gradient top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${cert.color}`} />

                  <div className="p-6">
                    {/* Shield icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)]">{cert.name}</h3>
                    <p className="text-sm text-primary font-medium mb-2">{cert.org}</p>
                    <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{cert.desc}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="default">{cert.year}</Badge>
                      <button className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Verify
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16">
        <Container>
          <ScrollReveal variant="scale">
            <GlassCard className="text-center max-w-3xl mx-auto" padding="p-10 sm:p-14">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Continuously Learning</h2>
              <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
                Currently pursuing advanced certifications in Kubernetes, advanced AI engineering, and cloud-native architecture.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/skills"><Button variant="primary" size="lg">View All Skills</Button></a>
                <a href="/contact"><Button variant="outline" size="lg">Get in Touch</Button></a>
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
