'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CursorSpotlight from '@/components/vfx/CursorSpotlight';

export default function ProjectsClient({ 
  initialProjects, 
  categories 
}: { 
  initialProjects: any[], 
  categories: string[] 
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects =
    activeCategory === 'All'
      ? initialProjects
      : initialProjects.filter((p) => p.category === activeCategory);

  return (
    <>
      <CursorSpotlight />

      <main className="min-h-screen pb-24 relative z-10">
        {/* ─────────────── HERO ─────────────── */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--text-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          <Container className="relative z-10 text-center">
            <ScrollReveal variant="fade">
              <Badge variant="primary" className="mb-6 text-xs tracking-widest uppercase">
                Real-World Impact
              </Badge>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={0.1}>
              <SectionHeading
                title="Projects & Case Studies"
                subtitle="Data-driven transformations that turned complexity into competitive advantage — measurable outcomes, real businesses."
                align="center"
              />
            </ScrollReveal>

            <ScrollReveal variant="scale" delay={0.25}>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4]" />
            </ScrollReveal>
          </Container>
        </section>

        {/* ─────────────── CATEGORY FILTERS ─────────────── */}
        <section className="pb-4">
          <Container>
            <ScrollReveal variant="slide-up" delay={0.15}>
              <div className="flex flex-wrap justify-center gap-3 mb-14">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                        relative px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide
                        transition-all duration-300 cursor-pointer select-none
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg shadow-[#3B82F6]/30'
                            : 'glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:shadow-md hover:shadow-[#3B82F6]/10 border border-[var(--glass-border)]'
                        }
                      `}
                    >
                      {cat}
                      {isActive && (
                        <span className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ─────────────── PROJECTS GRID ─────────────── */}
        <section>
          <Container>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProjects.map((project, i) => (
                  <ScrollReveal
                    key={project.slug}
                    variant="slide-up"
                    delay={i * 0.08}
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      className="block h-full group"
                    >
                      <GlassCard
                        padding="p-0"
                        className="overflow-hidden flex flex-col h-full hover-glow transition-transform duration-300 group-hover:-translate-y-1"
                      >
                        {/* ── Gradient header / Image ── */}
                        <div
                          className={`relative h-52 w-full p-6 flex flex-col justify-end overflow-hidden ${
                            project.imageUrl ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-500'
                          }`}
                          style={
                            project.imageUrl 
                              ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                              : project.gradient ? { backgroundImage: `linear-gradient(to bottom right, ${project.gradient})` } : {}
                          }
                        >
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

                          <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 1px, transparent 1px)',
                              backgroundSize: '24px 24px',
                            }}
                          />

                          <Badge
                            variant="default"
                            className="relative z-10 w-fit bg-white/20 text-white backdrop-blur-md border-white/10 shadow-sm"
                          >
                            {project.category}
                          </Badge>
                        </div>

                        {/* ── Card body ── */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)] group-hover:text-[#3B82F6] transition-colors duration-300">
                            {project.title}
                          </h3>

                          <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3 mb-5 flex-1">
                            {project.description}
                          </p>

                          {/* Tech tags */}
                          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[var(--glass-border)]">
                            {project.tech?.slice(0, 3).map((t: string) => (
                              <span
                                key={t}
                                className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--glass-border)]"
                              >
                                {t}
                              </span>
                            ))}
                            {project.tech?.length > 3 && (
                              <span className="text-xs font-medium text-[var(--text-muted)] px-2 py-1">
                                +{project.tech.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Empty state ── */}
            {filteredProjects.length === 0 && (
              <ScrollReveal variant="fade">
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center mb-6">
                    <svg
                      className="w-8 h-8 text-[var(--text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-[var(--text-secondary)] mb-2">
                    No projects found
                  </p>
                  <p className="text-sm text-[var(--text-muted)] max-w-sm">
                    There are no case studies in the &ldquo;{activeCategory}&rdquo; category yet.
                    Try selecting a different filter above.
                  </p>
                </div>
              </ScrollReveal>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
