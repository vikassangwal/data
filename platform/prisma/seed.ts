const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devforge.com' },
    update: {},
    create: {
      email: 'admin@devforge.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created/verified');

  // 2. Create Global Settings
  await prisma.siteSettings.create({
    data: {
      siteName: 'DevForge AI Studio',
      maintenanceMode: false,
      theme: 'dark',
      contactEmail: 'hello@devforge.com',
      seoTitle: 'DevForge - AI & Analytics Agency',
      seoDesc: 'Enterprise-grade AI solutions and data analytics platforms.',
    },
  });
  console.log('✅ Site settings created');

  // 3. Create Sample Service
  const service = await prisma.service.upsert({
    where: { slug: 'ai-development' },
    update: {},
    create: {
      slug: 'ai-development',
      title: 'Custom AI Development',
      description: 'End-to-end AI solutions using state-of-the-art language models and computer vision.',
      isActive: true,
      features: {
        create: [
          { title: 'Custom LLM Fine-tuning' },
          { title: 'RAG Implementation' },
        ],
      },
      pricing: {
        create: {
          basePrice: 5000,
          currency: 'USD',
          type: 'fixed',
        },
      },
    },
  });
  console.log('✅ Services created');

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
