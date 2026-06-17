const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.errorLog.count();
  console.log("ErrorLog count:", count);
  const logs = await prisma.errorLog.findMany();
  console.log(logs);
}
main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
