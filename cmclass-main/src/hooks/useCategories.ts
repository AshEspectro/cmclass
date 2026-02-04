import { useState, useEffect } from 'react';

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  hasChildren: boolean;
  parentSlug?: string;
}

interface FetchedCategory {
  title: string;
  slug: string;
  link: string;
  imageUrl: string | null;
  description: string | null;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
    link: string;
    imageUrl: string | null;
    description: string | null;
    children: Array<{
      id: number;
      name: string;
      slug: string;
      link: string;
      imageUrl: string | null;
      description: string | null;
    }>;
  }>;
}

export const useCategories = () => {
  const [subcategories, setSubcategories] = useState<CategoryNode[]>([]);
  const [leafCategories, setLeafCategories] = useState<CategoryNode[]>([]);
  const [heroContent, setHeroContent] = useState<
    Record<string, { img: string | null; title: string; text: string | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/categories`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data = await response.json();
        const { mainCategories, heroContent: heroData } = data;

        // Separate subcategories and leaf categories
        const subs: CategoryNode[] = [];
        const leaves: CategoryNode[] = [];

        mainCategories.forEach((parent: FetchedCategory) => {
          // Add subcategories (categories that have a parent)
          parent.subcategories.forEach((sub) => {
            const subNode: CategoryNode = {
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              imageUrl: sub.imageUrl || heroData[sub.slug]?.img || null,
              description: sub.description || heroData[sub.slug]?.text || null,
              hasChildren: sub.children.length > 0,
              parentSlug: parent.slug,
            };
            
            subs.push(subNode);

            // If subcategory doesn't have children, it's a leaf category
            if (sub.children.length === 0) {
              leaves.push(subNode);
            } else {
              // Add grandchildren to leaves
              sub.children.forEach((child) => {
                leaves.push({
                  id: child.id,
                  name: child.name,
                  slug: child.slug,
                  imageUrl: child.imageUrl || heroData[child.slug]?.img || null,
                  description: child.description || heroData[child.slug]?.text || null,
                  hasChildren: false,
                  parentSlug: sub.slug,
                });
              });
            }
          });
        });

        // Also add top-level categories without children to leaves
        mainCategories.forEach((parent: FetchedCategory) => {
          if (parent.subcategories.length === 0) {
            leaves.push({
              id: parent.slug as any,
              name: parent.title,
              slug: parent.slug,
              imageUrl: parent.imageUrl || heroData[parent.slug]?.img || null,
              description: parent.description || heroData[parent.slug]?.text || null,
              hasChildren: false,
            });
          }
        });

        setSubcategories(subs);
        setLeafCategories(leaves);
        setHeroContent(heroData);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    subcategories,
    leafCategories,
    heroContent,
    loading,
    error,
  };
};
