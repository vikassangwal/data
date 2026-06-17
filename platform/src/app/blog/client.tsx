'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import NeuralNetworkBG from '@/components/vfx/NeuralNetworkBG';

/* ─── Icons ─── */
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function BlogClient({ 
  initialPosts, 
  categories 
}: { 
  initialPosts: any[], 
  categories: string[] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, initialPosts]);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <>
      {/* Neural Network BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralNetworkBG nodeCount={25} color="59, 130, 246" />
      </div>

      <main className="min-h-screen pb-20 relative z-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-28 pb-16">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <Container className="relative z-10">
            <ScrollReveal>
              <div className="text-center">
                <Badge variant="primary" className="mb-4">Knowledge Hub</Badge>
                <SectionHeading
                  title="Blog & Insights"
                  subtitle="Stay ahead with data-driven knowledge, AI research, tutorials, and industry analysis"
                  align="center"
                />
              </div>
            </ScrollReveal>

            {/* Search Bar */}
            <ScrollReveal delay={0.2}>
              <div className="max-w-xl mx-auto mt-8 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm"
                />
              </div>
            </ScrollReveal>

            {/* Category Pills */}
            <ScrollReveal delay={0.3}>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] border border-[var(--glass-border)] hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ─── Featured Post ─── */}
        {featuredPost && (
          <section className="pb-12">
            <Container>
              <ScrollReveal>
                <Link href={`/blog/${featuredPost.slug}`} className="group block">
                  <GlassCard padding="p-0" className="overflow-hidden hover-glow">
                    <div className="grid md:grid-cols-2">
                      {/* Gradient Image / Background Image */}
                      <div 
                        className={`h-64 md:h-auto relative overflow-hidden ${featuredPost.imageUrl ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-500'}`}
                        style={
                          featuredPost.imageUrl 
                            ? { backgroundImage: `url(${featuredPost.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                            : featuredPost.gradient ? { backgroundImage: `linear-gradient(to bottom right, ${featuredPost.gradient})` } : {}
                        }
                      >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="primary">Featured</Badge>
                        </div>
                        {!featuredPost.imageUrl && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-15">
                            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-8 flex flex-col justify-center">
                        <Badge variant="default" className="self-start mb-3">{featuredPost.category}</Badge>
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                              {featuredPost.author.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{featuredPost.author.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                            <ClockIcon />
                            <span>{featuredPost.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </ScrollReveal>
            </Container>
          </section>
        )}

        {/* ─── Articles Grid ─── */}
        <section className="py-12">
          <Container>
            {filteredPosts.length === 0 ? (
              <ScrollReveal className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                  <SearchIcon />
                </div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-[var(--text-muted)]">Try adjusting your search or filter criteria.</p>
              </ScrollReveal>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPosts.map((post, i) => (
                  <ScrollReveal key={post.slug} delay={i * 0.1}>
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <article className="glass-card hover-glow h-full flex flex-col overflow-hidden border-l-2 border-l-transparent hover:border-l-primary transition-colors duration-300">
                        {/* Gradient Image / Background Image */}
                        <div 
                          className={`h-48 relative overflow-hidden ${post.imageUrl ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-500'}`}
                          style={
                            post.imageUrl 
                              ? { backgroundImage: `url(${post.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                              : post.gradient ? { backgroundImage: `linear-gradient(to bottom right, ${post.gradient})` } : {}
                          }
                        >
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                          <div className="absolute top-4 left-4">
                            <Badge variant="primary">{post.category}</Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-[var(--text-muted)] text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                                {post.author.avatar}
                              </div>
                              <div>
                                <p className="text-xs font-medium">{post.author.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                              <ClockIcon />
                              <span>{post.readTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium group">
                            <span>Read More</span>
                            <ArrowRightIcon />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* ─── Newsletter ─── */}
        <section className="py-16">
          <Container>
            <ScrollReveal variant="scale">
              <GlassCard className="text-center max-w-2xl mx-auto gradient-border" padding="p-10">
                <h2 className="text-2xl font-bold gradient-text mb-3">Stay Updated</h2>
                <p className="text-[var(--text-muted)] mb-6">
                  Get the latest insights on AI, data analytics, and automation delivered to your inbox.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                  <Button variant="primary">Subscribe</Button>
                </form>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>
      </main>
    </>
  );
}
