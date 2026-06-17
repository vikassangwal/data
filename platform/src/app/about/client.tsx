'use client';

import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import ParticleCanvas from '@/components/vfx/ParticleCanvas';

const defaultMilestones = [
  { year: '2018', title: 'Started Coding Journey', desc: 'Dove into Python and data science, building my first analytics dashboards and discovering the power of data-driven decision making.' },
  { year: '2020', title: 'First Enterprise Client', desc: 'Delivered a business intelligence platform for a Fortune 500 company, processing over 2M records daily with real-time insights.' },
  { year: '2021', title: 'AI & Automation Pivot', desc: 'Built intelligent automation systems and AI chatbots, helping businesses save 40+ hours per week on repetitive tasks.' },
  { year: '2023', title: 'Launched SaaS Products', desc: 'Created and launched multiple SaaS products serving 500+ users, generating recurring revenue and solving real-world problems.' },
  { year: '2025', title: 'Full-Stack AI Studio', desc: 'Established a full-service AI consultancy, combining data analytics, custom AI agents, and scalable web platforms.' },
];

const values = [
  { title: 'Innovation', desc: 'Pushing boundaries with cutting-edge AI and automation technologies to solve complex problems.', color: 'from-blue-500 to-cyan-500', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { title: 'Quality', desc: 'Every line of code, every dashboard, every solution is crafted with meticulous attention to detail.', color: 'from-emerald-500 to-teal-500', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { title: 'Transparency', desc: 'Clear communication, honest timelines, and full visibility into project progress at every stage.', color: 'from-violet-500 to-purple-500', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { title: 'Results', desc: 'Focused on measurable outcomes — ROI, efficiency gains, and tangible business impact.', color: 'from-amber-500 to-orange-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
];

const techStack = [
  { name: 'Python', cat: 'Language' },
  { name: 'TypeScript', cat: 'Language' },
  { name: 'React', cat: 'Frontend' },
  { name: 'Next.js', cat: 'Framework' },
  { name: 'Node.js', cat: 'Backend' },
  { name: 'TensorFlow', cat: 'AI/ML' },
  { name: 'PostgreSQL', cat: 'Database' },
  { name: 'AWS', cat: 'Cloud' },
  { name: 'Docker', cat: 'DevOps' },
  { name: 'Power BI', cat: 'Analytics' },
  { name: 'Tailwind', cat: 'CSS' },
  { name: 'Redis', cat: 'Cache' },
  { name: 'LangChain', cat: 'AI' },
  { name: 'Pandas', cat: 'Data' },
  { name: 'Selenium', cat: 'Automation' },
  { name: 'GraphQL', cat: 'API' },
];

function AnimatedStat({ value, label, iconPath, delay }: { value: string; label: string; iconPath: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: NodeJS.Timeout;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const num = parseInt(value);
        if (isNaN(num)) { setDisplay(value); obs.unobserve(el); return; }
        let start = 0;
        const end = num;
        const dur = 1800;
        const step = dur / end;
        timer = setInterval(() => {
          start++;
          setDisplay(start + (value.includes('+') ? '+' : ''));
          if (start >= end) clearInterval(timer);
        }, Math.max(step, 15));
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => { obs.disconnect(); clearInterval(timer); };
  }, [value]);

  return (
    <ScrollReveal variant="scale" delay={delay}>
      <GlassCard className="text-center group h-full" glow>
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse-glow">
          <svg className="w-7 h-7 text-primary group-hover:scale-125 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath || "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
        </div>
        <div ref={ref} className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{display}</div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </GlassCard>
    </ScrollReveal>
  );
}

function TimelineDot({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
      <div className={`absolute w-8 h-8 rounded-full ${isActive ? 'bg-primary/20 animate-radar-ping' : 'bg-primary/10'}`} />
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary border-4 shadow-lg shadow-primary/30" style={{ borderColor: 'var(--bg-primary)' }} />
    </div>
  );
}

function MilestoneItem({
  milestone,
  index,
  isActive,
  onVisible,
}: {
  milestone: { year: string; title: string; desc: string };
  index: number;
  isActive: boolean;
  onVisible: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) onVisible();
  }, [isInView, onVisible]);

  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative mb-14 last:mb-0">
      <TimelineDot isActive={isActive} />
      <ScrollReveal
        variant={isEven ? 'slide-right' : 'slide-left'}
        delay={index * 0.1}
      >
        <div
          className={`ml-12 md:ml-0 md:w-[calc(50%-2.5rem)] ${
            isEven ? 'md:mr-auto md:pr-0' : 'md:ml-auto md:pl-0'
          }`}
        >
          <GlassCard className="hud-border group" hover>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="primary">{milestone.year}</Badge>
              {isActive && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {milestone.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {milestone.desc}
            </p>
          </GlassCard>
        </div>
      </ScrollReveal>
    </div>
  );
}

interface AboutClientProps {
  settings: any;
  stats: any[];
}

export default function AboutClient({ settings, stats }: AboutClientProps) {
  const [activeMilestone, setActiveMilestone] = useState(0);

  const name = settings?.title || 'Alex Kumar';
  const titles = settings?.subtitle || 'Data Analyst · AI Engineer · Full-Stack Developer';
  const heroDesc = settings?.content || "I transform raw data into strategic insights...";

  return (
    <main className="min-h-screen pb-20 relative">
      <ParticleCanvas />

      <section className="relative overflow-hidden pt-28 pb-24">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <Container className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <ScrollReveal variant="slide-right" className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white text-5xl sm:text-6xl font-bold shadow-2xl">
                  {name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-success flex items-center justify-center border-4 animate-pulse-glow" style={{ borderColor: 'var(--bg-primary)' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={0.15} className="text-center lg:text-left">
              <Badge variant="primary" className="mb-4 animate-shimmer">The Journey of Transformation</Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Hi, I&apos;m <span className="gradient-text">{name}</span>
              </h1>
              <p className="text-xl sm:text-2xl mb-6 font-light" style={{ color: 'var(--text-secondary)' }}>
                {titles}
              </p>
              <p className="text-lg leading-relaxed max-w-2xl mb-8" style={{ color: 'var(--text-muted)' }}>
                {heroDesc}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button variant="primary" size="lg">Let&apos;s Talk</Button>
                <Button variant="outline" size="lg">Download CV</Button>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <section className="py-16 relative" style={{ borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} value={s.value + (s.suffix || '')} label={s.label} iconPath={s.icon || ''} delay={i * 0.1} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 neural-grid opacity-30" />

        <Container className="relative z-10">
          <ScrollReveal variant="fade">
            <SectionHeading
              title="The Journey"
              subtitle="Key milestones in the evolution from analyst to AI automation strategist"
            />
          </ScrollReveal>

          <div className="relative max-w-4xl mx-auto mt-12">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2">
              <div className="w-full h-full bg-gradient-to-b from-primary via-secondary to-accent opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {defaultMilestones.map((m, i) => (
              <MilestoneItem
                key={m.year + '-' + i}
                milestone={m}
                index={i}
                isActive={activeMilestone === i}
                onVisible={() => setActiveMilestone(i)}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 relative" style={{ background: 'var(--bg-secondary)' }}>
        <Container>
          <ScrollReveal variant="fade">
            <SectionHeading
              title="Core Values"
              subtitle="The principles that guide every project, every decision, and every line of code"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} variant="slide-up" delay={i * 0.12}>
                <GlassCard className="text-center h-full group" hover>
                  <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 relative">
        <Container>
          <ScrollReveal variant="fade">
            <SectionHeading
              title="Technical Skills"
              subtitle="Technologies I work with daily to build world-class AI and Enterprise solutions"
            />
          </ScrollReveal>

          <ScrollReveal variant="slide-up" delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-12">
              {techStack.map((t, i) => (
                <div key={t.name} className="group relative">
                  <div
                    className="glass-card p-4 text-center cursor-default transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hud-border"
                  >
                    <div className="w-11 h-11 mx-auto mb-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 group-hover:from-primary/25 group-hover:to-secondary/25 transition-all duration-300">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                    {t.cat}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: 'var(--text-primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 data-stream-bg opacity-20" />

        <Container className="relative z-10">
          <ScrollReveal variant="scale" delay={0.1}>
            <GlassCard className="text-center max-w-3xl mx-auto gradient-border" padding="p-12 sm:p-16" glow>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 gradient-text">
                Let&apos;s Build Something Extraordinary
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Ready to transform your business with data-driven solutions and cutting-edge AI?
                The next chapter of this journey could be yours.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="primary" size="lg">Start a Project</Button>
                <Button variant="outline" size="lg">Schedule a Call</Button>
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
