import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  const hashedAdmin = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedAdmin,
      role: 'ADMIN',
    },
  });

  // Seed SUPER_ADMIN
  const hashedSuper = await bcrypt.hash('0208cmclass', 10);
  await prisma.user.upsert({
    where: { email: 'herijon792@gmail.com' },
    update: {},
    create: {
      username: 'Ash',
      email: 'herijon792@gmail.com',
      password: hashedSuper,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Seed complete: admin@example.com / password123 and herijon792@gmail.com / 0208cmclass (SUPER_ADMIN)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
