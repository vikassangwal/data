const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@devforge.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER-ADMIN',
      passwordHash: passwordHash
    },
    create: {
      email,
      name: 'Super Admin',
      passwordHash: passwordHash,
      role: 'SUPER-ADMIN',
      planId: 'enterprise'
    }
  });

  console.log(`Successfully seeded/upgraded ${user.email} with role ${user.role}! Password is 'admin123'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
