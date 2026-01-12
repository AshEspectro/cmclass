import { useEffect, useState } from 'react';
import { FALLBACK_MAIN_CATEGORIES, FALLBACK_HERO_CONTENT } from './MegaMenu';

interface CategoryHeroProps {
  categoryTitle: string;
  subCategoryIndex?: number;
}

export const CategoryHero = ({ categoryTitle, subCategoryIndex = 0 }: CategoryHeroProps) => {
  const [mainCategories, setMainCategories] = useState<any[]>(FALLBACK_MAIN_CATEGORIES as any);
  const [heroContent, setHeroContent] = useState<Record<string, any>>(FALLBACK_HERO_CONTENT as any);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '';
    const url = `${base}/categories`;
    const ac = new AbortController();

    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch categories');
        return r.json();
      })
      .then((body) => {
        if (body?.mainCategories) setMainCategories(body.mainCategories);
        if (body?.heroContent) setHeroContent(body.heroContent);
      })
      .catch(() => {
        /* keep fallbacks */
      });

    return () => ac.abort();
  }, []);

  const category = mainCategories.find((c) => c.title === categoryTitle);
  if (!category) return null;
  const hero = heroContent[category.title] || {};
  const subCategory = category.subcategories?.[subCategoryIndex];
  if (!subCategory) return null;

  const data = {
    heroImg: hero?.img || '',
    categoryTitle: category.title,
    subCategoryName: subCategory.name,
  };

  return (
    <>
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
        {data.heroImg && (
          <img src={data.heroImg} alt={data.categoryTitle} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative  pt-12  pb-6 px-4 sm:px-6 lg:px-12 h-full flex flex-col items-center justify-center text-center">
        <p className="uppercase text-[0.625rem] sm:text-xs md:text-xs lg:text-xs sm:text-base tracking-widest">{data.categoryTitle}</p>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer">
            {data.subCategoryName}
          </h3>
        </div>
      </div>
    </>
  );
};
