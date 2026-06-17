'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import DataGridBG from '@/components/vfx/DataGridBG';
import { getServices } from '@/app/actions/services';

/* ─── SERVICE MODULE DATA ─── */
const services = [
  {
    slug: 'data-analytics',
    title: 'Data Analytics',
    desc: 'Transform raw data into actionable insights with advanced analytics, statistical modeling, and beautiful visualizations.',
    price: '$499',
    color: 'from-blue-500 to-cyan-500',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    features: ['Exploratory data analysis', 'Statistical modeling & forecasting', 'Custom data pipelines', 'Automated reporting'],
  },
  {
    slug: 'dashboard-development',
    title: 'Dashboard Development',
    desc: 'Interactive, real-time dashboards that turn complex datasets into clear visual stories for stakeholders.',
    price: '$799',
    color: 'from-emerald-500 to-teal-500',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    features: ['Real-time data visualization', 'KPI tracking & alerts', 'Multi-source integration', 'Mobile-responsive design'],
  },
  {
    slug: 'business-intelligence',
    title: 'Business Intelligence',
    desc: 'Strategic data-driven decisions powered by comprehensive BI solutions, KPI frameworks, and executive reporting.',
    price: '$999',
    color: 'from-violet-500 to-purple-500',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    features: ['KPI framework design', 'Executive dashboards', 'Competitive analysis', 'Market trend forecasting'],
  },
  {
    slug: 'ai-agent-services',
    title: 'AI Agent Services',
    desc: 'Intelligent automation agents that handle complex tasks, make decisions, and learn from interactions.',
    price: '$1,499',
    color: 'from-amber-500 to-orange-500',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: ['Custom AI agent development', 'Multi-agent orchestration', 'Tool & API integration', 'Self-learning capabilities'],
  },
  {
    slug: 'ai-chatbots',
    title: 'AI Chatbots',
    desc: 'Smart conversational bots powered by NLP that engage customers, answer queries, and drive conversions 24/7.',
    price: '$699',
    color: 'from-pink-500 to-rose-500',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    features: ['Natural language processing', 'Multi-platform deployment', 'Knowledge base integration', 'Analytics & insights'],
  },
  {
    slug: 'whatsapp-automation',
    title: 'WhatsApp Automation',
    desc: 'Automated messaging solutions for customer engagement, support, and marketing on WhatsApp Business.',
    price: '$399',
    color: 'from-green-500 to-emerald-500',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: ['Bulk message campaigns', 'Automated responses', 'CRM integration', 'Delivery analytics'],
  },
  {
    slug: 'web-automation',
    title: 'Web Automation',
    desc: 'Streamline repetitive workflows with intelligent web scraping, form filling, and process automation.',
    price: '$599',
    color: 'from-cyan-500 to-blue-500',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    features: ['Web scraping & data extraction', 'Browser automation', 'Workflow orchestration', 'Scheduled task execution'],
  },
  {
    slug: 'custom-software',
    title: 'Custom Software',
    desc: 'Tailored software solutions built from the ground up — web apps, APIs, internal tools, and SaaS products.',
    price: '$2,999',
    color: 'from-indigo-500 to-violet-500',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    features: ['Full-stack development', 'API design & integration', 'SaaS product development', 'Scalable architecture'],
  },
];

/* ─── LAB MODULE LABEL ─── */
function LabModuleTag({ index }: { index: number }) {
  return (
    <span className="absolute top-4 right-4 text-[10px] font-mono tracking-widest uppercase opacity-30 select-none">
      MOD-{String(index + 1).padStart(2, '0')}
    </span>
  );
}

/* ─── HERO SECTION ─── */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-20">
      {/* DataGrid canvas backdrop */}
      <div className="absolute inset-0 z-0 opacity-40">
        <DataGridBG />
      </div>

      {/* Ambient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Badge variant="primary" className="mb-4">What I Offer</Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          <SectionHeading
            title="Services"
            subtitle="End-to-end solutions designed to accelerate your business with data, AI, and modern technology"
            as="h1"
          />
        </motion.div>

        {/* Lab-themed decorative strip */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/60" />
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-blue-400/70">
            Solutions Laboratory
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/60" />
        </motion.div>
      </Container>
    </section>
  );
}

