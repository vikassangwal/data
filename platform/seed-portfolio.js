const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || "postgresql://neondb_owner:npg_yXR0JUAai4Ps@ep-crimson-recipe-aha143gh.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function main() {
  const projects = [
    {
      title: 'Automata Labs',
      slug: 'automata-labs',
      description: 'An advanced AI automation platform and laboratory.',
      category: 'AI & Automation',
      liveUrl: 'https://automata-labs.vercel.app/',
      gradient: 'from-blue-500 to-cyan-500',
      isActive: true,
    },
    {
      title: 'AI Booking Agent',
      slug: 'ai-booking-agent',
      description: 'An intelligent AI booking agent built for modern businesses.',
      category: 'AI Agents',
      liveUrl: 'https://ai-booking-agent-r2go.onrender.com/',
      gradient: 'from-purple-500 to-indigo-500',
      isActive: true,
    },
    {
      title: 'Study Fintech',
      slug: 'study-fintech',
      description: 'A dedicated platform for financial technology learning and insights.',
      category: 'Fintech & EdTech',
      liveUrl: 'https://studyfintech.vercel.app/',
      gradient: 'from-green-500 to-emerald-500',
      isActive: true,
    },
    {
      title: 'VK Fort',
      slug: 'vk-fort',
      description: 'Enterprise AI & Analytics Dashboard.',
      category: 'Dashboard',
      liveUrl: 'https://vkfort.vercel.app/',
      gradient: 'from-orange-500 to-red-500',
      isActive: true,
    }
  ];

  console.log('Seeding portfolio projects...');

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    console.log(`✅ Upserted project: ${p.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
