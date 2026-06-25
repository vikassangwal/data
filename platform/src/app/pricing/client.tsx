'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Accordion from '@/components/ui/Accordion';
import DataGridBG from '@/components/vfx/DataGridBG';
// import { simulateCheckout } from '@/app/actions/pricing';

/* ─── Add-Ons ─── */
const addOns = [
  {
    name: 'Extra Dashboard',
    price: 99,
    desc: 'Add a fully customisable analytics dashboard to any plan.',
    icon: (
      <svg className="w-6 h-6 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    name: 'AI Chatbot',
    price: 199,
    desc: 'Conversational AI trained on your data for 24/7 customer support.',
    icon: (
      <svg className="w-6 h-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp Bot',
    price: 149,
    desc: 'Automated WhatsApp Business integration with smart replies.',
    icon: (
      <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2a10 10 0 00-8.66 15l-1.1 4.1 4.2-1.1A10 10 0 1012 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Custom API',
    price: 299,
    desc: 'Dedicated API endpoints with custom schemas and rate limits.',
    icon: (
      <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M10 20l4-16M18 8l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── FAQ Data ─── */
const faqItems = [
  {
    id: 'faq-1',
    title: 'Can I switch plans or cancel at any time?',
    content:
      'Absolutely. Upgrade, downgrade, or cancel with zero friction — no lock-in contracts. Changes are prorated and take effect on your next billing cycle.',
  },
  {
    id: 'faq-2',
    title: 'What payment methods do you accept?',
    content:
      'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, wire transfers for Enterprise plans, and cryptocurrency (BTC, ETH) upon request.',
  },
  {
    id: 'faq-3',
    title: 'Is there a free trial available?',
    content:
      'Yes! The Professional plan includes a 14-day free trial with full feature access. No credit card required to start — just sign up and explore.',
  },
  {
    id: 'faq-4',
    title: 'How does the annual billing discount work?',
    content:
      'When you choose annual billing, you save 20% compared to monthly pricing. You are billed once per year, and can switch back to monthly billing at renewal.',
  },
];

/* ─── Checkmark Icon ─── */
function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function PricingClient({ tiers, currentPlanId = 'trial' }: { tiers: any[]; currentPlanId?: string }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCheckout = async (planId: string, baseAmount: number) => {
    setLoadingTier(planId);
    setFeedback(null);
    try {
      const currency = isInternational ? 'USD' : 'INR';
      // Approximate conversion if baseAmount is stored in INR
      const amount = isInternational ? Math.ceil(baseAmount / 83) : baseAmount;

      // 1. Load Razorpay script
      const scriptLoaded = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        setFeedback('Error: Failed to load Razorpay SDK');
        setLoadingTier(null);
        return;
      }

      // 2. Create Order
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, amount, currency })
      });
      const data = await response.json();

      if (data.error) {
        setFeedback('Error: ' + data.error);
        setLoadingTier(null);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Make sure this env var is public
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Platform Access',
        description: `Upgrade to ${planId} Plan`,
        order_id: data.order.id,
        handler: async function (response: any) {
          setFeedback('Verifying payment...');
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              planId,
              amount
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setFeedback('Payment successful! Your plan has been upgraded.');
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setFeedback('Error: Payment verification failed.');
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setFeedback('Error: Payment failed - ' + response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      setFeedback('Unexpected error during checkout.');
    } finally {
      // Don't clear loading state if opening modal so it shows "Processing..."
    }
  };

  return (
    <main className="min-h-screen pb-20">
      {feedback && (
        <Container className="mb-6 max-w-xl mx-auto relative z-20 pt-28 animate-fade-in">
          <div className={`p-4 rounded-xl text-sm font-semibold border text-center ${
            feedback.includes('Error') || feedback.includes('failed') || feedback.includes('Unexpected')
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {feedback}
          </div>
        </Container>
      )}
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <DataGridBG />
        {/* Ambient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <Container className="relative z-10 text-center">
          <ScrollReveal>
            <Badge variant="primary" className="mb-5 animate-pulse-glow">
              ⚡ Transparent Pricing
            </Badge>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              <span className="gradient-text">Value Configuration</span>{' '}
              <span className="text-[var(--text-primary)]">Engine</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Engineer your perfect stack. Toggle features, pick add-ons, and configure
              a pricing tier that maps precisely to the value you need.
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* ═══════════════════ BILLING & CURRENCY TOGGLES ═══════════════════ */}
      <section className="relative z-10 -mt-8 mb-4">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Annual Toggle */}
            <ScrollReveal>
              <div className="flex items-center justify-center gap-4">
                <span
                  className={\`text-sm font-semibold transition-colors duration-300 \${
                    !isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }\`}
                >
                  Monthly
                </span>

                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={\`relative w-16 h-8 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none \${
                    isAnnual
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]'
                      : 'bg-[var(--bg-secondary)]'
                  }\`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                    animate={{ x: isAnnual ? 32 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>

                <span
                  className={\`text-sm font-semibold transition-colors duration-300 flex items-center gap-2 \${
                    isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }\`}
                >
                  Annual
                  <Badge variant="primary" className="text-xs !py-0.5 !px-2 animate-pulse-glow">
                    Save 20%
                  </Badge>
                </span>
              </div>
            </ScrollReveal>

            {/* Currency Toggle */}
            <ScrollReveal delay={0.1}>
              <div className="flex items-center justify-center gap-4 bg-slate-900/50 p-2 border border-slate-800 rounded-full">
                <button
                  onClick={() => setIsInternational(false)}
                  className={\`px-4 py-1.5 rounded-full text-sm font-bold transition-all \${
                    !isInternational ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  National (INR)
                </button>
                <button
                  onClick={() => setIsInternational(true)}
                  className={\`px-4 py-1.5 rounded-full text-sm font-bold transition-all \${
                    isInternational ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  International (USD)
                </button>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ═══════════════════ PRICING TIERS ═══════════════════ */}
      <section className="py-16">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
            {tiers.map((tier, i) => {
              const price = isAnnual ? tier.annual : tier.monthly;

              return (
                <ScrollReveal key={tier.name} delay={i * 0.12} variant="slide-up">
                  <motion.div
                    className={`relative ${tier.popular ? 'md:-mt-6 md:-mb-0' : ''}`}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Popular badge */}
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <Badge
                          variant="primary"
                          className="shadow-lg shadow-[#3B82F6]/30 text-xs px-5 py-1.5 animate-pulse-glow"
                        >
                          ★ Most Popular
                        </Badge>
                      </div>
                    )}

                    <GlassCard
                      className={`h-full flex flex-col transition-all duration-500 ${
                        tier.popular
                           ? 'gradient-border ring-1 ring-[#3B82F6]/20 py-2'
                           : 'hover:ring-1 hover:ring-[var(--glass-border)]'
                      }`}
                      padding="p-8"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[var(--bg-secondary)]">
                            {tier.icon}
                          </div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)]">{tier.name}</h3>
                        </div>
                        {isAnnual && tier.discount > 0 && (
                          <Badge variant="primary" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Save {tier.discount}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-[var(--text-muted)] text-sm mb-6">{tier.desc}</p>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[var(--text-muted)] text-lg">$</span>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${tier.name}-${isAnnual}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <AnimatedCounter
                                target={price}
                                duration={800}
                                className="text-4xl lg:text-5xl font-bold gradient-text"
                              />
                            </motion.div>
                          </AnimatePresence>
                          <span className="text-[var(--text-muted)] text-sm ml-1">
                            /{isAnnual ? 'mo' : 'month'}
                          </span>
                        </div>
                        {isAnnual && (
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            <span className="line-through">${tier.monthly}/mo</span>
                            <span className="text-[#10B981] ml-2 font-medium">
                              Save ${(tier.monthly - tier.annual) * 12}/yr
                            </span>
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mb-8">
                        {(() => {
                          const isCurrent = currentPlanId.toLowerCase() === tier.id.toLowerCase() || 
                                            currentPlanId.toLowerCase() === tier.name.toLowerCase();
                          const hasPaidSubscription = currentPlanId.toLowerCase() !== 'trial';

                          if (isCurrent) {
                            return (
                              <Button
                                variant="outline"
                                size="lg"
                                fullWidth
                                disabled
                                className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed font-semibold"
                              >
                                Active Plan
                              </Button>
                            );
                          }

                          if (hasPaidSubscription) {
                            return (
                              <div className="text-center py-2.5 text-xs text-[var(--text-muted)] font-semibold bg-[var(--muted)]/35 rounded-xl border border-[var(--glass-border)]">
                                Subscribed to {currentPlanId.toUpperCase()}
                              </div>
                            );
                          }

                          return (
                            <Button
                              variant={tier.ctaVariant as any}
                              size="lg"
                              fullWidth
                              disabled={loadingTier !== null}
                              onClick={() => handleCheckout(tier.id, price)}
                              className={
                                tier.popular
                                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] border-0 text-white hover:shadow-lg hover:shadow-[#3B82F6]/25 cursor-pointer'
                                  : 'cursor-pointer'
                              }
                            >
                              {loadingTier === tier.id ? 'Processing...' : tier.cta}
                            </Button>
                          );
                        })()}
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mb-6" />

                      {/* Features */}
                      <ul className="space-y-3 flex-1">
                        {tier.features.map((feature: string) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <CheckIcon />
                            <span className="text-[var(--text-primary)]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ═══════════════════ ADD-ONS ═══════════════════ */}
      <section className="py-16 relative">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="Power-Up Add-Ons"
              subtitle="Extend any plan with modular add-ons. Mix and match to build your perfect stack."
              align="center"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
            {addOns.map((addon, i) => (
              <ScrollReveal key={addon.name} delay={i * 0.1} variant="scale">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <GlassCard
                    className="h-full flex flex-col text-center hover:ring-1 hover:ring-[var(--glass-border)] transition-all duration-300"
                    padding="p-6"
                  >
                    <div className="mx-auto mb-4 p-3 rounded-xl bg-[var(--bg-secondary)] inline-flex">
                      {addon.icon}
                    </div>
                    <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                      {addon.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mb-4 flex-1 leading-relaxed">
                      {addon.desc}
                    </p>
                    <div className="mt-auto">
                      <span className="text-2xl font-bold gradient-text">${addon.price}</span>
                      <span className="text-[var(--text-muted)] text-xs">/month</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-3 w-full">
                      Add to Plan
                    </Button>
                  </GlassCard>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-16">
        <Container>
          <ScrollReveal>
            <SectionHeading
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about billing and plans."
              align="center"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="max-w-3xl mx-auto mt-10">
              <Accordion items={faqItems} />
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ═══════════════════ CUSTOM QUOTE CTA ═══════════════════ */}
      <section className="py-16">
        <Container>
          <ScrollReveal variant="scale">
            <GlassCard
              className="text-center max-w-3xl mx-auto gradient-border relative overflow-hidden"
              padding="p-10 sm:p-14"
            >
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#3B82F6]/10 blur-3xl pointer-events-none animate-float-slow" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none animate-float-delayed" />

              <div className="relative z-10">
                <Badge variant="primary" className="mb-4">
                  Custom Solutions
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  <span className="gradient-text">Need a Custom Quote?</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  Have unique requirements? Our solutions architects will design a
                  bespoke package tailored to your exact operational needs and budget.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/contact">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] border-0 text-white hover:shadow-lg hover:shadow-[#3B82F6]/25"
                    >
                      Talk to Sales
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    Book a Demo
                  </Button>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
