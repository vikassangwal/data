'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  TypewriterText,
  AnimatedCounter,
  GlassCard,
  SectionHeading,
  Container,
  ScrollReveal,
  Button,
  Badge,
} from '@/components/ui';
import NeuralNetworkBG from '@/components/vfx/NeuralNetworkBG';
import HolographicOrb from '@/components/vfx/HolographicOrb';
import DataGridBG from '@/components/vfx/DataGridBG';

/* ─── Inline SVG Icons ─── */
const icons = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M3 3v18h18M18 9l-5 5-4-4-3 3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#F59E0B]">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

/* ─── Process Steps ─── */
const process = [
  { num: '01', title: 'Discovery Call', desc: 'We deeply understand your goals, pain points, and technical landscape in a focused session.', color: '#3B82F6' },
  { num: '02', title: 'Strategy & Design', desc: 'We architect the solution, select the right stack, and deliver a detailed project roadmap.', color: '#06B6D4' },
  { num: '03', title: 'Build & Iterate', desc: 'Agile sprints with weekly demos ensure you see progress and provide feedback continuously.', color: '#8B5CF6' },
  { num: '04', title: 'Launch & Support', desc: 'Smooth deployment, onboarding, and 30 days of dedicated post-launch support included.', color: '#10B981' },
];

/* ─── Minimal inline chart (CSS bars) ─── */
function MiniBarChart({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: started ? `${value}%` : '0%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, transitionDelay: '200ms' }}
        />
      </div>
    </div>
  );
}

