export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Chemise Lin Blanc Artisanale',
    price: 85000,
    category: 'HOMME',
    subcategory: 'Chemises',
    image: '',
    images: ['', '', ''],
    description: 'Chemise en lin blanc pur, tissée et confectionnée à la main par nos artisans à Goma. Coupe moderne et intemporelle, parfaite pour les occasions formelles et décontractées.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Écru'],
    inStock: true
  },
  {
    id: '2',
    name: 'Pantalon Coton Noir Tailleur',
    price: 95000,
    category: 'HOMME',
    subcategory: 'Pantalons',
    image: '',
    images: ['', '', ''],
    description: 'Pantalon tailleur en coton premium, coupe droite contemporaine. Finitions artisanales et détails raffinés pour un style élégant au quotidien.',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Noir', 'Marine'],
    inStock: true
  },
  {
    id: '3',
    name: 'Veste Structurée Coton',
    price: 145000,
    category: 'HOMME',
    subcategory: 'Vestes',
    image: '',
    images: ['', '', ''],
    description: 'Veste légère en coton structuré, inspirée de l\'architecture de Goma. Design minimaliste avec une attention particulière aux proportions et à la construction.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Beige'],
    inStock: true
  },
  {
    id: '4',
    name: 'T-Shirt Col Rond Coton Bio',
    price: 45000,
    category: 'HOMME',
    subcategory: 'T-Shirts',
    image: '',
    images: ['', '', ''],
    description: 'T-shirt essentiel en coton biologique, coupe contemporaine. Fabriqué localement avec des matériaux durables et responsables.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Blanc', 'Noir', 'Gris'],
    inStock: true
  },
  {
    id: '5',
    name: 'Pantalon Lin Beige Décontracté',
    price: 78000,
    category: 'HOMME',
    subcategory: 'Pantalons',
    image: '',
    images: ['', '', ''],
    description: 'Pantalon décontracté en lin naturel, coupe fluide et confortable. Idéal pour le climat tropical de Goma tout en conservant une allure sophistiquée.',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Beige', 'Sable', 'Blanc'],
    inStock: true
  },
  {
    id: '6',
    name: 'Chemise Coton Structurée Noire',
    price: 92000,
    category: 'HOMME',
    subcategory: 'Chemises',
    image: '',
    images: ['', '', ''],
    description: 'Chemise en coton texturé noir, détails architecturaux subtils. Une pièce signature qui incarne l\'esprit moderne de CM CLASS.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir'],
    inStock: true
  },
  {
    id: '7',
    name: 'Blouson Léger Technique',
    price: 165000,
    category: 'HOMME',
    subcategory: 'Vestes',
    image: '',
    images: ['', '', ''],
    description: 'Blouson technique léger avec finitions artisanales. Alliance parfaite entre fonctionnalité moderne et savoir-faire traditionnel congolais.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Marine'],
    inStock: false
  },
  {
    id: '8',
    name: 'Pull Col Montant Mérinos',
    price: 125000,
    category: 'HOMME',
    subcategory: 'Pulls',
    image: '',
    images: ['', '', ''],
    description: 'Pull en laine mérinos, col montant minimaliste. Tricot artisanal et design épuré pour une élégance discrète.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Gris', 'Écru'],
    inStock: true
  }
];

export const collections = [
  {
    id: 'homme',
    name: 'HOMME',
    description: 'Collection masculine moderne et artisanale',
    image: '',
    featured: true
  },
  {
    id: 'femme',
    name: 'FEMME',
    description: 'Prochainement',
    image: '',
    featured: false
  },
  {
    id: 'accessoires',
    name: 'ACCESSOIRES',
    description: 'Sacs, ceintures et accessoires artisanaux',
    image: '',
    featured: false
  },
  {
    id: 'nouveautes',
    name: 'NOUVEAUTÉS',
    description: 'Dernières créations de la saison',
    image: '',
    featured: false
  }
];

export const stories = [
  {
    id: '1',
    title: 'L\'ARTISANAT AU CŒUR DE GOMA',
    excerpt: 'Découvrez comment nos artisans transforment des matériaux nobles en pièces d\'exception, en perpétuant des techniques ancestrales.',
    image: '',
    date: '2025-10-28',
    category: 'ATELIER'
  },
  {
    id: '2',
    title: 'MINIMALISME ET IDENTITÉ CONGOLAISE',
    excerpt: 'Une exploration de l\'esthétique minimaliste appliquée au design congolais contemporain.',
    image: '',
    date: '2025-10-15',
    category: 'DESIGN'
  },
  {
    id: '3',
    title: 'LA NOUVELLE GÉNÉRATION DE CRÉATEURS',
    excerpt: 'Portrait des jeunes talents qui façonnent l\'avenir de la mode à Goma et au-delà.',
    image: '',
    date: '2025-09-30',
    category: 'CULTURE'
  }
];
