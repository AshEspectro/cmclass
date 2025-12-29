import { PrismaService } from './prisma.service';

async function main() {
  const prisma = new PrismaService();
  try {
    const res: any = await prisma.testConnection();
    console.log('Connection OK:', res);
  } catch (e) {
    console.error('Connection failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
