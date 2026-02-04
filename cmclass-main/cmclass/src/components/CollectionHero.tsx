

interface CategoryHeroProps {
  categoryTitle: string;
  subCategoryIndex?: number;
  campaignImage?: string;
  campaignTitle?: string;
}

export const CategoryHero = ({ categoryTitle, campaignImage, campaignTitle }: CategoryHeroProps) => {
  // Use campaign data exclusively
  if (!campaignImage || !campaignTitle) {
    console.warn('🚨 CategoryHero: Missing campaign data', { campaignImage, campaignTitle });
    return null;
  }

  console.log('🎨 CategoryHero: Rendering campaign', { campaignTitle, campaignImage });
  
  return (
    <>
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
        <img src={campaignImage} alt={campaignTitle} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-12 h-full flex flex-col items-center justify-center text-center">
        <p className="uppercase text-[0.625rem] sm:text-xs md:text-xs lg:text-xs tracking-widest">{categoryTitle}</p>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer">
            {campaignTitle}
          </h3>
        </div>
      </div>
    </>
  );
};
