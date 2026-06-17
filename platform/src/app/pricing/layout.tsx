import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Alex Kumar',
  description: 'Transparent pricing plans for data analytics, AI, and software development services. Choose Starter, Professional, or Enterprise.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
