const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'SUPER-ADMIN' } });
  console.log('Admins:', admins.map(a => a.email));
}

main().catch(console.error).finally(() => prisma.$disconnect());
