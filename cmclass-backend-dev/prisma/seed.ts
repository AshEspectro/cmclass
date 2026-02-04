import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  

 
  
  // Services seed data (3 sample services)
  const services = [
    {
      title: 'Service Sur-Mesure',
      description: 'Création et ajustement sur-mesure par nos artisans.',
      imageUrl: 'https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=800&q=80',
      link: '/services/sur-mesure',
      order: 1,
      isActive: true,
    },
    {
      title: 'Sélection Exclusive',
      description: 'Accès à des pièces sélectionnées par nos stylistes.',
      imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      link: '/services/selection-exclusive',
      order: 2,
      isActive: true,
    },
    {
      title: 'Conseil Privé',
      description: 'Rendez-vous privé avec un consultant style.',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      link: '/services/conseil-prive',
      order: 3,
      isActive: true,
    },
  ];

  // Clear existing services and create new ones
  await prisma.service.deleteMany({});
  for (const svc of services) {
    await prisma.service.create({ data: svc });
  }

  console.log('✅ Seed completed: 4 campaigns and 3 services created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
