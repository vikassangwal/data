const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@devfort.com';
  const password = 'admin';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: 'SUPER-ADMIN',
        passwordHash,
      }
    });
    console.log('Admin user updated!');
  } else {
    await prisma.user.create({
      data: {
        name: 'DevFort Admin',
        username: 'admin',
        email,
        passwordHash,
        role: 'SUPER-ADMIN',
        emailVerified: new Date(),
        termsAccepted: true,
      }
    });
    console.log('Admin user created!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
