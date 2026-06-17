import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Alex Kumar — Data Analyst & AI Engineer',
  description: 'Learn about Alex Kumar — a seasoned data analyst, AI engineer, and full-stack developer with 7+ years of experience delivering enterprise-grade solutions.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
