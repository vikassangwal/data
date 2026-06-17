const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.pricingPlan.findMany();
  console.log(`Found ${plans.length} pricing plans.`);
  
  // Clear existing if any
  await prisma.pricingFeature.deleteMany();
  await prisma.pricingPlan.deleteMany();

  console.log('Seeding pricing plans...');
  
  await prisma.pricingPlan.create({
    data: {
      id: 'trial',
      name: 'Trial Plan',
      price: '0',
      basePrice: 0,
      discount: 0,
      period: 'monthly',
      order: 0,
      isPopular: false,
      features: {
        create: [
          { title: '7-Day Free Trial' },
          { title: '1,000 data rows /mo' }
        ]
      }
    }
  });

  await prisma.pricingPlan.create({
    data: {
      id: 'starter',
      name: 'Starter',
      price: '0', // It requires a string
      basePrice: 0,
      discount: 0,
      period: 'monthly',
      order: 1,
      isPopular: false,
      features: {
        create: [
          { title: '10,000 data rows /mo' },
          { title: '50 Chatbot Inquiries' },
          { title: 'Community Support' }
        ]
      }
    }
  });

  await prisma.pricingPlan.create({
    data: {
      id: 'pro',
      name: 'Professional',
      price: '49',
      basePrice: 49,
      discount: 20,
      period: 'monthly',
      order: 2,
      isPopular: true,
      features: {
        create: [
          { title: '100,000 data rows /mo' },
          { title: '500 Chatbot Inquiries' },
          { title: 'Priority Email Support' },
          { title: '14-Day Free Trial' }
        ]
      }
    }
  });

  await prisma.pricingPlan.create({
    data: {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199',
      basePrice: 199,
      discount: 20,
      period: 'monthly',
      order: 3,
      isPopular: false,
      features: {
        create: [
          { title: 'Unlimited Data Rows' },
          { title: 'Unlimited Chatbot Inquiries' },
          { title: '24/7 Phone Support' },
          { title: 'Dedicated Account Manager' }
        ]
      }
    }
  });

  console.log('Successfully seeded pricing plans!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
