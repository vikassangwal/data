const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'vikas.sangwal.05@gmail.com';
  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER-ADMIN',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    },
    create: {
      email,
      name: 'Vikas Sangwal',
      role: 'SUPER-ADMIN',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log(`Admin user created/updated successfully!`);
  console.log(`Email: ${adminUser.email}`);
  console.log(`Role: ${adminUser.role}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
