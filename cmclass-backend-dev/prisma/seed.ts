import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  
  

  // Seed sample categories
  await prisma.category.upsert({
    where: { slug: 'robes' },
    update: {},
    create: {
      name: 'Robes',
      slug: 'robes',
      description: 'Robe de haute couture pour occasions spéciales',
      imageUrl: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?auto=format&fit=crop&w=800&q=80',
      active: true,
      order: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'accessoires' },
    update: {},
    create: {
      name: 'Accessoires',
      slug: 'accessoires',
      description: 'Sacs, ceintures et bijoux',
      imageUrl: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=800&q=80',
      active: true,
      order: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'manteaux' },
    update: {},
    create: {
      name: 'Manteaux',
      slug: 'manteaux',
      description: 'Manteaux et vestes de saison',
      imageUrl: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?auto=format&fit=crop&w=800&q=80',
      active: true,
      order: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'bijoux' },
    update: {},
    create: {
      name: 'Bijoux',
      slug: 'bijoux',
      description: 'Colliers, bracelets et bijoux de créateur',
      imageUrl: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?auto=format&fit=crop&w=800&q=80',
      active: true,
      order: 4,
    },
  });

  // Additional main categories matching MegaMenu structure
  const mainCats = [
    { name: 'Homme', slug: 'homme', description: 'Collection homme', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80', order: 10 },
    { name: 'Femme', slug: 'femme', description: 'Collection femme', imageUrl: 'https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=1200&q=80', order: 20 },
    { name: 'Parfums et Beauté', slug: 'parfums', description: 'Parfums et soins', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80', order: 30 },
    { name: 'Joaillerie', slug: 'joaillerie', description: 'Bijoux de créateur', imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80', order: 40 },
    { name: 'Sacs et Petite Maroquinerie', slug: 'sacs', description: 'Sacs et maroquinerie', imageUrl: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=1200&q=80', order: 50 },
    { name: 'Nouveautés', slug: 'nouveautes', description: 'Dernières créations', imageUrl: 'https://images.unsplash.com/photo-1600180758890-8f0a1a6b6b6a?auto=format&fit=crop&w=1200&q=80', order: 60 },
    { name: 'Services', slug: 'services', description: 'Services sur mesure', imageUrl: 'https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=1200&q=80', order: 70 },
    { name: 'Cadeaux et Personnalisation', slug: 'cadeaux', description: 'Cadeaux et personnalisation', imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80', order: 80 },
    { name: 'Montres', slug: 'montres', description: 'Collections de montres', imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80', order: 90 },
    { name: 'Malles, Voyage et Maison', slug: 'voyage', description: 'Articles de voyage et maison', imageUrl: 'https://images.unsplash.com/photo-1505577058444-a3dabf1b1f3b?auto=format&fit=crop&w=1200&q=80', order: 100 },
    { name: 'La Maison CM CLASS', slug: 'a-propos', description: 'À propos de la maison', imageUrl: 'https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=1200&q=80', order: 110 },
  ];

  for (const mc of mainCats) {
    await prisma.category.upsert({ where: { slug: mc.slug }, update: {}, create: { name: mc.name, slug: mc.slug, description: mc.description, imageUrl: mc.imageUrl, active: true, order: mc.order } });
  }

  // Create subcategories for main categories
  const homme = await prisma.category.findUnique({ where: { slug: 'homme' } });
  const femme = await prisma.category.findUnique({ where: { slug: 'femme' } });
  const sacsCat = await prisma.category.findUnique({ where: { slug: 'sacs' } });
  const parfums = await prisma.category.findUnique({ where: { slug: 'parfums' } });
  const joaillerie = await prisma.category.findUnique({ where: { slug: 'joaillerie' } });
  const cadeaux = await prisma.category.findUnique({ where: { slug: 'cadeaux' } });

  if (homme) {
    const subs = [
      { name: 'Chemises', slug: 'chemises', description: 'Chemises homme', imageUrl: '', order: 1 },
      { name: 'Pantalons', slug: 'pantalons', description: 'Pantalons homme', imageUrl: '', order: 2 },
      { name: 'Vestes', slug: 'vestes', description: 'Vestes homme', imageUrl: '', order: 3 },
      { name: 'Tout Voir', slug: 'homme-tout', description: 'Voir toute la collection homme', imageUrl: '', order: 4 },
    ];
    for (const s of subs) {
      await prisma.category.upsert({ where: { slug: s.slug }, update: { parentId: homme.id }, create: { name: s.name, slug: s.slug, description: s.description, imageUrl: s.imageUrl, parentId: homme.id, active: true, order: s.order } });
    }
  }

  if (femme) {
    const subs = [
      { name: 'Robes', slug: 'robes', description: 'Robes femme', imageUrl: '', order: 1 },
      { name: 'Pantalons', slug: 'femme-pantalons', description: 'Pantalons femme', imageUrl: '', order: 2 },
      { name: 'Vestes', slug: 'femme-vestes', description: 'Vestes femme', imageUrl: '', order: 3 },
      { name: 'Accessoires', slug: 'femme-accessoires', description: 'Accessoires femme', imageUrl: '', order: 4 },
    ];
    for (const s of subs) {
      await prisma.category.upsert({ where: { slug: s.slug }, update: { parentId: femme.id }, create: { name: s.name, slug: s.slug, description: s.description, imageUrl: s.imageUrl, parentId: femme.id, active: true, order: s.order } });
    }
  }

  if (sacsCat) {
    const subs = [
      { name: 'Sacs à Main', slug: 'sacs-main', description: 'Sacs à main', imageUrl: '', order: 1 },
      { name: 'Petite Maroquinerie', slug: 'petite-maroquinerie', description: 'Petite maroquinerie', imageUrl: '', order: 2 },
    ];
    for (const s of subs) {
      await prisma.category.upsert({ where: { slug: s.slug }, update: { parentId: sacsCat.id }, create: { name: s.name, slug: s.slug, description: s.description, imageUrl: s.imageUrl, parentId: sacsCat.id, active: true, order: s.order } });
    }
  }

  if (parfums) {
    const subs = [
      { name: 'Parfums', slug: 'parfums-parfums', description: 'Parfums', imageUrl: '', order: 1 },
      { name: 'Soins', slug: 'parfums-soins', description: 'Soins et beauté', imageUrl: '', order: 2 },
    ];
    for (const s of subs) {
      await prisma.category.upsert({ where: { slug: s.slug }, update: { parentId: parfums.id }, create: { name: s.name, slug: s.slug, description: s.description, imageUrl: s.imageUrl, parentId: parfums.id, active: true, order: s.order } });
    }
  }

  if (joaillerie) {
    await prisma.category.upsert({ where: { slug: 'joaillerie-bijoux' }, update: { parentId: joaillerie.id }, create: { name: 'Bijoux', slug: 'joaillerie-bijoux', description: 'Bijoux', imageUrl: '', parentId: joaillerie.id, active: true, order: 1 } });
  }

  if (cadeaux) {
    const subs = [
      { name: 'Cadeaux pour Lui', slug: 'cadeaux-lui', description: 'Idées cadeaux pour hommes', imageUrl: '', order: 1 },
      { name: 'Personnalisation', slug: 'cadeaux-personnalisation', description: 'Personnalisation de produits', imageUrl: '', order: 2 },
    ];
    for (const s of subs) {
      await prisma.category.upsert({ where: { slug: s.slug }, update: { parentId: cadeaux.id }, create: { name: s.name, slug: s.slug, description: s.description, imageUrl: s.imageUrl, parentId: cadeaux.id, active: true, order: s.order } });
    }
  }

  // Seed sample products attached to categories (if they exist)
  const robes = await prisma.category.findUnique({ where: { slug: 'robes' } });
  const accessoires = await prisma.category.findUnique({ where: { slug: 'accessoires' } });
  const manteaux = await prisma.category.findUnique({ where: { slug: 'manteaux' } });
  const bijoux = await prisma.category.findUnique({ where: { slug: 'bijoux' } });

  if (robes) {
    await prisma.product.upsert({
      where: { slug: 'robe-de-soiree' },
      update: {},
      create: {
        name: 'Robe de Soirée en Soie',
        slug: 'robe-de-soiree',
        description: 'Robe de soirée exclusive en soie',
        imageUrl: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?auto=format&fit=crop&w=800&q=80',
        priceCents: 250000,
        stock: 12,
        colors: ['Rouge', 'Noir'],
        sizes: ['S','M','L'],
        categoryId: robes.id,
      },
    });
  }

  if (accessoires) {
    await prisma.product.upsert({
      where: { slug: 'sac-a-main' },
      update: {},
      create: {
        name: 'Sac à Main en Cuir',
        slug: 'sac-a-main',
        description: 'Sac à main en cuir italien',
        imageUrl: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=800&q=80',
        priceCents: 185000,
        stock: 24,
        colors: ['Noir','Marron'],
        sizes: [],
        categoryId: accessoires.id,
      },

    });
  }

  if (manteaux) {
    await prisma.product.upsert({
      where: { slug: 'manteau-cachemire' },
      update: {},
      create: {
        name: 'Manteau en Cachemire',
        slug: 'manteau-cachemire',
        description: 'Manteau en cachemire doux',
        imageUrl: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?auto=format&fit=crop&w=800&q=80',
        priceCents: 320000,
        stock: 8,
        colors: ['Camel','Noir'],
        sizes: ['M','L'],
        categoryId: manteaux.id,
      },

    });
  }

  if (bijoux) {
    await prisma.product.upsert({
      where: { slug: 'boucles-doreilles-diamant' },
      update: {},
      create: {
        name: "Boucles d'Oreilles Diamant",
        slug: 'boucles-doreilles-diamant',
        description: 'Boucles d\'oreilles en diamant',
        imageUrl: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?auto=format&fit=crop&w=800&q=80',
        priceCents: 560000,
        stock: 3,
        colors: [],
        sizes: [],
        categoryId: bijoux.id,
      },
    });
  }

  console.log('Seed complete: sample categories and products created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
