'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import NeuralNetworkBG from '@/components/vfx/NeuralNetworkBG';

const categories = ['General', 'Technical', 'Pricing', 'Support'];

const faqData: Record<string, { q: string; a: string }[]> = {
  General: [
    { q: 'What services do you offer?', a: 'We provide data analytics, dashboard development, AI agent services, chatbot development, WhatsApp automation, web automation, and custom software solutions.' },
    { q: 'How do I get started?', a: 'Simply reach out through our contact page or schedule a free consultation. We\'ll discuss your needs and propose a tailored solution within 48 hours.' },
    { q: 'Do you work with startups or only enterprises?', a: 'We work with businesses of all sizes — from early-stage startups to Fortune 500 enterprises. Our solutions are scaled to match your needs and budget.' },
    { q: 'What industries do you specialize in?', a: 'We have experience across fintech, healthcare, e-commerce, real estate, education, and SaaS. Our data-driven approach adapts to any industry.' },
    { q: 'Can I see examples of your work?', a: 'Absolutely! Visit our Projects page to see detailed case studies with measurable results from past client engagements.' },
  ],
  Technical: [
    { q: 'What tech stack do you use?', a: 'Our primary stack includes Python, TypeScript, React/Next.js, Node.js, PostgreSQL, AWS, and various AI/ML frameworks like TensorFlow and LangChain.' },
    { q: 'Can you integrate with our existing systems?', a: 'Yes. We specialize in API integrations and can connect with virtually any existing software, database, or third-party service your business uses.' },
    { q: 'Do you provide API documentation?', a: 'Every custom API we build comes with comprehensive documentation, including endpoint specs, authentication guides, and code examples.' },
    { q: 'How do you handle data security?', a: 'We follow industry best practices including encryption at rest and in transit, role-based access control, and regular security audits. We can work within SOC 2 compliance frameworks.' },
    { q: 'Can you build real-time dashboards?', a: 'Yes. We build real-time dashboards using WebSocket connections and streaming data pipelines that update metrics in milliseconds.' },
  ],
  Pricing: [
    { q: 'How is pricing determined?', a: 'Pricing is based on project scope, complexity, and timeline. We offer both fixed-price projects and monthly retainer models. Every engagement starts with a detailed quote.' },
    { q: 'Do you offer payment plans?', a: 'Yes, we offer milestone-based payment plans for larger projects. Typically 30% upfront, 40% at midpoint, and 30% upon delivery.' },
    { q: 'Is there a refund policy?', a: 'We offer a satisfaction guarantee. If deliverables don\'t meet the agreed specifications, we\'ll revise them at no additional cost. Refund terms are detailed in our service agreement.' },
    { q: 'Are there any hidden costs?', a: 'Never. Our quotes are comprehensive and include all development, testing, and deployment costs. Third-party service fees (hosting, APIs) are communicated upfront.' },
    { q: 'Do you offer discounts for long-term contracts?', a: 'Yes, annual retainer clients receive up to 20% discount. We also offer referral discounts and startup-friendly pricing.' },
  ],
  Support: [
    { q: 'What is the typical turnaround time?', a: 'Simple projects (dashboards, automations) take 1-2 weeks. Complex solutions (AI agents, custom platforms) typically take 4-8 weeks depending on scope.' },
    { q: 'How do we communicate during the project?', a: 'We use Slack, email, and scheduled video calls. You\'ll have a dedicated project channel and weekly progress updates with demos.' },
    { q: 'Do you provide post-launch support?', a: 'Yes, every project includes 30 days of free post-launch support. Extended support packages (3, 6, or 12 months) are available.' },
    { q: 'What if I need changes after delivery?', a: 'Minor changes within scope are included. For significant modifications, we provide a change order with transparent pricing and timeline estimates.' },
    { q: 'Can I request urgent/priority delivery?', a: 'Yes, we offer priority delivery at a 25% premium. This ensures dedicated resources and accelerated timelines for time-sensitive projects.' },
  ],
};

const categoryColors: Record<string, string> = {
  General: '#3B82F6',
  Technical: '#06B6D4',
  Pricing: '#8B5CF6',
  Support: '#10B981',
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('General');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const currentFaqs = faqData[activeCategory] || [];

  return (
    <>
      {/* Neural Network BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralNetworkBG nodeCount={30} color="59, 130, 246" />
      </div>

      <main className="min-h-screen pb-20 relative z-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-28 pb-16">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <Container className="relative z-10 text-center">
            <ScrollReveal>
              <Badge variant="primary" className="mb-4">Knowledge Base</Badge>
              <SectionHeading
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about our services, process, and pricing"
              />
            </ScrollReveal>
          </Container>
        </section>

        {/* ─── Category Tabs ─── */}
        <section className="pb-20">
          <Container>
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                      activeCategory === cat
                        ? 'text-white shadow-lg'
                        : 'glass-subtle text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    style={activeCategory === cat ? {
                      background: categoryColors[cat],
                      boxShadow: `0 4px 20px ${categoryColors[cat]}40`,
                    } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* ─── FAQ Accordion ─── */}
            <div className="max-w-3xl mx-auto space-y-4">
              {currentFaqs.map((faq, i) => (
                <ScrollReveal key={`${activeCategory}-${i}`} delay={i * 0.08}>
                  <div
                    className={`glass-card overflow-hidden transition-all duration-300 ${
                      openIndex === i ? 'border-l-2' : 'border-l-2 border-l-transparent'
                    }`}
                    style={openIndex === i ? { borderLeftColor: categoryColors[activeCategory] } : {}}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
                    >
                      <span className={`font-semibold transition-colors ${openIndex === i ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {faq.q}
                      </span>
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300"
                        style={{
                          background: openIndex === i ? `${categoryColors[activeCategory]}20` : 'transparent',
                          color: openIndex === i ? categoryColors[activeCategory] : 'var(--text-muted)',
                        }}
                      >
                        <svg className={`w-4 h-4 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: openIndex === i ? '300px' : '0px', opacity: openIndex === i ? 1 : 0 }}
                    >
                      <div className="px-5 pb-5 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--glass-border)] pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
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
                <h2 className="text-3xl font-bold mb-4 gradient-text">Still Have Questions?</h2>
                <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
                  Can&apos;t find what you&apos;re looking for? Reach out directly and we&apos;ll get back to you within 24 hours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href="/contact"><Button variant="primary" size="lg">Contact Us</Button></a>
                  <a href="/pricing"><Button variant="outline" size="lg">View Pricing</Button></a>
                </div>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>
      </main>
    </>
  );
}
