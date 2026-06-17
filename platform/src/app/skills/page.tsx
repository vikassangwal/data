'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import NeuralNetworkBG from '@/components/vfx/NeuralNetworkBG';

/* ─── Skill Categories Data ─── */
const skillCategories = [
  {
    id: 'languages',
    name: 'Languages & Frameworks',
    proficiency: 90,
    color: '#3B82F6',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    skills: ['Python', 'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js'],
  },
  {
    id: 'ai',
    name: 'AI & Machine Learning',
    proficiency: 85,
    color: '#8B5CF6',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    skills: ['TensorFlow', 'PyTorch', 'LangChain', 'OpenAI', 'Scikit-learn'],
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    proficiency: 88,
    color: '#06B6D4',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    skills: ['Pandas', 'NumPy', 'Power BI', 'Tableau', 'SQL', 'PostgreSQL'],
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    proficiency: 82,
    color: '#10B981',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
  },
  {
    id: 'automation',
    name: 'Automation',
    proficiency: 87,
    color: '#F59E0B',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    skills: ['Selenium', 'Puppeteer', 'Zapier', 'Make', 'RPA'],
  },
];

/* ─── Radar Chart Data ─── */
const radarAxes = [
  { label: 'Frontend', value: 90 },
  { label: 'Backend', value: 85 },
  { label: 'AI/ML', value: 88 },
  { label: 'Data', value: 92 },
  { label: 'DevOps', value: 78 },
];

/* ─── Certifications Data ─── */
const certifications = [
  {
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    icon: '☁️',
    color: '#F59E0B',
  },
  {
    title: 'TensorFlow Developer',
    issuer: 'Google',
    icon: '🧠',
    color: '#8B5CF6',
  },
  {
    title: 'Azure Data Scientist',
    issuer: 'Microsoft',
    icon: '📊',
    color: '#3B82F6',
  },
  {
    title: 'Kubernetes Administrator',
    issuer: 'CNCF',
    icon: '⚙️',
    color: '#06B6D4',
  },
];

