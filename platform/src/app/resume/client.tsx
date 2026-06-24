'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ParticleCanvas from '@/components/vfx/ParticleCanvas';
import { Award, Download, Loader2, FileText } from 'lucide-react';

const skillGroups = [
  { name: 'Languages', skills: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { name: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion'] },
  { name: 'Backend', skills: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] },
  { name: 'AI/ML', skills: ['TensorFlow', 'LangChain', 'OpenAI', 'Scikit-learn'] },
  { name: 'Cloud', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
  { name: 'Tools', skills: ['Power BI', 'Selenium', 'Git', 'Figma'] },
];

/* ─── Animated Counter ─── */
function Counter({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const dur = 1500;
        const step = dur / target;
        const timer = setInterval(() => { start++; setVal(start); if (start >= target) clearInterval(timer); }, Math.max(step, 15));
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <div ref={ref} className="text-4xl font-bold" style={{ color }}>{val}{suffix}</div>;
}

interface ResumeClientProps {
  kpis: any[];
  profile: {
    name: string;
    initials: string;
    title: string;
    bio: string;
    photoUrl: string | null;
    cvUrl: string | null;
  };
  experience: any[];
  education: any[];
  certifications: any[];
}

export default function ResumeClient({ kpis, profile, experience, education, certifications }: ResumeClientProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/resume/pdf');
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  }, [profile.name]);

  return (
    <>
      <ParticleCanvas />

      <main className="min-h-screen pb-20 relative z-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-28 pb-16">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <Container className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <ScrollReveal variant="scale">
                <div className="relative">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-[var(--bg-primary)] shadow-2xl" />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                      {profile.initials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-success flex items-center justify-center border-4 border-[var(--bg-primary)]">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="primary">Professional Profile</Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                  <span className="gradient-text">{profile.name}</span>
                </h1>
                <p className="text-xl text-[var(--text-muted)] mb-4">{profile.title}</p>
                <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                  {profile.bio}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={handleDownloadPDF} disabled={downloading}>
                    {downloading ? (
                      <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Generating PDF…</>
                    ) : (
                      <><Download className="w-4 h-4 inline mr-2" />Download Resume</>
                    )}
                  </Button>
                  {profile.cvUrl && (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline"><FileText className="w-4 h-4 inline mr-2" />View CV</Button>
                    </a>
                  )}
                  <a href="/contact"><Button variant="outline">Hire Me</Button></a>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* ─── KPI Summary ─── */}
        <section className="py-12 border-y border-[var(--glass-border)]">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {kpis.map((kpi, i) => (
                <ScrollReveal key={kpi.label} delay={i * 0.1}>
                  <GlassCard className="text-center hover-glow">
                    <Counter target={kpi.value} suffix={kpi.suffix || ''} color={kpi.color} />
                    <p className="text-sm text-[var(--text-muted)] mt-2 font-medium">{kpi.label}</p>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Experience Timeline ─── */}
        <section className="py-20">
          <Container>
            <ScrollReveal>
              <SectionHeading title="Professional Experience" subtitle="Career highlights and key achievements" />
            </ScrollReveal>
            <div className="relative max-w-3xl mt-10">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

              {experience.map((exp, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="relative flex items-start mb-10 ml-12 md:ml-16">
                    {/* Dot */}
                    <div className="absolute -left-[calc(3rem+6px)] md:-left-[calc(4rem+6px)] w-3 h-3 rounded-full bg-primary border-4 border-[var(--bg-primary)] z-10 animate-node-pulse" />

                    <GlassCard className="w-full hud-border hover-glow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-primary)]">{exp.role}</h3>
                          <p className="text-primary font-medium text-sm">{exp.company}</p>
                        </div>
                        <Badge variant="default">{exp.period}</Badge>
                      </div>
                      <p className="text-[var(--text-muted)] text-sm mb-4 leading-relaxed">{exp.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.achievements?.map((a: string) => (
                          <span key={a} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Education ─── */}
        <section className="py-16 bg-[var(--bg-secondary)]/30">
          <Container>
            <ScrollReveal>
              <SectionHeading title="Education" subtitle="Academic background and qualifications" />
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              {education.map((edu, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <GlassCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">{edu.degree}</h3>
                        <p className="text-sm text-primary font-medium">{edu.school}</p>
                        <Badge variant="default" className="my-2">{edu.year}</Badge>
                        <p className="text-sm text-[var(--text-muted)]">{edu.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Awards & Certifications ─── */}
        {certifications && certifications.length > 0 && (
          <section className="py-16">
            <Container>
              <ScrollReveal>
                <SectionHeading title="Awards & Certifications" subtitle="Honors, professional credentials, and milestones" />
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {certifications.map((cert, i) => (
                  <ScrollReveal key={i} delay={i * 0.1}>
                    <GlassCard className="h-full hover-glow flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)] leading-snug">{cert.title}</h3>
                            <p className="text-xs text-primary font-medium mt-0.5">{cert.organization}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{cert.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <Badge variant="default" className="text-[10px]">{cert.year}</Badge>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* ─── Skills Summary ─── */}
        <section className="py-16 bg-[var(--bg-secondary)]/30">
          <Container>
            <ScrollReveal>
              <SectionHeading title="Technical Skills" subtitle="Core competencies and tools" />
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {skillGroups.map((group, i) => (
                <ScrollReveal key={group.name} delay={i * 0.1}>
                  <GlassCard>
                    <h3 className="font-bold mb-4 text-[var(--text-primary)]">{group.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map(skill => (
                        <span key={skill} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium hover:border-primary/30 hover:text-primary transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── Download CTA ─── */}
        <section className="py-16">
          <Container>
            <ScrollReveal variant="scale">
              <GlassCard className="text-center max-w-2xl mx-auto gradient-border" padding="p-10">
                <h2 className="text-3xl font-bold gradient-text mb-4">Download Full Resume</h2>
                <p className="text-[var(--text-muted)] mb-8">
                  Get the complete professional profile in PDF format with detailed project history and references.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="primary" size="lg" onClick={handleDownloadPDF} disabled={downloading}>
                    {downloading ? (
                      <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Generating…</>
                    ) : (
                      <><Download className="w-5 h-5 inline mr-2" />Download PDF Resume →</>
                    )}
                  </Button>
                  {profile.cvUrl && (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg">
                        <FileText className="w-5 h-5 inline mr-2" />View Uploaded CV
                      </Button>
                    </a>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>
      </main>
    </>
  );
}
