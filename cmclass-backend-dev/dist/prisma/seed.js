"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const img = (seed, w = 1200, h = 1600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const placehold = (bg, fg, text, w = 240, h = 80) => `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
const baseSizes = ['S', 'M', 'L', 'XL'];
const makeColors = (seed) => [
    { name: 'Noir', hex: '#111827', images: [img(`${seed}-noir`, 900, 1200)] },
    { name: 'Ivoire', hex: '#F5F5F5', images: [img(`${seed}-ivoire`, 900, 1200)] },
];
const monthsAgo = (n) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d;
};
async function ensureCategory(data) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing)
        return existing;
    return prisma.category.create({ data });
}
async function ensureProduct(data) {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing)
        return existing;
    return prisma.product.create({ data });
}
async function main() {
    // Seed admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cmclass.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin.cmclass';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            username: adminUsername,
            password: adminPasswordHash,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
        },
        create: {
            username: adminUsername,
            email: adminEmail,
            password: adminPasswordHash,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
        },
    });
    // Seed client users
    const clientPassword = process.env.SEED_CLIENT_PASSWORD || 'Client@123';
    const clientPasswordHash = await bcrypt.hash(clientPassword, 10);
    const clientUsers = [
        {
            username: 'amina.traore',
            email: 'amina.traore@example.com',
            title: 'Mme.',
            firstName: 'Amina',
            lastName: 'Traore',
            phoneCountryCode: '+33',
            phoneNumber: '612345678',
            dateOfBirth: new Date('1992-05-15'),
            marketingOptIn: true,
            marketingEmails: true,
            marketingSms: false,
            marketingTargetedAds: true,
        },
        {
            username: 'julien.mbala',
            email: 'julien.mbala@example.com',
            title: 'M.',
            firstName: 'Julien',
            lastName: 'Mbala',
            phoneCountryCode: '+243',
            phoneNumber: '812345678',
            dateOfBirth: new Date('1988-11-20'),
            marketingOptIn: false,
            marketingEmails: false,
            marketingSms: false,
            marketingTargetedAds: false,
        },
        {
            username: 'fatou.kone',
            email: 'fatou.kone@example.com',
            title: 'Mlle.',
            firstName: 'Fatou',
            lastName: 'Kone',
            phoneCountryCode: '+225',
            phoneNumber: '071234567',
            dateOfBirth: new Date('1995-03-10'),
            marketingOptIn: true,
            marketingEmails: true,
            marketingSms: true,
            marketingTargetedAds: true,
        },
        {
            username: 'lucas.dupond',
            email: 'lucas.dupond@example.com',
            title: 'M.',
            firstName: 'Lucas',
            lastName: 'Dupond',
            phoneCountryCode: '+33',
            phoneNumber: '712345678',
            dateOfBirth: new Date('1990-07-25'),
            marketingOptIn: true,
            marketingEmails: false,
            marketingSms: false,
            marketingTargetedAds: true,
        },
        {
            username: 'nadia.boyer',
            email: 'nadia.boyer@example.com',
            title: 'Mme.',
            firstName: 'Nadia',
            lastName: 'Boyer',
            phoneCountryCode: '+32',
            phoneNumber: '485123456',
            dateOfBirth: new Date('1985-12-30'),
            marketingOptIn: false,
            marketingEmails: false,
            marketingSms: false,
            marketingTargetedAds: false,
        },
        {
            username: 'test.user',
            email: 'user@cmclass.com',
            title: 'M.',
            firstName: 'Test',
            lastName: 'User',
            phoneCountryCode: '+243',
            phoneNumber: '999999999',
            dateOfBirth: new Date('2000-01-01'),
            marketingOptIn: true,
            marketingEmails: true,
            marketingSms: true,
            marketingTargetedAds: true,
        },
    ];
    for (const u of clientUsers) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                ...u,
                password: clientPasswordHash,
                role: 'USER',
                isActive: true,
                emailVerified: true,
            },
            create: {
                ...u,
                password: clientPasswordHash,
                role: 'USER',
                isActive: true,
                emailVerified: true,
            },
        });
    }
    // Brand (singleton)
    await prisma.brand.upsert({
        where: { id: 1 },
        update: {
            name: 'CM CLASS',
            slogan: 'Elegance congolaise contemporaine',
            description: "Maison de couture nee a Goma, alliant artisanat d'exception, minimalisme et heritage culturel.",
            contactEmail: 'contact@cmclass.cd',
            instagramUrl: 'https://instagram.com/cmclassofficiel',
            facebookUrl: 'https://facebook.com/cmclassofficiel',
            twitterUrl: 'https://twitter.com/cmclassofficiel',
            pinterestUrl: 'https://pinterest.com/cmclassofficiel',
            footerText: '(c) 2026 CM CLASS. Tous droits reserves. Fabrique a Goma.',
            primaryColor: '#007B8A',
            secondaryColor: '#111827',
            accentColor: '#F5F5F5',
            logoUrl: placehold('000000', 'FFFFFF', 'CM CLASS'),
            logoLightUrl: placehold('FFFFFF', '000000', 'CM CLASS'),
            logoDarkUrl: placehold('000000', 'FFFFFF', 'CM CLASS'),
            faviconUrl: placehold('000000', 'FFFFFF', 'C', 64, 64),
            servicesHeaderTitle: 'Nos services',
            servicesHeaderDescription: 'Des services sur mesure pour accompagner votre style, du conseil a la confection.',
        },
        create: {
            id: 1,
            name: 'CM CLASS',
            slogan: 'Elegance congolaise contemporaine',
            description: "Maison de couture nee a Goma, alliant artisanat d'exception, minimalisme et heritage culturel.",
            contactEmail: 'contact@cmclass.cd',
            instagramUrl: 'https://instagram.com/cmclassofficiel',
            facebookUrl: 'https://facebook.com/cmclassofficiel',
            twitterUrl: 'https://twitter.com/cmclassofficiel',
            pinterestUrl: 'https://pinterest.com/cmclassofficiel',
            footerText: '(c) 2026 CM CLASS. Tous droits reserves. Fabrique a Goma.',
            primaryColor: '#007B8A',
            secondaryColor: '#111827',
            accentColor: '#F5F5F5',
            logoUrl: placehold('000000', 'FFFFFF', 'CM CLASS'),
            logoLightUrl: placehold('FFFFFF', '000000', 'CM CLASS'),
            logoDarkUrl: placehold('000000', 'FFFFFF', 'CM CLASS'),
            faviconUrl: placehold('000000', 'FFFFFF', 'C', 64, 64),
            servicesHeaderTitle: 'Nos services',
            servicesHeaderDescription: 'Des services sur mesure pour accompagner votre style, du conseil a la confection.',
        },
    });
    // Hero section
    const heroData = {
        mainText: "L'ATELIER DE GOMA",
        subtext: "Une collection pensee pour l'elegance quotidienne.",
        backgroundImageUrl: img('hero-goma', 1800, 1000),
        backgroundVideoUrl: null,
        mediaType: 'image',
        ctaButtonText: 'Decouvrir',
        ctaButtonUrl: '/homme',
        isActive: true,
    };
    const existingHero = await prisma.heroSection.findFirst();
    if (existingHero) {
        await prisma.heroSection.update({ where: { id: existingHero.id }, data: heroData });
    }
    else {
        await prisma.heroSection.create({ data: heroData });
    }
    // About page
    const aboutData = {
        heroTitle: "L'ATELIER DE GOMA",
        heroImageUrl: img('about-hero', 1600, 1000),
        visionTitle: 'NOTRE VISION',
        visionParagraphs: [
            "CM CLASS incarne une mode masculine contemporaine ancree dans l'artisanat congolais.",
            'Nous creons des pieces intemporelles qui privilegient la qualite et la durabilite.',
            'Chaque collection celebre un heritage culturel vivant et une esthetique minimaliste.',
        ],
        craftTitle: 'ARTISANAT & SAVOIR-FAIRE',
        craftParagraphs: [
            'Nos ateliers perpetuent des techniques ancestrales transmises de generation en generation.',
            'Nous selectionnons des matieres nobles et des finitions soignees pour une longevite remarquable.',
            'Notre engagement soutient les artisans locaux et valorise leur expertise unique.',
        ],
        craftImageUrl: img('about-craft', 1200, 1600),
        valuesTitle: 'NOS VALEURS',
        values: [
            {
                title: 'EXCELLENCE',
                description: 'Chaque piece est concue avec une exigence de qualite sans compromis.',
            },
            {
                title: 'DURABILITE',
                description: 'Nous concevons des vetements penses pour durer, saison apres saison.',
            },
            {
                title: 'AUTHENTICITE',
                description: 'Nos creations racontent une histoire ancree dans la culture congolaise.',
            },
        ],
        ctaTitle: 'Nous contacter',
        ctaDescription: "Prenez rendez-vous pour decouvrir nos creations ou discuter d'un projet sur mesure.",
        ctaButtonText: 'Nous contacter',
        ctaButtonUrl: '/contact',
        isActive: true,
    };
    const existingAbout = await prisma.aboutPage.findFirst({ orderBy: { id: 'asc' } });
    if (existingAbout) {
        await prisma.aboutPage.update({ where: { id: existingAbout.id }, data: aboutData });
    }
    else {
        await prisma.aboutPage.create({ data: aboutData });
    }
    // Services
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
        await prisma.service.createMany({
            data: [
                {
                    title: 'Sur mesure',
                    description: 'Pieces uniques faconnees selon vos envies.',
                    imageUrl: img('service-sur-mesure', 900, 1200),
                    link: '/contact',
                    order: 1,
                    isActive: true,
                },
                {
                    title: 'Retouches & ajustements',
                    description: 'Un tombe parfait pour chaque silhouette.',
                    imageUrl: img('service-retouches', 900, 1200),
                    link: '/contact',
                    order: 2,
                    isActive: true,
                },
                {
                    title: 'Conseil en style',
                    description: 'Un accompagnement personnalise en boutique.',
                    imageUrl: img('service-style', 900, 1200),
                    link: '/contact',
                    order: 3,
                    isActive: true,
                },
            ],
        });
    }
    // Categories
    const categoryMap = {};
    categoryMap.homme = await ensureCategory({
        name: 'Homme',
        slug: 'homme',
        description: 'Silhouettes masculines raffinees et contemporaines.',
        imageUrl: img('cat-homme', 800, 1000),
        order: 1,
        active: true,
        parentId: null,
    });
    categoryMap.femme = await ensureCategory({
        name: 'Femme',
        slug: 'femme',
        description: 'Elegance feminine au quotidien et pour les grands moments.',
        imageUrl: img('cat-femme', 800, 1000),
        order: 2,
        active: true,
        parentId: null,
    });
    categoryMap.accessoires = await ensureCategory({
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Des details signature pour sublimer chaque tenue.',
        imageUrl: img('cat-accessoires', 800, 1000),
        order: 3,
        active: true,
        parentId: null,
    });
    categoryMap.chemises = await ensureCategory({
        name: 'Chemises',
        slug: 'chemises',
        description: 'Des chemises aux coupes impeccables.',
        imageUrl: img('cat-chemises', 800, 1000),
        order: 1,
        active: true,
        parentId: categoryMap.homme.id,
    });
    categoryMap.pantalons = await ensureCategory({
        name: 'Pantalons',
        slug: 'pantalons',
        description: 'Coupe moderne et confort optimal.',
        imageUrl: img('cat-pantalons', 800, 1000),
        order: 2,
        active: true,
        parentId: categoryMap.homme.id,
    });
    categoryMap.vestes = await ensureCategory({
        name: 'Vestes',
        slug: 'vestes',
        description: 'Vestes structurees pour une allure assuree.',
        imageUrl: img('cat-vestes', 800, 1000),
        order: 3,
        active: true,
        parentId: categoryMap.homme.id,
    });
    categoryMap.chemisesLongues = await ensureCategory({
        name: 'Manches longues',
        slug: 'chemises-manches-longues',
        description: "L'elegance classique revisitee.",
        imageUrl: img('cat-chemises-longues', 800, 1000),
        order: 1,
        active: true,
        parentId: categoryMap.chemises.id,
    });
    categoryMap.chemisesCourtes = await ensureCategory({
        name: 'Manches courtes',
        slug: 'chemises-manches-courtes',
        description: 'Fraicheur et style decontracte.',
        imageUrl: img('cat-chemises-courtes', 800, 1000),
        order: 2,
        active: true,
        parentId: categoryMap.chemises.id,
    });
    categoryMap.robes = await ensureCategory({
        name: 'Robes',
        slug: 'robes',
        description: 'Robes fluides et sophistiquees.',
        imageUrl: img('cat-robes', 800, 1000),
        order: 1,
        active: true,
        parentId: categoryMap.femme.id,
    });
    categoryMap.jupes = await ensureCategory({
        name: 'Jupes',
        slug: 'jupes',
        description: 'Coupe elegante, mouvement naturel.',
        imageUrl: img('cat-jupes', 800, 1000),
        order: 2,
        active: true,
        parentId: categoryMap.femme.id,
    });
    categoryMap.tailleurs = await ensureCategory({
        name: 'Tailleurs',
        slug: 'tailleurs',
        description: 'La puissance du tailoring au feminin.',
        imageUrl: img('cat-tailleurs', 800, 1000),
        order: 3,
        active: true,
        parentId: categoryMap.femme.id,
    });
    categoryMap.robesSoiree = await ensureCategory({
        name: 'Robes de soiree',
        slug: 'robes-soiree',
        description: 'Silhouettes lumineuses pour vos soirees.',
        imageUrl: img('cat-robes-soiree', 800, 1000),
        order: 1,
        active: true,
        parentId: categoryMap.robes.id,
    });
    categoryMap.robesJour = await ensureCategory({
        name: 'Robes de jour',
        slug: 'robes-jour',
        description: 'Elegance fluide au quotidien.',
        imageUrl: img('cat-robes-jour', 800, 1000),
        order: 2,
        active: true,
        parentId: categoryMap.robes.id,
    });
    categoryMap.sacs = await ensureCategory({
        name: 'Sacs',
        slug: 'sacs',
        description: 'Sacs signature pour accompagner vos journees.',
        imageUrl: img('cat-sacs', 800, 1000),
        order: 1,
        active: true,
        parentId: categoryMap.accessoires.id,
    });
    categoryMap.ceintures = await ensureCategory({
        name: 'Ceintures',
        slug: 'ceintures',
        description: 'Details raffines en cuir.',
        imageUrl: img('cat-ceintures', 800, 1000),
        order: 2,
        active: true,
        parentId: categoryMap.accessoires.id,
    });
    categoryMap.montres = await ensureCategory({
        name: 'Montres',
        slug: 'montres',
        description: "Montres intemporelles a l'allure affirmee.",
        imageUrl: img('cat-montres', 800, 1000),
        order: 3,
        active: true,
        parentId: categoryMap.accessoires.id,
    });
    // Products
    const productSeeds = [
        {
            name: 'Chemise Atelier Goma',
            slug: 'chemise-atelier-goma',
            categorySlug: 'chemises-manches-longues',
            description: 'Chemise en coton premium au col structure.',
            longDescription: 'Une chemise signature en coton peigne, pensee pour une silhouette nette et contemporaine.',
            productImage: img('prod-chemise-atelier-goma', 900, 1200),
            mannequinImage: img('prod-chemise-atelier-goma-mannequin', 900, 1200),
            images: [
                img('prod-chemise-atelier-goma-1', 900, 1200),
                img('prod-chemise-atelier-goma-2', 900, 1200),
            ],
            priceCents: 89000,
            stock: 18,
            label: 'Best Seller',
            colors: makeColors('chemise-atelier-goma'),
        },
        {
            name: 'Chemise Coton Kivu',
            slug: 'chemise-coton-kivu',
            categorySlug: 'chemises-manches-longues',
            description: 'Chemise en popeline legere et respirante.',
            longDescription: 'Popeline douce et finitions soignees pour une elegance facile au quotidien.',
            productImage: img('prod-chemise-coton-kivu', 900, 1200),
            mannequinImage: img('prod-chemise-coton-kivu-mannequin', 900, 1200),
            images: [
                img('prod-chemise-coton-kivu-1', 900, 1200),
                img('prod-chemise-coton-kivu-2', 900, 1200),
            ],
            priceCents: 79000,
            stock: 12,
            label: 'Nouveau',
            colors: makeColors('chemise-coton-kivu'),
        },
        {
            name: 'Chemise Ete du Lac',
            slug: 'chemise-ete-lac',
            categorySlug: 'chemises-manches-courtes',
            description: 'Manches courtes en lin melange.',
            longDescription: 'Une chemise legere pensee pour la saison chaude, avec un tombe fluide.',
            productImage: img('prod-chemise-ete-lac', 900, 1200),
            mannequinImage: img('prod-chemise-ete-lac-mannequin', 900, 1200),
            images: [
                img('prod-chemise-ete-lac-1', 900, 1200),
                img('prod-chemise-ete-lac-2', 900, 1200),
            ],
            priceCents: 69000,
            stock: 22,
            label: 'Essentiel',
            colors: makeColors('chemise-ete-lac'),
        },
        {
            name: 'Pantalon Sanza',
            slug: 'pantalon-sanza',
            categorySlug: 'pantalons',
            description: 'Pantalon fusele a la coupe nette.',
            longDescription: 'Un pantalon structure, facile a associer, parfait en toute saison.',
            productImage: img('prod-pantalon-sanza', 900, 1200),
            mannequinImage: img('prod-pantalon-sanza-mannequin', 900, 1200),
            images: [img('prod-pantalon-sanza-1', 900, 1200), img('prod-pantalon-sanza-2', 900, 1200)],
            priceCents: 95000,
            stock: 14,
            label: 'Iconique',
            colors: makeColors('pantalon-sanza'),
        },
        {
            name: 'Pantalon Volcan',
            slug: 'pantalon-volcan',
            categorySlug: 'pantalons',
            description: 'Tissu texture et taille ajustee.',
            longDescription: 'Un pantalon au tombe structure, ideal pour les silhouettes modernes.',
            productImage: img('prod-pantalon-volcan', 900, 1200),
            mannequinImage: img('prod-pantalon-volcan-mannequin', 900, 1200),
            images: [
                img('prod-pantalon-volcan-1', 900, 1200),
                img('prod-pantalon-volcan-2', 900, 1200),
            ],
            priceCents: 99000,
            stock: 8,
            label: 'Nouveau',
            colors: makeColors('pantalon-volcan'),
        },
        {
            name: 'Veste Kivu',
            slug: 'veste-kivu',
            categorySlug: 'vestes',
            description: 'Veste ajustee en laine froide.',
            longDescription: 'Une piece maitresse pour une allure assuree et elegante.',
            productImage: img('prod-veste-kivu', 900, 1200),
            mannequinImage: img('prod-veste-kivu-mannequin', 900, 1200),
            images: [img('prod-veste-kivu-1', 900, 1200), img('prod-veste-kivu-2', 900, 1200)],
            priceCents: 125000,
            stock: 6,
            label: 'Collection',
            colors: makeColors('veste-kivu'),
        },
        {
            name: 'Veste Ebene',
            slug: 'veste-ebene',
            categorySlug: 'vestes',
            description: 'Veste double boutonnage aux finitions luxueuses.',
            longDescription: 'Une silhouette affirmee, ideale pour les occasions speciales.',
            productImage: img('prod-veste-ebene', 900, 1200),
            mannequinImage: img('prod-veste-ebene-mannequin', 900, 1200),
            images: [img('prod-veste-ebene-1', 900, 1200), img('prod-veste-ebene-2', 900, 1200)],
            priceCents: 135000,
            stock: 5,
            label: 'Edition limitee',
            colors: makeColors('veste-ebene'),
        },
        {
            name: 'Robe Lumiere',
            slug: 'robe-lumiere',
            categorySlug: 'robes-soiree',
            description: 'Robe de soiree fluide, finition satinee.',
            longDescription: 'Une robe lumineuse pensee pour les grandes occasions.',
            productImage: img('prod-robe-lumiere', 900, 1200),
            mannequinImage: img('prod-robe-lumiere-mannequin', 900, 1200),
            images: [img('prod-robe-lumiere-1', 900, 1200), img('prod-robe-lumiere-2', 900, 1200)],
            priceCents: 150000,
            stock: 4,
            label: 'Soiree',
            colors: makeColors('robe-lumiere'),
        },
        {
            name: 'Robe Kivu',
            slug: 'robe-kivu',
            categorySlug: 'robes-jour',
            description: 'Robe de jour a la coupe naturelle.',
            longDescription: 'Confortable et elegante, parfaite pour la journee.',
            productImage: img('prod-robe-kivu', 900, 1200),
            mannequinImage: img('prod-robe-kivu-mannequin', 900, 1200),
            images: [img('prod-robe-kivu-1', 900, 1200), img('prod-robe-kivu-2', 900, 1200)],
            priceCents: 120000,
            stock: 10,
            label: 'Nouveau',
            colors: makeColors('robe-kivu'),
        },
        {
            name: 'Jupe Atelier',
            slug: 'jupe-atelier',
            categorySlug: 'jupes',
            description: 'Jupe midi structuree.',
            longDescription: 'Une jupe elegante pour composer des looks raffines.',
            productImage: img('prod-jupe-atelier', 900, 1200),
            mannequinImage: img('prod-jupe-atelier-mannequin', 900, 1200),
            images: [img('prod-jupe-atelier-1', 900, 1200), img('prod-jupe-atelier-2', 900, 1200)],
            priceCents: 75000,
            stock: 9,
            label: 'Essentiel',
            colors: makeColors('jupe-atelier'),
        },
        {
            name: 'Tailleur Essentiel',
            slug: 'tailleur-essentiel',
            categorySlug: 'tailleurs',
            description: 'Tailleur feminin a la coupe architecturale.',
            longDescription: "L'allure du tailoring reinvertee pour un style affirme.",
            productImage: img('prod-tailleur-essentiel', 900, 1200),
            mannequinImage: img('prod-tailleur-essentiel-mannequin', 900, 1200),
            images: [
                img('prod-tailleur-essentiel-1', 900, 1200),
                img('prod-tailleur-essentiel-2', 900, 1200),
            ],
            priceCents: 160000,
            stock: 0,
            label: 'Epuise',
            colors: makeColors('tailleur-essentiel'),
        },
        {
            name: 'Sac Atelier',
            slug: 'sac-atelier',
            categorySlug: 'sacs',
            description: 'Sac structure en cuir graine.',
            longDescription: 'Un sac signature pense pour accompagner votre quotidien.',
            productImage: img('prod-sac-atelier', 900, 1200),
            mannequinImage: img('prod-sac-atelier-mannequin', 900, 1200),
            images: [img('prod-sac-atelier-1', 900, 1200), img('prod-sac-atelier-2', 900, 1200)],
            priceCents: 180000,
            stock: 7,
            label: 'Signature',
            colors: [
                { name: 'Cognac', hex: '#9C6644', images: [img('prod-sac-atelier-cognac', 900, 1200)] },
                { name: 'Noir', hex: '#111827', images: [img('prod-sac-atelier-noir', 900, 1200)] },
            ],
        },
        {
            name: 'Ceinture Kivu',
            slug: 'ceinture-kivu',
            categorySlug: 'ceintures',
            description: 'Ceinture en cuir lisse, boucle satinee.',
            longDescription: 'Une ceinture sobre et elegante, ideale pour finaliser la tenue.',
            productImage: img('prod-ceinture-kivu', 900, 1200),
            mannequinImage: img('prod-ceinture-kivu-mannequin', 900, 1200),
            images: [img('prod-ceinture-kivu-1', 900, 1200), img('prod-ceinture-kivu-2', 900, 1200)],
            priceCents: 45000,
            stock: 16,
            label: 'Essentiel',
            colors: [
                { name: 'Marron', hex: '#7B4B3A', images: [img('prod-ceinture-kivu-marron', 900, 1200)] },
                { name: 'Noir', hex: '#111827', images: [img('prod-ceinture-kivu-noir', 900, 1200)] },
            ],
        },
        {
            name: 'Montre Volcan',
            slug: 'montre-volcan',
            categorySlug: 'montres',
            description: 'Montre minimaliste au cadran epure.',
            longDescription: 'Une montre contemporaine pensee pour un style intemporel.',
            productImage: img('prod-montre-volcan', 900, 1200),
            mannequinImage: img('prod-montre-volcan-mannequin', 900, 1200),
            images: [img('prod-montre-volcan-1', 900, 1200), img('prod-montre-volcan-2', 900, 1200)],
            priceCents: 220000,
            stock: 3,
            label: 'Collection',
            colors: [
                { name: 'Acier', hex: '#B0B7C3', images: [img('prod-montre-volcan-acier', 900, 1200)] },
                { name: 'Or', hex: '#C9A227', images: [img('prod-montre-volcan-or', 900, 1200)] },
            ],
        },
    ];
    const productMap = new Map();
    for (const p of productSeeds) {
        const category = categoryMap[p.categorySlug];
        if (!category)
            continue;
        const stock = typeof p.stock === 'number' ? p.stock : 0;
        const created = await ensureProduct({
            name: p.name,
            slug: p.slug,
            description: p.description,
            longDescription: p.longDescription,
            productImage: p.productImage,
            mannequinImage: p.mannequinImage,
            priceCents: p.priceCents,
            stock,
            status: 'ACTIVE',
            label: p.label,
            images: p.images,
            inStock: stock > 0,
            colors: p.colors,
            sizes: baseSizes,
            categoryId: category.id,
            careInstructions: 'Nettoyage a sec recommande.',
            environmentalInfo: 'Confection locale et matieres selectionnees.',
        });
        productMap.set(created.slug, created);
    }
    // Campaigns
    const campaignCount = await prisma.campaign.count();
    if (campaignCount === 0) {
        const campaignOneProducts = [
            productMap.get('chemise-atelier-goma'),
            productMap.get('pantalon-sanza'),
            productMap.get('veste-kivu'),
            productMap.get('chemise-coton-kivu'),
        ].filter(Boolean);
        const campaignTwoProducts = [
            productMap.get('robe-lumiere'),
            productMap.get('robe-kivu'),
            productMap.get('tailleur-essentiel'),
            productMap.get('jupe-atelier'),
        ].filter(Boolean);
        await prisma.campaign.create({
            data: {
                title: 'Collection Essentiels',
                genreText: 'Capsule 2026',
                imageUrl: img('campaign-essentiels', 1600, 900),
                buttonText: 'Decouvrir la collection',
                status: 'Actif',
                selectedCategories: [
                    categoryMap.chemisesLongues?.id,
                    categoryMap.pantalons?.id,
                    categoryMap.vestes?.id,
                ].filter(Boolean),
                selectedProductIds: campaignOneProducts.map((p) => p.id),
            },
        });
        await prisma.campaign.create({
            data: {
                title: 'Signature Atelier',
                genreText: 'Edition limitee',
                imageUrl: img('campaign-atelier', 1600, 900),
                buttonText: 'Decouvrir la selection',
                status: 'Actif',
                selectedCategories: [
                    categoryMap.robesSoiree?.id,
                    categoryMap.robesJour?.id,
                    categoryMap.tailleurs?.id,
                ].filter(Boolean),
                selectedProductIds: campaignTwoProducts.map((p) => p.id),
            },
        });
    }
    // Orders
    const ordersCount = await prisma.order.count();
    if (ordersCount === 0 && productMap.size > 0) {
        const users = await prisma.user.findMany({
            where: { email: { in: clientUsers.map((u) => u.email) } },
            orderBy: { createdAt: 'asc' },
        });
        const orderSeeds = [
            {
                userEmail: clientUsers[0].email,
                status: 'DELIVERED',
                paymentStatus: 'PAID',
                createdAt: monthsAgo(4),
                items: [
                    { slug: 'chemise-atelier-goma', quantity: 1, size: 'M', color: '#111827' },
                    { slug: 'pantalon-sanza', quantity: 1, size: 'M', color: '#111827' },
                ],
            },
            {
                userEmail: clientUsers[1].email,
                status: 'SHIPPED',
                paymentStatus: 'PAID',
                createdAt: monthsAgo(2),
                items: [{ slug: 'robe-lumiere', quantity: 1, size: 'M', color: '#F5F5F5' }],
            },
            {
                userEmail: clientUsers[2].email,
                status: 'PROCESSING',
                paymentStatus: 'PENDING',
                createdAt: monthsAgo(1),
                items: [{ slug: 'veste-kivu', quantity: 2, size: 'L', color: '#111827' }],
            },
            {
                userEmail: clientUsers[3].email,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                createdAt: monthsAgo(0),
                items: [
                    { slug: 'sac-atelier', quantity: 1, size: '', color: '#9C6644' },
                    { slug: 'ceinture-kivu', quantity: 1, size: '', color: '#7B4B3A' },
                ],
            },
        ];
        for (const seed of orderSeeds) {
            const user = users.find((u) => u.email === seed.userEmail);
            if (!user)
                continue;
            const orderItems = seed.items
                .map((item) => {
                const product = productMap.get(item.slug);
                if (!product)
                    return null;
                return {
                    productId: product.id,
                    quantity: item.quantity,
                    priceCents: product.priceCents,
                    size: item.size || '',
                    color: item.color || '',
                };
            })
                .filter(Boolean);
            if (orderItems.length === 0)
                continue;
            const totalCents = orderItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
            await prisma.order.create({
                data: {
                    userId: user.id,
                    status: seed.status,
                    paymentStatus: seed.paymentStatus,
                    totalCents,
                    currency: 'CDF',
                    createdAt: seed.createdAt,
                    items: {
                        create: orderItems,
                    },
                },
            });
        }
    }
    // Signup Requests
    const signupReqCount = await prisma.signupRequest.count();
    if (signupReqCount === 0) {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        await prisma.signupRequest.createMany({
            data: [
                {
                    name: 'Marc Zinga',
                    email: 'marc.zinga@cinema.cd',
                    roleRequested: 'ADMIN',
                    message: 'Demande d acces pour la gestion des relations presse.',
                    status: 'PENDING',
                },
                {
                    name: 'Fally Ipupa',
                    email: 'fally@aigle.cd',
                    roleRequested: 'USER',
                    message: 'Je souhaite acceder a la collection privee.',
                    status: 'APPROVED',
                    processedById: admin?.id,
                    processedAt: monthsAgo(1),
                },
                {
                    name: 'Inconnu Malveillant',
                    email: 'spam@bot.com',
                    roleRequested: 'SUPER_ADMIN',
                    message: 'Give me access!',
                    status: 'DENIED',
                    processedById: admin?.id,
                    processedAt: new Date(),
                },
                {
                    name: 'Elvire Kabuya',
                    email: 'elvire.kabuya@style.com',
                    roleRequested: 'MODERATOR',
                    message: 'Creation de contenu pour le blog.',
                    status: 'PENDING',
                },
            ],
        });
    }
    // Audit Logs
    const auditLogCount = await prisma.auditLog.count();
    if (auditLogCount === 0) {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        await prisma.auditLog.createMany({
            data: [
                { actorId: admin?.id, action: 'USER_LOGIN', meta: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0' } },
                { actorId: admin?.id, action: 'PRODUCT_UPDATE', meta: { productId: 1, field: 'priceCents', old: 89000, new: 95000 } },
                { actorId: admin?.id, action: 'ORDER_STATUS_CHANGE', meta: { orderId: 1, from: 'PENDING', to: 'SHIPPED' } },
                { action: 'SIGNUP_REQUEST_CREATED', meta: { email: 'marc.zinga@cinema.cd' } },
            ],
        });
    }
    // Inbound Emails
    const emailCount = await prisma.inboundEmail.count();
    if (emailCount === 0) {
        await prisma.inboundEmail.createMany({
            data: [
                {
                    messageId: 'msg_123456',
                    fromName: 'Service Clients CMClass',
                    fromEmail: 'noreply@cmclass.com',
                    subject: 'Confirmation de votre abonnement',
                    text: 'Votre abonnement a la newsletter a ete confirme.',
                    html: '<p>Votre abonnement a la <b>newsletter</b> a ete confirme.</p>',
                    receivedAt: new Date(),
                },
                {
                    messageId: 'msg_789012',
                    fromName: 'Press Agency',
                    fromEmail: 'press@fashion.com',
                    subject: 'Article sur la nouvelle collection',
                    text: 'Nous souhaiterions publier un article sur vos createurs.',
                    receivedAt: monthsAgo(1),
                },
                {
                    messageId: 'msg_345678',
                    fromName: 'Kivu Dev',
                    fromEmail: 'support@kivudev.com',
                    subject: 'Maintenance prevue',
                    text: 'Une maintenance est prevue ce week-end.',
                    receivedAt: monthsAgo(2),
                },
            ],
        });
    }
    // Legal Content
    const legalCount = await prisma.legalContent.count();
    if (legalCount === 0) {
        await prisma.legalContent.create({
            data: {
                type: 'mentions-legales',
                title: 'Mentions Legales',
                content: `
          <h3>Propriete et Edition</h3>
          <p>Le site CMClass est edite par la Societe CM CLASS SARL, au capital de 10.000 USD.</p>
          <p>Siege social : Goma, Nord-Kivu, Republique Democratique du Congo.</p>
          <h3>Hebergement</h3>
          <p>Le site est heberge par Kivu Cloud Services.</p>
          <h3>Propriete Intellectuelle</h3>
          <p>Tous les elements du site sont la propriete exclusive de CM CLASS.</p>
        `,
            },
        });
        await prisma.legalContent.create({
            data: {
                type: 'politique-protection-donnees',
                title: 'Protection des Donnees',
                content: `
          <h3>Collecte des donnees</h3>
          <p>Nous collectons vos donnees lors de la creation de votre compte et de vos commandes.</p>
          <h3>Utilisation des donnees</h3>
          <p>Vos donnees sont utilisees pour la gestion des commandes et l'amelioration de nos services.</p>
          <h3>Vos droits</h3>
          <p>Vous disposez d'un droit d'acces, de rectification et de suppression de vos donnees.</p>
        `,
            },
        });
        await prisma.legalContent.create({
            data: {
                type: 'cgv',
                title: 'Conditions Generales de Vente',
                content: `
          <h3>Objet</h3>
          <p>Les presentes CGV regissent les relations contractuelles entre CM CLASS et ses clients.</p>
          <h3>Prix</h3>
          <p>Les prix sont indiques en USD ou en CDF.</p>
          <h3>Livraison</h3>
          <p>Les delais de livraison varient selon la destination.</p>
        `,
            },
        });
    }
    // Contact messages
    const contactCount = await prisma.contactMessage.count();
    if (contactCount === 0) {
        await prisma.contactMessage.createMany({
            data: [
                {
                    name: 'Jean Kalonda',
                    email: 'jean.kalonda@example.com',
                    subject: 'Demande de rendez-vous',
                    message: 'Bonjour, je souhaiterais prendre rendez-vous pour un costume sur mesure.',
                },
                {
                    name: 'Sarah Mugenzi',
                    email: 'sarah.mugenzi@example.com',
                    subject: 'Informations collection',
                    message: 'Pouvez-vous me donner plus de details sur la collection actuelle ?',
                },
            ],
        });
    }
    // Footer sections + links
    const footerCount = await prisma.footerSection.count();
    if (footerCount === 0) {
        const footerSeeds = [
            {
                title: 'Client Services',
                order: 1,
                links: [
                    { label: 'Suivi de commande', url: '/suivi', order: 1 },
                    { label: 'Livraison & retours', url: '/retours', order: 2 },
                    { label: 'FAQ', url: '/faq', order: 3 },
                    { label: 'Contact 7j/7', url: '/contact', order: 4 },
                ],
            },
            {
                title: 'Services en boutique',
                order: 2,
                links: [
                    { label: 'Prendre un rendez-vous', url: '/contact', order: 1 },
                    { label: 'Retouches & ajustements', url: '/contact', order: 2 },
                    { label: 'Personnalisation', url: '/contact', order: 3 },
                    { label: 'Emballages cadeaux', url: '/contact', order: 4 },
                ],
            },
            {
                title: 'La Maison CM CLASS',
                order: 3,
                links: [
                    { label: 'Notre histoire', url: '/notre-histoire', order: 1 },
                    { label: 'Engagement qualite', url: '/engagement', order: 2 },
                    { label: 'Durabilite', url: '/developpement-durable', order: 3 },
                    { label: 'Presse & collaborations', url: '/collaborations', order: 4 },
                    { label: 'Carriere', url: '/carriere', order: 5 },
                ],
            },
            {
                title: 'Aide & Support',
                order: 4,
                links: [
                    { label: "Guide des tailles", url: '/tailles', order: 1 },
                    { label: "Conseils d'entretien", url: '/entretien', order: 2 },
                    { label: 'Plan du site', url: '/plan-du-site', order: 3 },
                    { label: 'Mentions legales', url: '/mentions-legales', order: 4 },
                    { label: 'Accessibilite', url: '/accessibilite', order: 5 },
                    { label: 'Cookies', url: '/cookies', order: 6 },
                ],
            },
            {
                title: 'Magasins',
                order: 5,
                links: [
                    { label: 'Trouver une boutique', url: '/magasins', order: 1 },
                    { label: 'Prendre rendez-vous', url: '/contact', order: 2 },
                ],
            },
            {
                title: 'SUIVEZ-NOUS',
                order: 6,
                links: [
                    { label: 'Goma, Nord-Kivu', url: '#', order: 1 },
                    { label: 'Republique Democratique du Congo', url: '#', order: 2 },
                    { label: 'contact@maison.com', url: 'mailto:contact@maison.com', order: 3 },
                    { label: '+243 XXX XXX XXX', url: 'tel:+243', order: 4 },
                ],
            },
        ];
        for (const section of footerSeeds) {
            await prisma.footerSection.create({
                data: {
                    title: section.title,
                    order: section.order,
                    isActive: true,
                    links: { create: section.links },
                },
            });
        }
    }
    // Notifications seed
    const notifCount = await prisma.notification.count();
    if (notifCount === 0) {
        await prisma.notification.createMany({
            data: [
                { title: 'Nouvelle commande', message: 'Une commande vient d etre passee.', type: 'ORDER' },
                { title: 'Stock faible', message: 'Un produit approche du seuil de stock.', type: 'STOCK' },
                { title: 'Contenu a mettre a jour', message: 'Mise a jour de la campagne principale recommandee.', type: 'CONTENT' },
            ],
        });
    }
    // Optionally seed a few wishlist/cart items when products exist
    const products = await prisma.product.findMany({ take: 6, orderBy: { createdAt: 'desc' } });
    if (products.length > 0) {
        const users = await prisma.user.findMany({
            where: { email: { in: clientUsers.map((u) => u.email) } },
            orderBy: { createdAt: 'asc' },
        });
        const wishlistRows = [];
        const cartRows = [];
        for (let i = 0; i < users.length; i += 1) {
            const user = users[i];
            const product = products[i % products.length];
            const secondProduct = products[(i + 1) % products.length];
            if (product) {
                wishlistRows.push({ userId: user.id, productId: product.id });
            }
            if (secondProduct) {
                cartRows.push({
                    userId: user.id,
                    productId: secondProduct.id,
                    quantity: 1 + (i % 3),
                    size: 'M',
                    color: '#000000',
                });
            }
        }
        if (wishlistRows.length > 0) {
            await prisma.wishlistItem.createMany({ data: wishlistRows, skipDuplicates: true });
        }
        if (cartRows.length > 0) {
            await prisma.cartItem.createMany({ data: cartRows, skipDuplicates: true });
        }
    }
    console.log('Seed completed: users, brand, content, catalog, orders created');
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Seed client password: ${clientPassword}`);
        console.log(`Seed admin login: ${adminEmail} / ${adminPassword}`);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
