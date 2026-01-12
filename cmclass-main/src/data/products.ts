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

export interface Product_cat {
  id: number;
  label: string;
  name: string;
  price: string;
  sizes?: string[];
  longDescription?: string;

  productImage: string;      // main image
  mannequinImage: string;    // appears on hover
  colors: { hex: string; images: string[] }[]; // browsable views per color
}



/** FILTER DATA FOR RESPONSIVE FILTER COMPONENT */
export const filtersData = [
  { label: "Available Online", type: "toggle" },
  { label: "Iconic", options: ["Classic", "Modern"] },
  { label: "Collections", options: ["Spring", "Summer"] },
  { label: "Styles", options: ["Casual", "Formal", "Sport"] },
  { label: "Materials", options: ["Leather", "Canvas"] },
  { label: "Colors", options: ["Black", "Red", "White"] },
  { label: "Sort by", options: ["Price Low → High", "Price High → Low"] },
  { label: "Price Range", options: ["0-100", "100-200", "200+"] },
];


export const categoriesData = [
  { category: "Mon Monogram Personalization", image: "/images/monogram.jpg" },
  { category: "Crossbody Bags", image: "/images/crossbody.jpg" },
  { category: "Shoulder Bags", image: "/images/shoulder.jpg" },
  { category: "Totes", image: "/images/totes.jpg" },
  { category: "Mini Bags", image: "/images/mini.jpg" },
  { category: "Hobo Bags", image: "/images/hobo.jpg" },
  { category: "Bucket Bags", image: "/images/bucket.jpg" },
  { category: "Bumbags", image: "/images/bumbag.jpg" },
  { category: "Backpacks", image: "/images/backpack.jpg" },
  { category: "Top Handles", image: "/images/tophandle.jpg" },
  { category: "Trunk Bags", image: "/images/trunk.jpg" },
  { category: "Shoulder Straps", image: "/images/shoulderstrap.jpg" },
];

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




// ---------------------------------------------------
// PRODUCT LIST (8 items)
// ---------------------------------------------------

export const products_cat: Product_cat[] = [
  {
    id: 1,
    label: "Nouveau",
    name: "Chemise Asymétrique Minimaliste",
    price: "49.99$",
    longDescription:
      "Chemise en coton léger avec une coupe asymétrique moderne. Parfaite pour un look épuré et contemporain.",
    productImage:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=800",
    colors: [
      {
        hex: "#000000",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
          "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800",
        ],
      },
      {
        hex: "#c7c7c7",
        images: [
          "https://images.unsplash.com/photo-1564849444449-0c8f1c2b4aa8?q=80&w=800",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800",
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL","3XL"],
  },

  {
    id: 2,
    label: "Nouveau",
    name: "Chemise Oversize Texture Lin",
    price: "59.99$",
    productImage:
      "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
    colors: [
      {
        hex: "#4a4a4a",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
      {
        hex: "#d9d9d9",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL","3XL"],
  },

  // --- 6 MORE PRODUCTS BELOW (duplicate structure, different images) ---
  {
    id: 3,
    label: "Essentiel",
    name: "T-Shirt Coupe Droite",
    price: "29.99$",
    longDescription:"Pièce emblématique de Louis Vuitton, cette pochette Accessoires en toile Monogram est idéale pour transporter les indispensables du quotidien. Ce modèle chic propose différents styles et options de porté grâce à sa bandoulière en cuir naturel et sa chaîne dorée amovibles. Sa fermeture à glissière s'ouvre pour révéler un compartiment spacieux doté de poches plates et à fermeture à glissière, ainsi que deux fentes pour les cartes.",
    productImage:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800",
    colors: [
      {
        hex: "#ffffff",
        images: [
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800",
          "https://images.unsplash.com/photo-1526170375885-9c4e99a9eed4?q=80&w=800",
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL","3XL"],
  },

  {
    id: 4,
    label: "Nouveau",
    name: "Pull Maille Légère",
    price: "69.99$",
    productImage:
      "https://images.unsplash.com/photo-1520975918314-7529414344d8?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1520975918314-7529414344d8?q=80&w=800",
    colors: [
      {
        hex: "#8b634b",
        images: [
          "https://images.unsplash.com/photo-1520975918314-7529414344d8?q=80&w=800",
          "https://images.unsplash.com/photo-1520975918314-brown?q=80&w=800",
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL","3XL"],
  },

  {
    id: 5,
    label: "Best Seller",
    name: "Hoodie Oversize Premium",
    price: "89.99$",
    productImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800",
    colors: [
      {
        hex: "#222222",
        images: [
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800",
          "https://images.unsplash.com/photo-1512436991641-black?q=80&w=800",
        ],
      },
    ],
  },

  {
    id: 6,
    label: "Nouveau",
    name: "Robe Lin Minimaliste",
    price: "79.99$",
    productImage:
      "https://images.unsplash.com/photo-1520974735194-3b1db6f3386c?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1520974735194-3b1db6f3386c?q=80&w=800",
    colors: [
      {
        hex: "#d8c4a8",
        images: [
          "https://images.unsplash.com/photo-1520974735194-3b1db6f3386c?q=80&w=800",
          "https://images.unsplash.com/photo-1520974735194-beige?q=80&w=800",
        ],
      },
    ],
  },

  {
    id: 7,
    label: "Collection Été",
    name: "Short Casual Lin",
    price: "39.99$",
    productImage:
      "https://images.unsplash.com/photo-1521120098171-53230f0c13f8?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1521120098171-53230f0c13f8?q=80&w=800",
    colors: [
      {
        hex: "#e2e2e2",
        images: [
          "https://images.unsplash.com/photo-1521120098171-53230f0c13f8?q=80&w=800",
          "https://images.unsplash.com/photo-1521120098171-grey?q=80&w=800",
        ],
      },
    ],
  },

  {
    id: 8,
    label: "Essentiel",
    name: "Pantalon Coupe Droite",
    price: "69.99$",
    productImage:
      "https://images.unsplash.com/photo-1528715471579-d1bd0e5f5f18?q=80&w=800",
    mannequinImage:
      "https://images.unsplash.com/photo-1528715471579-d1bd0e5f5f18?q=80&w=800",
    colors: [
      {
        hex: "#444444",
        images: [
          "https://images.unsplash.com/photo-1528715471579-d1bd0e5f5f18?q=80&w=800",
          "https://images.unsplash.com/photo-1528715471579-black?q=80&w=800",
        ],
      },
    ],
  },
];

