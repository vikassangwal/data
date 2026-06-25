import PricingClient from './client';
import { getPricingPlans } from '@/app/actions/pricing';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

function getIconForType(iconType: string) {
  switch (iconType) {
    case 'starter':
    case 'default':
      return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
          <rect x="4" y="4" width="24" height="24" rx="4" className="stroke-[#3B82F6]" />
          <path d="M10 20l4-6 4 4 4-8" className="stroke-[#06B6D4]" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pro':
    case 'professional':
      return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
          <path d="M16 4l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" className="stroke-[#8B5CF6]" strokeLinejoin="round" />
        </svg>
      );
    case 'enterprise':
      return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
          <path d="M16 2v6M16 24v6M6.34 6.34l4.24 4.24M21.42 21.42l4.24 4.24M2 16h6M24 16h6M6.34 25.66l4.24-4.24M21.42 10.58l4.24-4.24" className="stroke-[#10B981]" strokeLinecap="round" />
          <circle cx="16" cy="16" r="5" className="stroke-[#10B981]" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
          <rect x="4" y="4" width="24" height="24" rx="4" className="stroke-[#3B82F6]" />
        </svg>
      );
  }
}

export default async function PricingPage() {
  const [session, plans] = await Promise.all([
    auth(),
    getPricingPlans()
  ]);

  const currentPlanId = session?.user?.planId || 'trial';

  // Map DB structure to UI structure
  const formattedTiers = (plans || []).map((plan: any) => {
    const basePrice = plan.basePrice || 0;
    const discount = plan.discount || 20;
    const annualPrice = Math.floor(basePrice * (1 - discount / 100));
    
    return {
      id: plan.id,
      name: plan.name,
      monthly: basePrice,
      annual: annualPrice,
      discount: discount,
      desc: plan.name.includes('Enterprise') ? 'Unlimited features for massive scale.' : `Everything you need for ${plan.name.toLowerCase()} operations.`,
      features: [
        'Dedicated Dashboard',
        'Email Support',
        'API Access',
        'Custom Integrations'
      ], // We can expand this with DB features later
      cta: "Upgrade Plan",
      ctaVariant: plan.isPopular ? "primary" : "outline",
      popular: plan.isPopular,
      icon: getIconForType(plan.name.toLowerCase())
    };
  });

  return <PricingClient tiers={formattedTiers} currentPlanId={currentPlanId} />;
}
