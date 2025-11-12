import { mainCategories, heroContent } from "./MegaMenu";

interface CategoryHeroProps {
  categoryTitle: string;       // Main category
  subCategoryIndex?: number;   // Index of the subcategory to show (optional, default 0)
}

export const CategoryHero = ({
  categoryTitle,
  subCategoryIndex = 0,
}: CategoryHeroProps) => {
  const category = mainCategories.find((c) => c.title === categoryTitle);
  if (!category) return null;

  const hero = heroContent[category.title];

  const subCategory = category.subcategories?.[subCategoryIndex];
  if (!subCategory) return null; // If subcategory index invalid

  return (
    <><div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
      {/* Background image */}
      {hero?.img && (
        <img
          src={hero.img}
          alt={category.title}
          className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />

      {/* Hero content */}

    </div><div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 justify-center">
        {/* Category */}
        <p className="uppercase text-xs sm:text-base tracking-widest text-gray-300">
          {category.title}
        </p>

        {/* Selected Subcategory */}
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer">
            {subCategory.name}
          </h3>
        </div>

        {/* Optional hero text
    {hero?.text && (
      <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/90 max-w-xl">
        {hero.text}
      </p>
    )}*/}
      </div></>
  );
};
