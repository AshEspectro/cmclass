// API Product type definition
export interface Product_cat {
    id: number;
    label: string;
    name: string;
    price: string;
    sizes?: string[];
    longDescription?: string;
    productImage: string;
    mannequinImage: string;
    colors: { hex: string; images: string[]; name?: string }[];
}

// You can add other API-related types here as needed
export interface ApiProduct {
    id: number;
    label?: string | null;
    name: string;
    price?: string | number;
    sizes?: string[];
    longDescription?: string | null;
    productImage?: string | null;
    mannequinImage?: string | null;
    colors?: Array<{ name?: string; hex: string; images?: string[] } | string>;
    images?: string[];
    inStock?: boolean;
    categoryId?: number;
    category?: string | null;
    description?: string | null;
    careInstructions?: string | null;
    environmentalInfo?: string | null;
}
