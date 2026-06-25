import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all active projects
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  // Get all published blog posts
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const projectUrls = projects.map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const coreServices = [
    'data-analytics',
    'dashboard-development',
    'business-intelligence',
    'ai-agent-services',
    'ai-chatbots',
    'whatsapp-automation',
    'web-automation',
    'custom-software'
  ];

  const serviceUrls = coreServices.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...serviceUrls,
    ...projectUrls,
    ...blogUrls,
  ];
}
