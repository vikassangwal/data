import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills & Expertise | Alex Kumar',
  description: 'Explore Alex Kumar\'s technical skills across Data Analytics, AI & Machine Learning, Web Development, Automation, and Cloud & DevOps.',
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
