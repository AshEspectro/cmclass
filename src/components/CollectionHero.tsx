import { mainCategories, heroContent } from "./MegaMenu";

interface CategoryHeroProps {
  categoryTitle: string;
  subCategoryIndex?: number;
}

// Helper function to get hero data
 const getCategoryHeroData = (categoryTitle: string, subCategoryIndex = 0) => {
  const category = mainCategories.find(c => c.title === categoryTitle);
  if (!category) return null;

  const hero = heroContent[category.title];
  const subCategory = category.subcategories?.[subCategoryIndex];
  if (!subCategory) return null;

  return {
    heroImg: hero?.img || "",
    categoryTitle: category.title,
    subCategoryName: subCategory.name,
  };
};

// Component
export const CategoryHero = ({
  categoryTitle,
  subCategoryIndex = 0,
}: CategoryHeroProps) => {
  const data = getCategoryHeroData(categoryTitle, subCategoryIndex);
  if (!data) return null;

  return (
    <>
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
        {data.heroImg && (
          <img
            src={data.heroImg}
            alt={data.categoryTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative  pt-12  pb-6 px-4 sm:px-6 lg:px-12 h-full flex flex-col items-center justify-center text-center">
        <p className="uppercase text-[0.625rem] sm:text-xs md:text-xs lg:text-xs sm:text-base tracking-widest">
          {data.categoryTitle}
        </p>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer">
            {data.subCategoryName}
          </h3>
        </div>
      </div>
    </>
  );
};
