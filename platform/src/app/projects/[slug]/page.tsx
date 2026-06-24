import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import prisma from '@/lib/db';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
  });
  if (!project) return { title: 'Project Not Found' };
  
  return {
    title: project.seoTitle || project.title,
    description: project.seoDesc || project.description,
    keywords: project.seoKeywords,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDesc || project.description,
      images: project.imageUrl ? [{ url: project.imageUrl }] : [],
    }
  };
}

export default async function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      metrics: true,
      tags: true,
    }
  });
  
  if (!project) {
    notFound();
  }

  // Map data correctly (ProjectTag does not have a 'type' field in Prisma schema)
  const allTags = project.tags.map(t => t.name);
  const tech = allTags.slice(0, Math.min(3, Math.max(1, Math.floor(allTags.length / 2))));
  const tags = allTags.slice(tech.length);

  const relatedDb = await prisma.project.findMany({
    where: { 
      category: project.category,
      id: { not: project.id }
    },
    take: 3
  });

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section 
        className={`relative pt-32 pb-20 overflow-hidden ${project.imageUrl ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-500'}`}
        style={
          project.imageUrl 
            ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
            : project.gradient ? { backgroundImage: `linear-gradient(to bottom right, ${project.gradient})` } : {}
        }
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <Container className="relative z-10 text-white">
          <ScrollReveal>
            <Link href="/projects" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Projects
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="default" className="bg-white/20 text-white border-white/10 backdrop-blur-md">
                {project.category}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl font-light leading-relaxed mb-10">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                  View Live Site
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-black/40 text-white font-semibold hover:bg-black/60 backdrop-blur-md border border-white/20 transition-colors inline-flex items-center gap-2">
                  View Source
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Metrics Row */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="py-12 border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {project.metrics.map((metric, i) => (
                <ScrollReveal key={i} delay={i * 100} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter target={metric.value} suffix={metric.suffix || ''} />
                  </div>
                  <div className="text-sm text-[var(--text-muted)] font-medium">{metric.label}</div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Main Content */}
      <section className="py-20">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
            {/* Left Col (Case Study) */}
            <div className="lg:col-span-2 space-y-16">
              {project.challenge && (
                <ScrollReveal>
                  <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">The Challenge</h2>
                  <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed text-lg whitespace-pre-wrap">
                    {project.challenge}
                  </div>
                </ScrollReveal>
              )}

              {project.solution && (
                <ScrollReveal>
                  <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">The Solution</h2>
                  <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed text-lg whitespace-pre-wrap">
                    {project.solution}
                  </div>
                </ScrollReveal>
              )}

              {project.results && (
                <ScrollReveal>
                  <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">The Results</h2>
                  <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed text-lg whitespace-pre-wrap">
                    {project.results}
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Right Col (Sidebar) */}
            <div className="space-y-8">
              {tech.length > 0 && (
                <ScrollReveal>
                  <GlassCard>
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {tech.map((t) => (
                        <span key={t} className="text-sm px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium border border-[var(--glass-border)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </ScrollReveal>
              )}

              {tags.length > 0 && (
                <ScrollReveal delay={100}>
                  <GlassCard>
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </ScrollReveal>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Related Projects */}
      {relatedDb.length > 0 && (
        <section className="py-20 bg-[var(--glass-bg)] border-t border-[var(--glass-border)]">
          <Container>
            <ScrollReveal>
              <SectionHeading title="More Projects" subtitle="Explore other successful case studies" />
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {relatedDb.map((p, i) => (
                <ScrollReveal key={p.slug} delay={i * 100}>
                  <Link href={`/projects/${p.slug}`} className="block h-full group">
                    <GlassCard padding="p-0" className="overflow-hidden flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-2 hover-glow">
                      <div 
                        className={`h-40 w-full p-6 flex items-end relative overflow-hidden ${p.imageUrl ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-500'}`}
                        style={
                          p.imageUrl 
                            ? { backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                            : p.gradient ? { backgroundImage: `linear-gradient(to bottom right, ${p.gradient})` } : {}
                        }
                      >
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                        <Badge variant="default" className="relative z-10 bg-white/20 text-white backdrop-blur-md border-none">
                          {p.category}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors text-[var(--text-primary)]">
                          {p.title}
                        </h3>
                        <p className="text-[var(--text-muted)] text-sm line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
