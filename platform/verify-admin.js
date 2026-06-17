const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'admin@devforge.com' },
    data: { emailVerified: new Date() }
  });
  console.log('Admin email verified');
}

main().catch(console.error).finally(() => prisma.$disconnect());