/* ─── Orbiting Tech Icon ─── */
function OrbitingIcon({ icon, delay, radius, duration }: { icon: string; delay: number; radius: number; duration: number }) {
  return (
    <motion.div
      className="absolute text-2xl select-none pointer-events-none"
      style={{ left: '50%', top: '50%' }}
      animate={{
        x: [
          radius * Math.cos(0) - 16,
          radius * Math.cos(Math.PI * 0.4) - 16,
          radius * Math.cos(Math.PI * 0.8) - 16,
          radius * Math.cos(Math.PI * 1.2) - 16,
          radius * Math.cos(Math.PI * 1.6) - 16,
          radius * Math.cos(Math.PI * 2) - 16,
        ],
        y: [
          radius * Math.sin(0) - 16,
          radius * Math.sin(Math.PI * 0.4) - 16,
          radius * Math.sin(Math.PI * 0.8) - 16,
          radius * Math.sin(Math.PI * 1.2) - 16,
          radius * Math.sin(Math.PI * 1.6) - 16,
          radius * Math.sin(Math.PI * 2) - 16,
        ],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-sm backdrop-blur-md border border-white/10">
        {icon}
      </div>
    </motion.div>
  );
}

/* ─── Animated Progress Bar ─── */
function AnimatedProgressBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setFill(value), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} className="w-full">
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${fill}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ─── SVG Radar Chart ─── */
function SkillsRadar({ axes }: { axes: { label: string; value: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setAnimated(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const cx = 160;
  const cy = 160;
  const maxR = 120;
  const levels = 5;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  /* Grid rings */
  const gridRings = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = (maxR / levels) * (level + 1);
      const points = Array.from({ length: n }, (_, i) => {
        const angle = startAngle + i * angleStep;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return points;
    });
  }, [n]);

  /* Axis lines */
  const axisLines = useMemo(() => {
    return axes.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x2: cx + maxR * Math.cos(angle),
        y2: cy + maxR * Math.sin(angle),
      };
    });
  }, [axes, n]);

  /* Data polygon */
  const dataPoints = useMemo(() => {
    return axes.map((a, i) => {
      const angle = startAngle + i * angleStep;
      const r = animated ? (a.value / 100) * maxR : 0;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  }, [axes, animated, n]);

  /* Label positions */
  const labelPositions = useMemo(() => {
    return axes.map((a, i) => {
      const angle = startAngle + i * angleStep;
      const labelR = maxR + 28;
      return {
        x: cx + labelR * Math.cos(angle),
        y: cy + labelR * Math.sin(angle),
        label: a.label,
        value: a.value,
      };
    });
  }, [axes, n]);

  return (
    <div ref={ref} className="flex items-center justify-center">
      <svg viewBox="0 0 320 320" className="w-full max-w-[400px]">
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {gridRings.map((points, i) => (
          <polygon
            key={`ring-${i}`}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="url(#radarGrad)"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          filter="url(#radarGlow)"
          style={{ transition: 'all 1.2s cubic-bezier(0.21, 0.47, 0.32, 0.98)' }}
        />

        {/* Data points */}
        {axes.map((a, i) => {
          const angle = startAngle + i * angleStep;
          const r = animated ? (a.value / 100) * maxR : 0;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          return (
            <g key={`point-${i}`}>
              <circle
                cx={px}
                cy={py}
                r="5"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: 'all 1.2s cubic-bezier(0.21, 0.47, 0.32, 0.98)' }}
              />
              <circle
                cx={px}
                cy={py}
                r="10"
                fill="rgba(59,130,246,0.15)"
                style={{ transition: 'all 1.2s cubic-bezier(0.21, 0.47, 0.32, 0.98)' }}
              />
            </g>
          );
        })}

        {/* Labels */}
        {labelPositions.map((lp, i) => (
          <text
            key={`label-${i}`}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-current text-[11px] font-medium"
            style={{ fill: 'var(--text-secondary)' }}
          >
            {lp.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */
export default function SkillsPage() {
  const techIcons = ['⚛️', '🐍', '☁️', '🤖', '🔧', '📊', '🧠', '🚀'];

  return (
    <main className="min-h-screen pb-20">

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <NeuralNetworkBG nodeCount={80} color="59, 130, 246" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Orbiting tech icons */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="relative w-full h-full">
            <div className="absolute left-1/2 top-1/2">
              {techIcons.map((icon, i) => (
                <OrbitingIcon
                  key={i}
                  icon={icon}
                  delay={i * 1.5}
                  radius={200 + (i % 3) * 60}
                  duration={20 + i * 3}
                />
              ))}
            </div>
          </div>
        </div>

        <Container className="relative z-10 text-center">
          <ScrollReveal variant="fade">
            <Badge variant="primary" className="mb-6">
              <span className="mr-1">🎯</span> Technical Expertise
            </Badge>
          </ScrollReveal>

          <ScrollReveal variant="slide-up" delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="gradient-text">Technology</span>
              <br />
              <span className="text-[var(--text-primary)]">Arsenal</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="slide-up" delay={0.2}>
            <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              A battle-tested suite of tools, frameworks, and technologies forged through years of
              building production systems — from AI pipelines to scalable cloud architectures.
            </p>
          </ScrollReveal>

          {/* Floating HUD stats */}
          <ScrollReveal variant="scale" delay={0.4}>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                { label: 'Technologies', value: '30+' },
                { label: 'Years Experience', value: '7+' },
                { label: 'Projects Built', value: '50+' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card hud-border px-6 py-4 rounded-xl text-center min-w-[140px]"
                >
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ── SKILL CATEGORIES SECTION ── */}
      <section className="py-20 relative">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="Control Center"
              subtitle="Skill systems organized by domain — each module battle-ready and production-proven"
              align="center"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {skillCategories.map((cat, catIdx) => (
              <ScrollReveal key={cat.id} variant="slide-up" delay={catIdx * 0.1}>
                <GlassCard padding="p-6" className="hud-border h-full group hover:border-[var(--glass-border)] transition-all duration-500">
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${cat.color}20` }}
                    >
                      <svg className="w-5 h-5" style={{ color: cat.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)] text-sm">{cat.name}</h3>
                      <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{cat.proficiency}% proficiency</div>
                    </div>
                  </div>

                  {/* Skill pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {cat.skills.map((skill, sIdx) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIdx * 0.1 + sIdx * 0.05, duration: 0.3 }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 cursor-default"
                        style={{
                          background: `linear-gradient(135deg, ${cat.color}12, ${cat.color}06)`,
                          borderColor: `${cat.color}30`,
                          color: cat.color,
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>

                  {/* Animated progress bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                      <span>Proficiency</span>
                      <span className="font-mono">{cat.proficiency}%</span>
                    </div>
                    <AnimatedProgressBar value={cat.proficiency} color={cat.color} delay={catIdx * 150} />
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── RADAR SECTION ── */}
      <section className="py-20 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <Container className="relative z-10">
          <ScrollReveal>
            <SectionHeading
              title="Skills Radar"
              subtitle="Multi-dimensional proficiency scan across core engineering disciplines"
              align="center"
            />
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 items-center mt-12">
            {/* Radar chart */}
            <ScrollReveal variant="scale" delay={0.2}>
              <GlassCard padding="p-8" className="hud-border">
                <SkillsRadar axes={radarAxes} />
              </GlassCard>
            </ScrollReveal>

            {/* Radar breakdown */}
            <ScrollReveal variant="slide-right" delay={0.3}>
              <div className="space-y-5">
                {radarAxes.map((axis, i) => {
                  const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];
                  return (
                    <div key={axis.label} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full animate-pulse-glow"
                            style={{ backgroundColor: colors[i], boxShadow: `0 0 8px ${colors[i]}60` }}
                          />
                          <span className="text-sm font-medium text-[var(--text-primary)]">{axis.label}</span>
                        </div>
                        <span className="text-sm font-mono text-[var(--text-muted)]">{axis.value}%</span>
                      </div>
                      <AnimatedProgressBar value={axis.value} color={colors[i]} delay={i * 200} />
                    </div>
                  );
                })}

                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Radar analysis computed from project contributions, production deployments,
                    certifications, and continuous learning metrics across all disciplines.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── CERTIFICATIONS PREVIEW ── */}
      <section className="py-20 relative">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="Certified Arsenal"
              subtitle="Industry-recognized certifications validating deep expertise"
              align="center"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.title} variant="slide-up" delay={i * 0.1}>
                <GlassCard padding="p-6" className="hud-border text-center group hover:border-[var(--glass-border)] transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className="relative inline-flex mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110"
                      style={{ background: `${cert.color}15` }}
                    >
                      {cert.icon}
                    </div>
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: cert.color }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Title & Issuer */}
                  <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 group-hover:text-[#3B82F6] transition-colors">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">{cert.issuer}</p>

                  {/* Decorative bottom bar */}
                  <div
                    className="h-0.5 rounded-full mt-4 mx-auto transition-all duration-500 group-hover:w-full"
                    style={{
                      width: '40%',
                      background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)`,
                    }}
                  />
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-20 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <Container className="relative z-10">
          <ScrollReveal variant="scale">
            <GlassCard padding="p-12" className="hud-border text-center max-w-3xl mx-auto relative overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-secondary/30 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent/30 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />

              <Badge variant="primary" className="mb-6">
                <span className="mr-1">🚀</span> Ready to Deploy
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text">Let&apos;s Build Together</span>
              </h2>

              <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
                These tools are sharpened and ready. Whether it&apos;s a complex AI pipeline,
                a full-stack platform, or an automation workflow — let&apos;s turn your vision into reality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg">
                  Start a Project
                </Button>
                <Button variant="outline" size="lg">
                  View Portfolio
                </Button>
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
