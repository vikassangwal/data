const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const message = 'PrismaClientKnownRequestError: Timeout exceeded connection pool allocation size.';
  const stack = `Error: Connection pool allocation failed`;
  const relativeFilePath = 'src/app/(admin)/admin/page.tsx';
  
  try {
    const log = await prisma.errorLog.create({
      data: {
        message,
        stackTrace: stack,
        codeSnippet: null,
        filePath: relativeFilePath,
        status: 'UNRESOLVED',
      }
    });
    console.log("Created successfully:", log);
  } catch (e) {
    console.error("Failed to create log:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