export default function HomeClient({ 
  heroSetting, 
  stats, 
  testimonials, 
  skills, 
  timelineEvents, 
  services 
}: any) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    const interval = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials]);

  // Construct ticker items from services
  const tickerList = services.map((s: any) => `✨ ${s.title}`);
  
  // Map icons for services (just fallback to brain/chart/zap if null)
  const renderServiceIcon = (iconName: string) => {
    if (iconName === 'chart') return icons.chart;
    if (iconName === 'zap') return icons.zap;
    return icons.brain;
  };

  const parsedTypewriter = JSON.parse(heroSetting.typewriter);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <NeuralNetworkBG nodeCount={45} color="59, 130, 246" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/20 to-[var(--bg-primary)] z-[1] pointer-events-none" />

        <Container className="relative z-10 py-20 lg:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left content */}
            <div className="max-w-2xl">
              <ScrollReveal variant="fade" delay={0.05}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {heroSetting.badgeText}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="slide-up" delay={0.15}>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.08] mb-6 tracking-tight">
                  {heroSetting.titlePrefix}{' '}
                  <span className="gradient-text">
                    <TypewriterText
                      words={parsedTypewriter}
                      typingSpeed={75}
                      deletingSpeed={45}
                      pauseDuration={2500}
                    />
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal variant="slide-up" delay={0.25}>
                <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg leading-relaxed">
                  {heroSetting.description}
                </p>
              </ScrollReveal>

              <ScrollReveal variant="slide-up" delay={0.35}>
                <div className="flex flex-wrap gap-4 mb-12">
                  <Link href={heroSetting.cta1Link}>
                    <Button variant="primary" size="lg">
                      {heroSetting.cta1Text} →
                    </Button>
                  </Link>
                  <Link href={heroSetting.cta2Link}>
                    <Button variant="outline" size="lg">
                      {heroSetting.cta2Text}
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>

              {/* Social proof row */}
              <ScrollReveal variant="fade" delay={0.45}>
                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[var(--glass-border)]">
                  <div className="flex -space-x-2">
                    {testimonials.slice(0, 4).map((t: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: t.color }}>
                        {t.avatar}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-0.5">{Array(5).fill(0).map((_, i) => <span key={i}>{icons.star}</span>)}</div>
                    <p className="text-xs text-[var(--text-muted)]"><strong className="text-[var(--text-primary)]">{stats[0]?.value || '50'}+</strong> happy clients worldwide</p>
                  </div>
                  <div className="h-8 w-px bg-[var(--glass-border)]" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-[var(--text-muted)]">Accepting new projects</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Orb + floating panels */}
            <div className="relative h-[500px] hidden lg:flex items-center justify-center">
              <ScrollReveal variant="scale" delay={0.2}>
                <div className="relative" style={{ width: 420, height: 420 }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <HolographicOrb size={340} color1="#3B82F6" color2="#06B6D4" color3="#8B5CF6" />
                  </div>

                  {/* Floating KPI panels mapped from stats */}
                  {stats.map((kpi: any, i: number) => (
                    <div
                      key={kpi.id}
                      className="absolute z-20 glass-card px-4 py-3 flex items-center gap-3 animate-float"
                      style={{ 
                        animationDelay: `${i * 0.8}s`, animationDuration: `${5 + i}s`,
                        ...(i === 0 ? { top: '-10px', left: '-60px' } : 
                            i === 1 ? { top: '10px', right: '-50px' } : 
                            i === 2 ? { bottom: '20px', left: '-40px' } : 
                                      { bottom: '30px', right: '-30px' })
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}20`, border: `1px solid ${kpi.color}30` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: kpi.color }} />
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}{kpi.suffix}</div>
                        <div className="text-xs text-[var(--text-muted)]">{kpi.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </Container>

        {/* Ambient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="relative overflow-hidden border-y border-[var(--glass-border)] bg-[var(--bg-secondary)] py-3">
        <div className="flex animate-slide-auto whitespace-nowrap gap-8 w-max">
          {[...tickerList, ...tickerList, ...tickerList].map((item, i) => (
            <span key={i} className="text-sm text-[var(--text-muted)] px-4">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══ STATS STRIP ═══ */}
      <section className="py-16 border-b border-[var(--glass-border)]">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any, i: number) => (
              <ScrollReveal key={stat.id} delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-primary/30 transition-all duration-300 group">
                  <div className="text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300" style={{ color: stat.color }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix || ''} duration={2000} />
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ SERVICES PREVIEW ═══ */}
      <section className="py-24 relative overflow-hidden">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="What We Build"
              subtitle="Three core capability pillars — each engineered to deliver measurable impact from day one."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((svc: any, i: number) => (
              <ScrollReveal key={svc.id} delay={i * 0.12}>
                <Link href={`/services/${svc.slug}`} className="group block h-full">
                  <div
                    className="h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer hover:border-primary/50 hover:-translate-y-1 shadow-[0_12px_40px_rgba(59,130,246,0)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]"
                  >
                    {/* Top gradient bar */}
                    <div className={`h-1 w-full bg-gradient-to-r from-primary to-accent`} />
                    <div className="p-8 flex flex-col flex-1">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {renderServiceIcon(svc.icon || 'brain')}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{svc.title}</h3>
                      <p className="text-[var(--text-muted)] leading-relaxed flex-1 text-sm">{svc.description}</p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        <span>Explore Service</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center">
              <Link href="/services">
                <Button variant="outline" size="lg">View All Services →</Button>
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ═══ DATA DASHBOARD SECTION ═══ */}
      <section className="py-24 relative overflow-hidden bg-[var(--bg-secondary)] border-y border-[var(--glass-border)]">
        <DataGridBG />
        <Container className="relative z-10">
          <ScrollReveal>
            <SectionHeading
              title="Intelligence at a Glance"
              subtitle="Real-time analytics and performance metrics — the kind of visibility we deliver for every client."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill bars panel */}
            <ScrollReveal variant="slide-right">
              <GlassCard className="hud-border h-full" padding="p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Technology Proficiency</h3>
                  <Badge variant="primary">Live</Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-8">Core competency scores across our key disciplines</p>
                <div className="space-y-5">
                  {skills.map((item: any) => (
                    <MiniBarChart key={item.id} label={item.label} value={item.value} color={item.color} />
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Live activity feed */}
            <ScrollReveal variant="slide-left" delay={0.1}>
              <GlassCard className="hud-border h-full" padding="p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Recent Achievements</h3>
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Updated daily
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-8">Milestones and delivered outcomes across active projects</p>
                <div className="space-y-4">
                  {timelineEvents.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--bg-primary)] transition-colors duration-200">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-secondary)] leading-snug">{item.text}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{item.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ═══ PROCESS SECTION ═══ */}
      <section className="py-24 relative overflow-hidden">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="How We Work"
              subtitle="A proven four-step process that takes you from idea to live product with full transparency."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#10B981] hidden lg:block opacity-30" />

            {process.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="relative flex flex-col items-center text-center group">
                  {/* Step number circle */}
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-white relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${step.color}dd, ${step.color}88)`,
                      boxShadow: `0 0 30px ${step.color}40, 0 4px 16px rgba(0,0,0,0.2)`,
                    }}
                  >
                    {step.num}
                    <div className="absolute inset-0 rounded-full border border-white/20" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">{step.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 relative overflow-hidden bg-[var(--bg-secondary)] border-y border-[var(--glass-border)]">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="Client Stories"
              subtitle="Real outcomes from real businesses that trusted us to build their intelligence infrastructure."
              align="center"
            />
          </ScrollReveal>

          {/* Testimonial cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {testimonials.map((t: any, i: number) => (
              <ScrollReveal key={t.id} delay={i * 0.1}>
                <div
                  className={`glass-card p-8 flex flex-col h-full cursor-pointer transition-all duration-500 ${i === activeTestimonial ? 'border-primary/40 shadow-[0_0_40px_rgba(59,130,246,0.12)]' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array(t.rating).fill(0).map((_, s) => <span key={s}>{icons.star}</span>)}
                  </div>
                  {/* Quote */}
                  <blockquote className="text-[var(--text-secondary)] leading-relaxed flex-1 text-sm mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] text-sm">{t.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Active indicator dots */}
          <div className="flex justify-center gap-2">
            {testimonials.map((_: any, i: number) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer border-none ${i === activeTestimonial ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-[var(--bg-surface)] hover:bg-[var(--text-muted)]'}`}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-24 relative overflow-hidden">
        <Container>
          <ScrollReveal variant="scale">
            <div className="relative rounded-3xl overflow-hidden border border-primary/20">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-[#8B5CF6]/10 to-[#06B6D4]/10" style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 8s ease infinite' }} />

              {/* Neural mesh */}
              <div className="absolute inset-0 opacity-20">
                <NeuralNetworkBG nodeCount={20} color="139, 92, 246" />
              </div>

              {/* Ambient glows */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative px-8 py-20 md:py-28 text-center z-10">
                <ScrollReveal variant="slide-up" delay={0.1}>
                  <Badge variant="primary" className="mb-6">Ready to Get Started?</Badge>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                    Build Something <span className="gradient-text">Extraordinary</span>
                  </h2>
                </ScrollReveal>

                <ScrollReveal variant="slide-up" delay={0.2}>
                  <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                    Our team is standing by to turn your boldest idea into a working, scalable product.
                    Free consultation — no pressure, just possibilities.
                  </p>
                </ScrollReveal>

                <ScrollReveal variant="slide-up" delay={0.3}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button variant="primary" size="lg">Book Free Consultation →</Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" size="lg">View Pricing</Button>
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