/* ─── SERVICE CARD ─── */
function ServiceCard({ service, index }: { service: typeof services[number]; index: number }) {
  return (
    <ScrollReveal key={service.slug} variant="slide-up" delay={index * 0.1}>
      <GlassCard className="h-full flex flex-col group hover-glow relative overflow-hidden" padding="p-0">
        {/* Gradient top bar */}
        <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${service.color}`} />

        {/* Lab module tag */}
        <LabModuleTag index={index} />

        <div className="p-6 flex flex-col flex-1">
          {/* Icon in gradient container */}
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
          >
            <svg
              className="w-7 h-7 text-white drop-shadow-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors duration-300">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
            {service.desc}
          </p>

          {/* Features checklist */}
          <ul className="space-y-2 mb-6">
            {service.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg
                  className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* Starting price badge */}
          <Badge variant="primary" className="mb-5 self-start">
            Starting at {service.price}
          </Badge>

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto">
            <Link href={`/services/${service.slug}`} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>
                Learn More
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button variant="primary" size="sm" fullWidth>
                Get Quote
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </ScrollReveal>
  );
}

/* ─── CTA SECTION ─── */
function CTASection() {
  return (
    <section className="py-20 relative">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Container className="relative z-10">
        <ScrollReveal variant="scale">
          <GlassCard className="text-center max-w-3xl mx-auto relative overflow-hidden" padding="p-10 sm:p-14">
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500/30 rounded-tl-2xl pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-cyan-400/70 block mb-4">
                Custom Engagement
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
                Need Something Custom?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Don&apos;t see exactly what you need? I build tailored solutions for unique challenges.
                Let&apos;s discuss your project.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="primary" size="lg">
                    Get in Touch
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </ScrollReveal>
      </Container>
    </section>
  );
}

/* ─── PAGE ─── */
export default function ServicesPage() {
  const [activeServices, setActiveServices] = useState(services);

  useEffect(() => {
    async function loadServices() {
      try {
        const { success, data } = await getServices();
        if (success && data && data.length > 0) {
          const activeDbServices = data.filter((item: any) => item.isActive);
          if (activeDbServices.length > 0) {
            const merged = activeDbServices.map((dbService: any) => {
              const localMatch = services.find(s => s.slug === dbService.slug);
              return {
                slug: dbService.slug,
                title: dbService.title,
                desc: dbService.description,
                price: dbService.pricing ? `$${dbService.pricing.basePrice}` : (localMatch?.price || 'Custom'),
                color: localMatch?.color || 'from-blue-500 to-cyan-500',
                icon: localMatch?.icon || 'M13 10V3L4 14h7v7l9-11h-7z',
                features: dbService.features?.length > 0 ? dbService.features.map((f: any) => f.title) : (localMatch?.features || []),
              };
            });
            setActiveServices(merged);
            return;
          }
        }
        
        // Fallback to localStorage if DB is empty (for backward compatibility during migration)
        const stored = localStorage.getItem('platform_services');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = services.map(s => {
            const match = parsed.find((item: any) => item.slug === s.slug);
            if (match) {
              return {
                ...s,
                title: match.title,
                desc: match.desc,
                price: match.price,
                features: match.features || s.features,
              };
            }
            return s;
          });
          setActiveServices(updated);
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    loadServices();
  }, []);

  return (
    <>
      <main className="min-h-screen pb-20 relative z-10">
        {/* ── Hero ── */}
        <HeroSection />

        {/* ── Services Grid ── */}
        <section className="pb-24">
          <Container>
            {/* Section label */}
            <ScrollReveal variant="fade" className="mb-10 text-center">
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-blue-400/50">
                8 Modules Available
              </span>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeServices.map((s, i) => (
                <ServiceCard key={s.slug} service={s} index={i} />
              ))}
            </div>
          </Container>
        </section>

        {/* ── CTA ── */}
        <CTASection />
      </main>
    </>
  );
}
